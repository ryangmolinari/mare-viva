import {ISLANDS} from './catalog.js';
export const TILE=32, WIDTH=1536, HEIGHT=1024, SPAWN={x:1168,y:576}, DOCK={x:1248,y:576}, BOAT={x:1270,y:657};
function hash(x,y,s){let n=Math.imul(x+127,s+381)^Math.imul(y+239,928371);return((n^n>>>13)>>>0)%1000/1000;}
export function tileAt(id,x,y){
 if(x<0||y<0||x>=WIDTH||y>=HEIGHT)return 'water';
 const cx=Math.floor(x/TILE)*TILE+16,cy=Math.floor(y/TILE)*TILE+16;
 if(cx>=960&&cx<=1280&&cy>=544&&cy<=608)return 'dock';
 const radii=[[435,330],[445,350],[430,305],[435,352],[449,322]][id];
 const dx=(cx-648)/radii[0],dy=(cy-448)/radii[1],a=Math.atan2(dy,dx);
 const edge=[1+.05*Math.sin(a*5)+.04*Math.cos(a*7),1+.105*Math.sin(a*3+1)+.055*Math.cos(a*6),1+.07*Math.sin(a*7+2)+.06*Math.cos(a*9),1+.09*Math.sin(a*4-1)+.045*Math.cos(a*8),1+.12*Math.sin(a*3+2)+.055*Math.cos(a*7-2)][id];
 const dist=Math.sqrt(dx*dx+dy*dy);
 const safe=(cx>=800&&cx<=1056&&cy>=448&&cy<=608)||(Math.hypot(cx-365,cy-650)<67);
 if(dist>edge&&!safe)return 'water';
 const pond=((cx-640)/105)**2+((cy-425)/77)**2<1;
 const river=id===1&&cx>=608&&cx<=672&&cy>=176&&cy<=512;
 if(id===1&&cx>=576&&cx<=704&&((cy>=272&&cy<=304)||(cy>=496&&cy<=528)))return 'bridge';
 if(pond||river){if(id===3&&!(((cx-640)/29)**2+((cy-432)/25)**2<1)&&!(((cx-704)/22)**2+((cy-400)/25)**2<1))return 'ice';return 'water';}
 if((cx>=816&&cx<=912&&cy>=448&&cy<=608)||(cx>=864&&cx<=1024&&cy>=544&&cy<=608))return 'path';
 if(dist>edge-.13)return 'sand';
 return id===2?'dune':id===3?'snow':hash(cx,cy,id)<.13?'grass2':'grass';
}
export function zoneAt(id,x,y){if(tileAt(id,x,y)!=='water')return -1;return x>1350||x<145||y>900?2:(x>490&&x<780&&y>140&&y<530?1:0);}
export function walkable(id,x,y,boat=false){const type=tileAt(id,x,y);return boat?type==='water':type!=='water';}
export const BUILDINGS=[{x:806,y:350,w:128,h:115,type:'shop'},{x:400,y:260,w:112,h:96,type:'house'},{x:496,y:650,w:96,h:90,type:'house'}];
export function createProps(id){
 const list=[];
 for(let y=192;y<800;y+=64)for(let x=288;x<1040;x+=64){
  const v=hash(x,y,id+12),type=tileAt(id,x,y);
  if(!['grass','grass2','dune','snow'].includes(type)||BUILDINGS.some(b=>x>b.x-35&&x<b.x+b.w+35&&y>b.y-35&&y<b.y+b.h+60)||Math.hypot(x-365,y-650)<90)continue;
  const treeChance=[.37,.68,.24,.43,.48][id],objectChance=[.56,.82,.60,.66,.70][id];
  if(v<objectChance)list.push({x:x+hash(y,x,id)*20-10,y:y+hash(x,y,id+37)*20-10,type:v<treeChance?'tree':'rock',variant:Math.floor(v*19)});
  else if(v<.85)list.push({x,y,type:'flower',variant:Math.floor(v*11)});
 }
 list.push({x:365,y:650,type:'secret',variant:id},{x:857,y:493,type:'npc',variant:id});
 list.push({x:962,y:541,type:'sign',variant:id});
 return list;
}
export function obstructed(id,x,y,props){if(!walkable(id,x,y))return true;
 if(BUILDINGS.some(b=>x>b.x-8&&x<b.x+b.w+8&&y>b.y+42&&y<b.y+b.h+4))return true;
 return props.some(p=>['tree','rock'].includes(p.type)&&Math.hypot(p.x-x,p.y-y)<(p.type==='tree'?17:15));}
export function nearShop(x,y){return Math.hypot(x-857,y-493)<130;}
export function secretNear(id,x,y){return Math.hypot(x-ISLANDS[id].secretAt[0],y-ISLANDS[id].secretAt[1])<64;}
