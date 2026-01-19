import { promises as fs } from "node:fs";
import { join } from "node:path";

/**
 * User streak data for Word Challenge game.
 */
export interface StreakData {
  /** Current consecutive daily wins */
  currentStreak: number;
  /** Maximum streak achieved */
  maxStreak: number;
  /** Last date a daily game was played (ISO date string) */
  lastPlayedDate: string | null;
  /** Total games played (daily + practice) */
  totalGamesPlayed: number;
  /** Total games won */
  totalGamesWon: number;
  /** Total daily games played */
  dailyGamesPlayed: number;
  /** Total daily games won */
  dailyGamesWon: number;
}

/**
 * Default streak data for new users.
 */
const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  maxStreak: 0,
  lastPlayedDate: null,
  totalGamesPlayed: 0,
  totalGamesWon: 0,
  dailyGamesPlayed: 0,
  dailyGamesWon: 0,
};

/**
 * Storage directory for streak data.
 */
const STORAGE_DIR = join(process.cwd(), ".data", "streaks");

/**
 * Get the file path for a user's streak data.
 */
function getUserStreakPath(userId: string): string {
  return join(STORAGE_DIR, `${userId}.json`);
}

/**
 * Ensure the storage directory exists.
 */
async function ensureStorageDir(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create storage directory:", error);
  }
}

/**
 * Load streak data for a user.
 * Returns default data if user has no saved data.
 */
export async function loadStreakData(userId: string): Promise<StreakData> {
  try {
    const filePath = getUserStreakPath(userId);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as StreakData;
  } catch (error) {
    // File doesn't exist or is invalid - return defaults
    return { ...DEFAULT_STREAK_DATA };
  }
}

/**
 * Save streak data for a user.
 */
export async function saveStreakData(
  userId: string,
  data: StreakData
): Promise<void> {
  try {
    await ensureStorageDir();
    const filePath = getUserStreakPath(userId);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save streak data:", error);
    throw new Error("Failed to save streak data");
  }
}

/**
 * Get today's date as an ISO date string (YYYY-MM-DD).
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Calculate days between two ISO date strings.
 */
function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Update streak data after a daily game completion.
 *
 * @param data - Current streak data
 * @param won - Whether the game was won
 * @returns Updated streak data
 */
export function updateDailyStreak(data: StreakData, won: boolean): StreakData {
  const today = getTodayDateString();
  const lastPlayed = data.lastPlayedDate;

  // Update game counters
  const updated: StreakData = {
    ...data,
    dailyGamesPlayed: data.dailyGamesPlayed + 1,
    dailyGamesWon: won ? data.dailyGamesWon + 1 : data.dailyGamesWon,
    totalGamesPlayed: data.totalGamesPlayed + 1,
    totalGamesWon: won ? data.totalGamesWon + 1 : data.totalGamesWon,
    lastPlayedDate: today,
  };

  // Only update streak if game was won
  if (!won) {
    updated.currentStreak = 0;
    return updated;
  }

  // First daily game ever
  if (!lastPlayed) {
    updated.currentStreak = 1;
    updated.maxStreak = Math.max(1, data.maxStreak);
    return updated;
  }

  // Already played today - don't update streak
  if (lastPlayed === today) {
    return updated;
  }

  const daysSinceLastPlayed = getDaysDifference(lastPlayed, today);

  if (daysSinceLastPlayed === 1) {
    // Consecutive day - increment streak
    updated.currentStreak = data.currentStreak + 1;
    updated.maxStreak = Math.max(updated.currentStreak, data.maxStreak);
  } else {
    // Skipped days - reset streak
    updated.currentStreak = 1;
  }

  return updated;
}

/**
 * Update streak data after a practice game completion.
 * Practice games don't affect streak, only total game stats.
 *
 * @param data - Current streak data
 * @param won - Whether the game was won
 * @returns Updated streak data
 */
export function updatePracticeStreak(
  data: StreakData,
  won: boolean
): StreakData {
  return {
    ...data,
    totalGamesPlayed: data.totalGamesPlayed + 1,
    totalGamesWon: won ? data.totalGamesWon + 1 : data.totalGamesWon,
  };
}

/**
 * Calculate win rate percentage.
 */
export function calculateWinRate(data: StreakData): number {
  if (data.totalGamesPlayed === 0) return 0;
  return Math.round((data.totalGamesWon / data.totalGamesPlayed) * 100);
}
