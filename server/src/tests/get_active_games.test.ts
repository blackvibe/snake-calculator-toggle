
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { gameStatesTable } from '../db/schema';
import { type CreateGameInput } from '../schema';
import { getActiveGames } from '../handlers/get_active_games';

// Test inputs - active game
const activeGameInput: CreateGameInput = {
  player_name: 'ActivePlayer',
  score: 100,
  game_data: '{"snake": [[5,5]], "food": [10,10]}',
  is_active: true
};

// Test inputs - inactive game
const inactiveGameInput: CreateGameInput = {
  player_name: 'InactivePlayer',
  score: 50,
  game_data: '{"snake": [[3,3]], "food": [8,8]}',
  is_active: false
};

describe('getActiveGames', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return only active games', async () => {
    // Create one active and one inactive game
    await db.insert(gameStatesTable)
      .values([
        {
          player_name: activeGameInput.player_name,
          score: activeGameInput.score,
          game_data: activeGameInput.game_data,
          is_active: activeGameInput.is_active
        },
        {
          player_name: inactiveGameInput.player_name,
          score: inactiveGameInput.score,
          game_data: inactiveGameInput.game_data,
          is_active: inactiveGameInput.is_active
        }
      ])
      .execute();

    const activeGames = await getActiveGames();

    expect(activeGames).toHaveLength(1);
    expect(activeGames[0].player_name).toEqual('ActivePlayer');
    expect(activeGames[0].is_active).toBe(true);
    expect(activeGames[0].score).toEqual(100);
    expect(activeGames[0].game_data).toEqual('{"snake": [[5,5]], "food": [10,10]}');
  });

  it('should return empty array when no active games exist', async () => {
    // Create only inactive games
    await db.insert(gameStatesTable)
      .values({
        player_name: inactiveGameInput.player_name,
        score: inactiveGameInput.score,
        game_data: inactiveGameInput.game_data,
        is_active: false
      })
      .execute();

    const activeGames = await getActiveGames();

    expect(activeGames).toHaveLength(0);
  });

  it('should return multiple active games', async () => {
    // Create multiple active games
    await db.insert(gameStatesTable)
      .values([
        {
          player_name: 'Player1',
          score: 150,
          game_data: '{"snake": [[1,1]], "food": [5,5]}',
          is_active: true
        },
        {
          player_name: 'Player2',
          score: 200,
          game_data: '{"snake": [[2,2]], "food": [6,6]}',
          is_active: true
        },
        {
          player_name: 'Player3',
          score: 75,
          game_data: '{"snake": [[3,3]], "food": [7,7]}',
          is_active: false
        }
      ])
      .execute();

    const activeGames = await getActiveGames();

    expect(activeGames).toHaveLength(2);
    
    const playerNames = activeGames.map(game => game.player_name);
    expect(playerNames).toContain('Player1');
    expect(playerNames).toContain('Player2');
    expect(playerNames).not.toContain('Player3');

    activeGames.forEach(game => {
      expect(game.is_active).toBe(true);
      expect(game.id).toBeDefined();
      expect(game.created_at).toBeInstanceOf(Date);
      expect(game.updated_at).toBeInstanceOf(Date);
    });
  });
});
