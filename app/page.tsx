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

const DEFAULT_STATS: PlayerStats = { level: 1, xp: 0, xpToNext: 150, hp: 100, maxHp: 100 };

export default function Home() {
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);
  const [isMuted, setIsMuted] = useState(false);
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
    
    // Fallback: also listen to storage events (cross-tab) and poll every 500ms during battles
    window.addEventListener('storage', loadStats);
    const pollInterval = setInterval(loadStats, 500);
    
    return () => {
      window.removeEventListener('player-stats-updated', onStatsUpdate);
      window.removeEventListener('storage', loadStats);
      clearInterval(pollInterval);
    };
  }, []);

  const isMaxLevel = stats.level >= 3;
  const xpPercent = isMaxLevel ? 100 : Math.min(100, Math.round((stats.xp / stats.xpToNext) * 100));
  const hpPercent = Math.min(100, Math.round((stats.hp / stats.maxHp) * 100));

  const linkStyle = (id: string) => ({
    color: '#FFD700',
    textDecoration: 'none',
    transition: 'transform 0.1s, color 0.1s, opacity 0.1s',
    display: 'inline-block',
    transform: hoveredLink === id ? 'scale(1.08) translateY(-1px)' : 'scale(1)',
    opacity: 1,
  });

  return (
    <main
      className="min-h-screen flex flex-col items-center"
      style={{
        padding: 'env(safe-area-inset-top, 12px) 8px 8px 8px',
        paddingTop: 'max(env(safe-area-inset-top), 12px)',
        justifyContent: 'flex-start',
        paddingBottom: '8px',
        background: '#4A0315',
        backgroundImage: `
          linear-gradient(45deg, #3d0010 25%, transparent 25%),
          linear-gradient(-45deg, #3d0010 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #2d0008 75%),
          linear-gradient(-45deg, transparent 75%, #2d0008 75%)
        `,
        backgroundSize: '8px 8px',
        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
        imageRendering: 'pixelated' as const,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Mobile - desktop only block */}
      {typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '') && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#4A0315',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div style={{
            border: '3px solid #FFD700',
            borderRadius: '8px',
            padding: '32px 28px',
            maxWidth: '360px',
            textAlign: 'center',
            background: '#0d0004',
            boxShadow: '0 0 40px rgba(255,215,0,0.3), 4px 4px 0 #000',
          }}>
            <div style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '14px',
              color: '#FFD700',
              marginBottom: '20px',
              lineHeight: 1.8,
              textShadow: '2px 2px 0 #4A0315',
            }}>
              Best on desktop
            </div>
            <div style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '8px',
              color: '#FFD700',
              lineHeight: 2.2,
              marginBottom: '28px',
            }}>
              a16z Arcade is designed for desktop play. For the best experience, continue on a computer.
            </div>
            <a
              href="https://x.com/davidpantera_"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '9px',
                background: '#FFD700',
                color: '#000000',
                border: '2px solid #FFD700',
                borderRadius: '4px',
                padding: '14px 24px',
                textDecoration: 'none',
                fontWeight: 'bold',
                boxShadow: '0 4px 0 rgba(0,0,0,0.5)',
              }}
            >
              Follow @davidpantera_ →
            </a>
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
            textShadow: '3px 3px 0px #000000, 4px 4px 0px rgba(74,3,21,0.8), 0 0 20px rgba(255,215,0,0.5)',
          }}
        >
          a16z Arcade
        </h1>
        <p
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(7px, 1.5vw, 11px)',
            color: '#FFD700',
            textShadow: '1px 1px 0px #4A0315',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Learn from the best, one battle at a time.
        </p>
      </div>

      {/* Mute button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', maxWidth: '1300px', marginBottom: '6px', zIndex: 3, position: 'relative' }}>
        <button
          onClick={() => {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            localStorage.setItem('a16z-arcade-muted', String(newMuted));
            window.dispatchEvent(new CustomEvent('a16z-set-mute', { detail: { muted: newMuted } }));
          }}
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            background: isMuted ? '#4A0315' : 'rgba(26,0,8,0.8)',
            color: '#FFD700',
            border: '2px solid #FFD700',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: 'pointer',
            boxShadow: '2px 2px 0 #000',
          }}
        >
          {isMuted ? '🔇 UNMUTE' : '🔊 MUTE'}
        </button>
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
          width: '160px',
          minWidth: '160px',
          background: '#1a1a00',
          border: '4px solid #FFD700',
          borderRadius: '4px',
          padding: '14px 12px',
          fontFamily: '"Press Start 2P", monospace',
          alignSelf: 'flex-start',
          boxShadow: '4px 4px 0px #000000, 6px 6px 0px rgba(255,215,0,0.3)',
        }}>
          {/* LEVEL */}
          <div style={{ color: '#FFD700', fontSize: '9px', marginBottom: '8px', letterSpacing: '1px' }}>
            LEVEL {stats.level}
          </div>

          {/* XP Bar */}
          <div style={{ background: '#111100', height: '6px', borderRadius: '1px', marginBottom: '4px', overflow: 'hidden' }}>
            <div style={{
              background: '#22cc44',
              height: '100%',
              width: `${xpPercent}%`,
              borderRadius: '1px',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.85)', marginBottom: '12px' }}>
            {isMaxLevel ? "MAX LEVEL" : `${stats.xp}/${stats.xpToNext} XP`}
          </div>

          {/* HP */}
          <div style={{ color: '#FFD700', fontSize: '9px', marginBottom: '4px' }}>HP</div>
          <div style={{ background: '#111100', height: '6px', borderRadius: '1px', marginBottom: '4px', overflow: 'hidden' }}>
            <div style={{
              background: hpPercent > 50 ? '#22cc44' : hpPercent > 25 ? '#D8C040' : '#D84040',
              height: '100%',
              width: `${hpPercent}%`,
              borderRadius: '1px',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold', marginBottom: '14px' }}>
            {stats.hp}/{stats.maxHp}
          </div>

          {/* CAPTURED */}
          <div
            style={{ color: '#FFD700', fontSize: '9px', marginBottom: '4px', letterSpacing: '1px', cursor: 'pointer', display: 'inline-block', transition: 'transform 0.1s', userSelect: 'none' }}
            onClick={() => window.dispatchEvent(new CustomEvent('open-pokedex'))}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            title="View Pokédex"
          >
            CAPTURED
          </div>
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>
            {captured}/25
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
            boxShadow: '4px 4px 0px #000000, 0 0 30px rgba(255,215,0,0.15), 0 0 60px rgba(74,3,21,0.5)',
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
          maxWidth: '1100px',
          background: 'rgba(0,0,0,0.85)',
          border: '3px solid #FFD700',
          borderRadius: '8px',
          padding: '16px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          fontFamily: '"Press Start 2P", monospace',
          boxShadow: '4px 4px 0px #000000, 6px 6px 0px rgba(255,215,0,0.2)',
        }}
      >
        {/* Left: How to Play */}
        <div style={{ borderRight: '2px solid rgba(255,215,0,0.3)', paddingRight: '32px' }}>
          <div style={{ color: '#FFD700', fontSize: '10px', marginBottom: '12px', textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}>
            How to Play:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              'Arrow Keys or WASD to move',
              'Walk near guests to battle',
              'Level up to move on to the next map',
              'Press C to view your collection',
            ].map((text) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', color: '#ffffff', fontSize: '9px', lineHeight: 1.6 }}>
                <span style={{ color: '#FFD700', marginRight: '8px', fontSize: '10px', flexShrink: 0, lineHeight: 1 }}>▪</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: About */}
        <div>
          <div style={{ color: '#FFD700', fontSize: '10px', marginBottom: '12px', textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}>
            About this game:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9px', color: '#ffffff' }}>
              <span>Showcases content from</span>
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
                    background: '#4A0315',
                    border: '3px solid #FFD700',
                    borderRadius: '4px',
                    padding: '14px 16px',
                    width: '280px',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '8px',
                    color: 'rgba(255,255,255,0.85)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9px', color: '#ffffff' }}>
              <span>Made by</span>
              <div style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '4px', border: '2px solid #FFD700', overflow: 'hidden' }}>
                <img src="/assets/sprites/player-male/front.png" alt="David" style={{ width: '88px', height: 'auto', marginLeft: '0px', marginTop: '-12px', imageRendering: 'pixelated', display: 'block' }} />
              </div>
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
              <span style={{ color: '#FFD700' }}>◆</span>
              <a
                href="https://github.com/panterathehacker/a16z-arcade"
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...linkStyle('github'), display: 'flex', alignItems: 'center', gap: '4px' }}
                onMouseEnter={() => setHoveredLink('github')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <svg height="14" width="14" viewBox="0 0 16 16" style={{fill:"#FFD700",verticalAlign:"middle",marginRight:"4px"}}><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg> GitHub
              </a>
            </div>
            <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.5)', lineHeight: 2, marginTop: '2px' }}>
              Inspired by <a href="https://www.lennysnewsletter.com/p/how-i-built-lennyrpg" target="_blank" rel="noopener noreferrer" style={{color:"#FFD700",textDecoration:"none"}}>LennyRPG</a> by Ben Shih.<br/>Fan project. Not affiliated with a16z.<br />Some art and all music is AI-generated.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
