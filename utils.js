export const WIDTH = 900, HEIGHT = 540;
export const TILE = 30;
export const GAME_LEN = 60;
export const GOAL = 15;

export const State = Object.freeze({
  MENU: "MENU",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER",
  WIN: "WIN"
});

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const aabb = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
