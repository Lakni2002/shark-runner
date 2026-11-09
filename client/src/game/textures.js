// Draws the game pictures with code and saves them as textures (the shark, fish and seaweed are PNG sprite sheets).
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.

export const TILE_W = 480;
export const TILE_H = 720;
const OUTLINE = 0x1b2b4a;

export function makeTextures(scene, waterColor) {
  // --- Water tile for this level (scrolls). Made fresh for each level colour. ---
  const waterKey = `water-${waterColor.toString(16)}`;
  if (!scene.textures.exists(waterKey)) {
    const g = scene.add.graphics();
    g.fillStyle(waterColor);
    g.fillRect(0, 0, TILE_W, TILE_H);
    g.fillStyle(0xffffff, 0.07); // soft light stripes
    [[40, 70], [170, 50], [300, 80], [420, 40]].forEach(([x, w]) => g.fillRect(x, 0, w, TILE_H));
    g.fillStyle(0xffffff, 0.14); // tiny specks
    for (let i = 0; i < 45; i++) g.fillCircle((i * 97) % TILE_W, (i * 151) % TILE_H, (i % 3) + 1);
    g.generateTexture(waterKey, TILE_W, TILE_H);
    g.destroy();
  }

  // --- Sea mine: dark body, orange spikes, red light (56 x 56) ---
  if (!scene.textures.exists("mine")) {
    const g = scene.add.graphics();
    const c = 28;
    g.lineStyle(5, 0xff7a29, 1);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.lineBetween(c + Math.cos(a) * 14, c + Math.sin(a) * 14, c + Math.cos(a) * 25, c + Math.sin(a) * 25);
    }
    g.fillStyle(0x2b3550);
    g.fillCircle(c, c, 16);
    g.lineStyle(2.5, OUTLINE, 1);
    g.strokeCircle(c, c, 16);
    g.fillStyle(0xff4b3e);
    g.fillCircle(c, c, 5);
    g.generateTexture("mine", 56, 56);
    g.destroy();
  }

  // --- Treasure chest (52 x 42) ---
  if (!scene.textures.exists("chest")) {
    const g = scene.add.graphics();
    g.fillStyle(0xffe27a, 0.35);
    g.fillCircle(26, 22, 24); // glow
    g.lineStyle(3, 0x4a2a10, 1);
    g.fillStyle(0xa0612b);
    g.fillRoundedRect(6, 16, 40, 22, 4); // box
    g.strokeRoundedRect(6, 16, 40, 22, 4);
    g.fillStyle(0xc27a35);
    g.fillRoundedRect(6, 6, 40, 13, 6); // lid
    g.strokeRoundedRect(6, 6, 40, 13, 6);
    g.fillStyle(0xf5c451);
    g.fillRect(23, 6, 6, 32); // gold band
    g.fillRect(22, 18, 8, 8); // lock
    g.generateTexture("chest", 52, 42);
    g.destroy();
  }
}
