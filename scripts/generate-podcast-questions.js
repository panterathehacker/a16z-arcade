const OpenAI = require('openai');
const { execSync } = require('child_process');
const fs = require('fs');

const openai = new OpenAI({ apiKey: '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' });

fs.mkdirSync('/tmp/a16z-transcripts', { recursive: true });

const guests = [
  { id: 'marc', name: 'Marc Andreessen', title: 'Co-Founder, a16z', search: 'Andreessen' },
  { id: 'ben', name: 'Ben Horowitz', title: 'Co-Founder, a16z', search: 'Ben Horowitz' },
  { id: 'jensen', name: 'Jensen Huang', title: 'CEO, NVIDIA', search: 'Jensen Huang', url: 'https://www.youtube.com/watch?v=Ww9SkW0Em58' },
  { id: 'lisa', name: 'Lisa Su', title: 'CEO, AMD', search: 'Lisa Su' },
  { id: 'alexandr', name: 'Alexandr Wang', title: 'CEO, Scale AI', search: 'Alexandr Wang' },
  { id: 'sam-altman', name: 'Sam Altman', title: 'CEO, OpenAI', search: 'Sam Altman' },
  { id: 'satya', name: 'Satya Nadella', title: 'CEO, Microsoft', search: 'Satya Nadella' },
  { id: 'brian-chesky', name: 'Brian Chesky', title: 'CEO, Airbnb', search: 'Brian Chesky' },
  { id: 'patrick-collison', name: 'Patrick Collison', title: 'CEO, Stripe', search: 'Patrick Collison' },
  { id: 'dario-amodei', name: 'Dario Amodei', title: 'CEO, Anthropic', search: 'Dario Amodei' },
  { id: 'chris-dixon', name: 'Chris Dixon', title: 'GP, a16z crypto', search: 'Chris Dixon' },
  { id: 'sarah', name: 'Sarah Guo', title: 'Founder, Conviction', search: 'Sarah Guo' },
  { id: 'elad', name: 'Elad Gil', title: 'Investor & Advisor', search: 'Elad Gil' },
  { id: 'andrew', name: 'Andrew Chen', title: 'GP, a16z', search: 'Andrew Chen' },
  { id: 'sonal', name: 'Sonal Chokshi', title: 'Host, a16z Podcast', search: 'Sonal Chokshi' },
  { id: 'david', name: 'David George', title: 'GP, a16z Growth', search: 'David George' },
  { id: 'wade-foster', name: 'Wade Foster', title: 'CEO, Zapier', search: 'Wade Foster' },
  { id: 'tomer-london', name: 'Tomer London', title: 'Co-Founder, Gusto', search: 'Tomer London' },
  { id: 'balaji', name: 'Balaji Srinivasan', title: 'Investor & Author', search: 'Balaji' },
  { id: 'naval', name: 'Naval Ravikant', title: 'Founder, AngelList', search: 'Naval' },
  { id: 'reid-hoffman', name: 'Reid Hoffman', title: 'Co-Founder, LinkedIn', search: 'Reid Hoffman' },
  { id: 'wozniak', name: 'Steve Wozniak', title: 'Co-Founder, Apple', search: 'Wozniak' },
  { id: 'nicole-brichtova', name: 'Nicole Brichtova', title: 'Group PM, Google DeepMind', search: 'Nano Banana' },
  { id: 'tomer-cohen', name: 'Tomer Cohen', title: 'CPO, LinkedIn', search: 'Tomer Cohen' },
  { id: 'alex-karp', name: 'Alex Karp', title: 'CEO, Palantir', search: 'Alex Karp' },
];

function findEpisode(guest) {
  if (guest.url) return guest.url;
  try {
    const result = execSync(
      `yt-dlp --flat-playlist --print "%(title)s|||%(url)s" "https://www.youtube.com/@a16z/videos" 2>/dev/null | grep -i "${guest.search}" | head -1`,
      { encoding: 'utf8', timeout: 120000 }
    ).trim();
    if (result) {
      const parts = result.split('|||');
      const url = parts[1];
      console.log('  Found:', parts[0].substring(0, 80));
      return url;
    }
  } catch(e) {
    console.log('  Search error:', e.message.slice(0, 60));
  }
  return null;
}

