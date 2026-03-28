'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const GameComponent = dynamic(() => import('../game/GameComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full min-h-[600px] bg-gray-900 text-white font-mono">
      <div className="text-center">
        <div className="text-2xl mb-4 animate-pulse">Loading a16z Arcade...</div>
        <div className="text-sm text-gray-400">Press Start 2P</div>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1
          className="text-white mb-1 tracking-tight"
          style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '20px' }}
        >
          a16z Arcade
        </h1>
        <p
          className="text-gray-400"
          style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '8px' }}
        >
          Battle the greatest minds in tech
        </p>
      </div>

      {/* Game container */}
      <div className="w-full max-w-[800px] border-4 border-gray-700 rounded-lg overflow-hidden shadow-2xl shadow-blue-900/30">
        <GameComponent />
      </div>

      {/* Controls + Leaderboard link */}
      <div
        className="mt-4 text-gray-500 text-center"
        style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '7px', lineHeight: '1.8' }}
      >
        <span className="text-gray-400">WASD / Arrow Keys</span> to move &nbsp;|&nbsp;{' '}
        <span className="text-gray-400">SPACE</span> to interact &nbsp;|&nbsp;{' '}
        <span className="text-gray-400">1-4</span> to answer &nbsp;|&nbsp;{' '}
        <span className="text-gray-400">C</span> for Pokédex
      </div>

      <div className="mt-4">
        <Link
          href="/leaderboard"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#60A0FF',
            textDecoration: 'none',
            border: '2px solid #4060C0',
            padding: '8px 16px',
            borderRadius: '6px',
            background: '#1a1a3e',
            display: 'inline-block',
          }}
        >
          ★ Leaderboard
        </Link>
      </div>
    </main>
  );
}
