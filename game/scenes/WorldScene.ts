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

  // Mobile controls
  private mobileDir: string | null = null;
  private mobileDpad: HTMLDivElement | null = null;
  private mobileInteract = false;

  private dialogueGracePeriod = true;

  private worldLayer!: Phaser.Tilemaps.TilemapLayer;
  private npcSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private npcTilePositions: Map<string, {tx: number, ty: number}> = new Map();
  private npcGroup!: Phaser.Physics.Arcade.StaticGroup;

  private dialogueOverlay: HTMLDivElement | null = null;
  private playerNameLabel!: Phaser.GameObjects.Text;
  private playerSpriteSet = "player-male";
  private dialogueVisible = false;
  private nearbyGuest: Guest | null = null;
  private activeNPC: Guest | null = null;

  private pokedexContainer!: Phaser.GameObjects.Container;
  private pokedexVisible = false;
  private pokedexOverlay: HTMLDivElement | null = null;

  private miniMapContainer!: Phaser.GameObjects.Container;
  private miniMapTimer = 0;

  public playerId: string | null = null;
  public sessionId: string | null = null;

  private usernameOverlay: HTMLDivElement | null = null;
  private gameReady = false;

  // Battle transition flag to prevent double-trigger
  private inBattleTransition = false;

  // Tile-based movement (LennyRPG style)
  private playerTileX = 11;
  private playerTileY = 38;
  private moveDelay = 120;
  private lastMoveTime = 0;
  private isMoving = false;

  // Encounter messages pool (LennyRPG-style randomized)
  private readonly encounterMessages = [
    "wants to quiz you!",
    "has a question for you!",
    "is ready for a trivia round!",
    "would like to test your knowledge!",
    "is looking for a sparring partner!",
    "waves you over!",
    "has a 5-question challenge!",
    "wants to talk tech!",
    "is up for a quick challenge!",
    "invites you to a knowledge duel!",
    "wants to compare notes!",
    "is eager to share ideas!",
    "is ready to learn together!",
    "wants to see what you know!",
    "has a quick prompt for you!",
    "brought a fresh perspective!",
    "has a few insights to test!",
    "has a challenge worth sharing!",
    "has a question from the podcast!",
    "wants your best answer!",
    "is ready to hear your reasoning!",
    "is ready for round one!",
  ];

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

    // Use tile property 'collides' to mark only blocking tiles solid.
    this.worldLayer.setCollisionByProperty({ collides: true });

    // Above layer renders on top of player
    aboveLayer?.setDepth(10);

    void belowLayer;

    // ── Physics world & camera bounds ─────────────────────────────────────
    const mapPixelW = map.widthInPixels;
    const mapPixelH = map.heightInPixels;
    this.cameras.main.setBounds(0, 0, mapPixelW, mapPixelH);
    this.physics.world.setBounds(0, 0, mapPixelW, mapPixelH);

    // ── Create player with physics ────────────────────────────────────────
    const playerGender = localStorage.getItem('a16z_gender') || 'male';
    const pSet = playerGender === 'female' ? 'player-female' : 'player-male';
    this.playerSpriteSet = pSet;
    this.player = this.physics.add.image(352, 1216, pSet + '_front');
    this.playerTileX = Math.round(352 / 32);
    this.playerTileY = Math.round(1216 / 32);
    this.player.setDisplaySize(80, 100);
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


    // ── Camera ────────────────────────────────────────────────────────────
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // ── Input ─────────────────────────────────────────────────────────────
    this.setupInput();
    this.setupMobileControls();

    // ── UI overlays ───────────────────────────────────────────────────────
    this.createPokedex();
    this.createMiniMap();

    this.initPlayer();

    this.inBattleTransition = false;

    // Listen for open-pokedex event from React UI
    window.addEventListener('open-pokedex', () => {
      if (!this.pokedexVisible) this.showPokedex();
    });

    // Grace period: disable dialogue triggers for 2 seconds after scene load
    this.dialogueGracePeriod = true;
    this.time.delayedCall(2000, () => { this.dialogueGracePeriod = false; });

    // No 'resume' handler needed - WorldScene never pauses now (BattleScene runs as overlay)
  }

  // ─── NPC tile collision (LennyRPG approach) ──────────────────────────────
  private isOccupiedByNPC(tx: number, ty: number): boolean {
    // Use live NPC tile positions (LennyRPG approach: check npcs array tile coords)
    for(const [npcId, pos] of this.npcTilePositions) {
      if(pos.tx === tx && pos.ty === ty) {
        console.log('[Collision] NPC blocked:', npcId, 'at tile', tx, ty, '(player at', this.playerTileX, this.playerTileY, ')');
        return true;
      }
    }
    return false;
  }

  // ─── Battle Transition (Feature 1: LennyRPG-inspired pixel swirl/flash) ──
  private startBattleTransition(guest: Guest) {
    if (this.inBattleTransition) return;
    this.inBattleTransition = true;
    
    // CRITICAL: Remove ALL dialogue overlays before battle starts
    this.dialogueVisible = false;
    this.nearbyGuest = null;
    this.activeNPC = null;
    if (this.dialogueOverlay) {
      this.dialogueOverlay.remove();
      this.dialogueOverlay = null;
    }
    const staleOverlay = document.getElementById('a16z-dialogue-overlay');
    if (staleOverlay) staleOverlay.remove();
    
    // Input blocked by inBattleTransition flag during animation

    // Pixel swirl transition (LennyRPG style) using DOM canvas overlay
    const gameCanvas = document.querySelector('canvas');
    if (!gameCanvas) {
      // Fallback: just launch battle on top (no pause)
      if (this.scene.get('BattleScene')) this.scene.stop('BattleScene');
      this.scene.launch('BattleScene', { guest, playerId: this.playerId });
      return;
    }
    
    const swirlCanvas = document.createElement('canvas');
    const rect = gameCanvas.getBoundingClientRect();
    swirlCanvas.width = rect.width;
    swirlCanvas.height = rect.height;
    swirlCanvas.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      z-index: 9998;
      pointer-events: none;
    `;
    document.body.appendChild(swirlCanvas);
    
    const ctx = swirlCanvas.getContext('2d')!;
    const W = swirlCanvas.width;
    const H = swirlCanvas.height;
    const gridSize = 16;
    const blockW = W / gridSize;
    const blockH = H / gridSize;
    const centerX = gridSize / 2;
    const centerY = gridSize / 2;
    const duration = 1000;
    const spiralTurns = 3;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      
      for (let gy = 0; gy < gridSize; gy++) {
        for (let gx = 0; gx < gridSize; gx++) {
          const dx = gx - centerX + 0.5;
          const dy = gy - centerY + 0.5;
          const distance = Math.sqrt(dx*dx + dy*dy);
          let angle = Math.atan2(dy, dx);
          angle = -angle + Math.PI/2;
          const normalizedAngle = ((angle + Math.PI*2) % (Math.PI*2)) / (Math.PI*2);
          const maxDistance = Math.sqrt(centerX*centerX + centerY*centerY);
          const normalizedDistance = distance / maxDistance;
          const spiralValue = normalizedAngle + normalizedDistance * spiralTurns;
          const normalizedSpiral = spiralValue / spiralTurns;
          if (normalizedSpiral < progress) {
            ctx.clearRect(gx*blockW, gy*blockH, blockW, blockH);
          }
        }
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Black out then launch
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);
        setTimeout(() => {
          swirlCanvas.remove();
          // scene.start() cleanly restarts BattleScene each time
          // It handles stopping any existing instance automatically
          // Don't pause WorldScene! Launch BattleScene as overlay on top
          this.scene.launch('BattleScene', { guest, playerId: this.playerId });
        }, 150);
      }
    };
    
    requestAnimationFrame(animate);
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
      background: rgba(26, 0, 8, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: "Press Start 2P", monospace;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      background: #1a0008;
      border: 3px solid #FFD700;
      border-radius: 4px;
      image-rendering: pixelated;
      padding: 40px 36px;
      text-align: center;
      max-width: 460px;
      width: 92%;
    `;

    const title = document.createElement('div');
    title.style.cssText = `color: #FFD700; font-size: 20px; margin-bottom: 12px; letter-spacing: 2px; text-shadow: 1px 1px 0 #4A0315;`;
    title.textContent = 'a16z ARCADE';

    const subtitle = document.createElement('div');
    subtitle.style.cssText = `color: rgba(255,215,0,0.65); font-size: 11px; margin-bottom: 32px; line-height: 2;`;
    subtitle.textContent = 'Enter your trainer name:';

    // Gender selector
    const genderRow = document.createElement('div');
    genderRow.style.cssText = 'display:flex;gap:16px;justify-content:center;margin-bottom:24px;';
    let selectedGender = 'male';
    const genderBtns: HTMLButtonElement[] = [];
    [{id:'male',icon:'male',label:'HE/HIM'},{id:'female',icon:'female',label:'SHE/HER'}].forEach(({id,icon,label},idx) => {
      const gb = document.createElement('button');
      const isSel = idx === 0;
      gb.style.cssText = 'font-family:"Press Start 2P",monospace;font-size:9px;background:' + (isSel?'#4A0315':'#0d0004') + ';color:#fff;border:2px solid ' + (isSel?'#FFD700':'rgba(255,215,0,0.3)') + ';border-radius:8px;padding:12px 18px;cursor:pointer;flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;';
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
      const capturedId = id;
      gb.setAttribute('data-gender', capturedId);
      gb.addEventListener('click', () => {
        selectedGender = capturedId;
        localStorage.setItem('a16z_gender', capturedId);
        console.log('[Gender] Clicked:', capturedId, 'saved to localStorage:', localStorage.getItem('a16z_gender'));
        genderBtns.forEach((b) => {
          const isThis = b.getAttribute('data-gender') === capturedId;
          b.style.background = isThis?'#3050C0':'#0a0a2a';
          b.style.borderColor = isThis?'#80A0FF':'#303060';
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
      background: #0d0004;
      border: 2px solid #FFD700;
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
      background: #4A0315;
      color: #FFD700;
      border: 2px solid #FFD700;
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
      const chosenGender = localStorage.getItem('a16z_gender') || 'male';
      this.playerSpriteSet = chosenGender === 'female' ? 'player-female' : 'player-male';
      const frontKey = this.playerSpriteSet + '_front';
      console.log('[WorldScene] Gender:', chosenGender, 'Set:', this.playerSpriteSet, 'Texture exists:', this.textures.exists(frontKey));
      if (this.player) {
        this.player.setTexture(frontKey);
        this.player.setFlipX(false);
        console.log('[WorldScene] Player texture set to', frontKey);
      }
      this.gameReady = true;
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
      if (guest.id === 'player') return;

      const container = this.add.container(guest.px, guest.py);

      const aiKey = `npc_ai_${i}`;
      const spriteKey = this.textures.exists(aiKey) ? aiKey : `npc_${i}`;
      const sprite = this.add.image(0, 0, spriteKey);
      sprite.setOrigin(0.5, 1.0);
      if (spriteKey === aiKey) {
        sprite.setDisplaySize(80, 100);
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
      // Track tile position for collision (LennyRPG approach)
      this.npcTilePositions.set(guest.id, { tx: Math.floor(guest.px/32), ty: Math.floor(guest.py/32) });
      
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

  private setupMobileControls(): void {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isMobile) return;

    const dpad = document.createElement('div');
    dpad.id = 'mobile-dpad';
    dpad.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 150px;
      height: 150px;
      z-index: 1000;
      user-select: none;
      -webkit-user-select: none;
    `;

    const dirs = [
      { dir: 'up',    icon: '▲', top: '0px',   left: '50px',  w: '50px', h: '50px' },
      { dir: 'down',  icon: '▼', top: '100px',  left: '50px',  w: '50px', h: '50px' },
      { dir: 'left',  icon: '◄', top: '50px',  left: '0px',   w: '50px', h: '50px' },
      { dir: 'right', icon: '►', top: '50px',  left: '100px', w: '50px', h: '50px' },
    ];

    dirs.forEach(({ dir, icon, top, left, w, h }) => {
      const btn = document.createElement('div');
      btn.style.cssText = `
        position: absolute;
        top: ${top}; left: ${left};
        width: ${w}; height: ${h};
        background: rgba(255,255,255,0.3);
        border: 2px solid rgba(255,255,255,0.6);
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        font-size: 20px;
        color: white;
        touch-action: none;
        cursor: pointer;
      `;
      btn.textContent = icon;

      const startMove = () => { this.mobileDir = dir; };
      const stopMove = () => { if (this.mobileDir === dir) this.mobileDir = null; };

      btn.addEventListener('touchstart', (e) => { e.preventDefault(); startMove(); }, { passive: false });
      btn.addEventListener('touchend', stopMove);
      btn.addEventListener('touchcancel', stopMove);
      btn.addEventListener('mousedown', startMove);
      btn.addEventListener('mouseup', stopMove);

      dpad.appendChild(btn);
    });

    document.body.appendChild(dpad);
    this.mobileDpad = dpad;

    const interactBtn = document.createElement('div');
    interactBtn.id = 'mobile-interact';
    interactBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: rgba(255, 200, 50, 0.5);
      border: 2px solid rgba(255, 220, 80, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      z-index: 1000;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      cursor: pointer;
    `;
    interactBtn.textContent = '⚔';

    interactBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.mobileInteract = true;
    }, { passive: false });
    interactBtn.addEventListener('touchend', () => { this.mobileInteract = false; });
    interactBtn.addEventListener('touchcancel', () => { this.mobileInteract = false; });
    interactBtn.addEventListener('mousedown', () => { this.mobileInteract = true; });
    interactBtn.addEventListener('mouseup', () => { this.mobileInteract = false; });

    document.body.appendChild(interactBtn);

    const pokedexBtn = document.createElement('div');
    pokedexBtn.id = 'mobile-pokedex';
    pokedexBtn.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 52px;
      height: 52px;
      background: rgba(80, 150, 255, 0.7);
      border: 2px solid rgba(120, 180, 255, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      z-index: 1000;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      cursor: pointer;
    `;
    pokedexBtn.textContent = '📖';
    pokedexBtn.title = 'Pokédex';

    pokedexBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.togglePokedex();
    }, { passive: false });
    pokedexBtn.addEventListener('click', () => { this.togglePokedex(); });

    document.body.appendChild(pokedexBtn);
  }

  // ─── Dialogue Box (DOM overlay) ───────────────────────────────────────────
  private showDialogue(guest: Guest): void {
    if (this.dialogueVisible) return;
    if (this.inBattleTransition) return; // Don't show during transition
    this.dialogueVisible = true;
    this.nearbyGuest = guest;
    this.activeNPC = guest;

    if (this.dialogueOverlay) {
      this.dialogueOverlay.remove();
      this.dialogueOverlay = null;
    }

    const guestIndex = GUESTS.findIndex(g => g.id === guest.id);

    let portraitSrc = `/assets/sprites/guests/${guest.id}.png`;
    const aiKey = `npc_ai_${guestIndex}`;
    const texKey = this.textures.exists(aiKey) ? aiKey : '';
    if (texKey) {
      try {
        const frame = this.textures.getFrame(texKey);
        const src = frame?.source?.image as HTMLImageElement | HTMLCanvasElement | null;
        if (src) {
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

    // Inject LennyRPG-style keyframe animations once
    if (!document.getElementById('a16z-dialogue-styles')) {
      const style = document.createElement('style');
      style.id = 'a16z-dialogue-styles';
      style.textContent = `
        @keyframes arrowBounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(4px); opacity: 0.6; }
        }
        @keyframes dialogSlideUp {
          from { transform: translateX(-50%) translateY(100px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        #a16z-dialogue-overlay {
          animation: dialogSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `;
      document.head.appendChild(style);
    }

    const canvas = document.querySelector('canvas');
    const canvasRect = canvas ? canvas.getBoundingClientRect() : { left: 0, bottom: window.innerHeight, top: 0, width: window.innerWidth, height: window.innerHeight, right: window.innerWidth };
    // Position like LennyRPG: inside canvas, with gap at bottom (8% from bottom of canvas)
    const dialogBottom = canvasRect.bottom - canvasRect.height * 0.12; // more gap from bottom
    const dlgBottomFromViewport = window.innerHeight - dialogBottom;
    const dlgWidth = Math.min(canvasRect.width - 80, 800); // smaller, more margin

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const randomMsg = this.encounterMessages[Math.floor(Math.random() * this.encounterMessages.length)];
    const randomMessage = `${guest.name.split(' ')[0]} ${randomMsg}`;

    const overlay = document.createElement('div');
    overlay.id = 'a16z-dialogue-overlay';
    overlay.style.cssText = `position:fixed;bottom:${dlgBottomFromViewport}px;left:${canvasRect.left + 40}px;width:${dlgWidth}px;z-index:500;box-sizing:border-box;`;

    // Inner card — LennyRPG pokemon-textbox style
    const card = document.createElement('div');
    card.style.cssText = `position:relative;background:#fff;border:5px solid #000;box-shadow:inset 0 0 0 3px #e8e8e8, 0 5px 0 #000, 0 8px 16px rgba(0,0,0,0.4);padding:14px 20px;font-family:"Press Start 2P",monospace;`;

    // Inner decorative border
    const innerBorder = document.createElement('div');
    innerBorder.style.cssText = `position:absolute;top:12px;left:12px;right:12px;bottom:12px;border:2px solid #d0d0d0;pointer-events:none;`;
    card.appendChild(innerBorder);

    // Header: portrait + name + title
    const header = document.createElement('div');
    header.style.cssText = `display:flex;align-items:center;gap:12px;margin-bottom:12px;padding-bottom:8px;border-bottom:3px solid #000;`;
    const portraitImg = document.createElement('img');
    portraitImg.src = portraitSrc;
    portraitImg.style.cssText = `width:40px;height:40px;object-fit:contain;image-rendering:pixelated;border:2px solid #000;border-radius:4px;background:#f0f0f0;`;
    const headerText = document.createElement('div');
    const nameDiv = document.createElement('div');
    nameDiv.style.cssText = `font-size:16px;color:#000;text-transform:uppercase;letter-spacing:1px;`;
    nameDiv.textContent = guest.name;
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `font-size:10px;color:#666;margin-top:4px;`;
    titleDiv.textContent = guest.title;
    headerText.appendChild(nameDiv);
    headerText.appendChild(titleDiv);
    header.appendChild(portraitImg);
    header.appendChild(headerText);
    card.appendChild(header);

    // Message
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `font-size:14px;line-height:1.8;color:#000;min-height:60px;margin-bottom:12px;`;
    msgDiv.textContent = randomMessage;
    card.appendChild(msgDiv);

    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = `display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:3px solid #000;`;
    const footerLeft = document.createElement('div');
    footerLeft.style.cssText = `font-size:10px;color:#666;display:flex;align-items:center;gap:8px;`;
    const spacePill = document.createElement('span');
    spacePill.style.cssText = `display:inline-block;padding:4px 8px;background:#000;color:#fff;border-radius:3px;font-size:9px;`;
    spacePill.textContent = isTouchDevice ? '⚔ BATTLE' : 'SPACE';
    if (isTouchDevice) {
      spacePill.style.cursor = 'pointer';
      spacePill.style.touchAction = 'manipulation';
      spacePill.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.mobileInteract = true;
      }, { passive: false });
      spacePill.addEventListener('touchend', () => { this.mobileInteract = false; });
    }
    const hintText = document.createTextNode(isTouchDevice ? ' tap to battle' : ' to battle \u2022 Walk away to cancel');
    footerLeft.appendChild(spacePill);
    footerLeft.appendChild(hintText);
    const arrowEl = document.createElement('div');
    arrowEl.id = 'a16z-dialogue-arrow';
    arrowEl.style.cssText = `font-size:16px;color:#000;animation:arrowBounce 1s ease-in-out infinite;font-family:monospace;`;
    arrowEl.textContent = '▼';
    footer.appendChild(footerLeft);
    footer.appendChild(arrowEl);
    card.appendChild(footer);

    overlay.appendChild(card);
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
      if (guest.id === 'player') continue;
      const dx = Math.abs(guest.px - px);
      const dy = Math.abs(guest.py - py);
      if (dx <= 32 && dy <= 32) {
        return guest;
      }
    }
    return null;
  }

  // ─── Pokédex ──────────────────────────────────────────────────────────────
  private createPokedex(): void {
    this.pokedexContainer = this.add.container(0, 0);
    this.pokedexContainer.setScrollFactor(0);
    this.pokedexContainer.setDepth(200);
    this.pokedexContainer.setVisible(false);
  }

  private togglePokedex(): void {
    if (this.pokedexVisible) {
      if (this.pokedexOverlay) { this.pokedexOverlay.remove(); this.pokedexOverlay = null; }
      this.pokedexVisible = false;
    } else {
      this.showPokedex();
    }
  }

  private showPokedex(): void {
    this.pokedexVisible = true;

    if (this.pokedexOverlay) {
      this.pokedexOverlay.remove();
      this.pokedexOverlay = null;
    }

    const captured: string[] = JSON.parse(localStorage.getItem('a16z_captured') || '[]');

    const canvas = document.querySelector('canvas');
    const rect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      background: rgba(0,0,0,0.92);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      font-family: "Press Start 2P", monospace;
      box-sizing: border-box;
      overflow-y: auto;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px 8px;
      border-bottom: 2px solid #4060C0;
      flex-shrink: 0;
    `;

    const titleEl = document.createElement('div');
    titleEl.style.cssText = `color: #60A0FF; font-size: 14px; letter-spacing: 2px;`;
    titleEl.textContent = 'a16z ARCADE DEX';

    const countEl = document.createElement('div');
    countEl.style.cssText = `color: #80FF80; font-size: 10px;`;
    countEl.textContent = `${captured.length}/${GUESTS.filter(g => g.id !== 'player').length} Captured`;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      font-family: "Press Start 2P", monospace;
      font-size: 16px;
      color: #fff;
      background: #cc2222;
      border: 2px solid #ff4444;
      border-radius: 6px;
      width: 36px;
      height: 36px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    `;
    closeBtn.addEventListener('click', () => this.hidePokedex());

    header.appendChild(titleEl);
    header.appendChild(countEl);
    header.appendChild(closeBtn);

    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      padding: 12px;
      overflow-y: auto;
      flex: 1;
    `;

    GUESTS.forEach((guest, i) => {
      if (guest.id === 'player') return;
      const isCaptured = captured.includes(guest.id);

      const card = document.createElement('div');
      card.style.cssText = `
        background: ${isCaptured ? '#1a2a4e' : '#1a1a2a'};
        border: 2px solid ${isCaptured ? '#4080FF' : '#303050'};
        border-radius: 8px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-height: 110px;
      `;

      const numEl = document.createElement('div');
      numEl.style.cssText = `font-size: 9px; color: ${isCaptured ? '#60A0FF' : '#505060'}; align-self: flex-start;`;
      numEl.textContent = `#${String(i + 1).padStart(2, '00')}`;

      const imgWrapper = document.createElement('div');
      imgWrapper.style.cssText = `width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;`;

      if (isCaptured) {
        let spriteDataUrl = '';
        const aiKey = `npc_ai_${i}`;
        const texKey = this.textures.exists(aiKey) ? aiKey : `npc_${i}`;
        try {
          const frame = this.textures.getFrame(texKey);
          const src = frame?.source?.image as HTMLImageElement | HTMLCanvasElement | null;
          if (src) {
            const tmpCanvas = document.createElement('canvas');
            tmpCanvas.width = frame.realWidth;
            tmpCanvas.height = frame.realHeight;
            const ctx = tmpCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(src as CanvasImageSource, frame.cutX, frame.cutY, frame.realWidth, frame.realHeight, 0, 0, frame.realWidth, frame.realHeight);
              spriteDataUrl = tmpCanvas.toDataURL('image/png');
            }
          }
        } catch (_) { /* use fallback */ }

        if (spriteDataUrl) {
          const img = document.createElement('img');
          img.src = spriteDataUrl;
          img.style.cssText = `width: 130px; height: 130px; object-fit: contain; image-rendering: pixelated;`;
          imgWrapper.appendChild(img);
        } else {
          imgWrapper.style.cssText += `background: #202040; border-radius: 50%;`;
          imgWrapper.textContent = '👤';
        }
      } else {
        imgWrapper.style.cssText += `background: #202020; border-radius: 50%;`;
        const q = document.createElement('div');
        q.style.cssText = `font-size: 24px; color: #404040;`;
        q.textContent = '?';
        imgWrapper.appendChild(q);
      }

      const nameEl = document.createElement('div');
      nameEl.style.cssText = `font-size: 9px; color: ${isCaptured ? '#ffffff' : '#404050'}; text-align: center; line-height: 1.4; word-break: break-word;`;
      nameEl.textContent = isCaptured ? guest.name : '???';

      card.appendChild(numEl);
      card.appendChild(imgWrapper);
      card.appendChild(nameEl);
      grid.appendChild(card);
    });

    const hint = document.createElement('div');
    hint.style.cssText = `
      text-align: center;
      font-size: 9px;
      color: #606090;
      padding: 8px;
      border-top: 1px solid #303050;
      flex-shrink: 0;
    `;
    hint.textContent = 'Press C or ESC to close';

    overlay.appendChild(header);
    overlay.appendChild(grid);
    overlay.appendChild(hint);
    document.body.appendChild(overlay);
    this.pokedexOverlay = overlay;
  }

  private hidePokedex(): void {
    this.pokedexVisible = false;
    this.pokedexContainer.setVisible(false);
    if (this.pokedexOverlay) {
      this.pokedexOverlay.remove();
      this.pokedexOverlay = null;
    }
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

    bg.fillStyle(0x7EC850);
    bg.fillRect(mmX, mmY, mmW, mmH);

    const captured: string[] = JSON.parse(localStorage.getItem('a16z_captured') || '[]');
    GUESTS.forEach((guest) => {
      const tileX = guest.px / TILE;
      const tileY = guest.py / TILE;
      bg.fillStyle(captured.includes(guest.id) ? 0xFFFF00 : 0xFF4040);
      bg.fillRect(mmX + tileX * scaleX - 1, mmY + tileY * scaleY - 1, 3, 3);
    });

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

  shutdown(): void {
    if (this.mobileDpad) {
      this.mobileDpad.remove();
      this.mobileDpad = null;
    }
    const interactBtn = document.getElementById('mobile-interact');
    if (interactBtn) interactBtn.remove();
  }

  // ─── Update loop ──────────────────────────────────────────────────────────
  update(time: number, delta: number): void {
    if (this.scene.isActive('BattleScene')) return;
    if (!this.gameReady) return;
    if (!this.player || !this.player.body) return; // Guard against destroyed physics body

    if (this.playerNameLabel && this.player) {
      this.playerNameLabel.setPosition(this.player.x, this.player.y - 60);
    }

    // Zero out velocity (tile-based movement uses tweens)
    if (this.player && this.player.body) this.player.setVelocity(0);

    if (Phaser.Input.Keyboard.JustDown(this.cKey)) {
      if (this.pokedexVisible) {
        this.hidePokedex();
      } else if (!this.dialogueVisible) {
        this.showPokedex();
      }
    }

    if (this.pokedexVisible) {
      if (this.escKey && Phaser.Input.Keyboard.JustDown(this.escKey)) {
        this.hidePokedex();
      }
      return;
    }

    // ── Tile-based movement (LennyRPG style) ──────────────────────────────
    if (!this.isMoving && time - this.lastMoveTime >= this.moveDelay) {
      let dx = 0;
      let dy = 0;
      let newDir = this.playerDir;

      // Mobile D-pad
      if (this.mobileDir === 'up') { dy = -1; newDir = 'up'; }
      else if (this.mobileDir === 'down') { dy = 1; newDir = 'down'; }
      else if (this.mobileDir === 'left') { dx = -1; newDir = 'left'; }
      else if (this.mobileDir === 'right') { dx = 1; newDir = 'right'; }

      // Keyboard
      if (this.cursors.left.isDown || this.wasd.left.isDown) { dx = -1; dy = 0; newDir = 'left'; }
      else if (this.cursors.right.isDown || this.wasd.right.isDown) { dx = 1; dy = 0; newDir = 'right'; }
      else if (this.cursors.up.isDown || this.wasd.up.isDown) { dy = -1; dx = 0; newDir = 'up'; }
      else if (this.cursors.down.isDown || this.wasd.down.isDown) { dy = 1; dx = 0; newDir = 'down'; }

      // Update sprite direction even if blocked
      if (dx !== 0 || dy !== 0) {
        this.playerDir = newDir;
        if (newDir === 'up') {
          this.player.setTexture(this.playerSpriteSet + '_back');
          this.player.setFlipX(false);
        } else if (newDir === 'down') {
          this.player.setTexture(this.playerSpriteSet + '_front');
          this.player.setFlipX(false);
        } else if (newDir === 'left') {
          this.player.setTexture(this.playerSpriteSet + '_right');
          this.player.setFlipX(true);
        } else if (newDir === 'right') {
          this.player.setTexture(this.playerSpriteSet + '_right');
          this.player.setFlipX(false);
        }

        const newTX = this.playerTileX + dx;
        const newTY = this.playerTileY + dy;

        // Check world bounds
        const mapW = this.worldLayer ? this.worldLayer.layer.width : 40;
        const mapH = this.worldLayer ? this.worldLayer.layer.height : 40;
        const inBounds = newTX >= 0 && newTY >= 0 && newTX < mapW && newTY < mapH;

        // Check tile collision
        const tile = this.worldLayer?.getTileAt(newTX, newTY);
        const tileBlocked = tile ? tile.collides : false;

        // Check NPC tile collision (player can stand adjacent but not ON the NPC tile)
        const npcBlocked = this.isOccupiedByNPC(newTX, newTY);

        if (inBounds && !tileBlocked && !npcBlocked) {
          this.playerTileX = newTX;
          this.playerTileY = newTY;
          this.isMoving = true;
          this.lastMoveTime = time;

          this.tweens.add({
            targets: this.player,
            x: newTX * 32 + 16,
            y: newTY * 32 + 16,
            duration: 100,
            ease: 'Linear',
            onComplete: () => { this.isMoving = false; },
          });
        } else {
          // Bump but don't move
          this.lastMoveTime = time;
        }
      }
    }

    if (this.dialogueVisible && this.activeNPC) {
      const npcSprite = this.npcSprites.get(this.activeNPC.id);
      const npcX = npcSprite ? npcSprite.x : this.activeNPC.px;
      const npcY = npcSprite ? npcSprite.y : this.activeNPC.py;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npcX, npcY);
      if (dist > 80) {
        this.dismissDialogue();
      }
      if (this.escKey && Phaser.Input.Keyboard.JustDown(this.escKey)) {
        this.dismissDialogue();
      }
      const interactPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey) || this.mobileInteract;
      if (interactPressed && !this.inBattleTransition) {
        if (this.nearbyGuest) {
          const guest = this.nearbyGuest;
          this.mobileInteract = false;
          this.hideDialogue();
          // Hide mobile controls during battle
          if (this.mobileDpad) this.mobileDpad.style.display = 'none';
          const interactBtn = document.getElementById('mobile-interact');
          if (interactBtn) (interactBtn as HTMLDivElement).style.display = 'none';
          // Use battle transition instead of direct launch
          this.startBattleTransition(guest);
        }
      }
    } else if (!this.dialogueVisible) {
      if (!this.dialogueGracePeriod) {
        const nearby = this.getGuestNearPlayer();
        if (nearby && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          this.showDialogue(nearby);
        }
        const nearbyNow = this.getGuestNearPlayer();
        if (nearbyNow) {
          this.showDialogue(nearbyNow);
        }
      }
    }

    this.miniMapTimer -= delta;
    if (this.miniMapTimer <= 0) {
      this.updateMiniMap();
      this.miniMapTimer = 500;
    }
  }
}
