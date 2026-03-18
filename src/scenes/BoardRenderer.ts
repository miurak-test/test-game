import Phaser from "phaser";
import type { BoardLayout, Tile } from "@/types";

/** Tile type to color mapping for board rendering */
const TILE_COLORS: Record<string, number> = {
  life: 0x5a8a5a,
  choice: 0xd4a35a,
  branch: 0xc85a5a,
  festival: 0x8a5aaa,
  rest: 0x5a7aaa,
  happening: 0xccc45a,
  romance: 0xc85a8a,
};

/** Tile type to emoji icon mapping */
const TILE_ICONS: Record<string, string> = {
  life: "\u{1f331}",
  choice: "\u2753",
  branch: "\u{1f500}",
  festival: "\u{1f389}",
  rest: "\u{1f4a4}",
  happening: "\u26a1",
  romance: "\u{1f495}",
};

/** Season background zone colors */
const SEASON_ZONE_COLORS: Record<string, number> = {
  spring: 0xff9eb1,
  summer: 0x7ec8e3,
  autumn: 0xffcb77,
  winter: 0xc8b6e2,
};

/** Season labels with emoji */
const SEASON_LABELS: Record<string, string> = {
  spring: "\u{1f338} \u6625",
  summer: "\u{1f33b} \u590f",
  autumn: "\u{1f342} \u79cb",
  winter: "\u2744\ufe0f \u51ac",
};

/** Season zone Y ranges for background rendering */
const SEASON_ZONES: Record<string, { y: number; h: number }> = {
  spring: { y: 40, h: 140 },
  summer: { y: 160, h: 140 },
  autumn: { y: 280, h: 140 },
  winter: { y: 400, h: 140 },
};

/** Route line colors for branch paths */
const ROUTE_LINE_COLORS: Record<string, number> = {
  farm: 0x5a8a5a,
  shop: 0xd4a35a,
  village: 0x8a5aaa,
};

const TILE_SIZE = 28;
const PLAYER_SIZE = 10;

export class BoardRenderer {
  private boardGraphics!: Phaser.GameObjects.Graphics;
  private boardTexts: Phaser.GameObjects.Text[] = [];
  private playerMarker!: Phaser.GameObjects.Graphics;

  constructor(
    private scene: Phaser.Scene,
    private layout: BoardLayout,
  ) {}

  create(): void {
    this.boardGraphics = this.scene.add.graphics();
    this.drawBoard();

    this.playerMarker = this.scene.add.graphics();
    this.drawPlayerMarker(0);
    this.setupPlayerPulse();
  }

  updatePlayerPosition(tileIndex: number): void {
    this.drawPlayerMarker(tileIndex);
  }

