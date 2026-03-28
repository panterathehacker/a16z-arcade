const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const SPRITE_DIR = path.join(__dirname, '../public/assets/sprites/guests');

async function stripBackground(filepath) {
  try {
    const img = await loadImage(filepath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width, h = canvas.height;
    
    // Flood fill from all edges to find and remove background
    const visited = new Uint8Array(w * h);
    const queue = [];
    
    // Seed from all 4 edges
    for (let x = 0; x < w; x++) { 
      queue.push(x + 0 * w); 
      queue.push(x + (h-1) * w); 
    }
    for (let y = 1; y < h-1; y++) { 
      queue.push(0 + y * w); 
      queue.push((w-1) + y * w); 
    }
    
    while (queue.length > 0) {
      const idx = queue.pop();
      if (visited[idx]) continue;
      visited[idx] = 1;
      
      const pi = idx * 4;
      const r = data[pi], g = data[pi+1], b = data[pi+2];
      
      // Is this pixel "background-ish"? Light/white/near-white
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
      const saturation = Math.max(r,g,b) - Math.min(r,g,b);
      
      // Background criteria: bright AND low saturation (white/gray/light)
      if (brightness > 220 && saturation < 30) {
        data[pi+3] = 0; // transparent
        
        const x = idx % w, y = Math.floor(idx / w);
        if (x > 0) queue.push(idx - 1);
        if (x < w-1) queue.push(idx + 1);
        if (y > 0) queue.push(idx - w);
        if (y < h-1) queue.push(idx + w);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    fs.writeFileSync(filepath, canvas.toBuffer('image/png'));
    return true;
  } catch (e) {
    console.error(`Failed ${path.basename(filepath)}:`, e.message);
    return false;
  }
}

async function main() {
  const files = fs.readdirSync(SPRITE_DIR).filter(f => f.endsWith('.png'));
  console.log(`Processing ${files.length} sprites...`);
  
  for (const file of files) {
    const filepath = path.join(SPRITE_DIR, file);
    const success = await stripBackground(filepath);
    console.log(`${success ? '✓' : '✗'} ${file}`);
  }
  console.log('Done!');
}

main();
