
import { z } from 'zod';

// Game state schema for Snake game
export const gameStateSchema = z.object({
  id: z.number(),
  player_name: z.string(),
  score: z.number().int().nonnegative(),
  game_data: z.string(), // JSON string containing snake position, food, etc.
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type GameState = z.infer<typeof gameStateSchema>;

// Input schema for creating a new game
export const createGameInputSchema = z.object({
  player_name: z.string().min(1).max(50),
  score: z.number().int().nonnegative().default(0),
  game_data: z.string().default('{}'),
  is_active: z.boolean().default(true)
});

export type CreateGameInput = z.infer<typeof createGameInputSchema>;

// Input schema for updating game state
export const updateGameInputSchema = z.object({
  id: z.number(),
  score: z.number().int().nonnegative().optional(),
  game_data: z.string().optional(),
  is_active: z.boolean().optional()
});

export type UpdateGameInput = z.infer<typeof updateGameInputSchema>;

// Calculator history schema
export const calculatorHistorySchema = z.object({
  id: z.number(),
  expression: z.string(),
  result: z.string(),
  created_at: z.coerce.date()
});

export type CalculatorHistory = z.infer<typeof calculatorHistorySchema>;

// Input schema for calculator operations
export const calculateInputSchema = z.object({
  expression: z.string().min(1).max(200)
});

export type CalculateInput = z.infer<typeof calculateInputSchema>;

// App mode schema for toggling between snake and calculator
export const appModeSchema = z.object({
  id: z.number(),
  current_mode: z.enum(['snake', 'calculator']),
  updated_at: z.coerce.date()
});

export type AppMode = z.infer<typeof appModeSchema>;

// Input schema for updating app mode
export const updateAppModeInputSchema = z.object({
  current_mode: z.enum(['snake', 'calculator'])
});

export type UpdateAppModeInput = z.infer<typeof updateAppModeInputSchema>;

// Leaderboard entry schema
export const leaderboardEntrySchema = z.object({
  id: z.number(),
  player_name: z.string(),
  high_score: z.number().int().nonnegative(),
  created_at: z.coerce.date()
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
