# 🎮 a16z Arcade — Learn from the Best, One Battle at a Time

[![Play Now](https://img.shields.io/badge/🎯_Play_Now-FFD700?style=for-the-badge)](https://a16z-arcade.vercel.app/)
[![a16z Show](https://img.shields.io/badge/🎙️_a16z_Show-4A90E2?style=for-the-badge)](https://www.youtube.com/@a16z/videos)
[![Made by David](https://img.shields.io/badge/👤_Made_by_@davidpantera__-1A1A2E?style=for-the-badge)](https://x.com/davidpantera_)

**A retro Pokémon-style RPG inspired by the a16z Show podcast** — 30+ real guests, questions sourced from their actual podcast episode transcripts, and a full world to explore.

Battle Marc Andreessen, Jensen Huang, Sam Altman, Fei-Fei Li, Magic Johnson, and more. Answer questions based on what they actually said on the podcast. Level up to unlock new areas. Capture every guest to complete your collection.

> 💡 *The podcast you didn't have time to listen to — now you can learn its key insights through game.*

---

## 🎯 About

a16z Arcade turns the a16z Show podcast guest lineup into a retro RPG adventure. Every guest is a capturable character with questions pulled directly from their actual podcast episode transcripts.

**No more passive listening** — test your knowledge of venture capital, AI, entrepreneurship, and technology through battles. Win 3 of 5 questions to capture a guest and add them to your collection.

Think Pokémon meets a16z podcast — built for anyone who wants to get smarter about tech and startups while having fun.

---

## ✨ Features

- 🗺️ **Open World Exploration** — Tuxemon tileset-based Pokémon-style overworld to explore
- 🎙️ **Real Podcast Guests** — Marc Andreessen, Jensen Huang, Sam Altman, Magic Johnson, Fei-Fei Li, and more
- 📚 **Transcript-Based Questions** — All questions generated from actual a16z Show episode transcripts
- 🎮 **Pokémon-Style Mechanics** — Walk up to guests, trigger battles, answer 3-of-5 questions to capture
- 📈 **XP & Level System** — Level 1→2 (150 XP), Level 2→3 (250 XP), unlock the top half of the map at Level 2
- 💯 **Perfect Capture Bonus** — Answer first 3/3 correctly: +30 bonus XP + 20 HP healing
- 🎵 **Original Chiptune Music** — AI-generated retro overworld theme, battle music, and victory jingle
- 🖼️ **AI-Generated Sprites** — Every guest has a custom pixel art portrait
- 👤 **Choose Your Trainer** — Pick HE/HIM or SHE/HER
- 📱 **Desktop Optimized** — Best played on a laptop or desktop computer
- 🔊 **Mute Button** — Toggle music on/off from outside the canvas

---

## 🎲 Game Mechanics

### Battle System
- Walk near any guest to trigger the encounter dialogue
- Answer **3 of 5 questions correctly** to capture the guest
- Get fewer than 3 right → Defeat
- Wrong answer penalty: **-10 HP** from your global health
- Your HP carries between battles — manage it carefully!

### XP & Leveling
| Level | XP Required | Unlock |
|-------|-------------|--------|
| 1 → 2 | 150 XP | Top half of map (new guests) |
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
- **Level 1 Area** (bottom half): guests accessible from the start
- **Level 2 Area** (top half): new guests, gated behind Level 2

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
| Battle Background | AI-generated |
| Sprite Style | LennyRPG style transfer |
| Question Generation | from YouTube transcripts |
| Database | Supabase (captures, leaderboard) |
| Deployment | Vercel |
| Music | AI-generated |

---

## 🙏 Credits

### Created By
**[David Pantera](https://x.com/davidpantera_)** ([@davidpantera_](https://x.com/davidpantera_)) — Stanford

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
