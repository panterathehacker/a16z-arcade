const OpenAI = require('openai');
const https = require('https');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({ 
  apiKey: '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'
});

const SPRITE_DIR = path.join(__dirname, '../public/assets/sprites/guests');
fs.mkdirSync(SPRITE_DIR, { recursive: true });

const guests = [
  {
    id: 'marc-andreessen',
    prompt: 'Pixel art RPG character sprite, front-facing, Tuxemon game style, 64x64 pixels. Bald white man in his 50s wearing a dark navy business suit with white shirt, slight smile. Simple pixel art with clear facial features, dark eyes. Character stands upright facing forward. Clean white/transparent background. No text, no borders.'
  },
  {
    id: 'ben-horowitz',
    prompt: 'Pixel art RPG character sprite, front-facing, Tuxemon game style, 64x64 pixels. Black man in his 50s with short dark hair wearing a dark suit. Confident expression. Simple pixel art with clear facial features. Character stands upright facing forward. Clean white/transparent background. No text, no borders.'
  },
  {
    id: 'lisa-su',
    prompt: 'Pixel art RPG character sprite, front-facing, Tuxemon game style, 64x64 pixels. Asian woman in her 50s with short black hair wearing a red blazer over dark top. Professional confident expression. Simple pixel art with clear facial features. Character stands upright facing forward. Clean white/transparent background. No text, no borders.'
  },
  {
    id: 'alexandr-wang',
    prompt: 'Pixel art RPG character sprite, front-facing, Tuxemon game style, 64x64 pixels. Young Asian man in his mid-20s with dark hair wearing a casual gray hoodie. Confident expression. Simple pixel art with clear facial features. Character stands upright facing forward. Clean white/transparent background. No text, no borders.'
  },
  {
    id: 'jensen-huang',
    prompt: 'Pixel art RPG character sprite, front-facing, Tuxemon game style, 64x64 pixels. Asian man in his 60s with silver/gray hair wearing a distinctive all-black leather jacket. Iconic confident smirk. Simple pixel art with clear facial features. Character stands upright facing forward. Clean white/transparent background. No text, no borders.'
  },
  {
    id: 'sarah-guo',
    prompt: 'Pixel art RPG character sprite, front-facing, Tuxemon game style, 64x64 pixels. Asian woman in her 30s with long dark black hair wearing a pink top. Friendly expression. Simple pixel art with clear facial features. Character stands upright facing forward. Clean white/transparent background. No text, no borders.'
  },
  {
    id: 'elad-gil',
    prompt: 'Pixel art RPG character sprite, front-facing, Tuxemon game style, 64x64 pixels. Man with short dark hair wearing a purple casual shirt. Friendly expression. Simple pixel art with clear facial features. Character stands upright facing forward. Clean white/transparent background. No text, no borders.'
  },
  {
    id: 'andrew-chen',
    prompt: 'Pixel art RPG character sprite, front-facing, Tuxemon game style, 64x64 pixels. Asian man in his 30s with dark hair wearing an orange hoodie. Energetic friendly expression. Simple pixel art with clear facial features. Character stands upright facing forward. Clean white/transparent background. No text, no borders.'
  },
  {
    id: 'sonal-chokshi',
    prompt: 'Pixel art RPG character sprite, front-facing, Tuxemon game style, 64x64 pixels. South Asian woman with dark hair wearing a teal/dark top. Warm smile. Simple pixel art with clear facial features. Character stands upright facing forward. Clean white/transparent background. No text, no borders.'
  },
  {
    id: 'david-george',
    prompt: 'Pixel art RPG character sprite, front-facing, Tuxemon game style, 64x64 pixels. White man with dark hair wearing a dark suit with red tie. Professional expression. Simple pixel art with clear facial features. Character stands upright facing forward. Clean white/transparent background. No text, no borders.'
  },
  {
    id: 'player',
    prompt: 'Pixel art RPG character sprite, front-facing, Tuxemon game style, 64x64 pixels. Young person wearing a blue jacket and jeans, brown hair, adventurer/trainer. Simple pixel art with clear facial features. Character stands upright facing forward. Clean white/transparent background. No text, no borders.'
  }
];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

async function generateSprites() {
  for (const guest of guests) {
    const filepath = path.join(SPRITE_DIR, `${guest.id}.png`);
    
    // Skip if already generated
    if (fs.existsSync(filepath) && fs.statSync(filepath).size > 1000) {
      console.log(`✓ ${guest.id} already exists`);
      continue;
    }
    
    console.log(`Generating ${guest.id}...`);
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: guest.prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid'
      });
      
      const imageUrl = response.data[0].url;
      await downloadImage(imageUrl, filepath);
      console.log(`✓ Generated ${guest.id}.png`);
      
      // Rate limit: wait 2s between requests
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`✗ Failed ${guest.id}:`, err.message);
    }
  }
  console.log('Done!');
}

generateSprites();
