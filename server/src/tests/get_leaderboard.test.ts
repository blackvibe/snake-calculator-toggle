
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { leaderboardTable } from '../db/schema';
import { getLeaderboard } from '../handlers/get_leaderboard';

describe('getLeaderboard', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no leaderboard entries exist', async () => {
    const result = await getLeaderboard();

    expect(result).toEqual([]);
  });

  it('should return leaderboard entries ordered by high score descending', async () => {
    // Create test leaderboard entries
    await db.insert(leaderboardTable)
      .values([
        { player_name: 'Alice', high_score: 100 },
        { player_name: 'Bob', high_score: 250 },
        { player_name: 'Charlie', high_score: 150 }
      ])
      .execute();

    const result = await getLeaderboard();

    expect(result).toHaveLength(3);
    // Should be ordered by high score descending: Bob (250), Charlie (150), Alice (100)
    expect(result[0].player_name).toEqual('Bob');
    expect(result[0].high_score).toEqual(250);
    expect(result[1].player_name).toEqual('Charlie');
    expect(result[1].high_score).toEqual(150);
    expect(result[2].player_name).toEqual('Alice');
    expect(result[2].high_score).toEqual(100);

    // Verify all fields are present
    result.forEach(entry => {
      expect(entry.id).toBeDefined();
      expect(entry.player_name).toBeDefined();
      expect(entry.high_score).toBeDefined();
      expect(entry.created_at).toBeInstanceOf(Date);
    });
  });

  it('should respect the limit parameter', async () => {
    // Create 5 test entries
    await db.insert(leaderboardTable)
      .values([
        { player_name: 'Player1', high_score: 500 },
        { player_name: 'Player2', high_score: 400 },
        { player_name: 'Player3', high_score: 300 },
        { player_name: 'Player4', high_score: 200 },
        { player_name: 'Player5', high_score: 100 }
      ])
      .execute();

    const result = await getLeaderboard(3);

    expect(result).toHaveLength(3);
    // Should return top 3 scores
    expect(result[0].high_score).toEqual(500);
    expect(result[1].high_score).toEqual(400);
    expect(result[2].high_score).toEqual(300);
  });

  it('should use default limit of 10 when no limit specified', async () => {
    // Create 15 test entries
    const entries = Array.from({ length: 15 }, (_, i) => ({
      player_name: `Player${i + 1}`,
      high_score: (15 - i) * 10 // Descending scores: 150, 140, 130, etc.
    }));

    await db.insert(leaderboardTable)
      .values(entries)
      .execute();

    const result = await getLeaderboard();

    expect(result).toHaveLength(10);
    // Should return top 10 scores
    expect(result[0].high_score).toEqual(150);
    expect(result[9].high_score).toEqual(60);
  });
});
