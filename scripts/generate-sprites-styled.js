/**
 * generate-sprites-styled.js
 * Uses gpt-image-1 with style reference images for pixel-art NPC sprites.
 * Falls back to DALL-E 3 with a detailed pixel-art prompt if gpt-image-1 fails.
 *
 * Usage:
 *   node scripts/generate-sprites-styled.js           # generate all missing
 *   node scripts/generate-sprites-styled.js --force   # regenerate all
 */

const OpenAI = require('openai');
const https = require('https');
const fs = require('fs');
const path = require('path');

const FORCE = process.argv.includes('--force');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ||
    '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'
});

const SPRITE_DIR = path.join(__dirname, '../public/assets/sprites/guests');
const REF_DIR    = path.join(__dirname, '../public/assets/sprites/style-reference');
fs.mkdirSync(SPRITE_DIR, { recursive: true });

// Load reference images as base64
function loadRefBase64(filename) {
  const p = path.join(REF_DIR, filename);
  return fs.existsSync(p) ? fs.readFileSync(p).toString('base64') : null;
}

const guests = [
  { id: 'marc-andreessen', description: 'Bald white man in his 50s wearing a dark navy business suit with white shirt, slight smile' },
  { id: 'ben-horowitz',    description: 'Black man in his 50s with short dark hair wearing a dark suit with confident expression' },
  { id: 'lisa-su',         description: 'Asian woman in her 50s with short black hair wearing a red blazer over dark top, professional confident expression' },
  { id: 'alexandr-wang',   description: 'Young Asian man in his mid-20s with dark hair wearing a casual gray hoodie, confident expression' },
  { id: 'jensen-huang',    description: 'Asian man in his 60s with silver/gray hair wearing a distinctive all-black leather jacket, iconic confident smirk' },
  { id: 'sarah-guo',       description: 'Asian woman in her 30s with long dark black hair wearing a pink top, friendly expression' },
  { id: 'elad-gil',        description: 'Man with short dark hair wearing a purple casual shirt, friendly expression' },
  { id: 'andrew-chen',     description: 'Asian man in his 30s with dark hair wearing an orange hoodie, energetic friendly expression' },
  { id: 'sonal-chokshi',   description: 'South Asian woman with dark hair wearing a teal/dark top, warm smile' },
  { id: 'david-george',    description: 'White man with dark hair wearing a dark suit with red tie, professional expression' },
  { id: 'player',          description: 'Young person wearing a blue jacket and jeans, brown hair, adventurer/trainer look' },
];

const STYLE_SUFFIX = `
chibi pixel art RPG character sprite, large head relative to body, standing front-facing upright,
simple 3-4 color tones per element, visible pixel grid at ~32x48px scale, warm expression,
clean simple background, no text, no borders, Tuxemon game aesthetic.`;

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

async function generateWithGptImage1(guest, refs) {
  // Build content array with ref images + text prompt
  const content = [];

  for (const ref of refs) {
    if (ref) {
      content.push({
        type: 'input_image',
        image_url: `data:image/png;base64,${ref}`
      });
    }
  }

  content.push({
    type: 'input_text',
    text: `Generate a pixel art character sprite in EXACTLY this style: ${STYLE_SUFFIX}\nThe character is: ${guest.description}.`
  });

  const response = await openai.responses.create({
    model: 'gpt-image-1',
    input: [{ role: 'user', content }]
  });

  // Extract image from response
  const output = response.output || [];
  for (const item of output) {
    if (item.type === 'image_generation_call' && item.result) {
      // base64 image
      return Buffer.from(item.result, 'base64');
    }
  }
  throw new Error('No image in gpt-image-1 response');
}

async function generateWithDallE3Fallback(guest) {
  const prompt = `Chibi pixel art RPG character sprite of ${guest.description}.
Tuxemon game style: large round head relative to small body, standing front-facing upright,
simple 3-4 color tones per element, visible pixel grid at ~32x48px scale,
warm friendly expression, clean white background. No text, no borders.`;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
    style: 'vivid',
  });

  return { url: response.data[0].url };
}

async function generateSprites() {
  // Load all four reference images
  const refs = ['ref1.png', 'ref2.png', 'ref3.png', 'ref4.png'].map(loadRefBase64);
  const validRefs = refs.filter(Boolean);
  console.log(`Loaded ${validRefs.length}/4 style reference images`);

  for (const guest of guests) {
    const filepath = path.join(SPRITE_DIR, `${guest.id}.png`);

    if (!FORCE && fs.existsSync(filepath) && fs.statSync(filepath).size > 1000) {
      console.log(`✓ ${guest.id} already exists (skip)`);
      continue;
    }

    console.log(`Generating ${guest.id}...`);
    try {
      if (validRefs.length > 0) {
        // Try gpt-image-1 with style references
        try {
          const imgBuffer = await generateWithGptImage1(guest, validRefs);
          fs.writeFileSync(filepath, imgBuffer);
          console.log(`✓ ${guest.id}.png (gpt-image-1 style transfer)`);
        } catch (err) {
          console.warn(`  gpt-image-1 failed (${err.message}), falling back to DALL-E 3...`);
          const result = await generateWithDallE3Fallback(guest);
          await downloadImage(result.url, filepath);
          console.log(`✓ ${guest.id}.png (DALL-E 3 fallback)`);
        }
      } else {
        // No refs available, use DALL-E 3
        const result = await generateWithDallE3Fallback(guest);
        await downloadImage(result.url, filepath);
        console.log(`✓ ${guest.id}.png (DALL-E 3)`);
      }

      // Rate limit pause
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`✗ Failed ${guest.id}:`, err.message);
    }
  }
  console.log('Done!');
}

generateSprites();
