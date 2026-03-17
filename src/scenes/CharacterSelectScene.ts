import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "@/constants";
import type { Gender, PlayerCharacter } from "@/types";

/** Preset names for selection when DOM input is unavailable */
const PRESET_NAMES = ["ハル", "ナツ", "アキ", "フユ"];

export class CharacterSelectScene extends Phaser.Scene {
  private selectedName: string = PRESET_NAMES[0];
  private selectedGender: Gender = "male";
  private nameTexts: Phaser.GameObjects.Text[] = [];
  private genderButtons: Phaser.GameObjects.Text[] = [];
  private genderBgGraphics: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: "CharacterSelectScene" });
  }

  create(): void {
    this.cameras.main.fadeIn(300);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x2b2b3a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // RPG window panel
    const panel = this.add.graphics();
    panel.fillStyle(0x4a4a68, 1);
    panel.fillRoundedRect(40, 20, GAME_WIDTH - 80, GAME_HEIGHT - 40, 4);
    // White border
    panel.lineStyle(2, 0xffffff, 0.8);
    panel.strokeRoundedRect(40, 20, GAME_WIDTH - 80, GAME_HEIGHT - 40, 4);
    // Drop shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(42, 22, GAME_WIDTH - 80, GAME_HEIGHT - 40, 4);
    shadow.setDepth(-1);

    // Title
    this.add
      .text(GAME_WIDTH / 2, 50, "キャラクター選択", {
        fontSize: "30px",
        fontFamily: '"DotGothic16", monospace',
        color: "#ffe66d",
      })
      .setOrigin(0.5);

    // Name selection section
    this.add
      .text(GAME_WIDTH / 2, 120, "名前をえらんでください", {
        fontSize: "20px",
        fontFamily: '"DotGothic16", monospace',
        color: "#f5e6d3",
      })
      .setOrigin(0.5);

    this.createNameSelection();

    // Gender selection section
    this.add
      .text(GAME_WIDTH / 2, 310, "せいべつをえらんでください", {
        fontSize: "20px",
        fontFamily: '"DotGothic16", monospace',
        color: "#f5e6d3",
      })
      .setOrigin(0.5);

    this.createGenderSelection();

    // Start adventure button (pixel style)
    const btnX = GAME_WIDTH / 2;
    const btnY = GAME_HEIGHT - 80;
    const btnW = 220;
    const btnH = 44;

    const btnGfx = this.add.graphics();
    this.drawPixelButton(btnGfx, btnX, btnY, btnW, btnH, 0x5a8a5a);

    const adventureButton = this.add
      .text(btnX, btnY, "冒険にでる！", {
        fontSize: "26px",
        fontFamily: '"DotGothic16", monospace',
        color: "#f5e6d3",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    adventureButton.on("pointerover", () => {
      btnGfx.clear();
      this.drawPixelButton(btnGfx, btnX, btnY, btnW, btnH, 0x7ab87a);
    });
    adventureButton.on("pointerout", () => {
      btnGfx.clear();
      this.drawPixelButton(btnGfx, btnX, btnY, btnW, btnH, 0x5a8a5a);
    });

    adventureButton.on("pointerdown", () => {
      const player: PlayerCharacter = {
        name: this.selectedName,
        gender: this.selectedGender,
        spriteKey: `player_${this.selectedGender}`,
      };

      this.cameras.main.fadeOut(300);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("GameScene", { player });
      });
    });
  }

  private drawPixelButton(
    gfx: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    w: number,
    h: number,
    fillColor: number,
  ): void {
    const x = cx - w / 2;
    const y = cy - h / 2;

    // Drop shadow
    gfx.fillStyle(0x1a1a2a, 0.8);
    gfx.fillRect(x + 2, y + 2, w, h);

    // Main fill
    gfx.fillStyle(fillColor, 1);
    gfx.fillRect(x, y, w, h);

    // White border
    gfx.lineStyle(2, 0xffffff, 0.8);
    gfx.strokeRect(x, y, w, h);
  }

  private createNameSelection(): void {
    const startX = GAME_WIDTH / 2 - ((PRESET_NAMES.length - 1) * 130) / 2;
    const y = 180;

    for (let i = 0; i < PRESET_NAMES.length; i++) {
      const name = PRESET_NAMES[i];
      const x = startX + i * 130;

      // Draw avatar placeholder (colored circle)
      const avatar = this.add.graphics();
      const colors = [0xff9eb1, 0x7ec8e3, 0xffcb77, 0xc8b6e2];
      avatar.fillStyle(colors[i], 1);
      avatar.fillCircle(x, y, 30);

      const nameText = this.add
        .text(x, y + 50, name, {
          fontSize: "20px",
          fontFamily: '"DotGothic16", monospace',
          color: i === 0 ? "#ffe66d" : "#f5e6d3",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      nameText.on("pointerdown", () => {
        this.selectedName = name;
        this.updateNameHighlight();
      });

      this.nameTexts.push(nameText);
    }
  }

  private updateNameHighlight(): void {
    for (let i = 0; i < this.nameTexts.length; i++) {
      const isSelected = PRESET_NAMES[i] === this.selectedName;
      this.nameTexts[i].setStyle({
        fontFamily: '"DotGothic16", monospace',
        color: isSelected ? "#ffe66d" : "#f5e6d3",
      });
    }
  }

  private createGenderSelection(): void {
    const genders: { label: string; value: Gender }[] = [
      { label: "男の子", value: "male" },
      { label: "女の子", value: "female" },
    ];

    const startX = GAME_WIDTH / 2 - 100;
    const y = 370;

    for (let i = 0; i < genders.length; i++) {
      const { label, value } = genders[i];
      const x = startX + i * 200;

      // Pixel button background
      const btnGfx = this.add.graphics();
      const isSelected = i === 0;
      this.drawGenderButton(btnGfx, x, y, isSelected);
      this.genderBgGraphics.push(btnGfx);

      const btn = this.add
        .text(x, y, label, {
          fontSize: "22px",
          fontFamily: '"DotGothic16", monospace',
          color: isSelected ? "#ffe66d" : "#f5e6d3",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      btn.on("pointerdown", () => {
        this.selectedGender = value;
        this.updateGenderHighlight();
      });

      this.genderButtons.push(btn);
    }
  }

  private drawGenderButton(
    gfx: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    isSelected: boolean,
  ): void {
    const w = 120;
    const h = 36;
    const x = cx - w / 2;
    const y = cy - h / 2;

    gfx.clear();
    gfx.fillStyle(isSelected ? 0x5a8a5a : 0x4a4a68, 1);
    gfx.fillRect(x, y, w, h);
    gfx.lineStyle(1, 0xffffff, 0.6);
    gfx.strokeRect(x, y, w, h);
  }

  private updateGenderHighlight(): void {
    const genders: Gender[] = ["male", "female"];
    for (let i = 0; i < this.genderButtons.length; i++) {
      const isSelected = genders[i] === this.selectedGender;
      this.genderButtons[i].setStyle({
        fontFamily: '"DotGothic16", monospace',
        color: isSelected ? "#ffe66d" : "#f5e6d3",
      });
      this.drawGenderButton(
        this.genderBgGraphics[i],
        this.genderButtons[i].x,
        this.genderButtons[i].y,
        isSelected,
      );
    }
  }
}
