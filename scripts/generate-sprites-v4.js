const OpenAI = require('openai');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({ 
  apiKey: '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'
});

const SPRITE_DIR = path.join(__dirname, '../public/assets/sprites/guests');

// Only generate the missing ones
const guests = [
  { id: 'marc-andreessen', desc: 'tall man, shaved head, dark navy business suit, white dress shirt, necktie' },
  { id: 'ben-horowitz', desc: 'man in his 50s, short dark hair, tailored dark suit, powerful confident stance' },
  { id: 'jensen-huang', desc: 'man with silver-gray hair, stylish all-black leather jacket, tech entrepreneur style' },
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

async function removeBackground(inputPath, outputPath) {
  try {
    const { createCanvas, loadImage } = require('canvas');
    const img = await loadImage(inputPath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const corners = [
      [data[0], data[1], data[2]],
      [data[(canvas.width-1)*4], data[(canvas.width-1)*4+1], data[(canvas.width-1)*4+2]],
      [data[(canvas.height-1)*canvas.width*4], data[(canvas.height-1)*canvas.width*4+1], data[(canvas.height-1)*canvas.width*4+2]],
    ];
    const bgR = Math.round(corners.reduce((s,c) => s+c[0], 0) / corners.length);
    const bgG = Math.round(corners.reduce((s,c) => s+c[1], 0) / corners.length);
    const bgB = Math.round(corners.reduce((s,c) => s+c[2], 0) / corners.length);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      const dist = Math.sqrt((r-bgR)**2 + (g-bgG)**2 + (b-bgB)**2);
      if (dist < 40) {
        data[i+3] = 0;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
    return true;
  } catch (e) {
    console.log('  bg removal failed:', e.message);
    return false;
  }
}

async function generate(guest) {
  const tmpPath = path.join(SPRITE_DIR, `${guest.id}_tmp.png`);
  const finalPath = path.join(SPRITE_DIR, `${guest.id}.png`);
  
  const prompt = `Pixel art RPG video game character sprite. Full body from head to toe, front-facing, standing. ${guest.desc}. Style: chibi Pokémon trainer sprite, simple pixel art, bold colors, white background only, no scenery. Show entire body: head, torso, arms, legs, feet. One character centered.`;

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
  console.log(`\nDone! ${count} sprites total.`);
}

main();
