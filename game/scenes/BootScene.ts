import * as Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load the real Tuxemon tileset and map
    this.load.image('tiles', '/assets/tilemaps/tuxmon-sample-32px-extruded.png');
    this.load.tilemapTiledJSON('map', '/assets/tilemaps/tuxemon-town.json');

    // Load AI-generated guest sprites
    // Order matches GUESTS array: marc, ben, lisa, alexandr, jensen, sarah, elad, andrew, sonal, david
    const guestFiles = [
      'marc-andreessen',
      'ben-horowitz',
      'jensen-huang',
      'lisa-su',
      'alexandr-wang',
      'sam-altman',
      'fei-fei-li',
      'michael-truell',
      'mati-sheetrit',
      'dario-amodei',
      'chris-dixon',
      'vlad-tenev',
      'mark-zuckerberg',
      'andrew-chen',
      'andrew-huberman',
      'david-george',
      'wade-foster',
      'tomer-london',
      'balaji-srinivasan',
      'emmett-shear',
      'reid-hoffman',
      'steve-wozniak',
      'nicole-brichtova',
      'keith-rabois',
      'benedict-evans',
    ];
    guestFiles.forEach((id, i) => {
      this.load.image(`npc_ai_${i}`, `/assets/sprites/guests/${id}.png`);
    });
    // Also load player AI sprite
    this.load.image('player_ai', '/assets/sprites/guests/player.png');
    
    // Load both male and female player sprite sets
    for(const set of ['player-male', 'player-female']) {
      for(const dir of ['front','back','left','right']) {
        this.load.image(`${set}_${dir}`, `/assets/sprites/${set}/${dir}.png`);
      }
    }
    
    // Battle scene assets
    this.load.image('battle-bg', '/assets/battle/bg-meadow.png');
    this.load.image('battle-player-back', '/assets/battle/player-back.png');
  }

  create() {
    this.generatePlayerTextures();
    this.generateNPCTextures();
    this.generateUITextures();
    this.scene.start('WorldScene');
  }

  // Helper: create a canvas texture using the Canvas 2D API
  private tex(key: string, w: number, h: number, fn: (ctx: CanvasRenderingContext2D) => void) {
    const t = this.textures.createCanvas(key, w, h);
    if (!t) return;
    const ctx = t.getContext();
    fn(ctx);
    t.refresh();
  }

  // Draw a chibi character sprite onto a 32x32 canvas context
  private drawChibi(ctx: CanvasRenderingContext2D, opts: {
    skinColor: string;
    hairColor: string;
    outfitColor: string;
    hairStyle: 'normal' | 'long' | 'bald' | 'short';
    tieColor?: string;
    back?: boolean;
  }) {
    const { skinColor, hairColor, outfitColor, hairStyle, tieColor, back = false } = opts;
    const cx = 16;

    // Shoes
    ctx.fillStyle = '#101010';
    ctx.fillRect(cx - 6, 28, 5, 3);
    ctx.fillRect(cx + 1, 28, 5, 3);

    // Legs
    ctx.fillStyle = '#202040';
    ctx.fillRect(cx - 5, 22, 4, 7);
    ctx.fillRect(cx + 1, 22, 4, 7);

    // Body
    ctx.fillStyle = outfitColor;
    ctx.fillRect(cx - 6, 13, 12, 10);

    // Arms
    ctx.fillStyle = outfitColor;
    ctx.fillRect(cx - 10, 14, 4, 8);
    ctx.fillRect(cx + 6, 14, 4, 8);

    // Hands (skin)
    ctx.fillStyle = skinColor;
    ctx.fillRect(cx - 10, 21, 4, 3);
    ctx.fillRect(cx + 6, 21, 4, 3);

    // Neck
    ctx.fillStyle = skinColor;
    ctx.fillRect(cx - 2, 10, 4, 4);

    // Head
    ctx.fillStyle = skinColor;
    ctx.fillRect(cx - 5, 3, 10, 9);

    // Hair
    if (hairStyle !== 'bald') {
      ctx.fillStyle = hairColor;
      if (hairStyle === 'long') {
        ctx.fillRect(cx - 5, 1, 10, 5);
        ctx.fillRect(cx - 7, 3, 2, 10);
        ctx.fillRect(cx + 5, 3, 2, 10);
      } else if (hairStyle === 'short') {
        ctx.fillRect(cx - 5, 1, 10, 4);
      } else {
        ctx.fillRect(cx - 5, 1, 10, 5);
        ctx.fillRect(cx - 6, 3, 2, 5);
        ctx.fillRect(cx + 4, 3, 2, 5);
      }
    }

    // Eyes (front only)
    if (!back) {
      ctx.fillStyle = '#202020';
      ctx.fillRect(cx - 3, 8, 2, 2);
      ctx.fillRect(cx + 1, 8, 2, 2);
      ctx.fillStyle = '#C08060';
      ctx.fillRect(cx - 1, 10, 2, 1);
    }

    // Tie detail
    if (tieColor) {
      ctx.fillStyle = tieColor;
      ctx.fillRect(cx - 1, 14, 2, 7);
    }

    // Subtle body outline
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(cx - 6, 13, 12, 10);
    ctx.strokeRect(cx - 5, 3, 10, 9);
  }

  private generatePlayerTextures() {
    this.tex('player_front', 32, 32, (ctx) => {
      this.drawChibi(ctx, {
        skinColor: '#F0C090',
        hairColor: '#6B3E2A',
        outfitColor: '#2850A0',
        hairStyle: 'normal',
        back: false,
      });
    });

    this.tex('player_back', 32, 32, (ctx) => {
      this.drawChibi(ctx, {
        skinColor: '#F0C090',
        hairColor: '#6B3E2A',
        outfitColor: '#2850A0',
        hairStyle: 'normal',
        back: true,
      });
    });

    this.tex('player_right', 32, 32, (ctx) => {
      this.drawChibiSide(ctx, {
        skinColor: '#F0C090',
        hairColor: '#6B3E2A',
        outfitColor: '#2850A0',
      });
    });
  }

  private drawChibiSide(ctx: CanvasRenderingContext2D, opts: {
    skinColor: string;
    hairColor: string;
    outfitColor: string;
  }) {
    const { skinColor, hairColor, outfitColor } = opts;
    const cx = 16;

    ctx.fillStyle = '#101010';
    ctx.fillRect(cx + 1, 28, 7, 3);
    ctx.fillRect(cx - 2, 28, 5, 2);

    ctx.fillStyle = '#202040';
    ctx.fillRect(cx + 2, 22, 4, 7);
    ctx.fillRect(cx - 1, 23, 4, 6);

    ctx.fillStyle = outfitColor;
    ctx.fillRect(cx - 3, 13, 9, 10);

    ctx.fillStyle = outfitColor;
    ctx.fillRect(cx + 5, 14, 3, 8);

    ctx.fillStyle = skinColor;
    ctx.fillRect(cx + 5, 21, 3, 3);

    ctx.fillStyle = skinColor;
    ctx.fillRect(cx - 1, 10, 3, 4);

    ctx.fillStyle = skinColor;
    ctx.fillRect(cx, 3, 9, 9);

    ctx.fillStyle = '#D09070';
    ctx.fillRect(cx + 8, 7, 2, 2);

    ctx.fillStyle = '#202020';
    ctx.fillRect(cx + 6, 6, 2, 2);

    ctx.fillStyle = hairColor;
    ctx.fillRect(cx, 1, 9, 5);
    ctx.fillRect(cx - 1, 3, 2, 7);
    ctx.fillRect(cx + 8, 2, 3, 4);

    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(cx - 3, 13, 9, 10);
    ctx.strokeRect(cx, 3, 9, 9);
  }

  private generateNPCTextures() {
    const npcs: Array<{
      hairStyle: 'normal' | 'long' | 'bald' | 'short';
      hairColor: string;
      outfitColor: string;
      tieColor?: string;
    }> = [
      { hairStyle: 'bald',   hairColor: '#202020', outfitColor: '#1A237E' },
      { hairStyle: 'short',  hairColor: '#2C2C2C', outfitColor: '#2C2C3E', tieColor: '#880000' },
      { hairStyle: 'normal', hairColor: '#1A1A1A', outfitColor: '#CC4400' },
      { hairStyle: 'normal', hairColor: '#2C2C2C', outfitColor: '#607080' },
      { hairStyle: 'normal', hairColor: '#C0C0C0', outfitColor: '#1A1A1A' },
      { hairStyle: 'long',   hairColor: '#1A1A1A', outfitColor: '#E07090' },
      { hairStyle: 'normal', hairColor: '#2C2C2C', outfitColor: '#604090' },
      { hairStyle: 'normal', hairColor: '#2C2C2C', outfitColor: '#CC6600' },
      { hairStyle: 'normal', hairColor: '#1A1A1A', outfitColor: '#207070' },
      { hairStyle: 'short',  hairColor: '#2C2C2C', outfitColor: '#2C2C3E', tieColor: '#880000' },
    ];

    npcs.forEach((npc, i) => {
      this.tex(`npc_${i}`, 32, 32, (ctx) => {
        this.drawChibi(ctx, {
          skinColor: '#F0C090',
          hairColor: npc.hairColor,
          outfitColor: npc.outfitColor,
          hairStyle: npc.hairStyle,
          tieColor: npc.tieColor,
          back: false,
        });
      });
    });
  }

  private generateUITextures() {
    const g = this.make.graphics({ x: 0, y: 0 });

    g.fillStyle(0x404040); g.fillRect(0, 0, 200, 20);
    g.fillStyle(0x202020); g.fillRect(2, 2, 196, 16);
    g.generateTexture('hpbar_bg', 200, 20);

    g.clear();
    g.fillStyle(0x40C840); g.fillRect(0, 0, 196, 16);
    g.generateTexture('hpbar_fill', 196, 16);

    g.clear();
    g.fillStyle(0xFF0000); g.fillCircle(12, 8, 12);
    g.fillStyle(0xFFFFFF); g.fillCircle(12, 16, 12);
    g.fillStyle(0x000000); g.fillRect(0, 11, 24, 2);
    g.fillCircle(12, 12, 4);
    g.fillStyle(0xFFFFFF); g.fillCircle(12, 12, 2);
    g.generateTexture('pokeball', 24, 24);

    g.destroy();
  }
}
