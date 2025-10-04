import { Game } from "./Game.js";
const canvas = document.getElementById("game");
const game = new Game(canvas);

// optional config
(async () => {
  try {
    const res = await fetch("config.json");
    if (!res.ok) return;
    const cfg = await res.json();
    if (typeof cfg.timeLimit === "number") game.timeLeft = cfg.timeLimit;
    if (Array.isArray(cfg.levels) && cfg.levels.length) {
      game.levels = cfg.levels;
      game.level = 0;
      game.goal = game.levels[0].goal ?? game.goal;
      game.spawnEveryBase = game.levels[0].spawnEvery ?? game.spawnEveryBase;
      game.syncUI();
    }
  } catch {}
})();
