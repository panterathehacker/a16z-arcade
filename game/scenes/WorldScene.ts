import * as Phaser from 'phaser';
import { GUESTS, Guest } from '../data/guests';
import { getOrCreatePlayer, updateUsername, fetchCaptures } from '../services/playerService';

const TILE = 32;
const MAP_W = 40;
const MAP_H = 40;

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
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
  private escKey!: Phaser.Input.Keyboard.Key;

  private dialogueGracePeriod = true;

  private worldLayer!: Phaser.Tilemaps.TilemapLayer;
  private npcSprites: Map<string, Phaser.GameObjects.Container> = new Map();

  private dialogueBox!: Phaser.GameObjects.Container;
  private dialogueVisible = false;
  private nearbyGuest: Guest | null = null;
  private activeNPC: Guest | null = null;

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
    // ── Build the Tuxemon tilemap ──────────────────────────────────────────
    const map = this.make.tilemap({ key: 'map' });

    // The tileset name in the JSON is 'tuxmon-sample-32px-extruded', mapped to 'tiles' key
    const tileset = map.addTilesetImage('tuxmon-sample-32px-extruded', 'tiles', 32, 32, 1, 2);

    // Create layers in draw order
    const belowLayer = map.createLayer('Below Player', tileset!, 0, 0);
    this.worldLayer  = map.createLayer('World', tileset!, 0, 0)!;
    const aboveLayer = map.createLayer('Above Player', tileset!, 0, 0);

    // Set collision on World layer tiles that have the 'collides' property set to true
    this.worldLayer.setCollisionByProperty({ collides: true });

    // Above layer renders on top of player
    aboveLayer?.setDepth(10);

    // Suppress unused-variable warning — below layer is fine as-is at depth 0
    void belowLayer;

    // ── Physics world & camera bounds ─────────────────────────────────────
    const mapPixelW = map.widthInPixels;
    const mapPixelH = map.heightInPixels;
    this.cameras.main.setBounds(0, 0, mapPixelW, mapPixelH);
    this.physics.world.setBounds(0, 0, mapPixelW, mapPixelH);

    // ── Create player with physics ────────────────────────────────────────
    // Spawn in safe open area at bottom-center of map, away from all NPCs
    this.player = this.physics.add.image(640, 1100, 'player_ai');
    this.player.setDisplaySize(32, 48);
    this.player.setOrigin(0.5);
    this.player.setDepth(5);
    this.player.setCollideWorldBounds(true);

    // Slightly smaller body so player fits through tight paths
    this.player.body.setSize(20, 20);
    this.player.body.setOffset(6, 12);

    // ── Tilemap collision with player ─────────────────────────────────────
    this.physics.add.collider(this.player, this.worldLayer);

    // ── Spawn NPCs ────────────────────────────────────────────────────────
    this.spawnNPCs();

    // ── Camera ────────────────────────────────────────────────────────────
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // ── Input ─────────────────────────────────────────────────────────────
    this.setupInput();

    // ── UI overlays ───────────────────────────────────────────────────────
    this.createDialogueBox();
    this.createPokedex();
    this.createMiniMap();

    this.initPlayer();

    // Grace period: disable dialogue triggers for 2 seconds after scene load
    this.dialogueGracePeriod = true;
    this.time.delayedCall(2000, () => { this.dialogueGracePeriod = false; });
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

    const askedThisSession = sessionStorage.getItem('a16z_name_asked');
    if (!askedThisSession) {
      this.showUsernameOverlay();
    } else {
      this.gameReady = true;
    }
  }

  private showUsernameOverlay() {
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

  private spawnNPCs(): void {
    GUESTS.forEach((guest, i) => {
      const container = this.add.container(guest.px, guest.py);

      // Use AI-generated sprite if available, fall back to procedural
      const aiKey = `npc_ai_${i}`;
      const spriteKey = this.textures.exists(aiKey) ? aiKey : `npc_${i}`;
      const sprite = this.add.image(0, 0, spriteKey);
      sprite.setOrigin(0.5, 1.0); // anchor at feet so character stands on ground
      // Scale AI sprites (1024x1024) down to Pokémon trainer sprite size
      if (spriteKey === aiKey) {
        sprite.setDisplaySize(32, 48); // Pokémon trainer sprite size - matches map tile size
      }

      const labelText = this.add.text(0, -52, guest.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '5px',
        color: '#FFFFFF',
        resolution: 2,
        stroke: '#000000',
        strokeThickness: 2,
      });
      labelText.setOrigin(0.5);

      container.add([sprite, labelText]);
      container.setDepth(5);
      this.npcSprites.set(guest.id, container);

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
    this.escKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  // ─── Dialogue Box ─────────────────────────────────────────────────────────
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

    const bg = this.add.graphics();
    bg.fillStyle(0xFFFFFF, 1);
    bg.fillRect(boxX, boxY, boxW, boxH);
    bg.lineStyle(4, 0x000000, 1);
    bg.strokeRect(boxX, boxY, boxW, boxH);

    const portraitBg = this.add.graphics();
    portraitBg.fillStyle(0x202040, 1);
    portraitBg.fillRect(boxX + 8, boxY + 8, 40, 40);
    portraitBg.lineStyle(2, 0x000000, 1);
    portraitBg.strokeRect(boxX + 8, boxY + 8, 40, 40);
    portraitBg.setName('portraitBg');

    const sep = this.add.graphics();
    sep.lineStyle(1, 0x000000, 0.3);
    sep.lineBetween(boxX + 56, boxY + 55, boxX + boxW - 8, boxY + 55);

    const bottomBar = this.add.graphics();
    bottomBar.fillStyle(0xF0F0F0, 1);
    bottomBar.fillRect(boxX + 1, boxY + boxH - 22, boxW - 2, 21);
    bottomBar.lineStyle(1, 0x000000, 0.2);
    bottomBar.lineBetween(boxX + 1, boxY + boxH - 22, boxX + boxW - 1, boxY + boxH - 22);

    const nameText = this.add.text(boxX + 56, boxY + 10, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#000000',
      resolution: 2,
    });
    nameText.setName('nameText');
    nameText.setDepth(101);

    const titleText = this.add.text(boxX + 56, boxY + 26, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#444466',
      resolution: 2,
    });
    titleText.setName('titleText');
    titleText.setDepth(101);

    const bodyText = this.add.text(boxX + 56, boxY + 58, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#111111',
      resolution: 2,
      wordWrap: { width: boxW - 70 },
    });
    bodyText.setName('bodyText');
    bodyText.setDepth(101);

    const hintText = this.add.text(boxX + 8, boxY + boxH - 16, 'SPACE to battle  \u2022  Walk away to cancel', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '5px',
      color: '#666666',
      resolution: 2,
    });
    hintText.setName('hintText');
    hintText.setDepth(101);

    const arrowText = this.add.text(boxX + boxW - 14, boxY + boxH - 16, '\u25BC', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#444444',
    });
    arrowText.setDepth(101);

    const portraitSprite = this.add.image(boxX + 28, boxY + 28, 'npc_ai_0');
    portraitSprite.setOrigin(0.5);
    portraitSprite.setDisplaySize(40, 40);
    portraitSprite.setName('portraitSprite');
    portraitSprite.setDepth(101);

    this.dialogueBox.add([bg, portraitBg, sep, bottomBar, nameText, titleText, bodyText, hintText, arrowText, portraitSprite]);
  }

  private showDialogue(guest: Guest): void {
    if (this.dialogueVisible) return;
    this.dialogueVisible = true;
    this.nearbyGuest = guest;
    this.activeNPC = guest;
    this.dialogueBox.setVisible(true);

    const guestIndex = GUESTS.findIndex(g => g.id === guest.id);

    const nameText    = this.dialogueBox.getByName('nameText')      as Phaser.GameObjects.Text;
    const titleText   = this.dialogueBox.getByName('titleText')     as Phaser.GameObjects.Text;
    const bodyText    = this.dialogueBox.getByName('bodyText')      as Phaser.GameObjects.Text;
    const portraitSpr = this.dialogueBox.getByName('portraitSprite') as Phaser.GameObjects.Image;

    if (nameText)  nameText.setText(guest.name);
    if (titleText) titleText.setText(guest.title);
    if (bodyText)  bodyText.setText(`${guest.name} wants to\ntest your knowledge!`);
    if (portraitSpr && guestIndex >= 0) {
      const aiKey = `npc_ai_${guestIndex}`;
      portraitSpr.setTexture(this.textures.exists(aiKey) ? aiKey : `npc_${guestIndex}`);
      portraitSpr.setDisplaySize(40, 40);
    }
  }

  private hideDialogue(): void {
    this.dialogueVisible = false;
    this.nearbyGuest = null;
    this.activeNPC = null;
    this.dialogueBox.setVisible(false);
  }

  private dismissDialogue(): void {
    this.hideDialogue();
  }

  private getGuestNearPlayer(): Guest | null {
    const px = this.player.x;
    const py = this.player.y;
    for (const guest of GUESTS) {
      const dx = Math.abs(guest.px - px);
      const dy = Math.abs(guest.py - py);
      // Within ~2 tiles (64px) in each direction
      if (dx <= 64 && dy <= 64) {
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

      if (isCaptured) {
        const aiKey = `npc_ai_${i}`;
        const miniSprite = this.add.image(cx + cellW - 26, cy + cellH / 2 - 2, this.textures.exists(aiKey) ? aiKey : `npc_${i}`);
        miniSprite.setOrigin(0.5);
        if (this.textures.exists(aiKey)) {
          miniSprite.setDisplaySize(28, 28);
        } else {
          miniSprite.setScale(0.9);
        }
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
    const mmH = 80;
    const mmX = camW - mmW - 8;
    const mmY = camH - mmH - 8;
    const scaleX = mmW / MAP_W;
    const scaleY = mmH / MAP_H;

    const bg = this.add.graphics();

    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(mmX - 2, mmY - 14, mmW + 4, mmH + 16);
    bg.lineStyle(2, 0xFFD700, 1);
    bg.strokeRect(mmX - 2, mmY - 14, mmW + 4, mmH + 16);

    const labelT = this.add.text(mmX + mmW / 2, mmY - 11, 'TUXEMON', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '5px',
      color: '#FFD700',
      resolution: 2,
    });
    labelT.setOrigin(0.5, 0);
    this.miniMapContainer.add(labelT);

    // Draw a simple green base for the whole minimap
    bg.fillStyle(0x7EC850);
    bg.fillRect(mmX, mmY, mmW, mmH);

    // NPC dots
    const captured: string[] = JSON.parse(localStorage.getItem('a16z_captured') || '[]');
    GUESTS.forEach((guest) => {
      const tileX = guest.px / TILE;
      const tileY = guest.py / TILE;
      bg.fillStyle(captured.includes(guest.id) ? 0xFFFF00 : 0xFF4040);
      bg.fillRect(mmX + tileX * scaleX - 1, mmY + tileY * scaleY - 1, 3, 3);
    });

    // Player dot
    const playerTileX = this.player.x / TILE;
    const playerTileY = this.player.y / TILE;
    bg.fillStyle(0xFFFFFF);
    bg.fillCircle(
      mmX + playerTileX * scaleX,
      mmY + playerTileY * scaleY,
      2
    );

    this.miniMapContainer.add(bg);
  }

  // ─── Update loop ──────────────────────────────────────────────────────────
  update(_time: number, delta: number): void {
    if (this.scene.isActive('BattleScene')) return;
    if (!this.gameReady) return;

    // Default velocity to zero; movement code below sets it appropriately
    this.player.setVelocity(0);

    if (Phaser.Input.Keyboard.JustDown(this.cKey)) {
      if (this.pokedexVisible) {
        this.hidePokedex();
      } else if (!this.dialogueVisible) {
        this.showPokedex();
      }
    }

    if (this.pokedexVisible) return;

    // Movement via velocity (physics-based) — always allow movement
    this.moveTimer -= delta;

    const speed = 160;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      vx = -speed; this.playerDir = 'left';
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      vx = speed; this.playerDir = 'right';
    } else if (this.cursors.up.isDown || this.wasd.up.isDown) {
      vy = -speed; this.playerDir = 'up';
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      vy = speed; this.playerDir = 'down';
    }

    // Allow movement even during dialogue — walking away dismisses it
    this.player.setVelocity(vx, vy);

    // Update player sprite direction
    if (vx !== 0 || vy !== 0) {
      if (this.playerDir === 'up') {
        this.player.setTexture('player_ai');
        this.player.setFlipX(false);
      } else if (this.playerDir === 'down') {
        this.player.setTexture('player_ai');
        this.player.setFlipX(false);
      } else if (this.playerDir === 'left') {
        this.player.setTexture('player_ai');
        this.player.setFlipX(true);
      } else {
        this.player.setTexture('player_ai');
        this.player.setFlipX(false);
      }
    }

    // Dialogue: handle interaction and dismissal
    if (this.dialogueVisible && this.activeNPC) {
      // Dismiss if player moved > 80px away from NPC
      const npcSprite = this.npcSprites.get(this.activeNPC.id);
      const npcX = npcSprite ? npcSprite.x : this.activeNPC.px;
      const npcY = npcSprite ? npcSprite.y : this.activeNPC.py;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npcX, npcY);
      if (dist > 80) {
        this.dismissDialogue();
      }
      // Dismiss on ESC
      if (this.escKey && Phaser.Input.Keyboard.JustDown(this.escKey)) {
        this.dismissDialogue();
      }
      // SPACE to start battle
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        if (this.nearbyGuest) {
          const guest = this.nearbyGuest;
          this.hideDialogue();
          this.scene.launch('BattleScene', { guest, playerId: this.playerId });
          this.scene.pause('WorldScene');
        }
      }
    } else if (!this.dialogueVisible) {
      // Check proximity for dialogue trigger (with grace period)
      if (!this.dialogueGracePeriod) {
        const nearby = this.getGuestNearPlayer();
        if (nearby && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          this.showDialogue(nearby);
        }
        // Proximity dialogue popup (auto-show when walking near)
        const nearbyNow = this.getGuestNearPlayer();
        if (nearbyNow) {
          this.showDialogue(nearbyNow);
        }
      }
    }

    // Update minimap every 500ms
    this.miniMapTimer -= delta;
    if (this.miniMapTimer <= 0) {
      this.updateMiniMap();
      this.miniMapTimer = 500;
    }
  }
}
