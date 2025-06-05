
import { db } from '../db';
import { gameStatesTable } from '../db/schema';
import { type CreateGameInput, type GameState } from '../schema';

export const createGame = async (input: CreateGameInput): Promise<GameState> => {
  try {
    // Insert game state record
    const result = await db.insert(gameStatesTable)
      .values({
        player_name: input.player_name,
        score: input.score,
        game_data: input.game_data,
        is_active: input.is_active
      })
      .returning()
      .execute();

    // Return the created game state
    const gameState = result[0];
    return {
      ...gameState,
      created_at: gameState.created_at,
      updated_at: gameState.updated_at
    };
  } catch (error) {
    console.error('Game creation failed:', error);
    throw error;
  }
};
