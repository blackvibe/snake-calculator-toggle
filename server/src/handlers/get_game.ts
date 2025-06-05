
import { type GameState } from '../schema';

export declare function getGame(id: number): Promise<GameState | null>;
