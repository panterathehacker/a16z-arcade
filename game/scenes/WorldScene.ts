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
  private npcGroup!: Phaser.Physics.Arcade.StaticGroup;

  private dialogueOverlay: HTMLDivElement | null = null;
  private playerNameLabel!: Phaser.GameObjects.Text;
  private playerSpriteSet = "player-male";
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

    // Use setCollisionByExclusion so all non-empty tiles in the World layer are solid.
    // setCollisionByProperty can fail with embedded tilesets in Phaser 3; this is more reliable.
    this.worldLayer.setCollisionByExclusion([-1]);

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
    const playerGender = localStorage.getItem('a16z_gender') || 'male';
    const pSet = playerGender === 'female' ? 'player-female' : 'player-male';
    this.playerSpriteSet = pSet;
    this.player = this.physics.add.image(352, 1216, pSet + '_front');
    this.player.setDisplaySize(64, 80);
    this.player.setOrigin(0.5);
    this.player.setDepth(5);
    this.player.setCollideWorldBounds(true);

    // Player name label (updated from localStorage)
    const savedName = localStorage.getItem('a16z_username') || 'You';
    this.playerNameLabel = this.add.text(352, 1216 - 84, savedName, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#FFFF00',
      resolution: 2,
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(6);

    // Slightly smaller body so player fits through tight paths
    this.player.body.setSize(24, 28);
    this.player.body.setOffset(12, 36);

    // ── Tilemap collision with player ─────────────────────────────────────
    this.physics.add.collider(this.player, this.worldLayer);

    // ── Spawn NPCs ────────────────────────────────────────────────────────
    this.npcGroup = this.physics.add.staticGroup();
    this.spawnNPCs();
    this.physics.add.collider(this.player, this.npcGroup);

    // ── Camera ────────────────────────────────────────────────────────────
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // ── Input ─────────────────────────────────────────────────────────────
    this.setupInput();

    // ── UI overlays ───────────────────────────────────────────────────────
    // Dialogue box is now a DOM overlay — no Phaser container needed
    this.createPokedex();
    this.createMiniMap();

    this.initPlayer();

    // Grace period: disable dialogue triggers for 2 seconds after scene load
    this.dialogueGracePeriod = true;
    this.time.delayedCall(2000, () => { this.dialogueGracePeriod = false; });

    // When resuming from battle, reset dialogue state
    this.events.on('resume', () => {
      this.dialogueVisible = false;
      this.nearbyGuest = null;
      this.activeNPC = null;
      if (this.dialogueOverlay) {
        this.dialogueOverlay.remove();
        this.dialogueOverlay = null;
      }
      // Short grace period after battle so player doesn't immediately re-trigger
      this.dialogueGracePeriod = true;
      this.time.delayedCall(800, () => { this.dialogueGracePeriod = false; });
    });
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

    // Always ask for name on fresh page load (sessionStorage cleared each browser session)
    sessionStorage.removeItem('a16z_name_asked');
    this.showUsernameOverlay();
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
      border-radius: 16px;
      padding: 40px 36px;
      text-align: center;
      max-width: 460px;
      width: 92%;
    `;

    const title = document.createElement('div');
    title.style.cssText = `color: #60A0FF; font-size: 20px; margin-bottom: 12px; letter-spacing: 2px;`;
    title.textContent = 'a16z ARCADE';

    const subtitle = document.createElement('div');
    subtitle.style.cssText = `color: #8080C0; font-size: 11px; margin-bottom: 32px; line-height: 2;`;
    subtitle.textContent = 'Enter your trainer name:';

    // Gender selector
    const genderRow = document.createElement('div');
    genderRow.style.cssText = 'display:flex;gap:16px;justify-content:center;margin-bottom:24px;';
    let selectedGender = 'male';
    const genderBtns: HTMLButtonElement[] = [];
    [{id:'male',icon:'male',label:'HE/HIM'},{id:'female',icon:'female',label:'SHE/HER'}].forEach(({id,icon,label},idx) => {
      const gb = document.createElement('button');
      const isSel = idx === 0;
      gb.style.cssText = 'font-family:"Press Start 2P",monospace;font-size:9px;background:' + (isSel?'#3050C0':'#0a0a2a') + ';color:#fff;border:2px solid ' + (isSel?'#80A0FF':'#303060') + ';border-radius:8px;padding:12px 18px;cursor:pointer;flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;';
      const iconEl = document.createElement('span');
      iconEl.style.cssText = 'width:36px;height:36px;display:flex;align-items:center;justify-content:center;';
      if (icon === 'male') {
        iconEl.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='36' height='36'><circle cx='12' cy='4.5' r='2.5'/><rect x='10' y='8' width='4' height='9' rx='1'/><rect x='10' y='16' width='1.5' height='6' rx='0.5'/><rect x='12.5' y='16' width='1.5' height='6' rx='0.5'/></svg>";
      } else {
        iconEl.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='36' height='36'><circle cx='12' cy='4.5' r='2.5'/><path d='M9 8 Q12 8 15 8 L14 17 Q13 22 12 22 Q11 22 10 17 Z' /><line x1='12' y1='22' x2='12' y2='24' stroke='white' stroke-width='1.5'/></svg>";
      }
      const labelEl = document.createElement('span');
      labelEl.textContent = label;
      gb.appendChild(iconEl); gb.appendChild(labelEl);
      gb.addEventListener('click', () => {
        selectedGender = id;
        localStorage.setItem('a16z_gender', id);
        genderBtns.forEach((b, i) => {
          const s = i===(id==='male'?0:1);
          b.style.background = s?'#3050C0':'#0a0a2a';
          b.style.borderColor = s?'#80A0FF':'#303060';
        });
      });
      genderBtns.push(gb);
      genderRow.appendChild(gb);
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 16;
    input.placeholder = 'Trainer';
    input.style.cssText = `
      width: 100%;
      padding: 14px 16px;
      font-family: "Press Start 2P", monospace;
      font-size: 12px;
      background: #0a0a1a;
      border: 2px solid #4060C0;
      border-radius: 8px;
      color: #FFFFFF;
      text-align: center;
      margin-bottom: 24px;
      box-sizing: border-box;
      outline: none;
    `;

    const btn = document.createElement('button');
    btn.textContent = 'START GAME';
    btn.style.cssText = `
      font-family: "Press Start 2P", monospace;
      font-size: 11px;
      background: #3050C0;
      color: #FFFFFF;
      border: 2px solid #6080FF;
      border-radius: 8px;
      padding: 16px 24px;
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
      // Update sprite set based on chosen gender
      const chosenGender = localStorage.getItem('a16z_gender') || 'male';
      this.playerSpriteSet = chosenGender === 'female' ? 'player-female' : 'player-male';
      if (this.player && this.textures.exists(this.playerSpriteSet + '_front')) {
        this.player.setTexture(this.playerSpriteSet + '_front');
        this.player.setFlipX(false);
      }
      this.gameReady = true;
      // Update player name label
      if (this.playerNameLabel) {
        this.playerNameLabel.setText(name);
      }
    };

    btn.addEventListener('click', confirm);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirm();
    });

    box.appendChild(title);
    box.appendChild(subtitle);
    box.appendChild(genderRow);
    box.appendChild(input);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    this.usernameOverlay = overlay;

    setTimeout(() => input.focus(), 100);
  }

  private spawnNPCs(): void {
    GUESTS.forEach((guest, i) => {
      // Skip the player entry — it has no NPC sprite and causes a black box
      if (guest.id === 'player') return;

      const container = this.add.container(guest.px, guest.py);

      // Use AI-generated sprite if available, fall back to procedural
      const aiKey = `npc_ai_${i}`;
      const spriteKey = this.textures.exists(aiKey) ? aiKey : `npc_${i}`;
      const sprite = this.add.image(0, 0, spriteKey);
      sprite.setOrigin(0.5, 1.0); // anchor at feet so character stands on ground
      // Scale AI sprites (1024x1024) down to Pokémon trainer sprite size
      if (spriteKey === aiKey) {
        sprite.setDisplaySize(64, 80); // Pokémon trainer sprite size - matches map tile size
      }

      const labelText = this.add.text(0, -84, guest.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#FFFFFF',
        resolution: 2,
        stroke: '#000000',
        strokeThickness: 3,
      });
      labelText.setOrigin(0.5);

      container.add([sprite, labelText]);
      container.setDepth(5);
      this.npcSprites.set(guest.id, container);
      
      // Add invisible physics body for collision
      const npcBody = this.physics.add.staticImage(guest.px, guest.py - 24, '__DEFAULT')
        .setDisplaySize(32, 48)
        .setVisible(false);
      this.npcGroup.add(npcBody);

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

  // ─── Dialogue Box (DOM overlay — avoids Phaser scroll-factor clipping) ───────
  private showDialogue(guest: Guest): void {
    if (this.dialogueVisible) return;
    this.dialogueVisible = true;
    this.nearbyGuest = guest;
    this.activeNPC = guest;

    // Remove any stale overlay
    if (this.dialogueOverlay) {
      this.dialogueOverlay.remove();
      this.dialogueOverlay = null;
    }

    const guestIndex = GUESTS.findIndex(g => g.id === guest.id);

    // Resolve portrait: prefer canvas-rendered sprite texture, fall back to PNG path
    let portraitSrc = `/assets/sprites/guests/${guest.id}.png`;
    // Try to get data URL directly from Phaser texture for reliable rendering
    const aiKey = `npc_ai_${guestIndex}`;
    const texKey = this.textures.exists(aiKey) ? aiKey : '';
    if (texKey) {
      try {
        const frame = this.textures.getFrame(texKey);
        const src = frame?.source?.image as HTMLImageElement | HTMLCanvasElement | null;
        if (src) {
          // Create a canvas to extract the image as data URL
          const tmpCanvas = document.createElement('canvas');
          tmpCanvas.width = frame.realWidth;
          tmpCanvas.height = frame.realHeight;
          const tmpCtx = tmpCanvas.getContext('2d');
          if (tmpCtx && src) {
            tmpCtx.drawImage(src as CanvasImageSource, 
              frame.cutX, frame.cutY, frame.realWidth, frame.realHeight,
              0, 0, frame.realWidth, frame.realHeight);
            portraitSrc = tmpCanvas.toDataURL('image/png');
          }
        }
      } catch (_) { /* fallback to URL */ }
    }

    // Position dialogue inside the game canvas
    const canvas = document.querySelector('canvas');
    const canvasRect = canvas ? canvas.getBoundingClientRect() : { left: 0, bottom: window.innerHeight, width: window.innerWidth };
    const dlgLeft = canvasRect.left;
    const dlgWidth = canvasRect.width;
    const dlgBottom = window.innerHeight - (canvas ? canvas.getBoundingClientRect().bottom : 0);

    // LennyRPG-style dialogue box
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      left: ${dlgLeft}px;
      width: ${dlgWidth}px;
      bottom: ${dlgBottom}px;
      height: 200px;
      background: #ffffff;
      border: 5px solid #000000;
      font-family: "Press Start 2P", monospace;
      z-index: 500;
      box-sizing: border-box;
    `;

    // Inner layout: portrait left, text right
    const inner = document.createElement('div');
    inner.style.cssText = `display: flex; align-items: flex-start; padding: 12px 14px 8px 12px; height: 150px;`;

    // Portrait thumbnail
    const portrait = document.createElement('div');
    portrait.style.cssText = `
      width: 80px; height: 100px; min-width: 80px;
      background: #e8e8e8;
      border: 2px solid #000;
      overflow: hidden;
      image-rendering: pixelated;
      margin-right: 14px;
    `;
    if (portraitSrc) {
      const img = document.createElement('img');
      img.src = portraitSrc;
      img.style.cssText = `width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated;`;
      portrait.appendChild(img);
    }

    // Right side: name + title + separator + body
    const right = document.createElement('div');
    right.style.cssText = `display: flex; flex-direction: column; flex: 1; overflow: hidden;`;

    const nameEl = document.createElement('div');
    nameEl.style.cssText = `font-size: 20px; font-weight: bold; color: #000000; white-space: nowrap; letter-spacing: 1px; margin-bottom: 6px; font-family: "Press Start 2P", monospace;`;
    nameEl.textContent = guest.name.toUpperCase();

    const titleEl = document.createElement('div');
    titleEl.style.cssText = `font-size: 12px; color: #555555; white-space: nowrap; margin-bottom: 10px;`;
    titleEl.textContent = guest.title;

    const sep = document.createElement('hr');
    sep.style.cssText = `border: none; border-top: 1px solid #000; margin: 0 0 8px 0;`;

    const bodyEl = document.createElement('div');
    bodyEl.style.cssText = `font-size: 15px; font-weight: bold; color: #000000; line-height: 1.8; font-family: "Press Start 2P", monospace;`;
    bodyEl.textContent = `${guest.name.split(' ')[0]} has a challenge for you!`;

    right.appendChild(nameEl);
    right.appendChild(titleEl);
    right.appendChild(sep);
    right.appendChild(bodyEl);

    inner.appendChild(portrait);
    inner.appendChild(right);

    // Bottom bar with SPACE pill
    const bottomBar = document.createElement('div');
    bottomBar.style.cssText = `
      border-top: 2px solid #000;
      height: 34px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 8px;
    `;

    const spacePill = document.createElement('span');
    spacePill.style.cssText = `
      background: #000; color: #fff;
      font-family: "Press Start 2P", monospace;
      font-size: 11px; padding: 5px 10px;
      border-radius: 2px;
    `;
    spacePill.textContent = 'SPACE';

    const hintEl = document.createElement('span');
    hintEl.style.cssText = `font-size: 11px; color: #333333;`;
    hintEl.textContent = 'to battle  •  Walk away to cancel';

    const arrowEl = document.createElement('span');
    arrowEl.style.cssText = `margin-left: auto; font-size: 10px; color: #000;`;
    arrowEl.textContent = '▼';

    bottomBar.appendChild(spacePill);
    bottomBar.appendChild(hintEl);
    bottomBar.appendChild(arrowEl);

    overlay.appendChild(inner);
    overlay.appendChild(bottomBar);
    document.body.appendChild(overlay);
    this.dialogueOverlay = overlay;
  }

  private hideDialogue(): void {
    this.dialogueVisible = false;
    this.nearbyGuest = null;
    this.activeNPC = null;
    if (this.dialogueOverlay) {
      this.dialogueOverlay.remove();
      this.dialogueOverlay = null;
    }
  }

  private dismissDialogue(): void {
    this.hideDialogue();
  }

  private getGuestNearPlayer(): Guest | null {
    const px = this.player.x;
    const py = this.player.y;
    for (const guest of GUESTS) {
      if (guest.id === 'player') continue; // skip player entry
      const dx = Math.abs(guest.px - px);
      const dy = Math.abs(guest.py - py);
      // Within ~2 tiles (64px) in each direction
      if (dx <= 32 && dy <= 32) {
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

    // Update player name label every frame so it follows the player
    if (this.playerNameLabel && this.player) {
      this.playerNameLabel.setPosition(this.player.x, this.player.y - 52);
    }

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
        this.player.setTexture(this.playerSpriteSet + '_back');
        this.player.setFlipX(false);
      } else if (this.playerDir === 'down') {
        this.player.setTexture(this.playerSpriteSet + '_front');
        this.player.setFlipX(false);
        this.player.setFlipX(false);
      } else if (this.playerDir === 'left') {
        this.player.setTexture(this.playerSpriteSet + '_right');
        this.player.setFlipX(true);
        this.player.setFlipX(false);
      } else if (this.playerDir === 'right') {
        this.player.setTexture(this.playerSpriteSet + '_right');
        this.player.setFlipX(false);
      } else {
        this.player.setTexture(this.playerSpriteSet + '_back');
        this.player.setFlipX(false);
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
          // Stop any existing BattleScene first to prevent double-render
          if (this.scene.get('BattleScene')) {
            this.scene.stop('BattleScene');
          }
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
