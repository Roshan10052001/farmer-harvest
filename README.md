# README

## New Features
1. Added multiple crop types with different points (wheat = 1, pumpkin = 3, golden = 5).  
2. Introduced a Level System with three progressive levels that increase crop goals, spawn rates, and obstacles.  
3. Implemented a 4x4 sprite sheet for the farmer with walking animation in all directions.  
4. Added an AI competitor farmer that collects crops automatically.  
5. Made game difficulty configurable through an external JSON file (config.json) for goals, time limits, and spawn rates.

## How to Run the Game
1. Open the project in VS Code.  
2. Install and use the Live Server extension.  
3. Right-click on index.html and select “Open with Live Server”.  
4. The game will open in your browser and can be played directly.

## Use of Arrow Functions, this, and bind
- Arrow functions are used in callbacks such as requestAnimationFrame and forEach to preserve the lexical scope of this.  
- The bind(this) method is used for event listeners (keydown and keyup) to maintain the correct context and allow event removal with removeEventListener.  
- The keyword this refers to the current Game or Farmer instance depending on where it is used (for example, in update, render, or input handling).
