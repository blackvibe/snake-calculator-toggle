
import { db } from '../db';
import { appModeTable } from '../db/schema';
import { type AppMode } from '../schema';

export const getAppMode = async (): Promise<AppMode> => {
  try {
    // Get the current app mode - there should only be one record
    const result = await db.select()
      .from(appModeTable)
      .limit(1)
      .execute();

    // If no app mode exists, create a default one
    if (result.length === 0) {
      const defaultMode = await db.insert(appModeTable)
        .values({
          current_mode: 'snake'
        })
        .returning()
        .execute();

      return defaultMode[0];
    }

    return result[0];
  } catch (error) {
    console.error('Failed to get app mode:', error);
    throw error;
  }
};
