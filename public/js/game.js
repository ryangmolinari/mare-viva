import {newProfile,buy,sell,equip,unlock,discoverSecret,worldHour} from '/shared/rules.js';
import {BOAT,DOCK,SPAWN,secretNear} from '/shared/world.js';
import {SaveSystem} from './systems/SaveSystem.js';
import {FishSystem} from './systems/FishSystem.js';
import {InventorySystem} from './systems/InventorySystem.js';
import {CollectionSystem} from './systems/CollectionSystem.js';
import {EconomySystem} from './systems/EconomySystem.js';
import {ShopSystem} from './systems/ShopSystem.js';
import {BoatSystem} from './systems/BoatSystem.js';
import {IslandSystem} from './systems/IslandSystem.js';
import {PlayerSystem} from './systems/PlayerSystem.js';
import {MultiplayerSystem} from './systems/MultiplayerSystem.js';
import {FishingSystem} from './systems/FishingSystem.js';
import {AudioSystem} from './audio.js';
import {Renderer,ParticlePool} from './renderer.js';
import {UI} from './ui.js';
class Game {
 constructor(){this.started=false;this.mode='local';this.profile=newProfile('Sol');this.hour=10;this.time=0;this.transitioning=false;this.networkLost=false;this.saveSystem=new SaveSystem();this.particles=new ParticlePool();this.islands=new IslandSystem(this);this.player=new PlayerSystem(this);this.fish=new FishSystem(this);this.inventory=new InventorySystem(this);this.collection=new CollectionSystem(this);this.economy=new EconomySystem(this);this.shop=new ShopSystem(this);this.boats=new BoatSystem(this);this.multiplayer=new MultiplayerSystem(this);this.fishing=new FishingSystem(this);this.audio=new AudioSystem(this);this.renderer=new Renderer(this,document.getElementById('world'));this.ui=new UI(this);this.bind();this.lastFrame=performance.now();this.uiElapsed=0;requestAnimationFrame(t=>this.frame(t));}
 setProfile(p){this.profile=p;if(this.started)this.ui.update(true);}
 async start(name,character,mode,room){this.mode=mode;this.audio.init();this.networkLost=false;document.getElementById('network-lost').hidden=true;this.player.reset();this.fishing.cancel();this.boats.destination=null;
  if(mode==='online')await this.multiplayer.connect(name,character,room);else{this.multiplayer.stop();this.profile=this.saveSystem.load()||newProfile(name,character);this.profile.name=String(name).trim().slice(0,18)||'Pescador';this.profile.character=character;}
  localStorage.setItem('mare-viva.name',this.profile.name);this.islands.load(this.profile.island);this.renderer.camera={x:980,y:580};this.started=true;document.getElementById('welcome').hidden=true;document.getElementById('hud').hidden=false;this.audio.island(this.islands.id);this.save();this.ui.update(true);this.ui.notice('Boa maré! Olhe para a água e pressione Espaço para lançar a linha.');
 }
 save(){if(this.mode==='local'){this.saveSystem.save(this.profile);if(this.saveSystem.error&&!this.warnedSave){this.warnedSave=true;this.ui.notice('O navegador não permitiu salvar. Exporte seu diário nas configurações.');}}}
 async action(type,data={}){if(this.mode==='online')return this.multiplayer.request(type,data);let result;const p=this.profile;
  if(type==='buy'||type==='sell'){if(!this.shop.nearby)throw Error('Aproxime-se de Nara, na loja.');result=type==='buy'?buy(p,data.id):{value:sell(p,data.uid)};}
  else if(type==='equip'){equip(p,data.type,data.value);result=true;}
  else if(type==='unlock')result=unlock(p,data.island);
  else if(type==='secret'){if(!secretNear(this.islands.id,this.player.x,this.player.y))throw Error('Chegue mais perto do segredo.');result={value:discoverSecret(p,this.islands.id)};}
  else if(type==='board'){if(!this.boats.nearby)throw Error('Aproxime-se do barco no píer.');result={...BOAT};}
  else if(type==='exit'){if(!this.boats.nearby)throw Error('Retorne ao píer para desembarcar.');result={...DOCK};}
  else if(type==='travel'){if(!this.player.boat||this.player.x<1430||!p.unlocked.includes(data.island))throw Error('Siga a rota no mar até a borda da região.');p.island=data.island;result={...BOAT,island:data.island};}
  else throw Error('Ação desconhecida.');this.save();this.ui.update(true);return result;
 }
 interact(){if(!this.started||this.ui.panel||this.fishing.active||this.networkLost)return;if(this.player.boat||this.boats.nearby)this.boats.toggle();else if(this.shop.nearby)this.shop.open();else if(secretNear(this.islands.id,this.player.x,this.player.y)&&!this.profile.secrets.includes(this.islands.id))this.action('secret').then(r=>{this.audio.effect('secret');this.ui.notice(`Você descobriu ${this.islands.current.secret}! +${r.value} moedas.`,true);this.particles.splash(this.player.x,this.player.y-20);}).catch(e=>this.ui.notice(e.message));else this.ui.notice('Explore a ilha. Nara, o barco e pequenos segredos esperam por você.');}
 emote(e=3){if(!this.started||this.networkLost)return;if(this.mode==='online')this.multiplayer.send({t:'emote',e});else this.player.emote={e,until:performance.now()+2500};}
 async reconnect(){const b=document.getElementById('reconnect');b.disabled=true;try{this.multiplayer.stop();this.fishing.cancel();await this.multiplayer.connect(this.profile.name,this.profile.character,this.multiplayer.room);this.player.reset();this.boats.destination=null;this.islands.load(this.profile.island);this.networkLost=false;document.getElementById('network-lost').hidden=true;this.ui.notice('Você voltou à sala. Seu diário está seguro.');}catch(e){this.ui.notice(e.message);}finally{b.disabled=false;}}
 returnWelcome(){this.fishing.cancel();this.save();this.multiplayer.stop();this.started=false;this.ui.close();document.getElementById('hud').hidden=true;document.getElementById('welcome').hidden=false;document.getElementById('player-name').value=this.profile.name;this.islands.load(0);this.player.reset();this.renderer.camera={x:820,y:495};}
 bind(){const inputs=e=>['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName);window.addEventListener('keydown',e=>{if(inputs(e))return;const key=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key))e.preventDefault();if(!this.started)return;
   if(key==='escape'){if(this.fishing.active){this.fishing.cancel();this.ui.notice('Linha recolhida.');}else if(this.ui.panel)this.ui.close();else this.ui.open('settings');return;}
   if(key===' '){this.player.held=true;if(!e.repeat)this.fishing.action();this.multiplayer.send({t:'input',held:true});return;}
   if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key))this.player.keys.add(key);
   if(e.repeat)return;if(key==='e')this.interact();if(key==='i')this.ui.panel==='inventory'?this.ui.close():this.ui.open('inventory');if(key==='c')this.ui.panel==='collection'?this.ui.close():this.ui.open('collection');if(key==='2')this.ui.cycleBait();if(key==='r')this.emote();
  });window.addEventListener('keyup',e=>{this.player.keys.delete(e.key.toLowerCase());if(e.key===' '){this.player.held=false;this.multiplayer.send({t:'input',held:false});}});
  const hold=pointer=>{if(!this.started)return;this.player.held=true;this.fishing.action(pointer);this.multiplayer.send({t:'input',held:true});};
  const release=()=>{this.player.held=false;this.multiplayer.send({t:'input',held:false});};const canvas=document.getElementById('world');canvas.addEventListener('pointerdown',e=>{if(e.button===0){canvas.setPointerCapture(e.pointerId);hold(this.renderer.screenToWorld(e.clientX,e.clientY));}});canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  const action=document.getElementById('action-button');action.onpointerdown=e=>{e.preventDefault();action.setPointerCapture(e.pointerId);hold();};action.onpointerup=release;action.onpointercancel=release;document.getElementById('touch-interact').onclick=()=>this.interact();
  const dirKeys={up:'w',left:'a',down:'s',right:'d'};document.querySelectorAll('[data-move]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);this.player.keys.add(dirKeys[b.dataset.move]);};b.onpointerup=()=>this.player.keys.delete(dirKeys[b.dataset.move]);b.onpointercancel=b.onpointerup;});
  window.addEventListener('blur',()=>{this.player.keys.clear();release();});document.addEventListener('visibilitychange',()=>{if(document.hidden){this.player.keys.clear();release();this.save();}});window.addEventListener('pagehide',()=>this.save());
 }
 frame(now){const dt=Math.min(.05,(now-this.lastFrame)/1000);this.lastFrame=now;this.time+=dt;if(!document.hidden){if(this.started){this.hour=worldHour(Date.now()+(this.mode==='online'?this.multiplayer.offset:0));this.player.update(dt);this.fishing.update(dt);this.boats.update();this.multiplayer.update(dt);this.uiElapsed+=dt;if(this.uiElapsed>.12){this.uiElapsed=0;this.ui.update();}}this.particles.update(dt);this.renderer.draw(this.time,dt);}requestAnimationFrame(t=>this.frame(t));}
}
// Exposed for extension modules and reproducible browser integration checks.
window.mareViva=new Game();
