
import { db } from '../db';
import { appModeTable } from '../db/schema';
import { type UpdateAppModeInput, type AppMode } from '../schema';
import { eq } from 'drizzle-orm';

export const updateAppMode = async (input: UpdateAppModeInput): Promise<AppMode> => {
  try {
    // First, check if there's an existing app mode record
    const existingModes = await db.select()
      .from(appModeTable)
      .limit(1)
      .execute();

    let result;

    if (existingModes.length === 0) {
      // No existing record, create a new one
      const insertResult = await db.insert(appModeTable)
        .values({
          current_mode: input.current_mode,
          updated_at: new Date()
        })
        .returning()
        .execute();
      result = insertResult[0];
    } else {
      // Update the existing record
      const updateResult = await db.update(appModeTable)
        .set({
          current_mode: input.current_mode,
          updated_at: new Date()
        })
        .where(eq(appModeTable.id, existingModes[0].id))
        .returning()
        .execute();
      result = updateResult[0];
    }

    return result;
  } catch (error) {
    console.error('App mode update failed:', error);
    throw error;
  }
};
