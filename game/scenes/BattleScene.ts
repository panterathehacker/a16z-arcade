import * as Phaser from 'phaser';
import { Guest, Question, GUESTS } from '../data/guests';
import { saveCapture } from '../services/playerService';

interface BattleSceneData {
  guest: Guest;
  playerId: string | null;
}

interface PlayerStats {
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
}

function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem('a16z_player_stats');
    if (raw) {
      const stats = JSON.parse(raw);
      // Always recalculate xpToNext from current level (fixes stale cached values)
      stats.xpToNext = xpToNextLevel(stats.level || 1);
      return stats;
    }
  } catch (_) { /* */ }
  return { level: 1, xp: 0, xpToNext: 150, hp: 100, maxHp: 100 };
}

function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem('a16z_player_stats', JSON.stringify(stats));
    window.dispatchEvent(new CustomEvent('player-stats-updated', { detail: stats }));
  } catch (_) { /* */ }
}

function xpPerCorrect(level: number): number {
  return Math.min(10 + 5 * (level - 1), 50);
}

function xpToNextLevel(level: number): number {
  if (level === 1) return 150;
  if (level === 2) return 250;
  return Infinity; // Level 3 is max
}

export class BattleScene extends Phaser.Scene {
  private guest!: Guest;
  private questions!: Question[];
  private currentQ = 0;
  private playerHP = 100;
  private guestHP = 100;
  private correctAnswers = 0;
  private wrongAnswers = 0;
  private playerId: string | null = null;
  private playerStats!: PlayerStats;

  private playerHPBar!: Phaser.GameObjects.Graphics;
  private guestHPBar!: Phaser.GameObjects.Graphics;
  private playerHPText!: Phaser.GameObjects.Text;
  private guestHPText!: Phaser.GameObjects.Text;

  // DOM HP box elements (LennyRPG-style overlays)
  private domGuestHP: HTMLDivElement | null = null;
  private domPlayerHP: HTMLDivElement | null = null;
  private domGuestHPBar: HTMLDivElement | null = null;
  private domPlayerHPBar: HTMLDivElement | null = null;
  private domPlayerHPText: HTMLElement | null = null;

  private statusText!: Phaser.GameObjects.Text;
  private waitingForNext = false;
  private battleOver = false;
  private selectedOption = 0;

  // DOM battle menu elements
  private battleMenuEl: HTMLDivElement | null = null;
  private domAnswerBtns: HTMLDivElement[] = [];
  private domQText: HTMLElement | null = null;
  private domQNum: HTMLElement | null = null;

  // Sprite foot positions (set by drawBattleBG)
  private _gpX = 0; private _gpY = 0;
  private _ppX = 0; private _ppY = 0;
  private guestSprite!: Phaser.GameObjects.Image;
  private playerSprite!: Phaser.GameObjects.Image;

  // HP bar positions (set by createBattleUI, used by updateHPBars)
  private _gHPBarX = 0; private _gHPBarY = 0; private _gHPBarW = 0;
  private _pHPBarX = 0; private _pHPBarY = 0; private _pHPBarW = 0;
  private _pHPNumX = 0; private _pHPNumY = 0;

  private keys!: {
    one: Phaser.Input.Keyboard.Key;
    two: Phaser.Input.Keyboard.Key;
    three: Phaser.Input.Keyboard.Key;
    four: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };

