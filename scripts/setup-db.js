const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://gkkqhhgphjrcnsshiblp.supabase.co',
  'sb_secret_85NPwAikchQlTQuZDCYF9Q_vwnVYjqg'
)

async function setup() {
  console.log('Testing Supabase connection...')
  const { data, error } = await supabase.from('players').select('count').single()
  if (error && error.code === '42P01') {
    console.log('Tables do not exist yet. Please run supabase/schema.sql manually via the Supabase dashboard SQL editor.')
    console.log('Dashboard: https://supabase.com/dashboard/project/gkkqhhgphjrcnsshiblp/editor')
  } else if (error) {
    console.error('Connection error:', error.message)
  } else {
    console.log('Connected! Players table exists.')
    console.log('Data:', data)
  }
}

setup()
