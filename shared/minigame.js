import {clamp} from './rules.js';
export function newMini(difficulty,rod,seed){return {time:0,bar:.5,velocity:0,progress:.26,fish:.5,difficulty,width:Math.max(.15,rod.control-difficulty*.0009),resistance:rod.resistance,speed:rod.speed,seed,finished:false};}
export function fishPosition(s,t){const phase=(s.seed%1000)/159;return clamp(.5+Math.sin(t*(.55+s.difficulty*.019)+phase)*.28+Math.sin(t*(1.4+s.difficulty*.009)+phase*.43)*(.06+s.difficulty*.0008),.06,.94);}
export function stepMini(s,held,dt){
 if(s.finished)return s;dt=Math.min(.06,dt);s.time+=dt;s.fish=fishPosition(s,s.time);
 s.velocity=clamp(s.velocity+(held?-3.6:3.1)*dt,-.88,.91);s.velocity*=Math.pow(.975,dt*60);
 s.bar=clamp(s.bar+s.velocity*dt,s.width/2,1-s.width/2);
 if(s.bar<=s.width/2||s.bar>=1-s.width/2)s.velocity*=-.25;
 const inside=Math.abs(s.fish-s.bar)<s.width/2;
 s.progress=clamp(s.progress+(inside?.12*s.speed:-.082/s.resistance)*dt,0,1);
 if(s.progress>=1||s.progress<=0||s.time>55)s.finished=true;
 return s;
}
