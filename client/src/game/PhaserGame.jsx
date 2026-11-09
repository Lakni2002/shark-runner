// React component that starts the Phaser game for one level inside a <div>.
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { GameScene, WIDTH, HEIGHT } from "./GameScene";

export default function PhaserGame({ level }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: "#0B2540",
      physics: { default: "arcade", arcade: { debug: false } }, // debug: true shows hit boxes
      scale: {
        mode: Phaser.Scale.FIT, // keep the 480 x 720 shape and zoom to fit the box
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: WIDTH,
        height: HEIGHT,
      },
    });

    // Start the scene and give it the chosen level (GameScene.init receives { level })
    game.scene.add("GameScene", GameScene, true, { level });

    return () => game.destroy(true); // only one game ever runs
  }, [level]);

  return <div ref={containerRef} className="h-full w-full" />;
}
