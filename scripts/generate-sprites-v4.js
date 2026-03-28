const OpenAI = require('openai');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const openai = new OpenAI({ 
  apiKey: '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'
});

const SPRITE_DIR = path.join(__dirname, '../public/assets/sprites/guests');
fs.mkdirSync(SPRITE_DIR, { recursive: true });

// Delete all existing sprites to regenerate fresh
fs.readdirSync(SPRITE_DIR).filter(f => f.endsWith('.png')).forEach(f => {
  fs.unlinkSync(path.join(SPRITE_DIR, f));
  console.log(`Deleted ${f}`);
});

const guests = [
  { id: 'marc-andreessen', desc: 'fictional tech investor character, bald, wearing a sharp navy business suit with white shirt and tie, middle-aged, confident stance' },
  { id: 'ben-horowitz', desc: 'fictional tech executive character, short dark hair, dark charcoal business suit, broad-shouldered, determined expression' },
  { id: 'lisa-su', desc: 'fictional tech CEO character, woman with short black hair, wearing a bold red blazer over a dark top, professional look' },
  { id: 'alexandr-wang', desc: 'fictional startup founder character, young man with dark hair, casual light gray hoodie and jeans, energetic posture' },
  { id: 'jensen-huang', desc: 'fictional tech visionary character, older man with silver hair, wearing an all-black outfit with a leather jacket, stylish' },
  { id: 'sarah-guo', desc: 'fictional venture capitalist character, woman with long straight black hair, pink blouse and dark trousers, poised expression' },
  { id: 'elad-gil', desc: 'fictional angel investor character, man with dark hair, wearing a purple casual button-up shirt and dark pants, relaxed stance' },
  { id: 'andrew-chen', desc: 'fictional growth hacker character, man with dark hair, bright orange hoodie and dark jeans, casual techy look' },
  { id: 'sonal-chokshi', desc: 'fictional media entrepreneur character, woman with long dark curly hair, wearing a teal blouse and black pants, expressive' },
  { id: 'david-george', desc: 'fictional fund manager character, man with dark hair, dark navy suit, red tie, crisp white shirt, formal attire' },
  { id: 'player', desc: 'fictional game hero character, young person with brown hair, blue jacket, jeans, sneakers, adventurous look' },
];

function downloadUrl(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close(); fs.unlinkSync(filepath);
        return downloadUrl(res.headers.location, filepath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', reject);
  });
}

async function removeWhiteBackground(inputPath, outputPath) {
  const img = await loadImage(inputPath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const w = canvas.width, h = canvas.height;
  const visited = new Uint8Array(w * h);
  const queue = [];
  
  // Add all edge pixels to queue
  for (let x = 0; x < w; x++) { queue.push([x, 0]); queue.push([x, h-1]); }
  for (let y = 0; y < h; y++) { queue.push([0, y]); queue.push([w-1, y]); }
  
  // Get reference background color from corner
  const cornerR = data[0], cornerG = data[1], cornerB = data[2];
  
  while (queue.length > 0) {
    const [x, y] = queue.shift();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const idx = (y * w + x);
    if (visited[idx]) continue;
    
    const pi = idx * 4;
    const r = data[pi], g = data[pi+1], b = data[pi+2];
    
    const brightness = (r + g + b) / 3;
    const distFromCorner = Math.sqrt((r-cornerR)**2 + (g-cornerG)**2 + (b-cornerB)**2);
    
    if (brightness > 200 || distFromCorner < 50) {
      visited[idx] = 1;
      data[pi+3] = 0; // transparent
      queue.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
}

async function generate(guest) {
  const tmpPath = path.join(SPRITE_DIR, `${guest.id}_tmp.png`);
  const finalPath = path.join(SPRITE_DIR, `${guest.id}.png`);
  
  const prompt = [
    `Pixel art game character sprite: a single ${guest.desc}, standing upright facing forward.`,
    `Chibi style with large head and small body, full body visible from head to feet, centered in frame.`,
    `Retro JRPG chibi art style, clean pixel art linework, bold colors.`,
    `Solid white background. Isolated character only, no scenery or environment.`,
    `One character, one static pose, occupying most of the image area.`
  ].join(' ');
  
  console.log(`Generating ${guest.id}...`);
  
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid'
    });
    
    await downloadUrl(response.data[0].url, tmpPath);
    console.log(`  Downloaded (${fs.statSync(tmpPath).size} bytes)`);
    
    try {
      await removeWhiteBackground(tmpPath, finalPath);
      fs.unlinkSync(tmpPath);
      console.log(`  ✓ Background removed`);
    } catch (e) {
      fs.renameSync(tmpPath, finalPath);
      console.log(`  ! Used original (bg removal failed: ${e.message})`);
    }
    
    console.log(`✓ ${guest.id}.png done`);
    await new Promise(r => setTimeout(r, 4000)); // rate limit
    
  } catch (err) {
    console.error(`✗ ${guest.id}: ${err.message}`);
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
}

async function main() {
  console.log('Starting sprite generation v4...\n');
  for (const guest of guests) {
    await generate(guest);
  }
  const sprites = fs.readdirSync(SPRITE_DIR).filter(f => f.endsWith('.png'));
  console.log(`\n✅ Done! Generated ${sprites.length}/11 sprites:`);
  sprites.forEach(s => console.log(`  ${s}: ${fs.statSync(path.join(SPRITE_DIR, s)).size} bytes`));
}

main().catch(console.error);
