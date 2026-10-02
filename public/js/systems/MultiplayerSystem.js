export class MultiplayerSystem {
 constructor(game){this.game=game;this.peers=new Map();this.pending=new Map();this.counter=0;this.elapsed=0;this.inputElapsed=0;this.connected=false;this.offset=0;}
 async connect(name,character,room){this.peers.clear();this.intentional=false;return new Promise((resolve,reject)=>{
  const ws=new WebSocket(`${location.protocol==='https:'?'wss':'ws'}://${location.host}/play`);this.ws=ws;let welcomed=false;const timer=setTimeout(()=>{reject(Error('Servidor indisponível. Verifique a conexão ou escolha aventura solo.'));ws.close();},8000);
  ws.onopen=()=>ws.send(JSON.stringify({t:'hello',name,character,room,token:localStorage.getItem('mare-viva.token')||undefined}));
  ws.onmessage=event=>{let m;try{m=JSON.parse(event.data);}catch{return;}
   if(m.t==='welcome'){clearTimeout(timer);welcomed=true;this.connected=true;this.id=m.id;this.room=m.room;this.offset=m.now-Date.now();localStorage.setItem('mare-viva.token',m.token);this.game.setProfile(m.p);resolve(m.p);}
   else if(m.t==='rejected'){clearTimeout(timer);reject(Error(m.error));}
   else if(m.t==='profile'){this.game.setProfile(m.p);}
   else if(m.t==='reply'){const req=this.pending.get(m.q);if(req){clearTimeout(req.timer);this.pending.delete(m.q);m.error?req.reject(Error(m.error)):req.resolve(m.result);}}
   else if(m.t==='roster')m.players.forEach(p=>{if(p.id!==this.id)this.peers.set(p.id,{...p,x:1168,y:576,tx:1168,ty:576,island:-1});});
   else if(m.t==='join'&&m.player.id!==this.id){this.peers.set(m.player.id,{...m.player,x:1168,y:576,tx:1168,ty:576,island:-1});if(this.game.started)this.game.ui.notice(`${m.player.name} chegou à sala.`);}
   else if(m.t==='leave')this.peers.delete(m.id);
   else if(m.t==='look'){const p=this.peers.get(m.id);if(p)p.outfit=m.outfit;}
   else if(m.t==='state'){for(const [id,island,x,y,dir,boat,anim,castX,castY] of m.d){if(id===this.id)continue;const p=this.peers.get(id);if(p){if(p.island!==island){p.x=x;p.y=y;}Object.assign(p,{island,tx:x,ty:y,dir,boat:!!boat,anim,castX,castY});}}}
   else if(m.t==='mini')this.game.fishing.serverMini(m.s);
   else if(m.t==='caught')this.game.fishing.caught(m.catch);
   else if(m.t==='escaped')this.game.fishing.escape();
   else if(m.t==='emote'){if(m.id===this.id)this.game.player.emote={e:m.e,until:performance.now()+2500};else{const p=this.peers.get(m.id);if(p)p.emote={e:m.e,until:performance.now()+2500};}}
   else if(m.t==='news')this.game.ui.notice(`${m.name} pescou ${this.game.fish.get(m.fishId).name} · ${m.weight.toFixed(2)} kg`,true);
  };
  ws.onclose=()=>{clearTimeout(timer);this.connected=false;for(const r of this.pending.values()){clearTimeout(r.timer);r.reject(Error('Conexão interrompida.'));}this.pending.clear();if(!welcomed)reject(Error('Não foi possível entrar nesta sala.'));if(welcomed&&this.game.started&&!this.intentional){this.game.networkLost=true;this.game.player.keys.clear();document.getElementById('network-lost').hidden=false;}};
  ws.onerror=()=>{};
 });}
 send(m){if(this.connected&&this.ws.readyState===1)this.ws.send(JSON.stringify(m));}
 request(t,data={}){if(!this.connected)return Promise.reject(Error('Reconecte ao servidor.'));return new Promise((resolve,reject)=>{const q=++this.counter;const timer=setTimeout(()=>{this.pending.delete(q);reject(Error('O servidor demorou a responder.'));},7000);this.pending.set(q,{resolve,reject,timer});this.send({t,q,...data});});}
 update(dt){for(const p of this.peers.values()){const alpha=1-Math.exp(-dt*14);p.x+=(p.tx-p.x)*alpha;p.y+=(p.ty-p.y)*alpha;}if(!this.game.started||!this.connected||this.game.transitioning)return;this.elapsed+=dt;this.inputElapsed+=dt;if(this.elapsed>=.1){this.elapsed=0;const p=this.game.player;this.send({t:'pos',d:[Math.round(p.x),Math.round(p.y),p.dir,this.game.fishing.active?this.game.fishing.networkAnim:p.boat?'sail':p.moving?'walk':'idle']});}if(this.game.fishing.state==='mini'&&this.inputElapsed>.15){this.inputElapsed=0;this.send({t:'input',held:this.game.player.held});}}
 stop(){this.intentional=true;this.ws?.close();this.connected=false;this.peers.clear();}
}
