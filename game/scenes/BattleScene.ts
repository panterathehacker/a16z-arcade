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

  // HP bar positions (set by createBattleUI, used by updateHPBars)
  private _gHPBarX = 0; private _gHPBarY = 0; private _gHPBarW = 0;
  private _pHPBarX = 0; private _pHPBarY = 0; private _pHPBarW = 0;
  private _pHPNumX = 0; private _pHPNumY = 0;

  // Answer option layout (set by createBattleUI, used by showQuestion/highlightOption)
  private _btnAreaX = 0; private _btnStartY = 0;
  private _btnW = 0; private _btnH = 35; private _btnGap = 4;

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

    // Draw battle background (bg image + platforms) — sets _gpX/Y and _ppX/Y
    this.drawBattleBG(W, H);

    // Guest sprite — upper-right platform, anchored at feet
    const gIdx = GUESTS.findIndex(g => g.id === this.guest.id);
    const guestTexKey = gIdx >= 0 && this.textures.exists(`npc_ai_${gIdx}`) ? `npc_ai_${gIdx}` : null;
    console.log('[Battle] guest id:', this.guest.id, 'idx:', gIdx, 'key:', guestTexKey);

    if (guestTexKey) {
      this.guestSprite = this.add.image(this._gpX, this._gpY, guestTexKey)
        .setDisplaySize(130, 180)
        .setOrigin(0.5, 1.0)
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
  // drawBattleBG — bg image + oval platforms only
  // ─────────────────────────────────────────────
  private drawBattleBG(W: number, H: number) {
    const battleH = H * 0.65;

    // Draw outdoor battle background (meadow scene)
    this.cameras.main.setBackgroundColor('#000000');
    const bgG = this.add.graphics().setDepth(0);
    
    // Sky gradient layers (light blue top -> slightly warmer at horizon)
    bgG.fillStyle(0x87CEEB); bgG.fillRect(0, 0, W, battleH * 0.45);
    bgG.fillStyle(0x98D8F0); bgG.fillRect(0, 0, W, battleH * 0.15);
    bgG.fillStyle(0xB0E8F8); bgG.fillRect(0, 0, W, battleH * 0.05);
    bgG.fillStyle(0xA8DFF0); bgG.fillRect(0, battleH * 0.4, W, battleH * 0.08);
    
    // Distant hills/treeline (dark green silhouette)
    bgG.fillStyle(0x4A8A30);
    for (let i = 0; i < 8; i++) {
      const hx = (W / 7) * i;
      const hw = 160 + (i * 37) % 80;
      const hh = 60 + (i * 23) % 40;
      bgG.fillEllipse(hx, battleH * 0.47, hw, hh);
    }
    
    // Ground (bright green grass)
    bgG.fillStyle(0x5CB85C); bgG.fillRect(0, battleH * 0.44, W, battleH * 0.56);
    bgG.fillStyle(0x6CC86C); bgG.fillRect(0, battleH * 0.44, W, battleH * 0.08);
    
    // Ground texture — horizontal lighter bands
    bgG.fillStyle(0x70D070, 0.4);
    for (let y = battleH * 0.5; y < battleH; y += 18) {
      bgG.fillRect(0, y, W, 6);
    }
    
    // Scattered flowers (white/yellow dots)
    const flowerColors = [0xFFFFFF, 0xFFFF44, 0xFF88AA, 0xFFDD00];
    for (let i = 0; i < 30; i++) {
      const fx = (i * 137 + 40) % W;
      const fy = battleH * 0.52 + (i * 73) % (battleH * 0.45);
      bgG.fillStyle(flowerColors[i % 4]);
      bgG.fillCircle(fx, fy, 3);
    }

    const bg = this.add.graphics();
    bg.setDepth(1);

    // ── Guest platform (upper-right) ──
    const gpX = W * 0.70;
    const gpY = battleH * 0.52;

    bg.fillStyle(0x2A6010, 0.45);
    bg.fillEllipse(gpX + 4, gpY + 10, 200, 38);
    bg.fillStyle(0xD4B07A);
    bg.fillEllipse(gpX, gpY, 200, 34);
    bg.fillStyle(0xE8CB96);
    bg.fillEllipse(gpX - 8, gpY - 5, 140, 14);
    bg.lineStyle(2, 0x9A7840, 1.0);
    bg.strokeEllipse(gpX, gpY, 200, 34);

    // ── Player platform (lower-left) ──
    const ppX = W * 0.28;
    const ppY = battleH * 0.72;

    bg.fillStyle(0x2A6010, 0.45);
    bg.fillEllipse(ppX + 5, ppY + 12, 230, 44);
    bg.fillStyle(0xD4B07A);
    bg.fillEllipse(ppX, ppY, 230, 40);
    bg.fillStyle(0xE8CB96);
    bg.fillEllipse(ppX - 10, ppY - 6, 160, 16);
    bg.lineStyle(2, 0x9A7840, 1.0);
    bg.strokeEllipse(ppX, ppY, 230, 40);

    // Store platform centers for sprite positioning (feet on platform top)
    this._gpX = gpX;
    this._gpY = gpY - 17;
    this._ppX = ppX;
    this._ppY = ppY - 20;
  }

  // ─────────────────────────────────────────────
  // createBattleUI — HP panels + question/answers
  // ─────────────────────────────────────────────
  private createBattleUI(W: number, H: number) {
    const battleAreaH = H * 0.65;
    const PANEL_RADIUS = 10;

    // ── Guest HP Panel (upper-right, above guest sprite) ──
    const gPanelX = 14;
    const gPanelY = 14;
    const gPanelW = Math.min(320, W * 0.38);

    const gPanel = this.add.graphics();
    gPanel.fillStyle(0xFFFFFF, 0.97);
    gPanel.fillRoundedRect(gPanelX, gPanelY, gPanelW, 92, PANEL_RADIUS);
    gPanel.lineStyle(3, 0x181818);
    gPanel.strokeRoundedRect(gPanelX, gPanelY, gPanelW, 92, PANEL_RADIUS);
    gPanel.setDepth(10);

    // Guest name — bold, ALL CAPS
    this.add.text(gPanelX + 12, gPanelY + 10, this.guest.name.toUpperCase(), {
      fontFamily: '"Press Start 2P"',
      fontSize: '15px',
      color: '#1a1a2e',
      resolution: 2,
    }).setDepth(11);

    // "Lv5" badge (gray pill, top-right of panel)
    const gLvX = gPanelX + gPanelW - 50;
    const gLvY = gPanelY + 8;
    const gLvBadge = this.add.graphics();
    gLvBadge.fillStyle(0x888888);
    gLvBadge.fillRoundedRect(gLvX, gLvY, 38, 16, 6);
    gLvBadge.setDepth(11);
    this.add.text(gLvX + 5, gLvY + 2, 'Lv5', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#FFFFFF',
      resolution: 2,
    }).setDepth(12);

    // Guest title — small, gray
    this.add.text(gPanelX + 12, gPanelY + 30, this.guest.title.slice(0, 20), {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#666680',
      resolution: 2,
    }).setDepth(11);

    // "HP" label — red
    this.add.text(gPanelX + 12, gPanelY + 50, 'HP', {
      fontFamily: '"Press Start 2P"',
      fontSize: '13px',
      color: '#cc2222',
      resolution: 2,
    }).setDepth(11);

    // HP track (dark bg)
    const gHPTrackX = gPanelX + 46;
    const gHPTrackY = gPanelY + 50;
    const gHPTrackW = gPanelW - 60;
    const gHPTrack = this.add.graphics();
    gHPTrack.fillStyle(0x383838);
    gHPTrack.fillRoundedRect(gHPTrackX, gHPTrackY, gHPTrackW, 12, 4);
    gHPTrack.setDepth(11);

    // Store positions for updateHPBars
    this._gHPBarX = gHPTrackX;
    this._gHPBarY = gHPTrackY;
    this._gHPBarW = gHPTrackW;

    this.guestHPBar = this.add.graphics();
    this.guestHPBar.setDepth(12);

    // Guest HP text — hidden per spec (no number shown in guest box)
    this.guestHPText = this.add.text(gPanelX + gPanelW - 10, gPanelY + 66, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '13px',
      color: '#303050',
      resolution: 2,
    }).setOrigin(1, 0).setDepth(11).setVisible(false);

    // ── Player HP Panel (left side, near player sprite) ──
    const pPanelX = Math.min(280, W * 0.32);
    const pPanelY = H * 0.50;
    const pPanelW = 260;

    const pPanel = this.add.graphics();
    pPanel.fillStyle(0xFFFFFF, 0.97);
    pPanel.fillRoundedRect(pPanelX, pPanelY, pPanelW, 88, PANEL_RADIUS);
    pPanel.lineStyle(3, 0x181818);
    pPanel.strokeRoundedRect(pPanelX, pPanelY, pPanelW, 88, PANEL_RADIUS);
    pPanel.setDepth(10);

    // Trainer name — ALL CAPS
    const trainerName = (typeof localStorage !== 'undefined'
      ? localStorage.getItem('a16z_username') : null) || 'PLAYER';
    this.add.text(pPanelX + 12, pPanelY + 10, trainerName.toUpperCase().slice(0, 10), {
      fontFamily: '"Press Start 2P"',
      fontSize: '15px',
      color: '#1a1a2e',
      resolution: 2,
    }).setDepth(11);

    // "Lv1" badge
    const pLvX = pPanelX + pPanelW - 50;
    const pLvY = pPanelY + 8;
    const pLvBadge = this.add.graphics();
    pLvBadge.fillStyle(0x888888);
    pLvBadge.fillRoundedRect(pLvX, pLvY, 38, 16, 6);
    pLvBadge.setDepth(11);
    this.add.text(pLvX + 5, pLvY + 2, 'Lv1', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#FFFFFF',
      resolution: 2,
    }).setDepth(12);

    // "HP" label — red
    this.add.text(pPanelX + 12, pPanelY + 34, 'HP', {
      fontFamily: '"Press Start 2P"',
      fontSize: '13px',
      color: '#cc2222',
      resolution: 2,
    }).setDepth(11);

    // HP track
    const pHPTrackX = pPanelX + 46;
    const pHPTrackY = pPanelY + 34;
    const pHPTrackW = pPanelW - 58;
    const pHPTrack = this.add.graphics();
    pHPTrack.fillStyle(0x383838);
    pHPTrack.fillRoundedRect(pHPTrackX, pHPTrackY, pHPTrackW, 12, 4);
    pHPTrack.setDepth(11);

    // Store positions for updateHPBars
    this._pHPBarX = pHPTrackX;
    this._pHPBarY = pHPTrackY;
    this._pHPBarW = pHPTrackW;
    this._pHPNumX = pPanelX + pPanelW - 10;
    this._pHPNumY = pPanelY + 50;

    this.playerHPBar = this.add.graphics();
    this.playerHPBar.setDepth(12);

    // Player HP number — right-aligned below bar
    this.playerHPText = this.add.text(this._pHPNumX, this._pHPNumY, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '13px',
      color: '#303050',
      resolution: 2,
    }).setOrigin(1, 0).setDepth(11);

    // Initial render
    this.updateHPBars();

    // ── Battle menu (bottom 35%) — dark background ──
    const menuY = battleAreaH + 4;
    const menuH = H - menuY - 4;

    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x1a1a2e, 1.0);
    menuBg.fillRoundedRect(4, menuY, W - 8, menuH, 8);
    menuBg.lineStyle(2, 0x3a3a5e);
    menuBg.strokeRoundedRect(4, menuY, W - 8, menuH, 8);
    menuBg.setDepth(10);

    // ── Left panel: Q counter + difficulty badge + question text + hint ──
    const qPanelX = 14;
    const qPanelW = W * 0.5 - 22;

    // Q counter (top-left of question panel)
    this.add.text(qPanelX, menuY + 10, `Q${this.currentQ + 1}/${this.questions.length}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#8888AA',
      resolution: 2,
    }).setDepth(11).setName('progress');

    // EASY difficulty badge (yellow pill, next to Q counter)
    const easyBadgeX = qPanelX + 58;
    const easyBadge = this.add.graphics();
    easyBadge.fillStyle(0xFFD700);
    easyBadge.fillRoundedRect(easyBadgeX, menuY + 7, 46, 16, 5);
    easyBadge.setDepth(11);
    this.add.text(easyBadgeX + 5, menuY + 10, 'EASY', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#1a1a2e',
      resolution: 2,
    }).setDepth(12);

    // Question text — white pixel font, word-wrapped
    this.questionText = this.add.text(qPanelX, menuY + 32, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '15px',
      color: '#FFFFFF',
      resolution: 2,
      wordWrap: { width: qPanelW },
    }).setDepth(11);

    // Keyboard hint at bottom-left
    this.add.text(qPanelX, menuY + menuH - 18, '↑↓ ENTER', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#555577',
      resolution: 2,
    }).setDepth(11);

    // ── Right panel: 4 answer options as vertical list ──
    this._btnAreaX = W * 0.5 + 8;
    this._btnW = W * 0.5 - 18;
    this._btnH = 35;
    this._btnGap = 4;
    this._btnStartY = menuY + 8;

    for (let i = 0; i < 4; i++) {
      const bx = this._btnAreaX;
      const by = this._btnStartY + i * (this._btnH + this._btnGap);

      const optBg = this.add.graphics();
      optBg.fillStyle(0xFFFFFF);
      optBg.fillRoundedRect(bx, by, this._btnW, this._btnH, 6);
      optBg.lineStyle(2, 0x303050);
      optBg.strokeRoundedRect(bx, by, this._btnW, this._btnH, 6);
      optBg.setDepth(11);
      this.optionBgs.push(optBg);

      // Answer text (number + text, no period)
      const optText = this.add.text(bx + 10, by + 10, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '13px',
        color: '#1a1a2e',
        resolution: 2,
        wordWrap: { width: this._btnW - 20 },
      }).setDepth(12);
      this.optionTexts.push(optText);
    }

    // Status/feedback text — centered in question area
    this.statusText = this.add.text(W * 0.25, menuY + menuH * 0.5, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#FF6060',
      resolution: 2,
      align: 'center',
      wordWrap: { width: W * 0.5 - 20 },
    }).setOrigin(0.5, 0.5).setDepth(12).setVisible(false);
  }

  private updateHPBars() {
    // Guest HP bar
    this.guestHPBar.clear();
    const guestPct = Math.max(0, this.guestHP) / 100;
    const guestColor = guestPct > 0.5 ? 0x40D840 : guestPct > 0.25 ? 0xD8C040 : 0xD84040;
    this.guestHPBar.fillStyle(guestColor);
    this.guestHPBar.fillRoundedRect(this._gHPBarX, this._gHPBarY, Math.round(this._gHPBarW * guestPct), 12, 4);

    // Player HP bar
    this.playerHPBar.clear();
    const playerPct = Math.max(0, this.playerHP) / 100;
    const playerColor = playerPct > 0.5 ? 0x40D840 : playerPct > 0.25 ? 0xD8C040 : 0xD84040;
    this.playerHPBar.fillStyle(playerColor);
    this.playerHPBar.fillRoundedRect(this._pHPBarX, this._pHPBarY, Math.round(this._pHPBarW * playerPct), 12, 4);
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

    // Reset option button styles
    this.optionBgs.forEach((bg, i) => {
      bg.clear();
      const bx = this._btnAreaX;
      const by = this._btnStartY + i * (this._btnH + this._btnGap);
      bg.fillStyle(0xFFFFFF);
      bg.fillRoundedRect(bx, by, this._btnW, this._btnH, 6);
      bg.lineStyle(2, 0x303050);
      bg.strokeRoundedRect(bx, by, this._btnW, this._btnH, 6);
    });

    // Set answer text: "1 Answer text" format
    q.options.forEach((opt, i) => {
      this.optionTexts[i].setText(`${i + 1} ${opt}`);
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
      let strokeColor = 0x303050;

      if (i === this.questions[this.currentQ].correct) {
        fillColor = 0x1A5C1A;
        strokeColor = 0x40DD40;
      } else if (i === index && !correct) {
        fillColor = 0x5C1A1A;
        strokeColor = 0xDD4040;
      }

      bg.fillStyle(fillColor);
      bg.fillRoundedRect(bx, by, this._btnW, this._btnH, 6);
      bg.lineStyle(2, strokeColor);
      bg.strokeRoundedRect(bx, by, this._btnW, this._btnH, 6);
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
      this.statusText.setText('✓ Correct!  Guest HP -20');
      this.statusText.setStyle({ color: '#40EE40' });
      this.statusText.setVisible(true);
      this.questionText.setVisible(false);
    } else {
      this.playerHP -= 20;
      this.updateHPBars();
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
    const battleAreaH = H * 0.65;
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
      fontSize: '14px',
      color: '#FFFFFF',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    this.add.text(W / 2, menuY + 68, `Total: ${total}/25 captured`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
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
      fontSize: '14px',
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
    const battleAreaH = H * 0.65;
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
      fontSize: '14px',
      color: '#AAAAAA',
      resolution: 2,
    }).setOrigin(0.5, 0).setDepth(21);

    this.add.text(W / 2, menuY + 84, 'Press SPACE to return', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
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
          fontSize: '16px',
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
