import { Farmer } from "./Farmer.js";

export class BotFarmer extends Farmer {
  constructor(x, y) { super(x, y); this.color = "#4b6cb7"; }
  handleAI(game) {
    if (!game.crops.length) { this.vx = 0; this.vy = 0; return; }
    let best=null, bd=Infinity, cx=this.x+this.w/2, cy=this.y+this.h/2;
    for (const c of game.crops) {
      const dx=c.x+c.w/2-cx, dy=c.y+c.h/2-cy, d=Math.hypot(dx,dy);
      if (d<bd) { bd=d; best={dx,dy}; }
    }
    if (!best) { this.vx=0; this.vy=0; return; }
    const s=this.speed, ax=Math.abs(best.dx), ay=Math.abs(best.dy);
    this.vx = (best.dx>0? s:-s) * (ax>=ay?1:0);
    this.vy = (best.dy>0? s:-s) * (ay> ax?1:0);
  }
}
