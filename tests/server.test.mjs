import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createServer} from '../server.mjs';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
class Client {
 static async open(port){const c=new Client();c.queue=[];c.waiters=[];c.buffer=Buffer.alloc(0);c.ready=false;c.q=0;await new Promise((resolve,reject)=>{c.socket=net.createConnection(port,'127.0.0.1',()=>{c.socket.write(`GET /play HTTP/1.1\r\nHost: localhost:${port}\r\nOrigin: http://localhost:${port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: ${crypto.randomBytes(16).toString('base64')}\r\n\r\n`);});c.socket.on('error',reject);c.socket.on('data',b=>{c.buffer=Buffer.concat([c.buffer,b]);if(!c.ready){const index=c.buffer.indexOf('\r\n\r\n');if(index<0)return;assert.match(c.buffer.subarray(0,index).toString(),/101 Switching/);c.buffer=c.buffer.subarray(index+4);c.ready=true;resolve();}c.read();});});return c;}
 read(){while(this.buffer.length>=2){let n=this.buffer[1]&127,off=2;if(n===126){if(this.buffer.length<4)return;n=this.buffer.readUInt16BE(2);off=4;}if(this.buffer.length<off+n)return;const op=this.buffer[0]&15,data=this.buffer.subarray(off,off+n);this.buffer=this.buffer.subarray(off+n);if(op===9){this.sendRaw(data,10);continue;}if(op!==1)continue;const m=JSON.parse(data);if(this.onMessage)this.onMessage(m);const index=this.waiters.findIndex(w=>w.fn(m));if(index>=0){const w=this.waiters.splice(index,1)[0];clearTimeout(w.timer);w.resolve(m);}else {this.queue.push(m);if(this.queue.length>200)this.queue.shift();}}}
 sendRaw(data,opcode=1){const mask=crypto.randomBytes(4),head=Buffer.alloc(data.length<126?2:4);head[0]=128|opcode;head[1]=128|(data.length<126?data.length:126);if(data.length>=126)head.writeUInt16BE(data.length,2);const encoded=Buffer.from(data);for(let i=0;i<data.length;i++)encoded[i]^=mask[i%4];this.socket.write(Buffer.concat([head,mask,encoded]));}
 send(m){this.sendRaw(Buffer.from(JSON.stringify(m)));}
 wait(fn,timeout=5000){const i=this.queue.findIndex(fn);if(i>=0)return Promise.resolve(this.queue.splice(i,1)[0]);return new Promise((resolve,reject)=>{const w={fn,resolve,reject};w.timer=setTimeout(()=>{this.waiters=this.waiters.filter(x=>x!==w);reject(Error('Mensagem esperada não recebida'));},timeout);this.waiters.push(w);});}
 async request(t,data={}){const q=++this.q;this.send({t,q,...data});const m=await this.wait(x=>x.t==='reply'&&x.q===q);if(m.error)throw Error(m.error);return m.result;}
 async hello(room='TESTE',token){this.send({t:'hello',name:'Teste',character:1,room,token});return this.wait(m=>m.t==='welcome'||m.t==='rejected');}
 close(){this.socket.destroy();}
}
test('Servidor real: 12 jogadores, isolamento, autoridade, captura e persistência', {timeout:60000},async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'mare-viva-test-')),game=await createServer({port:0,host:'127.0.0.1',saveDir:dir}),all=[];t.after(async()=>{all.forEach(c=>c.close());await game.close();await fs.rm(dir,{recursive:true,force:true});});
 const health=await fetch(`http://127.0.0.1:${game.port}/health`).then(r=>r.json());assert.equal(health.capacity,12);
 const client=await Client.open(game.port);all.push(client);const welcome=await client.hello();assert.equal(welcome.p.coins,50);
 for(let i=1;i<12;i++){const c=await Client.open(game.port);all.push(c);assert.equal((await c.hello()).t,'welcome');}
 const overflow=await Client.open(game.port);all.push(overflow);assert.match((await overflow.hello()).error,/12/);
 const other=await Client.open(game.port);all.push(other);assert.equal((await other.hello('OUTRA')).t,'welcome');assert.equal(game.rooms.get('TESTE').size,12);assert.equal(game.rooms.get('OUTRA').size,1);
 const duplicate=await Client.open(game.port);all.push(duplicate);assert.match((await duplicate.hello('OUTRA',welcome.token)).error,/outra janela/);
 await assert.rejects(client.request('buy',{id:'rod-5'}),/Aproxime/);await assert.rejects(client.request('unlock',{island:4}),/Requer/);await assert.rejects(client.request('travel',{island:1}),/Navegue/);await assert.rejects(client.request('hook'),/escapou/);
 client.send({t:'pos',d:[500,400,0,'walk']});await delay(130);const me=(await client.wait(m=>m.t==='state')).d.find(p=>p[0]===welcome.id);assert.equal(me[2],1168);
 const start=await client.request('start',{x:1184,y:660});const fishingSnapshot=await client.wait(m=>m.t==='state'&&m.d.some(p=>p[0]===welcome.id&&p[7]===1184));assert.equal(fishingSnapshot.d.find(p=>p[0]===welcome.id)[8],660);await delay(Math.max(0,start.biteAt-Date.now()+30));const hook=await client.request('hook');assert.ok(hook.fishId);
 client.onMessage=m=>{if(m.t==='mini')client.send({t:'input',held:m.s.bar>m.s.fish});};
 const caught=await client.wait(m=>m.t==='caught'||m.t==='escaped',40000);assert.equal(caught.t,'caught');const profile=await client.wait(m=>m.t==='profile'&&m.p.totalCatches===1);assert.equal(profile.p.inventory.length,1);assert.equal(profile.p.collection[caught.catch.fishId].count,1);
 client.close();await delay(150);const restored=await Client.open(game.port);all.push(restored);const resumed=await restored.hello('TESTE',welcome.token);assert.equal(resumed.p.totalCatches,1);assert.equal(resumed.p.inventory[0].uid,caught.catch.uid);
 // Walk along the actual boardwalk and village path before trading.
 const move=async(c,x1,y1,x2,y2,boat=false)=>{let x=x1,y=y1;while(Math.hypot(x2-x,y2-y)>1){const distance=Math.hypot(x2-x,y2-y),step=Math.min(22,distance);x+=(x2-x)/distance*step;y+=(y2-y)/distance*step;await delay(110);c.send({t:'pos',d:[Math.round(x),Math.round(y),0,boat?'sail':'walk']});}await delay(120);};
 await move(restored,1168,576,860,576);await move(restored,860,576,860,493);
 await restored.request('buy',{id:'bait-1'});const baitProfile=await restored.wait(m=>m.t==='profile'&&m.p.baits[1]===10);assert.equal(baitProfile.p.coins,32);
 const sold=await restored.request('sell',{uid:'all'});assert.equal(sold.value,caught.catch.value);const soldProfile=await restored.wait(m=>m.t==='profile'&&m.p.inventory.length===0);assert.equal(soldProfile.p.collection[caught.catch.fishId].count,1);
 // Establish an eligible progression fixture; the same route checks run on live packets.
 const live=game.profiles.get(welcome.token);live.totalCatches=6;live.rod=1;live.rods=[0,1];live.coins=1000;
 await restored.request('unlock',{island:1});assert.ok(live.unlocked.includes(1));assert.equal(live.coins,780);
 await move(restored,860,493,860,576);await move(restored,860,576,1230,576);
 const board=await restored.request('board');assert.equal(board.x,1270);await move(restored,1270,657,1440,657,true);const travel=await restored.request('travel',{island:1});assert.equal(travel.island,1);assert.equal(live.island,1);const exit=await restored.request('exit');assert.equal(exit.x,1248);
 const inaccessible=await fetch(`http://127.0.0.1:${game.port}/data/profiles.json`);assert.equal(inaccessible.status,404);
 await delay(4100);const stored=JSON.parse(await fs.readFile(path.join(dir,'profiles.json'),'utf8'));assert.equal(stored[welcome.token].totalCatches,6);assert.equal(stored[welcome.token].island,1);assert.equal(stored[welcome.token].inventory.length,0);
});
test('Encerramento salva imediatamente e fecha WebSockets sem sessão', {timeout:5000},async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'mare-viva-shutdown-')),game=await createServer({port:0,host:'127.0.0.1',saveDir:dir}),all=[];
 t.after(async()=>{all.forEach(c=>c.close());if(game.server.listening)await game.close();await fs.rm(dir,{recursive:true,force:true});});
 const idle=await Client.open(game.port),active=await Client.open(game.port);all.push(idle,active);const welcome=await active.hello('SHUTDOWN');
 game.profiles.get(welcome.token).coins=123;
 let timeout;try{await Promise.race([game.close(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('Encerramento demorou mais de 2 segundos')),2000);})]);}finally{clearTimeout(timeout);}
 assert.equal(game.server.listening,false);assert.equal(game.clients.size,0);
 const stored=JSON.parse(await fs.readFile(path.join(dir,'profiles.json'),'utf8'));assert.equal(stored[welcome.token].coins,123);
});
