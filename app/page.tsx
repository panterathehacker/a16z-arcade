'use client';

import dynamic from 'next/dynamic';

const GameComponent = dynamic(() => import('../game/GameComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full min-h-[660px] text-white font-mono"
      style={{ background: '#1a0008' }}>
      <div className="text-center">
        <div className="text-2xl mb-4 animate-pulse" style={{ color: '#FFD700', fontFamily: '"Press Start 2P", monospace' }}>
          Loading a16z Arcade...
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: '#1a0008',
        backgroundImage: `
          linear-gradient(45deg, #2a0010 25%, transparent 25%),
          linear-gradient(-45deg, #2a0010 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #110005 75%),
          linear-gradient(-45deg, transparent 75%, #110005 75%)
        `,
        backgroundSize: '8px 8px',
        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
        imageRendering: 'pixelated' as const,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Retro scanline texture overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.15) 2px,
              rgba(0,0,0,0.15) 4px
            )
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Gold corner decorations */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #FFD700, transparent)', zIndex: 1 }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #FFD700, transparent)', zIndex: 1 }} />

      {/* Header */}
      <div className="mb-5 text-center" style={{ position: 'relative', zIndex: 2 }}>
        <h1
          className="mb-2 tracking-tight"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '32px',
            color: '#FFD700',
            textShadow: '0 0 20px rgba(255,215,0,0.5), 2px 2px 0px #4A0315',
          }}
        >
          a16z Arcade
        </h1>
        <p
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px',
            color: 'rgba(255,215,0,0.7)',
            textShadow: '1px 1px 0px #4A0315',
          }}
        >
          Battle the greatest minds in tech
        </p>
      </div>

      {/* Game container with gold border */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '1100px',
          border: '2px solid rgba(255,215,0,0.4)',
          borderRadius: '4px',
          boxShadow: '0 0 30px rgba(255,215,0,0.15), 0 0 60px rgba(74,3,21,0.5)',
        }}
      >
        <GameComponent />
      </div>

      {/* Controls */}
      <div
        className="mt-4 text-center hidden sm:block"
        style={{
          position: 'relative',
          zIndex: 2,
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '7px',
          lineHeight: '1.8',
          color: 'rgba(255,215,0,0.5)',
        }}
      >
        <span style={{ color: 'rgba(255,215,0,0.8)' }}>WASD / Arrow Keys</span> to move &nbsp;|&nbsp;{' '}
        <span style={{ color: 'rgba(255,215,0,0.8)' }}>SPACE</span> to interact &nbsp;|&nbsp;{' '}
        <span style={{ color: 'rgba(255,215,0,0.8)' }}>1-4 / ↑↓</span> to answer &nbsp;|&nbsp;{' '}
        <span style={{ color: 'rgba(255,215,0,0.8)' }}>C</span> for Pokédex
      </div>
    </main>
  );
}
