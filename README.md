# 🎮 a16z Arcade — Learn from the Best, One Battle at a Time

[![Play Now](https://img.shields.io/badge/🎯_Play_Now-FFD700?style=for-the-badge)](https://a16z-arcade.vercel.app/)
[![a16z Show](https://img.shields.io/badge/🎙️_a16z_Show-4A90E2?style=for-the-badge)](https://www.youtube.com/@a16z/videos)
[![Made by David](https://img.shields.io/badge/👤_Made_by_@davidpantera__-1A1A2E?style=for-the-badge)](https://x.com/davidpantera_)

**A retro Pokémon-style RPG inspired by the a16z Show podcast** — 31 real tech guests, 155+ questions sourced from actual podcast transcripts, and a full overworld to explore.

Battle Marc Andreessen, Jensen Huang, Sam Altman, Fei-Fei Li, Magic Johnson, and 26 more. Answer questions based on what they actually said on the podcast. Level up to unlock new areas. Capture every guest to complete your collection.

> 💡 *The podcast you never had time to listen to — now you can learn its key insights through gameplay.*

---

## 🎯 About

a16z Arcade turns the a16z Show podcast guest lineup into a retro RPG adventure. Every guest is a capturable character with questions pulled directly from their actual podcast episode transcripts using GPT-4o.

**No more passive listening** — test your knowledge of venture capital, AI, entrepreneurship, and technology through battles. Win 3 of 5 questions to capture a guest and add them to your Pokédex.

Think Pokémon meets a16z podcast — built for anyone who wants to get smarter about tech and startups while having fun.

---

## ✨ Features

- 🗺️ **Open World Exploration** — Tuxemon tileset-based Pokémon-style overworld to explore
- 🎙️ **31 Real Podcast Guests** — Marc Andreessen, Jensen Huang, Sam Altman, Magic Johnson, Fei-Fei Li, and more
- 📚 **Transcript-Based Questions** — All 155+ questions generated from actual a16z Show episode transcripts
- 🎮 **Pokémon-Style Mechanics** — Walk up to guests, trigger battles, answer 3-of-5 questions to capture
- 📈 **XP & Level System** — Level 1→2 (150 XP), Level 2→3 (250 XP), unlock the top half of the map at Level 2
- 💯 **Perfect Capture Bonus** — Answer first 3/3 correctly: +30 bonus XP + 20 HP healing
- 🎵 **Original Chiptune Music** — AI-generated retro overworld theme, battle music, and victory jingle
- 🖼️ **AI-Generated Sprites** — Every guest has a custom pixel art portrait styled after LennyRPG's aesthetic
- 👤 **Choose Your Trainer** — Pick HE/HIM (David sprite) or SHE/HER (Justine sprite)
- 📱 **Desktop Optimized** — Best played on a laptop or desktop computer
- 🔊 **Mute Button** — Toggle music on/off from outside the canvas

---

## 🎲 Game Mechanics

### Battle System
- Walk near any guest to trigger the encounter dialogue
- Answer **3 of 5 questions correctly** to capture the guest
- Get fewer than 3 right → Defeat screen
- Wrong answer penalty: **-10 HP** from your global health
- Your HP carries between battles — manage it carefully!

### XP & Leveling
| Level | XP Required | Unlock |
|-------|-------------|--------|
| 1 → 2 | 150 XP | Top half of map (16 new guests) |
| 2 → 3 | 250 XP | MAX LEVEL |

- **+10 XP** per correct answer
- **+30 bonus XP** for Perfect Capture (0 wrong answers)
- Level up increases your max XP bar

### Health System
- Start with **100/100 HP**
- Each wrong answer costs **10 HP** globally (persists between battles)
- **Perfect Capture**: +20 HP healing (capped at max)
- **HP reaches 0**: Game Over — XP resets to start of current level, level is kept

### Map Layout
- **Level 1 Area** (bottom half): 16 guests accessible from the start
- **Level 2 Area** (top half): 15 guests, gated behind Level 2

---

## 🚀 Play Now

🎯 **[a16z-arcade.vercel.app](https://a16z-arcade.vercel.app/)**

No installation required. Plays in any modern browser (desktop recommended).

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Game Engine | [Phaser 3](https://phaser.io) |
| Frontend | [Next.js 14](https://nextjs.org/) + TypeScript |
| Styling | Tailwind CSS |
| Tileset | [Tuxemon](https://github.com/Tuxemon/Tuxemon) (open source) |
| Battle Background | AI-generated meadow scene |
| Sprite Style | gpt-image-1 with LennyRPG style transfer |
| Question Generation | GPT-4o from YouTube transcripts via yt-dlp |
| Database | Supabase (captures, leaderboard) |
| Deployment | Vercel |
| Music | AI-generated via Suno |

---

## 🎨 Guest Roster

### Level 1 (Accessible from start)
Marc Andreessen • Ben Horowitz • Jensen Huang • Lisa Su • Alexandr Wang • Sam Altman • Dr. Fei-Fei Li • Michael Truell • Mati Sheetrit • Dario Amodei • Chris Dixon • Vlad Tenev • Mark Zuckerberg • Andrew Chen • Andrew Huberman • David George

### Level 2 (Requires Level 2)
Wade Foster • Tomer London • Balaji Srinivasan • Emmett Shear • Reid Hoffman • Steve Wozniak • Nicole Brichtova • Keith Rabois • Benedict Evans • Olivia Moore • Magic Johnson • Eugenia Kuyda • Anish Acharya • Martin Casado • Justine Moore

---

## 💻 Development

### Prerequisites
- Node.js v18+
- npm

### Setup

```bash
git clone https://github.com/panterathehacker/a16z-arcade.git
cd a16z-arcade
npm install
```

### Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at `localhost:3000` |
| `npm run build` | Production build |
| `node scripts/generate-sprites-v5.js` | Regenerate guest sprites |
| `node scripts/generate-podcast-questions.js` | Regenerate questions from transcripts |

### Project Structure

```
a16z-arcade/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Main page (stats panel, canvas, info bar)
│   └── layout.tsx
├── game/
│   ├── scenes/
│   │   ├── BootScene.ts    # Asset preloading
│   │   ├── WorldScene.ts   # Overworld map + movement + music
│   │   └── BattleScene.ts  # Quiz battle system + DOM overlays
│   ├── data/
│   │   └── guests.ts       # All 31 guests with questions + episode URLs
│   └── GameComponent.tsx   # Phaser wrapper
├── public/assets/
│   ├── sprites/guests/     # 31 AI-generated guest sprites (128×192px)
│   ├── sprites/player-male/  # David's 4-directional sprites
│   ├── sprites/player-female/ # Justine's 4-directional sprites
│   ├── tilemaps/           # Tuxemon tileset + map JSON
│   ├── battle/             # Battle background + player sprites
│   └── audio/              # overworld.mp3, battle.mp3, victory.mp3
└── scripts/                # Sprite/question generation scripts
```

---

## 🙏 Credits

### Created By
**[David Pantera](https://x.com/davidpantera_)** ([@davidpantera_](https://x.com/davidpantera_)) — Stanford GSB MBA candidate

### Inspired By
- **[LennyRPG](https://www.lennyrpg.fun/)** by [Ben Shih](https://benshih.design/) — the original podcast RPG that inspired this project
- **[a16z Show](https://www.youtube.com/@a16z/videos)** — the podcast that powers all the questions and guests

### Built With
- [Phaser 3](https://phaser.io) — Game engine
- [Next.js](https://nextjs.org/) — Frontend framework
- [Tuxemon](https://github.com/Tuxemon/Tuxemon) — Open source tileset
- [OpenAI](https://openai.com/) — Sprite generation (gpt-image-1) + question generation (GPT-4o)
- [Supabase](https://supabase.com/) — Database

---

## 📜 License

Fan-made educational project. Not affiliated with Andreessen Horowitz (a16z).

All guest names, likenesses, and podcast content belong to their respective owners. Some art and all music is AI-generated. Game code © 2026 David Pantera.

---

**🎮 [Play at a16z-arcade.vercel.app](https://a16z-arcade.vercel.app/) and learn what the greatest minds in tech are actually saying.**
