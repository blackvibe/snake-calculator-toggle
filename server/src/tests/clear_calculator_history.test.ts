
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { calculatorHistoryTable } from '../db/schema';
import { clearCalculatorHistory } from '../handlers/clear_calculator_history';

describe('clearCalculatorHistory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return success true when clearing empty table', async () => {
    const result = await clearCalculatorHistory();

    expect(result.success).toBe(true);
  });

  it('should clear all calculator history records', async () => {
    // Insert test data
    await db.insert(calculatorHistoryTable)
      .values([
        { expression: '2 + 2', result: '4' },
        { expression: '10 * 5', result: '50' },
        { expression: '100 / 4', result: '25' }
      ])
      .execute();

    // Verify data exists
    const beforeClear = await db.select()
      .from(calculatorHistoryTable)
      .execute();
    expect(beforeClear).toHaveLength(3);

    // Clear history
    const result = await clearCalculatorHistory();

    // Verify success response
    expect(result.success).toBe(true);

    // Verify all records are deleted
    const afterClear = await db.select()
      .from(calculatorHistoryTable)
      .execute();
    expect(afterClear).toHaveLength(0);
  });

  it('should handle multiple clear operations', async () => {
    // Insert test data
    await db.insert(calculatorHistoryTable)
      .values({ expression: '5 + 5', result: '10' })
      .execute();

    // First clear
    const result1 = await clearCalculatorHistory();
    expect(result1.success).toBe(true);

    // Second clear on empty table
    const result2 = await clearCalculatorHistory();
    expect(result2.success).toBe(true);

    // Verify table is still empty
    const records = await db.select()
      .from(calculatorHistoryTable)
      .execute();
    expect(records).toHaveLength(0);
  });
});