  // Battle result tracking (LennyRPG-style)
  private xpGainedThisBattle = 0;
  private isPerfectCapture = false;
  private battleResultOverlay: HTMLDivElement | null = null;
  private battleResultKeyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: BattleSceneData) {
    this.guest = data.guest;
    this.playerId = data.playerId ?? null;
    this.questions = [...this.guest.questions];
    this.currentQ = 0;
    this.playerStats = loadPlayerStats();
    this.playerHP = this.playerStats.hp;
    this.guestHP = 100;
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.waitingForNext = false;
    this.battleOver = false;
    this.xpGainedThisBattle = 0;
    this.isPerfectCapture = false;
    this.battleResultOverlay = null;
    this.battleResultKeyHandler = null;
  }

  create() {
    this.time.removeAllEvents();
    this.children.removeAll(true);
    
    // Start battle music (LennyRPG volume: 0.5)
    if (this.sound) {
      // Always restart battle music (stop first in case it's still cached)
      const bt = this.sound.get('battle-music');
      if (bt) bt.stop();
      this.sound.play('battle-music', { loop: true, volume: 0.5 });
    }

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    this.drawBattleBG(W, H);

    // Guest sprite — right mound, anchored at feet
    const idx = GUESTS.findIndex(g => g.id === this.guest.id);
    const texKey = idx >= 0 ? 'npc_ai_' + idx : null;
    console.log('[Battle] guest id:', this.guest.id, 'idx:', idx, 'key:', texKey);

    if (texKey && this.textures.exists(texKey)) {
      // floatIn: drops from above + scales up (exact LennyRPG BattleScreen.vue floatIn keyframe)
      // from: translateY(-100px) scale(0.5) opacity 0 → to: translateY(0) scale(1) opacity 1
      // duration: 0.6s, ease: cubic-bezier(0.34, 1.56, 0.64, 1), delay: 0.3s
      this.guestSprite = this.add.image(this._gpX, this._gpY - 100, texKey)
        .setDisplaySize(200, 270)
        .setOrigin(0.5, 1.0)
        .setDepth(5)
        .setAlpha(0)
        .setScale(0.5);
      this.tweens.add({
        targets: this.guestSprite,
        y: this._gpY,
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
        duration: 600,
        delay: 300,
        ease: 'Back.easeOut',
      });
    }

    // Player sprite — left mound, back-facing
    const pGender = typeof localStorage !== 'undefined' ? localStorage.getItem('a16z_gender') || 'male' : 'male';
    const pSet = pGender === 'female' ? 'player-female' : 'player-male';
    const playerSpriteKey = this.textures.exists(pSet + '_back') ? (pSet + '_back')
                          : (this.textures.exists('player_ai') ? 'player_ai' : null);
    if (playerSpriteKey) {
      // slideIn: slides from right + scales up (exact LennyRPG BattleScreen.vue slideIn keyframe)
      // from: translateX(150px) scale(0.5) opacity 0 → to: translateX(0) scale(1) opacity 1
      // duration: 0.6s, ease: cubic-bezier(0.34, 1.56, 0.64, 1), delay: 0.5s
      this.playerSprite = this.add.image(this._ppX + 150, this._ppY, playerSpriteKey)
        .setDisplaySize(160, 220)
        .setOrigin(0.5, 1.0)
        .setDepth(5)
        .setAlpha(0)
        .setScale(0.5);
      this.tweens.add({
        targets: this.playerSprite,
        x: this._ppX,
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
        duration: 600,
        delay: 500,
        ease: 'Back.easeOut',
      });
    }

    this.createBattleUI(W, H);
    this.setupKeys();
    this.showQuestion();

    // Fade in from black
    const fadeIn = this.add.graphics().setDepth(2000).setScrollFactor(0);
    fadeIn.fillStyle(0x000000, 1);
    fadeIn.fillRect(0, 0, W, H);
    this.tweens.add({
      targets: fadeIn,
      alpha: { from: 1, to: 0 },
      duration: 300,
      onComplete: () => fadeIn.destroy(),
    });
  }

  // ─────────────────────────────────────────────
  // drawBattleBG
  // ─────────────────────────────────────────────
  private drawBattleBG(W: number, H: number) {
    this.cameras.main.setBackgroundColor('transparent');

    const isMobileBattleCheck = H > W;
    const bgH = isMobileBattleCheck ? H * 0.48 : H * 0.65;
    this.add.image(W * 0.5, bgH / 2, 'battle-bg')
      .setDisplaySize(W, bgH)
      .setDepth(0);

    this._gpX = W * 0.67;
    this._gpY = H * 0.35;
    this._ppX = W * 0.36;
    this._ppY = H * 0.52;
  }

  // ─────────────────────────────────────────────
  // createBattleUI — HP panels (Phaser) + question/answers (DOM overlay)
  // ─────────────────────────────────────────────
  private createBattleUI(W: number, H: number) {
    const isMobileBattle = H > W;
    const battleAreaH = isMobileBattle ? H * 0.48 : H * 0.65;

    // ────────────────────────────────────────────
    // HP boxes: DOM overlays (LennyRPG-style)
    // ────────────────────────────────────────────

    // Inject battle HP animations once
    if (!document.getElementById('a16z-battle-hp-styles')) {
      const style = document.createElement('style');
      style.id = 'a16z-battle-hp-styles';
      style.textContent = `
        @keyframes slideInFromTop {
          from { transform: translateY(-60px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInFromBottom {
          from { transform: translateY(60px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    const canvas = document.querySelector('canvas');
    const canvasRect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight, width: window.innerWidth, height: window.innerHeight };

    // Guest HP box (top-left)
    const guestBox = document.createElement('div');
    guestBox.id = 'a16z-guest-hp';
    guestBox.style.cssText = `
      position: fixed;
      left: ${canvasRect.left + canvasRect.width * 0.25}px;
      top: ${canvasRect.top + 20}px;
      width: 260px;
      background: white;
      border: 3px solid #1a1a1a;
      border-radius: 12px;
      padding: 14px 16px;
      font-family: "Press Start 2P", monospace;
      z-index: 600;
      box-shadow: 3px 3px 0 #000;
      animation: slideInFromTop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
      box-sizing: border-box;
    `;
    const guestNameUpper = this.guest.name.toUpperCase();
    const guestNameFontSize = guestNameUpper.length > 14 ? '10px' : '14px';
    const titleText = this.guest.title.length > 24 ? this.guest.title.slice(0, 24) + '...' : this.guest.title;
    guestBox.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <div style="font-size:${guestNameFontSize};font-weight:bold;color:#000;text-transform:uppercase;">${guestNameUpper}</div>
        <div style="background:#888;color:#fff;border-radius:6px;padding:2px 6px;font-size:9px;">Lv1</div>
      </div>
      <div style="font-size:9px;color:#666;margin-bottom:8px;">${titleText}</div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:11px;color:#ee3333;flex-shrink:0;">HP</span>
        <div style="flex:1;background:#ddd;border-radius:3px;height:8px;overflow:hidden;">
          <div id="a16z-guest-hp-bar" style="height:100%;background:#22cc44;border-radius:3px;width:100%;transition:width 0.3s;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(guestBox);
    this.domGuestHP = guestBox;
    this.domGuestHPBar = document.getElementById('a16z-guest-hp-bar') as HTMLDivElement;

    // Player HP box (bottom-right)
    const trainerName = (typeof localStorage !== 'undefined'
      ? localStorage.getItem('a16z_username') : null) || 'PLAYER';
    const playerBox = document.createElement('div');
    playerBox.id = 'a16z-player-hp';
    playerBox.style.cssText = `
      position: fixed;
      left: ${canvasRect.left + canvasRect.width * 0.55}px;
      bottom: ${window.innerHeight - canvasRect.bottom + canvasRect.height * 0.50}px;
      width: 240px;
      background: white;
      border: 3px solid #1a1a1a;
      border-radius: 12px;
      padding: 14px 16px;
      font-family: "Press Start 2P", monospace;
      z-index: 600;
      box-shadow: 3px 3px 0 #000;
      animation: slideInFromBottom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
      box-sizing: border-box;
    `;
    playerBox.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="font-size:13px;font-weight:bold;color:#000;text-transform:uppercase;">${trainerName.slice(0, 10)}</div>
        <div style="background:#888;color:#fff;border-radius:6px;padding:2px 6px;font-size:9px;">Lv${this.playerStats.level}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <span style="font-size:11px;color:#ee3333;flex-shrink:0;">HP</span>
        <div style="flex:1;background:#ddd;border-radius:3px;height:8px;overflow:hidden;">
          <div id="a16z-player-hp-bar" style="height:100%;background:#22cc44;border-radius:3px;width:100%;transition:width 0.3s;"></div>
        </div>
      </div>
      <div id="a16z-player-hp-text" style="font-size:10px;color:#000;text-align:right;">${this.playerHP} / ${this.playerStats.maxHp}</div>
    `;
    document.body.appendChild(playerBox);
    this.domPlayerHP = playerBox;
    this.domPlayerHPBar = document.getElementById('a16z-player-hp-bar') as HTMLDivElement;
    this.domPlayerHPText = document.getElementById('a16z-player-hp-text');
    
    // Now that DOM is ready, update HP bars with actual current HP values
    this.updateHPBars();

    // Stub out legacy Phaser HP objects to avoid null errors
    this.guestHPBar = this.add.graphics().setDepth(12).setVisible(false);
    this.guestHPText = this.add.text(0, 0, '', { fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#000' }).setDepth(11).setVisible(false);
    this.playerHPBar = this.add.graphics().setDepth(12).setVisible(false);
    this.playerHPText = this.add.text(0, 0, '', { fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#000' }).setDepth(12).setVisible(false);

    this.updateHPBars();

    // ────────────────────────────────────────────
    // Status text (Phaser) — shown in battle area during answer feedback
    // ────────────────────────────────────────────
    const menuY = battleAreaH;
    const menuH = H - menuY;

    this.statusText = this.add.text(W * 0.225, menuY + menuH * 0.4, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '13px',
      color: '#FF4040',
      resolution: 2,
      align: 'center',
      wordWrap: { width: W * 0.45 - 40 },
    }).setOrigin(0.5, 0.5).setDepth(12).setVisible(false);

    // ────────────────────────────────────────────
    // DOM Battle Menu (replaces Phaser question/answer UI)
    // ────────────────────────────────────────────
    const menuCanvas = document.querySelector('canvas');
    if (menuCanvas) {
      const canvasRect = menuCanvas.getBoundingClientRect();
      const menuFrac = battleAreaH / H;
      const menuTop = canvasRect.top + canvasRect.height * menuFrac;

      const menuEl = document.createElement('div');
      menuEl.id = 'a16z-battle-menu';
      menuEl.style.cssText = `
        position: fixed;
        left: ${canvasRect.left}px;
        top: ${menuTop}px;
        width: ${canvasRect.width}px;
        height: ${canvasRect.height - canvasRect.height * menuFrac}px;
        background: #ffffff;
        border: 4px solid #000;
        font-family: "Press Start 2P", monospace;
        z-index: 500;
        box-sizing: border-box;
        display: flex;
        overflow: hidden;
      `;

      // Left panel (40%)
      const leftPanel = document.createElement('div');
      leftPanel.style.cssText = `
        flex: 0 0 40%;
        display: flex;
        flex-direction: column;
        padding: 12px 14px;
        border-right: 3px solid #e0e0e0;
        box-sizing: border-box;
      `;

      const qHeader = document.createElement('div');
      qHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;border-bottom:2px solid #f0f0f0;margin-bottom:10px;';
      const qNum = document.createElement('span');
      qNum.id = 'battle-q-num';
      qNum.style.cssText = 'font-size:11px;color:#000;font-weight:bold;';
      qNum.textContent = `Q1/${this.questions.length}`;
      qHeader.appendChild(qNum);
      leftPanel.appendChild(qHeader);

      const qText = document.createElement('div');
      qText.id = 'battle-q-text';
      qText.style.cssText = 'flex:1;font-size:12px;line-height:1.7;color:#000;word-wrap:break-word;overflow-wrap:break-word;white-space:normal;overflow:hidden;max-height:120px;';
      qText.textContent = '';
      leftPanel.appendChild(qText);

      const controls = document.createElement('div');
      controls.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:auto;padding-top:8px;';
      const arrowKey = document.createElement('span');
      arrowKey.style.cssText = 'font-size:20px;font-weight:bold;';
      arrowKey.textContent = '↕';
      const enterKey = document.createElement('span');
      enterKey.style.cssText = 'font-size:11px;';
      enterKey.textContent = 'ENTER';
      controls.appendChild(arrowKey);
      controls.appendChild(enterKey);
      leftPanel.appendChild(controls);

      // Right panel (60%)
      const rightPanel = document.createElement('div');
      rightPanel.id = 'battle-answers-panel';
      rightPanel.style.cssText = `
        flex: 0 0 60%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 6px;
        padding: 12px;
        box-sizing: border-box;
      `;

      // Create 4 answer buttons
      const answerBtns: HTMLDivElement[] = [];
      for (let i = 0; i < 4; i++) {
        const btn = document.createElement('div');
        btn.id = `battle-answer-${i}`;
        btn.style.cssText = `
          display:flex;align-items:flex-start;gap:10px;
          padding:10px 12px;
          background:#f8f8f8;border:2px solid #d0d0d0;border-radius:3px;
          cursor:pointer;min-height:42px;box-sizing:border-box;
        `;
        const num = document.createElement('span');
        num.style.cssText = 'font-size:11px;font-weight:bold;color:#000;flex-shrink:0;min-width:14px;';
        num.textContent = `${i + 1}`;
        const text = document.createElement('span');
        text.id = `battle-answer-text-${i}`;
        text.style.cssText = 'font-size:9px;line-height:1.4;color:#000;flex:1;word-wrap:break-word;overflow-wrap:break-word;white-space:normal;overflow:hidden;';
        btn.appendChild(num);
        btn.appendChild(text);

        btn.addEventListener('click', () => {
          if (!this.waitingForNext && !this.battleOver) {
            this.selectedOption = i;
            this.answerQuestion(i);
          }
        });
        btn.addEventListener('mouseenter', () => {
          if (!this.waitingForNext && !this.battleOver) {
            this.selectedOption = i;
            this.highlightDOMAnswer(i);
          }
        });

        rightPanel.appendChild(btn);
        answerBtns.push(btn);
      }

      menuEl.appendChild(leftPanel);
      menuEl.appendChild(rightPanel);

      // Slide up animation (LennyRPG style)
      menuEl.style.transform = 'translateY(100%)';
      menuEl.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';

      document.body.appendChild(menuEl);
      this.battleMenuEl = menuEl;
      this.domAnswerBtns = answerBtns;
      this.domQText = qText;
      this.domQNum = qNum;

      // Trigger slide-up animation after DOM insertion
      setTimeout(() => { menuEl.style.transform = 'translateY(0)'; }, 50);
    }

    // ────────────────────────────────────────────
    // X button — top right corner to quit battle (Phaser)
    // ────────────────────────────────────────────
    const exitBtnW = 44;
    const exitBtnH = 44;
    const exitBtnX = W - exitBtnW - 10;
    const exitBtnY = 10;

    const exitBg = this.add.graphics().setDepth(200).setScrollFactor(0);
    exitBg.fillStyle(0xCC2222, 1.0);
    exitBg.fillRoundedRect(exitBtnX, exitBtnY, exitBtnW, exitBtnH, 8);
    exitBg.lineStyle(2, 0xFFFFFF, 0.8);
    exitBg.strokeRoundedRect(exitBtnX, exitBtnY, exitBtnW, exitBtnH, 8);

    this.add.text(exitBtnX + exitBtnW / 2, exitBtnY + exitBtnH / 2, '✕', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#FFFFFF',
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

    const exitZone = this.add.zone(exitBtnX, exitBtnY, exitBtnW, exitBtnH)
      .setOrigin(0, 0)
      .setDepth(202)
      .setScrollFactor(0)
      .setInteractive();

    exitZone.on('pointerdown', () => {
      this.returnToWorld();
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.returnToWorld();
    });
  }

  private updateHPBars() {
    this.updateDOMHPBars();
  }

  private updateDOMHPBars() {
    const guestPct = Math.max(0, this.guestHP) / 100;
    const guestColor = guestPct > 0.5 ? '#22cc44' : guestPct > 0.25 ? '#D8C040' : '#D84040';
    if (this.domGuestHPBar) {
      this.domGuestHPBar.style.width = `${Math.round(guestPct * 100)}%`;
      this.domGuestHPBar.style.background = guestColor;
    }

    const playerPct = Math.max(0, this.playerHP) / this.playerStats.maxHp;
    const playerColor = playerPct > 0.5 ? '#22cc44' : playerPct > 0.25 ? '#D8C040' : '#D84040';
    if (this.domPlayerHPBar) {
      this.domPlayerHPBar.style.width = `${Math.round(playerPct * 100)}%`;
      this.domPlayerHPBar.style.background = playerColor;
    }
    if (this.domPlayerHPText) {
      this.domPlayerHPText.textContent = `${Math.max(0, this.playerHP)} / ${this.playerStats.maxHp}`;
    }
  }

  private setupKeys() {
    if (!this.input.keyboard) return;
    this.keys = {
      one: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      two: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      three: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      four: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };
    this.input.keyboard.on('keydown-UP', () => this.navigateOption(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.navigateOption(1));
    this.input.keyboard.on('keydown-W', () => this.navigateOption(-1));
    this.input.keyboard.on('keydown-S', () => this.navigateOption(1));
    this.input.keyboard.on('keydown-ENTER', () => { if (!this.waitingForNext && !this.battleOver) this.answerQuestion(this.selectedOption); });
  }

  private showQuestion() {
    if (this.currentQ >= this.questions.length) {
      this.endBattle();
      return;
    }

    const q = this.questions[this.currentQ];
    this.selectedOption = 0;
    this.waitingForNext = false;

    // Update DOM elements
    if (this.domQText) this.domQText.textContent = q.text;
    if (this.domQNum) this.domQNum.textContent = `Q${this.currentQ + 1}/${this.questions.length}`;
    q.options.forEach((opt, i) => {
      // Set via DOM ID
      const el = document.getElementById('battle-answer-text-' + i);
      if (el) el.textContent = opt;
      // Also set via direct reference (belt+suspenders for retry)
      if (this.domAnswerBtns[i]) {
        const textSpan = this.domAnswerBtns[i].querySelector('span:last-child');
        if (textSpan) textSpan.textContent = opt;
      }
    });

    // Reset answer button styles and show menu
    if (this.battleMenuEl) this.battleMenuEl.style.display = 'flex';
    this.highlightDOMAnswer(0);

    // Hide status text
    if (this.statusText) this.statusText.setVisible(false);
  }

  private highlightDOMAnswer(idx: number) {
    this.domAnswerBtns.forEach((btn, i) => {
      if (i === idx) {
        btn.style.background = '#fffbea';
        btn.style.borderColor = '#000';
        btn.style.boxShadow = 'inset 0 0 0 2px #ffd700';
      } else {
        btn.style.background = '#f8f8f8';
        btn.style.borderColor = '#d0d0d0';
        btn.style.boxShadow = 'none';
      }
    });
  }

  private highlightDOMAnswerResult(selectedIdx: number, correctIdx: number) {
    this.domAnswerBtns.forEach((btn, i) => {
      if (i === correctIdx) {
        btn.style.background = '#e6ffe6';
        btn.style.borderColor = '#22cc44';
        btn.style.boxShadow = 'inset 0 0 0 2px #22cc44';
      } else if (i === selectedIdx && selectedIdx !== correctIdx) {
        btn.style.background = '#ffe6e6';
        btn.style.borderColor = '#dd4040';
        btn.style.boxShadow = 'inset 0 0 0 2px #dd4040';
      } else {
        btn.style.background = '#f8f8f8';
        btn.style.borderColor = '#d0d0d0';
        btn.style.boxShadow = 'none';
      }
    });
  }

  private showDamageFloat(x: number, y: number, text: string, color: number) {
    const t = this.add.text(x, y, text, {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#' + color.toString(16).padStart(6, '0'),
      stroke: '#000000',
      strokeThickness: 3,
      resolution: 2,
    }).setDepth(50).setScrollFactor(0);

    this.tweens.add({
      targets: t,
      y: y - 40,
      alpha: { from: 1, to: 0 },
      duration: 1200,
      ease: 'Power2',
      onComplete: () => t.destroy(),
    });
  }

  private answerQuestion(index: number) {
    if (this.waitingForNext || this.battleOver) return;

    const q = this.questions[this.currentQ];
    const correct = index === q.correct;

    // Highlight DOM buttons with result
    this.highlightDOMAnswerResult(index, q.correct);

    if (correct) {
      this.correctAnswers++;
      this.guestHP -= 34; // 3 correct = ~100% drain
      this.updateHPBars();
      this.statusText.setText('✓ Correct!\nGuest HP -20');
      this.statusText.setStyle({ ...this.statusText.style, color: '#00aa00' });
      this.statusText.setVisible(true);

      const xpGain = 10; // Fixed 10 XP per correct answer
      this.xpGainedThisBattle += xpGain;
      this.playerStats.xp += xpGain;
      while (this.playerStats.xp >= this.playerStats.xpToNext) {
        this.playerStats.xp -= this.playerStats.xpToNext;
        this.playerStats.level++;
        this.playerStats.xpToNext = xpToNextLevel(this.playerStats.level);
      }
      savePlayerStats(this.playerStats);

      this.showDamageFloat(this._gHPBarX + this._gHPBarW / 2, this._gHPBarY - 10, '-20 HP', 0xFF4444);
      this.showDamageFloat(this._pHPBarX + this._pHPBarW / 2, this._pHPBarY - 10, `+${xpGain} XP`, 0xFFD700);
    } else {
      this.wrongAnswers++;
      this.playerHP -= 10;
      this.playerStats.hp = Math.max(0, this.playerHP);
      savePlayerStats(this.playerStats);
      this.updateHPBars();
      this.statusText.setText('✗ Wrong!\nPlayer HP -20');
      this.statusText.setStyle({ ...this.statusText.style, color: '#FF4040' });
      this.statusText.setVisible(true);

      this.showDamageFloat(this._pHPBarX + this._pHPBarW / 2, this._pHPBarY - 10, '-20 HP', 0xFF4444);
    }

    this.waitingForNext = true;

    this.time.delayedCall(1800, () => {
      this.currentQ++;

      if (this.correctAnswers >= 3) {
        this.endBattle();
        return;
      }

      if (this.playerHP <= 0 || this.playerStats.hp <= 0) {
        this.playerStats.hp = 0;
        savePlayerStats(this.playerStats);
        this.showGameOver();
        return;
      }

      if (this.currentQ >= this.questions.length) {
        this.endBattle();
        return;
      }

      this.showQuestion();
    });
  }

  private endBattle() {
    this.battleOver = true;

    // Hide DOM battle menu
    if (this.battleMenuEl) this.battleMenuEl.style.display = 'none';
    if (this.statusText) this.statusText.setVisible(false);

    // Victory = captured 3+ correct answers. Defeat = did not.
    if (this.correctAnswers >= 3) {
      this.captureGuest();
      this.showVictory();
    } else {
      this.showDefeat();
    }
  }

  private captureGuest() {
    // Play victory music (LennyRPG volume: 0.6), stop battle
    if (this.sound) {
      const bTrack = this.sound.get('battle-music');
      if (bTrack) bTrack.stop();
      if (!this.sound.get('victory-music')) {
        this.sound.play('victory-music', { loop: false, volume: 0.6 });
      }
    }
    const captured: string[] = JSON.parse(localStorage.getItem('a16z_captured') || '[]');
    if (!captured.includes(this.guest.id)) {
      captured.push(this.guest.id);
      localStorage.setItem('a16z_captured', JSON.stringify(captured));
    }
    // Perfect capture: won with no wrong answers
    this.isPerfectCapture = this.wrongAnswers === 0;
    
    // Fix 5: DON'T reset HP to max - keep current battle HP
    this.playerStats.hp = Math.max(0, this.playerHP);
    
    // Fix 1: +20 HP only on perfect capture, capped at maxHp (Fix 3)
    if (this.isPerfectCapture) {
      this.playerStats.hp = Math.min(this.playerStats.hp + 20, this.playerStats.maxHp);
      // Fix 2: Perfect XP bonus = 30 extra (total 60: 30 earned + 30 bonus = double)
      this.xpGainedThisBattle += 30;
      this.playerStats.xp += 30;
    }
    
    savePlayerStats(this.playerStats);
    saveCapture(this.playerId, this.guest.id).catch((err) => {
      console.warn('Failed to save capture to Supabase:', err);
    });
  }

  private injectBattleResultStyles() {
    if (document.getElementById('a16z-battle-result-styles')) return;
    const style = document.createElement('style');
    style.id = 'a16z-battle-result-styles';
    style.textContent = `
      @keyframes brFadeIn { from{opacity:0} to{opacity:1} }
      @keyframes brSlideIn { from{transform:translateY(-50px) scale(0.8);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
      @keyframes brPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      .battle-result-overlay {
        position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.9);display:flex;align-items:center;
        justify-content:center;z-index:2000;animation:brFadeIn 0.3s ease;
      }
      .result-container {
        background:linear-gradient(135deg, #2C3E50 0%, #34495E 100%);
        border:8px solid #4CAF50;border-radius:20px;padding:40px;
        max-width:600px;width:90%;
        animation:brSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-height:90vh;overflow-y:auto;box-sizing:border-box;
      }
      .result-container.defeat {
        border-color:#FF6B6B;
        background:linear-gradient(160deg, #3b1f2a 0%, #2a0f16 45%, #1f0b12 100%);
      }
      .result-header { text-align:center;margin-bottom:30px; }
      .result-title {
        font-family:"Press Start 2P",monospace;font-size:42px;color:#4CAF50;
        text-shadow:3px 3px 0 #000;animation:brPulse 2s ease-in-out infinite;
        margin:0 0 10px 0;
      }
      .result-container.defeat .result-title { color:#FF6B6B; }
      .result-subtitle {
        font-family:"Press Start 2P",monospace;font-size:14px;color:#ECF0F1;
        text-shadow:2px 2px 0 #000;
      }
      .stats-container {
        background:rgba(0,0,0,0.4);border-radius:12px;padding:20px;margin-bottom:30px;
        position:relative;
      }
      .stat-row {
        display:flex;justify-content:space-between;align-items:center;
        padding:10px 0;border-bottom:2px solid rgba(255,255,255,0.1);
        font-family:"Press Start 2P",monospace;font-size:12px;
      }
      .stat-row:last-child { border-bottom:none; }
      .stat-row.highlight {
        background:rgba(76,175,80,0.2);padding:15px;margin:10px -10px -10px -10px;
        border-radius:0 0 8px 8px;border-bottom:none;
      }
      .stat-label { font-size:12px;color:#BDC3C7; }
      .stat-value { font-size:14px;color:#ECF0F1;font-weight:bold; }
      .stat-value.correct { color:#4CAF50; }
      .stat-value.wrong { color:#FF6B6B; }
      .stat-value.xp { color:#FFD700;font-size:18px; }
      .perfect-badge {
        background:#FFD700;color:#000;padding:12px 20px;border-radius:8px;
        text-align:center;font-size:14px;font-family:"Press Start 2P",monospace;
        margin-top:12px;
      }
      .episode-link-row {
        display:flex;justify-content:center;margin:12px 0 18px;
      }
      .episode-link {
        color:#60A0FF;text-decoration:none;font-size:11px;
        display:flex;align-items:center;gap:8px;
        font-family:"Press Start 2P",monospace;
      }
      .episode-link:hover { color:#90C0FF; }
      .result-btn-row {
        display:flex;gap:15px;margin-top:20px;
      }
      .result-btn-row.single { justify-content:center; }
      .continue-btn {
        background:#4CAF50;color:#000;border:none;padding:14px 32px;
        font-family:"Press Start 2P",monospace;font-size:14px;cursor:pointer;
        border-radius:8px;flex:1;
      }
      .retry-btn {
        background:#FF6B6B;color:#000;border:none;padding:14px 32px;
        font-family:"Press Start 2P",monospace;font-size:14px;cursor:pointer;
        border-radius:8px;flex:1;
      }
      .continue-btn:hover { background:#45A049; }
      .retry-btn:hover { background:#E74C3C; }
      .keyboard-hint {
        margin-top:15px;font-family:"Press Start 2P",monospace;font-size:8px;
        color:rgba(255,255,255,0.5);text-align:center;
      }
      @media (max-width:600px) {
        .result-container { padding:24px 16px; }
        .result-title { font-size:28px; }
        .result-subtitle { font-size:10px; }
        .stat-row { font-size:10px; }
        .continue-btn, .retry-btn { font-size:10px;padding:10px 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  private showVictory() {
    this.injectBattleResultStyles();

    // Animate guest HP to 0
    if (this.domGuestHPBar) {
      this.domGuestHPBar.style.transition = 'width 0.8s ease';
      this.domGuestHPBar.style.width = '0%';
    }

    const totalQ = this.correctAnswers + this.wrongAnswers;
    const accuracy = totalQ > 0 ? Math.round((this.correctAnswers / totalQ) * 100) : 0;
    const episodeUrl = this.guest.youtubeUrl;

    const overlay = document.createElement('div');
    overlay.id = 'a16z-battle-result-overlay';
    overlay.className = 'battle-result-overlay';

    overlay.innerHTML = `
      <div class="result-container victory">
        <div class="result-header">
          <h1 class="result-title">VICTORY!</h1>
          <div class="result-subtitle">You captured ${this.guest.name}!</div>
        </div>
        <div class="stats-container">
          <div class="stat-row"><span class="stat-label">Questions Answered:</span><span class="stat-value">${totalQ}</span></div>
          <div class="stat-row"><span class="stat-label">Correct Answers:</span><span class="stat-value correct">${this.correctAnswers}</span></div>
          <div class="stat-row"><span class="stat-label">Wrong Answers:</span><span class="stat-value wrong">${this.wrongAnswers}</span></div>
          <div class="stat-row"><span class="stat-label">Accuracy:</span><span class="stat-value">${accuracy}%</span></div>
          <div class="stat-row"><span class="stat-label">Level XP:</span><span class="stat-value">${this.playerStats.xp}/${this.playerStats.xpToNext}</span></div>
          <div class="stat-row highlight"><span class="stat-label">XP Increased:</span><span class="stat-value xp">+${this.xpGainedThisBattle}</span></div>
          ${this.isPerfectCapture ? '<div class="perfect-badge">⭐ PERFECT CAPTURE! HP +20 ⭐</div>' : ''}
        </div>
        ${episodeUrl ? `<div class="episode-link-row"><a class="episode-link" href="${episodeUrl}" target="_blank" rel="noopener noreferrer">🎧 Listen to the episode</a></div>` : ''}
        <div class="result-btn-row single">
          <button class="continue-btn" id="a16z-result-continue">▶ Continue</button>
        </div>
        <div class="keyboard-hint">ENTER to continue</div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.battleResultOverlay = overlay;

    document.getElementById('a16z-result-continue')?.addEventListener('click', () => this.returnToWorld());

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.returnToWorld();
      }
    };
    this.battleResultKeyHandler = keyHandler;
    window.addEventListener('keydown', keyHandler);
  }

  private showDefeat() {
    this.injectBattleResultStyles();

    // Animate player HP to 0
    if (this.domPlayerHPBar) {
      this.domPlayerHPBar.style.transition = 'width 0.8s ease';
      this.domPlayerHPBar.style.width = '0%';
    }

    const totalQ = this.correctAnswers + this.wrongAnswers;
    const accuracy = totalQ > 0 ? Math.round((this.correctAnswers / totalQ) * 100) : 0;
    const episodeUrl = this.guest.youtubeUrl;

    const overlay = document.createElement('div');
    overlay.id = 'a16z-battle-result-overlay';
    overlay.className = 'battle-result-overlay';

    overlay.innerHTML = `
      <div class="result-container defeat">
        <div class="result-header">
          <h1 class="result-title">DEFEAT</h1>
          <div class="result-subtitle">You lost to ${this.guest.name}!</div>
        </div>
        <div class="stats-container">
          <div class="stat-row"><span class="stat-label">Questions Answered:</span><span class="stat-value">${totalQ}</span></div>
          <div class="stat-row"><span class="stat-label">Correct Answers:</span><span class="stat-value correct">${this.correctAnswers}</span></div>
          <div class="stat-row"><span class="stat-label">Wrong Answers:</span><span class="stat-value wrong">${this.wrongAnswers}</span></div>
          <div class="stat-row"><span class="stat-label">Accuracy:</span><span class="stat-value">${accuracy}%</span></div>
          <div class="stat-row"><span class="stat-label">Level XP:</span><span class="stat-value">${this.playerStats.xp}/${this.playerStats.xpToNext}</span></div>
        </div>
        ${episodeUrl ? `<div class="episode-link-row"><a class="episode-link" href="${episodeUrl}" target="_blank" rel="noopener noreferrer">🎧 Listen to the episode</a></div>` : ''}
        <div class="result-btn-row">
          <button class="retry-btn" id="a16z-result-retry">↩ Try Again</button>
          <button class="continue-btn" id="a16z-result-return">▶ Return</button>
        </div>
        <div class="keyboard-hint">← → Arrow keys | ENTER</div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.battleResultOverlay = overlay;

    document.getElementById('a16z-result-retry')?.addEventListener('click', () => this.retryBattle());
    document.getElementById('a16z-result-return')?.addEventListener('click', () => this.returnToWorld());

    let selectedBtn = 0; // 0 = retry, 1 = return
    const updateBtnHighlight = () => {
      const retryBtn = document.getElementById('a16z-result-retry') as HTMLButtonElement | null;
      const returnBtn = document.getElementById('a16z-result-return') as HTMLButtonElement | null;
      if (retryBtn) retryBtn.style.outline = selectedBtn === 0 ? '3px solid #FFD700' : 'none';
      if (returnBtn) returnBtn.style.outline = selectedBtn === 1 ? '3px solid #FFD700' : 'none';
    };
    updateBtnHighlight();

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { selectedBtn = 0; updateBtnHighlight(); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { selectedBtn = 1; updateBtnHighlight(); e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (selectedBtn === 0) this.retryBattle();
        else this.returnToWorld();
      }
    };
    this.battleResultKeyHandler = keyHandler;
    window.addEventListener('keydown', keyHandler);
  }

  private retryBattle() {
    // Remove result overlay and keyboard handler
    if (this.battleResultOverlay) {
      this.battleResultOverlay.remove();
      this.battleResultOverlay = null;
    }
    if (this.battleResultKeyHandler) {
      window.removeEventListener('keydown', this.battleResultKeyHandler);
      this.battleResultKeyHandler = null;
    }
    // Restart the battle with same guest
    const guest = this.guest;
    const playerId = this.playerId;
    this.scene.restart({ guest, playerId });
  }

  private showGameOver() {
    this.battleOver = true;

    // Hide DOM battle menu
    if (this.battleMenuEl) this.battleMenuEl.style.display = 'none';

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const menuY = H * 0.65;
    const menuH = H - menuY;

    const bg = this.add.graphics().setDepth(20);
    bg.fillStyle(0x1a0008, 0.97);
    bg.fillRect(0, menuY, W, menuH);
    bg.lineStyle(4, 0xFFD700, 1.0);
    bg.strokeRect(0, menuY, W, menuH);

    this.add.text(W/2, menuY+20, 'GAME OVER', { fontFamily: '"Press Start 2P"', fontSize: '20px', color: '#FFD700', resolution: 2 }).setOrigin(0.5,0).setDepth(21);
    this.add.text(W/2, menuY+55, 'You ran out of HP!', { fontFamily: '"Press Start 2P"', fontSize: '11px', color: '#FFFFFF', resolution: 2 }).setOrigin(0.5,0).setDepth(21);
    this.add.text(W/2, menuY+80, 'Your Pokédex & Level are saved.', { fontFamily: '"Press Start 2P"', fontSize: '9px', color: '#AAAAAA', resolution: 2 }).setOrigin(0.5,0).setDepth(21);
    this.add.text(W/2, menuY+110, typeof window !== 'undefined' && 'ontouchstart' in window ? 'TAP to continue' : 'Press SPACE to continue', { fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#888888', resolution: 2 }).setOrigin(0.5,0).setDepth(21);

    this.playerStats.hp = this.playerStats.maxHp;
    const xpForCurrentLevel = (level: number) => {
      let total = 0;
      for(let i=1; i<level; i++) {
        total += 24 * Math.min(10+5*(i-1), 50);
      }
      return total;
    };
    this.playerStats.xp = xpForCurrentLevel(this.playerStats.level);
    this.playerStats.xpToNext = this.playerStats.level === 1 ? 200 : 24 * Math.min(10+5*(this.playerStats.level-1), 50);
    savePlayerStats(this.playerStats);

    this.time.delayedCall(500, () => {
      this.keys.space.on('down', () => this.returnToWorld());
      this.input.on('pointerdown', () => this.returnToWorld());
    });
  }

  shutdown() {
    this.time.removeAllEvents();
    this.tweens.killAll();
    // Remove DOM battle menu
    if (this.battleMenuEl) {
      this.battleMenuEl.remove();
      this.battleMenuEl = null;
    }
    this.domAnswerBtns = [];
    this.domQText = null;
    this.domQNum = null;
    // Remove DOM HP boxes
    if (this.domGuestHP) { this.domGuestHP.remove(); this.domGuestHP = null; }
    if (this.domPlayerHP) { this.domPlayerHP.remove(); this.domPlayerHP = null; }
    this.domGuestHPBar = null;
    this.domPlayerHPBar = null;
    this.domPlayerHPText = null;
    // Remove battle result overlay
    if (this.battleResultOverlay) { this.battleResultOverlay.remove(); this.battleResultOverlay = null; }
    if (this.battleResultKeyHandler) { window.removeEventListener('keydown', this.battleResultKeyHandler); this.battleResultKeyHandler = null; }
    // Also clean up by ID as fallback
    const gEl = document.getElementById('a16z-guest-hp');
    if (gEl) gEl.remove();
    const pEl = document.getElementById('a16z-player-hp');
    if (pEl) pEl.remove();
    const rEl = document.getElementById('a16z-battle-result-overlay');
    if (rEl) rEl.remove();
  }

  private returnToWorld() {
    // Clean up result overlay and keyboard handler
    if (this.battleResultOverlay) { this.battleResultOverlay.remove(); this.battleResultOverlay = null; }
    if (this.battleResultKeyHandler) { window.removeEventListener('keydown', this.battleResultKeyHandler); this.battleResultKeyHandler = null; }
    const rEl = document.getElementById('a16z-battle-result-overlay');
    if (rEl) rEl.remove();

    // Stop all battle audio and restart overworld music
    if (this.sound) {
      // Stop ALL sounds except overworld
      this.sound.stopAll?.();
      // OR stop individually
      ['battle-music', 'victory-music'].forEach(key => {
        const t = this.sound.get(key); if (t && t.isPlaying) t.stop();
      });
      // Restart overworld music (WorldScene is still running, just silent)
      const overworldTrack = this.sound.get('overworld-music');
      if (overworldTrack && !overworldTrack.isPlaying) {
        overworldTrack.play({ loop: true, volume: 0.4 });
      } else if (!overworldTrack) {
        this.sound.play('overworld-music', { loop: true, volume: 0.4 });
      }
    }
    const worldScene = this.scene.get('WorldScene') as any;
    if (worldScene) {
      worldScene.inBattleTransition = false;
      worldScene.dialogueVisible = false;
      worldScene.nearbyGuest = null;
      worldScene.activeNPC = null;
      const overlay = document.getElementById('a16z-dialogue-overlay');
      if (overlay) overlay.remove();
      // Remove battle menu DOM overlay
      // Nuclear cleanup: remove all battle DOM elements
      ['a16z-battle-menu', 'a16z-guest-hp', 'a16z-player-hp', 
       'a16z-battle-result-overlay', 'a16z-battle-result-styles',
       'a16z-dialogue-overlay'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
      // Also remove via instance references
      if (this.domGuestHP) { this.domGuestHP.remove(); this.domGuestHP = null; }
      if (this.domPlayerHP) { this.domPlayerHP.remove(); this.domPlayerHP = null; }
      if (this.battleMenuEl) { this.battleMenuEl.remove(); this.battleMenuEl = null; }
      if (worldScene.dialogueOverlay) {
        worldScene.dialogueOverlay.remove();
        worldScene.dialogueOverlay = null;
      }
      worldScene.dialogueGracePeriod = true;
      if (worldScene.time) {
        worldScene.time.delayedCall(800, () => { worldScene.dialogueGracePeriod = false; });
      }
      if (worldScene.mobileDpad) worldScene.mobileDpad.style.display = 'block';
      const interactBtn = document.getElementById('mobile-interact');
      if (interactBtn) (interactBtn as HTMLDivElement).style.display = 'flex';
    }
    this.scene.stop('BattleScene');
  }

  private navigateOption(dir: number) {
    if (this.waitingForNext || this.battleOver) return;
    this.selectedOption = (this.selectedOption + dir + 4) % 4;
    this.highlightDOMAnswer(this.selectedOption);
  }

  update() {
    if (this.battleOver || this.waitingForNext) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.one)) this.answerQuestion(0);
    else if (Phaser.Input.Keyboard.JustDown(this.keys.two)) this.answerQuestion(1);
    else if (Phaser.Input.Keyboard.JustDown(this.keys.three)) this.answerQuestion(2);
    else if (Phaser.Input.Keyboard.JustDown(this.keys.four)) this.answerQuestion(3);
  }
}
