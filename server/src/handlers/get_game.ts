
import { db } from '../db';
import { gameStatesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GameState } from '../schema';

export const getGame = async (id: number): Promise<GameState | null> => {
  try {
    const results = await db.select()
      .from(gameStatesTable)
      .where(eq(gameStatesTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get game:', error);
    throw error;
  }
};
