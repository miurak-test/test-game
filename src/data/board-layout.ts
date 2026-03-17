import type { Tile, BoardLayout, Season, TileType, BranchRoute } from "@/types";

/**
 * Short mode board layout (1 year / 4 seasons / ~20 main-path tiles)
 *
 * Serpentine (sugoroku-style) layout for 800x600 screen:
 *   Spring: left → right
 *   Summer: right → left (fold back)
 *   Autumn: left → right
 *   Winter: right → left (fold back) → GOAL
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
  // --- Spring (y: 80-170, left → right) ---
  { id: "sp-life-1", season: "spring", type: "life", x: 60, y: 80 },
  { id: "sp-romance", season: "spring", type: "romance", x: 160, y: 80 },
  { id: "sp-branch", season: "spring", type: "branch", x: 260, y: 80 },
  // farm route (top row)
  { id: "sp-farm-1", season: "spring", type: "life", route: "farm", x: 360, y: 55 },
  { id: "sp-farm-2", season: "spring", type: "choice", route: "farm", x: 460, y: 55 },
  // shop route (middle row)
  { id: "sp-shop-1", season: "spring", type: "life", route: "shop", x: 360, y: 105 },
  { id: "sp-shop-2", season: "spring", type: "choice", route: "shop", x: 460, y: 105 },
  // village route (bottom row)
  { id: "sp-village-1", season: "spring", type: "life", route: "village", x: 360, y: 155 },
  { id: "sp-village-2", season: "spring", type: "choice", route: "village", x: 460, y: 155 },
  // merge
  { id: "sp-festival", season: "spring", type: "festival", x: 560, y: 80 },

  // --- Summer (y: 200-290, right → left, fold back) ---
  { id: "su-life-1", season: "summer", type: "life", x: 560, y: 200 },
  { id: "su-happening", season: "summer", type: "happening", x: 460, y: 200 },
  { id: "su-branch", season: "summer", type: "branch", x: 360, y: 200 },
  // farm route (top row)
  { id: "su-farm-1", season: "summer", type: "life", route: "farm", x: 260, y: 175 },
  { id: "su-farm-2", season: "summer", type: "rest", route: "farm", x: 160, y: 175 },
  // shop route (middle row)
  { id: "su-shop-1", season: "summer", type: "life", route: "shop", x: 260, y: 225 },
  { id: "su-shop-2", season: "summer", type: "choice", route: "shop", x: 160, y: 225 },
  // village route (bottom row)
  { id: "su-village-1", season: "summer", type: "life", route: "village", x: 260, y: 275 },
  { id: "su-village-2", season: "summer", type: "romance", route: "village", x: 160, y: 275 },
  // merge
  { id: "su-festival", season: "summer", type: "festival", x: 60, y: 200 },

  // --- Autumn (y: 320-410, left → right) ---
  { id: "au-life-1", season: "autumn", type: "life", x: 60, y: 320 },
  { id: "au-choice", season: "autumn", type: "choice", x: 160, y: 320 },
  { id: "au-branch", season: "autumn", type: "branch", x: 260, y: 320 },
  // farm route (top row)
  { id: "au-farm-1", season: "autumn", type: "life", route: "farm", x: 360, y: 295 },
  { id: "au-farm-2", season: "autumn", type: "life", route: "farm", x: 460, y: 295 },
  // shop route (middle row)
  { id: "au-shop-1", season: "autumn", type: "life", route: "shop", x: 360, y: 345 },
  { id: "au-shop-2", season: "autumn", type: "happening", route: "shop", x: 460, y: 345 },
  // village route (bottom row)
  { id: "au-village-1", season: "autumn", type: "life", route: "village", x: 360, y: 395 },
  { id: "au-village-2", season: "autumn", type: "choice", route: "village", x: 460, y: 395 },
  // merge
  { id: "au-festival", season: "autumn", type: "festival", x: 560, y: 320 },

  // --- Winter (y: 440-520, right → left, fold back) ---
  { id: "wi-life-1", season: "winter", type: "life", x: 560, y: 440 },
  { id: "wi-romance", season: "winter", type: "romance", x: 460, y: 440 },
  { id: "wi-branch", season: "winter", type: "branch", x: 360, y: 440 },
  // farm route (top row)
  { id: "wi-farm-1", season: "winter", type: "rest", route: "farm", x: 260, y: 415 },
  { id: "wi-farm-2", season: "winter", type: "life", route: "farm", x: 160, y: 415 },
  // shop route (middle row)
  { id: "wi-shop-1", season: "winter", type: "life", route: "shop", x: 260, y: 465 },
  { id: "wi-shop-2", season: "winter", type: "choice", route: "shop", x: 160, y: 465 },
  // village route (bottom row)
  { id: "wi-village-1", season: "winter", type: "life", route: "village", x: 260, y: 515 },
  { id: "wi-village-2", season: "winter", type: "life", route: "village", x: 160, y: 515 },
  // merge (END / GOAL)
  { id: "wi-festival", season: "winter", type: "festival", x: 60, y: 440 },
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
