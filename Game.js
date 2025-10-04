import { WIDTH, HEIGHT, TILE, GAME_LEN, GOAL, State, clamp, aabb } from "./utils.js";
import { Farmer } from "./Farmer.js";
import { Crop } from "./Crop.js";
import { Scarecrow } from "./Scarecrow.js";
import { BotFarmer } from "./BotFarmer.js";

const CROP_TYPES = [
  { type: "wheat",   points: 1 },
  { type: "pumpkin", points: 3 },
  { type: "golden",  points: 5 },
];

const LEVELS = [
  { goal: 10, spawnEvery: 0.8 },
  { goal: 14, spawnEvery: 0.6 },
  { goal: 20, spawnEvery: 0.45 }
];

/** Central game controller: state, loop, UI. */
export class Game {
  constructor(canvas) {
    if (!canvas) { console.error("Canvas #game not found."); return; }
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.state = State.MENU;

    this.player = new Farmer(WIDTH / 2 - 17, HEIGHT - 80);
    this.bot = new BotFarmer(60, 60);
    this.crops = [];
    this.obstacles = [];

    this.lastTime = 0;
    this.timeLeft = GAME_LEN;
    this.spawnEveryBase = 0.8;
    this.spawnEvery = this.spawnEveryBase;
    this._accumSpawn = 0;

    this.levels = LEVELS;
    this.level = 0;
    this.score = 0;
    this.goal = this.levels[0].goal;
    this.spawnEveryBase = this.levels[0].spawnEvery;

    this.input = new Input(this);
    this._onResize = this.onResize.bind(this);
    window.addEventListener("resize", this._onResize);

    const get = id => document.getElementById(id) || console.error(`#${id} not found`);
    this.ui = {
      score: get("score"),
      time:  get("time"),
      goal:  get("goal"),
      status:get("status"),
      start: get("btnStart"),
      reset: get("btnReset"),
    };
    if (this.ui.goal) this.ui.goal.textContent = String(this.goal);
    if (this.ui.start) this.ui.start.addEventListener("click", () => this.start());
    if (this.ui.reset) this.ui.reset.addEventListener("click", () => this.reset());

    // Arrow function keeps lexical this.
    this.tick = (ts) => {
      const dt = Math.min((ts - this.lastTime) / 1000, 0.033);
      this.lastTime = ts;
      this.update(dt);
      this.render();
      requestAnimationFrame(this.tick);
    };
  }

  onResize() {}

  start() {
    if (this.state === State.MENU || this.state === State.GAME_OVER || this.state === State.WIN) {
      this.reset();
      this.state = State.PLAYING;
      if (this.ui.status) this.ui.status.textContent = "Playing…";
      requestAnimationFrame(this.tick);
    } else if (this.state === State.PAUSED) {
      this.state = State.PLAYING;
      if (this.ui.status) this.ui.status.textContent = "Playing…";
    }
  }

  reset() {
    this.state = State.MENU;
    this.player = new Farmer(WIDTH / 2 - 17, HEIGHT - 80);
    this.bot = new BotFarmer(60, 60);
    this.crops.length = 0;
    this.obstacles.length = 0;
    this.score = 0;
    this.timeLeft = GAME_LEN;
    this._accumSpawn = 0;
    this.lastTime = performance.now();
    this.level = 0;
    this.goal = this.levels[0].goal;
    this.spawnEveryBase = this.levels[0].spawnEvery;
    this.obstacles.push(new Scarecrow(200, 220), new Scarecrow(650, 160));
    this.syncUI();
    if (this.ui.status) this.ui.status.textContent = "Menu";
  }

  togglePause() {
    if (this.state === State.PLAYING) {
      this.state = State.PAUSED;
      if (this.ui.status) this.ui.status.textContent = "Paused";
    } else if (this.state === State.PAUSED) {
      this.state = State.PLAYING;
      if (this.ui.status) this.ui.status.textContent = "Playing…";
    }
  }

  syncUI() {
    if (this.ui.score) this.ui.score.textContent = String(this.score);
    if (this.ui.time)  this.ui.time.textContent  = Math.ceil(this.timeLeft);
    if (this.ui.goal)  this.ui.goal.textContent  = String(this.goal);
  }

