import type {
  Tile,
  BoardLayout,
  BranchRoute,
  Season,
} from "@/types";
import type { HappinessPillars } from "@/types";
import { ROUTE_BUFFS, ROUTE_SPECIAL } from "@/constants";

export class BoardSystem {
  private tileMap: Map<string, Tile>;

  constructor(private layout: BoardLayout) {
    this.tileMap = new Map(layout.tiles.map((t) => [t.id, t]));
  }

  /** Advance from current tile by a number of steps, optionally selecting a route at branch points */
  advance(
    currentTileId: string,
    steps: number,
    selectedRoute?: BranchRoute,
  ): Tile {
    const currentTile = this.getTileById(currentTileId);
    if (!currentTile) {
      throw new Error(`Tile not found: ${currentTileId}`);
    }

    let tile = currentTile;
    for (let i = 0; i < steps; i++) {
      tile = this.getNextTile(tile, selectedRoute);
    }
    return tile;
  }

  private getNextTile(current: Tile, selectedRoute?: BranchRoute): Tile {
    // If we're at a branch point, jump to the selected route's first tile
    if (current.type === "branch" && selectedRoute) {
      const routeTile = this.findFirstRouteTile(current.season, selectedRoute);
      if (routeTile) return routeTile;
    }

    // If current tile is on a route, check if next tile is still on the same route
    if (current.route) {
      const nextByIndex = this.layout.tiles[current.index + 1];
      if (nextByIndex && nextByIndex.route === current.route) {
        return nextByIndex;
      }
      // Route ended, go to merge point (festival)
      const mergeId = this.layout.mergePoints[current.season];
      const mergeTile = this.getTileById(mergeId);
      if (mergeTile) return mergeTile;
    }

    // Default: advance by index
    const nextIndex = current.index + 1;
    if (nextIndex < this.layout.tiles.length) {
      return this.layout.tiles[nextIndex];
    }

    // Should not happen in a well-formed board
    return current;
  }

  private findFirstRouteTile(
    season: Season,
    route: BranchRoute,
  ): Tile | undefined {
    return this.layout.tiles.find(
      (t) => t.season === season && t.route === route,
    );
  }

  isBranchPoint(tileId: string): boolean {
    const tile = this.getTileById(tileId);
    return tile?.type === "branch";
  }

  getAvailableRoutes(tileId: string): BranchRoute[] {
    if (!this.isBranchPoint(tileId)) return [];

    const tile = this.getTileById(tileId);
    if (!tile) return [];

    const branchPoint = this.layout.branchPoints[tile.season];
    if (branchPoint && branchPoint.tileId === tileId) {
      return branchPoint.routes;
    }
    return [];
  }

  getCurrentSeason(tileId: string): Season {
    const tile = this.getTileById(tileId);
    if (!tile) {
      throw new Error(`Tile not found: ${tileId}`);
    }
    return tile.season;
  }

  isGameEnd(tileId: string): boolean {
    const tile = this.getTileById(tileId);
    if (!tile) return false;

    // Game ends at winter's merge (festival) point
    return tile.season === "winter" && tile.type === "festival";
  }

  getTileById(tileId: string): Tile | undefined {
    return this.tileMap.get(tileId);
  }

  getRouteBuff(tileId: string): {
    happiness: Partial<HappinessPillars>;
    fatigueMod: number;
    insightMod: number;
  } {
    const tile = this.getTileById(tileId);
    if (!tile?.route) {
      return { happiness: {}, fatigueMod: 0, insightMod: 0 };
    }
    return {
      happiness: ROUTE_BUFFS[tile.route] ?? {},
      ...(ROUTE_SPECIAL[tile.route] ?? { fatigueMod: 0, insightMod: 0 }),
    };
  }
}
