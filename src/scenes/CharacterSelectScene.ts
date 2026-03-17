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

  constructor() {
    super({ key: "CharacterSelectScene" });
  }

  create(): void {
    this.cameras.main.fadeIn(300);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x2a4a3a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add
      .text(GAME_WIDTH / 2, 50, "キャラクター選択", {
        fontSize: "30px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Name selection section
    this.add
      .text(GAME_WIDTH / 2, 120, "名前をえらんでください", {
        fontSize: "20px",
        color: "#cccccc",
      })
      .setOrigin(0.5);

    this.createNameSelection();

    // Gender selection section
    this.add
      .text(GAME_WIDTH / 2, 310, "せいべつをえらんでください", {
        fontSize: "20px",
        color: "#cccccc",
      })
      .setOrigin(0.5);

    this.createGenderSelection();

    // Start adventure button
    const adventureButton = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 80, "冒険にでる！", {
        fontSize: "26px",
        color: "#ffffff",
        backgroundColor: "#7ec850",
        padding: { x: 28, y: 10 },
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    adventureButton.on("pointerover", () => {
      adventureButton.setStyle({ backgroundColor: "#8ed860" });
    });
    adventureButton.on("pointerout", () => {
      adventureButton.setStyle({ backgroundColor: "#7ec850" });
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

  private createNameSelection(): void {
    const startX = GAME_WIDTH / 2 - ((PRESET_NAMES.length - 1) * 130) / 2;
    const y = 180;

    for (let i = 0; i < PRESET_NAMES.length; i++) {
      const name = PRESET_NAMES[i];
      const x = startX + i * 130;

      // Draw avatar placeholder (colored circle)
      const avatar = this.add.graphics();
      const colors = [0xff9999, 0x99ccff, 0xffcc66, 0xcc99ff];
      avatar.fillStyle(colors[i], 1);
      avatar.fillCircle(x, y, 30);

      const nameText = this.add
        .text(x, y + 50, name, {
          fontSize: "20px",
          color: i === 0 ? "#ffdd44" : "#ffffff",
          fontStyle: i === 0 ? "bold" : "normal",
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
        color: isSelected ? "#ffdd44" : "#ffffff",
        fontStyle: isSelected ? "bold" : "normal",
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

      const btn = this.add
        .text(x, y, label, {
          fontSize: "22px",
          color: i === 0 ? "#ffdd44" : "#ffffff",
          backgroundColor: i === 0 ? "#555555" : "#333333",
          padding: { x: 24, y: 8 },
          fontStyle: i === 0 ? "bold" : "normal",
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

  private updateGenderHighlight(): void {
    const genders: Gender[] = ["male", "female"];
    for (let i = 0; i < this.genderButtons.length; i++) {
      const isSelected = genders[i] === this.selectedGender;
      this.genderButtons[i].setStyle({
        color: isSelected ? "#ffdd44" : "#ffffff",
        backgroundColor: isSelected ? "#555555" : "#333333",
        fontStyle: isSelected ? "bold" : "normal",
      });
    }
  }
}
