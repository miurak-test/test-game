import { describe, it, expect, beforeEach } from "vitest";
import { BoardSystem } from "@/systems/BoardSystem";
import { SHORT_BOARD_LAYOUT } from "@/data/board-layout";

describe("BoardSystem", () => {
  let board: BoardSystem;

  beforeEach(() => {
    board = new BoardSystem(SHORT_BOARD_LAYOUT);
  });

  describe("advance", () => {
    it("moves to correct tile on normal advance", () => {
      // From sp-life-1 (index 0), advance 1 step -> sp-romance (index 1)
      const tile = board.advance("sp-life-1", 1);
      expect(tile.id).toBe("sp-romance");
    });

    it("advances multiple steps", () => {
      // From sp-life-1 (index 0), advance 2 steps -> sp-branch (index 2)
      const tile = board.advance("sp-life-1", 2);
      expect(tile.id).toBe("sp-branch");
    });

    it("selects route tile when branch point reached with route selection", () => {
      // From sp-branch (index 2), advance 1 step with farm route -> sp-farm-1 (index 3)
      const tile = board.advance("sp-branch", 1, "farm");
      expect(tile.id).toBe("sp-farm-1");
      expect(tile.route).toBe("farm");
    });

    it("advances within selected route", () => {
      // From sp-farm-1 (index 3), advance 1 step -> sp-farm-2 (index 4)
      const tile = board.advance("sp-farm-1", 1);
      expect(tile.id).toBe("sp-farm-2");
      expect(tile.route).toBe("farm");
    });

    it("proceeds to merge point after route ends", () => {
      // From sp-farm-2 (last farm tile in spring), advance 1 step -> sp-festival
      const tile = board.advance("sp-farm-2", 1);
      expect(tile.id).toBe("sp-festival");
    });

    it("advances from merge point to next season", () => {
      // From sp-festival, advance 1 step -> su-life-1
      const tile = board.advance("sp-festival", 1);
      expect(tile.id).toBe("su-life-1");
    });

    it("defaults to main route (next index tile) when no route specified at branch", () => {
      // From sp-branch without route, advance 1 -> sp-farm-1 (first route tile)
      const tile = board.advance("sp-branch", 1);
      expect(tile.id).toBe("sp-farm-1");
    });
  });

  describe("isBranchPoint", () => {
    it("returns true for branch tiles", () => {
      expect(board.isBranchPoint("sp-branch")).toBe(true);
      expect(board.isBranchPoint("su-branch")).toBe(true);
      expect(board.isBranchPoint("au-branch")).toBe(true);
      expect(board.isBranchPoint("wi-branch")).toBe(true);
    });

    it("returns false for non-branch tiles", () => {
      expect(board.isBranchPoint("sp-life-1")).toBe(false);
      expect(board.isBranchPoint("sp-festival")).toBe(false);
    });
  });

  describe("getAvailableRoutes", () => {
    it("returns routes for branch points", () => {
      const routes = board.getAvailableRoutes("sp-branch");
      expect(routes).toEqual(["farm", "shop", "village"]);
    });

    it("returns empty array for non-branch points", () => {
      const routes = board.getAvailableRoutes("sp-life-1");
      expect(routes).toEqual([]);
    });
  });

  describe("getCurrentSeason", () => {
    it("returns correct season for each tile", () => {
      expect(board.getCurrentSeason("sp-life-1")).toBe("spring");
      expect(board.getCurrentSeason("sp-festival")).toBe("spring");
      expect(board.getCurrentSeason("su-life-1")).toBe("summer");
      expect(board.getCurrentSeason("au-branch")).toBe("autumn");
      expect(board.getCurrentSeason("wi-festival")).toBe("winter");
    });
  });

  describe("isGameEnd", () => {
    it("returns true for winter festival tile", () => {
      expect(board.isGameEnd("wi-festival")).toBe(true);
    });

    it("returns false for other tiles", () => {
      expect(board.isGameEnd("sp-festival")).toBe(false);
      expect(board.isGameEnd("wi-life-1")).toBe(false);
      expect(board.isGameEnd("au-festival")).toBe(false);
    });
  });

  describe("getRouteBuff", () => {
    it("returns farm buff for farm route tiles", () => {
      const buff = board.getRouteBuff("sp-farm-1");
      expect(buff.happiness).toEqual({ nature: 1 });
      expect(buff.fatigueMod).toBe(-2);
      expect(buff.insightMod).toBe(0);
    });

    it("returns shop buff for shop route tiles", () => {
      const buff = board.getRouteBuff("sp-shop-1");
      expect(buff.happiness).toEqual({ money: 1 });
      expect(buff.fatigueMod).toBe(0);
      expect(buff.insightMod).toBe(0);
    });

    it("returns village buff for village route tiles", () => {
      const buff = board.getRouteBuff("sp-village-1");
      expect(buff.happiness).toEqual({ culture: 1 });
      expect(buff.fatigueMod).toBe(0);
      expect(buff.insightMod).toBe(2);
    });

    it("returns empty buff for non-route tiles", () => {
      const buff = board.getRouteBuff("sp-life-1");
      expect(buff.happiness).toEqual({});
      expect(buff.fatigueMod).toBe(0);
      expect(buff.insightMod).toBe(0);
    });
  });
});
