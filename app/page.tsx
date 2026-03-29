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
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ padding: 'env(safe-area-inset-top, 8px) 8px env(safe-area-inset-bottom, 8px) 8px' }}
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
      {/* Mobile desktop recommendation popup */}
      {typeof window !== 'undefined' && (
        <div
          id="mobile-hint"
          className="sm:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26, 0, 8, 0.96)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={(e) => {
            if ((e.target as HTMLElement).id === 'mobile-hint') {
              (e.target as HTMLElement).style.display = 'none';
            }
          }}
        >
          <div style={{
            border: '3px solid #FFD700',
            borderRadius: '8px',
            padding: '28px 24px',
            maxWidth: '340px',
            textAlign: 'center',
            background: '#1a0008',
            boxShadow: '0 0 30px rgba(255,215,0,0.2)',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎮</div>
            <div style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '13px',
              color: '#FFD700',
              marginBottom: '16px',
              lineHeight: 1.8,
              textShadow: '1px 1px 0 #4A0315',
            }}>
              Best on Desktop
            </div>
            <div style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '8px',
              color: 'rgba(255,215,0,0.75)',
              lineHeight: 2,
              marginBottom: '24px',
            }}>
              a16z Arcade is designed for desktop. For the best experience, play on a laptop or computer.
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('mobile-hint');
                if (el) el.style.display = 'none';
              }}
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '9px',
                background: '#4A0315',
                color: '#FFD700',
                border: '2px solid #FFD700',
                borderRadius: '4px',
                padding: '12px 24px',
                cursor: 'pointer',
                width: '100%',
                textShadow: '1px 1px 0 #000',
              }}
            >
              Play Anyway →
            </button>
          </div>
        </div>
      )}

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
