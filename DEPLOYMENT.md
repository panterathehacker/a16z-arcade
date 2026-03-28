# Deployment Guide — a16z Arcade

## Prerequisites

- Node.js 18+
- A GitHub account
- A Vercel account (free tier works)

---

## 1. Set Up Supabase Tables

Before deploying, run the schema against your Supabase project.

1. Go to: https://supabase.com/dashboard/project/gkkqhhgphjrcnsshiblp/editor
2. Open the SQL editor
3. Paste the contents of `supabase/schema.sql`
4. Click **Run**

This creates the `players`, `captures` tables and `leaderboard` view with RLS policies.

---

## 2. Push to GitHub

```bash
cd ~/Desktop/projects/apps/a16z-arcade
git add -A
git commit -m "Add Supabase integration, leaderboard, and OpenAI portraits"
git push origin main
```

If you haven't set up a remote yet:

```bash
git remote add origin https://github.com/YOUR_USERNAME/a16z-arcade.git
git push -u origin main
```

---

## 3. Import to Vercel

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your `a16z-arcade` repo
4. Vercel auto-detects Next.js — leave defaults as-is
5. **Before deploying**, add environment variables (see below)

---

## 4. Add Environment Variables in Vercel

In the Vercel project settings → **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gkkqhhgphjrcnsshiblp.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_YOaWDJJjpaQQPI7tbdS9kQ_0qHFvuWW` |
| `SUPABASE_SECRET_KEY` | `sb_secret_85NPwAikchQlTQuZDCYF9Q_vwnVYjqg` |
| `OPENAI_API_KEY` | `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` |

Set environment to **Production**, **Preview**, and **Development**.

---

## 5. Deploy

Click **Deploy**. Vercel runs `npm install && npm run build` automatically.

Build time: ~30–60 seconds.

---

## Features After Deployment

- **Game**: Playable at your Vercel URL
- **Leaderboard**: `/leaderboard` — top trainers by captures
- **Portrait API**: `GET /api/generate-portrait?name=Marc+Andreessen`
- **Supabase**: Captures persist across devices for the same session

---

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

To test DB connection locally:
```bash
node scripts/setup-db.js
```
