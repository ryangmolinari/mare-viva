import {FISH,FISH_BY_ID} from '/shared/catalog.js';
import {selectFish,makeCatch} from '/shared/rules.js';
export class FishSystem {constructor(game){this.game=game;this.catalog=FISH;}get(id){return FISH_BY_ID[id];}encounter(zone){return selectFish(this.game.profile,this.game.islands.id,zone,this.game.hour);}capture(f){return makeCatch(f);} }
