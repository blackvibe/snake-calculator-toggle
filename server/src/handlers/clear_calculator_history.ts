
import { db } from '../db';
import { calculatorHistoryTable } from '../db/schema';

export const clearCalculatorHistory = async (): Promise<{ success: boolean }> => {
  try {
    // Delete all records from calculator history table
    await db.delete(calculatorHistoryTable).execute();
    
    return { success: true };
  } catch (error) {
    console.error('Calculator history clearing failed:', error);
    throw error;
  }
};
