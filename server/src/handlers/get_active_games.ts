
import { db } from '../db';
import { gameStatesTable } from '../db/schema';
import { type GameState } from '../schema';
import { eq } from 'drizzle-orm';

export const getActiveGames = async (): Promise<GameState[]> => {
  try {
    const results = await db.select()
      .from(gameStatesTable)
      .where(eq(gameStatesTable.is_active, true))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get active games:', error);
    throw error;
  }
};
