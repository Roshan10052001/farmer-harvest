/** Base entity. */
export class Entity {
  constructor(x, y, w, h) { this.x = x; this.y = y; this.w = w; this.h = h; this.dead = false; }
  update(dt, game) {}
  draw(ctx) {}
}
