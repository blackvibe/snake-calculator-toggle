
import { db } from '../db';
import { gameStatesTable } from '../db/schema';
import { type UpdateGameInput, type GameState } from '../schema';
import { eq } from 'drizzle-orm';

export const updateGame = async (input: UpdateGameInput): Promise<GameState> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.score !== undefined) {
      updateData.score = input.score;
    }

    if (input.game_data !== undefined) {
      updateData.game_data = input.game_data;
    }

    if (input.is_active !== undefined) {
      updateData.is_active = input.is_active;
    }

    // Update the game state
    const result = await db.update(gameStatesTable)
      .set(updateData)
      .where(eq(gameStatesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Game with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Game update failed:', error);
    throw error;
  }
};
