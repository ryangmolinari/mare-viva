import {SPAWN,WIDTH,HEIGHT,walkable,obstructed} from '/shared/world.js';
export class PlayerSystem {
 constructor(game){this.game=game;this.x=SPAWN.x;this.y=SPAWN.y;this.dir=0;this.boat=false;this.moving=false;this.walkTime=0;this.keys=new Set();this.held=false;this.emote=null;}
 reset(){this.x=SPAWN.x;this.y=SPAWN.y;this.boat=false;this.keys.clear();}
 update(dt){if(this.boarding){this.boarding.elapsed+=dt;if(this.boarding.elapsed>.45)this.boarding=null;this.moving=false;return;}if(!this.game.started||this.game.transitioning||this.game.networkLost||this.game.ui.panel||this.game.fishing.active){this.moving=false;return;}let dx=(this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0),dy=(this.keys.has('s')||this.keys.has('arrowdown')?1:0)-(this.keys.has('w')||this.keys.has('arrowup')?1:0);this.moving=!!(dx||dy);if(!this.moving)return;this.dir=Math.abs(dx)>Math.abs(dy)?dx>0?3:1:dy>0?0:2;const length=Math.hypot(dx,dy),speed=this.boat?210:140;dx=dx/length*speed*dt;dy=dy/length*speed*dt;
  const valid=(x,y)=>x>=20&&x<WIDTH-20&&y>=20&&y<HEIGHT-20&&(this.boat?walkable(this.game.islands.id,x,y,true):!obstructed(this.game.islands.id,x,y,this.game.islands.props));
  if(valid(this.x+dx,this.y))this.x+=dx;if(valid(this.x,this.y+dy))this.y+=dy;this.walkTime+=dt;
  if(this.walkTime% .22<dt&&this.game.saveSystem.settings.effects)this.game.particles.spawn(this.x,this.y+6,this.boat?'wake':'footprint',this.boat?1:4);
 }
}
