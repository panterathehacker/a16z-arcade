const { createCanvas, loadImage } = require('canvas');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Gentle flood fill from edges - remove pixels matching color within threshold
function floodFillTransparent(data, w, h, bgR, bgG, bgB, threshold) {
  const visited = new Uint8Array(w * h);
  const queue = [];
  for (let x = 0; x < w; x++) {
    queue.push(x);
    queue.push(x + (h - 1) * w);
  }
  for (let y = 1; y < h - 1; y++) {
    queue.push(y * w);
    queue.push((w - 1) + y * w);
  }
  while (queue.length > 0) {
    const idx = queue.pop();
    if (visited[idx]) continue;
    visited[idx] = 1;
    const pi = idx * 4;
    const r = data[pi], g = data[pi + 1], b = data[pi + 2], a = data[pi + 3];
    if (a === 0) continue;
    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
    if (dist < threshold) {
      data[pi + 3] = 0;
      const x = idx % w, y = Math.floor(idx / w);
      if (x > 0) queue.push(idx - 1);
      if (x < w - 1) queue.push(idx + 1);
      if (y > 0) queue.push(idx - w);
      if (y < h - 1) queue.push(idx + w);
    }
  }
}

async function fixPlayer() {
  console.log('=== Fixing player.png ===');
  const img = await loadImage('/tmp/player_orig.png');
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const w = canvas.width, h = canvas.height;

  // Sample corner bg color
  const bgR = data[0], bgG = data[1], bgB = data[2];
  console.log('Player orig corner color:', bgR, bgG, bgB);

  // Gentle approach: only remove pixels very close to white (threshold 15)
  // since the original is near-white (244,241,232)
  floodFillTransparent(data, w, h, bgR, bgG, bgB, 20);

  ctx.putImageData(imageData, 0, 0);

  let opaque = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 128) opaque++;
  console.log('Opaque pixels after strip:', opaque, 'of', w * h);

  const buf = canvas.toBuffer('image/png');
  const resized = await sharp(buf).resize(128, 192, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  }).png().toBuffer();

  fs.writeFileSync('public/assets/sprites/guests/player.png', resized);
  console.log('player.png fixed, size:', resized.length);

  // Verify
  const verImg = await loadImage('public/assets/sprites/guests/player.png');
  const vc = createCanvas(verImg.width, verImg.height);
  const vctx = vc.getContext('2d');
  vctx.drawImage(verImg, 0, 0);
  const vd = vctx.getImageData(0, 0, vc.width, vc.height).data;
  let vOpaque = 0;
  for (let i = 3; i < vd.length; i += 4) if (vd[i] > 128) vOpaque++;
  console.log('Verified player.png opaque pixels:', vOpaque, 'of', vc.width * vc.height);
}

async function fixSprite(fp, threshold = 40) {
  const img = await loadImage(fp);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const w = canvas.width, h = canvas.height;

  // Sample corner
  const bgR = data[0], bgG = data[1], bgB = data[2], bgA = data[3];

  // If corner is already transparent or very near white, skip
  if (bgA < 10) {
    // Already transparent
    return { skipped: true, reason: 'corner already transparent' };
  }
  const nearWhite = bgR > 230 && bgG > 230 && bgB > 230;
  if (nearWhite) {
    // Use simple threshold approach for white backgrounds
    floodFillTransparent(data, w, h, 255, 255, 255, 30);
  } else {
    // Use color-distance flood fill with sampled bg color
    floodFillTransparent(data, w, h, bgR, bgG, bgB, threshold);
  }

  ctx.putImageData(imageData, 0, 0);
  fs.writeFileSync(fp, canvas.toBuffer('image/png'));
  return { fixed: true, bgR, bgG, bgB, bgA };
}

async function fixDavidGeorge() {
  console.log('\n=== Fixing david-george.png ===');
  const fp = 'public/assets/sprites/guests/david-george.png';
  const result = await fixSprite(fp, 40);
  console.log('David George result:', result);
}

async function checkAndFixAllSprites() {
  console.log('\n=== Checking all sprites ===');
  const spritesDir = 'public/assets/sprites/guests';
  const files = fs.readdirSync(spritesDir).filter(f => f.endsWith('.png') && f !== 'player.png');

  for (const file of files) {
    const fp = path.join(spritesDir, file);
    try {
      const img = await loadImage(fp);
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height).data;

      const bgR = data[0], bgG = data[1], bgB = data[2], bgA = data[3];
      const nearWhite = bgR > 230 && bgG > 230 && bgB > 230;
      const transparent = bgA < 10;

      if (!transparent && !nearWhite) {
        console.log(`${file}: non-white/non-transparent corner (${bgR},${bgG},${bgB},${bgA}) - FIXING`);
        const result = await fixSprite(fp, 40);
        console.log(`  -> ${JSON.stringify(result)}`);
      } else if (!transparent && nearWhite) {
        // Check if there's actually a white background issue
        // Only fix if it really has a white bg (look at multiple corners)
        const w = img.width, h = img.height;
        const tr = data[(w - 1) * 4], tg = data[(w - 1) * 4 + 1], tb = data[(w - 1) * 4 + 2], ta = data[(w - 1) * 4 + 3];
        if (ta > 10 && tr > 230 && tg > 230 && tb > 230) {
          console.log(`${file}: white background detected - FIXING`);
          await fixSprite(fp, 30);
        } else {
          console.log(`${file}: corner (${bgR},${bgG},${bgB},${bgA}) - near white but ok`);
        }
      } else {
        console.log(`${file}: corner transparent or white-ish - OK`);
      }
    } catch (e) {
      console.log(`${file}: ERROR -`, e.message);
    }
  }
}

async function main() {
  await fixPlayer();
  await fixDavidGeorge();
  await checkAndFixAllSprites();
  console.log('\nAll sprite fixes complete!');
}

main().catch(console.error);
