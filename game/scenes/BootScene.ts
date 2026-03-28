import * as Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {}

  create() {
    this.generateTileTextures();
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
        // Long hair - covers top + side extensions
        ctx.fillRect(cx - 5, 1, 10, 5);
        ctx.fillRect(cx - 7, 3, 2, 10);
        ctx.fillRect(cx + 5, 3, 2, 10);
      } else if (hairStyle === 'short') {
        ctx.fillRect(cx - 5, 1, 10, 4);
      } else {
        // Normal hair
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
      // Mouth hint
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

  private generateTileTextures() {
    // ── Grass tile (32x32) ──
    this.tex('tile_grass', 32, 32, (ctx) => {
      ctx.fillStyle = '#78C850';
      ctx.fillRect(0, 0, 32, 32);
      // Subtle dot texture
      ctx.fillStyle = '#58A838';
      [[4,4],[12,8],[20,14],[8,22],[26,6],[16,20],[6,14],[24,26],[14,28],[22,4],[30,18]].forEach(([x,y]) => {
        ctx.fillRect(x, y, 2, 2);
      });
      // Darker edge bottom-right for shading
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(28, 0, 4, 32);
      ctx.fillRect(0, 28, 32, 4);
    });

    // ── Dirt path tile (32x32) ──
    this.tex('tile_dirt', 32, 32, (ctx) => {
      ctx.fillStyle = '#E8D0A0';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#C8B070';
      [[5,5],[18,12],[10,24],[25,18],[3,18],[15,6],[27,28],[8,15],[22,8]].forEach(([x,y]) => {
        ctx.fillRect(x, y, 1, 1);
      });
      // Slightly darker edges
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, 1, 32); ctx.fillRect(31, 0, 1, 32);
      ctx.fillRect(0, 0, 32, 1); ctx.fillRect(0, 31, 32, 1);
    });

    // ── Tree tile (32x32) ──
    this.tex('tile_tree', 32, 32, (ctx) => {
      // Grass background
      ctx.fillStyle = '#78C850';
      ctx.fillRect(0, 0, 32, 32);
      // Trunk
      ctx.fillStyle = '#805030';
      ctx.fillRect(13, 22, 6, 10);
      ctx.fillStyle = '#6A4020';
      ctx.fillRect(14, 22, 1, 10);
      // Tree layers (dark base → medium → light top)
      const tri = (color: string, tipY: number, baseY: number, baseW: number) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(16, tipY);
        ctx.lineTo(16 - baseW / 2, baseY);
        ctx.lineTo(16 + baseW / 2, baseY);
        ctx.closePath();
        ctx.fill();
      };
      tri('#1a6b35', 7, 27, 28);  // dark shadow base
      tri('#389858', 5, 25, 26);  // main mid
      tri('#58C878', 3, 18, 18);  // light top
      // Highlight dots
      ctx.fillStyle = '#78D898';
      ctx.fillRect(13, 5, 3, 3);
      ctx.fillRect(10, 13, 2, 2);
      ctx.fillRect(19, 11, 2, 2);
    });

    // ── Water/Fountain tile (32x32) ──
    this.tex('tile_water', 32, 32, (ctx) => {
      ctx.fillStyle = '#6890F0';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = 'rgba(136,176,255,0.55)';
      ctx.fillRect(4, 4, 6, 4);
      ctx.fillRect(20, 16, 5, 4);
      ctx.fillStyle = 'rgba(72,112,208,0.35)';
      ctx.fillRect(10, 18, 8, 4);
    });

    // ── Fence tile horizontal (32x32) ──
    this.tex('tile_fence_h', 32, 32, (ctx) => {
      ctx.fillStyle = '#78C850'; ctx.fillRect(0, 0, 32, 32);
      // Post
      ctx.fillStyle = '#805030'; ctx.fillRect(14, 8, 4, 16);
      ctx.fillStyle = '#6A4020'; ctx.fillRect(14, 8, 1, 16);
      // Rails
      ctx.fillStyle = '#A06840'; ctx.fillRect(0, 11, 32, 3);
      ctx.fillStyle = '#A06840'; ctx.fillRect(0, 17, 32, 2);
      // Weathering
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(0, 11, 32, 1);
      ctx.fillRect(0, 17, 32, 1);
    });

    // ── Fence tile vertical (32x32) ──
    this.tex('tile_fence_v', 32, 32, (ctx) => {
      ctx.fillStyle = '#78C850'; ctx.fillRect(0, 0, 32, 32);
      // Post
      ctx.fillStyle = '#805030'; ctx.fillRect(8, 14, 16, 4);
      ctx.fillStyle = '#6A4020'; ctx.fillRect(8, 14, 16, 1);
      // Rails
      ctx.fillStyle = '#A06840'; ctx.fillRect(12, 0, 3, 32);
      ctx.fillStyle = '#A06840'; ctx.fillRect(18, 0, 2, 32);
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(12, 0, 1, 32);
    });

    // ── Building wall tile (32x32) ──
    this.tex('tile_building_wall', 32, 32, (ctx) => {
      ctx.fillStyle = '#D4C4A0';
      ctx.fillRect(0, 0, 32, 32);
      // Brick lines every 8px
      ctx.strokeStyle = '#B8A880';
      ctx.lineWidth = 1;
      for (let row = 0; row < 5; row++) {
        const y = row * 8;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(32, y); ctx.stroke();
        // Alternating vertical joints
        const off = (row % 2) * 10;
        for (let jx = off; jx < 36; jx += 20) {
          ctx.beginPath(); ctx.moveTo(jx, y); ctx.lineTo(jx, y + 8); ctx.stroke();
        }
      }
    });

    // ── Roof dark tile (32x32) ──
    this.tex('tile_roof_dark', 32, 32, (ctx) => {
      ctx.fillStyle = '#4A3828';
      ctx.fillRect(0, 0, 32, 32);
      // Horizontal plank lines every 4px
      ctx.strokeStyle = '#3A2818';
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        ctx.beginPath(); ctx.moveTo(0, i * 4); ctx.lineTo(32, i * 4); ctx.stroke();
      }
      // Overhang shadow at top
      ctx.fillStyle = '#2A1808';
      ctx.fillRect(0, 0, 32, 4);
    });

    // ── Roof red tile (32x32) ──
    this.tex('tile_roof_red', 32, 32, (ctx) => {
      ctx.fillStyle = '#C03028';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#A02018';
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        ctx.beginPath(); ctx.moveTo(0, i * 4); ctx.lineTo(32, i * 4); ctx.stroke();
      }
      ctx.fillStyle = '#801818';
      ctx.fillRect(0, 0, 32, 4);
    });

    // ── Building window tile (32x32) ──
    this.tex('tile_building_window', 32, 32, (ctx) => {
      ctx.fillStyle = '#D4C4A0';
      ctx.fillRect(0, 0, 32, 32);
      // Window glass (blue)
      ctx.fillStyle = '#A0C8E8';
      ctx.fillRect(8, 8, 16, 14);
      // Window frame cross
      ctx.fillStyle = '#F0F0F0';
      ctx.fillRect(15, 8, 2, 14);
      ctx.fillRect(8, 14, 16, 2);
      // Window border
      ctx.strokeStyle = '#606040';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, 8, 16, 14);
    });

    // ── Sign tile (32x32) ──
    this.tex('tile_sign', 32, 32, (ctx) => {
      ctx.fillStyle = '#78C850'; ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#A07040'; ctx.fillRect(14, 18, 4, 14);
      ctx.fillStyle = '#D0A060'; ctx.fillRect(6, 8, 20, 13);
      ctx.strokeStyle = '#806030'; ctx.lineWidth = 1;
      ctx.strokeRect(6, 8, 20, 13);
    });

    // ── Floor tile (32x32) ──
    this.tex('tile_floor', 32, 32, (ctx) => {
      ctx.fillStyle = '#D0B890';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, 32, 32);
    });

    // ── Flower tile (32x32) — grass with 2 pixel-art flowers ──
    this.tex('tile_flower', 32, 32, (ctx) => {
      // Grass base
      ctx.fillStyle = '#78C850'; ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#58A838';
      [[4,4],[20,14],[8,22]].forEach(([x,y]) => ctx.fillRect(x, y, 2, 2));
      // Two flowers at (8,18) and (22,14)
      [[8, 18], [22, 14]].forEach(([cx, cy]) => {
        // Stem
        ctx.fillStyle = '#389858'; ctx.fillRect(cx, cy, 1, 4);
        // Petals
        ctx.fillStyle = '#F080A0';
        ctx.fillRect(cx - 2, cy - 2, 2, 2); // left
        ctx.fillRect(cx + 1, cy - 2, 2, 2); // right
        ctx.fillRect(cx - 1, cy - 4, 2, 2); // top
        ctx.fillRect(cx - 1, cy,     2, 2); // bottom
        // Center
        ctx.fillStyle = '#F0D000'; ctx.fillRect(cx - 1, cy - 2, 2, 2);
      });
    });
  }

  private generatePlayerTextures() {
    // player_front: used for down / left / right directions (flip for left)
    this.tex('player_front', 32, 32, (ctx) => {
      this.drawChibi(ctx, {
        skinColor: '#F0C090',
        hairColor: '#6B3E2A',
        outfitColor: '#2850A0',
        hairStyle: 'normal',
        back: false,
      });
    });

    // player_back: used for up direction
    this.tex('player_back', 32, 32, (ctx) => {
      this.drawChibi(ctx, {
        skinColor: '#F0C090',
        hairColor: '#6B3E2A',
        outfitColor: '#2850A0',
        hairStyle: 'normal',
        back: true,
      });
    });
  }

  private generateNPCTextures() {
    // Each NPC with distinctive appearance matching the real person
    const npcs: Array<{
      hairStyle: 'normal' | 'long' | 'bald' | 'short';
      hairColor: string;
      outfitColor: string;
      tieColor?: string;
    }> = [
      // 0: Marc Andreessen — bald, navy blue suit
      { hairStyle: 'bald',   hairColor: '#202020', outfitColor: '#1A237E' },
      // 1: Ben Horowitz — short dark hair, dark suit, red tie
      { hairStyle: 'short',  hairColor: '#2C2C2C', outfitColor: '#2C2C3E', tieColor: '#880000' },
      // 2: Lisa Su — normal black hair, red/orange blazer
      { hairStyle: 'normal', hairColor: '#1A1A1A', outfitColor: '#CC4400' },
      // 3: Alexandr Wang — normal dark hair, gray casual
      { hairStyle: 'normal', hairColor: '#2C2C2C', outfitColor: '#607080' },
      // 4: Jensen Huang — silver hair, black leather jacket
      { hairStyle: 'normal', hairColor: '#C0C0C0', outfitColor: '#1A1A1A' },
      // 5: Sarah Guo — long dark hair, pink top
      { hairStyle: 'long',   hairColor: '#1A1A1A', outfitColor: '#E07090' },
      // 6: Elad Gil — normal dark hair, purple shirt
      { hairStyle: 'normal', hairColor: '#2C2C2C', outfitColor: '#604090' },
      // 7: Andrew Chen — normal dark hair, orange hoodie
      { hairStyle: 'normal', hairColor: '#2C2C2C', outfitColor: '#CC6600' },
      // 8: Sonal Chokshi — normal dark hair, teal outfit
      { hairStyle: 'normal', hairColor: '#1A1A1A', outfitColor: '#207070' },
      // 9: David George — short dark hair, dark suit, red tie
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

    // HP bar background
    g.fillStyle(0x404040); g.fillRect(0, 0, 200, 20);
    g.fillStyle(0x202020); g.fillRect(2, 2, 196, 16);
    g.generateTexture('hpbar_bg', 200, 20);

    // HP bar fill
    g.clear();
    g.fillStyle(0x40C840); g.fillRect(0, 0, 196, 16);
    g.generateTexture('hpbar_fill', 196, 16);

    // Pokéball
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
