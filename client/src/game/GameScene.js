
import Phaser from "phaser";
import { EventBus } from "./EventBus";
import { makeTextures } from "./textures";
import { RULES } from "../config/levels";

export const WIDTH = 480;
export const HEIGHT = 720;

// ---- Movement and difficulty settings (easy to tweak) ----
const SPEED_STEP = 14; // river gets this much faster every 75 m (pixels per second)
const MAX_SPEED = 520;
const SLOW_DOWN = 0.9; // a solved treasure puzzle multiplies the speed by this
const SHARK_SPEED = 360; // how fast the player can move the shark (pixels per second)
const SHARK_TOP = HEIGHT * 0.45; // the shark can't swim higher than this
const SPAWN_EVERY = 850; // ms between new fish or mines
const PIXELS_PER_METRE = 20;
const SAFE_TIME = 1500; // ms the shark can't be hurt after hitting a mine
const SEAWEED_EVERY_PX = 420; // a new seaweed patch after this much scrolling (decoration only)

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  // Phaser calls init() with the data we pass when starting the scene: { level }
  init(data) {
    this.level = data.level;
  }

  preload() {
    this.load.spritesheet("shark", "/assets/game/shark-sheet.png", { frameWidth: 160, frameHeight: 230 });
    this.load.spritesheet("fish", "/assets/game/fish-sheet.png", { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet("seaweed", "/assets/game/seaweed-sheet.png", { frameWidth: 130, frameHeight: 190 });
  }

  create() {
    makeTextures(this, this.level.waterColor);

    // ---- Game state ----
    this.speed = this.level.startSpeed;
    this.score = 0;
    this.lives = RULES.lives;
    this.fishEaten = 0;
    this.fishSinceChest = 0;
    this.chestOnScreen = false;
    this.distancePx = 0;
    this.nextSpeedUpAt = RULES.speedUpEveryMetres;
    this.secondChanceUsed = false;
    this.safeUntil = 0;
    this.finished = false;

    // ---- Scrolling water ----
    this.water = this.add.tileSprite(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, `water-${this.level.waterColor.toString(16)}`);

    // ---- Seaweed: decoration only (no physics, no collisions), scrolls with the water ----
    this.seaweed = this.add.group();
    this.nextSeaweedAt = 0;
    for (let y = 80; y < HEIGHT; y += 300) this.addSeaweed(y); // some already on screen at the start

    // ---- Groups of things floating down ----
    this.fishGroup = this.physics.add.group();
    this.mineGroup = this.physics.add.group();
    this.chestGroup = this.physics.add.group();

    // ---- The shark (animated sprite sheet) ----
    if (!this.anims.exists("swim")) {
      this.anims.create({
        key: "swim",
        frames: this.anims.generateFrameNumbers("shark", { start: 0, end: 7 }),
        frameRate: 12,
        repeat: -1,
      });
    }
    if (!this.anims.exists("fish-swim")) {
      this.anims.create({ key: "fish-swim", frames: this.anims.generateFrameNumbers("fish", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
    }
    if (!this.anims.exists("seaweed-sway")) {
      this.anims.create({ key: "seaweed-sway", frames: this.anims.generateFrameNumbers("seaweed", { start: 0, end: 3 }), frameRate: 4, yoyo: true, repeat: -1 });
    }
    this.shark = this.physics.add.sprite(WIDTH / 2, HEIGHT - 110, "shark").setScale(0.5).setDepth(5);
    this.shark.play("swim");
    this.shark.body.setSize(70, 170); // hit box smaller than the picture (fins don't count)

    // ---- Collisions: "when the shark touches X, run this function" ----
    this.physics.add.overlap(this.shark, this.fishGroup, this.eatFish, null, this);
    this.physics.add.overlap(this.shark, this.mineGroup, this.hitMine, null, this);
    this.physics.add.overlap(this.shark, this.chestGroup, this.collectChest, null, this);

    // ---- Timer EVENT: a new fish or mine every SPAWN_EVERY ms ----
    this.time.addEvent({ delay: SPAWN_EVERY, loop: true, callback: this.spawnObject, callbackScope: this });

    // ---- Input: arrow keys / WASD, or drag on touch screens ----
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
    this.dragTarget = null;
    this.input.on("pointerdown", (p) => (this.dragTarget = { x: p.x, y: p.y }));
    this.input.on("pointermove", (p) => { if (p.isDown) this.dragTarget = { x: p.x, y: p.y }; });
    this.input.on("pointerup", () => (this.dragTarget = null));

    // ---- Listen to React (and stop listening when this scene ends) ----
    const listeners = {
      "puzzle-result": (result) => this.applyPuzzleResult(result),
      "pause-game": () => this.scene.pause(),
      "resume-game": () => this.scene.resume(),
      "restart-game": () => this.scene.restart({ level: this.level }),
    };
    Object.entries(listeners).forEach(([name, fn]) => EventBus.on(name, fn));
    const stopListening = () => Object.entries(listeners).forEach(([name, fn]) => EventBus.off(name, fn));
    this.events.once("shutdown", stopListening);
    this.events.once("destroy", stopListening);

    this.sendStats();
  }

  update(time, delta) {
    if (this.finished) return;
    const dt = delta / 1000;

    // 1. Scroll the water and count the distance
    this.water.tilePositionY -= this.speed * dt;
    this.distancePx += this.speed * dt;
    this.moveSeaweed(this.speed * dt);
    const metres = this.distancePx / PIXELS_PER_METRE;

    // 2. Every 75 m → faster
    if (metres >= this.nextSpeedUpAt) {
      this.nextSpeedUpAt += RULES.speedUpEveryMetres;
      this.setSpeed(this.speed + SPEED_STEP);
      this.popText(WIDTH / 2, 140, "Faster!", "#F5C451");
    }

    // 3. Move the shark
    this.moveShark(dt);

    // 4. Reached the gate → level complete
    if (metres >= this.level.targetMetres) {
      this.finishLevel();
      return;
    }

    // 5. Remove things that floated off the bottom
    [this.fishGroup, this.mineGroup, this.chestGroup].forEach((group) =>
      group.getChildren().forEach((obj) => {
        if (obj.y > HEIGHT + 60) {
          if (group === this.chestGroup) this.chestOnScreen = false; // missed the chest
          obj.destroy();
        }
      })
    );

    // 6. Tell React the numbers ~10 times a second
    if (time - (this.lastStatsAt || 0) > 100) {
      this.lastStatsAt = time;
      this.sendStats();
    }
  }

  moveShark(dt) {
    let vx = 0;
    let vy = 0;
    if (this.dragTarget) {
      vx = Phaser.Math.Clamp((this.dragTarget.x - this.shark.x) * 6, -SHARK_SPEED, SHARK_SPEED);
      vy = Phaser.Math.Clamp((this.dragTarget.y - this.shark.y) * 6, -SHARK_SPEED, SHARK_SPEED);
    } else {
      if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -SHARK_SPEED;
      if (this.cursors.right.isDown || this.wasd.D.isDown) vx = SHARK_SPEED;
      if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -SHARK_SPEED;
      if (this.cursors.down.isDown || this.wasd.S.isDown) vy = SHARK_SPEED;
    }
    this.shark.x = Phaser.Math.Clamp(this.shark.x + vx * dt, 36, WIDTH - 36);
    this.shark.y = Phaser.Math.Clamp(this.shark.y + vy * dt, SHARK_TOP, HEIGHT - 70);
    this.shark.angle = Phaser.Math.Linear(this.shark.angle, (vx / SHARK_SPEED) * 14, 0.2); // lean when turning
  }

  // ---- Spawning ----
  spawnObject() {
    if (this.finished) return;
    const x = Phaser.Math.Between(40, WIDTH - 40);
    const isMine = Math.random() < this.level.mineChance;

    if (isMine) {
      const mine = this.mineGroup.create(x, -40, "mine").setDepth(3);
      mine.body.setVelocityY(this.speed);
      mine.body.setCircle(16, 12, 12); // only the body hurts, not the spikes
      this.tweens.add({ targets: mine, angle: 360, duration: 6000, repeat: -1 }); // slow spin
    } else {
      const fish = this.fishGroup.create(x, -50, "fish").setScale(0.7).setDepth(3);
      fish.body.setVelocityY(this.speed);
      fish.body.setCircle(30, 18, 18); // hit area = the fish, not the whole bubble
      fish.play({ key: "fish-swim", startFrame: Phaser.Math.Between(0, 7) }); // tail wiggles
      // swims a little from side to side
      const drift = Phaser.Math.Between(12, 24) * (Math.random() < 0.5 ? -1 : 1);
      const toX = Phaser.Math.Clamp(x + drift, 40, WIDTH - 40);
      this.tweens.add({ targets: fish, x: toX, angle: drift > 0 ? 8 : -8, duration: Phaser.Math.Between(700, 1000), ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    }
  }

  spawnChest() {
    this.chestOnScreen = true;
    const chest = this.chestGroup.create(Phaser.Math.Between(60, WIDTH - 60), -40, "chest").setDepth(3);
    chest.body.setVelocityY(this.speed);
    this.tweens.add({ targets: chest, scale: { from: 1, to: 1.12 }, duration: 400, yoyo: true, repeat: -1 });
  }

  // ---- Seaweed (decoration) ----
  addSeaweed(y) {
    const leftSide = this.seaweed.getLength() % 2 === 0; // left, right, left, right…
    const x = leftSide ? Phaser.Math.Between(40, 170) : Phaser.Math.Between(WIDTH - 170, WIDTH - 40);
    const patch = this.add.sprite(x, y, "seaweed").setDepth(1).setAlpha(0.9).setScale(Phaser.Math.FloatBetween(0.8, 1.05));
    patch.setFlipX(Math.random() < 0.5);
    patch.play({ key: "seaweed-sway", startFrame: Phaser.Math.Between(0, 3) });
    this.seaweed.add(patch);
  }

  moveSeaweed(pixels) {
    this.seaweed.getChildren().forEach((patch) => {
      patch.y += pixels;
      if (patch.y > HEIGHT + 120) patch.destroy();
    });
    this.nextSeaweedAt -= pixels;
    if (this.nextSeaweedAt <= 0) {
      this.addSeaweed(-110);
      this.nextSeaweedAt = SEAWEED_EVERY_PX + Phaser.Math.Between(-80, 120);
    }
  }

  // ---- Collisions ----
  eatFish(shark, fish) {
    fish.destroy();
    this.score += RULES.fishPoints;
    this.fishEaten += 1;
    this.fishSinceChest += 1;
    this.popText(fish.x, fish.y, `+${RULES.fishPoints}`, "#3FD0C9");

    // After every 5 fish → a treasure chest
    if (this.fishSinceChest >= RULES.fishPerChest && !this.chestOnScreen) {
      this.fishSinceChest = 0;
      this.spawnChest();
    }
    this.sendStats();
  }

  collectChest(shark, chest) {
    chest.destroy();
    this.chestOnScreen = false;
    this.scene.pause(); // freeze the game while the puzzle is open
    EventBus.emit("chest-collected"); // React opens the Treasure Puzzle
  }

  hitMine(shark, mine) {
    if (this.time.now < this.safeUntil) return; // still blinking from the last hit
    mine.destroy();
    this.lives -= 1;
    this.cameras.main.shake(250, 0.01);
    this.sendStats();

    if (this.lives > 0) {
      this.makeSafe(SAFE_TIME);
      return;
    }

    // No lives left
    if (!this.secondChanceUsed) {
      this.scene.pause();
      EventBus.emit("out-of-lives"); // React opens the Second Chance puzzle
    } else {
      this.gameOver();
    }
  }

  // ---- React tells us the puzzle result ----
  applyPuzzleResult({ mode, correct }) {
    if (mode === "treasure") {
      if (correct) {
        this.score += RULES.chestPoints;
        this.setSpeed(Math.max(this.level.startSpeed, this.speed * SLOW_DOWN));
        this.popText(this.shark.x, this.shark.y - 60, `+${RULES.chestPoints}`, "#F5C451");
      }
      this.sendStats();
      this.scene.resume();
    }

    if (mode === "second-chance") {
      this.secondChanceUsed = true;
      if (correct) {
        this.lives = 1;
        this.mineGroup.getChildren().forEach((m) => { // clear mines near the shark
          if (Phaser.Math.Distance.Between(m.x, m.y, this.shark.x, this.shark.y) < 160) m.destroy();
        });
        this.makeSafe(2000);
        this.sendStats();
        this.scene.resume();
      } else {
        this.scene.resume();
        this.gameOver();
      }
    }
  }

  // ---- Helpers ----
  makeSafe(ms) {
    this.safeUntil = this.time.now + ms;
    this.tweens.add({ targets: this.shark, alpha: 0.3, duration: 120, yoyo: true, repeat: Math.floor(ms / 240) - 1, onComplete: () => this.shark.setAlpha(1) });
  }

  setSpeed(newSpeed) {
    this.speed = Math.min(newSpeed, MAX_SPEED);
    [this.fishGroup, this.mineGroup, this.chestGroup].forEach((group) =>
      group.getChildren().forEach((obj) => obj.body.setVelocityY(this.speed))
    );
    this.shark.anims.timeScale = this.speed / this.level.startSpeed; // tail swishes faster
  }

  stopEverything() {
    this.finished = true;
    this.physics.pause();
    this.time.removeAllEvents();
    this.shark.anims.pause();
  }

  finishLevel() {
    this.stopEverything();
    this.sendStats();
    EventBus.emit("level-complete", { ...this.getStats(), stars: Math.max(1, this.lives) });
  }

  gameOver() {
    this.stopEverything();
    this.shark.setTint(0xff6a4d);
    this.sendStats();
    this.time.delayedCall(400, () => EventBus.emit("game-over", this.getStats()));
  }

  popText(x, y, words, color) {
    const t = this.add
      .text(x, y, words, { fontFamily: "Lilita One, Arial Black, sans-serif", fontSize: "26px", color, stroke: "#1b2b4a", strokeThickness: 6 })
      .setOrigin(0.5)
      .setDepth(10);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  getStats() {
    return {
      score: this.score,
      lives: this.lives,
      fish: this.fishEaten,
      fishSinceChest: this.fishSinceChest,
      distance: Math.min(Math.floor(this.distancePx / PIXELS_PER_METRE), this.level.targetMetres),
      speed: (this.speed / this.level.startSpeed).toFixed(1),
    };
  }

  sendStats() {
    EventBus.emit("stats-changed", this.getStats());
  }
}
