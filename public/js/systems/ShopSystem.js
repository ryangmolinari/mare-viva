import {nearShop} from '/shared/world.js';
export class ShopSystem {constructor(game){this.game=game;}get nearby(){return !this.game.player.boat&&nearShop(this.game.player.x,this.game.player.y);}open(){if(!this.nearby)return this.game.ui.notice('A loja fica na vila. Siga o caminho a oeste do píer.');this.game.ui.open('shop');}buy(id){return this.game.action('buy',{id});}}
