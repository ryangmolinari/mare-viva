import {awardCatch,INVENTORY_CAPACITY} from '/shared/rules.js';
export class InventorySystem {constructor(game){this.game=game;}get items(){return this.game.profile.inventory;}get full(){return this.items.length>=INVENTORY_CAPACITY;}add(c){awardCatch(this.game.profile,c);this.game.save();}equip(type,value){return this.game.action('equip',{type,value});}}
