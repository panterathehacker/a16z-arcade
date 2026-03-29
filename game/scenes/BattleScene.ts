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
  private selectedOption = 0;

  // Sprite foot positions (set by drawBattleBG)
  private _gpX = 0; private _gpY = 0;
  private _ppX = 0; private _ppY = 0;
  private guestSprite!: Phaser.GameObjects.Image;
  private playerSprite!: Phaser.GameObjects.Image;

  // HP bar positions (set by createBattleUI, used by updateHPBars)
  private _gHPBarX = 0; private _gHPBarY = 0; private _gHPBarW = 0;
  private _pHPBarX = 0; private _pHPBarY = 0; private _pHPBarW = 0;
  private _pHPNumX = 0; private _pHPNumY = 0;

  // Answer option layout (set by createBattleUI, used by showQuestion/highlightOption)
  private _btnAreaX = 0; private _btnStartY = 0;
  private _btnW = 0; private _btnH = 38; private _btnGap = 4;

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

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    // Draw battle background — sets _gpX/Y and _ppX/Y
    this.drawBattleBG(W, H);

    // Guest sprite — right mound, anchored at feet
    const idx = GUESTS.findIndex(g => g.id === this.guest.id);
    const texKey = idx >= 0 ? 'npc_ai_' + idx : null;
    console.log('[Battle] guest id:', this.guest.id, 'idx:', idx, 'key:', texKey);

    if (texKey && this.textures.exists(texKey)) {
      this.guestSprite = this.add.image(this._gpX, this._gpY, texKey)
        .setDisplaySize(130, 180)
        .setOrigin(0.5, 1.0)
        .setDepth(5);
    }

    // Player sprite — left mound, back-facing
    const playerSpriteKey = this.textures.exists('player_ai') ? 'player_ai'
                          : (this.textures.exists('player_ai') ? 'player_ai' : null);
    if (playerSpriteKey) {
      this.playerSprite = this.add.image(this._ppX, this._ppY, playerSpriteKey)
        .setDisplaySize(100, 140)
        .setOrigin(0.5, 1.0)
        .setDepth(5);
    }

    this.createBattleUI(W, H);
    this.setupKeys();
    this.showQuestion();
  }

  // ─────────────────────────────────────────────
  // drawBattleBG — meadow bg image only, no drawn platforms
  // ─────────────────────────────────────────────
  private drawBattleBG(W: number, H: number) {
    // Transparent camera — the white dialog area below will show through
    this.cameras.main.setBackgroundColor('transparent');

    // Meadow background fills top 65% of screen
    this.add.image(W * 0.5, H * 0.325, 'battle-bg')
      .setDisplaySize(W, H * 0.65)
      .setDepth(0);

    // Sprite foot positions that land on the two dirt mounds in the image
    this._gpX = W * 0.655;   // right mound — guest feet X
    this._gpY = H * 0.37;   // guest feet Y (origin 0.5, 1.0 so body extends upward)
    this._ppX = W * 0.35;   // left mound — player feet X
    this._ppY = H * 0.50;   // player feet Y
  }

  // ─────────────────────────────────────────────
  // createBattleUI — HP panels + question/answers (LennyRPG layout)
  // ─────────────────────────────────────────────
  private createBattleUI(W: number, H: number) {
    const battleAreaH = H * 0.65;

    // ────────────────────────────────────────────
    // Guest HP box: position (W*0.30, H*0.03), 280×90px
    // ────────────────────────────────────────────
    const gBoxX = 220;
    const gBoxY = H * 0.03;
    const gBoxW = 280;
    const gBoxH = 90;

    const gPanel = this.add.graphics().setDepth(10);
    gPanel.fillStyle(0xFFFFFF, 1.0);
    gPanel.fillRoundedRect(gBoxX, gBoxY, gBoxW, gBoxH, 12);
    gPanel.lineStyle(3, 0x000000, 1.0);
    gPanel.strokeRoundedRect(gBoxX, gBoxY, gBoxW, gBoxH, 12);

    // Name: 14px Press Start 2P bold ALL CAPS black
    this.add.text(gBoxX + 12, gBoxY + 8, this.guest.name.toUpperCase(), {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#000000',
      resolution: 2,
    }).setDepth(11);

    // Title: 9px gray (#666)
    this.add.text(gBoxX + 12, gBoxY + 30, this.guest.title.slice(0, 30), {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#666666',
      resolution: 2,
    }).setDepth(11);

    // "HP" 11px red (#e33)
    this.add.text(gBoxX + 12, gBoxY + 52, 'HP', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#ee3333',
      resolution: 2,
    }).setDepth(11);

    // HP track (light gray bg) — full width of box minus padding
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

    // No number shown in guest box
    this.guestHPText = this.add.text(0, 0, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#000000',
      resolution: 2,
    }).setDepth(11).setVisible(false);

    // ────────────────────────────────────────────
    // Player HP box: position (W*0.38, H*0.43), 240×90px
    // ────────────────────────────────────────────
    const pBoxX = W * 0.38;
    const pBoxY = H * 0.43;
    const pBoxW = 240;
    const pBoxH = 90;

    const pPanel = this.add.graphics().setDepth(10);
    pPanel.fillStyle(0xFFFFFF, 1.0);
    pPanel.fillRoundedRect(pBoxX, pBoxY, pBoxW, pBoxH, 12);
    pPanel.lineStyle(3, 0x000000, 1.0);
    pPanel.strokeRoundedRect(pBoxX, pBoxY, pBoxW, pBoxH, 12);

    // Trainer name: 14px ALL CAPS
    const trainerName = (typeof localStorage !== 'undefined'
      ? localStorage.getItem('a16z_username') : null) || 'PLAYER';
    this.add.text(pBoxX + 10, pBoxY + 8, trainerName.toUpperCase().slice(0, 10), {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#000000',
      resolution: 2,
    }).setDepth(11);

    // "Lv1" gray badge
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

    // "HP" 11px red
    this.add.text(pBoxX + 10, pBoxY + 36, 'HP', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#ee3333',
      resolution: 2,
    }).setDepth(11);

    // HP track
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

    // "100 / 100" 10px right-aligned below bar
    this.playerHPText = this.add.text(this._pHPNumX, this._pHPNumY, '100 / 100', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#000000',
      resolution: 2,
    }).setOrigin(1, 0).setDepth(12);

    // Initial render
    this.updateHPBars();

    // ────────────────────────────────────────────
    // Battle dialog area (bottom 35%)
    // White background, 4px yellow (#FFD700) border
    // ────────────────────────────────────────────
    const menuY = battleAreaH;
    const menuH = H - menuY;

    const menuBg = this.add.graphics().setDepth(9);
    menuBg.fillStyle(0xFFFFFF, 1.0);
    menuBg.fillRect(0, menuY, W, menuH);
    menuBg.lineStyle(4, 0xFFD700, 1.0);
    menuBg.strokeRect(0, menuY, W, menuH);

    // ── Left 45%: question panel ──
    const qPanelX = 20;
    const qPanelW = W * 0.45 - 20;

    // "Q1/5" 12px top-left, black
    this.add.text(qPanelX, menuY + 12, `Q${this.currentQ + 1}/${this.questions.length}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#000000',
      resolution: 2,
    }).setDepth(11).setName('progress');

    // "EASY" yellow badge top-right of left panel
    const easyX = qPanelX + qPanelW - 58;
    const easyBadge = this.add.graphics().setDepth(11);
    easyBadge.fillStyle(0xFFD700, 1.0);
    easyBadge.fillRoundedRect(easyX, menuY + 10, 52, 18, 5);
    this.add.text(easyX + 6, menuY + 13, 'EASY', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#000000',
      resolution: 2,
    }).setDepth(12);

    // Question text: 13px Press Start 2P black, word-wrapped, 20px padding
    this.questionText = this.add.text(qPanelX, menuY + 40, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '13px',
      color: '#000000',
      resolution: 2,
      wordWrap: { width: qPanelW - 20 },
    }).setDepth(11);

    // "↕ ENTER" 9px bottom-left
    this.add.text(qPanelX, menuY + menuH - 20, '↕ ENTER', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#888888',
      resolution: 2,
    }).setDepth(11);

    // ── Right 55%: vertical answer list ──
    this._btnAreaX = W * 0.45 + 8;
    this._btnW = W * 0.55 - 16;
    this._btnH = 38;
    this._btnGap = 4;
    this._btnStartY = menuY + 8;

    for (let i = 0; i < 4; i++) {
      const bx = this._btnAreaX;
      const by = this._btnStartY + i * (this._btnH + this._btnGap);

      const optBg = this.add.graphics().setDepth(11);
      optBg.fillStyle(0xFFFFFF, 1.0);
      optBg.fillRoundedRect(bx, by, this._btnW, this._btnH, 8);
      optBg.lineStyle(2, 0x333333, 1.0);
      optBg.strokeRoundedRect(bx, by, this._btnW, this._btnH, 8);
      this.optionBgs.push(optBg);

      // "1  Answer text" 11px Press Start 2P
      const optText = this.add.text(bx + 10, by + (this._btnH / 2), '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '11px',
        color: '#000000',
        resolution: 2,
        wordWrap: { width: this._btnW - 20 },
      }).setOrigin(0, 0.5).setDepth(12);
      this.optionTexts.push(optText);
    }

    // Status/feedback text — centered in question area
    this.statusText = this.add.text(qPanelX + qPanelW / 2, menuY + menuH * 0.55, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '13px',
      color: '#FF4040',
      resolution: 2,
      align: 'center',
      wordWrap: { width: qPanelW - 20 },
    }).setOrigin(0.5, 0.5).setDepth(12).setVisible(false);
  }

  private updateHPBars() {
    // Guest HP bar — green (#22cc44), fades to yellow/red as HP drops
    this.guestHPBar.clear();
    const guestPct = Math.max(0, this.guestHP) / 100;
    const guestColor = guestPct > 0.5 ? 0x22cc44 : guestPct > 0.25 ? 0xD8C040 : 0xD84040;
    this.guestHPBar.fillStyle(guestColor, 1.0);
    this.guestHPBar.fillRoundedRect(
      this._gHPBarX, this._gHPBarY,
      Math.max(0, Math.round(this._gHPBarW * guestPct)), 12, 3
    );

    // Player HP bar — green (#22cc44), fades as HP drops
    this.playerHPBar.clear();
    const playerPct = Math.max(0, this.playerHP) / 100;
    const playerColor = playerPct > 0.5 ? 0x22cc44 : playerPct > 0.25 ? 0xD8C040 : 0xD84040;
    this.playerHPBar.fillStyle(playerColor, 1.0);
    this.playerHPBar.fillRoundedRect(
      this._pHPBarX, this._pHPBarY,
      Math.max(0, Math.round(this._pHPBarW * playerPct)), 12, 3
    );

    // "100 / 100" right-aligned below player bar
    this.playerHPText.setText(`${Math.max(0, this.playerHP)} / 100`);
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
    // Arrow key navigation
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
    this.questionText.setText(q.text);
    this.questionText.setVisible(true);
    this.statusText.setVisible(false);

    // Reset option button styles
    this.optionBgs.forEach((bg, i) => {
      bg.clear();
      const bx = this._btnAreaX;
      const by = this._btnStartY + i * (this._btnH + this._btnGap);
      bg.fillStyle(0xFFFFFF, 1.0);
      bg.fillRoundedRect(bx, by, this._btnW, this._btnH, 8);
      bg.lineStyle(2, 0x333333, 1.0);
      bg.strokeRoundedRect(bx, by, this._btnW, this._btnH, 8);
    });

    // Set answer text: "1  Answer text" format
    q.options.forEach((opt, i) => {
      this.optionTexts[i].setText(`${i + 1}  ${opt}`);
    });

    // Update Q counter
    const prog = this.children.list.find(
      (c) => c instanceof Phaser.GameObjects.Text && (c as Phaser.GameObjects.Text).name === 'progress'
    ) as Phaser.GameObjects.Text | undefined;
    if (prog) prog.setText(`Q${this.currentQ + 1}/${this.questions.length}`);

    this.waitingForNext = false;
  }

  private highlightOption(index: number, correct: boolean) {
    this.optionBgs.forEach((bg, i) => {
      bg.clear();
      const bx = this._btnAreaX;
      const by = this._btnStartY + i * (this._btnH + this._btnGap);

      let fillColor = 0xFFFFFF;
      let strokeColor = 0x333333;

      if (i === this.questions[this.currentQ].correct) {
        // Correct answer: green
        fillColor = 0x1A5C1A;
        strokeColor = 0x40DD40;
      } else if (i === index && !correct) {
        // Wrong selection: red
        fillColor = 0x5C1A1A;
        strokeColor = 0xDD4040;
      } else if (i === index && correct) {
        // Selected correct: yellow highlight (LennyRPG style)
        fillColor = 0xFFD700;
        strokeColor = 0x000000;
      }

      bg.fillStyle(fillColor, 1.0);
      bg.fillRoundedRect(bx, by, this._btnW, this._btnH, 8);
      bg.lineStyle(2, strokeColor, 1.0);
      bg.strokeRoundedRect(bx, by, this._btnW, this._btnH, 8);
    });
  }

  private answerQuestion(index: number) {
    if (this.waitingForNext || this.battleOver) return;

    const q = this.questions[this.currentQ];
    const correct = index === q.correct;

    this.highlightOption(index, correct);

    if (correct) {
      this.guestHP -= 20;
      this.updateHPBars();
      this.statusText.setText('✓ Correct!\nGuest HP -20');
      this.statusText.setStyle({ ...this.statusText.style, color: '#00aa00' });
      this.statusText.setVisible(true);
      this.questionText.setVisible(false);
    } else {
      this.playerHP -= 20;
      this.updateHPBars();
      this.statusText.setText('✗ Wrong!\nPlayer HP -20');
      this.statusText.setStyle({ ...this.statusText.style, color: '#FF4040' });
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

    this.add.text(W / 2, menuY + 80, 'Press SPACE to return', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
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

    const blackout = this.add.graphics().setDepth(1000);
    blackout.fillStyle(0x000000, 0);
    blackout.fillRect(0, 0, W, H);

    this.tweens.add({
      targets: blackout,
      alpha: 1,
      duration: 800,
      onComplete: () => {
        this.add.text(W / 2, H / 2 - 30, 'You blacked out!', {
          fontFamily: '"Press Start 2P"',
          fontSize: '14px',
          color: '#FFFFFF',
          resolution: 2,
        }).setOrigin(0.5).setDepth(1001);

        this.add.text(W / 2, H / 2 + 20, 'Press SPACE to return', {
          fontFamily: '"Press Start 2P"',
          fontSize: '12px',
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

  private navigateOption(dir: number) {
    if (this.waitingForNext || this.battleOver) return;
    this.selectedOption = (this.selectedOption + dir + 4) % 4;
    this.highlightSelected(this.selectedOption);
  }

  private highlightSelected(idx: number) {
    this.optionBgs.forEach((bg, i) => {
      bg.clear();
      const bx = this._btnAreaX;
      const by = this._btnStartY + i * (this._btnH + this._btnGap);
      if (i === idx) {
        bg.fillStyle(0xFFD700, 1.0);
        bg.fillRoundedRect(bx, by, this._btnW, this._btnH, 8);
        bg.lineStyle(3, 0x000000, 1.0);
        bg.strokeRoundedRect(bx, by, this._btnW, this._btnH, 8);
      } else {
        bg.fillStyle(0xFFFFFF, 1.0);
        bg.fillRoundedRect(bx, by, this._btnW, this._btnH, 8);
        bg.lineStyle(2, 0x333333, 1.0);
        bg.strokeRoundedRect(bx, by, this._btnW, this._btnH, 8);
      }
    });
    // Update text color for selected
    this.optionTexts.forEach((t, i) => {
      t.setColor(i === idx ? '#000000' : '#222222');
    });
  }

  update() {
    if (this.battleOver || this.waitingForNext) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.one)) this.answerQuestion(0);
    else if (Phaser.Input.Keyboard.JustDown(this.keys.two)) this.answerQuestion(1);
    else if (Phaser.Input.Keyboard.JustDown(this.keys.three)) this.answerQuestion(2);
    else if (Phaser.Input.Keyboard.JustDown(this.keys.four)) this.answerQuestion(3);
  }
}
