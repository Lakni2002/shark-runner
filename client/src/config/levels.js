
export const LEVELS = [
  {
    id: 1,
    name: "Shallow Reef",
    accent: "#ff8fb1", // colour used for this level's badge
    description: "Diving into the colorful reef",
    targetMetres: 500,
    background: "/assets/game/levels/shallow-reef.png", // page background (from Figma)
    waterColor: 0x3a92e0, // colour of the water inside the game
    startSpeed: 200, // pixels per second
    mineChance: 0.35, // 35% of new objects are mines
  },
  {
    id: 2,
    name: "Kelp Forest",
    accent: "#5ee35b", // colour used for this level's badge
    description: "Reaching the kelp forest",
    targetMetres: 800,
    background: "/assets/game/levels/kelp-forest.png",
    waterColor: 0x2f9a8f,
    startSpeed: 220,
    mineChance: 0.4,
  },
  {
    id: 3,
    name: "Shipwreck",
    accent: "#ff9f1c", // colour used for this level's badge
    description: "Explore the sunken ship",
    targetMetres: 1200,
    background: "/assets/game/levels/shipwreck.png",
    waterColor: 0x2b6a9a,
    startSpeed: 240,
    mineChance: 0.45,
  },
  {
    id: 4,
    name: "Deep Trench",
    accent: "#8f9bff", // colour used for this level's badge
    description: "Reach the deep ocean",
    targetMetres: 1800,
    background: "/assets/game/levels/deep-trench.png",
    waterColor: 0x1d4a7a,
    startSpeed: 260,
    mineChance: 0.5,
  },
];

// Rules shared by every level
export const RULES = {
  fishPoints: 10,
  chestPoints: 50,
  fishPerChest: 5, // a treasure chest appears after every 5 fish
  speedUpEveryMetres: 75,
  lives: 3,
};
