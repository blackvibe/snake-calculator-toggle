
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createGameInputSchema,
  updateGameInputSchema,
  calculateInputSchema,
  updateAppModeInputSchema
} from './schema';

// Import handlers
import { createGame } from './handlers/create_game';
import { updateGame } from './handlers/update_game';
import { getGame } from './handlers/get_game';
import { getActiveGames } from './handlers/get_active_games';
import { calculate } from './handlers/calculate';
import { getCalculatorHistory } from './handlers/get_calculator_history';
import { clearCalculatorHistory } from './handlers/clear_calculator_history';
import { getAppMode } from './handlers/get_app_mode';
import { updateAppMode } from './handlers/update_app_mode';
import { getLeaderboard } from './handlers/get_leaderboard';
import { addLeaderboardEntry } from './handlers/add_leaderboard_entry';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Snake game routes
  createGame: publicProcedure
    .input(createGameInputSchema)
    .mutation(({ input }) => createGame(input)),

  updateGame: publicProcedure
    .input(updateGameInputSchema)
    .mutation(({ input }) => updateGame(input)),

  getGame: publicProcedure
    .input(z.number())
    .query(({ input }) => getGame(input)),

  getActiveGames: publicProcedure
    .query(() => getActiveGames()),

  // Calculator routes
  calculate: publicProcedure
    .input(calculateInputSchema)
    .mutation(({ input }) => calculate(input)),

  getCalculatorHistory: publicProcedure
    .input(z.number().optional())
    .query(({ input }) => getCalculatorHistory(input)),

  clearCalculatorHistory: publicProcedure
    .mutation(() => clearCalculatorHistory()),

  // App mode routes
  getAppMode: publicProcedure
    .query(() => getAppMode()),

  updateAppMode: publicProcedure
    .input(updateAppModeInputSchema)
    .mutation(({ input }) => updateAppMode(input)),

  // Leaderboard routes
  getLeaderboard: publicProcedure
    .input(z.number().optional())
    .query(({ input }) => getLeaderboard(input)),

  addLeaderboardEntry: publicProcedure
    .input(z.object({
      playerName: z.string().min(1).max(50),
      score: z.number().int().nonnegative()
    }))
    .mutation(({ input }) => addLeaderboardEntry(input.playerName, input.score)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
