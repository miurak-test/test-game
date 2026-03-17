import type { Tile, BoardLayout, Season, TileType, BranchRoute } from "@/types";

/**
 * Short mode board layout (1 year / 4 seasons / ~20 main-path tiles)
 *
 * Each season structure:
 *   main1(life) -> main2(varies) -> branch -> [farm x2 / shop x2 / village x2] -> festival(merge)
 *
 * Player traverses 5-6 tiles per season depending on route choice.
 */

type TileDef = {
  id: string;
  season: Season;
  type: TileType;
  route?: BranchRoute;
  x: number;
  y: number;
};

function makeTile(def: TileDef, index: number): Tile {
  return {
    id: def.id,
    index,
    season: def.season,
    type: def.type,
    route: def.route,
    position: { x: def.x, y: def.y },
  };
}

const tileDefs: TileDef[] = [
  // --- Spring ---
  { id: "sp-life-1", season: "spring", type: "life", x: 50, y: 50 },
  { id: "sp-romance", season: "spring", type: "romance", x: 150, y: 50 },
  { id: "sp-branch", season: "spring", type: "branch", x: 250, y: 50 },
  // farm route
  { id: "sp-farm-1", season: "spring", type: "life", route: "farm", x: 250, y: 120 },
  { id: "sp-farm-2", season: "spring", type: "choice", route: "farm", x: 350, y: 120 },
  // shop route
  { id: "sp-shop-1", season: "spring", type: "life", route: "shop", x: 250, y: 190 },
  { id: "sp-shop-2", season: "spring", type: "choice", route: "shop", x: 350, y: 190 },
  // village route
  { id: "sp-village-1", season: "spring", type: "life", route: "village", x: 250, y: 260 },
  { id: "sp-village-2", season: "spring", type: "choice", route: "village", x: 350, y: 260 },
  // merge
  { id: "sp-festival", season: "spring", type: "festival", x: 450, y: 50 },

  // --- Summer ---
  { id: "su-life-1", season: "summer", type: "life", x: 50, y: 150 },
  { id: "su-happening", season: "summer", type: "happening", x: 150, y: 150 },
  { id: "su-branch", season: "summer", type: "branch", x: 250, y: 150 },
  // farm route
  { id: "su-farm-1", season: "summer", type: "life", route: "farm", x: 250, y: 220 },
  { id: "su-farm-2", season: "summer", type: "rest", route: "farm", x: 350, y: 220 },
  // shop route
  { id: "su-shop-1", season: "summer", type: "life", route: "shop", x: 250, y: 290 },
  { id: "su-shop-2", season: "summer", type: "choice", route: "shop", x: 350, y: 290 },
  // village route
  { id: "su-village-1", season: "summer", type: "life", route: "village", x: 250, y: 360 },
  { id: "su-village-2", season: "summer", type: "romance", route: "village", x: 350, y: 360 },
  // merge
  { id: "su-festival", season: "summer", type: "festival", x: 450, y: 150 },

  // --- Autumn ---
  { id: "au-life-1", season: "autumn", type: "life", x: 50, y: 300 },
  { id: "au-choice", season: "autumn", type: "choice", x: 150, y: 300 },
  { id: "au-branch", season: "autumn", type: "branch", x: 250, y: 300 },
  // farm route
  { id: "au-farm-1", season: "autumn", type: "life", route: "farm", x: 250, y: 370 },
  { id: "au-farm-2", season: "autumn", type: "life", route: "farm", x: 350, y: 370 },
  // shop route
  { id: "au-shop-1", season: "autumn", type: "life", route: "shop", x: 250, y: 440 },
  { id: "au-shop-2", season: "autumn", type: "happening", route: "shop", x: 350, y: 440 },
  // village route
  { id: "au-village-1", season: "autumn", type: "life", route: "village", x: 250, y: 510 },
  { id: "au-village-2", season: "autumn", type: "choice", route: "village", x: 350, y: 510 },
  // merge
  { id: "au-festival", season: "autumn", type: "festival", x: 450, y: 300 },

  // --- Winter ---
  { id: "wi-life-1", season: "winter", type: "life", x: 50, y: 450 },
  { id: "wi-romance", season: "winter", type: "romance", x: 150, y: 450 },
  { id: "wi-branch", season: "winter", type: "branch", x: 250, y: 450 },
  // farm route
  { id: "wi-farm-1", season: "winter", type: "rest", route: "farm", x: 250, y: 520 },
  { id: "wi-farm-2", season: "winter", type: "life", route: "farm", x: 350, y: 520 },
  // shop route
  { id: "wi-shop-1", season: "winter", type: "life", route: "shop", x: 250, y: 590 },
  { id: "wi-shop-2", season: "winter", type: "choice", route: "shop", x: 350, y: 590 },
  // village route
  { id: "wi-village-1", season: "winter", type: "life", route: "village", x: 250, y: 560 },
  { id: "wi-village-2", season: "winter", type: "life", route: "village", x: 350, y: 560 },
  // merge (END)
  { id: "wi-festival", season: "winter", type: "festival", x: 450, y: 450 },
];

const tiles: Tile[] = tileDefs.map((def, i) => makeTile(def, i));

export const SHORT_BOARD_LAYOUT: BoardLayout = {
  tiles,
  branchPoints: {
    spring: { tileId: "sp-branch", routes: ["farm", "shop", "village"] },
    summer: { tileId: "su-branch", routes: ["farm", "shop", "village"] },
    autumn: { tileId: "au-branch", routes: ["farm", "shop", "village"] },
    winter: { tileId: "wi-branch", routes: ["farm", "shop", "village"] },
  },
  mergePoints: {
    spring: "sp-festival",
    summer: "su-festival",
    autumn: "au-festival",
    winter: "wi-festival",
  },
  seasonRanges: {
    spring: { start: 0, end: 9 },
    summer: { start: 10, end: 19 },
    autumn: { start: 20, end: 29 },
    winter: { start: 30, end: 39 },
  },
};
