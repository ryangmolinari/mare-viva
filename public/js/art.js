import {CHARACTERS,COSMETICS} from '/shared/catalog.js';
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
function poly(c,color,points){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function r(c,color,x,y,w,h){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
const fishCache=new Map(),playerCache=new Map(),sheetCache=new Map();
export function fishArt(f,detailed=false,silhouette=false){
 const key=f.id+':'+detailed+':'+silhouette;if(fishCache.has(key))return fishCache.get(key);
 const out=canvas(detailed?128:64,detailed?80:40),c=out.getContext('2d');c.imageSmoothingEnabled=false;c.scale(detailed?2:1,detailed?2:1);
 const [body,light,dark]=silhouette?['#a4afa0','#a4afa0','#a4afa0']:f.palette;
 const v=f.anatomy.variant,cy=20,wide=17+(v%5),tall=6+(v%4);
 const tail=[[43,cy],[54,cy-9-(v%3)],[51,cy],[54,cy+8],[43,cy+3]];
 const oval=(x,y,rx,ry,color)=>{c.fillStyle=color;for(let i=-ry;i<=ry;i++){const width=Math.floor(Math.sqrt(Math.max(0,1-(i/ry)**2))*rx);c.fillRect(x-width,y+i,width*2,1);}};
 if(['ray','manta'].includes(f.shape)){
  poly(c,dark,[[31,12],[9,4],[5,8],[14,22],[25,25],[31,37],[37,25],[49,22],[58,8],[53,4],[35,12]]);poly(c,body,[[31,10],[11,8],[18,20],[28,25],[34,25],[46,20],[53,8],[36,11]]);r(c,light,27,17,10,3);r(c,dark,30,27,2,10);r(c,light,25,12,2,2);r(c,light,37,12,2,2);
 }else if(f.shape==='seahorse'){
  poly(c,dark,[[26,3],[37,5],[43,11],[42,14],[31,14],[30,23],[38,29],[35,36],[28,38],[22,33],[26,28],[29,31],[26,33],[31,35],[34,31],[25,26],[21,18],[22,10]]);poly(c,body,[[26,6],[35,7],[39,11],[28,12],[26,20],[32,28],[25,23],[23,16]]);poly(c,light,[[25,4],[24,0],[29,2],[33,0],[33,5]]);r(c,light,19,17,4,7);r(c,'#223942',32,9,2,2);
 }else if(['jelly','octopus'].includes(f.shape)){
  oval(31,14,15,10,dark);oval(31,13,13,8,body);r(c,light,23,8,14,2);for(let i=0;i<7;i++)poly(c,i%2?body:dark,[[19+i*4,20],[20+i*4,29+(i%3)*2],[15+i*5,35],[17+i*5,38],[23+i*4,31],[23+i*4,20]]);r(c,'#283445',26,15,2,3);r(c,'#283445',36,15,2,3);
 }else if(f.shape==='nautilus'){
  oval(29,19,15,14,dark);oval(28,18,13,12,body);for(let i=0;i<22;i++){const a=i*.62,rad=i*.48;r(c,light,28+Math.cos(a)*rad,18+Math.sin(a)*rad,2,2);}for(let i=0;i<5;i++)poly(c,dark,[[39,17+i*3],[52,14+i*4],[45,20+i*3]]);r(c,'#253943',44,18,2,2);
 }else if(['eel','serpent','ribbon','mist'].includes(f.shape)){
  poly(c,dark,[[7,18],[11,13],[21,11],[33,14],[43,24],[51,24],[57,16],[57,27],[49,32],[38,29],[29,20],[18,17],[12,21]]);poly(c,body,[[8,17],[15,13],[23,14],[33,18],[42,27],[50,28],[54,24],[47,25],[39,21],[28,14],[20,12]]);poly(c,light,[[12,12],[20,7],[29,10],[34,14],[27,13],[20,10]]);r(c,'#223741',10,16,2,2);
 }else if(['dragon','guardian','phoenix','celestial','wolf','oracle'].includes(f.shape)){
  poly(c,dark,[[6,19],[15,11],[29,10],[45,16],[60,7],[56,21],[61,32],[44,25],[31,29],[15,27]]);poly(c,body,[[8,19],[16,13],[28,12],[45,17],[48,23],[30,26],[17,24]]);
  poly(c,light,[[17,11],[16,3],[22,7],[28,2],[31,9],[38,5],[36,14]]);poly(c,light,[[24,25],[19,35],[28,32],[37,37],[36,25]]);poly(c,body,[[42,16],[58,10],[51,20],[58,29],[45,25]]);r(c,light,15,20,24,2);r(c,'#263443',12,17,3,3);r(c,light,13,16,1,1);
  if(f.shape==='guardian'){poly(c,dark,[[11,13],[8,5],[5,4],[9,2],[12,8],[17,3],[17,11]]);}
  if(f.shape==='celestial'){c.strokeStyle=light;c.lineWidth=1;c.strokeRect(14,3,26,30);r(c,light,43,8,2,2);r(c,light,55,35,2,2);}
  if(f.shape==='wolf'){poly(c,light,[[8,23],[8,30],[13,25],[15,30],[17,25]]);}
 }else{
  const kind=f.shape;const rx=['puffer','gem','beetle','prism','flower'].includes(kind)?12:wide,ry=['puffer','gem','beetle','prism','flower'].includes(kind)?12:kind==='flat'?5:tall;
  poly(c,dark,tail);poly(c,body,[[43,19],[52,13],[49,20],[53,26],[43,23]]);poly(c,dark,[[22,cy-ry+2],[27,cy-ry-6-f.anatomy.fins],[34,cy-ry+1]]);poly(c,body,[[29,cy+ry-1],[36,cy+ry+5],[38,cy+ry-1]]);
  oval(28,cy,rx,ry,dark);oval(27,cy-1,rx-1,ry-1,body);r(c,light,17,cy-ry+2,12,2);r(c,light,19,cy+ry-3,19,2);
  if(kind==='needle')poly(c,body,[[8,17],[1,20],[12,22]]);
  if(kind==='puffer'){for(let i=0;i<8;i++){const a=i*Math.PI/4;r(c,dark,28+Math.cos(a)*14,20+Math.sin(a)*14,2,2);}}
  if(kind==='catfish'||kind==='cod'){r(c,dark,6,23,13,1);r(c,dark,12,25,7,1);r(c,dark,10,19,8,1);}
  if(kind==='winged'||kind==='flower'){poly(c,light,[[22,16],[16,1],[30,7],[33,17]]);poly(c,light,[[25,24],[19,38],[34,32],[35,24]]);}
  if(kind==='angler'){r(c,dark,16,5,2,10);r(c,dark,17,4,10,2);r(c,light,25,3,4,4);}
  if(kind==='comet'){poly(c,light,[[42,17],[62,3],[55,18],[62,37],[42,24]]);}
  if(['prism','gem','armored','beetle'].includes(kind)){poly(c,light,[[19,13],[29,9],[38,17],[28,20]]);poly(c,dark,[[22,20],[32,14],[39,22],[28,30]]);}
  r(c,'#253743',12+(wide-rx),cy-3,3,3);r(c,light,12+(wide-rx),cy-3,1,1);r(c,dark,9+(wide-rx),cy+3,5,1);
 }
 // Distinct spots, stripes, scales, constellations and runes for each species.
 if(!silhouette){for(let i=0;i<4+(v%5);i++){const x=19+(i*7+v*3)%21,y=15+(i*5+v)%10;const mark=f.pattern;
  if(/stripe|band|bars|zigzag/.test(mark))r(c,dark,x,13,1+(v%2),11);
  else if(/scales|plates|armor|facets|diamonds/.test(mark))poly(c,light,[[x,y-2],[x+3,y],[x,y+2],[x-2,y]]);
  else if(/stars|sparkle|snow|runes|crystal|halo|constellation|aurora/.test(mark)){r(c,light,x-1,y,3,1);r(c,light,x,y-1,1,3);}
  else r(c,i%2?dark:light,x,y,1+(v%2),1+(i%2));}
  if(detailed){r(c,light,47,3,2,2);r(c,light,57,6,1,1);}
 }
 if(silhouette){c.globalCompositeOperation='source-in';c.fillStyle='#a4afa0';c.fillRect(0,0,64,40);}
 fishCache.set(key,out);return out;
}
export function playerArt(character=0,dir=0,frame=0,outfit={}){
 const key=[character,dir,frame,JSON.stringify(outfit)].join(':');if(playerCache.has(key))return playerCache.get(key);
 const a=CHARACTERS[character]||CHARACTERS[0],out=canvas(32,48),c=out.getContext('2d');let shirt=COSMETICS.find(x=>x.id===outfit.shirt)?.color||a.shirt;const step=frame===1?-2:frame===3?2:0;
 r(c,'#657789',10,32,5,9+step);r(c,'#52657a',17,32,5,9-step);r(c,'#4b4e52',8,40+step,8,4);r(c,'#4b4e52',17,40-step,8,4);
 r(c,'#486b6b',9,28,14,8);r(c,shirt,8,21,16,12);r(c,shirt,5,23,4,7);r(c,shirt,24,23,4,7);r(c,a.skin,5,29,4,5);r(c,a.skin,24,29,4,5);r(c,'#e4d4b2',10,32,12,1);
 r(c,a.hair,8,7,16,14);r(c,a.skin,9,11,14,11);r(c,a.skin,7,14,3,5);r(c,a.skin,22,14,3,5);r(c,a.hair,8,7,16,5);r(c,a.hair,8,11,3,6);r(c,a.hair,22,10,2,6);r(c,'#f7dbb3',11,13,9,2);
 if(dir===2){r(c,a.hair,9,10,14,11);r(c,a.hair,7,11,18,7);}else{r(c,'#343d45',dir===3?19:dir===1?10:11,16,2,2);if(dir===0)r(c,'#343d45',19,16,2,2);r(c,'#b27964',14,20,4,1);}
 if(outfit.pack&&dir===2){r(c,'#86684f',9,22,14,12);r(c,'#ba9770',10,23,12,10);r(c,'#dfc894',14,26,4,2);}
 if(outfit.hat){const col=COSMETICS.find(x=>x.id===outfit.hat)?.color||'#e4c287';r(c,'#97826c',3,9,26,3);r(c,col,4,8,24,3);r(c,col,9,3,14,6);r(c,'#aa9174',9,7,14,1);}
 playerCache.set(key,out);return out;
}
export function playerSheet(character,outfit={}){const key=character+':'+JSON.stringify(outfit);if(sheetCache.has(key))return sheetCache.get(key);const sheet=canvas(128,192),c=sheet.getContext('2d');for(let dir=0;dir<4;dir++)for(let frame=0;frame<4;frame++)c.drawImage(playerArt(character,dir,frame,outfit),frame*32,dir*48);sheetCache.set(key,sheet);return sheet;}
export function rodArt(rod){const out=canvas(64,48),c=out.getContext('2d');c.strokeStyle=rod.color;c.lineWidth=3;c.beginPath();c.moveTo(16,39);c.lineTo(44,7);c.stroke();c.strokeStyle='#f4eee2';c.lineWidth=1;c.beginPath();c.moveTo(44,7);c.quadraticCurveTo(56,19,47,34);c.stroke();r(c,'#65766d',18,32,6,5);r(c,'#cc8e77',46,33,3,4);return out;}
export function propArt(theme,type,variant=0){
 const out=canvas(128,144),c=out.getContext('2d');const forest=theme==='forest',ice=theme==='ice',mystic=theme==='mystic',desert=theme==='desert';
 if(type==='tree'){
  if(desert){r(c,'#527c69',57,42,13,58);r(c,'#6e9b73',60,43,8,57);r(c,'#527c69',40,59,17,10);r(c,'#527c69',40,42,9,22);r(c,'#527c69',70,49,15,10);r(c,'#527c69',78,35,9,21);r(c,'#a8bd80',64,46,2,48);r(c,'#a8bd80',44,47,2,13);r(c,'#d8b290',61,36,8,5);}
  else if(theme==='tropical'){
   poly(c,'#886c4b',[[54,106],[66,106],[69,78],[77,46],[67,44],[61,74]]);poly(c,'#b58a5e',[[59,104],[62,76],[71,45],[74,45],[65,83],[63,103]]);for(let y=59;y<103;y+=9)r(c,'#785d49',59+(103-y)/5,y,8,2);
   poly(c,'#4f8260',[[73,43],[92,25],[113,29],[122,47],[105,39],[85,43],[109,52],[117,69],[97,60],[78,48],[70,72],[57,85],[59,59],[34,67],[20,64],[39,47],[17,42],[25,33],[53,30]]);
   poly(c,'#72a168',[[73,39],[86,27],[106,30],[115,39],[89,35],[76,44],[101,50],[109,60],[82,50],[64,59],[60,71],[63,47],[33,55],[40,45],[58,37],[29,37],[38,33],[60,33]]);r(c,'#bfc380',70,44,6,5);r(c,'#997355',64,47,6,6);
  }else if(mystic&&variant%2===0){
   r(c,'#8c829c',57,55,12,54);r(c,'#c1b4cf',59,59,5,47);poly(c,'#635378',[[22,61],[29,37],[48,20],[78,20],[100,38],[108,61],[95,71],[35,71]]);poly(c,'#a291b7',[[26,56],[34,38],[51,24],[76,24],[96,40],[103,56]]);r(c,'#c6ddc8',37,41,8,5);r(c,'#d7c4df',69,30,7,5);r(c,'#bde1cd',82,48,10,5);r(c,'#d3bfe0',27,62,74,3);r(c,'#7f749c',48,78,28,7);r(c,'#bfe8cb',64,70,2,26);
  }else{
   r(c,'#746657',57,60,13,48);r(c,'#9a876e',60,61,4,46);
   const base=ice?'#678e93':mystic?'#6d678f':forest?'#365f51':'#4f805b';const mid=ice?'#a7c2c8':mystic?'#9690b2':forest?'#4c8460':'#77a46c';const high=ice?'#e4efea':mystic?'#c1aecf':'#8dac71';
   if(ice){poly(c,base,[[64,8],[40,42],[47,42],[29,66],[40,66],[22,89],[106,89],[89,66],[99,66],[79,42],[87,42]]);poly(c,high,[[64,8],[40,42],[64,35],[85,42]]);poly(c,high,[[54,39],[31,64],[62,57],[93,65],[72,39]]);poly(c,high,[[47,64],[26,86],[58,78],[101,88],[80,65]]);}
   else{poly(c,base,[[38,23],[56,12],[82,19],[96,37],[106,54],[99,80],[77,91],[46,88],[23,75],[21,50],[30,39]]);poly(c,mid,[[43,25],[58,17],[79,22],[94,42],[98,61],[84,74],[62,83],[38,72],[29,55]]);poly(c,high,[[43,27],[57,20],[75,25],[82,36],[74,44],[58,46],[43,38]]);r(c,high,31,51,16,5);r(c,mid,81,25,8,6);if(mystic){r(c,'#d6dac0',52,42,3,3);r(c,'#bdf4dc',84,61,3,3);r(c,'#bdf4dc',36,62,2,2);}}
  }
 }else if(type==='rock'){
  poly(c,'#6c7f80',[[44,103],[37,91],[44,76],[60,70],[80,77],[86,95],[77,105]]);poly(c,ice?'#dbe8e6':desert?'#c5a27b':mystic?'#9993b1':'#acb5a0',[[44,90],[48,77],[61,74],[78,81],[78,94],[57,98]]);r(c,ice?'#f4f5e8':'#ced0b7',49,78,18,4);
 }else if(type==='flower'){
  for(let i=0;i<4;i++){const x=50+i*7,y=98+(i%2)*4;r(c,ice?'#a6b6ba':'#688e63',x,y-10,2,12);r(c,mystic?'#cac4ec':desert?'#f1c191':ice?'#d1e3ed':variant%2?'#e9c7a2':'#d7e0aa',x-2,y-12,6,4);r(c,'#f7e4b5',x,y-11,2,2);}
 }else if(type==='secret'){
  r(c,'#705f55',50,90,28,18);r(c,'#b59969',51,90,26,15);r(c,'#d7bd80',49,89,30,5);r(c,'#826d55',63,91,3,16);r(c,'#f4d689',61,96,7,6);
 }else if(type==='sign'){
  r(c,'#856b53',61,84,5,24);r(c,'#b39a76',45,78,39,18);r(c,'#d9bc8e',46,79,37,15);r(c,'#887961',51,84,22,2);r(c,'#887961',51,89,16,2);
 }
 return out;
}
export function buildingArt(theme,type){const out=canvas(160,170),c=out.getContext('2d');const shop=type==='shop',ice=theme==='ice',desert=theme==='desert',mystic=theme==='mystic';
 if(mystic&&!shop){poly(c,'#675f7b',[[7,160],[9,95],[29,36],[61,18],[119,35],[150,89],[151,160]]);poly(c,'#9b8da9',[[13,95],[35,43],[60,27],[118,42],[138,83],[111,72],[84,48],[41,77]]);r(c,'#302e49',49,90,70,67);poly(c,'#302e49',[[49,94],[57,70],[96,61],[119,87],[119,159],[49,159]]);r(c,'#aedecb',29,82,3,7);r(c,'#d3bedb',129,97,4,9);r(c,'#8c819c',19,155,130,5);return out;}
 r(c,'#5c7262',13,58,132,105);r(c,desert?'#d5b084':ice?'#b7c6c9':mystic?'#b0a1b9':'#e5d5ae',17,67,124,90);r(c,'#b4a586',20,140,118,7);
 for(let y=85;y<145;y+=12)r(c,theme==='forest'?'#938f71':'#bfae8c',19,y,120,1);
 poly(c,'#685a53',[[7,66],[7,53],[29,19],[132,19],[153,52],[153,67]]);poly(c,ice?'#d8e8e7':desert?'#b88666':mystic?'#79778f':'#7c9e89',[[11,54],[32,23],[128,23],[149,54],[149,60],[11,60]]);
 for(let y=30;y<57;y+=7){r(c,ice?'#b2ccd2':desert?'#956f57':mystic?'#5d6080':'#57786e',27-(y-30)/1.3,y,108+(y-30)*1.5,2);}
 if(desert){c.clearRect(0,0,160,67);r(c,'#a77c5d',13,45,134,23);r(c,'#ebc893',16,48,128,15);r(c,'#f4d9a4',12,44,136,6);for(let x=20;x<147;x+=18){r(c,'#b9956b',x,34,11,15);r(c,'#e7c389',x,34,11,4);}r(c,'#b77760',22,91,32,5);r(c,'#b77760',105,91,32,5);}
 r(c,'#8b7960',68,100,30,57);r(c,'#47797b',71,105,24,27);r(c,'#f0e5bd',71,118,24,3);r(c,'#efdfb4',82,106,3,26);r(c,'#d8c093',89,139,3,3);
 for(const x of [29,108]){r(c,'#8d8065',x,99,22,25);r(c,'#719ea0',x+2,101,18,20);r(c,'#f1dfb2',x+10,100,2,23);r(c,'#f1dfb2',x,110,22,2);r(c,'#809b66',x-3,128,29,7);r(c,'#d8b896',x+2,126,6,4);}
 if(shop){r(c,'#756b55',34,69,92,25);r(c,'#eee0b8',35,70,90,21);c.fillStyle='#5c7565';c.font='bold 10px monospace';c.textAlign='center';c.fillText('MARÉ & ANZOL',80,84);r(c,'#d5ba87',54,157,58,7);r(c,'#ecce99',48,164,70,5);}
 return out;}
export function drawBoat(c,x,y,character,dir,t,outfit={}){c.save();c.translate(Math.round(x),Math.round(y+Math.sin(t*2)*2));poly(c,'#193e5160',[[-31,14],[-22,29],[23,29],[36,14],[20,5],[-19,5]]);poly(c,'#735e4d',[[-37,-4],[-24,17],[25,17],[38,-4],[22,-18],[-23,-18]]);poly(c,'#c7a477',[[-33,-4],[-22,12],[23,12],[34,-4],[21,-13],[-21,-13]]);poly(c,'#926f54',[[-26,-2],[-18,6],[18,6],[28,-2],[18,-8],[-17,-8]]);r(c,'#dec796',-24,-7,46,4);r(c,'#e1c58e',-21,7,42,3);if(character!==null){c.drawImage(playerArt(character,dir,0,outfit),-16,-44);r(c,'#c7a477',-27,6,53,5);}c.restore();}
export function clearRegionArt(){playerCache.clear();sheetCache.clear();}
