import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

interface LeaderboardEntry {
  username: string | null
  session_id: string
  captures_count: number
  last_capture: string | null
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(20)

  if (error) {
    console.error('Leaderboard fetch error:', error)
    return []
  }

  return data ?? []
}

export const revalidate = 30 // revalidate every 30 seconds

export default async function LeaderboardPage() {
  const entries = await getLeaderboard()

  const medals = ['🥇', '🥈', '🥉']

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0a1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
        fontFamily: '"Press Start 2P", monospace',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1
          style={{
            color: '#60A0FF',
            fontSize: '18px',
            marginBottom: '12px',
            textShadow: '0 0 20px #3060FF',
            letterSpacing: '2px',
          }}
        >
          ★ LEADERBOARD ★
        </h1>
        <p style={{ color: '#8080C0', fontSize: '7px', lineHeight: '2' }}>
          Top Trainers by Captures
        </p>
      </div>

      {/* Board */}
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          background: '#1a1a3e',
          border: '3px solid #4060C0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
        }}
      >
        {/* Column headers */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '2px solid #4060C0',
            paddingBottom: '12px',
            marginBottom: '12px',
          }}
        >
          <span style={{ color: '#4080FF', fontSize: '7px' }}>RANK</span>
          <span style={{ color: '#4080FF', fontSize: '7px' }}>TRAINER</span>
          <span style={{ color: '#4080FF', fontSize: '7px' }}>CAPTURES</span>
        </div>

        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#606090', fontSize: '7px', padding: '40px 0' }}>
            No trainers yet!
            <br />
            <br />
            Be the first to capture a guest.
          </div>
        ) : (
          entries.map((entry, i) => {
            const displayName =
              entry.username ||
              `Trainer #${entry.session_id.slice(0, 6).toUpperCase()}`
            const isTop3 = i < 3

            return (
              <div
                key={entry.session_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 8px',
                  marginBottom: '6px',
                  background: isTop3 ? 'rgba(64,96,192,0.2)' : 'transparent',
                  borderRadius: '6px',
                  border: isTop3 ? '1px solid #4060C0' : '1px solid transparent',
                }}
              >
                <span style={{ fontSize: '10px', minWidth: '40px' }}>
                  {medals[i] ?? `#${i + 1}`}
                </span>
                <span
                  style={{
                    color: isTop3 ? '#FFFFFF' : '#AAAACC',
                    fontSize: '7px',
                    flex: 1,
                    textAlign: 'center',
                  }}
                >
                  {displayName}
                </span>
                <span
                  style={{
                    color: '#80FF80',
                    fontSize: '8px',
                    minWidth: '80px',
                    textAlign: 'right',
                  }}
                >
                  {entry.captures_count}/10
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Back link */}
      <Link
        href="/"
        style={{
          color: '#60A0FF',
          fontSize: '8px',
          textDecoration: 'none',
          border: '2px solid #4060C0',
          padding: '12px 24px',
          borderRadius: '8px',
          background: '#1a1a3e',
          display: 'inline-block',
        }}
      >
        ← Back to Game
      </Link>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
    </main>
  )
}
