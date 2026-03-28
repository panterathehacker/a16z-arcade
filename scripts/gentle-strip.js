// scripts/gentle-strip.js
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SPRITE_DIR = 'public/assets/sprites/guests';
const SOURCE_COMMIT = '75af54a';

const toFix = process.argv.slice(2);

async function gentleStrip(filename) {
  const origPath = path.join(SPRITE_DIR, filename + '.orig.png');

  try {
    execSync(`git show ${SOURCE_COMMIT}:${SPRITE_DIR}/${filename} > ${origPath}`, { stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(`Restored ${filename} from git`);
  } catch (e) {
    console.log(`Could not restore from git for ${filename}: ${e.message.slice(0, 80)}`);
    return;
  }

  const img = await loadImage(origPath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const w = canvas.width, h = canvas.height;

  const visited = new Uint8Array(w * h);
  const queue = [];
  for (let x = 0; x < w; x++) { queue.push(x); queue.push(x + (h - 1) * w); }
  for (let y = 1; y < h - 1; y++) { queue.push(y * w); queue.push((w - 1) + y * w); }

  while (queue.length > 0) {
    const idx = queue.pop();
    if (visited[idx]) continue;
    visited[idx] = 1;
    const pi = idx * 4;
    const r = data[pi], g = data[pi + 1], b = data[pi + 2];
    if (r > 245 && g > 245 && b > 245) {
      data[pi + 3] = 0;
      const x = idx % w, y = Math.floor(idx / w);
      if (x > 0) queue.push(idx - 1);
      if (x < w - 1) queue.push(idx + 1);
      if (y > 0) queue.push(idx - w);
      if (y < h - 1) queue.push(idx + w);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  fs.writeFileSync(path.join(SPRITE_DIR, filename), canvas.toBuffer('image/png'));
  fs.unlinkSync(origPath);
  console.log(`Fixed ${filename}`);
}

async function main() {
  for (const f of toFix) {
    await gentleStrip(f);
  }
  console.log('Done!');
}
main();
