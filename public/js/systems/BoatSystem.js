import {BOAT,DOCK} from '/shared/world.js';
export class BoatSystem {
 constructor(game){this.game=game;this.destination=null;this.busy=false;}
 get nearby(){return Math.hypot(this.game.player.x-BOAT.x,this.game.player.y-BOAT.y)<130;}
 async toggle(){if(this.busy)return;this.busy=true;try{const p=this.game.player;if(p.boat){const r=await this.game.action('exit');p.boat=false;p.x=r.x;p.y=r.y;this.destination=null;this.game.ui.notice('Pés em terra. Há novas histórias nesta ilha.');}else{const r=await this.game.action('board');p.boarding={x:p.x,y:p.y,elapsed:0};p.boat=true;p.x=r.x;p.y=r.y;this.game.audio.effect('boat');this.game.ui.open('routes');}}catch(e){this.game.ui.notice(e.message);}finally{this.busy=false;}}
 async choose(id){if(id===this.game.islands.id)return;this.destination=id;this.game.ui.close();if(!this.game.player.boat)await this.toggle();this.game.ui.close();this.game.ui.notice('Siga os pontos dourados para leste. Na borda do mar, a viagem continua.');}
 async update(){if(this.busy||!this.game.player.boat||this.destination===null||this.game.player.x<1440||this.game.transitioning)return;this.busy=true;try{const r=await this.game.action('travel',{island:this.destination});const target=this.destination;this.destination=null;await this.game.islands.transition(target);this.game.player.x=r.x;this.game.player.y=r.y;this.game.ui.notice('Bem-vindo! Aproxime-se do píer e pressione E para desembarcar.');}catch(e){this.game.ui.notice(e.message);this.game.player.x=1410;}finally{this.busy=false;}}
}
