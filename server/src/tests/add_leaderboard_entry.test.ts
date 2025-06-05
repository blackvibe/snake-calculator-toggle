
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { leaderboardTable } from '../db/schema';
import { addLeaderboardEntry } from '../handlers/add_leaderboard_entry';
import { eq } from 'drizzle-orm';

describe('addLeaderboardEntry', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a leaderboard entry', async () => {
    const result = await addLeaderboardEntry('TestPlayer', 1500);

    // Basic field validation
    expect(result.player_name).toEqual('TestPlayer');
    expect(result.high_score).toEqual(1500);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save leaderboard entry to database', async () => {
    const result = await addLeaderboardEntry('Alice', 2500);

    // Query using proper drizzle syntax
    const entries = await db.select()
      .from(leaderboardTable)
      .where(eq(leaderboardTable.id, result.id))
      .execute();

    expect(entries).toHaveLength(1);
    expect(entries[0].player_name).toEqual('Alice');
    expect(entries[0].high_score).toEqual(2500);
    expect(entries[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle zero score', async () => {
    const result = await addLeaderboardEntry('Beginner', 0);

    expect(result.player_name).toEqual('Beginner');
    expect(result.high_score).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create multiple entries for same player', async () => {
    await addLeaderboardEntry('Player1', 1000);
    await addLeaderboardEntry('Player1', 1500);

    const entries = await db.select()
      .from(leaderboardTable)
      .where(eq(leaderboardTable.player_name, 'Player1'))
      .execute();

    expect(entries).toHaveLength(2);
    expect(entries[0].high_score).toEqual(1000);
    expect(entries[1].high_score).toEqual(1500);
  });
});