  private drawBoard(): void {
    this.boardGraphics.clear();

    // Clean up previous board texts
    for (const txt of this.boardTexts) {
      txt.destroy();
    }
    this.boardTexts = [];

    const tiles = this.layout.tiles;

    // (a) Season background zones
    for (const season of ["spring", "summer", "autumn", "winter"] as const) {
      const zone = SEASON_ZONES[season];
      const zoneColor = SEASON_ZONE_COLORS[season];
      this.boardGraphics.fillStyle(zoneColor, 0.25);
      this.boardGraphics.fillRoundedRect(10, zone.y, 800 - 20, zone.h, 8);

      // Season label
      const label = this.scene.add
        .text(18, zone.y + 4, SEASON_LABELS[season], {
          fontSize: "10px",
          fontFamily: '"DotGothic16", monospace',
          color: "#f5e6d3",
        })
        .setDepth(5);
      this.boardTexts.push(label);
    }

    // (b) Connection lines

    // Define main-path connections per season
    // Spring: left->right
    const springMainPath = ["sp-life-1", "sp-romance", "sp-branch"];
    const springRoutes = {
      farm: ["sp-branch", "sp-farm-1", "sp-farm-2", "sp-festival"],
      shop: ["sp-branch", "sp-shop-1", "sp-shop-2", "sp-festival"],
      village: ["sp-branch", "sp-village-1", "sp-village-2", "sp-festival"],
    };

    // Summer: right->left
    const summerMainPath = ["su-life-1", "su-happening", "su-branch"];
    const summerRoutes = {
      farm: ["su-branch", "su-farm-1", "su-farm-2", "su-festival"],
      shop: ["su-branch", "su-shop-1", "su-shop-2", "su-festival"],
      village: ["su-branch", "su-village-1", "su-village-2", "su-festival"],
    };

    // Autumn: left->right
    const autumnMainPath = ["au-life-1", "au-choice", "au-branch"];
    const autumnRoutes = {
      farm: ["au-branch", "au-farm-1", "au-farm-2", "au-festival"],
      shop: ["au-branch", "au-shop-1", "au-shop-2", "au-festival"],
      village: ["au-branch", "au-village-1", "au-village-2", "au-festival"],
    };

    // Winter: right->left
    const winterMainPath = ["wi-life-1", "wi-romance", "wi-branch"];
    const winterRoutes = {
      farm: ["wi-branch", "wi-farm-1", "wi-farm-2", "wi-festival"],
      shop: ["wi-branch", "wi-shop-1", "wi-shop-2", "wi-festival"],
      village: ["wi-branch", "wi-village-1", "wi-village-2", "wi-festival"],
    };

    // Cross-season connections (dotted lines)
    const crossSeasonLinks: [string, string][] = [
      ["sp-festival", "su-life-1"],
      ["su-festival", "au-life-1"],
      ["au-festival", "wi-life-1"],
    ];

    const tileMap = new Map(tiles.map((t) => [t.id, t]));

    // Helper to draw a path of connected tiles
    const drawPath = (
      path: string[],
      lineWidth: number,
      color: number,
      alpha: number,
    ) => {
      for (let i = 0; i < path.length - 1; i++) {
        const from = tileMap.get(path[i]);
        const to = tileMap.get(path[i + 1]);
        if (!from || !to) continue;
        this.boardGraphics.lineStyle(lineWidth, color, alpha);
        this.boardGraphics.lineBetween(
          from.position.x,
          from.position.y,
          to.position.x,
          to.position.y,
        );
      }
    };

    // Draw main paths (white, thick)
    drawPath(springMainPath, 3, 0xffffff, 0.7);
    drawPath(summerMainPath, 3, 0xffffff, 0.7);
    drawPath(autumnMainPath, 3, 0xffffff, 0.7);
    drawPath(winterMainPath, 3, 0xffffff, 0.7);

    // Draw branch routes (colored, thinner)
    const allRoutes = [springRoutes, summerRoutes, autumnRoutes, winterRoutes];
    for (const seasonRoutes of allRoutes) {
      for (const [route, path] of Object.entries(seasonRoutes)) {
        const routeColor = ROUTE_LINE_COLORS[route] ?? 0xffffff;
        drawPath(path, 2, routeColor, 0.5);
      }
    }

    // Draw cross-season connections (dashed look via dotted segments)
    for (const [fromId, toId] of crossSeasonLinks) {
      const from = tileMap.get(fromId);
      const to = tileMap.get(toId);
      if (!from || !to) continue;

      // Draw dashed line with segments
      const segments = 8;
      const dx = to.position.x - from.position.x;
      const dy = to.position.y - from.position.y;
      for (let s = 0; s < segments; s += 2) {
        const sx = from.position.x + (dx * s) / segments;
        const sy = from.position.y + (dy * s) / segments;
        const ex = from.position.x + (dx * (s + 1)) / segments;
        const ey = from.position.y + (dy * (s + 1)) / segments;
        this.boardGraphics.lineStyle(2, 0xffffff, 0.3);
        this.boardGraphics.lineBetween(sx, sy, ex, ey);
      }
    }

    // (c) Draw tiles
    for (const tile of tiles) {
      const x = tile.position.x;
      const y = tile.position.y;
      const color = TILE_COLORS[tile.type] ?? 0xaaaaaa;

      // Shadow (offset slightly down-right)
      this.boardGraphics.fillStyle(0x000000, 0.25);
      this.boardGraphics.fillRoundedRect(
        x - TILE_SIZE + 2,
        y - TILE_SIZE + 2,
        TILE_SIZE * 2,
        TILE_SIZE * 2,
        5,
      );

      // Tile background
      this.boardGraphics.fillStyle(color, 0.85);
      this.boardGraphics.fillRoundedRect(
        x - TILE_SIZE,
        y - TILE_SIZE,
        TILE_SIZE * 2,
        TILE_SIZE * 2,
        5,
      );

      // Tile border
      this.boardGraphics.lineStyle(1, 0xffffff, 0.4);
      this.boardGraphics.strokeRoundedRect(
        x - TILE_SIZE,
        y - TILE_SIZE,
        TILE_SIZE * 2,
        TILE_SIZE * 2,
        5,
      );

      // Tile icon
      const icon = TILE_ICONS[tile.type] ?? "";
      if (icon) {
        const iconText = this.scene.add
          .text(x, y, icon, {
            fontSize: "16px",
          })
          .setOrigin(0.5)
          .setDepth(10);
        this.boardTexts.push(iconText);
      }
    }

    // (d) START / GOAL markers
    const firstTile = tiles[0];
    const lastTile = tiles[tiles.length - 1];

    if (firstTile) {
      const startText = this.scene.add
        .text(firstTile.position.x - TILE_SIZE - 4, firstTile.position.y, "START", {
          fontSize: "10px",
          fontFamily: '"DotGothic16", monospace',
          color: "#ffe66d",
          fontStyle: "bold",
        })
        .setOrigin(1, 0.5)
        .setDepth(10);
      this.boardTexts.push(startText);
    }

    if (lastTile) {
      const goalText = this.scene.add
        .text(lastTile.position.x - TILE_SIZE - 4, lastTile.position.y, "GOAL", {
          fontSize: "10px",
          fontFamily: '"DotGothic16", monospace',
          color: "#ffe66d",
          fontStyle: "bold",
        })
        .setOrigin(1, 0.5)
        .setDepth(10);
      this.boardTexts.push(goalText);
    }
  }

  private drawPlayerMarker(tileIndex: number): void {
    this.playerMarker.clear();
    const tiles = this.layout.tiles;
    const currentTile = tiles[tileIndex];
    if (!currentTile) return;

    const x = currentTile.position.x;
    const y = currentTile.position.y;

    this.playerMarker.fillStyle(0xffffff, 1);
    this.playerMarker.fillCircle(x, y, PLAYER_SIZE);
    this.playerMarker.lineStyle(2, 0x000000, 1);
    this.playerMarker.strokeCircle(x, y, PLAYER_SIZE);
    this.playerMarker.setDepth(20);
  }

  /** Set up pulse animation for the player marker (called once in create) */
  private setupPlayerPulse(): void {
    this.scene.tweens.add({
      targets: this.playerMarker,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
