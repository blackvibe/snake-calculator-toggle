
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { calculatorHistoryTable } from '../db/schema';
import { type CalculateInput } from '../schema';
import { calculate } from '../handlers/calculate';
import { eq } from 'drizzle-orm';

describe('calculate', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should perform basic addition', async () => {
    const input: CalculateInput = {
      expression: '2 + 3'
    };

    const result = await calculate(input);

    expect(result.expression).toEqual('2 + 3');
    expect(result.result).toEqual('5');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should perform complex calculations', async () => {
    const input: CalculateInput = {
      expression: '(10 + 5) * 2 - 8 / 4'
    };

    const result = await calculate(input);

    expect(result.expression).toEqual('(10 + 5) * 2 - 8 / 4');
    expect(result.result).toEqual('28'); // (15 * 2) - 2 = 30 - 2 = 28
  });

  it('should handle decimal calculations', async () => {
    const input: CalculateInput = {
      expression: '3.14 * 2'
    };

    const result = await calculate(input);

    expect(result.expression).toEqual('3.14 * 2');
    expect(result.result).toEqual('6.28');
  });

  it('should save calculation to database', async () => {
    const input: CalculateInput = {
      expression: '5 * 6'
    };

    const result = await calculate(input);

    // Query database to verify record was saved
    const records = await db.select()
      .from(calculatorHistoryTable)
      .where(eq(calculatorHistoryTable.id, result.id))
      .execute();

    expect(records).toHaveLength(1);
    expect(records[0].expression).toEqual('5 * 6');
    expect(records[0].result).toEqual('30');
    expect(records[0].created_at).toBeInstanceOf(Date);
  });

  it('should reject invalid expressions with letters', async () => {
    const input: CalculateInput = {
      expression: '2 + a'
    };

    await expect(calculate(input)).rejects.toThrow(/invalid characters/i);
  });

  it('should reject empty expressions', async () => {
    const input: CalculateInput = {
      expression: ''
    };

    await expect(calculate(input)).rejects.toThrow(/invalid expression/i);
  });

  it('should reject expressions with only operators', async () => {
    const input: CalculateInput = {
      expression: '+ - *'
    };

    await expect(calculate(input)).rejects.toThrow(/invalid expression/i);
  });

  it('should handle division by zero gracefully', async () => {
    const input: CalculateInput = {
      expression: '5 / 0'
    };

    await expect(calculate(input)).rejects.toThrow(/unable to evaluate/i);
  });
});
