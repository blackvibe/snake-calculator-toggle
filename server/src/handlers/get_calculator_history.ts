
import { db } from '../db';
import { calculatorHistoryTable } from '../db/schema';
import { type CalculatorHistory } from '../schema';
import { desc } from 'drizzle-orm';

export const getCalculatorHistory = async (limit?: number): Promise<CalculatorHistory[]> => {
  try {
    // Build base query with ordering
    const baseQuery = db.select()
      .from(calculatorHistoryTable)
      .orderBy(desc(calculatorHistoryTable.created_at));

    // Execute with or without limit
    const results = limit !== undefined && limit > 0 
      ? await baseQuery.limit(limit).execute()
      : await baseQuery.execute();

    return results;
  } catch (error) {
    console.error('Failed to get calculator history:', error);
    throw error;
  }
};
