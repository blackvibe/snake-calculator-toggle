
import { serial, text, pgTable, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Enum for app modes - using a different name to avoid conflicts
export const appModeTypeEnum = pgEnum('app_mode_type', ['snake', 'calculator']);

// Game states table for Snake game
export const gameStatesTable = pgTable('game_states', {
  id: serial('id').primaryKey(),
  player_name: text('player_name').notNull(),
  score: integer('score').notNull().default(0),
  game_data: text('game_data').notNull().default('{}'), // JSON string for game state
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Calculator history table
export const calculatorHistoryTable = pgTable('calculator_history', {
  id: serial('id').primaryKey(),
  expression: text('expression').notNull(),
  result: text('result').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// App mode table for tracking current mode
export const appModeTable = pgTable('app_mode_settings', {
  id: serial('id').primaryKey(),
  current_mode: appModeTypeEnum('current_mode').notNull().default('snake'),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Leaderboard table for high scores
export const leaderboardTable = pgTable('leaderboard', {
  id: serial('id').primaryKey(),
  player_name: text('player_name').notNull(),
  high_score: integer('high_score').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// TypeScript types for the table schemas
export type GameState = typeof gameStatesTable.$inferSelect;
export type NewGameState = typeof gameStatesTable.$inferInsert;
export type CalculatorHistory = typeof calculatorHistoryTable.$inferSelect;
export type NewCalculatorHistory = typeof calculatorHistoryTable.$inferInsert;
export type AppMode = typeof appModeTable.$inferSelect;
export type NewAppMode = typeof appModeTable.$inferInsert;
export type LeaderboardEntry = typeof leaderboardTable.$inferSelect;
export type NewLeaderboardEntry = typeof leaderboardTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  gameStates: gameStatesTable,
  calculatorHistory: calculatorHistoryTable,
  appMode: appModeTable,
  leaderboard: leaderboardTable
};
