import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {FISH_BY_ID,RODS,ISLANDS} from './shared/catalog.js';
import {MAX_PLAYERS,INVENTORY_CAPACITY,newProfile,selectFish,makeCatch,awardCatch,sell,buy,equip,unlock,discoverSecret,worldHour} from './shared/rules.js';
import {newMini,stepMini} from './shared/minigame.js';
import {SPAWN,DOCK,BOAT,WIDTH,HEIGHT,walkable,zoneAt,nearShop,secretNear,createProps,obstructed} from './shared/world.js';
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const DATA=process.env.SAVE_DIR||path.join(ROOT,'data');
export function encodeFrame(payload,opcode=1){const data=Buffer.isBuffer(payload)?payload:Buffer.from(payload);let head;if(data.length<126){head=Buffer.from([128|opcode,data.length]);}else{head=Buffer.alloc(4);head[0]=128|opcode;head[1]=126;head.writeUInt16BE(data.length,2);}return Buffer.concat([head,data]);}
// RFC 6455: masked browser frames, fragmentation, ping/pong, bounded payloads.
export class WebSocketPeer {
 constructor(socket,onMessage,onClose){this.socket=socket;this.buffer=Buffer.alloc(0);this.fragments=[];this.fragmentSize=0;this.closed=false;this.alive=true;this.onMessage=onMessage;this.onClose=onClose;socket.on('data',b=>this.feed(b));socket.on('end',()=>{socket.end();this.finish();});socket.on('close',()=>this.finish());socket.on('error',()=>this.finish());}
 send(value){if(!this.closed&&this.socket.writableLength<65536)this.socket.write(encodeFrame(JSON.stringify(value)));}
 close(){if(!this.closed){this.socket.end(encodeFrame(Buffer.from([3,232]),8),()=>this.socket.destroy());this.finish();}}
 finish(){if(this.closed)return;this.closed=true;this.onClose();}
 feed(b){this.buffer=Buffer.concat([this.buffer,b]);if(this.buffer.length>32768)return this.close();
  while(this.buffer.length>=2){const a=this.buffer[0],c=this.buffer[1],op=a&15,fin=!!(a&128);let n=c&127,offset=2;
   if(a&112||!(c&128))return this.close();if(n===127)return this.close();if(n===126){if(this.buffer.length<4)return;n=this.buffer.readUInt16BE(2);offset=4;}
   if(n>16384||(op>=8&&(!fin||n>125)))return this.close();if(this.buffer.length<offset+4+n)return;
   const mask=this.buffer.subarray(offset,offset+4),data=Buffer.from(this.buffer.subarray(offset+4,offset+4+n));this.buffer=this.buffer.subarray(offset+4+n);
   for(let i=0;i<n;i++)data[i]^=mask[i%4];
   if(op===8){this.close();return;}if(op===9){this.socket.write(encodeFrame(data,10));continue;}if(op===10){this.alive=true;continue;}
   if(op===1){if(this.fragmentSize)return this.close();this.fragments=[data];this.fragmentSize=n;}else if(op===0&&this.fragmentSize){this.fragments.push(data);this.fragmentSize+=n;}else return this.close();
   if(this.fragmentSize>16384)return this.close();if(!fin)continue;
   const whole=Buffer.concat(this.fragments);this.fragments=[];this.fragmentSize=0;
   try{const message=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(whole));if(!message||typeof message!=='object'||Array.isArray(message))return this.close();this.onMessage(message);}catch{return this.close();}
  }
 }
}
export async function createServer({port=Number(process.env.PORT)||3210,host=process.env.HOST||'0.0.0.0',saveDir=DATA}={}){
 await fs.mkdir(saveDir,{recursive:true});let saved={};try{saved=JSON.parse(await fs.readFile(path.join(saveDir,'profiles.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw Error('Não foi possível ler profiles.json. Corrija ou restaure o arquivo antes de iniciar; ele foi preservado.');}
 const profiles=new Map(Object.entries(saved)),rooms=new Map(),clients=new Set(),peers=new Set(),activeTokens=new Set(),props=ISLANDS.map(i=>createProps(i.id));let dirty=false,saveChain=Promise.resolve();
 const persist=()=>{if(!dirty)return saveChain;dirty=false;const snapshot=JSON.stringify(Object.fromEntries(profiles));saveChain=saveChain.then(async()=>{const file=path.join(saveDir,'profiles.json');await fs.writeFile(file+'.tmp',snapshot);await fs.rename(file+'.tmp',file);}).catch(e=>{dirty=true;console.error('Erro de salvamento:',e.message);});return saveChain;};
 const broadcast=(room,value)=>{for(const c of rooms.get(room)||[])c.peer.send(value);};
 const sync=c=>{dirty=true;c.peer.send({t:'profile',p:c.p});};
 const reply=(c,m,result,error)=>c.peer.send({t:'reply',q:m.q,result,error});
 const httpServer=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
  if(req.url==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,players:clients.size,capacity:MAX_PLAYERS,rooms:rooms.size}));}
  try{const url=new URL(req.url,'http://localhost'),decoded=decodeURIComponent(url.pathname);const shared=decoded.startsWith('/shared/');const base=path.join(ROOT,shared?'shared':'public');const local=shared?decoded.slice(8):decoded==='/'?'index.html':decoded.slice(1);const target=path.resolve(base,local);if(!target.startsWith(base+path.sep)||local.includes('\0'))throw Error();const data=await fs.readFile(target);const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'}[path.extname(target)]||'application/octet-stream';res.writeHead(200,{'Content-Type':mime,'Cache-Control':decoded==='/'?'no-cache':'public, max-age=300','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' ws: wss:; media-src 'self' blob:; object-src 'none'; base-uri 'none'"});res.end(req.method==='HEAD'?undefined:data);}catch{res.writeHead(404);res.end('Não encontrado.');}
 });
 httpServer.on('upgrade',(req,socket,head)=>{
  let origin;try{origin=new URL(req.headers.origin);}catch{socket.destroy();return;}
  const allowed=(process.env.ALLOWED_ORIGINS||'').split(',').filter(Boolean);
  if(req.url!=='/play'||req.headers['sec-websocket-version']!=='13'||req.headers.upgrade?.toLowerCase()!=='websocket'||!req.headers['sec-websocket-key']||Buffer.from(req.headers['sec-websocket-key'],'base64').length!==16||(origin.host!==req.headers.host&&!allowed.includes(origin.origin))){socket.destroy();return;}
  const accept=crypto.createHash('sha1').update(req.headers['sec-websocket-key']+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
  const c={id:crypto.randomUUID().slice(0,8),room:null,p:null,x:SPAWN.x,y:SPAWN.y,dir:0,boat:false,anim:'idle',lastMove:Date.now(),lastEmote:0,lastInput:0,tokens:55,budgetAt:Date.now(),encounter:null};
  const disconnect=()=>{peers.delete(c.peer);clients.delete(c);if(c.token)activeTokens.delete(c.token);if(c.room){const r=rooms.get(c.room);r?.delete(c);broadcast(c.room,{t:'leave',id:c.id});if(!r?.size)rooms.delete(c.room);}if(c.p)dirty=true;};
  c.peer=new WebSocketPeer(socket,m=>{
   const now=Date.now();c.tokens=Math.min(55,c.tokens+(now-c.budgetAt)*.035);c.budgetAt=now;if(--c.tokens<0)return c.peer.close();
   try{
    if(m.t==='hello'){
     if(c.p)throw Error('Sessão já iniciada.');const room=String(m.room||'ENSEADA').toUpperCase();if(!/^[A-Z0-9-]{3,16}$/.test(room))throw Error('Sala: use 3 a 16 letras, números ou hífens.');const group=rooms.get(room)||new Set();if(group.size>=MAX_PLAYERS)throw Error('Sala cheia: limite de 12 jogadores.');
     const token=typeof m.token==='string'&&profiles.has(m.token)?m.token:crypto.randomUUID();if(activeTokens.has(token))throw Error('Este save já está aberto em outra janela.');
     const p=profiles.get(token)||newProfile(m.name,m.character);c.token=token;c.p=p;c.room=room;profiles.set(token,p);activeTokens.add(token);rooms.set(room,group);group.add(c);p.island=p.unlocked.includes(p.island)?p.island:0;clients.add(c);dirty=true;
     c.peer.send({t:'welcome',id:c.id,token,p,room,now});broadcast(room,{t:'join',player:{id:c.id,name:p.name,character:p.character,outfit:p.outfit}});c.peer.send({t:'roster',players:[...group].map(x=>({id:x.id,name:x.p.name,character:x.p.character,outfit:x.p.outfit}))});return;
    }
    if(!c.p)throw Error('Entre em uma sala primeiro.');
    if(m.t==='pos'){
     const [x,y,dir,anim]=m.d||[];if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isInteger(dir)||dir<0||dir>3)return;
     const dt=Math.min(1,(now-c.lastMove)/1000),limit=(c.boat?230:155)*dt+20;c.lastMove=now;
     if(Math.hypot(x-c.x,y-c.y)>limit||x<16||x>WIDTH-16||y<16||y>HEIGHT-16)return;
     if(c.boat?!walkable(c.p.island,x,y,true):obstructed(c.p.island,x,y,props[c.p.island]))return;
     if(c.encounter&&Math.hypot(x-c.encounter.px,y-c.encounter.py)>16)c.encounter=null;
     c.x=Math.round(x);c.y=Math.round(y);c.dir=dir;c.anim=['idle','walk','cast','wait','bite','reel','sail'].includes(anim)?anim:'idle';return;
    }
    if(m.t==='input'){if(c.encounter?.mini){c.encounter.held=!!m.held;c.lastInput=now;}return;}
    if(m.t==='emote'){if(now-c.lastEmote<1000)return;c.lastEmote=now;broadcast(c.room,{t:'emote',id:c.id,e:Math.max(0,Math.min(3,Math.floor(m.e)||0))});return;}
    let result;
    if(m.t==='start'){
     if(c.encounter)throw Error('Uma pesca já está em andamento.');if(c.boat)throw Error('Desembarque no píer para pescar.');if(c.p.inventory.length>=INVENTORY_CAPACITY)throw Error('Mochila cheia. Venda peixes.');
     const zone=zoneAt(c.p.island,m.x,m.y);if(zone<0||Math.hypot(m.x-c.x,m.y-c.y)>RODS[c.p.rod].reach+15)throw Error('Arremesse em água ao alcance da vara.');
     const fish=selectFish(c.p,c.p.island,zone,worldHour(now));const wait=(2200+Math.random()*2200)/RODS[c.p.rod].speed;
     if(c.p.bait){c.p.baits[c.p.bait]--;if(c.p.baits[c.p.bait]<=0)c.p.bait=0;sync(c);}
     c.encounter={fish,seed:crypto.randomInt(1000000),wait,biteAt:now+750+wait,px:c.x,py:c.y,tx:Math.round(m.x),ty:Math.round(m.y),held:false};result={wait,biteAt:c.encounter.biteAt};
    }else if(m.t==='hook'){
     const e=c.encounter;if(!e||e.mini||now<e.biteAt-100||now>e.biteAt+1600){c.encounter=null;throw Error('O peixe escapou. Puxe quando a boia afundar.');}
     e.mini=newMini(e.fish.difficulty,RODS[c.p.rod],e.seed);c.lastInput=now;result={fishId:e.fish.id,seed:e.seed};
    }else if(m.t==='cancel'){c.encounter=null;result=true;}
    else if(m.t==='buy'||m.t==='sell'){if(!nearShop(c.x,c.y)||c.boat||c.encounter)throw Error('Aproxime-se de Nara, na loja.');result=m.t==='buy'?buy(c.p,m.id):{value:sell(c.p,m.uid)};sync(c);broadcast(c.room,{t:'look',id:c.id,outfit:c.p.outfit});}
    else if(m.t==='equip'){if(c.encounter)throw Error('Termine a pesca antes de trocar equipamento.');equip(c.p,m.type,m.value);sync(c);result=true;broadcast(c.room,{t:'look',id:c.id,outfit:c.p.outfit});}
    else if(m.t==='unlock'){result=unlock(c.p,m.island);sync(c);}
    else if(m.t==='board'){if(c.encounter||Math.hypot(c.x-BOAT.x,c.y-BOAT.y)>130)throw Error('Aproxime-se do barco no píer.');c.boat=true;c.x=BOAT.x;c.y=BOAT.y;result={x:c.x,y:c.y};}
    else if(m.t==='exit'){if(!c.boat||Math.hypot(c.x-BOAT.x,c.y-BOAT.y)>180)throw Error('Retorne ao píer para desembarcar.');c.boat=false;c.x=DOCK.x;c.y=DOCK.y;result={x:c.x,y:c.y};}
    else if(m.t==='travel'){if(!c.boat||c.x<1430||!c.p.unlocked.includes(m.island)||!ISLANDS[m.island])throw Error('Navegue até a saída da região para viajar.');c.p.island=m.island;c.x=BOAT.x;c.y=BOAT.y;c.encounter=null;sync(c);result={x:c.x,y:c.y,island:m.island};}
    else if(m.t==='secret'){if(c.boat||!secretNear(c.p.island,c.x,c.y))throw Error('Chegue mais perto do segredo.');result={value:discoverSecret(c.p,c.p.island)};sync(c);}
    else throw Error('Ação desconhecida.');
    reply(c,m,result);
   }catch(e){if(m.t==='hello'){c.peer.send({t:'rejected',error:e.message});c.peer.close();}else reply(c,m,null,e.message);}
  },disconnect);
  peers.add(c.peer);if(head.length)c.peer.feed(head);const deadline=setTimeout(()=>{if(!c.p)c.peer.close();},10000);socket.on('close',()=>clearTimeout(deadline));
 });
 let lastTick=Date.now();const simulation=setInterval(()=>{const now=Date.now(),dt=(now-lastTick)/1000;lastTick=now;
  for(const c of clients){const e=c.encounter;if(!e)continue;if(!e.mini){if(now>e.biteAt+1700){c.encounter=null;c.peer.send({t:'escaped'});}continue;}
   stepMini(e.mini,now-c.lastInput<1500&&e.held,dt);c.peer.send({t:'mini',s:{time:e.mini.time,bar:e.mini.bar,velocity:e.mini.velocity,progress:e.mini.progress,fish:e.mini.fish}});
   if(e.mini.finished){c.encounter=null;if(e.mini.progress>=1){const fish=makeCatch(e.fish);awardCatch(c.p,fish);sync(c);c.peer.send({t:'caught',catch:fish});if(e.fish.rarity>=2)broadcast(c.room,{t:'news',name:c.p.name,fishId:e.fish.id,weight:fish.weight});}else c.peer.send({t:'escaped'});}
  }
 },50);
 const snapshots=setInterval(()=>{for(const [room,group] of rooms)broadcast(room,{t:'state',now:Date.now(),d:[...group].map(c=>[c.id,c.p.island,c.x,c.y,c.dir,c.boat?1:0,c.anim,c.encounter?.tx??null,c.encounter?.ty??null])});},100);
 const saver=setInterval(persist,4000),heartbeat=setInterval(()=>{for(const c of clients){if(!c.peer.alive){c.peer.close();continue;}c.peer.alive=false;c.peer.socket.write(encodeFrame(Buffer.from('maré'),9));}},20000);
 await new Promise((resolve,reject)=>{httpServer.once('error',reject);httpServer.listen(port,host,()=>{httpServer.off('error',reject);resolve();});});
 return {server:httpServer,port:httpServer.address().port,clients,rooms,profiles,close:async()=>{clearInterval(simulation);clearInterval(snapshots);clearInterval(saver);clearInterval(heartbeat);for(const peer of peers)peer.close();await persist();await new Promise(resolve=>httpServer.close(resolve));}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const game=await createServer();console.log(`Maré Viva · http://localhost:${game.port} · até 12 jogadores por sala`);
 const shutdown=async()=>{await game.close();process.exit(0);};process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
}
