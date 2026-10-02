import {TILE,WIDTH,HEIGHT,BUILDINGS,BOAT,tileAt,zoneAt} from '/shared/world.js';
import {ISLANDS,RODS,CHARACTERS} from '/shared/catalog.js';
import {clamp} from '/shared/rules.js';
import {propArt,buildingArt,playerArt,playerSheet,drawBoat,fishArt} from './art.js';
export class ParticlePool {
 constructor(){this.items=Array.from({length:128},()=>({life:0}));}
 clear(){this.items.forEach(p=>p.life=0);}
 spawn(x,y,type,count=1){for(let i=0;i<count;i++){const p=this.items.find(a=>a.life<=0);if(!p)break;Object.assign(p,{x,y,type,life:type==='footprint'?2:type==='wake'?1.4:.7+Math.random()*.5,max:type==='footprint'?2:type==='wake'?1.4:1.2,vx:(Math.random()-.5)*40,vy:type==='splash'?-25-Math.random()*40:0,size:1+Math.random()*2});}}
 splash(x,y){this.spawn(x,y,'splash',10);this.spawn(x,y,'ring',2);}
 update(dt){for(const p of this.items)if(p.life>0){p.life-=dt;if(p.type==='splash'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=110*dt;}}}
 draw(c){for(const p of this.items)if(p.life>0){c.globalAlpha=Math.min(.7,p.life/p.max);if(p.type==='ring'||p.type==='wake'){c.strokeStyle='#cde9d9';c.lineWidth=1;c.beginPath();c.ellipse(p.x,p.y,(1-p.life/p.max)*24+4,(1-p.life/p.max)*9+2,0,0,Math.PI*2);c.stroke();}else{c.fillStyle=p.type==='footprint'?'#7e897344':'#c6f1e5';c.fillRect(Math.round(p.x),Math.round(p.y),p.type==='footprint'?3:2,p.type==='footprint'?2:3);}}c.globalAlpha=1;}
}
export class Renderer {
 constructor(game,canvas){this.game=game;this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.camera={x:820,y:495};this.propCache=new Map();this.map=null;this.scale=1;this.width=innerWidth;this.height=innerHeight;this.resize();window.addEventListener('resize',()=>this.resize());this.loadRegion();}
 resize(){this.width=innerWidth;this.height=innerHeight;this.dpr=Math.min(devicePixelRatio||1,1.5);this.canvas.width=Math.round(this.width*this.dpr);this.canvas.height=Math.round(this.height*this.dpr);this.scale=Math.max(.62,Math.min(this.width/1150,this.height/740));this.ctx.imageSmoothingEnabled=false;}
 loadRegion(){const island=this.game.islands.current;this.propCache.clear();this.buildingCache=BUILDINGS.map(b=>buildingArt(island.theme,b.type));this.map=document.createElement('canvas');this.map.width=WIDTH;this.map.height=HEIGHT;const c=this.map.getContext('2d');c.imageSmoothingEnabled=false;
  const atlas=document.createElement('canvas');atlas.width=TILE*3;atlas.height=TILE*10;const a=atlas.getContext('2d');const types=this.game.islands.types;
  for(let n=0;n<types.length;n++)for(let v=0;v<3;v++){const type=types[n],x=v*TILE,y=n*TILE;const color={water:island.water[0],grass:island.land[0],grass2:island.land[1],sand:island.land[2],path:island.theme==='ice'?'#c7d5d9':island.theme==='mystic'?'#aea2b7':'#d5bf8f',dock:'#b99264',bridge:'#a2805c',dune:island.land[v%2],snow:island.land[v%2],ice:'#a8cbd5'}[type];a.fillStyle=color;a.fillRect(x,y,TILE,TILE);
   let s=17+n*319+v*91;const random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
   for(let i=0;i<12;i++){const px=x+Math.floor(random()*30),py=y+Math.floor(random()*30);a.fillStyle=type==='water'?island.water[1]:type==='grass'||type==='grass2'?'#c8daa525':type==='snow'?'#adcadb40':type==='ice'?'#deefef66':'#81664d24';a.fillRect(px,py,type==='water'?3:1,type==='grass'?2:1);}
   if(type==='dock'||type==='bridge'){if(island.theme==='ice'){a.fillStyle='#9bb5c3';a.fillRect(x,y,32,32);}for(let yy=0;yy<32;yy+=8){a.fillStyle=island.theme==='ice'?'#6d8e9e':'#7d604c';a.fillRect(x,y+yy,32,1);a.fillStyle=island.theme==='ice'?'#dbe7e8':'#d7b17b';a.fillRect(x,y+yy+1,32,1);a.fillStyle='#725d4c';a.fillRect(x+3,y+yy+3,1,1);a.fillRect(x+28,y+yy+3,1,1);}a.fillStyle='#9b7957';a.fillRect(x+16,y,1,32);}
   if(type==='ice'){a.strokeStyle='#d7eef0';a.beginPath();a.moveTo(x+4,y+6);a.lineTo(x+18,y+11);a.lineTo(x+12,y+21);a.lineTo(x+25,y+29);a.stroke();}
  }
  this.atlas=atlas;
  const cols=WIDTH/TILE;for(let y=0;y<HEIGHT/TILE;y++)for(let x=0;x<cols;x++){const type=this.game.islands.tiles[y*cols+x],v=(x*7+y*13)%3;c.drawImage(atlas,v*TILE,type*TILE,TILE,TILE,x*TILE,y*TILE,TILE,TILE);
   if(types[type]==='water'){const near=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>!['water','dock'].includes(tileAt(island.id,(x+dx)*32,(y+dy)*32)));if(near){c.fillStyle=island.water[1];c.fillRect(x*32,y*32,32,32);c.fillStyle=island.water[2]+'77';c.fillRect(x*32+2,y*32+2,28,28);}}
  }
  // Boardwalk rails and bollards are separate objects, with a walkable center.
  for(let x=976;x<=1264;x+=48){c.fillStyle='#705c4b';c.fillRect(x,539,6,12);c.fillRect(x,602,6,15);c.fillStyle='#d6b986';c.fillRect(x-1,536,8,4);c.fillRect(x-1,600,8,4);}c.fillStyle='#d5bd8b';c.fillRect(985,541,272,3);c.fillRect(985,603,248,3);
  this.game.ui?.drawMinimap();
 }
 screenToWorld(x,y){return{x:(x-this.width/2)/this.scale+this.camera.x,y:(y-this.height/2)/this.scale+this.camera.y};}
 visible(x,y,margin=150){return Math.abs(x-this.camera.x)<this.width/this.scale/2+margin&&Math.abs(y-this.camera.y)<this.height/this.scale/2+margin;}
 shadow(c,x,y,w=16,h=5){c.fillStyle='#173f4240';c.beginPath();c.ellipse(x,y+2,w,h,0,0,Math.PI*2);c.fill();}
 drawProp(c,p,t){if(!this.visible(p.x,p.y))return;if(p.type==='npc'){this.drawPlayer(c,{x:p.x,y:p.y,dir:0,character:1,name:'Nara',outfit:{'hat':'hat-straw'}},t,true);return;}
  if(p.type==='secret'&&this.game.profile?.secrets.includes(this.game.islands.id)){c.globalAlpha=.5;}
  const key=p.type+':'+p.variant;if(!this.propCache.has(key))this.propCache.set(key,propArt(this.game.islands.current.theme,p.type,p.variant));this.shadow(c,p.x,p.y,p.type==='tree'?25:17,p.type==='tree'?7:5);
  const scale=p.type==='tree'?.85+(p.variant%3)*.1:1;c.save();c.translate(Math.round(p.x),Math.round(p.y));if(p.type==='tree')c.translate(Math.round(Math.sin(t*.9+p.x)*1.3),0);c.drawImage(this.propCache.get(key),-64*scale,-108*scale,128*scale,144*scale);c.restore();c.globalAlpha=1;
  if(p.type==='secret'&&!this.game.profile?.secrets.includes(this.game.islands.id)){c.fillStyle='#f8e3a0';const xx=p.x+Math.sin(t*1.4)*16,yy=p.y-18+Math.cos(t*2)*4;c.fillRect(Math.round(xx),Math.round(yy),2,2);}
 }
 drawPlayer(c,p,t,npc=false){if(!this.visible(p.x,p.y,60))return;const char=p.character??this.game.profile?.character??0,outfit=p.outfit||this.game.profile?.outfit||{},frame=p.moving||p.anim==='walk'?Math.floor(t*9)%4:0;
  if(p.boat){drawBoat(c,p.x,p.y,p.boarding?null:char,p.dir||0,t,outfit);if(p.boarding){const k=clamp(p.boarding.elapsed/.45,0,1),x=p.boarding.x+(p.x-p.boarding.x)*k,y=p.boarding.y+(p.y-p.boarding.y)*k-Math.sin(k*Math.PI)*15;c.drawImage(playerArt(char,p.dir||0,Math.floor(t*9)%4,outfit),x-16,y-44);}}else{this.shadow(c,p.x,p.y,11,4);c.drawImage(playerSheet(char,outfit),frame*32,(p.dir||0)*48,32,48,Math.round(p.x)-16,Math.round(p.y)-44,32,48);}
  if(!npc&&p===this.game.player&&this.game.fishing.active)this.drawFishing(c,t);
  else if(p.anim&&['cast','wait','bite','reel'].includes(p.anim)){const bx=p.castX??p.x+53,by=(p.castY??p.y+62)+Math.sin(t*4)*1.5;c.strokeStyle=RODS[0].color;c.lineWidth=2;c.beginPath();c.moveTo(p.x+8,p.y-23);c.lineTo(p.x+35,p.y-58);c.stroke();c.strokeStyle='#e9f5e5aa';c.lineWidth=1;c.beginPath();c.moveTo(p.x+35,p.y-58);c.quadraticCurveTo((p.x+35+bx)/2,(p.y-58+by)/2+12,bx,by);c.stroke();c.fillStyle='#ec8f79';c.fillRect(bx-2,by,4,5);}
  const name=p.name||this.game.profile?.name||'Viajante';c.font='9px Segoe UI';c.textAlign='center';const w=c.measureText(name).width+14;c.fillStyle=npc?'#f6eddcdd':'#234951b3';c.fillRect(Math.round(p.x-w/2),p.y-(p.boat?65:61),w,14);c.fillStyle=npc?'#4c705d':'#f8f0d6';c.fillText(name,p.x,p.y-(p.boat?55:51));
  if(p.emote&&performance.now()<p.emote.until){c.fillStyle='#f7f1de';c.beginPath();c.roundRect(p.x-13,p.y-94,26,25,5);c.fill();c.fillStyle='#648273';c.font='18px Segoe UI';c.fillText(['♥','♫','!','☺'][p.emote.e],p.x,p.y-75);}
 }
 drawFishing(c,t){const f=this.game.fishing,p=this.game.player;if(!f.target)return;let angle=-1.04;if(f.state==='preparing')angle=-2.5;if(f.state==='cast')angle=-2.5+Math.min(1,(f.elapsed-.16)/.48)*2.4;if(f.state==='mini')angle=-1.1+Math.sin(t*9)*.08;
  const base={x:p.x+10,y:p.y-27},tip={x:base.x+Math.cos(angle)*44,y:base.y+Math.sin(angle)*44};c.strokeStyle='#4c5c55';c.lineWidth=4;c.beginPath();c.moveTo(base.x,base.y);c.lineTo(tip.x,tip.y);c.stroke();c.strokeStyle=RODS[this.game.profile.rod].color;c.lineWidth=2;c.stroke();
  if(f.state==='preparing')return;let bx=f.target.x,by=f.target.y;if(f.state==='cast'){const k=clamp((f.elapsed-.16)/.59,0,1);bx=tip.x+(f.target.x-tip.x)*k;by=tip.y+(f.target.y-tip.y)*k-Math.sin(k*Math.PI)*60;}
  else by+=Math.sin(t*4)*1.5+(f.state==='bite'?6:0);
  if(f.state==='pull'&&f.landed){const k=clamp(f.elapsed/.6,0,1);bx=f.target.x+(p.x-f.target.x)*k;by=f.target.y+(p.y-48-f.target.y)*k-Math.sin(k*Math.PI)*48;c.drawImage(fishArt(this.game.fish.get(f.landed.catch.fishId)),bx-24,by-18,48,30);}
  c.strokeStyle='#edf1dfa3';c.lineWidth=1;c.beginPath();c.moveTo(tip.x,tip.y);c.quadraticCurveTo((tip.x+bx)/2,(tip.y+by)/2+12,bx,by);c.stroke();
  c.strokeStyle='#c5e3d88a';c.beginPath();c.ellipse(bx,by+4,9+Math.sin(t*3)*3,3,0,0,Math.PI*2);c.stroke();c.fillStyle='#f7edd5';c.fillRect(Math.round(bx)-2,Math.round(by)-5,4,4);c.fillStyle='#df806d';c.fillRect(Math.round(bx)-2,Math.round(by)-1,4,4);
  if(f.state==='bite'){c.fillStyle='#f7e0a1';c.font='bold 22px Georgia';c.textAlign='center';c.fillText('!',p.x,p.y-81);for(let i=0;i<4;i++){c.strokeStyle='#f7f3ce';c.strokeRect(bx+Math.sin(t*6+i)*9,by-4-i*4,2,2);}}
 }
 drawLandmarks(c,t){const id=this.game.islands.id;if(id===1){c.fillStyle='#a0d0b9';c.fillRect(609,185,62,64);c.fillStyle='#d8e8cf';for(let i=0;i<8;i++)c.fillRect(613+i*7,187+(t*60+i*4)%48,2,12);this.shadow(c,642,253,36,7);c.strokeStyle='#c7e8cd';c.beginPath();c.ellipse(640,251,34,7,0,0,Math.PI*2);c.stroke();}
  if(id===2||id===4){for(const x of [366,402]){c.fillStyle=id===2?'#b39477':'#817b98';c.fillRect(x,430,16,60);c.fillStyle=id===2?'#e5c895':'#c0b5d1';c.fillRect(x-2,423,20,8);c.fillRect(x-2,482,20,8);c.fillStyle='#7a717566';c.fillRect(x+11,431,3,48);}}
  if(id===3){c.fillStyle='#7e9cae';c.beginPath();c.moveTo(404,320);c.lineTo(450,215);c.lineTo(505,320);c.fill();c.fillStyle='#eef5f0';c.beginPath();c.moveTo(450,215);c.lineTo(430,263);c.lineTo(444,255);c.lineTo(458,267);c.lineTo(465,252);c.lineTo(474,265);c.fill();}
  if(id===4){c.fillStyle='#514b69';c.fillRect(408,269,91,59);c.fillStyle='#a69bb5';c.fillRect(415,257,77,14);c.fillRect(403,279,16,57);c.fillRect(484,279,16,57);c.fillStyle='#b5e7cd';for(let i=0;i<7;i++)c.fillRect(553+i*25,390+Math.sin(t+i)*18,2,2);}
 }
 draw(t,dt){const g=this.game,c=this.ctx;if(g.started){const vw=this.width/this.scale,vh=this.height/this.scale,tx=clamp(g.player.x,Math.min(WIDTH/2,vw/2),Math.max(WIDTH/2,WIDTH-vw/2)),ty=clamp(g.player.y,Math.min(HEIGHT/2,vh/2),Math.max(HEIGHT/2,HEIGHT-vh/2));const a=1-Math.exp(-dt*4);this.camera.x+=(tx-this.camera.x)*a;this.camera.y+=(ty-this.camera.y)*a;}
  c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle=g.islands.current.water[0];c.fillRect(0,0,this.width,this.height);c.save();c.translate(this.width/2,this.height/2);c.scale(this.scale,this.scale);c.translate(-Math.round(this.camera.x),-Math.round(this.camera.y));c.drawImage(this.map,0,0);
  const id=g.islands.id,water=g.islands.current.water;
  // Only animate water visible in the camera; map textures remain cached.
  const left=Math.max(0,Math.floor((this.camera.x-this.width/this.scale/2)/64)*64),top=Math.max(0,Math.floor((this.camera.y-this.height/this.scale/2)/64)*64);
  for(let y=top;y<Math.min(HEIGHT,this.camera.y+this.height/this.scale/2+64);y+=64)for(let x=left;x<Math.min(WIDTH,this.camera.x+this.width/this.scale/2+64);x+=64){const xx=x+16,yy=y+19;if(tileAt(id,xx,yy)!=='water')continue;c.globalAlpha=.23+.14*Math.sin(t*1.5+x*.01+y*.02);c.fillStyle=water[2];const off=Math.floor(Math.sin(t+x*.04)*4);c.fillRect(xx+off,yy,10,1);c.fillRect(xx+off+5,yy+2,5,1);if(id===4){c.globalAlpha=.55;c.fillRect(xx+18,yy+Math.sin(t*2+x)*8,1,1);}}c.globalAlpha=1;
  this.drawLandmarks(c,t);
  if(g.boats.destination!==null&&g.player.boat){c.fillStyle='#f4d58f';for(let x=1310;x<1490;x+=20){const y=656+Math.sin((x+t*45)*.02)*3;c.globalAlpha=.4+((x+t*40)%100)/200;c.fillRect(x,y,3,3);}c.globalAlpha=1;c.font='11px Segoe UI';c.fillStyle='#f3e7c2';c.textAlign='center';c.fillText(`${ISLANDS[g.boats.destination].short} →`,1400,620);}
  if(!g.player.boat)drawBoat(c,BOAT.x,BOAT.y,null,0,t);
  const objects=g.islands.props.map(p=>({y:p.y,kind:'prop',p}));BUILDINGS.forEach((b,i)=>objects.push({y:b.y+b.h,kind:'building',b,i}));objects.push({y:g.player.y,kind:'player',p:g.player});for(const p of g.multiplayer.peers.values())if(p.island===id)objects.push({y:p.y,kind:'player',p});objects.sort((a,b)=>a.y-b.y);
  for(const obj of objects){if(obj.kind==='prop')this.drawProp(c,obj.p,t);else if(obj.kind==='player')this.drawPlayer(c,obj.p,t);else{const b=obj.b;if(this.visible(b.x,b.y))c.drawImage(this.buildingCache[obj.i],b.x-16,b.y-20,160,b.h+55);}}
  g.particles.draw(c);
  if(g.saveSystem.settings.effects){const jump=(t%16);if(jump<1.6){const x=1320+Math.sin(jump*3)*18,y=390-Math.sin(jump/1.6*Math.PI)*24;c.fillStyle='#8fccbe';c.fillRect(x,y,10,3);c.fillRect(x+9,y-2,3,7);}for(let i=0;i<3;i++){const x=((t*24+i*270)%1800)-100,y=135+i*67+Math.sin(t*.7+i)*8;if(this.visible(x,y)){c.fillStyle='#f6efd5';const wing=Math.sin(t*7+i)>0?2:-2;c.fillRect(x,y,3,2);c.fillRect(x-4,y+wing,4,1);c.fillRect(x+3,y+wing,4,1);}}}
  c.restore();if(g.started){let darkness=g.hour>=19||g.hour<5?.31:g.hour>=17?.08:g.hour<7?.11:0;if(darkness){c.fillStyle=`rgba(25,35,70,${darkness})`;c.fillRect(0,0,this.width,this.height);}if(g.hour>=17&&g.hour<19){c.fillStyle='#d7884720';c.fillRect(0,0,this.width,this.height);}}
 }
}
