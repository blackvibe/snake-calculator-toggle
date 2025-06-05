
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { gameStatesTable } from '../db/schema';
import { type CreateGameInput, type UpdateGameInput } from '../schema';
import { updateGame } from '../handlers/update_game';
import { eq } from 'drizzle-orm';

describe('updateGame', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  const createTestGame = async () => {
    const testGameData: CreateGameInput = {
      player_name: 'TestPlayer',
      score: 100,
      game_data: '{"snake": [{"x": 5, "y": 5}], "food": {"x": 10, "y": 10}}',
      is_active: true
    };

    const result = await db.insert(gameStatesTable)
      .values({
        player_name: testGameData.player_name,
        score: testGameData.score,
        game_data: testGameData.game_data,
        is_active: testGameData.is_active
      })
      .returning()
      .execute();

    return result[0];
  };

  it('should update game score', async () => {
    const game = await createTestGame();
    
    const updateInput: UpdateGameInput = {
      id: game.id,
      score: 250
    };

    const result = await updateGame(updateInput);

    expect(result.id).toEqual(game.id);
    expect(result.score).toEqual(250);
    expect(result.player_name).toEqual('TestPlayer');
    expect(result.game_data).toEqual('{"snake": [{"x": 5, "y": 5}], "food": {"x": 10, "y": 10}}');
    expect(result.is_active).toEqual(true);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > game.updated_at).toBe(true);
  });

  it('should update game data', async () => {
    const game = await createTestGame();
    
    const newGameData = '{"snake": [{"x": 8, "y": 8}, {"x": 7, "y": 8}], "food": {"x": 3, "y": 3}}';
    const updateInput: UpdateGameInput = {
      id: game.id,
      game_data: newGameData
    };

    const result = await updateGame(updateInput);

    expect(result.id).toEqual(game.id);
    expect(result.game_data).toEqual(newGameData);
    expect(result.score).toEqual(100);
    expect(result.is_active).toEqual(true);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update game active status', async () => {
    const game = await createTestGame();
    
    const updateInput: UpdateGameInput = {
      id: game.id,
      is_active: false
    };

    const result = await updateGame(updateInput);

    expect(result.id).toEqual(game.id);
    expect(result.is_active).toEqual(false);
    expect(result.score).toEqual(100);
    expect(result.player_name).toEqual('TestPlayer');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update multiple fields at once', async () => {
    const game = await createTestGame();
    
    const updateInput: UpdateGameInput = {
      id: game.id,
      score: 500,
      game_data: '{"snake": [{"x": 1, "y": 1}], "food": {"x": 15, "y": 15}}',
      is_active: false
    };

    const result = await updateGame(updateInput);

    expect(result.id).toEqual(game.id);
    expect(result.score).toEqual(500);
    expect(result.game_data).toEqual('{"snake": [{"x": 1, "y": 1}], "food": {"x": 15, "y": 15}}');
    expect(result.is_active).toEqual(false);
    expect(result.player_name).toEqual('TestPlayer');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updates to database', async () => {
    const game = await createTestGame();
    
    const updateInput: UpdateGameInput = {
      id: game.id,
      score: 300,
      is_active: false
    };

    await updateGame(updateInput);

    // Verify changes are persisted in database
    const updatedGame = await db.select()
      .from(gameStatesTable)
      .where(eq(gameStatesTable.id, game.id))
      .execute();

    expect(updatedGame).toHaveLength(1);
    expect(updatedGame[0].score).toEqual(300);
    expect(updatedGame[0].is_active).toEqual(false);
    expect(updatedGame[0].updated_at).toBeInstanceOf(Date);
    expect(updatedGame[0].updated_at > game.updated_at).toBe(true);
  });

  it('should throw error for non-existent game', async () => {
    const updateInput: UpdateGameInput = {
      id: 99999,
      score: 100
    };

    await expect(updateGame(updateInput)).rejects.toThrow(/game with id 99999 not found/i);
  });

  it('should only update provided fields', async () => {
    const game = await createTestGame();
    
    const updateInput: UpdateGameInput = {
      id: game.id,
      score: 150
    };

    const result = await updateGame(updateInput);

    expect(result.score).toEqual(150);
    expect(result.game_data).toEqual(game.game_data); // Should remain unchanged
    expect(result.is_active).toEqual(game.is_active); // Should remain unchanged
    expect(result.player_name).toEqual(game.player_name); // Should remain unchanged
  });
});
