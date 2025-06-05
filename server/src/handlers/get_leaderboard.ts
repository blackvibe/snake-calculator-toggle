
import { db } from '../db';
import { leaderboardTable } from '../db/schema';
import { type LeaderboardEntry } from '../schema';
import { desc } from 'drizzle-orm';

export const getLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    // Query leaderboard ordered by high score descending with limit applied in one chain
    const results = await db.select()
      .from(leaderboardTable)
      .orderBy(desc(leaderboardTable.high_score))
      .limit(limit)
      .execute();

    return results;
  } catch (error) {
    console.error('Leaderboard retrieval failed:', error);
    throw error;
  }
};
