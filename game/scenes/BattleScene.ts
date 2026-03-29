import * as Phaser from 'phaser';
import { Guest, Question } from '../data/guests';
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

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    this.drawBattleBG(W, H);

    // Sprite positions — computed from W and H (same formula as drawBattleBG)
    const battleH = H * 0.7;
    const guestX = W * 0.68;
    const guestY = battleH * 0.44;  // guest platform Y
    const playerX = W * 0.30;
    const playerY = battleH * 0.62; // player platform Y

    // Guest sprite - upper RIGHT platform
    const guestFileNames = [
      'marc-andreessen','ben-horowitz','jensen-huang','lisa-su','alexandr-wang',
      'sam-altman','satya-nadella','brian-chesky','patrick-collison','dario-amodei',
      'chris-dixon','sarah-guo','elad-gil','andrew-chen','sonal-chokshi',
      'david-george','wade-foster','tomer-london','balaji-srinivasan','naval-ravikant',
      'reid-hoffman','steve-wozniak','nicole-brichtova','tomer-cohen','alex-karp'
    ];
    const gIdx = guestFileNames.indexOf(this.guest.id);
    const guestTexKey = gIdx >= 0 && this.textures.exists(`npc_ai_${gIdx}`) ? `npc_ai_${gIdx}` : null;
    console.log('[Battle] guest id:', this.guest.id, 'idx:', gIdx, 'key:', guestTexKey, 'pos:', guestX, guestY);
    
    if (guestTexKey) {
      this.guestSprite = this.add.image(guestX, guestY, guestTexKey)
        .setDisplaySize(100, 130)
        .setOrigin(0.5, 1.0)  // anchor at feet — stands ON platform
        .setDepth(5);
    }
    
    // Player sprite - lower LEFT platform, facing RIGHT toward guest
    if (this.textures.exists('player_ai')) {
      this.playerSprite = this.add.image(playerX, playerY, 'player_ai')
        .setDisplaySize(80, 110)
        .setFlipX(true)   // flip so player faces RIGHT toward guest
        .setOrigin(0.5, 1.0)
        .setDepth(5);
    }

    this.createBattleUI(W, H);
    this.setupKeys();
    this.showQuestion();
  }

  private drawBattleBG(W: number, H: number) {
    const bg = this.add.graphics();
    const battleH = H * 0.7; // UI takes bottom 30%

    // ── Sky (top 60% of battle area) — D/P pale blue-gray ──
    bg.fillStyle(0xB8D0E8);
    bg.fillRect(0, 0, W, battleH * 0.6);

    // Sky gradient layers (simulate depth)
    bg.fillStyle(0xC8DCF0);
    bg.fillRect(0, 0, W, battleH * 0.2);
    bg.fillStyle(0xA8C4DC);
    bg.fillRect(0, battleH * 0.4, W, battleH * 0.2);

    // ── Ground (bottom 40% of battle area) — D/P grass ground ──
    bg.fillStyle(0x8AD060);
    bg.fillRect(0, battleH * 0.6, W, battleH * 0.4);

    // Ground texture lines
    bg.lineStyle(1, 0x70B848, 0.5);
    for (let i = 0; i < 6; i++) {
      const ly = battleH * 0.62 + i * 8;
      bg.lineBetween(0, ly, W, ly);
    }

    // Horizon line
    bg.fillStyle(0x60A838);
    bg.fillRect(0, battleH * 0.6, W, 4);

    // ── D/P-style raised platforms (NOT flat ellipses) ──

    // Guest platform (upper-right): raised dirt/tan platform
    const gpX = W * 0.68;
    const gpY = battleH * 0.44;
    // Platform body (slightly raised above ground)
    bg.fillStyle(0xE8D890);
    bg.fillEllipse(gpX, gpY, 160, 28);
    // Platform edge shadow
    bg.fillStyle(0xC8B870);
    bg.fillEllipse(gpX, gpY + 6, 155, 18);
    // Platform highlight
    bg.fillStyle(0xF0E0A0);
    bg.fillEllipse(gpX - 10, gpY - 4, 100, 12);
    // D/P style platform edge lines
    bg.lineStyle(2, 0xA89850, 1);
    bg.strokeEllipse(gpX, gpY, 160, 28);

    // Player platform (lower-left)
    const ppX = W * 0.30;
    const ppY = battleH * 0.62;
    bg.fillStyle(0xE8D890);
    bg.fillEllipse(ppX, ppY, 190, 32);
    bg.fillStyle(0xC8B870);
    bg.fillEllipse(ppX, ppY + 8, 183, 20);
    bg.fillStyle(0xF0E0A0);
    bg.fillEllipse(ppX - 10, ppY - 5, 120, 14);
    bg.lineStyle(2, 0xA89850, 1);
    bg.strokeEllipse(ppX, ppY, 190, 32);

    // ── Draw guest AI sprite on platform ──
    // (sprites are added after bg in create(), stored as instance vars)
    this._gpX = gpX; this._gpY = gpY;
    this._ppX = ppX; this._ppY = ppY;
  }

  private drawBattleCharacter(g: Phaser.GameObjects.Graphics, x: number, y: number, color: number, large: boolean) {
    const scale = large ? 1.8 : 1;
    const s = (n: number) => n * scale;

    // Body
    g.fillStyle(color);
    g.fillRect(x - s(14), y - s(16), s(28), s(24));

    // Head
    g.fillStyle(0xF0C890);
    g.fillRect(x - s(12), y - s(34), s(24), s(20));

    // Hair
    g.fillStyle(0x303030);
    g.fillRect(x - s(12), y - s(38), s(24), s(10));

    // Eyes
    g.fillStyle(0x202020);
    g.fillRect(x - s(7), y - s(26), s(5), s(5));
    g.fillRect(x + s(2), y - s(26), s(5), s(5));

    // Legs
    g.fillStyle(0x202040);
    g.fillRect(x - s(12), y + s(6), s(10), s(16));
    g.fillRect(x + s(2), y + s(6), s(10), s(16));

    // Arms
    g.fillStyle(0xF0C890);
    g.fillRect(x - s(22), y - s(14), s(8), s(18));
    g.fillRect(x + s(14), y - s(14), s(8), s(18));
  }

  private drawPlayerBack(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    // Player back view (smaller, facing away)
    g.fillStyle(0x3050C0); // Blue jacket
    g.fillRect(x - 14, y - 18, 28, 22);

    g.fillStyle(0x603010); // Hair
    g.fillRect(x - 12, y - 36, 24, 20);

    g.fillStyle(0x202040); // Dark pants
    g.fillRect(x - 12, y + 4, 10, 18);
    g.fillRect(x + 2, y + 4, 10, 18);

    g.fillStyle(0x3050C0); // Arms
    g.fillRect(x - 20, y - 16, 6, 16);
    g.fillRect(x + 14, y - 16, 6, 16);
  }

  private createBattleUI(W: number, H: number) {
    const battleAreaH = H * 0.7;

    // === Guest HP Panel (top-left) ===
    const guestPanel = this.add.graphics();
    guestPanel.fillStyle(0xF0F0F0, 0.97);
    guestPanel.fillRoundedRect(10, 10, 280, 72, 8);
    guestPanel.lineStyle(2, 0x303030);
    guestPanel.strokeRoundedRect(10, 10, 280, 72, 8);

    this.add.text(20, 18, this.guest.name, {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: '#1a1a2e',
      resolution: 2,
    });

    this.add.text(20, 32, this.guest.title, {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: '#4a4a6e',
      resolution: 2,
    });

    // Guest HP label
    this.add.text(20, 44, 'HP', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#606060',
      resolution: 2,
    });

    const guestHPBg = this.add.graphics();
    guestHPBg.fillStyle(0x404040);
    guestHPBg.fillRect(40, 46, 140, 12);

    this.guestHPBar = this.add.graphics();
    this.guestHPText = this.add.text(240, 48, '100/100', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#303030',
      resolution: 2,
    });

    // === Player HP Panel (bottom-right above battle menu) ===
    const playerPanel = this.add.graphics();
    playerPanel.fillStyle(0xF0F0F0, 0.97);
    playerPanel.fillRoundedRect(W - 240, battleAreaH - 70, 230, 64, 8);
    playerPanel.lineStyle(2, 0x303030);
    playerPanel.strokeRoundedRect(W - 240, battleAreaH - 70, 230, 64, 8);

    this.add.text(W - 230, battleAreaH - 62, 'PLAYER', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#1a1a2e',
      resolution: 2,
    });

    this.add.text(W - 230, battleAreaH - 48, 'HP', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#606060',
      resolution: 2,
    });

    const playerHPBg = this.add.graphics();
    playerHPBg.fillStyle(0x404040);
    playerHPBg.fillRect(W - 210, battleAreaH - 46, 140, 12);

    this.playerHPBar = this.add.graphics();
    this.playerHPText = this.add.text(W - 60, battleAreaH - 50, '100/100', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#303030',
      resolution: 2,
    });

    this.updateHPBars(W, battleAreaH);

    // === Battle Menu / Question area ===
    const menuY = battleAreaH + 4;
    const menuH = H - menuY - 4;

    const menuBg = this.add.graphics();
    menuBg.fillStyle(0xF0F0F0, 0.98);
    menuBg.fillRoundedRect(4, menuY, W - 8, menuH, 8);
    menuBg.lineStyle(3, 0x303030);
    menuBg.strokeRoundedRect(4, menuY, W - 8, menuH, 8);

    // Question text
    this.questionText = this.add.text(16, menuY + 10, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#1a1a2e',
      resolution: 2,
      wordWrap: { width: W - 40 },
    });

    // Answer options
    const optionY = menuY + 50;
    const optW = (W - 24) / 2 - 6;
    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const ox = 8 + col * (optW + 8);
      const oy = optionY + row * 36;

      const optBg = this.add.graphics();
      optBg.fillStyle(0xE0E8FF);
      optBg.fillRoundedRect(ox, oy, optW, 28, 6);
      optBg.lineStyle(2, 0x6080C0);
      optBg.strokeRoundedRect(ox, oy, optW, 28, 6);
      this.optionBgs.push(optBg);

      this.add.text(ox + 6, oy + 8, `${i + 1}.`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        color: '#4060A0',
        resolution: 2,
      });

      const optText = this.add.text(ox + 28, oy + 8, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '11px',
        color: '#1a1a2e',
        resolution: 2,
        wordWrap: { width: optW - 30 },
      });
      this.optionTexts.push(optText);
    }

    // Status text (feedback)
    this.statusText = this.add.text(W / 2, menuY + 10, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#C03028',
      resolution: 2,
      align: 'center',
      wordWrap: { width: W - 40 },
    });
    this.statusText.setOrigin(0.5, 0);
    this.statusText.setVisible(false);

    // Progress indicator
    this.add.text(W - 20, menuY + 12, `Q1/5`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#808080',
      resolution: 2,
    }).setOrigin(1, 0).setName('progress');
  }

  private updateHPBars(W: number, battleAreaH: number) {
    // Guest HP bar
    this.guestHPBar.clear();
    const guestPct = Math.max(0, this.guestHP) / 100;
    const guestColor = guestPct > 0.5 ? 0x40C840 : guestPct > 0.25 ? 0xC8C040 : 0xC84040;
    this.guestHPBar.fillStyle(guestColor);
    this.guestHPBar.fillRect(40, 46, Math.round(140 * guestPct), 12);
    this.guestHPText.setText(`${Math.max(0, this.guestHP)}/100`);

    // Player HP bar
    this.playerHPBar.clear();
    const playerPct = Math.max(0, this.playerHP) / 100;
    const playerColor = playerPct > 0.5 ? 0x40C840 : playerPct > 0.25 ? 0xC8C040 : 0xC84040;
    this.playerHPBar.fillStyle(playerColor);
    this.playerHPBar.fillRect(W - 210, battleAreaH - 46, Math.round(140 * playerPct), 12);
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

    // Reset option appearances
    this.optionBgs.forEach((bg, i) => {
      bg.clear();
      const W = this.cameras.main.width;
      const battleAreaH = this.cameras.main.height * 0.7;
      const menuY = battleAreaH + 4;
      const optW = (W - 24) / 2 - 6;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const ox = 8 + col * (optW + 8);
      const oy = menuY + 50 + row * 36;
      bg.fillStyle(0xE0E8FF);
      bg.fillRoundedRect(ox, oy, optW, 28, 6);
      bg.lineStyle(2, 0x6080C0);
      bg.strokeRoundedRect(ox, oy, optW, 28, 6);
    });

    q.options.forEach((opt, i) => {
      this.optionTexts[i].setText(opt);
    });

    // Update progress
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
    const optW = (W - 24) / 2 - 6;

    this.optionBgs.forEach((bg, i) => {
      bg.clear();
      const col = i % 2;
      const row = Math.floor(i / 2);
      const ox = 8 + col * (optW + 8);
      const oy = menuY + 50 + row * 36;

      let fillColor = 0xE0E8FF;
      let strokeColor = 0x6080C0;

      if (i === this.questions[this.currentQ].correct) {
        fillColor = 0x80FF80;
        strokeColor = 0x00A000;
      } else if (i === index && !correct) {
        fillColor = 0xFF8080;
        strokeColor = 0xC00000;
      }

      bg.fillStyle(fillColor);
      bg.fillRoundedRect(ox, oy, optW, 28, 6);
      bg.lineStyle(2, strokeColor);
      bg.strokeRoundedRect(ox, oy, optW, 28, 6);
    });
  }

  private answerQuestion(index: number) {
    if (this.waitingForNext || this.battleOver) return;

    const q = this.questions[this.currentQ];
    const correct = index === q.correct;

    this.highlightOption(index, correct);

    const W = this.cameras.main.width;

    if (correct) {
      // Reduce guest HP
      this.guestHP -= 20;
      const battleAreaH = this.cameras.main.height * 0.7;
      this.updateHPBars(W, battleAreaH);

      this.statusText.setText('✓ Correct! Guest HP -20');
      this.statusText.setStyle({ color: '#007000' });
      this.statusText.setVisible(true);
      this.questionText.setVisible(false);
    } else {
      // Reduce player HP
      this.playerHP -= 20;
      const battleAreaH = this.cameras.main.height * 0.7;
      this.updateHPBars(W, battleAreaH);

      this.statusText.setText(`✗ Wrong! Player HP -20`);
      this.statusText.setStyle({ color: '#C03028' });
      this.statusText.setVisible(true);
      this.questionText.setVisible(false);
    }

    this.waitingForNext = true;

    // Auto-advance after delay
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

    // Hide question UI
    this.questionText.setVisible(false);
    this.optionTexts.forEach(t => t.setVisible(false));
    this.optionBgs.forEach(bg => bg.clear());

    if (this.playerHP > 50) {
      // Victory!
      this.captureGuest();
      this.showVictory();
    } else {
      // Barely survived or lost too much HP
      this.showDefeat();
    }
  }

  private captureGuest() {
    // Save to localStorage (always, as fallback)
    const captured: string[] = JSON.parse(localStorage.getItem('a16z_captured') || '[]');
    if (!captured.includes(this.guest.id)) {
      captured.push(this.guest.id);
      localStorage.setItem('a16z_captured', JSON.stringify(captured));
    }

    // Save to Supabase (async, fire-and-forget)
    saveCapture(this.playerId, this.guest.id).catch((err) => {
      console.warn('Failed to save capture to Supabase:', err);
    });
  }

  private showVictory() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const battleAreaH = H * 0.7;
    const menuY = battleAreaH + 4;

    // Victory overlay on battle menu
    const victoryBg = this.add.graphics();
    victoryBg.fillStyle(0x003000, 0.95);
    victoryBg.fillRoundedRect(4, menuY, W - 8, H - menuY - 4, 8);

    const captured: string[] = JSON.parse(localStorage.getItem('a16z_captured') || '[]');
    const total = captured.length;

    this.add.text(W / 2, menuY + 20, '🎉 VICTORY!', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#FFD700',
      resolution: 2,
    }).setOrigin(0.5, 0);

    this.add.text(W / 2, menuY + 50, `${this.guest.name} captured!`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#FFFFFF',
      resolution: 2,
    }).setOrigin(0.5, 0);

    this.add.text(W / 2, menuY + 70, `Total: ${total}/10 captured`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#80FF80',
      resolution: 2,
    }).setOrigin(0.5, 0);

    // Pokéball animation
    const pb = this.add.image(W / 2, menuY + 100, 'pokeball');
    pb.setOrigin(0.5);
    pb.setScale(2);
    this.tweens.add({
      targets: pb,
      angle: 360,
      duration: 1500,
      repeat: 1,
      ease: 'Linear',
    });

    this.add.text(W / 2, menuY + 140, 'Press SPACE to continue', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#AAAAAA',
      resolution: 2,
    }).setOrigin(0.5, 0);

    this.time.delayedCall(500, () => {
      this.keys.space.on('down', () => {
        this.returnToWorld();
      });
    });
  }

  private showDefeat() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const battleAreaH = H * 0.7;
    const menuY = battleAreaH + 4;

    const defeatBg = this.add.graphics();
    defeatBg.fillStyle(0x200000, 0.95);
    defeatBg.fillRoundedRect(4, menuY, W - 8, H - menuY - 4, 8);

    this.add.text(W / 2, menuY + 25, 'You lost...', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#FF4040',
      resolution: 2,
    }).setOrigin(0.5, 0);

    this.add.text(W / 2, menuY + 55, 'Study harder and try again!', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#AAAAAA',
      resolution: 2,
    }).setOrigin(0.5, 0);

    this.add.text(W / 2, menuY + 90, 'Press SPACE to return', {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#AAAAAA',
      resolution: 2,
    }).setOrigin(0.5, 0);

    this.time.delayedCall(500, () => {
      this.keys.space.on('down', () => {
        this.returnToWorld();
      });
    });
  }

  private showBlackout() {
    this.battleOver = true;

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    // Flash to black
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
          this.keys.space.on('down', () => {
            this.returnToWorld();
          });
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
