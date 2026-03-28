const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const TILE_SIZE = 32;
const OUT_DIR = path.join(__dirname, '../public/assets/tilesets');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function saveTile(name, w, h, drawFn) {
  const canvas = createCanvas(w || TILE_SIZE, h || TILE_SIZE);
  const ctx = canvas.getContext('2d');
  drawFn(ctx, canvas);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT_DIR, `${name}.png`), buffer);
  console.log(`Generated ${name}.png (${w || TILE_SIZE}x${h || TILE_SIZE})`);
}

// ── Grass tile (32x32) — D/P style: lighter, diamond dot pattern ──
saveTile('grass', 32, 32, (ctx) => {
  ctx.fillStyle = '#7EC850';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#5EA830';
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const x = col * 8 + (row % 2 === 0 ? 0 : 4);
      const y = row * 8 - 4;
      if (x < 32 && y >= 0 && y < 32) ctx.fillRect(x, y, 2, 2);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  ctx.fillRect(30, 0, 2, 32);
  ctx.fillRect(0, 30, 32, 2);
});

// ── Dirt path tile (32x32) — D/P sandy beige ──
saveTile('dirt', 32, 32, (ctx) => {
  ctx.fillStyle = '#E8D890';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#F0E0A0';
  [[5,5],[18,3],[8,14],[24,18],[13,8],[28,10],[3,24],[19,28]].forEach(([x,y]) => {
    ctx.fillRect(x, y, 3, 2);
  });
  ctx.fillStyle = '#C8B870';
  [[10,12],[22,8],[6,20],[28,24]].forEach(([x,y]) => {
    ctx.fillRect(x, y, 2, 2);
  });
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, 1, 32); ctx.fillRect(31, 0, 1, 32);
  ctx.fillRect(0, 0, 32, 1); ctx.fillRect(0, 31, 32, 1);
});

