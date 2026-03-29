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
    if (raw) return JSON.parse(raw);
  } catch (_) { /* */ }
  return { level: 1, xp: 0, xpToNext: 200, hp: 100, maxHp: 100 };
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
  return 24 * xpPerCorrect(level);
}

export class BattleScene extends Phaser.Scene {
  private guest!: Guest;
  private questions!: Question[];
  private currentQ = 0;
  private playerHP = 100;
  private guestHP = 100;
  private correctAnswers = 0;
  private playerId: string | null = null;
  private playerStats!: PlayerStats;

  private playerHPBar!: Phaser.GameObjects.Graphics;
  private guestHPBar!: Phaser.GameObjects.Graphics;
  private playerHPText!: Phaser.GameObjects.Text;
  private guestHPText!: Phaser.GameObjects.Text;

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
    this.waitingForNext = false;
    this.battleOver = false;
  }

  create() {
    this.time.removeAllEvents();
    this.children.removeAll(true);

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    this.drawBattleBG(W, H);

    // Guest sprite — right mound, anchored at feet
    const idx = GUESTS.findIndex(g => g.id === this.guest.id);
    const texKey = idx >= 0 ? 'npc_ai_' + idx : null;
    console.log('[Battle] guest id:', this.guest.id, 'idx:', idx, 'key:', texKey);

    if (texKey && this.textures.exists(texKey)) {
      this.guestSprite = this.add.image(this._gpX, this._gpY, texKey)
        .setDisplaySize(180, 250)
        .setOrigin(0.5, 1.0)
        .setDepth(5);
    }

    // Player sprite — left mound, back-facing
    const pGender = typeof localStorage !== 'undefined' ? localStorage.getItem('a16z_gender') || 'male' : 'male';
    const pSet = pGender === 'female' ? 'player-female' : 'player-male';
    const playerSpriteKey = this.textures.exists(pSet + '_back') ? (pSet + '_back')
                          : (this.textures.exists('player_ai') ? 'player_ai' : null);
    if (playerSpriteKey) {
      this.playerSprite = this.add.image(this._ppX, this._ppY, playerSpriteKey)
        .setDisplaySize(180, 250)
        .setOrigin(0.5, 1.0)
        .setDepth(5);
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

    this._gpX = W * 0.655;
    this._gpY = H * 0.37;
    this._ppX = W * 0.35;
    this._ppY = H * 0.50;
  }

  // ─────────────────────────────────────────────
  // createBattleUI — HP panels (Phaser) + question/answers (DOM overlay)
  // ─────────────────────────────────────────────
  private createBattleUI(W: number, H: number) {
    const isMobileBattle = H > W;
    const battleAreaH = isMobileBattle ? H * 0.48 : H * 0.65;

    // ────────────────────────────────────────────
    // Guest HP box: Phaser canvas
    // ────────────────────────────────────────────
    const gBoxX = 170;
    const gBoxY = H * 0.03;
    const gBoxW = 280;
    const gBoxH = 90;

    const gPanel = this.add.graphics().setDepth(10);
    gPanel.fillStyle(0xFFFFFF, 1.0);
    gPanel.fillRoundedRect(gBoxX, gBoxY, gBoxW, gBoxH, 12);
    gPanel.lineStyle(3, 0x000000, 1.0);
    gPanel.strokeRoundedRect(gBoxX, gBoxY, gBoxW, gBoxH, 12);

    const guestNameUpper = this.guest.name.toUpperCase();
    const nameFontSize = guestNameUpper.length > 14 ? '11px' : '14px';
    this.add.text(gBoxX + 12, gBoxY + 8, guestNameUpper, {
      fontFamily: '"Press Start 2P"',
      fontSize: nameFontSize,
      fontStyle: 'bold',
      color: '#000000',
      resolution: 2,
    }).setDepth(11);

    const titleText = this.guest.title.length > 20 ? this.guest.title.slice(0, 20) + '...' : this.guest.title;
    const titleFontSize = this.guest.title.length > 16 ? '9px' : '11px';
    this.add.text(gBoxX + 12, gBoxY + 30, titleText, {
      fontFamily: '"Press Start 2P"',
      fontSize: titleFontSize,
      color: '#666666',
      resolution: 2,
    }).setDepth(11);

    this.add.text(gBoxX + 12, gBoxY + 52, 'HP', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#ee3333',
      resolution: 2,
    }).setDepth(11);

    const gHPTrackX = gBoxX + 36;
    const gHPTrackY = gBoxY + 52;
    const gHPTrackW = gBoxW - 48;

    const gHPTrack = this.add.graphics().setDepth(11);
    gHPTrack.fillStyle(0xDDDDDD, 1.0);
    gHPTrack.fillRoundedRect(gHPTrackX, gHPTrackY, gHPTrackW, 12, 3);

    this._gHPBarX = gHPTrackX;
    this._gHPBarY = gHPTrackY;
    this._gHPBarW = gHPTrackW;

    this.guestHPBar = this.add.graphics().setDepth(12);
    this.guestHPText = this.add.text(0, 0, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#000000',
      resolution: 2,
    }).setDepth(11).setVisible(false);

    // ────────────────────────────────────────────
    // Player HP box: Phaser canvas
    // ────────────────────────────────────────────
    const pBoxX = W * 0.48;
    const pBoxY = H * 0.35;
    const pBoxW = 240;
    const pBoxH = 90;

    const pPanel = this.add.graphics().setDepth(10);
    pPanel.fillStyle(0xFFFFFF, 1.0);
    pPanel.fillRoundedRect(pBoxX, pBoxY, pBoxW, pBoxH, 12);
    pPanel.lineStyle(3, 0x000000, 1.0);
    pPanel.strokeRoundedRect(pBoxX, pBoxY, pBoxW, pBoxH, 12);

    const trainerName = (typeof localStorage !== 'undefined'
      ? localStorage.getItem('a16z_username') : null) || 'PLAYER';
    this.add.text(pBoxX + 10, pBoxY + 8, trainerName.toUpperCase().slice(0, 10), {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#000000',
      resolution: 2,
    }).setDepth(11);

    const pLvX = pBoxX + pBoxW - 50;
    const pLvY = pBoxY + 6;
    const pLvBadge = this.add.graphics().setDepth(11);
    pLvBadge.fillStyle(0x888888, 1.0);
    pLvBadge.fillRoundedRect(pLvX, pLvY, 38, 16, 6);
    this.add.text(pLvX + 5, pLvY + 2, 'Lv1', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#FFFFFF',
      resolution: 2,
    }).setDepth(12);

    this.add.text(pBoxX + 10, pBoxY + 36, 'HP', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#ee3333',
      resolution: 2,
    }).setDepth(11);

    const pHPTrackX = pBoxX + 34;
    const pHPTrackY = pBoxY + 36;
    const pHPTrackW = pBoxW - 44;

    const pHPTrack = this.add.graphics().setDepth(11);
    pHPTrack.fillStyle(0xDDDDDD, 1.0);
    pHPTrack.fillRoundedRect(pHPTrackX, pHPTrackY, pHPTrackW, 12, 3);

    this._pHPBarX = pHPTrackX;
    this._pHPBarY = pHPTrackY;
    this._pHPBarW = pHPTrackW;
    this._pHPNumX = pBoxX + pBoxW - 8;
    this._pHPNumY = pBoxY + 54;

    this.playerHPBar = this.add.graphics().setDepth(12);

    this.playerHPText = this.add.text(this._pHPNumX, this._pHPNumY, `${this.playerHP} / ${this.playerStats.maxHp}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#000000',
      resolution: 2,
    }).setOrigin(1, 0).setDepth(12);

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
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const canvasRect = canvas.getBoundingClientRect();
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
      qText.style.cssText = 'flex:1;font-size:13px;line-height:1.8;color:#000;word-wrap:break-word;overflow-wrap:break-word;white-space:normal;';
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
        text.style.cssText = 'font-size:10px;line-height:1.5;color:#000;flex:1;word-wrap:break-word;overflow-wrap:break-word;white-space:normal;';
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
      document.body.appendChild(menuEl);
      this.battleMenuEl = menuEl;
      this.domAnswerBtns = answerBtns;
      this.domQText = qText;
      this.domQNum = qNum;
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
    this.guestHPBar.clear();
    const guestPct = Math.max(0, this.guestHP) / 100;
    const guestColor = guestPct > 0.5 ? 0x22cc44 : guestPct > 0.25 ? 0xD8C040 : 0xD84040;
    this.guestHPBar.fillStyle(guestColor, 1.0);
    this.guestHPBar.fillRoundedRect(
      this._gHPBarX, this._gHPBarY,
      Math.max(0, Math.round(this._gHPBarW * guestPct)), 12, 3
    );

    this.playerHPBar.clear();
    const playerPct = Math.max(0, this.playerHP) / this.playerStats.maxHp;
    const playerColor = playerPct > 0.5 ? 0x22cc44 : playerPct > 0.25 ? 0xD8C040 : 0xD84040;
    this.playerHPBar.fillStyle(playerColor, 1.0);
    this.playerHPBar.fillRoundedRect(
      this._pHPBarX, this._pHPBarY,
      Math.max(0, Math.round(this._pHPBarW * playerPct)), 12, 3
    );

    this.playerHPText.setText(`${Math.max(0, this.playerHP)} / ${this.playerStats.maxHp}`);
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
      const el = document.getElementById('battle-answer-text-' + i);
      if (el) el.textContent = opt;
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
      this.guestHP -= 20;
      this.updateHPBars();
      this.statusText.setText('✓ Correct!\nGuest HP -20');
      this.statusText.setStyle({ ...this.statusText.style, color: '#00aa00' });
      this.statusText.setVisible(true);

      const xpGain = xpPerCorrect(this.playerStats.level);
      this.playerStats.xp += xpGain;
      while (this.playerStats.xp >= this.playerStats.xpToNext) {
        this.playerStats.xp -= this.playerStats.xpToNext;
        this.playerStats.level++;
        this.playerStats.maxHp += 10;
        this.playerStats.xpToNext = xpToNextLevel(this.playerStats.level);
      }
      savePlayerStats(this.playerStats);

      this.showDamageFloat(this._gHPBarX + this._gHPBarW / 2, this._gHPBarY - 10, '-20 HP', 0xFF4444);
      this.showDamageFloat(this._pHPBarX + this._pHPBarW / 2, this._pHPBarY - 10, `+${xpGain} XP`, 0xFFD700);
    } else {
      this.playerHP -= 20;
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

    if (this.playerHP > 50) {
      this.captureGuest();
      this.showVictory();
    } else {
      this.showDefeat();
    }
  }

  private captureGuest() {
    const captured: string[] = JSON.parse(localStorage.getItem('a16z_captured') || '[]');
    if (!captured.includes(this.guest.id)) {
      captured.push(this.guest.id);
      localStorage.setItem('a16z_captured', JSON.stringify(captured));
    }
    this.playerStats.hp = this.playerStats.maxHp;
    savePlayerStats(this.playerStats);
    saveCapture(this.playerId, this.guest.id).catch((err) => {
      console.warn('Failed to save capture to Supabase:', err);
    });
  }

  private showVictory() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const menuY = H * 0.65;
    const menuH = H - menuY;

    const victoryBg = this.add.graphics().setDepth(20);
    victoryBg.fillStyle(0x003000, 0.97);
    victoryBg.fillRect(0, menuY, W, menuH);
    victoryBg.lineStyle(4, 0xFFD700, 1.0);
    victoryBg.strokeRect(0, menuY, W, menuH);

    const captured: string[] = JSON.parse(localStorage.getItem('a16z_captured') || '[]');
    const total = captured.length;

    this.add.text(W / 2, menuY + 12, '🎉 VICTORY!', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#FFD700',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    this.add.text(W / 2, menuY + 40, `${this.guest.name} captured!`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#FFFFFF',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    this.add.text(W / 2, menuY + 64, `Total: ${total}/25 captured`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#80FF80',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    const pb = this.add.image(W / 2, menuY + 100, 'pokeball');
    pb.setOrigin(0.5).setScale(2).setDepth(21);
    this.tweens.add({
      targets: pb,
      angle: 360,
      duration: 1500,
      repeat: 1,
      ease: 'Linear',
    });

    this.add.text(W / 2, menuY + 136, 'Press SPACE to continue', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#AAAAAA',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    this.time.delayedCall(500, () => {
      this.keys.space.on('down', () => this.returnToWorld());
      this.input.on('pointerdown', () => this.returnToWorld());
    });
  }

  private showDefeat() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const menuY = H * 0.65;
    const menuH = H - menuY;

    const defeatBg = this.add.graphics().setDepth(20);
    defeatBg.fillStyle(0x200000, 0.97);
    defeatBg.fillRect(0, menuY, W, menuH);
    defeatBg.lineStyle(4, 0xFFD700, 1.0);
    defeatBg.strokeRect(0, menuY, W, menuH);

    this.add.text(W / 2, menuY + 20, 'You lost...', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#FF4040',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    this.add.text(W / 2, menuY + 50, 'Study harder and try again!', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#AAAAAA',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    this.add.text(W / 2, menuY + 80, ('ontouchstart' in window ? 'TAP to return' : 'Press SPACE to return'), {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#888888',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    this.time.delayedCall(500, () => {
      this.keys.space.on('down', () => this.returnToWorld());
      this.input.on('pointerdown', () => this.returnToWorld());
    });
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
    this.playerStats.xpToNext = 24 * Math.min(10+5*(this.playerStats.level-1), 50);
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
  }

  private returnToWorld() {
    const worldScene = this.scene.get('WorldScene') as any;
    if (worldScene) {
      worldScene.inBattleTransition = false;
      worldScene.dialogueVisible = false;
      worldScene.nearbyGuest = null;
      worldScene.activeNPC = null;
      const overlay = document.getElementById('a16z-dialogue-overlay');
      if (overlay) overlay.remove();
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