  spawnCrop() {
    const gx = Math.floor(Math.random() * ((WIDTH - 2 * TILE) / TILE)) * TILE + TILE;
    const gy = Math.floor(Math.random() * ((HEIGHT - 2 * TILE) / TILE)) * TILE + TILE;
    const spec = CROP_TYPES[Math.floor(Math.random() * CROP_TYPES.length)];
    this.crops.push(new Crop(gx, gy, spec.type, spec.points));
  }

  update(dt) {
    if (this.state !== State.PLAYING) return;

    this.timeLeft = clamp(this.timeLeft - dt, 0, GAME_LEN);
    if (this.timeLeft <= 0) {
      this.state = (this.score >= this.goal && this.level === this.levels.length - 1) ? State.WIN : State.GAME_OVER;
      if (this.ui.status) this.ui.status.textContent = (this.state === State.WIN) ? "You Win!" : "Game Over";
      this.syncUI();
      return;
    }

    this.player.handleInput(this.input);
    this.player.update(dt, this);

    this.bot.handleAI(this);
    this.bot.update(dt, this);

    const progress = 1 - (this.timeLeft / GAME_LEN);
    this.spawnEvery = this.spawnEveryBase * (1 - 0.6 * progress);

    this._accumSpawn += dt;
    while (this._accumSpawn >= this.spawnEvery) {
      this._accumSpawn -= this.spawnEvery;
      this.spawnCrop();
    }

    const collected = this.crops.filter(c => aabb(this.player, c));
    if (collected.length) {
      collected.forEach(c => c.dead = true);
      this.score += collected.reduce((sum, c) => sum + (c.points || 1), 0);
      if (this.ui.score) this.ui.score.textContent = String(this.score);
      if (this.score >= this.goal) {
        if (this.level < this.levels.length - 1) {
          this.level += 1;
          this.score = 0;
          this.timeLeft = GAME_LEN;
          this.goal = this.levels[this.level].goal;
          this.spawnEveryBase = this.levels[this.level].spawnEvery;
          if (this.ui.goal) this.ui.goal.textContent = String(this.goal);
          if (this.ui.status) this.ui.status.textContent = `Level ${this.level + 1}`;
          this.obstacles.push(new Scarecrow(120 + 80 * this.level % 700, 100 + 60 * this.level % 380));
        } else {
          this.state = State.WIN;
          if (this.ui.status) this.ui.status.textContent = "You Win!";
        }
      }
    }

    this.crops.forEach(c => { if (!c.dead && aabb(this.bot, c)) c.dead = true; });

    this.crops = this.crops.filter(c => !c.dead);
    this.crops.forEach(c => c.update(dt, this));

    if (this.ui.time) this.ui.time.textContent = Math.ceil(this.timeLeft);
  }

  render() {
    const ctx = this.ctx; if (!ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#dff0d5";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeStyle = "#c7e0bd"; ctx.lineWidth = 1;
    for (let y = TILE; y < HEIGHT; y += TILE) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }
    for (let x = TILE; x < WIDTH; x += TILE) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke(); }

    this.crops.forEach(c => c.draw(ctx));
    this.obstacles.forEach(o => o.draw(ctx));
    this.bot.draw(ctx);
    this.player.draw(ctx);

    ctx.fillStyle = "#333";
    ctx.font = "16px system-ui, sans-serif";
    if (this.state === State.MENU) ctx.fillText("Press Start to play", 20, 28);
    else if (this.state === State.PAUSED) ctx.fillText("Paused (press P to resume)", 20, 28);
    else if (this.state === State.GAME_OVER) ctx.fillText("Time up! Press Reset to return to Menu", 20, 28);
    else if (this.state === State.WIN) ctx.fillText("Harvest complete! Press Reset for another round", 20, 28);
  }

  dispose() {
    this.input.dispose();
    window.removeEventListener("resize", this._onResize);
  }
}

class Input {
  constructor(game) {
    this.game = game;
    this.keys = new Set();
    this._onKeyDown = this.onKeyDown.bind(this);
    this._onKeyUp   = this.onKeyUp.bind(this);
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
  }
  onKeyDown(e) {
    if (e.key === "p" || e.key === "P") this.game.togglePause();
    this.keys.add(e.key);
  }
  onKeyUp(e) { this.keys.delete(e.key); }
  dispose() {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
  }
}
