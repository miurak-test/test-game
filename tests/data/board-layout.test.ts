import { describe, it, expect } from "vitest";
import { SHORT_BOARD_LAYOUT } from "@/data/board-layout";
import type { Season } from "@/types";

describe("SHORT_BOARD_LAYOUT", () => {
  const layout = SHORT_BOARD_LAYOUT;
  const seasons: Season[] = ["spring", "summer", "autumn", "winter"];

  it("each season has exactly one branch tile", () => {
    for (const season of seasons) {
      const branchTiles = layout.tiles.filter(
        (t) => t.season === season && t.type === "branch",
      );
      expect(branchTiles).toHaveLength(1);
    }
  });

  it("each season has exactly one festival tile", () => {
    for (const season of seasons) {
      const festivalTiles = layout.tiles.filter(
        (t) => t.season === season && t.type === "festival",
      );
      expect(festivalTiles).toHaveLength(1);
    }
  });

  it("branch points reference valid tile IDs and merge points reference valid tile IDs", () => {
    const tileIds = new Set(layout.tiles.map((t) => t.id));

    for (const season of seasons) {
      const branchPoint = layout.branchPoints[season];
      expect(tileIds.has(branchPoint.tileId)).toBe(true);

      const mergePoint = layout.mergePoints[season];
      expect(tileIds.has(mergePoint)).toBe(true);
    }
  });

  it("winter has a final tile (festival)", () => {
    const winterFestival = layout.tiles.find(
      (t) => t.season === "winter" && t.type === "festival",
    );
    expect(winterFestival).toBeDefined();
    expect(winterFestival!.id).toBe("wi-festival");

    // It should be the last tile in the layout
    const lastTile = layout.tiles[layout.tiles.length - 1];
    expect(lastTile.id).toBe("wi-festival");
  });

  it("each route (farm/shop/village) has tiles in every season", () => {
    for (const season of seasons) {
      for (const route of ["farm", "shop", "village"] as const) {
        const routeTiles = layout.tiles.filter(
          (t) => t.season === season && t.route === route,
        );
        expect(routeTiles.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("tile indices are sequential starting from 0", () => {
    layout.tiles.forEach((tile, i) => {
      expect(tile.index).toBe(i);
    });
  });
});
