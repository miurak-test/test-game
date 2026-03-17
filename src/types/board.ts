export type Season = "spring" | "summer" | "autumn" | "winter";
export type TileType =
  | "life"
  | "choice"
  | "branch"
  | "festival"
  | "rest"
  | "happening"
  | "romance";
export type BranchRoute = "farm" | "shop" | "village";

export interface Tile {
  id: string;
  index: number;
  season: Season;
  type: TileType;
  route?: BranchRoute;
  position: { x: number; y: number };
  eventPool?: string[];
}

export interface BoardLayout {
  tiles: Tile[];
  branchPoints: Record<Season, { tileId: string; routes: BranchRoute[] }>;
  mergePoints: Record<Season, string>;
  seasonRanges: Record<Season, { start: number; end: number }>;
}
