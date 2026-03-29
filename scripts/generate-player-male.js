const OpenAI = require('openai');
const { toFile } = require('openai');
const fs = require('fs'), path = require('path');
const {createCanvas, loadImage} = require('canvas');
const sharp = require('sharp');

const openai = new OpenAI({ apiKey: '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' });

const STYLE_DIR = 'public/assets/sprites/lenny-style-refs';
const OUT_DIR = 'public/assets/sprites/player-male';
fs.mkdirSync(OUT_DIR, { recursive: true });

async function stripAndResize(buf, outputPath) {
  const img = await loadImage(buf);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0,0,canvas.width,canvas.height);
  const data = d.data, w = canvas.width, h = canvas.height;
  const visited = new Uint8Array(w*h);
  const queue = [];
  for(let x=0;x<w;x++){queue.push(x);queue.push(x+(h-1)*w);}
  for(let y=1;y<h-1;y++){queue.push(y*w);queue.push((w-1)+y*w);}
  const bgR=data[0],bgG=data[1],bgB=data[2];
  while(queue.length>0){
    const idx=queue.pop();if(visited[idx])continue;visited[idx]=1;
    const pi=idx*4;if(data[pi+3]===0)continue;
    const r=data[pi],g=data[pi+1],b=data[pi+2];
    const dist=Math.sqrt((r-bgR)**2+(g-bgG)**2+(b-bgB)**2);
    const bright=r*0.299+g*0.587+b*0.114;
    if(dist<30||(bright>235&&Math.max(r,g,b)-Math.min(r,g,b)<25)){
      data[pi+3]=0;const x=idx%w,y=Math.floor(idx/w);
      if(x>0)queue.push(idx-1);if(x<w-1)queue.push(idx+1);
      if(y>0)queue.push(idx-w);if(y<h-1)queue.push(idx+w);
    }
  }
  for(let i=0;i<data.length;i+=4){
    const a=data[i+3],r=data[i],g=data[i+1],b=data[i+2];
    if(a>128&&r>230&&g>230&&b>230){
      const x=(i/4)%w,y=Math.floor((i/4)/w);
      let tp=0,total=0;
      for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){
        if(dx===0&&dy===0)continue;
        const nx=x+dx,ny=y+dy;
        if(nx>=0&&nx<w&&ny>=0&&ny<h){total++;if(data[(ny*w+nx)*4+3]<64)tp++;}
      }
      if(tp/total>0.3)data[i+3]=0;
    }
  }
  ctx.putImageData(d,0,0);
  const outBuf=canvas.toBuffer('image/png');
  const resized=await sharp(outBuf).resize(128,192,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
  fs.writeFileSync(outputPath,resized);
}

const sprites = [
  { name: 'front', prompt: 'Transform this person into a pixel art RPG character sprite. Keep this exact person\'s likeness: dark curly hair, light beard, friendly smile, wearing casual dark top. The character faces DIRECTLY TOWARD THE CAMERA in a front-facing standing pose. Pixel art chibi style - large head relative to body, compact body, full body visible from head to feet. Plain white background only. No name or text.' },
  { name: 'back', prompt: 'Create a pixel art RPG character sprite of this person viewed from behind. The character has dark curly hair visible from behind, wearing a dark casual top. The character faces COMPLETELY AWAY from the camera - we see their back and dark hair. Walking-away pose. Pixel art chibi style - large head, compact body, full body from head to feet. Plain white background only. No name or text.' },
  { name: 'left', prompt: 'Create a pixel art RPG character sprite of this person in side profile. The character has dark curly hair and wears a dark casual top. Shown in SIDE PROFILE VIEW facing LEFT, mid-stride walk pose. Pixel art chibi style - large head, compact body, full body visible. Plain white background only. No name or text.' },
  { name: 'right', prompt: 'Create a pixel art RPG character sprite of this person in side profile. The character has dark curly hair and wears a dark casual top. Shown in SIDE PROFILE VIEW facing RIGHT, mid-stride walk pose. Pixel art chibi style - large head, compact body, full body visible. Plain white background only. No name or text.' },
];

async function generate(sprite) {
  const photoBuf = fs.readFileSync('/tmp/player-sprites/david-pantera.jpg');
  const photoFile = await toFile(photoBuf, 'david.jpg', { type: 'image/jpeg' });
  
  console.log('Generating', sprite.name, '...');
  const response = await openai.images.edit({
    model: 'gpt-image-1',
    image: photoFile,
    prompt: sprite.prompt,
    n: 1,
    size: '1024x1024'
  });
  
  const buf = Buffer.from(response.data[0].b64_json, 'base64');
  const outputPath = path.join(OUT_DIR, sprite.name + '.png');
  await stripAndResize(buf, outputPath);
  console.log('✓', sprite.name, fs.statSync(outputPath).size, 'bytes');
  await new Promise(r => setTimeout(r, 3000));
}

(async () => {
  for(const s of sprites) {
    try { await generate(s); }
    catch(e) { console.error('✗', s.name, e.message.slice(0,80)); }
  }
  console.log('Done!');
  const files = fs.readdirSync(OUT_DIR);
  files.forEach(f => console.log(f, fs.statSync(path.join(OUT_DIR,f)).size, 'bytes'));
})();
