
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { calculatorHistoryTable } from '../db/schema';
import { getCalculatorHistory } from '../handlers/get_calculator_history';

describe('getCalculatorHistory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no history exists', async () => {
    const result = await getCalculatorHistory();
    expect(result).toEqual([]);
  });

  it('should return all calculator history records without limit', async () => {
    // Create test history records
    await db.insert(calculatorHistoryTable)
      .values([
        { expression: '2 + 2', result: '4' },
        { expression: '10 * 5', result: '50' },
        { expression: '100 / 4', result: '25' }
      ])
      .execute();

    const result = await getCalculatorHistory();

    expect(result).toHaveLength(3);
    expect(result[0].expression).toBeDefined();
    expect(result[0].result).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();
  });

  it('should return limited calculator history records when limit is provided', async () => {
    // Create test history records
    await db.insert(calculatorHistoryTable)
      .values([
        { expression: '1 + 1', result: '2' },
        { expression: '3 + 3', result: '6' },
        { expression: '5 + 5', result: '10' },
        { expression: '7 + 7', result: '14' }
      ])
      .execute();

    const result = await getCalculatorHistory(2);

    expect(result).toHaveLength(2);
    result.forEach(record => {
      expect(record.expression).toBeDefined();
      expect(record.result).toBeDefined();
      expect(record.created_at).toBeInstanceOf(Date);
      expect(record.id).toBeDefined();
    });
  });

  it('should return records in descending order by created_at', async () => {
    // Create records with slight delay to ensure different timestamps
    await db.insert(calculatorHistoryTable)
      .values({ expression: 'first', result: '1' })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(calculatorHistoryTable)
      .values({ expression: 'second', result: '2' })
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(calculatorHistoryTable)
      .values({ expression: 'third', result: '3' })
      .execute();

    const result = await getCalculatorHistory();

    expect(result).toHaveLength(3);
    // Most recent should be first (descending order)
    expect(result[0].expression).toEqual('third');
    expect(result[1].expression).toEqual('second');
    expect(result[2].expression).toEqual('first');

    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should ignore invalid limit values', async () => {
    // Create test history records
    await db.insert(calculatorHistoryTable)
      .values([
        { expression: '8 + 8', result: '16' },
        { expression: '9 + 9', result: '18' }
      ])
      .execute();

    // Test with zero limit - should return all records
    const resultZero = await getCalculatorHistory(0);
    expect(resultZero).toHaveLength(2);

    // Test with negative limit - should return all records
    const resultNegative = await getCalculatorHistory(-1);
    expect(resultNegative).toHaveLength(2);
  });
});
