import { supabase } from '../../lib/supabase'

const SESSION_KEY = 'a16z_arcade_session'

export async function getOrCreatePlayer() {
  let sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, sessionId)
  }

  // Upsert player
  const { data, error } = await supabase
    .from('players')
    .upsert({ session_id: sessionId }, { onConflict: 'session_id' })
    .select()
    .single()

  if (error) {
    console.warn('Supabase unavailable, using localStorage only', error)
    return { id: null, sessionId }
  }

  return { id: data.id, sessionId }
}

export async function updateUsername(playerId: string, username: string) {
  if (!playerId) return
  await supabase
    .from('players')
    .update({ username, updated_at: new Date().toISOString() })
    .eq('id', playerId)
}

export async function saveCapture(playerId: string | null, guestId: string) {
  if (!playerId) return // graceful degradation

  await supabase
    .from('captures')
    .upsert(
      { player_id: playerId, guest_id: guestId },
      { onConflict: 'player_id,guest_id' }
    )
}

export async function fetchCaptures(playerId: string | null): Promise<string[]> {
  if (!playerId) return []

  const { data } = await supabase
    .from('captures')
    .select('guest_id')
    .eq('player_id', playerId)

  return data?.map((r) => r.guest_id) ?? []
}