// ── Tree tile (32x32) — round fluffy D/P canopy ──
saveTile('tree', 32, 32, (ctx) => {
  // Grass background
  ctx.fillStyle = '#7EC850';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#5EA830';
  [[4,22],[20,26],[26,18]].forEach(([x,y]) => ctx.fillRect(x, y, 2, 2));

  // Trunk
  ctx.fillStyle = '#6B3A20';
  ctx.fillRect(13, 22, 6, 10);
  ctx.fillStyle = '#4A2810';
  ctx.fillRect(13, 22, 2, 10);

  // Shadow/base ellipse under canopy
  ctx.fillStyle = '#1A5028';
  ctx.beginPath();
  ctx.ellipse(16, 22, 13, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark outer canopy
  ctx.fillStyle = '#2A7838';
  ctx.beginPath();
  ctx.arc(16, 14, 13, 0, Math.PI * 2);
  ctx.fill();

  // Main canopy
  ctx.fillStyle = '#48A848';
  ctx.beginPath();
  ctx.arc(16, 12, 11, 0, Math.PI * 2);
  ctx.fill();

  // Mid highlight
  ctx.fillStyle = '#6ABE50';
  ctx.beginPath();
  ctx.arc(15, 9, 7, 0, Math.PI * 2);
  ctx.fill();

  // Top highlight
  ctx.fillStyle = '#8AD870';
  ctx.beginPath();
  ctx.arc(14, 6, 4, 0, Math.PI * 2);
  ctx.fill();

  // Specular highlight
  ctx.fillStyle = '#A8EC88';
  ctx.beginPath();
  ctx.arc(13, 4, 2, 0, Math.PI * 2);
  ctx.fill();

  // Brightest point
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.arc(12, 3, 1, 0, Math.PI * 2);
  ctx.fill();
});

// ── Water tile (32x32) ──
saveTile('water', 32, 32, (ctx) => {
  ctx.fillStyle = '#5878E8';
  ctx.fillRect(0, 0, 32, 32);
  ctx.strokeStyle = '#7898F0';
  ctx.lineWidth = 1;
  for (let i = -32; i < 64; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 32, 32);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  [[4,4],[20,8],[8,20],[24,16],[14,26]].forEach(([x,y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(0, 0, 1, 32);
  ctx.fillRect(0, 0, 32, 1);
  ctx.fillRect(31, 0, 1, 32);
  ctx.fillRect(0, 31, 32, 1);
});

// ── Stone plaza tile (32x32) ──
saveTile('stone', 32, 32, (ctx) => {
  ctx.fillStyle = '#C0B8A8';
  ctx.fillRect(0, 0, 32, 32);
  ctx.strokeStyle = '#A0988A';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, 15, 15);
  ctx.strokeRect(16.5, 0.5, 15, 15);
  ctx.strokeRect(0.5, 16.5, 15, 15);
  ctx.strokeRect(16.5, 16.5, 15, 15);
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(1, 1, 14, 5); ctx.fillRect(17, 1, 14, 5);
  ctx.fillRect(1, 17, 14, 5); ctx.fillRect(17, 17, 14, 5);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(2, 12, 12, 3); ctx.fillRect(18, 12, 12, 3);
  ctx.fillRect(2, 28, 12, 3); ctx.fillRect(18, 28, 12, 3);
});

// ── Fence tile horizontal (32x32) ──
saveTile('fence_h', 32, 32, (ctx) => {
  ctx.fillStyle = '#7EC850'; ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#5EA830';
  [[4,4],[20,14]].forEach(([x,y]) => ctx.fillRect(x, y, 2, 2));
  ctx.fillStyle = '#907040'; ctx.fillRect(14, 6, 4, 20);
  ctx.fillStyle = '#705030'; ctx.fillRect(14, 6, 1, 20);
  ctx.fillStyle = '#B09050'; ctx.fillRect(0, 10, 32, 4);
  ctx.fillStyle = '#B09050'; ctx.fillRect(0, 18, 32, 3);
  ctx.fillStyle = '#705030'; ctx.fillRect(0, 14, 32, 1);
  ctx.fillStyle = '#705030'; ctx.fillRect(0, 21, 32, 1);
});

// ── Fence tile vertical (32x32) ──
saveTile('fence_v', 32, 32, (ctx) => {
  ctx.fillStyle = '#7EC850'; ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#5EA830';
  [[4,4],[20,14]].forEach(([x,y]) => ctx.fillRect(x, y, 2, 2));
  ctx.fillStyle = '#907040'; ctx.fillRect(6, 14, 20, 4);
  ctx.fillStyle = '#705030'; ctx.fillRect(6, 14, 20, 1);
  ctx.fillStyle = '#B09050'; ctx.fillRect(10, 0, 4, 32);
  ctx.fillStyle = '#B09050'; ctx.fillRect(18, 0, 3, 32);
  ctx.fillStyle = '#705030'; ctx.fillRect(10, 0, 1, 32);
});

// ── Building wall tile (32x32) — D/P cream facade ──
saveTile('building_wall', 32, 32, (ctx) => {
  ctx.fillStyle = '#E8E0C8';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#A0C8F0';
  ctx.fillRect(3, 5, 11, 9);
  ctx.strokeStyle = '#908878';
  ctx.lineWidth = 1;
  ctx.strokeRect(3, 5, 11, 9);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(8, 5, 1, 9);
  ctx.fillRect(3, 9, 11, 1);
  ctx.fillStyle = '#A0C8F0';
  ctx.fillRect(18, 5, 11, 9);
  ctx.strokeStyle = '#908878';
  ctx.strokeRect(18, 5, 11, 9);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(23, 5, 1, 9);
  ctx.fillRect(18, 9, 11, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, 0, 32, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(0, 30, 32, 2);
});

// ── Roof dark tile (32x32) — D/P tan/beige oblique roof ──
saveTile('roof_dark', 32, 32, (ctx) => {
  ctx.fillStyle = '#C8A870';
  ctx.fillRect(0, 0, 32, 32);
  ctx.strokeStyle = '#B09060';
  ctx.lineWidth = 1;
  for (let i = 8; i < 32; i += 8) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(32, i); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, 0, 3, 32);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(3, 0, 29, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(0, 29, 32, 3);
});

// ── Roof red tile (32x32) — PokéCenter bright red roof ──
saveTile('roof_red', 32, 32, (ctx) => {
  ctx.fillStyle = '#E83020';
  ctx.fillRect(0, 0, 32, 32);
  ctx.strokeStyle = '#C02010';
  ctx.lineWidth = 1;
  for (let i = 8; i < 32; i += 8) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(32, i); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, 0, 3, 32);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(3, 0, 29, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 29, 32, 3);
});

// ── Building window tile (32x32) ──
saveTile('building_window', 32, 32, (ctx) => {
  ctx.fillStyle = '#E8E0C8';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#A0C8F0';
  ctx.fillRect(7, 7, 18, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(15, 7, 2, 14);
  ctx.fillRect(7, 13, 18, 2);
  ctx.strokeStyle = '#707060';
  ctx.lineWidth = 1;
  ctx.strokeRect(7, 7, 18, 14);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, 0, 32, 2);
});

// ── Sign tile (32x32) ──
saveTile('sign', 32, 32, (ctx) => {
  ctx.fillStyle = '#7EC850'; ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#5EA830';
  [[4,4],[20,14]].forEach(([x,y]) => ctx.fillRect(x, y, 2, 2));
  ctx.fillStyle = '#907040'; ctx.fillRect(14, 18, 4, 14);
  ctx.fillStyle = '#705030'; ctx.fillRect(14, 18, 1, 14);
  ctx.fillStyle = '#D0A060'; ctx.fillRect(5, 6, 22, 15);
  ctx.fillStyle = '#E0B870'; ctx.fillRect(6, 7, 20, 5);
  ctx.strokeStyle = '#806030'; ctx.lineWidth = 1;
  ctx.strokeRect(5, 6, 22, 15);
  ctx.fillStyle = '#705028';
  ctx.fillRect(9, 12, 14, 2);
  ctx.fillRect(9, 16, 10, 2);
});

// ── Floor tile (32x32) ──
saveTile('floor', 32, 32, (ctx) => {
  ctx.fillStyle = '#D0B890';
  ctx.fillRect(0, 0, 32, 32);
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(16, 32); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 16); ctx.lineTo(32, 16); ctx.stroke();
  ctx.strokeRect(0, 0, 32, 32);
});

// ── Door tile (32x32) ──
saveTile('door', 32, 32, (ctx) => {
  ctx.fillStyle = '#E8E0C8';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#8B5E3C';
  ctx.fillRect(9, 2, 14, 30);
  ctx.fillStyle = '#B8D8F0';
  ctx.fillRect(10, 4, 6, 16);
  ctx.fillRect(16, 4, 6, 16);
  ctx.fillStyle = '#8B5E3C';
  ctx.fillRect(15, 3, 2, 26);
  ctx.fillStyle = '#D4A020';
  ctx.fillRect(14, 16, 2, 2);
  ctx.fillRect(16, 16, 2, 2);
  ctx.fillStyle = '#C8C0A8';
  ctx.fillRect(7, 28, 18, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, 0, 32, 2);
});

// ── Flower tile (32x32) ──
saveTile('flower', 32, 32, (ctx) => {
  ctx.fillStyle = '#7EC850'; ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#5EA830';
  [[4,4],[20,14],[8,22]].forEach(([x,y]) => ctx.fillRect(x, y, 2, 2));

  const drawFlower = (cx, cy) => {
    ctx.fillStyle = '#4A9840';
    ctx.fillRect(cx, cy + 1, 2, 5);
    ctx.fillStyle = '#F090B0';
    ctx.fillRect(cx - 2, cy, 2, 3);
    ctx.fillRect(cx + 2, cy, 2, 3);
    ctx.fillRect(cx, cy - 2, 2, 3);
    ctx.fillRect(cx, cy + 3, 2, 2);
    ctx.fillStyle = '#F0D040';
    ctx.fillRect(cx, cy, 2, 2);
  };
  drawFlower(7, 17);
  drawFlower(22, 11);
});

console.log('\nAll tiles generated!');
