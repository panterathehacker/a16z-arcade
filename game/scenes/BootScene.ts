import * as Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // All graphics are generated programmatically — nothing to load
  }

  create() {
    this.generateTileTextures();
    this.generatePlayerTexture();
    this.generateNPCTextures();
    this.generateUITextures();
    this.scene.start('WorldScene');
  }

  private generateTileTextures() {
    const g = this.make.graphics({ x: 0, y: 0 });

    // Grass tile
    g.clear();
    g.fillStyle(0x78C850);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x58A838, 0.4);
    g.fillRect(4, 4, 2, 2);
    g.fillRect(12, 8, 2, 2);
    g.fillRect(20, 14, 2, 2);
    g.fillRect(8, 22, 2, 2);
    g.fillRect(26, 6, 2, 2);
    g.lineStyle(1, 0x48983A, 0.3);
    g.strokeRect(0, 0, 32, 32);
    g.generateTexture('tile_grass', 32, 32);

    // Dirt path tile
    g.clear();
    g.fillStyle(0xE8D8A0);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xD8C890, 0.5);
    g.fillRect(5, 5, 3, 2);
    g.fillRect(18, 12, 2, 3);
    g.fillRect(10, 24, 3, 2);
    g.generateTexture('tile_dirt', 32, 32);

    // Water/Fountain tile
    g.clear();
    g.fillStyle(0x6890F0);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x88B0FF, 0.6);
    g.fillRect(4, 4, 6, 4);
    g.fillRect(20, 16, 5, 4);
    g.fillStyle(0x4870D0, 0.4);
    g.fillRect(10, 18, 8, 4);
    g.generateTexture('tile_water', 32, 32);

    // Fence tile (horizontal)
    g.clear();
    g.fillStyle(0x78C850);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xC89040);
    g.fillRect(0, 12, 32, 4);
    g.fillRect(0, 18, 32, 2);
    g.fillStyle(0xA07030);
    g.fillRect(14, 8, 4, 16);
    g.generateTexture('tile_fence_h', 32, 32);

    // Fence tile (vertical)
    g.clear();
    g.fillStyle(0x78C850);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xC89040);
    g.fillRect(12, 0, 4, 32);
    g.fillRect(18, 0, 2, 32);
    g.fillStyle(0xA07030);
    g.fillRect(8, 14, 16, 4);
    g.generateTexture('tile_fence_v', 32, 32);

    // Tree tile
    g.clear();
    g.fillStyle(0x78C850);
    g.fillRect(0, 0, 32, 32);
    // trunk
    g.fillStyle(0x8B5E3C);
    g.fillRect(12, 20, 8, 12);
    // foliage layers
    g.fillStyle(0x389858);
    g.fillRect(6, 14, 20, 14);
    g.fillStyle(0x58B870);
    g.fillRect(8, 8, 16, 12);
    g.fillStyle(0x78D890);
    g.fillRect(10, 4, 12, 10);
    // highlights
    g.fillStyle(0x98E8A0, 0.5);
    g.fillRect(12, 6, 4, 4);
    g.generateTexture('tile_tree', 32, 32);

    // Building tile - wall
    g.clear();
    g.fillStyle(0xF0E8D0);
    g.fillRect(0, 0, 32, 32);
    g.lineStyle(1, 0xD0C8B0);
    g.strokeRect(0, 0, 32, 32);
    // brick pattern
    g.fillStyle(0xE0D8C0, 0.5);
    for (let row = 0; row < 4; row++) {
      const offset = (row % 2) * 8;
      for (let col = 0; col < 5; col++) {
        g.strokeRect(col * 8 + offset - 8, row * 8, 8, 8);
      }
    }
    g.generateTexture('tile_building_wall', 32, 32);

    // Building tile - roof dark
    g.clear();
    g.fillStyle(0x907050);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x705040, 0.5);
    g.fillRect(0, 0, 32, 8);
    g.generateTexture('tile_roof_dark', 32, 32);

    // Building tile - roof red
    g.clear();
    g.fillStyle(0xC03028);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xA02018, 0.5);
    g.fillRect(0, 0, 32, 8);
    g.generateTexture('tile_roof_red', 32, 32);

    // Building tile - window
    g.clear();
    g.fillStyle(0xF0E8D0);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x90D0FF);
    g.fillRect(8, 8, 16, 12);
    g.fillStyle(0x70B0E0);
    g.fillRect(8, 8, 16, 4);
    g.fillStyle(0xF0E8D0);
    g.fillRect(15, 8, 2, 12);
    g.lineStyle(1, 0x605040);
    g.strokeRect(8, 8, 16, 12);
    g.generateTexture('tile_building_window', 32, 32);

    // Sign tile
    g.clear();
    g.fillStyle(0x78C850);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xA07040);
    g.fillRect(14, 18, 4, 14);
    g.fillStyle(0xD0A060);
    g.fillRect(6, 8, 20, 14);
    g.lineStyle(1, 0x806030);
    g.strokeRect(6, 8, 20, 14);
    g.generateTexture('tile_sign', 32, 32);

    // Floor tile (building interior)
    g.clear();
    g.fillStyle(0xD0B890);
    g.fillRect(0, 0, 32, 32);
    g.lineStyle(1, 0xC0A880, 0.5);
    g.strokeRect(0, 0, 32, 32);
    g.generateTexture('tile_floor', 32, 32);

    g.destroy();
  }

  private generatePlayerTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });

    // Player sprite - 4 directions, each 32x32
    // We'll create a spritesheet: 4 frames wide (down, up, left, right)
    const frames = ['down', 'up', 'left', 'right'];
    frames.forEach((dir, i) => {
      g.clear();
      const x = i * 32;

      // body
      g.fillStyle(0x3050C0); // blue shirt
      g.fillRect(x + 10, 16, 12, 12);

      // legs
      g.fillStyle(0x1030A0);
      g.fillRect(x + 10, 26, 5, 6);
      g.fillRect(x + 17, 26, 5, 6);

      // shoes
      g.fillStyle(0x202020);
      g.fillRect(x + 9, 30, 6, 2);
      g.fillRect(x + 17, 30, 6, 2);

      // head
      g.fillStyle(0xF0C890); // skin
      g.fillRect(x + 11, 6, 10, 10);

      // hair
      g.fillStyle(0x603010);
      g.fillRect(x + 11, 4, 10, 5);
      if (dir === 'down') {
        g.fillRect(x + 10, 7, 2, 4);
        g.fillRect(x + 20, 7, 2, 4);
      }

      // eyes
      if (dir === 'down') {
        g.fillStyle(0x202020);
        g.fillRect(x + 13, 11, 2, 2);
        g.fillRect(x + 18, 11, 2, 2);
      } else if (dir === 'up') {
        // no eyes visible
        g.fillStyle(0x603010);
        g.fillRect(x + 11, 4, 10, 7);
      } else if (dir === 'left') {
        g.fillStyle(0x202020);
        g.fillRect(x + 12, 11, 2, 2);
        // side profile
        g.fillStyle(0xF0C890);
        g.fillRect(x + 9, 7, 4, 8);
      } else if (dir === 'right') {
        g.fillStyle(0x202020);
        g.fillRect(x + 18, 11, 2, 2);
        g.fillStyle(0xF0C890);
        g.fillRect(x + 19, 7, 4, 8);
      }

      // arms
      g.fillStyle(0xF0C890);
      if (dir === 'left') {
        g.fillRect(x + 6, 17, 4, 8);
      } else if (dir === 'right') {
        g.fillRect(x + 22, 17, 4, 8);
      } else {
        g.fillRect(x + 6, 17, 4, 8);
        g.fillRect(x + 22, 17, 4, 8);
      }
    });

    g.generateTexture('player', 128, 32);
    g.destroy();

    this.textures.get('player').add('down', 0, 0, 0, 32, 32);
    this.textures.get('player').add('up', 0, 32, 0, 32, 32);
    this.textures.get('player').add('left', 0, 64, 0, 32, 32);
    this.textures.get('player').add('right', 0, 96, 0, 32, 32);
  }

  private generateNPCTextures() {
    // NPC color palette for each guest
    const colors = [
      0x4169E1, // Marc - blue
      0x8B0000, // Ben - dark red
      0xFF6B00, // Lisa - orange
      0x00CED1, // Alexandr - teal
      0x76B900, // Jensen - green
      0xFF69B4, // Sarah - pink
      0x9370DB, // Elad - purple
      0xFF8C00, // Andrew - dark orange
      0x20B2AA, // Sonal - light sea green
      0xDC143C, // David - crimson
    ];

    colors.forEach((color, i) => {
      const g = this.make.graphics({ x: 0, y: 0 });

      // body
      g.fillStyle(color);
      g.fillRect(10, 16, 12, 12);

      // legs
      g.fillStyle(0x202020);
      g.fillRect(10, 26, 5, 6);
      g.fillRect(17, 26, 5, 6);

      // shoes
      g.fillStyle(0x101010);
      g.fillRect(9, 30, 6, 2);
      g.fillRect(17, 30, 6, 2);

      // head
      g.fillStyle(0xF0C890);
      g.fillRect(11, 6, 10, 10);

      // hair - vary by index
      const hairColors = [0x202020, 0x603010, 0x101010, 0x303030, 0x101010, 0x8B4513, 0x202020, 0x303030, 0x101010, 0x404040];
      g.fillStyle(hairColors[i] || 0x303030);
      g.fillRect(11, 4, 10, 5);

      // eyes
      g.fillStyle(0x202020);
      g.fillRect(13, 11, 2, 2);
      g.fillRect(18, 11, 2, 2);

      // arms
      g.fillStyle(0xF0C890);
      g.fillRect(6, 17, 4, 8);
      g.fillRect(22, 17, 4, 8);

      // subtle outline
      g.lineStyle(1, 0x000000, 0.3);
      g.strokeRect(10, 16, 12, 12);
      g.strokeRect(11, 6, 10, 10);

      g.generateTexture(`npc_${i}`, 32, 32);
      g.destroy();
    });
  }

  private generateUITextures() {
    const g = this.make.graphics({ x: 0, y: 0 });

    // HP bar background
    g.clear();
    g.fillStyle(0x404040);
    g.fillRect(0, 0, 200, 20);
    g.fillStyle(0x202020);
    g.fillRect(2, 2, 196, 16);
    g.generateTexture('hpbar_bg', 200, 20);

    // HP bar fill (green)
    g.clear();
    g.fillStyle(0x40C840);
    g.fillRect(0, 0, 196, 16);
    g.generateTexture('hpbar_fill', 196, 16);

    // Pokéball icon
    g.clear();
    g.fillStyle(0xFF0000);
    g.fillCircle(12, 8, 12);
    g.fillStyle(0xFFFFFF);
    g.fillCircle(12, 16, 12);
    g.fillStyle(0x000000);
    g.fillRect(0, 11, 24, 2);
    g.fillCircle(12, 12, 4);
    g.fillStyle(0xFFFFFF);
    g.fillCircle(12, 12, 2);
    g.generateTexture('pokeball', 24, 24);

    g.destroy();
  }
}
