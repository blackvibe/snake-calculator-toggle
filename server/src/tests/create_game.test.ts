
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { gameStatesTable } from '../db/schema';
import { type CreateGameInput } from '../schema';
import { createGame } from '../handlers/create_game';
import { eq } from 'drizzle-orm';

// Test input with all fields included (even those with defaults)
const testInput: CreateGameInput = {
  player_name: 'TestPlayer',
  score: 0,
  game_data: '{"snake": [{"x": 10, "y": 10}], "food": {"x": 5, "y": 5}}',
  is_active: true
};

describe('createGame', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a game with default values', async () => {
    const minimalInput: CreateGameInput = {
      player_name: 'MinimalPlayer',
      score: 0,
      game_data: '{}',
      is_active: true
    };

    const result = await createGame(minimalInput);

    // Basic field validation
    expect(result.player_name).toEqual('MinimalPlayer');
    expect(result.score).toEqual(0);
    expect(result.game_data).toEqual('{}');
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a game with custom values', async () => {
    const result = await createGame(testInput);

    // Validate all fields
    expect(result.player_name).toEqual('TestPlayer');
    expect(result.score).toEqual(0);
    expect(result.game_data).toEqual('{"snake": [{"x": 10, "y": 10}], "food": {"x": 5, "y": 5}}');
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save game to database', async () => {
    const result = await createGame(testInput);

    // Query using proper drizzle syntax
    const games = await db.select()
      .from(gameStatesTable)
      .where(eq(gameStatesTable.id, result.id))
      .execute();

    expect(games).toHaveLength(1);
    expect(games[0].player_name).toEqual('TestPlayer');
    expect(games[0].score).toEqual(0);
    expect(games[0].game_data).toEqual('{"snake": [{"x": 10, "y": 10}], "food": {"x": 5, "y": 5}}');
    expect(games[0].is_active).toEqual(true);
    expect(games[0].created_at).toBeInstanceOf(Date);
    expect(games[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create game with non-zero score', async () => {
    const highScoreInput: CreateGameInput = {
      player_name: 'HighScorer',
      score: 150,
      game_data: '{"level": 2}',
      is_active: false
    };

    const result = await createGame(highScoreInput);

    expect(result.player_name).toEqual('HighScorer');
    expect(result.score).toEqual(150);
    expect(result.game_data).toEqual('{"level": 2}');
    expect(result.is_active).toEqual(false);
    expect(typeof result.score).toEqual('number');
  });

  it('should handle different game data formats', async () => {
    const complexGameData = JSON.stringify({
      snake: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ],
      food: { x: 15, y: 12 },
      direction: 'right',
      level: 1
    });

    const complexInput: CreateGameInput = {
      player_name: 'ComplexPlayer',
      score: 30,
      game_data: complexGameData,
      is_active: true
    };

    const result = await createGame(complexInput);

    expect(result.game_data).toEqual(complexGameData);
    expect(result.player_name).toEqual('ComplexPlayer');
    expect(result.score).toEqual(30);

    // Verify it's stored correctly in database
    const stored = await db.select()
      .from(gameStatesTable)
      .where(eq(gameStatesTable.id, result.id))
      .execute();

    expect(stored[0].game_data).toEqual(complexGameData);
  });
});
