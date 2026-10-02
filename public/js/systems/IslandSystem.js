import {ISLANDS} from '/shared/catalog.js';
import {TILE,WIDTH,HEIGHT,tileAt,createProps} from '/shared/world.js';
import {clearRegionArt} from '../art.js';
export class IslandSystem {
 constructor(game){this.game=game;this.id=0;this.load(0);}
 get current(){return ISLANDS[this.id];}
 load(id){if(!ISLANDS[id])return;this.id=id;this.props=createProps(id);this.tiles=new Uint8Array(WIDTH/TILE*HEIGHT/TILE);this.types=['water','grass','grass2','sand','path','dock','bridge','dune','snow','ice'];for(let y=0;y<HEIGHT/TILE;y++)for(let x=0;x<WIDTH/TILE;x++)this.tiles[y*(WIDTH/TILE)+x]=this.types.indexOf(tileAt(id,x*TILE,y*TILE));clearRegionArt();this.game.renderer?.loadRegion();this.game.particles?.clear();}
 async transition(id){const el=document.getElementById('transition');el.querySelector('span').textContent=ISLANDS[id].name;el.classList.add('visible');this.game.transitioning=true;await new Promise(r=>setTimeout(r,450));this.load(id);this.game.profile.island=id;this.game.renderer.camera.x=1100;this.game.renderer.camera.y=580;this.game.save();await new Promise(r=>setTimeout(r,250));el.classList.remove('visible');this.game.transitioning=false;this.game.ui.update(true);this.game.audio.island(id);}
}
