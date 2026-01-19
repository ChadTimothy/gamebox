import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import {
  type StreakData,
  loadStreakData,
  saveStreakData,
  updateDailyStreak,
  updatePracticeStreak,
  calculateWinRate,
  getTodayDateString,
} from "./streaks.js";

const TEST_USER_ID = "test-user-123";
const STORAGE_DIR = join(process.cwd(), ".data", "streaks");

describe("Streak Tracking", () => {
  beforeEach(async () => {
    // Clean up test data before each test
    try {
      await fs.rm(STORAGE_DIR, { recursive: true });
    } catch {
      // Directory doesn't exist yet
    }
  });

  afterEach(async () => {
    // Clean up test data after each test
    try {
      await fs.rm(STORAGE_DIR, { recursive: true });
    } catch {
      // Directory doesn't exist
    }
  });

  describe("Date utilities", () => {
    it("should return today's date in ISO format", () => {
      const today = getTodayDateString();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("Persistence", () => {
    it("should return default data for new user", async () => {
      const data = await loadStreakData(TEST_USER_ID);

      expect(data.currentStreak).toBe(0);
      expect(data.maxStreak).toBe(0);
      expect(data.lastPlayedDate).toBeNull();
      expect(data.totalGamesPlayed).toBe(0);
      expect(data.totalGamesWon).toBe(0);
    });

    it("should save and load streak data", async () => {
      const testData: StreakData = {
        currentStreak: 5,
        maxStreak: 10,
        lastPlayedDate: "2024-01-15",
        totalGamesPlayed: 20,
        totalGamesWon: 15,
        dailyGamesPlayed: 10,
        dailyGamesWon: 8,
      };

      await saveStreakData(TEST_USER_ID, testData);
      const loaded = await loadStreakData(TEST_USER_ID);

      expect(loaded).toEqual(testData);
    });

    it("should handle corrupted data gracefully", async () => {
      // Write invalid JSON
      const filePath = join(STORAGE_DIR, `${TEST_USER_ID}.json`);
      await fs.mkdir(STORAGE_DIR, { recursive: true });
      await fs.writeFile(filePath, "invalid json", "utf-8");

      const data = await loadStreakData(TEST_USER_ID);

      // Should return default data
      expect(data.currentStreak).toBe(0);
      expect(data.maxStreak).toBe(0);
    });
  });

  describe("Daily streak updates", () => {
    it("should start streak at 1 for first daily win", () => {
      const initialData: StreakData = {
        currentStreak: 0,
        maxStreak: 0,
        lastPlayedDate: null,
        totalGamesPlayed: 0,
        totalGamesWon: 0,
        dailyGamesPlayed: 0,
        dailyGamesWon: 0,
      };

      const updated = updateDailyStreak(initialData, true);

      expect(updated.currentStreak).toBe(1);
      expect(updated.maxStreak).toBe(1);
      expect(updated.dailyGamesPlayed).toBe(1);
      expect(updated.dailyGamesWon).toBe(1);
      expect(updated.totalGamesPlayed).toBe(1);
      expect(updated.totalGamesWon).toBe(1);
      expect(updated.lastPlayedDate).toBe(getTodayDateString());
    });

    it("should reset streak to 0 on first daily loss", () => {
      const initialData: StreakData = {
        currentStreak: 0,
        maxStreak: 0,
        lastPlayedDate: null,
        totalGamesPlayed: 0,
        totalGamesWon: 0,
        dailyGamesPlayed: 0,
        dailyGamesWon: 0,
      };

      const updated = updateDailyStreak(initialData, false);

      expect(updated.currentStreak).toBe(0);
      expect(updated.maxStreak).toBe(0);
      expect(updated.dailyGamesPlayed).toBe(1);
      expect(updated.dailyGamesWon).toBe(0);
      expect(updated.totalGamesPlayed).toBe(1);
      expect(updated.totalGamesWon).toBe(0);
    });

    it("should increment streak on consecutive daily win", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const initialData: StreakData = {
        currentStreak: 3,
        maxStreak: 5,
        lastPlayedDate: yesterdayStr,
        totalGamesPlayed: 5,
        totalGamesWon: 4,
        dailyGamesPlayed: 5,
        dailyGamesWon: 4,
      };

      const updated = updateDailyStreak(initialData, true);

      expect(updated.currentStreak).toBe(4);
      expect(updated.maxStreak).toBe(5); // Should not update (4 < 5)
      expect(updated.dailyGamesPlayed).toBe(6);
      expect(updated.dailyGamesWon).toBe(5);
    });

    it("should update max streak when current exceeds it", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const initialData: StreakData = {
        currentStreak: 5,
        maxStreak: 5,
        lastPlayedDate: yesterdayStr,
        totalGamesPlayed: 5,
        totalGamesWon: 5,
        dailyGamesPlayed: 5,
        dailyGamesWon: 5,
      };

      const updated = updateDailyStreak(initialData, true);

      expect(updated.currentStreak).toBe(6);
      expect(updated.maxStreak).toBe(6);
    });

    it("should reset streak when days are skipped", () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];

      const initialData: StreakData = {
        currentStreak: 10,
        maxStreak: 10,
        lastPlayedDate: threeDaysAgoStr,
        totalGamesPlayed: 10,
        totalGamesWon: 10,
        dailyGamesPlayed: 10,
        dailyGamesWon: 10,
      };

      const updated = updateDailyStreak(initialData, true);

      expect(updated.currentStreak).toBe(1);
      expect(updated.maxStreak).toBe(10); // Max should not change
    });

    it("should reset streak to 0 on consecutive day loss", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const initialData: StreakData = {
        currentStreak: 5,
        maxStreak: 8,
        lastPlayedDate: yesterdayStr,
        totalGamesPlayed: 10,
        totalGamesWon: 8,
        dailyGamesPlayed: 10,
        dailyGamesWon: 8,
      };

      const updated = updateDailyStreak(initialData, false);

      expect(updated.currentStreak).toBe(0);
      expect(updated.maxStreak).toBe(8); // Max should not change
      expect(updated.dailyGamesPlayed).toBe(11);
      expect(updated.dailyGamesWon).toBe(8);
    });

    it("should not update streak if already played today", () => {
      const today = getTodayDateString();

      const initialData: StreakData = {
        currentStreak: 3,
        maxStreak: 5,
        lastPlayedDate: today,
        totalGamesPlayed: 5,
        totalGamesWon: 4,
        dailyGamesPlayed: 5,
        dailyGamesWon: 4,
      };

      const updated = updateDailyStreak(initialData, true);

      expect(updated.currentStreak).toBe(3); // Should not change
      expect(updated.dailyGamesPlayed).toBe(6); // But stats should update
      expect(updated.dailyGamesWon).toBe(5);
    });
  });

  describe("Practice game updates", () => {
    it("should update stats but not streak on practice win", () => {
      const initialData: StreakData = {
        currentStreak: 5,
        maxStreak: 10,
        lastPlayedDate: "2024-01-15",
        totalGamesPlayed: 20,
        totalGamesWon: 15,
        dailyGamesPlayed: 10,
        dailyGamesWon: 8,
      };

      const updated = updatePracticeStreak(initialData, true);

      expect(updated.currentStreak).toBe(5); // Unchanged
      expect(updated.maxStreak).toBe(10); // Unchanged
      expect(updated.lastPlayedDate).toBe("2024-01-15"); // Unchanged
      expect(updated.dailyGamesPlayed).toBe(10); // Unchanged
      expect(updated.dailyGamesWon).toBe(8); // Unchanged
      expect(updated.totalGamesPlayed).toBe(21);
      expect(updated.totalGamesWon).toBe(16);
    });

    it("should update stats but not streak on practice loss", () => {
      const initialData: StreakData = {
        currentStreak: 5,
        maxStreak: 10,
        lastPlayedDate: "2024-01-15",
        totalGamesPlayed: 20,
        totalGamesWon: 15,
        dailyGamesPlayed: 10,
        dailyGamesWon: 8,
      };

      const updated = updatePracticeStreak(initialData, false);

      expect(updated.currentStreak).toBe(5); // Unchanged
      expect(updated.totalGamesPlayed).toBe(21);
      expect(updated.totalGamesWon).toBe(15); // Unchanged
    });
  });

  describe("Win rate calculation", () => {
    it("should return 0 for no games played", () => {
      const data: StreakData = {
        currentStreak: 0,
        maxStreak: 0,
        lastPlayedDate: null,
        totalGamesPlayed: 0,
        totalGamesWon: 0,
        dailyGamesPlayed: 0,
        dailyGamesWon: 0,
      };

      expect(calculateWinRate(data)).toBe(0);
    });

    it("should calculate win rate correctly", () => {
      const data: StreakData = {
        currentStreak: 0,
        maxStreak: 0,
        lastPlayedDate: null,
        totalGamesPlayed: 20,
        totalGamesWon: 15,
        dailyGamesPlayed: 0,
        dailyGamesWon: 0,
      };

      expect(calculateWinRate(data)).toBe(75);
    });

    it("should round win rate to nearest integer", () => {
      const data: StreakData = {
        currentStreak: 0,
        maxStreak: 0,
        lastPlayedDate: null,
        totalGamesPlayed: 3,
        totalGamesWon: 2,
        dailyGamesPlayed: 0,
        dailyGamesWon: 0,
      };

      expect(calculateWinRate(data)).toBe(67); // 66.666... rounds to 67
    });
  });
});
