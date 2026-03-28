-- Players table (anonymous sessions)
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  session_id text unique not null,
  username text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Captured guests per player
create table if not exists captures (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  guest_id text not null,
  captured_at timestamptz default now(),
  unique(player_id, guest_id)
);

-- Leaderboard: most guests captured
create view leaderboard as
  select 
    p.username,
    p.session_id,
    count(c.id) as captures_count,
    max(c.captured_at) as last_capture
  from players p
  left join captures c on c.player_id = p.id
  group by p.id, p.username, p.session_id
  order by captures_count desc
  limit 100;

-- Enable RLS
alter table players enable row level security;
alter table captures enable row level security;

-- Allow anonymous access (session-based)
create policy "Players can read own data" on players for select using (true);
create policy "Players can insert" on players for insert with check (true);
create policy "Players can update own data" on players for update using (true);
create policy "Captures are readable" on captures for select using (true);
create policy "Players can insert captures" on captures for insert with check (true);
