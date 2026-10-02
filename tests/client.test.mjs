import test from 'node:test';
import assert from 'node:assert/strict';
import {FISH,RODS} from '../shared/catalog.js';
import {newProfile} from '../shared/rules.js';
import {newMini} from '../shared/minigame.js';
import {FishingSystem} from '../public/js/systems/FishingSystem.js';
import {FishSystem} from '../public/js/systems/FishSystem.js';
import {InventorySystem} from '../public/js/systems/InventorySystem.js';
import {CollectionSystem} from '../public/js/systems/CollectionSystem.js';
import {SaveSystem} from '../public/js/systems/SaveSystem.js';
test('Importador aceita diário completo e recusa inventário ou equipamento malformado',async()=>{const saves=Object.create(SaveSystem.prototype),p=newProfile('Lia',1);const file=value=>({size:500,text:async()=>JSON.stringify(value)});const valid=await saves.import(file(p));assert.equal(valid.character,1);assert.equal(valid.coins,50);await assert.rejects(saves.import(file({...p,rod:5})),/válido/);await assert.rejects(saves.import(file({...p,cosmetics:12})),/válido/);await assert.rejects(saves.import(file({...p,inventory:[{fishId:'fora-do-jogo'}]})),/válido/);});
test('A captura solo sai do minigame, anima o peixe e abre a ficha sem interromper o loop',()=>{
 let saves=0,captures=0;const g={mode:'local',profile:newProfile(),player:{held:false},save:()=>saves++,audio:{effect(){}},particles:{splash(){}},ui:{update(){},endMini(){},updateMini(s){assert.ok(s);},showCapture(c,isNew){captures++;assert.equal(c.fishId,FISH[0].id);assert.equal(isNew,true);}},networkLost:false};g.fish=new FishSystem(g);g.inventory=new InventorySystem(g);g.collection=new CollectionSystem(g);g.fishing=new FishingSystem(g);const f=g.fishing;f.state='mini';f.fish=FISH[0];f.target={x:0,y:0};f.mini=newMini(20,RODS[0],0);f.mini.progress=.99999;f.update(1/60);assert.equal(f.state,'pull');assert.equal(g.profile.totalCatches,1);assert.equal(g.inventory.items.length,1);assert.equal(saves,1);for(let i=0;i<40;i++)f.update(1/60);assert.equal(f.state,'idle');assert.equal(captures,1);
});
test('Um peixe perdido encerra o minigame e não cria captura nem dinheiro',()=>{
 const p=newProfile();let notices=0;const g={mode:'local',profile:p,player:{held:false},networkLost:false,ui:{endMini(){},notice(){notices++;},update(){},updateMini(){}}};g.fishing=new FishingSystem(g);const f=g.fishing;f.state='mini';f.fish=FISH[0];f.mini=newMini(20,RODS[0],230);f.mini.progress=.00001;f.mini.bar=.07;f.update(1/60);assert.equal(f.state,'idle');assert.equal(p.coins,50);assert.equal(p.totalCatches,0);assert.equal(notices,1);
});
