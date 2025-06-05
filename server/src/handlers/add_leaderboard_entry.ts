
import { db } from '../db';
import { leaderboardTable } from '../db/schema';
import { type LeaderboardEntry } from '../schema';

export const addLeaderboardEntry = async (playerName: string, score: number): Promise<LeaderboardEntry> => {
  try {
    // Insert leaderboard entry
    const result = await db.insert(leaderboardTable)
      .values({
        player_name: playerName,
        high_score: score
      })
      .returning()
      .execute();

    const entry = result[0];
    return {
      id: entry.id,
      player_name: entry.player_name,
      high_score: entry.high_score,
      created_at: entry.created_at
    };
  } catch (error) {
    console.error('Leaderboard entry creation failed:', error);
    throw error;
  }
};
