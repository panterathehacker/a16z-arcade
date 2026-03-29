import * as Phaser from 'phaser';
import { Guest, Question, GUESTS } from '../data/guests';
import { saveCapture } from '../services/playerService';

interface BattleSceneData {
  guest: Guest;
  playerId: string | null;
}

export class BattleScene extends Phaser.Scene {
  private guest!: Guest;
  private questions!: Question[];
  private currentQ = 0;
  private playerHP = 100;
  private guestHP = 100;
  private playerId: string | null = null;

  private playerHPBar!: Phaser.GameObjects.Graphics;
  private guestHPBar!: Phaser.GameObjects.Graphics;
  private playerHPText!: Phaser.GameObjects.Text;
  private guestHPText!: Phaser.GameObjects.Text;

  private questionText!: Phaser.GameObjects.Text;
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private optionBgs: Phaser.GameObjects.Graphics[] = [];

  private statusText!: Phaser.GameObjects.Text;
  private waitingForNext = false;
  private battleOver = false;

  // Platform center positions (set by drawBattleBG, used for sprite placement)
  private _gpX = 0; private _gpY = 0;
  private _ppX = 0; private _ppY = 0;
  private guestSprite!: Phaser.GameObjects.Image;
  private playerSprite!: Phaser.GameObjects.Image;

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
    this.playerHP = 100;
    this.guestHP = 100;
    this.waitingForNext = false;
    this.battleOver = false;
  }

  preload() {
    if (!this.textures.exists('battle-bg')) {
      this.load.image('battle-bg', '/assets/battle/bg.png');
    }
    if (!this.textures.exists('battle-player-back')) {
      this.load.image('battle-player-back', '/assets/battle/player-back.png');
    }
  }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    // Draw battle background (sky, ground, platforms) — sets _gpX/Y and _ppX/Y
    this.drawBattleBG(W, H);

    const battleH = H * 0.7;

    // Guest sprite — upper-right platform, anchored at feet
    // Find index by matching guest id against the GUESTS array (excluding player)
    const gIdx = GUESTS.findIndex(g => g.id === this.guest.id);
    const guestTexKey = gIdx >= 0 && this.textures.exists(`npc_ai_${gIdx}`) ? `npc_ai_${gIdx}` : null;
    console.log('[Battle] guest id:', this.guest.id, 'idx:', gIdx, 'key:', guestTexKey);

    if (guestTexKey) {
      this.guestSprite = this.add.image(this._gpX, this._gpY, guestTexKey)
        .setDisplaySize(130, 180)
        .setOrigin(0.5, 1.0)   // anchor at feet — bottom of sprite sits on platform top
        .setDepth(5);
    }

    // Player sprite — lower-left platform, back-facing
    const playerSpriteKey = this.textures.exists('battle-player-back') ? 'battle-player-back'
                          : (this.textures.exists('player_ai') ? 'player_ai' : null);
    if (playerSpriteKey) {
      this.playerSprite = this.add.image(this._ppX, this._ppY, playerSpriteKey)
        .setDisplaySize(playerSpriteKey === 'battle-player-back' ? 100 : 110,
                        playerSpriteKey === 'battle-player-back' ? 140 : 150)
        .setOrigin(0.5, 1.0)
        .setDepth(5);
    }

    this.createBattleUI(W, H);
    this.setupKeys();
    this.showQuestion();
  }

  // ─────────────────────────────────────────────
  // drawBattleBG — LennyRPG / Pokemon-style scene
  // ─────────────────────────────────────────────
  private drawBattleBG(W: number, H: number) {
    const bg = this.add.graphics();
    const battleH = H * 0.7; // Bottom 30% is the UI panel

    // ── Sky gradient (top 55% of battle area) ──
    // Layered rectangles simulating blue→cyan gradient
    const skyColors = [0x3A7BD5, 0x4A8BE5, 0x5A9BF0, 0x6AABF8, 0x7ABBFF, 0x8ACBFF];
    const skyBands = skyColors.length;
    const bandH = (battleH * 0.55) / skyBands;
    skyColors.forEach((col, i) => {
      bg.fillStyle(col);
      bg.fillRect(0, i * bandH, W, bandH + 1);
    });

    // ── Green grass ground (bottom 45% of battle area) ──
    bg.fillStyle(0x5BA632);
    bg.fillRect(0, battleH * 0.55, W, battleH * 0.45);

    // Slightly lighter mid-ground stripe for depth
    bg.fillStyle(0x6BBF3A);
    bg.fillRect(0, battleH * 0.55, W, battleH * 0.08);

    // ── Thin horizon line ──
    bg.fillStyle(0x2E7A10);
    bg.fillRect(0, battleH * 0.55, W, 3);

    // ── Guest platform (upper-right) — tan/dirt oval with shadow ──
    const gpX = W * 0.70;
    const gpY = battleH * 0.50;

    // Drop shadow
    bg.fillStyle(0x2A6010, 0.45);
    bg.fillEllipse(gpX + 4, gpY + 10, 200, 38);

    // Platform body — tan/dirt
    bg.fillStyle(0xD4B07A);
    bg.fillEllipse(gpX, gpY, 200, 34);

    // Highlight band on top
    bg.fillStyle(0xE8CB96);
    bg.fillEllipse(gpX - 8, gpY - 5, 140, 14);

    // Dark edge
    bg.lineStyle(2, 0x9A7840, 1.0);
    bg.strokeEllipse(gpX, gpY, 200, 34);

    // ── Player platform (lower-left) — slightly larger, same style ──
    const ppX = W * 0.28;
    const ppY = battleH * 0.68;

    // Drop shadow
    bg.fillStyle(0x2A6010, 0.45);
    bg.fillEllipse(ppX + 5, ppY + 12, 230, 44);

    // Platform body
    bg.fillStyle(0xD4B07A);
    bg.fillEllipse(ppX, ppY, 230, 40);

    // Highlight
    bg.fillStyle(0xE8CB96);
    bg.fillEllipse(ppX - 10, ppY - 6, 160, 16);

    // Dark edge
    bg.lineStyle(2, 0x9A7840, 1.0);
    bg.strokeEllipse(ppX, ppY, 230, 40);

    // Store platform centers for sprite positioning (feet on platform top)
    this._gpX = gpX;
    this._gpY = gpY - 17;  // top edge of guest oval
    this._ppX = ppX;
    this._ppY = ppY - 20;  // top edge of player oval
  }

  // ─────────────────────────────────────────────
  // createBattleUI — HP panels + question/answers
  // ─────────────────────────────────────────────
  private createBattleUI(W: number, H: number) {
    const battleAreaH = H * 0.7;
    const PANEL_RADIUS = 10;

    // ── Guest HP Panel (top-left, 280x90) ──
    const gPanel = this.add.graphics();
    gPanel.fillStyle(0xFFFFFF, 0.97);
    gPanel.fillRoundedRect(10, 10, 280, 90, PANEL_RADIUS);
    gPanel.lineStyle(3, 0x181818);
    gPanel.strokeRoundedRect(10, 10, 280, 90, PANEL_RADIUS);
    gPanel.setDepth(10);

    // Guest name — bold, ALL CAPS
    this.add.text(22, 20, this.guest.name.toUpperCase(), {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#1a1a2e',
      resolution: 2,
    }).setDepth(11);

    // Guest title — small, gray
    this.add.text(22, 38, this.guest.title.slice(0, 28), {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: '#666680',
      resolution: 2,
    }).setDepth(11);

    // "HP" label — red, bold
    this.add.text(22, 56, 'HP', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: '#cc2222',
      resolution: 2,
    }).setDepth(11);

    // HP track (dark bg)
    const gHPTrack = this.add.graphics();
    gHPTrack.fillStyle(0x383838);
    gHPTrack.fillRoundedRect(50, 56, 220, 12, 4);
    gHPTrack.setDepth(11);

    // HP bar (live, updated)
    this.guestHPBar = this.add.graphics();
    this.guestHPBar.setDepth(12);

    // HP number — right-aligned below bar
    this.guestHPText = this.add.text(268, 72, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: '#303050',
      resolution: 2,
    }).setOrigin(1, 0).setDepth(11);

    // ── Player HP Panel (bottom-right, 260x85) ──
    const pPanel = this.add.graphics();
    pPanel.fillStyle(0xFFFFFF, 0.97);
    pPanel.fillRoundedRect(W - 270, battleAreaH - 95, 260, 85, PANEL_RADIUS);
    pPanel.lineStyle(3, 0x181818);
    pPanel.strokeRoundedRect(W - 270, battleAreaH - 95, 260, 85, PANEL_RADIUS);
    pPanel.setDepth(10);

    // Trainer name
    const trainerName = (typeof localStorage !== 'undefined'
      ? localStorage.getItem('a16z_username') : null) || 'PLAYER';
    this.add.text(W - 258, battleAreaH - 88, trainerName.toUpperCase().slice(0, 10), {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#1a1a2e',
      resolution: 2,
    }).setDepth(11);

    // "HP" label
    this.add.text(W - 258, battleAreaH - 68, 'HP', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: '#cc2222',
      resolution: 2,
    }).setDepth(11);

    // HP track
    const pHPTrack = this.add.graphics();
    pHPTrack.fillStyle(0x383838);
    pHPTrack.fillRoundedRect(W - 226, battleAreaH - 68, 208, 12, 4);
    pHPTrack.setDepth(11);

    // HP bar
    this.playerHPBar = this.add.graphics();
    this.playerHPBar.setDepth(12);

    // HP number
    this.playerHPText = this.add.text(W - 14, battleAreaH - 52, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: '#303050',
      resolution: 2,
    }).setOrigin(1, 0).setDepth(11);

    // Initial render
    this.updateHPBars(W, battleAreaH);

    // ── Battle menu (full bottom 30%) — dark background ──
    const menuY = battleAreaH + 4;
    const menuH = H - menuY - 4;

    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x1a1a2e, 1.0);
    menuBg.fillRoundedRect(4, menuY, W - 8, menuH, 8);
    menuBg.lineStyle(2, 0x3a3a5e);
    menuBg.strokeRoundedRect(4, menuY, W - 8, menuH, 8);
    menuBg.setDepth(10);

    // Question text — left half, white, word-wrapped
    const qAreaW = W * 0.5 - 20;
    this.questionText = this.add.text(16, menuY + 12, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#FFFFFF',
      resolution: 2,
      wordWrap: { width: qAreaW },
    }).setDepth(11);

    // Q counter (Q1/5) — top-right of question area
    this.add.text(W - 14, menuY + 12, 'Q1/5', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#8888AA',
      resolution: 2,
    }).setOrigin(1, 0).setDepth(11).setName('progress');

    // 4 answer buttons — right half, 2 rows x 2 cols
    const btnAreaX = W * 0.5 + 8;
    const btnW = (W * 0.5 - 24) / 2;
    const btnH = 32;
    const btnGap = 8;
    const btnStartY = menuY + 8;

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = btnAreaX + col * (btnW + btnGap);
      const by = btnStartY + row * (btnH + btnGap);

      const optBg = this.add.graphics();
      optBg.fillStyle(0x2E2E4E);
      optBg.fillRoundedRect(bx, by, btnW, btnH, 6);
      optBg.lineStyle(2, 0x5555AA);
      optBg.strokeRoundedRect(bx, by, btnW, btnH, 6);
      optBg.setDepth(11);
      this.optionBgs.push(optBg);

      // Number prefix
      this.add.text(bx + 8, by + 10, `${i + 1}.`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        color: '#AAAAFF',
        resolution: 2,
      }).setDepth(12);

      // Answer text
      const optText = this.add.text(bx + 30, by + 10, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        color: '#FFFFFF',
        resolution: 2,
        wordWrap: { width: btnW - 34 },
      }).setDepth(12);
      this.optionTexts.push(optText);
    }

    // Status/feedback text — centered in question area
    this.statusText = this.add.text(W * 0.25, menuY + menuH * 0.5, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#FF6060',
      resolution: 2,
      align: 'center',
      wordWrap: { width: W * 0.5 - 20 },
    }).setOrigin(0.5, 0.5).setDepth(12).setVisible(false);
  }

  private updateHPBars(W: number, battleAreaH: number) {
    // Guest HP bar
    this.guestHPBar.clear();
    const guestPct = Math.max(0, this.guestHP) / 100;
    const guestColor = guestPct > 0.5 ? 0x40D840 : guestPct > 0.25 ? 0xD8C040 : 0xD84040;
    this.guestHPBar.fillStyle(guestColor);
    this.guestHPBar.fillRoundedRect(50, 56, Math.round(220 * guestPct), 12, 4);
    this.guestHPText.setText(`${Math.max(0, this.guestHP)}/100`);

    // Player HP bar
    this.playerHPBar.clear();
    const playerPct = Math.max(0, this.playerHP) / 100;
    const playerColor = playerPct > 0.5 ? 0x40D840 : playerPct > 0.25 ? 0xD8C040 : 0xD84040;
    this.playerHPBar.fillStyle(playerColor);
    this.playerHPBar.fillRoundedRect(W - 226, battleAreaH - 68, Math.round(208 * playerPct), 12, 4);
    this.playerHPText.setText(`${Math.max(0, this.playerHP)}/100`);
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
  }

  private showQuestion() {
    if (this.currentQ >= this.questions.length) {
      this.endBattle();
      return;
    }

    const q = this.questions[this.currentQ];
    this.questionText.setText(q.text);
    this.questionText.setVisible(true);
    this.statusText.setVisible(false);

    const W = this.cameras.main.width;
    const battleAreaH = this.cameras.main.height * 0.7;
    const menuY = battleAreaH + 4;
    const menuH = this.cameras.main.height - menuY - 4;
    const btnAreaX = W * 0.5 + 8;
    const btnW = (W * 0.5 - 24) / 2;
    const btnH = 32;
    const btnGap = 8;
    const btnStartY = menuY + 8;

    this.optionBgs.forEach((bg, i) => {
      bg.clear();
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = btnAreaX + col * (btnW + btnGap);
      const by = btnStartY + row * (btnH + btnGap);
      bg.fillStyle(0x2E2E4E);
      bg.fillRoundedRect(bx, by, btnW, btnH, 6);
      bg.lineStyle(2, 0x5555AA);
      bg.strokeRoundedRect(bx, by, btnW, btnH, 6);
    });

    q.options.forEach((opt, i) => {
      this.optionTexts[i].setText(opt);
    });

    // Update Q counter
    const prog = this.children.list.find(
      (c) => c instanceof Phaser.GameObjects.Text && (c as Phaser.GameObjects.Text).name === 'progress'
    ) as Phaser.GameObjects.Text | undefined;
    if (prog) prog.setText(`Q${this.currentQ + 1}/5`);

    this.waitingForNext = false;
  }

  private highlightOption(index: number, correct: boolean) {
    const W = this.cameras.main.width;
    const battleAreaH = this.cameras.main.height * 0.7;
    const menuY = battleAreaH + 4;
    const btnAreaX = W * 0.5 + 8;
    const btnW = (W * 0.5 - 24) / 2;
    const btnH = 32;
    const btnGap = 8;
    const btnStartY = menuY + 8;

    this.optionBgs.forEach((bg, i) => {
      bg.clear();
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = btnAreaX + col * (btnW + btnGap);
      const by = btnStartY + row * (btnH + btnGap);

      let fillColor = 0x2E2E4E;
      let strokeColor = 0x5555AA;

      if (i === this.questions[this.currentQ].correct) {
        fillColor = 0x1A5C1A;
        strokeColor = 0x40DD40;
      } else if (i === index && !correct) {
        fillColor = 0x5C1A1A;
        strokeColor = 0xDD4040;
      }

      bg.fillStyle(fillColor);
      bg.fillRoundedRect(bx, by, btnW, btnH, 6);
      bg.lineStyle(2, strokeColor);
      bg.strokeRoundedRect(bx, by, btnW, btnH, 6);
    });
  }

  private answerQuestion(index: number) {
    if (this.waitingForNext || this.battleOver) return;

    const q = this.questions[this.currentQ];
    const correct = index === q.correct;

    this.highlightOption(index, correct);

    const W = this.cameras.main.width;
    const battleAreaH = this.cameras.main.height * 0.7;

    if (correct) {
      this.guestHP -= 20;
      this.updateHPBars(W, battleAreaH);
      this.statusText.setText('✓ Correct!  Guest HP -20');
      this.statusText.setStyle({ color: '#40EE40' });
      this.statusText.setVisible(true);
      this.questionText.setVisible(false);
    } else {
      this.playerHP -= 20;
      this.updateHPBars(W, battleAreaH);
      this.statusText.setText('✗ Wrong!  Player HP -20');
      this.statusText.setStyle({ color: '#FF6060' });
      this.statusText.setVisible(true);
      this.questionText.setVisible(false);
    }

    this.waitingForNext = true;

    this.time.delayedCall(1800, () => {
      this.currentQ++;

      if (this.playerHP <= 0) {
        this.showBlackout();
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

    this.questionText.setVisible(false);
    this.optionTexts.forEach(t => t.setVisible(false));
    this.optionBgs.forEach(bg => bg.clear());

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
    saveCapture(this.playerId, this.guest.id).catch((err) => {
      console.warn('Failed to save capture to Supabase:', err);
    });
  }

  private showVictory() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const battleAreaH = H * 0.7;
    const menuY = battleAreaH + 4;
    const menuH = H - menuY - 4;

    const victoryBg = this.add.graphics();
    victoryBg.fillStyle(0x003000, 0.97);
    victoryBg.fillRoundedRect(4, menuY, W - 8, menuH, 8);
    victoryBg.setDepth(20);

    const captured: string[] = JSON.parse(localStorage.getItem('a16z_captured') || '[]');
    const total = captured.length;

    this.add.text(W / 2, menuY + 16, '🎉 VICTORY!', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#FFD700',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    this.add.text(W / 2, menuY + 44, `${this.guest.name} captured!`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#FFFFFF',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    this.add.text(W / 2, menuY + 68, `Total: ${total}/25 captured`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#80FF80',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    const pb = this.add.image(W / 2, menuY + 104, 'pokeball');
    pb.setOrigin(0.5).setScale(2).setDepth(21);
    this.tweens.add({
      targets: pb,
      angle: 360,
      duration: 1500,
      repeat: 1,
      ease: 'Linear',
    });

    this.add.text(W / 2, menuY + 144, 'Press SPACE to continue', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#AAAAAA',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    this.time.delayedCall(500, () => {
      this.keys.space.on('down', () => this.returnToWorld());
    });
  }

  private showDefeat() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const battleAreaH = H * 0.7;
    const menuY = battleAreaH + 4;
    const menuH = H - menuY - 4;

    const defeatBg = this.add.graphics();
    defeatBg.fillStyle(0x200000, 0.97);
    defeatBg.fillRoundedRect(4, menuY, W - 8, menuH, 8);
    defeatBg.setDepth(20);

    this.add.text(W / 2, menuY + 24, 'You lost...', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#FF4040',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    this.add.text(W / 2, menuY + 54, 'Study harder and try again!', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#AAAAAA',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    this.add.text(W / 2, menuY + 84, 'Press SPACE to return', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#888888',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    this.time.delayedCall(500, () => {
      this.keys.space.on('down', () => this.returnToWorld());
    });
  }

  private showBlackout() {
    this.battleOver = true;

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    const blackout = this.add.graphics();
    blackout.fillStyle(0x000000, 0);
    blackout.fillRect(0, 0, W, H);
    blackout.setDepth(1000);

    this.tweens.add({
      targets: blackout,
      alpha: 1,
      duration: 800,
      onComplete: () => {
        this.add.text(W / 2, H / 2 - 30, 'You blacked out!', {
          fontFamily: '"Press Start 2P"',
          fontSize: '12px',
          color: '#FFFFFF',
          resolution: 2,
        }).setOrigin(0.5).setDepth(1001);

        this.add.text(W / 2, H / 2 + 20, 'Press SPACE to return', {
          fontFamily: '"Press Start 2P"',
          fontSize: '11px',
          color: '#AAAAAA',
          resolution: 2,
        }).setOrigin(0.5).setDepth(1001);

        this.time.delayedCall(500, () => {
          this.keys.space.on('down', () => this.returnToWorld());
        });
      },
    });
  }

  private returnToWorld() {
    this.scene.stop('BattleScene');
    this.scene.resume('WorldScene');
  }

  update() {
    if (this.battleOver || this.waitingForNext) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.one)) this.answerQuestion(0);
    else if (Phaser.Input.Keyboard.JustDown(this.keys.two)) this.answerQuestion(1);
    else if (Phaser.Input.Keyboard.JustDown(this.keys.three)) this.answerQuestion(2);
    else if (Phaser.Input.Keyboard.JustDown(this.keys.four)) this.answerQuestion(3);
  }
}
