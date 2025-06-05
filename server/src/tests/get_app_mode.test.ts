
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { appModeTable } from '../db/schema';
import { getAppMode } from '../handlers/get_app_mode';

describe('getAppMode', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return existing app mode', async () => {
    // Create a test app mode
    await db.insert(appModeTable)
      .values({
        current_mode: 'calculator'
      })
      .execute();

    const result = await getAppMode();

    expect(result.current_mode).toEqual('calculator');
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create default app mode when none exists', async () => {
    // No app mode exists initially
    const result = await getAppMode();

    // Should create and return default mode
    expect(result.current_mode).toEqual('snake');
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify it was saved to database
    const modes = await db.select()
      .from(appModeTable)
      .execute();

    expect(modes).toHaveLength(1);
    expect(modes[0].current_mode).toEqual('snake');
  });

  it('should return first app mode when multiple exist', async () => {
    // Create multiple app modes (edge case)
    await db.insert(appModeTable)
      .values([
        { current_mode: 'snake' },
        { current_mode: 'calculator' }
      ])
      .execute();

    const result = await getAppMode();

    // Should return the first one due to limit(1)
    expect(result.current_mode).toEqual('snake');
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});
