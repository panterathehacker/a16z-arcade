import * as Phaser from 'phaser';
import { GUESTS, Guest } from '../data/guests';
import { getOrCreatePlayer, updateUsername, fetchCaptures } from '../services/playerService';

const TILE = 32;
const MAP_W = 40;
const MAP_H = 30;

// Tile type constants
const T_GRASS   = 0;
const T_DIRT    = 1;
const T_TREE    = 2;
const T_WALL    = 3;
const T_ROOF_D  = 4;
const T_ROOF_R  = 5;
const T_WINDOW  = 6;
const T_FENCE_H = 7;
const T_FENCE_V = 8;
const T_WATER   = 9;
const T_SIGN    = 10;
const T_FLOOR   = 11;
const T_FLOWER  = 12;
const T_DOOR    = 13;
const T_STONE   = 14;

type TileMap = number[][];

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private playerTileX = 10;
  private playerTileY = 15;
  private playerDir = 'down';
  private moveTimer = 0;
  private MOVE_DELAY = 150;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private cKey!: Phaser.Input.Keyboard.Key;

  private tileMap!: TileMap;
  private tileImages: Phaser.GameObjects.Image[][] = [];
  private npcSprites: Map<string, Phaser.GameObjects.Container> = new Map();

  private dialogueBox!: Phaser.GameObjects.Container;
  private dialogueVisible = false;
  private nearbyGuest: Guest | null = null;

  private pokedexContainer!: Phaser.GameObjects.Container;
  private pokedexVisible = false;

  private miniMapContainer!: Phaser.GameObjects.Container;
  private miniMapTimer = 0;

  public playerId: string | null = null;
  public sessionId: string | null = null;

  private usernameOverlay: HTMLDivElement | null = null;
  private gameReady = false;

  constructor() {
    super({ key: 'WorldScene' });
  }

  create() {
    this.buildTileMap();
    this.renderTiles();
    this.spawnNPCs();
    this.createPlayer();
    this.setupCamera();
    this.setupInput();
    this.createDialogueBox();
    this.createPokedex();
    this.createMiniMap();

    this.initPlayer();
  }

  private async initPlayer() {
    try {
      const player = await getOrCreatePlayer();
      this.playerId = player.id;
      this.sessionId = player.sessionId;

      const remoteCaptures = await fetchCaptures(this.playerId);
      if (remoteCaptures.length > 0) {
        const localCaptures: string[] = JSON.parse(localStorage.getItem('a16z_captured') || '[]');
        const merged = Array.from(new Set([...localCaptures, ...remoteCaptures]));
        localStorage.setItem('a16z_captured', JSON.stringify(merged));
      }
    } catch (err) {
      console.warn('Supabase init failed, running offline:', err);
    }

    // Issue 1 fix: show name prompt on EVERY fresh page load (once per browser session).
    // Use sessionStorage so it shows on each new tab/reload but not on scene restarts.
    const askedThisSession = sessionStorage.getItem('a16z_name_asked');
    if (!askedThisSession) {
      this.showUsernameOverlay();
    } else {
      this.gameReady = true;
    }
  }

  private showUsernameOverlay() {
    // Disable Phaser keyboard capture while HTML overlay is active (Bug #1 fix)
    this.input.keyboard?.disableGlobalCapture();

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: "Press Start 2P", monospace;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      background: #1a1a3e;
      border: 3px solid #4060C0;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      max-width: 360px;
      width: 90%;
    `;

    const title = document.createElement('div');
    title.style.cssText = `color: #60A0FF; font-size: 12px; margin-bottom: 8px;`;
    title.textContent = 'a16z ARCADE';

    const subtitle = document.createElement('div');
    subtitle.style.cssText = `color: #8080C0; font-size: 7px; margin-bottom: 28px; line-height: 2;`;
    subtitle.textContent = 'Enter your trainer name:';

    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 16;
    input.placeholder = 'Trainer';
    input.style.cssText = `
      width: 100%;
      padding: 10px 12px;
      font-family: "Press Start 2P", monospace;
      font-size: 10px;
      background: #0a0a1a;
      border: 2px solid #4060C0;
      border-radius: 6px;
      color: #FFFFFF;
      text-align: center;
      margin-bottom: 20px;
      box-sizing: border-box;
      outline: none;
    `;

    const btn = document.createElement('button');
    btn.textContent = 'START GAME';
    btn.style.cssText = `
      font-family: "Press Start 2P", monospace;
      font-size: 8px;
      background: #3050C0;
      color: #FFFFFF;
      border: 2px solid #6080FF;
      border-radius: 6px;
      padding: 12px 24px;
      cursor: pointer;
      width: 100%;
    `;

    const confirm = async () => {
      const name = input.value.trim() || 'Trainer';
      localStorage.setItem('a16z_username', name);
      sessionStorage.setItem('a16z_name_asked', '1');

      if (this.playerId) {
        try {
          await updateUsername(this.playerId, name);
        } catch (e) {
          console.warn('Failed to save username to Supabase:', e);
        }
      }

      overlay.remove();
      this.usernameOverlay = null;
      // Re-enable Phaser keyboard capture after overlay is dismissed (Bug #1 fix)
      this.input.keyboard?.enableGlobalCapture();
      this.gameReady = true;
    };

    btn.addEventListener('click', confirm);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirm();
    });

    box.appendChild(title);
    box.appendChild(subtitle);
    box.appendChild(input);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    this.usernameOverlay = overlay;

    setTimeout(() => input.focus(), 100);
  }

  private buildTileMap(): void {
    this.tileMap = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(T_GRASS));

    // ── Border trees (all 4 edges, 2 tiles thick) ──
    for (let x = 0; x < MAP_W; x++) {
      this.tileMap[0][x] = T_TREE;
      this.tileMap[1][x] = T_TREE;
      this.tileMap[MAP_H - 1][x] = T_TREE;
      this.tileMap[MAP_H - 2][x] = T_TREE;
    }
    for (let y = 0; y < MAP_H; y++) {
      this.tileMap[y][0] = T_TREE;
      this.tileMap[y][1] = T_TREE;
      this.tileMap[y][MAP_W - 1] = T_TREE;
      this.tileMap[y][MAP_W - 2] = T_TREE;
    }

    // ── Main horizontal road (row 8) ──
    for (let x = 2; x < MAP_W - 2; x++) {
      this.tileMap[8][x] = T_DIRT;
      this.tileMap[9][x] = T_DIRT;
    }

    // ── Second horizontal road (row 21) ──
    for (let x = 2; x < MAP_W - 2; x++) {
      this.tileMap[21][x] = T_DIRT;
      this.tileMap[22][x] = T_DIRT;
    }

    // ── Vertical road connecting the two horizontal roads (cols 19-20) ──
    for (let y = 2; y < MAP_H - 2; y++) {
      this.tileMap[y][19] = T_DIRT;
      this.tileMap[y][20] = T_DIRT;
    }

    // ── Buildings — top zone (rows 2–7) ──
    this.placeBuildingDP(3,  2, 7, 5, false);  // Building 1 upper-left
    this.placeBuildingDP(12, 2, 6, 5, false);  // Building 2 upper-center-left
    this.placeBuildingDP(22, 2, 6, 5, false);  // Building 3 upper-center-right
    this.placeBuildingDP(31, 2, 6, 5, true);   // PokéCenter upper-right (red roof)

    // ── Buildings — bottom zone (rows 23–27) ──
    this.placeBuildingDP(3,  23, 7, 5, false);
    this.placeBuildingDP(12, 23, 6, 5, false);
    this.placeBuildingDP(22, 23, 6, 5, false);
    this.placeBuildingDP(31, 23, 6, 5, true);

    // ── Fountain plaza (center, rows 12–18, cols 15–24) ──
    // Stone floor surround
    for (let y = 12; y <= 18; y++) {
      for (let x = 15; x <= 24; x++) {
        if (this.inBounds(x, y) && (this.tileMap[y][x] === T_GRASS || this.tileMap[y][x] === T_FLOWER)) {
          this.tileMap[y][x] = T_STONE;
        }
      }
    }
    // 2x2 water in center of plaza
    this.tileMap[14][19] = T_WATER;
    this.tileMap[14][20] = T_WATER;
    this.tileMap[15][19] = T_WATER;
    this.tileMap[15][20] = T_WATER;
    // Sign on south side of fountain
    this.tileMap[17][19] = T_SIGN;
    // Trees in plaza corners
    [[12,15],[12,24],[18,15],[18,24]].forEach(([y, x]) => {
      if (this.inBounds(x, y)) this.tileMap[y][x] = T_TREE;
    });

    // ── Interior tree clusters (natural groupings) ──
    const treeClusters: [number, number][] = [
      // Upper area clusters (between top buildings)
      [10,9],[11,9],[10,10],
      [10,17],[11,17],[10,18],[11,18],
      [10,28],[11,28],
      // Side clusters
      [13,3],[14,3],[13,4],
      [13,36],[14,36],[13,37],
      // Lower area clusters (between bottom buildings)
      [19,9],[20,9],[19,10],
      [19,17],[20,17],[19,18],[20,18],
      [19,28],[20,28],
    ];
    treeClusters.forEach(([y, x]) => {
      if (this.inBounds(x, y) && this.tileMap[y][x] === T_GRASS) {
        this.tileMap[y][x] = T_TREE;
      }
    });

    // ── Flower patches (scattered naturally in grass) ──
    const flowerSpots: [number, number][] = [
      // Upper grass strip (rows 10-11)
      [10,6],[10,13],[10,16],[10,25],[10,29],[10,34],[11,11],[11,22],[11,32],
      // Mid grass areas
      [12,6],[12,13],[20,6],[20,13],[20,25],[20,29],[20,35],
      // Lower grass strip (rows 19-20)
      [19,6],[19,13],[19,16],[19,25],[19,29],[19,34],[20,11],[20,22],[20,32],
      // Near tree border
      [2,8],[2,22],[2,30],[27,8],[27,22],[27,30],
    ];
    flowerSpots.forEach(([y, x]) => {
      if (this.inBounds(x, y) && this.tileMap[y][x] === T_GRASS) {
        this.tileMap[y][x] = T_FLOWER;
      }
    });
  }

  // Pokémon D/P-style building: top rows = ROOF, last row = WALL facade, door at bottom-center
  private placeBuildingDP(x: number, y: number, w: number, h: number, redRoof: boolean): void {
    const roofTile = redRoof ? T_ROOF_R : T_ROOF_D;
    const roofRows = h - 1; // all but last row are roof
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const tx = x + dx;
        const ty = y + dy;
        if (!this.inBounds(tx, ty)) continue;
        if (dy < roofRows) {
          this.tileMap[ty][tx] = roofTile;
        } else {
          // Last row: facade wall, with door at center
          const centerX = Math.floor(w / 2);
          if (dx === centerX) {
            this.tileMap[ty][tx] = T_DOOR;
          } else {
            this.tileMap[ty][tx] = T_WALL;
          }
        }
      }
    }
  }

  private placeBuilding(x: number, y: number, w: number, h: number): void {
    const useRedRoof = (x + y) % 2 === 0;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const tx = x + dx;
        const ty = y + dy;
        if (!this.inBounds(tx, ty)) continue;
        if (dy === 0) {
          this.tileMap[ty][tx] = useRedRoof ? T_ROOF_R : T_ROOF_D;
        } else if (dy === 1) {
          this.tileMap[ty][tx] = T_WALL;
        } else if (dy === h - 1) {
          this.tileMap[ty][tx] = T_FLOOR;
        } else {
          if ((dx === 1 || dx === w - 2) && dy >= 2) {
            this.tileMap[ty][tx] = T_WINDOW;
          } else {
            this.tileMap[ty][tx] = T_WALL;
          }
        }
      }
    }
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && x < MAP_W && y >= 0 && y < MAP_H;
  }

  private isSolid(x: number, y: number): boolean {
    if (!this.inBounds(x, y)) return true;
    const t = this.tileMap[y][x];
    return t === T_TREE || t === T_WALL || t === T_ROOF_D || t === T_ROOF_R ||
           t === T_WINDOW || t === T_FENCE_H || t === T_FENCE_V || t === T_WATER || t === T_SIGN;
    // T_DOOR (13), T_STONE (14) are walkable
  }

  private renderTiles(): void {
    const textureKeys = [
      'tile_grass',            // 0 T_GRASS
      'tile_dirt',             // 1 T_DIRT
      'tile_tree',             // 2 T_TREE
      'tile_building_wall',    // 3 T_WALL
      'tile_roof_dark',        // 4 T_ROOF_D
      'tile_roof_red',         // 5 T_ROOF_R
      'tile_building_window',  // 6 T_WINDOW
      'tile_fence_h',          // 7 T_FENCE_H
      'tile_fence_v',          // 8 T_FENCE_V
      'tile_water',            // 9 T_WATER
      'tile_sign',             // 10 T_SIGN
      'tile_floor',            // 11 T_FLOOR
      'tile_flower',           // 12 T_FLOWER
      'tile_door',             // 13 T_DOOR
      'tile_stone',            // 14 T_STONE
    ];

    for (let y = 0; y < MAP_H; y++) {
      this.tileImages[y] = [];
      for (let x = 0; x < MAP_W; x++) {
        const tileType = this.tileMap[y][x];
        const key = textureKeys[tileType] || 'tile_grass';
        const img = this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, key);
        img.setOrigin(0.5);
        this.tileImages[y][x] = img;
      }
    }
  }

  private spawnNPCs(): void {
    GUESTS.forEach((guest, i) => {
      const container = this.add.container(
        guest.x * TILE + TILE / 2,
        guest.y * TILE + TILE / 2
      );

      const sprite = this.add.image(0, 0, `npc_${i}`);
      sprite.setOrigin(0.5);

      // Name label
      const labelText = this.add.text(0, -26, guest.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '5px',
        color: '#FFFFFF',
        resolution: 2,
        stroke: '#000000',
        strokeThickness: 2,
      });
      labelText.setOrigin(0.5);

      container.add([sprite, labelText]);
      this.npcSprites.set(guest.id, container);

      // Idle bob animation
      this.tweens.add({
        targets: sprite,
        y: -3,
        duration: 600 + i * 50,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }

  private createPlayer(): void {
    // Bug #2 fix: use player_front texture (single sprite, flip for left)
    this.player = this.add.image(
      this.playerTileX * TILE + TILE / 2,
      this.playerTileY * TILE + TILE / 2,
      'player_front'
    );
    this.player.setOrigin(0.5);
    this.player.setDepth(10);
  }

  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up:    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
  }

  // ─── Dialogue Box (Bug #3 fix + polish) ───────────────────────────────────
  private createDialogueBox(): void {
    this.dialogueBox = this.add.container(0, 0);
    this.dialogueBox.setScrollFactor(0);
    this.dialogueBox.setDepth(100);
    this.dialogueBox.setVisible(false);

    const camW = this.cameras.main.width;
    const camH = this.cameras.main.height;
    const boxH = 130;
    const boxX = 10;
    const boxY = camH - boxH - 10;
    const boxW = camW - 20;

    // White background with thick black border
    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRect(boxX, boxY, boxW, boxH);
    bg.lineStyle(4, 0x000000, 1);
    bg.strokeRect(boxX, boxY, boxW, boxH);

    // Portrait area (dark square, top-left of box)
    const portraitBg = this.add.graphics();
    portraitBg.fillStyle(0x202040, 1);
    portraitBg.fillRect(boxX + 8, boxY + 8, 40, 40);
    portraitBg.lineStyle(2, 0x000000, 1);
    portraitBg.strokeRect(boxX + 8, boxY + 8, 40, 40);
    portraitBg.setName('portraitBg');

    // Separator line
    const sep = this.add.graphics();
    sep.lineStyle(1, 0x000000, 0.3);
    sep.lineBetween(boxX + 56, boxY + 55, boxX + boxW - 8, boxY + 55);

    // Bottom bar (slightly gray)
    const bottomBar = this.add.graphics();
    bottomBar.fillStyle(0xF0F0F0, 1);
    bottomBar.fillRect(boxX + 1, boxY + boxH - 22, boxW - 2, 21);
    bottomBar.lineStyle(1, 0x000000, 0.2);
    bottomBar.lineBetween(boxX + 1, boxY + boxH - 22, boxX + boxW - 1, boxY + boxH - 22);

    // Name text — bold, dark, explicit font+color
    const nameText = this.add.text(boxX + 56, boxY + 10, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#000000',
      resolution: 2,
    });
    nameText.setName('nameText');
    nameText.setDepth(101);

    // Title text — italic style, smaller, muted
    const titleText = this.add.text(boxX + 56, boxY + 26, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#444466',
      resolution: 2,
    });
    titleText.setName('titleText');
    titleText.setDepth(101);

    // Body text — main dialogue line
    const bodyText = this.add.text(boxX + 56, boxY + 58, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#111111',
      resolution: 2,
      wordWrap: { width: boxW - 70 },
    });
    bodyText.setName('bodyText');
    bodyText.setDepth(101);

    // Hint text in the bottom bar
    const hintText = this.add.text(boxX + 8, boxY + boxH - 16, 'SPACE to battle  \u2022  Walk away to cancel', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '5px',
      color: '#666666',
      resolution: 2,
    });
    hintText.setName('hintText');
    hintText.setDepth(101);

    // ▼ arrow indicator
    const arrowText = this.add.text(boxX + boxW - 14, boxY + boxH - 16, '\u25BC', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#444444',
    });
    arrowText.setDepth(101);

    // Portrait sprite (will be set in showDialogue)
    const portraitSprite = this.add.image(boxX + 28, boxY + 28, 'npc_0');
    portraitSprite.setOrigin(0.5);
    portraitSprite.setScale(1.0);
    portraitSprite.setName('portraitSprite');
    portraitSprite.setDepth(101);

    this.dialogueBox.add([bg, portraitBg, sep, bottomBar, nameText, titleText, bodyText, hintText, arrowText, portraitSprite]);
  }

  private showDialogue(guest: Guest): void {
    if (this.dialogueVisible) return;
    this.dialogueVisible = true;
    this.nearbyGuest = guest;
    this.dialogueBox.setVisible(true);

    const guestIndex = GUESTS.findIndex(g => g.id === guest.id);

    const nameText     = this.dialogueBox.getByName('nameText')     as Phaser.GameObjects.Text;
    const titleText    = this.dialogueBox.getByName('titleText')    as Phaser.GameObjects.Text;
    const bodyText     = this.dialogueBox.getByName('bodyText')     as Phaser.GameObjects.Text;
    const portraitSpr  = this.dialogueBox.getByName('portraitSprite') as Phaser.GameObjects.Image;

    if (nameText)  nameText.setText(guest.name);
    if (titleText) titleText.setText(guest.title);
    if (bodyText)  bodyText.setText(`${guest.name} wants to\ntest your knowledge!`);
    if (portraitSpr && guestIndex >= 0) {
      portraitSpr.setTexture(`npc_${guestIndex}`);
    }
  }

  private hideDialogue(): void {
    this.dialogueVisible = false;
    this.nearbyGuest = null;
    this.dialogueBox.setVisible(false);
  }

  private getGuestNearPlayer(): Guest | null {
    for (const guest of GUESTS) {
      const dx = Math.abs(guest.x - this.playerTileX);
      const dy = Math.abs(guest.y - this.playerTileY);
      if (dx <= 1 && dy <= 1 && (dx + dy) <= 2) {
        return guest;
      }
    }
    return null;
  }

  // ─── Pokédex ──────────────────────────────────────────────────────────────
  private createPokedex(): void {
    const camW = this.cameras.main.width;
    const camH = this.cameras.main.height;

    this.pokedexContainer = this.add.container(0, 0);
    this.pokedexContainer.setScrollFactor(0);
    this.pokedexContainer.setDepth(200);
    this.pokedexContainer.setVisible(false);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, camW, camH);
    this.pokedexContainer.add(overlay);

    const panelW = camW - 40;
    const panelH = camH - 40;
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a3e, 0.98);
    panel.fillRoundedRect(20, 20, panelW, panelH, 12);
    panel.lineStyle(3, 0x4060C0);
    panel.strokeRoundedRect(20, 20, panelW, panelH, 12);
    this.pokedexContainer.add(panel);

    const titleT = this.add.text(camW / 2, 40, 'a16z ARCADE DEX', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#60A0FF',
      resolution: 2,
    });
    titleT.setOrigin(0.5, 0);
    this.pokedexContainer.add(titleT);
  }

  private showPokedex(): void {
    this.pokedexVisible = true;
    this.pokedexContainer.setVisible(true);

    const children = this.pokedexContainer.list;
    while (children.length > 3) {
      const child = children[children.length - 1] as Phaser.GameObjects.GameObject;
      this.pokedexContainer.remove(child, true);
    }

    const captured: string[] = JSON.parse(localStorage.getItem('a16z_captured') || '[]');
    const camW = this.cameras.main.width;

    const countText = this.add.text(camW / 2, 58, `${captured.length}/10 Captured`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#FFFFFF',
      resolution: 2,
    });
    countText.setOrigin(0.5, 0);
    this.pokedexContainer.add(countText);

    const cols = 2;
    const startX = 35;
    const startY = 80;
    const cellW = (camW - 70) / cols;
    const cellH = 55;

    GUESTS.forEach((guest, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * cellW;
      const cy = startY + row * cellH;
      const isCaptured = captured.includes(guest.id);

      const cardBg = this.add.graphics();
      cardBg.fillStyle(isCaptured ? 0x203060 : 0x1a1a2a, 0.9);
      cardBg.fillRoundedRect(cx, cy, cellW - 8, cellH - 4, 6);
      cardBg.lineStyle(2, isCaptured ? 0x4080FF : 0x404060);
      cardBg.strokeRoundedRect(cx, cy, cellW - 8, cellH - 4, 6);
      this.pokedexContainer.add(cardBg);

      const numText = this.add.text(cx + 6, cy + 6, `#${String(i + 1).padStart(2, '0')}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '5px',
        color: isCaptured ? '#60A0FF' : '#606060',
        resolution: 2,
      });
      this.pokedexContainer.add(numText);

      // Mini sprite
      if (isCaptured) {
        const miniSprite = this.add.image(cx + cellW - 26, cy + cellH / 2 - 2, `npc_${i}`);
        miniSprite.setOrigin(0.5);
        miniSprite.setScale(0.9);
        this.pokedexContainer.add(miniSprite);
      } else {
        const spriteCircle = this.add.graphics();
        spriteCircle.fillStyle(0x404040);
        spriteCircle.fillCircle(cx + cellW - 26, cy + cellH / 2 - 2, 14);
        this.pokedexContainer.add(spriteCircle);
      }

      const nameT = this.add.text(cx + 6, cy + 18, isCaptured ? guest.name : '???', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '5px',
        color: isCaptured ? '#FFFFFF' : '#404040',
        resolution: 2,
        wordWrap: { width: cellW - 50 },
      });
      this.pokedexContainer.add(nameT);

      if (isCaptured) {
        const titleT = this.add.text(cx + 6, cy + 32, guest.title, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '4px',
          color: '#8080C0',
          resolution: 2,
          wordWrap: { width: cellW - 50 },
        });
        this.pokedexContainer.add(titleT);
      }
    });

    const closeHint = this.add.text(camW / 2, camW > 400 ? 600 : 580, 'Press C to close', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#606090',
      resolution: 2,
    });
    closeHint.setOrigin(0.5, 0);
    this.pokedexContainer.add(closeHint);
  }

  private hidePokedex(): void {
    this.pokedexVisible = false;
    this.pokedexContainer.setVisible(false);
  }

  // ─── Mini-map ─────────────────────────────────────────────────────────────
  private createMiniMap(): void {
    this.miniMapContainer = this.add.container(0, 0);
    this.miniMapContainer.setScrollFactor(0);
    this.miniMapContainer.setDepth(50);
  }

  private updateMiniMap(): void {
    this.miniMapContainer.removeAll(true);

    const camW = this.cameras.main.width;
    const camH = this.cameras.main.height;
    const mmW = 80;
    const mmH = 60;
    const mmX = camW - mmW - 8;
    const mmY = camH - mmH - 8;
    const scaleX = mmW / MAP_W;
    const scaleY = mmH / MAP_H;

    const bg = this.add.graphics();

    // Black background with yellow border
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(mmX - 2, mmY - 14, mmW + 4, mmH + 16);
    bg.lineStyle(2, 0xFFD700, 1);
    bg.strokeRect(mmX - 2, mmY - 14, mmW + 4, mmH + 16);

    // "MAP 1" label
    const labelT = this.add.text(mmX + mmW / 2, mmY - 11, 'MAP 1', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '5px',
      color: '#FFD700',
      resolution: 2,
    });
    labelT.setOrigin(0.5, 0);
    this.miniMapContainer.add(labelT);

    // Tiles
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const t = this.tileMap[y][x];
        let col = 0x7EC850;
        if (t === T_DIRT || t === T_FLOOR)         col = 0xE8D890;
        else if (t === T_STONE)                     col = 0xC0B8A8;
        else if (t === T_TREE)                      col = 0x4A9840;
        else if (t === T_WALL || t === T_ROOF_D ||
                 t === T_WINDOW)                    col = 0xC8A870;
        else if (t === T_ROOF_R)                    col = 0xE83020;
        else if (t === T_WATER)                     col = 0x5878E8;
        else if (t === T_FENCE_H || t === T_FENCE_V) col = 0xB09050;
        else if (t === T_FLOWER)                    col = 0xF090B0;
        else if (t === T_DOOR)                      col = 0x8B5E3C;
        bg.fillStyle(col);
        bg.fillRect(mmX + x * scaleX, mmY + y * scaleY,
                    Math.max(scaleX, 1), Math.max(scaleY, 1));
      }
    }

    // NPC dots (red = not captured, yellow = captured)
    const captured: string[] = JSON.parse(localStorage.getItem('a16z_captured') || '[]');
    GUESTS.forEach((guest) => {
      bg.fillStyle(captured.includes(guest.id) ? 0xFFFF00 : 0xFF4040);
      bg.fillRect(mmX + guest.x * scaleX - 1, mmY + guest.y * scaleY - 1, 3, 3);
    });

    // Player dot (white)
    bg.fillStyle(0xFFFFFF);
    bg.fillCircle(
      mmX + this.playerTileX * scaleX,
      mmY + this.playerTileY * scaleY,
      2
    );

    this.miniMapContainer.add(bg);
  }

  // ─── Update loop ──────────────────────────────────────────────────────────
  update(_time: number, delta: number): void {
    if (this.scene.isActive('BattleScene')) return;
    if (!this.gameReady) return;

    // Toggle pokédex
    if (Phaser.Input.Keyboard.JustDown(this.cKey)) {
      if (this.pokedexVisible) {
        this.hidePokedex();
      } else if (!this.dialogueVisible) {
        this.showPokedex();
      }
    }

    if (this.pokedexVisible) return;

    // Dialogue interaction
    if (this.dialogueVisible) {
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        if (this.nearbyGuest) {
          const guest = this.nearbyGuest;
          this.hideDialogue();
          this.scene.launch('BattleScene', { guest, playerId: this.playerId });
          this.scene.pause('WorldScene');
        }
      }
      return;
    }

    // Check proximity for dialogue
    const nearby = this.getGuestNearPlayer();
    if (nearby && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.showDialogue(nearby);
      return;
    }

    // Movement
    this.moveTimer -= delta;
    if (this.moveTimer <= 0) {
      let dx = 0;
      let dy = 0;
      let moved = false;

      if (this.cursors.left.isDown || this.wasd.left.isDown) {
        dx = -1; this.playerDir = 'left'; moved = true;
      } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
        dx = 1; this.playerDir = 'right'; moved = true;
      } else if (this.cursors.up.isDown || this.wasd.up.isDown) {
        dy = -1; this.playerDir = 'up'; moved = true;
      } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
        dy = 1; this.playerDir = 'down'; moved = true;
      }

      if (moved) {
        if (this.dialogueVisible) this.hideDialogue();

        const newX = this.playerTileX + dx;
        const newY = this.playerTileY + dy;

        if (!this.isSolid(newX, newY)) {
          this.playerTileX = newX;
          this.playerTileY = newY;
        }

        // Issue 2 fix: directional sprites
        if (this.playerDir === 'up') {
          this.player.setTexture('player_back');
          this.player.setFlipX(false);
        } else if (this.playerDir === 'down') {
          this.player.setTexture('player_front');
          this.player.setFlipX(false);
        } else if (this.playerDir === 'left') {
          this.player.setTexture('player_right');
          this.player.setFlipX(true);
        } else {
          // right
          this.player.setTexture('player_right');
          this.player.setFlipX(false);
        }

        this.player.setPosition(
          this.playerTileX * TILE + TILE / 2,
          this.playerTileY * TILE + TILE / 2
        );

        this.moveTimer = this.MOVE_DELAY;
      }
    }

    // Proximity dialogue popup
    const nearbyNow = this.getGuestNearPlayer();
    if (nearbyNow && !this.dialogueVisible) {
      this.showDialogue(nearbyNow);
    } else if (!nearbyNow && this.dialogueVisible) {
      this.hideDialogue();
    }

    // Update minimap every 500ms
    this.miniMapTimer -= delta;
    if (this.miniMapTimer <= 0) {
      this.updateMiniMap();
      this.miniMapTimer = 500;
    }
  }
}
