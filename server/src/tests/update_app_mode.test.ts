
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { appModeTable } from '../db/schema';
import { type UpdateAppModeInput } from '../schema';
import { updateAppMode } from '../handlers/update_app_mode';
import { eq } from 'drizzle-orm';

describe('updateAppMode', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a new app mode record when none exists', async () => {
    const input: UpdateAppModeInput = {
      current_mode: 'calculator'
    };

    const result = await updateAppMode(input);

    expect(result.current_mode).toEqual('calculator');
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update existing app mode record', async () => {
    // First create an initial record
    await db.insert(appModeTable)
      .values({
        current_mode: 'snake'
      })
      .execute();

    const input: UpdateAppModeInput = {
      current_mode: 'calculator'
    };

    const result = await updateAppMode(input);

    expect(result.current_mode).toEqual('calculator');
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated app mode to database', async () => {
    const input: UpdateAppModeInput = {
      current_mode: 'calculator'
    };

    const result = await updateAppMode(input);

    // Verify the record exists in database
    const appModes = await db.select()
      .from(appModeTable)
      .where(eq(appModeTable.id, result.id))
      .execute();

    expect(appModes).toHaveLength(1);
    expect(appModes[0].current_mode).toEqual('calculator');
    expect(appModes[0].updated_at).toBeInstanceOf(Date);
  });

  it('should switch between different modes', async () => {
    // Set to snake first
    const snakeInput: UpdateAppModeInput = {
      current_mode: 'snake'
    };

    const snakeResult = await updateAppMode(snakeInput);
    expect(snakeResult.current_mode).toEqual('snake');

    // Switch to calculator
    const calculatorInput: UpdateAppModeInput = {
      current_mode: 'calculator'
    };

    const calculatorResult = await updateAppMode(calculatorInput);
    expect(calculatorResult.current_mode).toEqual('calculator');
    expect(calculatorResult.id).toEqual(snakeResult.id); // Should be same record

    // Verify only one record exists
    const allModes = await db.select()
      .from(appModeTable)
      .execute();

    expect(allModes).toHaveLength(1);
    expect(allModes[0].current_mode).toEqual('calculator');
  });

  it('should update timestamp when mode changes', async () => {
    // Create initial record
    const firstInput: UpdateAppModeInput = {
      current_mode: 'snake'
    };

    const firstResult = await updateAppMode(firstInput);
    const firstTimestamp = firstResult.updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update mode
    const secondInput: UpdateAppModeInput = {
      current_mode: 'calculator'
    };

    const secondResult = await updateAppMode(secondInput);
    const secondTimestamp = secondResult.updated_at;

    expect(secondTimestamp.getTime()).toBeGreaterThan(firstTimestamp.getTime());
  });
});
