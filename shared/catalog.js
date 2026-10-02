export const RARITIES = ['Comum','Incomum','Raro','Épico','Lendário'];
export const RARITY_COLORS = ['#c7d9ca','#7fdc96','#72c8ff','#d7a1ff','#ffd675'];
export const ISLANDS = [
 {id:0,name:'Enseada do Sol',short:'Enseada',theme:'tropical',subtitle:'Onde toda boa história começa.',water:['#246c80','#348f9e','#63bcc0'],land:['#8bac60','#a2be70','#edcf92'],accent:'#ffd38c',zones:['Costa ensolarada','Lago das palmeiras','Mar aberto'],cost:0,catches:0,rod:0,secret:'A concha dourada',secretAt:[365,650]},
 {id:1,name:'Bosque da Bruma',short:'Bosque',theme:'forest',subtitle:'Rios escondidos sob um teto de folhas.',water:['#21595b','#327b72','#68ac92'],land:['#507b51','#6a995b','#a6ab79'],accent:'#abe5a4',zones:['Foz do rio','Rio e cachoeira','Correnteza profunda'],cost:220,catches:6,rod:1,secret:'O coração de musgo',secretAt:[365,650]},
 {id:2,name:'Dunas de Âmbar',short:'Dunas',theme:'desert',subtitle:'Um oásis de vida entre ruínas e areia.',water:['#326b77','#488d97','#86c8be'],land:['#d6ac70','#e8c48b','#c59061'],accent:'#ffcd82',zones:['Costa rochosa','Oásis antigo','Mar de âmbar'],cost:850,catches:18,rod:2,secret:'O selo do viajante',secretAt:[365,650]},
 {id:3,name:'Baía Boreal',short:'Boreal',theme:'ice',subtitle:'O silêncio azul guarda grandes descobertas.',water:['#355c86','#5185a4','#9bcbd7'],land:['#dbe7ed','#eef4ed','#a5becd'],accent:'#b9e9fa',zones:['Píer congelado','Buracos no gelo','Águas glaciais'],cost:2400,catches:35,rod:3,secret:'A estrela de gelo',secretAt:[365,650]},
 {id:4,name:'Arquipélago Astral',short:'Astral',theme:'mystic',subtitle:'Há coisas que só a maré revela.',water:['#37336b','#5d5794','#97a6ce'],land:['#68658e','#9493ac','#b3a8c4'],accent:'#d2b8ff',zones:['Costa violeta','Lago luminescente','Abismo astral'],cost:7200,catches:60,rod:4,secret:'O fragmento lunar',secretAt:[365,650]}
];
// Each row defines a distinct species, including its silhouette and markings.
const species = [
 [
 ['Sardinha de Coral',.08,.4,12,8,18,['#ef9e91','#fff0ce','#a95365'],'slender','stripes',0],
 ['Góbio de Areia',.12,.7,18,9,23,['#c5a570','#f5df9d','#806f55'],'round','spots',0],
 ['Lambari Solar',.06,.3,15,6,14,['#ffe484','#fff7c1','#dd9857'],'dart','band',1],
 ['Baiacu de Concha',.4,2.2,36,14,32,['#e9c799','#fff0d5','#b78976'],'puffer','spines',0],
 ['Peixe Fita Turquesa',.2,1.1,42,22,58,['#69cecd','#d6f5dc','#3b8eaa'],'ribbon','stripe',2],
 ['Badejo das Palmeiras',1.1,6.4,90,30,76,['#84b8a1','#f4dfb1','#417d7f'],'bass','spots',0],
 ['Agulha de Cristal',.7,3.6,105,42,92,['#a7e9e7','#f6ffff','#629dbe'],'needle','sparkles',2],
 ['Arraia Girassol',2,11,245,48,118,['#e3aa53','#fff0a1','#a56743'],'ray','sun',0],
 ['Cavalo-marinho Real',.3,1.2,290,18,39,['#ec917d','#ffd599','#ac5e87'],'seahorse','crown',1],
 ['Leviatã da Aurora',8,28,720,110,220,['#eaa48a','#fff2b6','#9579b8'],'dragon','runes',2]
 ],[
 ['Carpa de Musgo',.3,1.8,25,16,39,['#94ad70','#e2d69a','#47735a'],'carp','moss',1],
 ['Truta da Bruma',.2,1.4,28,17,36,['#87b9af','#dfe9c8','#566b7d'],'trout','dots',1],
 ['Bagre de Raiz',.5,2.7,32,21,46,['#a49175','#e8d8ba','#596b54'],'catfish','whiskers',0],
 ['Perca Esmeralda',.6,3.3,62,20,47,['#51bd8d','#bff1af','#326851'],'perch','bars',1],
 ['Enguia Folha',.3,2.1,75,37,89,['#b4ce65','#ecedb1','#537a58'],'eel','leaf',1],
 ['Salmão da Cascata',1.4,7.5,150,34,82,['#e09b9a','#ece4b7','#497f83'],'salmon','spots',1],
 ['Peixe Libélula',.2,1.3,165,13,29,['#7ad2ae','#d6fae8','#518baa'],'winged','wings',0],
 ['Arapaima de Jade',4,19,370,83,179,['#65aa90','#d4e199','#3a6264'],'arapaima','scales',2],
 ['Peixe Orquídea',.5,3.2,430,20,52,['#d391c5','#f5d2ec','#6f8890'],'flower','petals',1],
 ['Guardião do Rio',11,42,1100,120,280,['#7dcc95','#f7edbc','#46675c'],'guardian','antlers',2]
 ],[
 ['Douradinho de Duna',.1,.6,42,9,20,['#e5b558','#fff0a6','#a57045'],'dart','zigzag',0],
 ['Cascudo de Bronze',.4,2.3,48,15,40,['#b88658','#e8c494','#6b5a51'],'armored','plates',1],
 ['Peixe Vidro',.08,.5,45,8,19,['#abdad4','#eef1c9','#6c9b9b'],'glass','skeleton',1],
 ['Bagre do Oásis',.8,4.5,100,24,61,['#ccab8b','#ffe2b2','#857768'],'catfish','mask',1],
 ['Linguado de Areia',.6,3,110,24,54,['#e0c496','#f7e8b6','#b18b62'],'flat','freckles',0],
 ['Peixe Escaravelho',.5,2.5,235,16,39,['#5faeae','#e4c273','#4a687e'],'beetle','armor',1],
 ['Serpente de Âmbar',1.6,8,260,59,127,['#e9a452','#ffdb83','#ab6547'],'serpent','diamonds',2],
 ['Raia do Eclipse',3,15,590,62,143,['#71647b','#e9c073','#3e455d'],'ray','eclipse',2],
 ['Náutilo das Ruínas',1.1,6,670,26,66,['#dc9369','#f1d5a5','#866b85'],'nautilus','spiral',0],
 ['Fênix das Marés',6,25,1650,93,194,['#f69354','#ffeab0','#a65164'],'phoenix','flame',2]
 ],[
 ['Sardinha de Neve',.15,.9,65,12,29,['#c5dbe6','#ffffff','#728cac'],'slender','snow',0],
 ['Góbio de Geada',.25,1.5,70,13,32,['#aebedb','#eaf3ff','#697fa3'],'round','crystals',1],
 ['Truta Polar',.5,3.4,80,22,51,['#84c4d2','#eefaff','#62849a'],'trout','frost',1],
 ['Bacalhau Azul',1.2,6.8,165,34,81,['#6b9bbe','#d6ebec','#425b82'],'cod','beard',0],
 ['Enguia de Gelo',.8,4.3,180,48,110,['#a3dfe5','#edffff','#617db6'],'eel','shards',1],
 ['Peixe Prisma',.6,3.1,365,23,52,['#adc9ec','#fffbe4','#bf9ece'],'prism','facets',1],
 ['Salmão Boreal',2,12,410,47,104,['#b5a3d7','#e5f5dd','#5e8bb0'],'salmon','aurora',2],
 ['Arraia de Neve',4,21,920,71,157,['#d6e6eb','#ffffff','#8b9dc1'],'manta','snowflake',2],
 ['Lobo do Abismo',5,26,1030,77,170,['#718cae','#c2d7e9','#3c4e73'],'wolf','fangs',2],
 ['Dragão Boreal',14,62,2480,158,345,['#9bcfee','#f1fff4','#9b8dcd'],'dragon','icecrown',2]
 ],[
 ['Lambari Lunar',.2,1.2,100,13,32,['#bda3dd','#f1e4fa','#7874b0'],'dart','moons',0],
 ['Góbio de Ametista',.4,2.4,110,18,43,['#aa85cd','#e5c5ed','#5c5795'],'gem','gems',1],
 ['Peixe Lanterna',.3,1.9,105,15,36,['#6e8bae','#b5ffce','#484f82'],'angler','lantern',2],
 ['Enguia de Névoa',1,6,245,58,131,['#9da6d2','#e1ecff','#656196'],'mist','stars',1],
 ['Medusa de Cristal',.7,4.3,260,27,63,['#bfaee6','#f2dcff','#878ac3'],'jelly','tentacles',1],
 ['Peixe Cometa',1.1,7,540,37,86,['#9bdace','#efffd1','#8e91c6'],'comet','trail',0],
 ['Polvo das Estrelas',2.5,14,600,51,117,['#bf8fbd','#ead2e9','#655885'],'octopus','constellation',1],
 ['Arraia Nebulosa',6,32,1400,97,206,['#aa96d8','#dce3ff','#534b86'],'manta','nebula',2],
 ['Oráculo das Profundezas',4,23,1650,69,154,['#c795c6','#ffe5bf','#6b648f'],'oracle','eyes',1],
 ['Celacanto Celestial',22,94,4500,188,420,['#878bdf','#fcf0be','#4f487f'],'celestial','halo',2]
 ]
];
const rarityByIndex = [0,0,0,1,1,2,2,3,3,4];
const chance = [20,19,17,12,11,8,6,3.7,2.5,.8];
const shapeDescription={slender:'alongado e pequeno',round:'arredondado, com cabeça larga',dart:'fino e ágil',puffer:'inflado, com espinhos',ribbon:'comprido como uma fita',bass:'robusto, com barbatana dorsal',needle:'estreito, com focinho de agulha',ray:'achatado, com asas triangulares',seahorse:'vertical, com cauda enrolada e coroa',dragon:'alongado, com crista e nadadeiras grandes',carp:'ovalado e escamoso',trout:'fusiforme, com cauda bifurcada',catfish:'largo, com bigodes',perch:'alto, com barbatana dorsal marcada',eel:'serpenteante e flexível',salmon:'comprido e musculoso',winged:'pequeno, com barbatanas de libélula',arapaima:'grande, com escamas sobrepostas',flower:'oval, com nadadeiras em pétalas',guardian:'com cristas e galhadas',armored:'curto e protegido por placas',glass:'delicado, com marcações de esqueleto',flat:'achatado e baixo',beetle:'oval, com armadura de escaravelho',serpent:'ondulado, com crista contínua',nautilus:'com concha espiral e tentáculos',phoenix:'com nadadeiras longas em chamas',cod:'alongado, com pequeno barbilhão',prism:'angular, com facetas',manta:'largo, com asas e cauda fina',wolf:'robusto, com dentes salientes',gem:'facetado como uma gema',angler:'com antena e lanterna luminosa',mist:'ondulado, com crista translúcida',jelly:'em sino, com tentáculos finos',comet:'com cauda longa de cometa',octopus:'com cabeça arredondada e braços múltiplos',oracle:'com cristas ornamentais e olhos marcados',celestial:'com barbatanas lobadas e halo geométrico'};
export const FISH = species.flatMap((rows,island)=>rows.map((r,index)=>({
 id:`${island}-${index}`,name:r[0],island,rarity:rarityByIndex[index],
 minWeight:r[1],maxWeight:r[2],value:r[3],minSize:r[4],maxSize:r[5],
 palette:r[6],shape:r[7],pattern:r[8],zone:r[9],chance:chance[index],
 hours:index===7?[18,6]:index===6?[6,18]:null,
 difficulty:Math.min(95,20+rarityByIndex[index]*16+island*2+index%3),
 appearance:`Corpo ${shapeDescription[r[7]]}; marcação exclusiva ${r[8]}; corpo ${r[6][0]}, reflexos ${r[6][1]} e barbatanas ${r[6][2]}.`,
 // Shape parameters vary for every species, even those in the same family.
 anatomy:{body:0.65+(index%4)*.12,tail:index%4,fins:1+(index%3),eye:1+(island+index)%2,variant:island*10+index}
})));
export const FISH_BY_ID=Object.fromEntries(FISH.map(f=>[f.id,f]));
export const RODS=[
 {id:'rod-0',name:'Vara Inicial',price:0,reach:120,speed:1,resistance:1,rare:0,control:.25,color:'#cdb080',description:'Toda jornada começa com um primeiro arremesso.'},
 {id:'rod-1',name:'Vara de Madeira',price:160,reach:145,speed:1.07,resistance:1.10,rare:.04,control:.29,color:'#c69267',description:'Madeira flexível, feita na Enseada.'},
 {id:'rod-2',name:'Vara Reforçada',price:680,reach:170,speed:1.15,resistance:1.22,rare:.08,control:.33,color:'#88b9aa',description:'Um pouco mais de controle em águas novas.'},
 {id:'rod-3',name:'Vara Profissional',price:2100,reach:200,speed:1.25,resistance:1.36,rare:.14,control:.37,color:'#8fb2d1',description:'Precisão para enfrentar as correntes frias.'},
 {id:'rod-4',name:'Vara Avançada',price:6800,reach:230,speed:1.38,resistance:1.5,rare:.22,control:.40,color:'#bd9cd9',description:'Pronta para o que o horizonte esconder.'},
 {id:'rod-5',name:'Vara Lendária',price:18500,reach:260,speed:1.52,resistance:1.7,rare:.34,control:.44,color:'#edd283',description:'Forjada com histórias de todas as marés.'}
];
export const BAITS=[
 {id:'bait-0',name:'Sem isca',price:0,count:0,boost:0,tier:0,color:'#baa68e',description:'Pesca livre. Sem custo e sem bônus.'},
 {id:'bait-1',name:'Minhoca',price:18,count:10,boost:.35,tier:0,color:'#e99f9f',description:'10 usos · favorece peixes comuns.'},
 {id:'bait-2',name:'Isca Brilhante',price:80,count:10,boost:.9,tier:2,color:'#8be1db',description:'10 usos · favorece raros e lendários.'},
 {id:'bait-3',name:'Isca Especial',price:240,count:10,boost:1.5,tier:3,color:'#c9a9ed',description:'10 usos · favorece épicos e lendários.'}
];
export const COSMETICS=[
 {id:'hat-straw',name:'Chapéu de Palha',price:120,type:'hat',color:'#e7ca85'},
 {id:'hat-sailor',name:'Gorro de Marinheiro',price:360,type:'hat',color:'#e5edf0'},
 {id:'shirt-coral',name:'Camisa Coral',price:220,type:'shirt',color:'#ea957d'},
 {id:'shirt-moss',name:'Camisa de Musgo',price:220,type:'shirt',color:'#87aa7c'},
 {id:'pack',name:'Mochila do Viajante',price:480,type:'pack',color:'#b69571'}
];
export const CHARACTERS=[{id:0,name:'Sol',skin:'#dca784',hair:'#775a46',shirt:'#eeb173'}, {id:1,name:'Lia',skin:'#b87c62',hair:'#483c40',shirt:'#88b6a7'}, {id:2,name:'Nico',skin:'#f1c8a4',hair:'#ac7158',shirt:'#9bafd1'}, {id:3,name:'Íris',skin:'#855b4e',hair:'#302f40',shirt:'#bb9ac6'}];
