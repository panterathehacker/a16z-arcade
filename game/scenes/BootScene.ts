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
    // ── Grass tile (32x32) — D/P style: lighter, diamond dot pattern ──
    this.tex('tile_grass', 32, 32, (ctx) => {
      ctx.fillStyle = '#7EC850';
      ctx.fillRect(0, 0, 32, 32);
      // Diamond/crosshatch pattern (offset dots every 8px, alternating rows)
      ctx.fillStyle = '#5EA830';
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const x = col * 8 + (row % 2 === 0 ? 0 : 4);
          const y = row * 8 - 4;
          if (x < 32 && y >= 0 && y < 32) ctx.fillRect(x, y, 2, 2);
        }
      }
      // Very subtle edge darkening
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      ctx.fillRect(30, 0, 2, 32);
      ctx.fillRect(0, 30, 32, 2);
    });

    // ── Dirt path tile (32x32) — D/P sandy beige ──
    this.tex('tile_dirt', 32, 32, (ctx) => {
      ctx.fillStyle = '#E8D890';
      ctx.fillRect(0, 0, 32, 32);
      // Lighter highlights
      ctx.fillStyle = '#F0E0A0';
      [[5,5],[18,3],[8,14],[24,18],[13,8],[28,10],[3,24],[19,28]].forEach(([x,y]) => {
        ctx.fillRect(x, y, 3, 2);
      });
      // Small pebble texture
      ctx.fillStyle = '#C8B870';
      [[10,12],[22,8],[6,20],[28,24]].forEach(([x,y]) => {
        ctx.fillRect(x, y, 2, 2);
      });
      // Thin border shadow
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, 1, 32); ctx.fillRect(31, 0, 1, 32);
      ctx.fillRect(0, 0, 32, 1); ctx.fillRect(0, 31, 32, 1);
    });

    // ── Tree tile (32x32) — D/P round/fluffy canopy, NOT triangular ──
    this.tex('tile_tree', 32, 32, (ctx) => {
      // Grass background
      ctx.fillStyle = '#7EC850';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#5EA830';
      [[4,4],[20,14],[26,6]].forEach(([x,y]) => ctx.fillRect(x, y, 2, 2));

      // Trunk — brown, centered, bottom of tile
      ctx.fillStyle = '#6B3A20';
      ctx.fillRect(13, 23, 6, 9);
      ctx.fillStyle = '#4A2810'; // left shadow on trunk
      ctx.fillRect(13, 23, 2, 9);

      // Canopy — layered circles for fluffy round D/P tree
      // Shadow/base (largest, darkest)
      ctx.fillStyle = '#2A6830';
      ctx.beginPath();
      ctx.arc(16, 19, 14, 0, Math.PI * 2);
      ctx.fill();

      // Main canopy
      ctx.fillStyle = '#4A9840';
      ctx.beginPath();
      ctx.arc(16, 17, 12, 0, Math.PI * 2);
      ctx.fill();

      // Mid highlight
      ctx.fillStyle = '#6ABE50';
      ctx.beginPath();
      ctx.arc(15, 14, 8, 0, Math.PI * 2);
      ctx.fill();

      // Top highlight (bright)
      ctx.fillStyle = '#8AD870';
      ctx.beginPath();
      ctx.arc(14, 11, 4, 0, Math.PI * 2);
      ctx.fill();

      // Tiny specular
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.arc(13, 10, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // ── Water/Fountain tile (32x32) ──
    this.tex('tile_water', 32, 32, (ctx) => {
      ctx.fillStyle = '#5878E8';
      ctx.fillRect(0, 0, 32, 32);
      // Diagonal ripple lines
      ctx.strokeStyle = '#7898F0';
      ctx.lineWidth = 1;
      for (let i = -32; i < 64; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 32, 32);
        ctx.stroke();
      }
      // White foam dots
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      [[4,4],[20,8],[8,20],[24,16],[14,26]].forEach(([x,y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      // Dark border for depth
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0, 0, 1, 32);
      ctx.fillRect(0, 0, 32, 1);
      ctx.fillRect(31, 0, 1, 32);
      ctx.fillRect(0, 31, 32, 1);
    });

    // ── Stone plaza tile (32x32) — fountain surround, gray stone ──
    this.tex('tile_stone', 32, 32, (ctx) => {
      ctx.fillStyle = '#C0B8A8';
      ctx.fillRect(0, 0, 32, 32);
      // Stone tile grid (16x16 blocks)
      ctx.strokeStyle = '#A0988A';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, 15, 15);
      ctx.strokeRect(16.5, 0.5, 15, 15);
      ctx.strokeRect(0.5, 16.5, 15, 15);
      ctx.strokeRect(16.5, 16.5, 15, 15);
      // Highlight (top-left of each stone)
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(1, 1, 14, 5);
      ctx.fillRect(17, 1, 14, 5);
      ctx.fillRect(1, 17, 14, 5);
      ctx.fillRect(17, 17, 14, 5);
      // Shadow (bottom-right of each stone)
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(2, 12, 12, 3);
      ctx.fillRect(18, 12, 12, 3);
      ctx.fillRect(2, 28, 12, 3);
      ctx.fillRect(18, 28, 12, 3);
    });

    // ── Fence tile horizontal (32x32) ──
    this.tex('tile_fence_h', 32, 32, (ctx) => {
      ctx.fillStyle = '#7EC850'; ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#5EA830';
      [[4,4],[20,14]].forEach(([x,y]) => ctx.fillRect(x, y, 2, 2));
      // Post
      ctx.fillStyle = '#907040'; ctx.fillRect(14, 6, 4, 20);
      ctx.fillStyle = '#705030'; ctx.fillRect(14, 6, 1, 20);
      // Rails
      ctx.fillStyle = '#B09050'; ctx.fillRect(0, 10, 32, 4);
      ctx.fillStyle = '#B09050'; ctx.fillRect(0, 18, 32, 3);
      // Shadow under rails
      ctx.fillStyle = '#705030'; ctx.fillRect(0, 14, 32, 1);
      ctx.fillStyle = '#705030'; ctx.fillRect(0, 21, 32, 1);
    });

    // ── Fence tile vertical (32x32) ──
    this.tex('tile_fence_v', 32, 32, (ctx) => {
      ctx.fillStyle = '#7EC850'; ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#5EA830';
      [[4,4],[20,14]].forEach(([x,y]) => ctx.fillRect(x, y, 2, 2));
      // Post
      ctx.fillStyle = '#907040'; ctx.fillRect(6, 14, 20, 4);
      ctx.fillStyle = '#705030'; ctx.fillRect(6, 14, 20, 1);
      // Rails
      ctx.fillStyle = '#B09050'; ctx.fillRect(10, 0, 4, 32);
      ctx.fillStyle = '#B09050'; ctx.fillRect(18, 0, 3, 32);
      ctx.fillStyle = '#705030'; ctx.fillRect(10, 0, 1, 32);
    });

    // ── Building wall tile (32x32) — D/P cream facade ──
    this.tex('tile_building_wall', 32, 32, (ctx) => {
      // Cream wall
      ctx.fillStyle = '#E8E0C8';
      ctx.fillRect(0, 0, 32, 32);
      // Left window
      ctx.fillStyle = '#A0C8F0';
      ctx.fillRect(3, 5, 11, 9);
      ctx.strokeStyle = '#908878';
      ctx.lineWidth = 1;
      ctx.strokeRect(3, 5, 11, 9);
      // Window cross (white divider)
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(8, 5, 1, 9);
      ctx.fillRect(3, 9, 11, 1);
      // Right window
      ctx.fillStyle = '#A0C8F0';
      ctx.fillRect(18, 5, 11, 9);
      ctx.strokeStyle = '#908878';
      ctx.strokeRect(18, 5, 11, 9);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(23, 5, 1, 9);
      ctx.fillRect(18, 9, 11, 1);
      // Top overhang shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 0, 32, 2);
      // Bottom ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0, 30, 32, 2);
    });

    // ── Roof dark tile (32x32) — D/P tan/beige oblique roof ──
    this.tex('tile_roof_dark', 32, 32, (ctx) => {
      // Base tan/beige — D/P buildings use warm tones
      ctx.fillStyle = '#C8A870';
      ctx.fillRect(0, 0, 32, 32);
      // Horizontal roof tile lines every 8px
      ctx.strokeStyle = '#B09060';
      ctx.lineWidth = 1;
      for (let i = 8; i < 32; i += 8) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(32, i); ctx.stroke();
      }
      // Left edge shadow (3D depth effect)
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, 0, 3, 32);
      // Top edge highlight (light from top-left)
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(3, 0, 29, 3);
      // Bottom edge shadow (eave)
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(0, 29, 32, 3);
    });

    // ── Roof red tile (32x32) — PokéCenter bright red roof ──
    this.tex('tile_roof_red', 32, 32, (ctx) => {
      ctx.fillStyle = '#E83020';
      ctx.fillRect(0, 0, 32, 32);
      // Horizontal tile lines
      ctx.strokeStyle = '#C02010';
      ctx.lineWidth = 1;
      for (let i = 8; i < 32; i += 8) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(32, i); ctx.stroke();
      }
      // Left edge shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 0, 3, 32);
      // Top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(3, 0, 29, 3);
      // Bottom shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, 29, 32, 3);
    });

    // ── Building window tile (32x32) ──
    this.tex('tile_building_window', 32, 32, (ctx) => {
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
    this.tex('tile_sign', 32, 32, (ctx) => {
      ctx.fillStyle = '#7EC850'; ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#5EA830';
      [[4,4],[20,14]].forEach(([x,y]) => ctx.fillRect(x, y, 2, 2));
      // Post
      ctx.fillStyle = '#907040'; ctx.fillRect(14, 18, 4, 14);
      ctx.fillStyle = '#705030'; ctx.fillRect(14, 18, 1, 14);
      // Sign board
      ctx.fillStyle = '#D0A060'; ctx.fillRect(5, 6, 22, 15);
      ctx.fillStyle = '#E0B870'; ctx.fillRect(6, 7, 20, 5); // highlight
      ctx.strokeStyle = '#806030'; ctx.lineWidth = 1;
      ctx.strokeRect(5, 6, 22, 15);
      // Sign lines (text effect)
      ctx.fillStyle = '#705028';
      ctx.fillRect(9, 12, 14, 2);
      ctx.fillRect(9, 16, 10, 2);
    });

    // ── Floor tile (32x32) ──
    this.tex('tile_floor', 32, 32, (ctx) => {
      ctx.fillStyle = '#D0B890';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(16, 32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 16); ctx.lineTo(32, 16); ctx.stroke();
      ctx.strokeRect(0, 0, 32, 32);
    });

    // ── Door tile (32x32) — D/P building entrance ──
    this.tex('tile_door', 32, 32, (ctx) => {
      // Cream facade
      ctx.fillStyle = '#E8E0C8';
      ctx.fillRect(0, 0, 32, 32);
      // Door frame
      ctx.fillStyle = '#8B5E3C';
      ctx.fillRect(9, 2, 14, 30);
      // Door panels (dark wood)
      ctx.fillStyle = '#6B3A20';
      ctx.fillRect(10, 3, 6, 26); // left panel
      ctx.fillRect(16, 3, 6, 26); // right panel (glass doors like D/P)
      // Glass panels (light blue)
      ctx.fillStyle = '#B8D8F0';
      ctx.fillRect(10, 4, 6, 16);
      ctx.fillRect(16, 4, 6, 16);
      // Center divider
      ctx.fillStyle = '#8B5E3C';
      ctx.fillRect(15, 3, 2, 26);
      // Door handles
      ctx.fillStyle = '#D4A020';
      ctx.fillRect(14, 16, 2, 2);
      ctx.fillRect(16, 16, 2, 2);
      // Step
      ctx.fillStyle = '#C8C0A8';
      ctx.fillRect(7, 28, 18, 4);
      // Top shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 0, 32, 2);
    });

    // ── Flower tile (32x32) — grass with D/P flowers ──
    this.tex('tile_flower', 32, 32, (ctx) => {
      // Grass base
      ctx.fillStyle = '#7EC850'; ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#5EA830';
      [[4,4],[20,14],[8,22]].forEach(([x,y]) => ctx.fillRect(x, y, 2, 2));

      const drawFlower = (cx: number, cy: number) => {
        // Stem
        ctx.fillStyle = '#4A9840';
        ctx.fillRect(cx, cy + 1, 2, 5);
        // 4 petals in + pattern
        ctx.fillStyle = '#F090B0';
        ctx.fillRect(cx - 2, cy, 2, 3); // left
        ctx.fillRect(cx + 2, cy, 2, 3); // right
        ctx.fillRect(cx, cy - 2, 2, 3); // top
        ctx.fillRect(cx, cy + 3, 2, 2); // bottom
        // Yellow center
        ctx.fillStyle = '#F0D040';
        ctx.fillRect(cx, cy, 2, 2);
      };
      drawFlower(7, 17);
      drawFlower(22, 11);
    });
  }

  private generatePlayerTextures() {
    // player_front: used for down direction
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

    // player_right: side-profile view — used for right (and flipped for left)
    this.tex('player_right', 32, 32, (ctx) => {
      this.drawChibiSide(ctx, {
        skinColor: '#F0C090',
        hairColor: '#6B3E2A',
        outfitColor: '#2850A0',
      });
    });
  }

  // Draw a chibi character in side profile (facing right)
  private drawChibiSide(ctx: CanvasRenderingContext2D, opts: {
    skinColor: string;
    hairColor: string;
    outfitColor: string;
  }) {
    const { skinColor, hairColor, outfitColor } = opts;
    const cx = 16;

    // Shoes (side view — one visible, one slightly behind)
    ctx.fillStyle = '#101010';
    ctx.fillRect(cx + 1, 28, 7, 3);   // front shoe
    ctx.fillRect(cx - 2, 28, 5, 2);   // back shoe (partial)

    // Legs (side — slight offset for walk pose)
    ctx.fillStyle = '#202040';
    ctx.fillRect(cx + 2, 22, 4, 7);   // front leg
    ctx.fillRect(cx - 1, 23, 4, 6);   // back leg

    // Body (narrower from side)
    ctx.fillStyle = outfitColor;
    ctx.fillRect(cx - 3, 13, 9, 10);

    // Near arm (visible from side)
    ctx.fillStyle = outfitColor;
    ctx.fillRect(cx + 5, 14, 3, 8);

    // Hand (skin)
    ctx.fillStyle = skinColor;
    ctx.fillRect(cx + 5, 21, 3, 3);

    // Neck
    ctx.fillStyle = skinColor;
    ctx.fillRect(cx - 1, 10, 3, 4);

    // Head (side profile — slightly offset forward)
    ctx.fillStyle = skinColor;
    ctx.fillRect(cx, 3, 9, 9);

    // Nose hint
    ctx.fillStyle = '#D09070';
    ctx.fillRect(cx + 8, 7, 2, 2);

    // Eye (single eye from side)
    ctx.fillStyle = '#202020';
    ctx.fillRect(cx + 6, 6, 2, 2);

    // Hair (side profile)
    ctx.fillStyle = hairColor;
    ctx.fillRect(cx, 1, 9, 5);         // top
    ctx.fillRect(cx - 1, 3, 2, 7);    // back of head
    ctx.fillRect(cx + 8, 2, 3, 4);    // front tuft

    // Subtle outline
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(cx - 3, 13, 9, 10);
    ctx.strokeRect(cx, 3, 9, 9);
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
