const { createCanvas } = require('canvas');
const fs = require('fs');

const canvas = createCanvas(32, 48);
const ctx = canvas.getContext('2d');

// Trunk
ctx.fillStyle = '#6B4226';
ctx.fillRect(13, 38, 6, 10);
ctx.fillStyle = '#4A2E18';
ctx.fillRect(13, 38, 2, 10);

// Shadow base  
ctx.fillStyle = '#1A5028';
ctx.beginPath();
ctx.ellipse(16, 36, 13, 7, 0, 0, Math.PI * 2);
ctx.fill();

// Dark outer canopy
ctx.fillStyle = '#2D7A3C';
ctx.beginPath();
ctx.ellipse(16, 30, 13, 13, 0, 0, Math.PI * 2);
ctx.fill();

// Main canopy
ctx.fillStyle = '#4A9E52';
ctx.beginPath();
ctx.ellipse(16, 26, 11, 11, 0, 0, Math.PI * 2);
ctx.fill();

// Light inner
ctx.fillStyle = '#68C068';
ctx.beginPath();
ctx.ellipse(15, 22, 8, 8, 0, 0, Math.PI * 2);
ctx.fill();

// Highlight
ctx.fillStyle = '#88D880';
ctx.beginPath();
ctx.ellipse(14, 19, 5, 5, 0, 0, Math.PI * 2);
ctx.fill();

// Brightest spot
ctx.fillStyle = '#A8ECA0';
ctx.beginPath();
ctx.ellipse(13, 17, 2.5, 2.5, 0, 0, Math.PI * 2);
ctx.fill();

fs.writeFileSync('public/assets/tilesets/tree.png', canvas.toBuffer('image/png'));
console.log('tree.png generated (32x48)');
