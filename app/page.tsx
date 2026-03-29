'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

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

interface PlayerStats {
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
}

const DEFAULT_STATS: PlayerStats = { level: 1, xp: 0, xpToNext: 200, hp: 100, maxHp: 100 };

export default function Home() {
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);
  const [captured, setCaptured] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    // Load initial stats
    const loadStats = () => {
      try {
        const raw = localStorage.getItem('a16z_player_stats');
        if (raw) setStats(JSON.parse(raw));
        const cap: string[] = JSON.parse(localStorage.getItem('a16z_captured') || '[]');
        setCaptured(cap.length);
      } catch (_) { /* */ }
    };
    loadStats();

    // Listen for stats updates from BattleScene
    const onStatsUpdate = (e: Event) => {
      const detail = (e as CustomEvent<PlayerStats>).detail;
      if (detail) setStats(detail);
      // Also refresh captured count
      try {
        const cap: string[] = JSON.parse(localStorage.getItem('a16z_captured') || '[]');
        setCaptured(cap.length);
      } catch (_) { /* */ }
    };
    window.addEventListener('player-stats-updated', onStatsUpdate);
    return () => window.removeEventListener('player-stats-updated', onStatsUpdate);
  }, []);

  const xpPercent = Math.min(100, Math.round((stats.xp / stats.xpToNext) * 100));
  const hpPercent = Math.min(100, Math.round((stats.hp / stats.maxHp) * 100));

  const linkStyle = (id: string) => ({
    color: '#FFD700',
    textDecoration: 'none',
    transition: 'transform 0.1s, color 0.1s, opacity 0.1s',
    display: 'inline-block',
    transform: hoveredLink === id ? 'scale(1.08) translateY(-1px)' : 'scale(1)',
    opacity: hoveredLink === id ? 1 : 0.85,
  });

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

      {/* Game row: stats panel (desktop) + canvas */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '1300px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        {/* Left stats panel — desktop only */}
        <div className="hidden lg:flex flex-col mr-4" style={{
          width: '180px',
          minWidth: '180px',
          background: '#1a0008',
          border: '2px solid #FFD700',
          borderRadius: '4px',
          padding: '16px',
          fontFamily: '"Press Start 2P", monospace',
          alignSelf: 'flex-start',
        }}>
          <div style={{ color: '#FFD700', fontSize: '9px', marginBottom: '12px', letterSpacing: '1px' }}>
            LEVEL {stats.level}
          </div>

          {/* XP Bar */}
          <div style={{ fontSize: '7px', color: 'rgba(255,215,0,0.6)', marginBottom: '4px' }}>
            {stats.xp}/{stats.xpToNext} XP
          </div>
          <div style={{ background: '#2a0010', height: '6px', borderRadius: '2px', marginBottom: '12px', overflow: 'hidden' }}>
            <div style={{
              background: '#FFD700',
              height: '100%',
              width: `${xpPercent}%`,
              borderRadius: '2px',
              transition: 'width 0.4s ease',
            }} />
          </div>

          {/* HP Bar */}
          <div style={{ color: 'rgba(255,215,0,0.8)', fontSize: '9px', marginBottom: '4px' }}>HP</div>
          <div style={{ background: '#2a0010', height: '6px', borderRadius: '2px', marginBottom: '4px', overflow: 'hidden' }}>
            <div style={{
              background: hpPercent > 50 ? '#22cc44' : hpPercent > 25 ? '#D8C040' : '#D84040',
              height: '100%',
              width: `${hpPercent}%`,
              borderRadius: '2px',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ color: '#FFD700', fontSize: '11px', fontWeight: 'bold', marginBottom: '16px' }}>
            {stats.hp}/{stats.maxHp}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,215,0,0.2)', marginBottom: '12px' }} />

          {/* Captured */}
          <div style={{ color: '#FFD700', fontSize: '8px', marginBottom: '6px', letterSpacing: '1px' }}>CAPTURED</div>
          <div style={{ color: 'rgba(255,215,0,0.9)', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
            {captured}/25
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,215,0,0.2)', marginTop: '12px', marginBottom: '12px' }} />

          {/* Controls reminder */}
          <div style={{ fontSize: '6px', color: 'rgba(255,215,0,0.5)', lineHeight: 2.2 }}>
            <div>WASD / ↑↓←→</div>
            <div>SPACE: battle</div>
            <div>1-4: answer</div>
            <div>C: collection</div>
          </div>
        </div>

        {/* Game canvas */}
        <div
          style={{
            flex: 1,
            maxWidth: '1100px',
            minWidth: 0,
            border: '2px solid rgba(255,215,0,0.4)',
            borderRadius: '4px',
            boxShadow: '0 0 30px rgba(255,215,0,0.15), 0 0 60px rgba(74,3,21,0.5)',
          }}
        >
          <GameComponent />
        </div>
      </div>

      {/* Info panel - LennyRPG style */}
      <div
        className="mt-4 w-full hidden sm:block"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1300px',
          background: '#110005',
          border: '2px solid rgba(255,215,0,0.4)',
          borderRadius: '4px',
          padding: '14px 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1px 1fr',
          gap: '0',
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        {/* Left: How to Play */}
        <div style={{ paddingRight: '20px' }}>
          <div style={{ color: '#FFD700', fontSize: '11px', marginBottom: '12px', textShadow: '1px 1px 0 #4A0315' }}>
            How to Play:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['🕹', 'Arrow Keys or WASD to move'],
              ['👾', 'Walk near guests to battle'],
              ['⌨', 'Press 1-4 or ↑↓ + Enter to answer'],
              ['📖', 'Press C to view collection'],
            ].map(([icon, text]) => (
              <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,215,0,0.75)', fontSize: '9px', lineHeight: 1.7 }}>
                <span style={{ fontSize: '14px', minWidth: '20px' }}>{icon}</span>
                <span>{text as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ background: 'rgba(255,215,0,0.2)', margin: '0 4px' }} />

        {/* Right: About */}
        <div style={{ paddingLeft: '20px' }}>
          <div style={{ color: '#FFD700', fontSize: '11px', marginBottom: '12px', textShadow: '1px 1px 0 #4A0315' }}>
            About this game:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9px', color: 'rgba(255,215,0,0.75)' }}>
              <span>Inspired by</span>
              <span style={{ position: 'relative', cursor: 'pointer' }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <a
                  href="https://www.youtube.com/@a16z/videos"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkStyle('a16z-show')}
                  onMouseEnter={() => setHoveredLink('a16z-show')}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  the a16z Show
                </a>
                {showTooltip && (
                  <div style={{
                    position: 'absolute',
                    bottom: '130%',
                    left: '0',
                    background: '#1a0008',
                    border: '3px solid #FFD700',
                    borderRadius: '4px',
                    padding: '14px 16px',
                    width: '280px',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '8px',
                    color: 'rgba(255,215,0,0.85)',
                    lineHeight: 2,
                    zIndex: 100,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    pointerEvents: 'none',
                  }}>
                    a16z Arcade is a fan-made RPG inspired by the a16z Podcast. Learn from the greatest minds in tech, one battle at a time. Click to watch on YouTube!
                  </div>
                )}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9px', color: 'rgba(255,215,0,0.75)' }}>
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
                style={linkStyle('twitter')}
                onMouseEnter={() => setHoveredLink('twitter')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                David Pantera
              </a>
              <span style={{ color: 'rgba(255,215,0,0.4)' }}>◆</span>
              <a
                href="https://github.com/panterathehacker/a16z-arcade"
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...linkStyle('github'), color: 'rgba(255,215,0,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}
                onMouseEnter={() => setHoveredLink('github')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <span>⭐</span> GitHub
              </a>
            </div>
            <div style={{ fontSize: '6px', color: 'rgba(255,215,0,0.4)', lineHeight: 2, marginTop: '2px' }}>
              Fan project. Not affiliated with a16z.<br />Some art is AI-generated.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
