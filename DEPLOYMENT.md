# Deployment Guide — a16z Arcade

## Prerequisites

- Node.js 18+
- A GitHub account
- A Vercel account (free tier works)
- Supabase account
- OpenAI API key

---

## 1. Set Up Supabase Tables

Before deploying, run the schema against your Supabase project.

1. Go to your Supabase dashboard → SQL Editor
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

This creates the `players`, `captures` tables and `leaderboard` view with RLS policies.

---

## 2. Push to GitHub

```bash
cd a16z-arcade
git add -A
git commit -m "Initial deployment"
git push origin main
```

---

## 3. Import to Vercel

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your `a16z-arcade` repo
4. Vercel auto-detects Next.js — leave defaults
5. Add environment variables before deploying (see below)

---

## 4. Add Environment Variables in Vercel

In Vercel project settings → **Environment Variables**, add:

| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/publishable key |
| `SUPABASE_SECRET_KEY` | Your Supabase service role secret key |
| `OPENAI_API_KEY` | Your OpenAI API key |

Set all to **Production**, **Preview**, and **Development**.

> ⚠️ Never commit API keys to the repository. Use environment variables only.

---

## 5. Deploy

Click **Deploy**. Build time: ~30–60 seconds.

---

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

Create `.env.local` with your keys (never commit this file):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SECRET_KEY=...
OPENAI_API_KEY=...
```
