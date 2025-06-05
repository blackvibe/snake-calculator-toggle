
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { gameStatesTable } from '../db/schema';
import { getGame } from '../handlers/get_game';

describe('getGame', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return game state when game exists', async () => {
    // Create a test game
    const testGame = await db.insert(gameStatesTable)
      .values({
        player_name: 'Test Player',
        score: 150,
        game_data: '{"snake": [{"x": 10, "y": 10}], "food": {"x": 5, "y": 5}}',
        is_active: true
      })
      .returning()
      .execute();

    const gameId = testGame[0].id;

    // Get the game
    const result = await getGame(gameId);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(gameId);
    expect(result!.player_name).toEqual('Test Player');
    expect(result!.score).toEqual(150);
    expect(result!.game_data).toEqual('{"snake": [{"x": 10, "y": 10}], "food": {"x": 5, "y": 5}}');
    expect(result!.is_active).toEqual(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when game does not exist', async () => {
    const result = await getGame(999);

    expect(result).toBeNull();
  });

  it('should retrieve game with default values correctly', async () => {
    // Create a game with minimal data (relying on defaults)
    const testGame = await db.insert(gameStatesTable)
      .values({
        player_name: 'Default Player'
      })
      .returning()
      .execute();

    const gameId = testGame[0].id;

    const result = await getGame(gameId);

    expect(result).not.toBeNull();
    expect(result!.player_name).toEqual('Default Player');
    expect(result!.score).toEqual(0); // Default value
    expect(result!.game_data).toEqual('{}'); // Default value
    expect(result!.is_active).toEqual(true); // Default value
  });
});
