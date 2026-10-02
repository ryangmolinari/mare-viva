import {FISH, FISH_BY_ID, RODS, BAITS, COSMETICS, ISLANDS} from './catalog.js';
export const MAX_PLAYERS=12, INVENTORY_CAPACITY=80;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function newProfile(name='Pescador',character=0){return {version:1,name:String(name).trim().slice(0,18)||'Pescador',character:clamp(Math.floor(character)||0,0,3),coins:50,rod:0,rods:[0],bait:0,baits:{1:0,2:0,3:0},inventory:[],collection:{},unlocked:[0],island:0,totalCatches:0,totalEarned:0,cosmetics:[],outfit:{},secrets:[],created:Date.now()};}
export function inHours(f,h){return !f.hours||(f.hours[0]<f.hours[1]?h>=f.hours[0]&&h<f.hours[1]:h>=f.hours[0]||h<f.hours[1]);}
export function selectFish(profile,island,zone,hour,random=Math.random){
 const candidates=FISH.filter(f=>f.island===island&&f.zone===zone&&inHours(f,hour));
 if(!candidates.length)throw Error('Nenhuma espécie disponível neste horário.');
 const rod=RODS[profile.rod],bait=BAITS[profile.bait];
 const weights=candidates.map(f=>f.chance*(1+rod.rare*f.rarity*2)*(1+(profile.bait&&f.rarity>=bait.tier?bait.boost:0)));
 let n=random()*weights.reduce((a,b)=>a+b,0);
 for(let i=0;i<candidates.length;i++){n-=weights[i];if(n<=0)return candidates[i];}return candidates.at(-1);
}
export function makeCatch(f,random=Math.random){const weight=Math.round((f.minWeight+(f.maxWeight-f.minWeight)*Math.pow(random(),1.45))*100)/100;return {uid:globalThis.crypto.randomUUID(),fishId:f.id,weight,size:Math.round(f.minSize+(f.maxSize-f.minSize)*(weight-f.minWeight)/(f.maxWeight-f.minWeight)),value:Math.round(f.value*(.75+weight/f.maxWeight*.8)),at:Date.now()};}
export function awardCatch(p,c){if(p.inventory.length>=INVENTORY_CAPACITY)throw Error('Mochila cheia. Venda peixes na loja.');const f=FISH_BY_ID[c.fishId];if(!f)throw Error('Espécie inválida.');p.inventory.push(c);const record=p.collection[f.id]||{count:0,best:0};record.count++;record.best=Math.max(record.best,c.weight);p.collection[f.id]=record;p.totalCatches++;return c;}
export function sell(p,uid){const sold=uid==='all'?p.inventory:p.inventory.filter(x=>x.uid===uid);if(!sold.length)throw Error('Selecione um peixe para vender.');const value=sold.reduce((s,x)=>s+x.value,0);p.inventory=p.inventory.filter(x=>!sold.includes(x));p.coins+=value;p.totalEarned+=value;return value;}
export function buy(p,id){let item=RODS.find(x=>x.id===id)||BAITS.find(x=>x.id===id)||COSMETICS.find(x=>x.id===id);if(!item||item.price<=0)throw Error('Item inválido.');if(id.startsWith('rod-')&&p.rods.includes(+id.slice(4)))throw Error('Esta vara já é sua.');if(COSMETICS.includes(item)&&p.cosmetics.includes(id))throw Error('Este item já é seu.');if(p.coins<item.price)throw Error('Moedas insuficientes.');p.coins-=item.price;if(id.startsWith('rod-')){p.rod=+id.slice(4);p.rods.push(p.rod);}else if(id.startsWith('bait-')){const i=+id.slice(5);p.baits[i]=(p.baits[i]||0)+item.count;p.bait=i;}else {p.cosmetics.push(id);p.outfit[item.type]=id;}return item;}
export function equip(p,type,value){if(type==='rod'&&p.rods.includes(value)){p.rod=value;return;}if(type==='bait'&&(value===0||(value>=1&&value<=3&&p.baits[value]>0))){p.bait=value;return;}if(type==='outfit'&&p.cosmetics.includes(value)){const c=COSMETICS.find(x=>x.id===value);p.outfit[c.type]=value;return;}throw Error('Equipamento indisponível.');}
export function unlock(p,id){const i=ISLANDS[id];if(!i||id===0)throw Error('Rota inválida.');if(p.unlocked.includes(id))return i;if(!p.unlocked.includes(id-1)||p.totalCatches<i.catches||p.rod<i.rod)throw Error(`Requer ${i.catches} capturas, ${RODS[i.rod].name} equipada e a ilha anterior.`);if(p.coins<i.cost)throw Error('Moedas insuficientes para a licença.');p.coins-=i.cost;p.unlocked.push(id);return i;}
export function discoverSecret(p,id){if(p.secrets.includes(id))throw Error('Este segredo já foi descoberto.');p.secrets.push(id);const value=80+id*160;p.coins+=value;return value;}
export function worldHour(now=Date.now()){return (8+now/60000)%24;}
