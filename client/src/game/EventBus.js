// EventBus: lets the Phaser game and the React pages talk to each other with events.
// Phaser EMITS events (e.g. "stats-changed", "game-over"); React LISTENS and updates the page.
// React can also emit events (e.g. "restart-game") that the game listens to.
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
import Phaser from "phaser";

export const EventBus = new Phaser.Events.EventEmitter();
