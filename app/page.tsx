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
      className="min-h-screen flex flex-col items-center"
      style={{
        padding: 'env(safe-area-inset-top, 12px) 8px 8px 8px',
        paddingTop: 'max(env(safe-area-inset-top), 12px)',
        justifyContent: 'flex-start',
        paddingBottom: '8px',
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
      {typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '') && (
        <div
          id="mobile-hint"
          className="sm:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26, 0, 8, 0.96)',
            zIndex: 99999,
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
            fontSize: 'clamp(7px, 1.5vw, 11px)',
            color: 'rgba(255,215,0,0.7)',
            textShadow: '1px 1px 0px #4A0315',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Learn from the best, one battle at a time.
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

      {/* Info panel - LennyRPG style */}
      <div
        className="mt-4 w-full hidden sm:block"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1100px',
          background: '#110005',
          border: '2px solid rgba(255,215,0,0.4)',
          borderRadius: '4px',
          padding: '20px 28px',
          display: 'grid',
          gridTemplateColumns: '1fr 1px 1fr',
          gap: '0',
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        {/* Left: How to Play */}
        <div style={{ paddingRight: '24px' }}>
          <div style={{ color: '#FFD700', fontSize: '10px', marginBottom: '16px', textShadow: '1px 1px 0 #4A0315' }}>
            How to Play:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              ['🕹', 'Arrow Keys or WASD to move'],
              ['👾', 'Walk near guests to battle'],
              ['⌨', 'Press 1-4 or ↑↓ + Enter to answer'],
              ['📖', 'Press C to view collection'],
            ].map(([icon, text]) => (
              <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,215,0,0.75)', fontSize: '7px', lineHeight: 1.8 }}>
                <span style={{ fontSize: '14px', minWidth: '20px' }}>{icon}</span>
                <span>{text as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ background: 'rgba(255,215,0,0.2)', margin: '0 4px' }} />

        {/* Right: About */}
        <div style={{ paddingLeft: '24px' }}>
          <div style={{ color: '#FFD700', fontSize: '10px', marginBottom: '16px', textShadow: '1px 1px 0 #4A0315' }}>
            About this game:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '7px', color: 'rgba(255,215,0,0.75)' }}>
              <span>Inspired by</span>
              <span style={{ color: '#FFD700' }}>the a16z Show</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '7px', color: 'rgba(255,215,0,0.75)' }}>
              <span>Made by</span>
              <img
                src="/assets/sprites/player-male/front.png"
                alt="David"
                style={{ width: '20px', height: '20px', imageRendering: 'pixelated', borderRadius: '2px' }}
              />
              <a
                href="https://x.com/davidpantera_"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#FFD700', textDecoration: 'none', borderBottom: '1px solid rgba(255,215,0,0.4)' }}
              >
                David Pantera
              </a>
              <span style={{ color: 'rgba(255,215,0,0.4)' }}>◆</span>
              <a
                href="https://github.com/panterathehacker/a16z-arcade"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgba(255,215,0,0.8)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>⭐</span> GitHub
              </a>
            </div>
            <div style={{ fontSize: '6px', color: 'rgba(255,215,0,0.4)', lineHeight: 2, marginTop: '4px' }}>
              Fan project. Not affiliated with a16z.<br />Some art is AI-generated.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