function getTranscript(url, guestId) {
  const outDir = '/tmp/a16z-transcripts';
  try {
    execSync(
      `yt-dlp --skip-download --write-auto-sub --sub-format vtt --sub-lang en -o "${outDir}/${guestId}.%(ext)s" "${url}" 2>/dev/null`,
      { timeout: 90000 }
    );
    const vttFile = `${outDir}/${guestId}.en.vtt`;
    if (fs.existsSync(vttFile)) {
      const content = fs.readFileSync(vttFile, 'utf8');
      const lines = content.split('\n');
      const text = [];
      let prev = '';
      for (const line of lines) {
        if (line.startsWith('WEBVTT') || line.includes('-->') || !line.trim() || /^\d+$/.test(line.trim())) continue;
        const clean = line.replace(/<[^>]+>/g, '').trim();
        if (clean && clean !== prev) { text.push(clean); prev = clean; }
      }
      return text.join(' ').slice(0, 60000);
    }
  } catch(e) {
    console.log('  Transcript error:', e.message.slice(0, 60));
  }
  return null;
}

async function generateQuestions(guest, transcript) {
  const prompt = transcript
    ? `You are creating quiz questions for an educational game based on the a16z podcast.

The game's purpose: teach players the valuable insights shared by business leaders, entrepreneurs, and tech innovators in their a16z podcast episodes. Players who haven't listened to the podcast should learn real knowledge by playing.

Guest: ${guest.name} (${guest.title})
Podcast transcript excerpt: """${transcript}"""

Generate exactly 5 multiple-choice quiz questions based on the CONTENT of this transcript. Each question should:
1. Test understanding of a specific insight, idea, framework, or fact mentioned in the podcast
2. Be educational — teach the player something valuable about business, technology, AI, or entrepreneurship
3. Have 4 answer choices with exactly one correct answer
4. Be interesting and non-trivial

Return ONLY valid JSON:
{"questions": [{"text": "Question here?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0}]}`
    : `You are creating quiz questions for an educational game based on the a16z podcast.

The game's purpose: teach players the valuable insights shared by business leaders, entrepreneurs, and tech innovators. Players who haven't listened to the podcast should learn real knowledge by playing.

Guest: ${guest.name} (${guest.title})

No transcript available. Generate 5 multiple-choice quiz questions based on this person's most well-known public ideas, frameworks, predictions, and contributions related to business, technology, entrepreneurship, or AI. Each question should:
1. Test understanding of a specific insight, idea, or framework this person is known for
2. Be educational and teach something genuinely valuable
3. Have 4 answer choices with exactly one correct answer
4. Be interesting and non-trivial

Return ONLY valid JSON:
{"questions": [{"text": "...", "options": ["...", "...", "...", "..."], "correct": 0}]}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  // Strip markdown code fences if present
  let raw = response.choices[0].message.content.trim();
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  const parsed = JSON.parse(raw);
  return parsed.questions || parsed;
}

async function main() {
  const results = {};
  let foundCount = 0;
  let transcriptCount = 0;

  for (const guest of guests) {
    console.log(`\n=== ${guest.name} ===`);

    const url = await findEpisode(guest);
    if (url) {
      foundCount++;
      console.log('  Episode:', url);
    } else {
      console.log('  No episode found on a16z channel');
    }

    let transcript = null;
    if (url) {
      transcript = getTranscript(url, guest.id);
      if (transcript) {
        transcriptCount++;
        console.log(`  Transcript: ${transcript.length} chars`);
      } else {
        console.log('  No transcript available');
      }
    }

    try {
      const questions = await generateQuestions(guest, transcript);
      results[guest.id] = questions;
      console.log(`  Generated ${questions.length} questions`);
    } catch(e) {
      console.error(`  Failed: ${e.message.slice(0, 80)}`);
      results[guest.id] = [];
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  fs.writeFileSync('/tmp/podcast-questions.json', JSON.stringify(results, null, 2));
  console.log('\n✓ Saved to /tmp/podcast-questions.json');
  console.log(`Episodes found: ${foundCount}/25`);
  console.log(`Transcripts downloaded: ${transcriptCount}/25`);
  console.log(`Guests processed: ${Object.keys(results).length}/25`);
}

main().catch(console.error);
