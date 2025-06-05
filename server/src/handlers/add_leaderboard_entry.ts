
import { type LeaderboardEntry } from '../schema';

export declare function addLeaderboardEntry(playerName: string, score: number): Promise<LeaderboardEntry>;
