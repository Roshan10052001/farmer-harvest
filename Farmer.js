import { Entity } from "./Entity.js";
import { WIDTH, HEIGHT, clamp, aabb } from "./utils.js";

const farmerSprite = new Image();
farmerSprite.src = "sprites/farmer.png";

export class Farmer extends Entity {
  constructor(x, y) {
    super(x, y, 34, 34);
    this.speed = 260;
    this.vx = 0; this.vy = 0;
    this.color = "#8b5a2b";
    this.frame = 0; this.animTimer = 0; this.row = 0;
  }
  handleInput(input) {
    const L = input.keys.has("ArrowLeft"), R = input.keys.has("ArrowRight");
    const U = input.keys.has("ArrowUp"),   D = input.keys.has("ArrowDown");
    this.vx = (R - L) * this.speed;
    this.vy = (D - U) * this.speed;
  }
  update(dt, game) {
    const oldX = this.x, oldY = this.y;
    this.x = clamp(this.x + this.vx * dt, 0, WIDTH - this.w);
    this.y = clamp(this.y + this.vy * dt, 0, HEIGHT - this.h);
    if (game.obstacles.some(o => aabb(this, o))) { this.x = oldX; this.y = oldY; }

    const moving = Math.abs(this.vx) + Math.abs(this.vy) > 0;
    if (moving) {
      this.row = Math.abs(this.vx) > Math.abs(this.vy) ? (this.vx > 0 ? 2 : 1) : (this.vy > 0 ? 0 : 3);
      this.animTimer += dt;
      if (this.animTimer > 0.12) { this.animTimer = 0; this.frame = (this.frame + 1) % 4; }
    } else { this.frame = 0; }
  }
  draw(ctx) {
    const fw = 32, fh = 32;
    if (farmerSprite.complete && farmerSprite.naturalWidth) {
      const sx = this.frame * fw, sy = this.row * fh;
      ctx.drawImage(farmerSprite, sx, sy, fw, fh, this.x, this.y, this.w, this.h);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.fillStyle = "#c28e0e";
      ctx.fillRect(this.x + 4, this.y - 6, this.w - 8, 8);
      ctx.fillRect(this.x + 10, this.y - 18, this.w - 20, 12);
    }
  }
}
