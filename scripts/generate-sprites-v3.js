const OpenAI = require('openai');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({ 
  apiKey: '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'
});

const SPRITE_DIR = path.join(__dirname, '../public/assets/sprites/guests');
fs.mkdirSync(SPRITE_DIR, { recursive: true });

// Remove old sprites (except ones already generated successfully)
const alreadyDone = new Set(
  fs.readdirSync(SPRITE_DIR).filter(f => f.endsWith('.png')).map(f => f.replace('.png', ''))
);
console.log('Already generated:', [...alreadyDone].join(', ') || 'none');

const guests = [
  { id: 'marc-andreessen', desc: 'middle-aged man, bald head, dark navy business suit, white dress shirt, necktie, confident executive look' },
  { id: 'ben-horowitz', desc: 'middle-aged man, short hair, dark business suit, confident powerful stance' },
  { id: 'lisa-su', desc: 'middle-aged woman, short dark hair, bright red blazer, professional executive look' },
  { id: 'alexandr-wang', desc: 'young man in his 20s, dark hair, casual gray hoodie, startup founder style' },
  { id: 'jensen-huang', desc: 'older man, silver-gray hair, all-black leather jacket, tech CEO iconic look' },
  { id: 'sarah-guo', desc: 'young woman, long dark hair, pink top, venture capitalist style' },
  { id: 'elad-gil', desc: 'middle-aged man, dark hair, purple casual button-up shirt, relaxed tech style' },
  { id: 'andrew-chen', desc: 'young man, dark hair, bright orange hoodie, casual tech style' },
  { id: 'sonal-chokshi', desc: 'woman, long dark curly hair, teal blue top, media personality style' },
  { id: 'david-george', desc: 'middle-aged man, dark hair, dark suit, red tie, formal business look' },
  { id: 'player', desc: 'young adventurer, brown hair, blue jacket, jeans, hero protagonist style' },
];

function downloadUrl(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/*' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(filepath);
        return downloadUrl(res.headers.location, filepath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', reject);
  });
}

// Remove white/light background from image using canvas
async function removeBackground(inputPath, outputPath) {
  try {
    const { createCanvas, loadImage } = require('canvas');
    const img = await loadImage(inputPath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Sample corner pixels to determine background color
    const corners = [
      [data[0], data[1], data[2]], // top-left
      [data[(canvas.width-1)*4], data[(canvas.width-1)*4+1], data[(canvas.width-1)*4+2]], // top-right
      [data[(canvas.height-1)*canvas.width*4], data[(canvas.height-1)*canvas.width*4+1], data[(canvas.height-1)*canvas.width*4+2]], // bottom-left
    ];
    const bgR = Math.round(corners.reduce((s,c) => s+c[0], 0) / corners.length);
    const bgG = Math.round(corners.reduce((s,c) => s+c[1], 0) / corners.length);
    const bgB = Math.round(corners.reduce((s,c) => s+c[2], 0) / corners.length);
    
    // Make pixels close to background color transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      const dist = Math.sqrt((r-bgR)**2 + (g-bgG)**2 + (b-bgB)**2);
      if (dist < 40) {
        data[i+3] = 0; // transparent
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    const buf = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buf);
    return true;
  } catch (e) {
    console.log('  bg removal failed:', e.message);
    return false;
  }
}

async function generate(guest) {
  if (alreadyDone.has(guest.id)) {
    console.log(`⏭  ${guest.id}.png (already done)`);
    return;
  }

  const tmpPath = path.join(SPRITE_DIR, `${guest.id}_tmp.png`);
  const finalPath = path.join(SPRITE_DIR, `${guest.id}.png`);
  
  const prompt = `Pixel art RPG video game character sprite. FULL BODY from head to toe, front-facing, standing pose. Character description: ${guest.desc}. Art style: Pokémon trainer chibi sprite style, simple pixel art, clear bold colors, solid white background only. The ENTIRE body must be visible: head, torso, arms, legs, feet. Single character centered, no background scenery or environment.`;

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
    const size = fs.statSync(tmpPath).size;
    console.log(`  Downloaded ${size} bytes`);
    
    // Try to remove background
    const bgRemoved = await removeBackground(tmpPath, finalPath);
    if (!bgRemoved) {
      fs.renameSync(tmpPath, finalPath);
    } else {
      fs.unlinkSync(tmpPath);
      console.log(`  Background removed`);
    }
    
    console.log(`✓ ${guest.id}.png`);
    await new Promise(r => setTimeout(r, 3000));
    
  } catch (err) {
    console.error(`✗ ${guest.id}:`, err.message);
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
}

async function main() {
  for (const guest of guests) {
    await generate(guest);
  }
  
  const count = fs.readdirSync(SPRITE_DIR).filter(f => f.endsWith('.png')).length;
  console.log(`\nDone! ${count} sprites generated.`);
}

main();
