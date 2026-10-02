import {RODS} from '/shared/catalog.js';
import {zoneAt} from '/shared/world.js';
import {newMini,stepMini} from '/shared/minigame.js';
export class FishingSystem {
 constructor(game){this.game=game;this.state='idle';this.elapsed=0;this.mini=null;this.target=null;this.busy=false;}
 get active(){return this.state!=='idle';}get networkAnim(){return {preparing:'cast',cast:'cast',wait:'wait',bite:'bite',hooking:'reel',mini:'reel',pull:'reel'}[this.state]||'idle';}
 findTarget(pointer){const p=this.game.player,reach=RODS[this.game.profile.rod].reach;if(pointer&&Math.hypot(pointer.x-p.x,pointer.y-p.y)<=reach&&zoneAt(this.game.islands.id,pointer.x,pointer.y)>=0)return pointer;
  const dirs=[[0,1],[-1,0],[0,-1],[1,0]];for(const angle of [0,-.3,.3,-.6,.6]){const [dx,dy]=dirs[p.dir];for(let d=45;d<=reach;d+=10){const x=p.x+(dx*Math.cos(angle)-dy*Math.sin(angle))*d,y=p.y+(dx*Math.sin(angle)+dy*Math.cos(angle))*d;if(zoneAt(this.game.islands.id,x,y)>=0)return {x,y};}}return null;}
 async action(pointer){if(this.busy||this.game.ui.panel||this.game.networkLost||this.game.transitioning)return;if(this.state==='bite'){this.busy=true;this.state='hooking';try{let r;if(this.game.mode==='online')r=await this.game.multiplayer.request('hook');else r={fishId:this.pendingFish.id,seed:Math.floor(Math.random()*1000000)};this.fish=this.game.fish.get(r.fishId);this.mini=newMini(this.fish.difficulty,RODS[this.game.profile.rod],r.seed);this.state='mini';this.elapsed=0;this.game.audio.effect('hook');this.game.ui.startMini(this.fish);this.game.multiplayer.send({t:'input',held:this.game.player.held});}catch(e){this.escape(e.message);}finally{this.busy=false;}return;}
  if(this.active)return;if(this.game.player.boat)return this.game.ui.notice('Desembarque no píer para pescar.');if(this.game.inventory.full)return this.game.ui.notice('Mochila cheia. Venda seus peixes na loja.');const target=this.findTarget(pointer);if(!target)return this.game.ui.notice('Olhe para a água e chegue mais perto da margem.');this.busy=true;
  try{let r;if(this.game.mode==='online')r=await this.game.multiplayer.request('start',target);else{this.pendingFish=this.game.fish.encounter(zoneAt(this.game.islands.id,target.x,target.y));r={wait:(2200+Math.random()*2200)/RODS[this.game.profile.rod].speed};const p=this.game.profile;if(p.bait){p.baits[p.bait]--;if(p.baits[p.bait]<=0)p.bait=0;this.game.save();}}
   this.target=target;this.state='preparing';this.elapsed=0;this.splashed=false;this.biteTime=this.game.mode==='online'?(r.biteAt-(Date.now()+this.game.multiplayer.offset))/1000:.75+r.wait/1000;this.game.audio.effect('cast');this.game.ui.update();
  }catch(e){this.game.ui.notice(e.message);}finally{this.busy=false;}}
 update(dt){if(!this.active||this.game.networkLost)return;this.elapsed+=dt;
  if(this.state==='pull'&&this.elapsed>.6){const result=this.landed;this.state='idle';this.landed=null;this.game.ui.showCapture(result.catch,result.isNew);this.game.ui.update(true);return;}
  if(this.state==='preparing'&&this.elapsed>.16)this.state='cast';
  if(this.state==='cast'&&this.elapsed>.75){this.state='wait';this.game.audio.effect('splash');this.game.particles.splash(this.target.x,this.target.y);}
  if(this.state==='wait'&&this.elapsed>=this.biteTime){this.state='bite';this.game.audio.effect('bite');this.game.particles.splash(this.target.x,this.target.y);}
  if(this.state==='bite'&&this.elapsed>this.biteTime+1.6&&this.game.mode==='local')this.escape('O peixe escapou. Puxe assim que a boia afundar.');
  if(this.state==='mini'){stepMini(this.mini,this.game.player.held,dt);if(this.game.mode==='local'&&this.mini.finished){if(this.mini.progress>=1){const c=this.game.fish.capture(this.fish);this.wasNew=!this.game.collection.get(c.fishId);this.game.inventory.add(c);this.caught(c);}else this.escape();}if(this.state==='mini'&&this.mini)this.game.ui.updateMini(this.mini);}
 }
 serverMini(s){if(this.state==='mini'&&this.mini)Object.assign(this.mini,s,{finished:false});}
 caught(c){const wasNew=this.game.mode==='local'?this.wasNew:(this.game.collection.get(c.fishId)?.count===1);this.state='pull';this.elapsed=0;this.landed={catch:c,isNew:wasNew};this.mini=null;this.game.player.held=false;this.game.audio.effect('capture');this.game.particles.splash(this.game.player.x,this.game.player.y-25);this.game.ui.endMini();this.game.ui.update(true);}
 escape(message='O peixe escapou. A próxima maré traz outra chance.'){if(!this.active)return;this.state='idle';this.mini=null;this.game.ui.endMini();this.game.ui.notice(message);this.game.ui.update();}
 cancel(){if(this.game.mode==='online'&&this.active)this.game.multiplayer.send({t:'cancel'});this.state='idle';this.mini=null;this.game.ui.endMini();}
}
