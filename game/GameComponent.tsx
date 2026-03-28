'use client';

import { useEffect, useRef } from 'react';

export default function GameComponent() {
  const gameRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const phaserGameRef = useRef<any>(null);

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;

    const initGame = async () => {
      const Phaser = await import('phaser');
      const { BootScene } = await import('./scenes/BootScene');
      const { WorldScene } = await import('./scenes/WorldScene');
      const { BattleScene } = await import('./scenes/BattleScene');

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameRef.current!,
        backgroundColor: '#78C850',
        scene: [BootScene, WorldScene, BattleScene],
        pixelArt: true,
        antialias: false,
        roundPixels: true,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: 800,
          height: 600,
        },
      };

      phaserGameRef.current = new Phaser.Game(config);
    };

    initGame().catch(console.error);

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={gameRef}
      style={{
        width: '800px',
        height: '600px',
        maxWidth: '100%',
        margin: '0 auto',
        display: 'block',
        imageRendering: 'pixelated',
      }}
    />
  );
}
