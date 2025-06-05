
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import type { LeaderboardEntry } from '../../../server/src/schema';

interface Position {
  x: number;
  y: number;
}

interface GameData {
  snake: Position[];
  food: Position;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };

export function SnakeGame() {
  const [gameState, setGameState] = useState<GameData>({
    snake: INITIAL_SNAKE,
    food: INITIAL_FOOD,
    direction: 'RIGHT'
  });
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  
  const gameLoopRef = useRef<number | null>(null);
  const directionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');

  const loadLeaderboard = useCallback(async () => {
    try {
      const entries = await trpc.getLeaderboard.query(10);
      setLeaderboard(entries);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const generateFood = useCallback((): Position => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  }, []);

  const moveSnake = useCallback(() => {
    setGameState((prevState: GameData) => {
      const newSnake = [...prevState.snake];
      const head = { ...newSnake[0] };

      // Move head based on direction
      switch (directionRef.current) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return prevState;
      }

      // Check self collision
      if (newSnake.some((segment: Position) => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return prevState;
      }

      newSnake.unshift(head);

      // Check food collision
      let newFood = prevState.food;
      if (head.x === prevState.food.x && head.y === prevState.food.y) {
        setScore((prev: number) => prev + 10);
        newFood = generateFood();
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }

      return {
        ...prevState,
        snake: newSnake,
        food: newFood,
        direction: directionRef.current
      };
    });
  }, [generateFood]);

  const startGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name!');
      return;
    }

    try {
      const newGame = await trpc.createGame.mutate({
        player_name: playerName.trim(),
        score: 0,
        game_data: JSON.stringify({
          snake: INITIAL_SNAKE,
          food: INITIAL_FOOD,
          direction: 'RIGHT'
        }),
        is_active: true
      });

      setCurrentGameId(newGame.id);
      setGameState({
        snake: INITIAL_SNAKE,
        food: INITIAL_FOOD,
        direction: 'RIGHT'
      });
      setScore(0);
      setIsPlaying(true);
      setGameOver(false);
      directionRef.current = 'RIGHT';

      // Start game loop
      gameLoopRef.current = window.setInterval(moveSnake, 150);
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const endGame = useCallback(async () => {
    if (gameLoopRef.current) {
      window.clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    if (currentGameId) {
      try {
        await trpc.updateGame.mutate({
          id: currentGameId,
          score: score,
          game_data: JSON.stringify(gameState),
          is_active: false
        });

        // Add to leaderboard
        await trpc.addLeaderboardEntry.mutate({
          playerName: playerName,
          score: score
        });

        await loadLeaderboard();
      } catch (error) {
        console.error('Failed to save game:', error);
      }
    }

    setIsPlaying(false);
    setCurrentGameId(null);
  }, [currentGameId, score, gameState, playerName, loadLeaderboard]);

  const resetGame = () => {
    if (gameLoopRef.current) {
      window.clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    setGameState({
      snake: INITIAL_SNAKE,
      food: INITIAL_FOOD,
      direction: 'RIGHT'
    });
    setScore(0);
    setIsPlaying(false);
    setGameOver(false);
    setCurrentGameId(null);
    directionRef.current = 'RIGHT';
  };

  useEffect(() => {
    if (gameOver) {
      endGame();
    }
  }, [gameOver, endGame]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (directionRef.current !== 'DOWN') directionRef.current = 'UP';
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (directionRef.current !== 'UP') directionRef.current = 'DOWN';
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (directionRef.current !== 'RIGHT') directionRef.current = 'LEFT';
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (directionRef.current !== 'LEFT') directionRef.current = 'RIGHT';
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        window.clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Game Board */}
      <div className="lg:col-span-2">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                🐍 Snake Game
              </CardTitle>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Score: {score}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Game Controls */}
            <div className="mb-4 space-y-3">
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlayerName(e.target.value)}
                disabled={isPlaying}
                className="bg-white/20 border-white/30 text-white placeholder-white/60"
              />
              <div className="flex gap-2">
                {!isPlaying ? (
                  <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
                    🎮 Start Game
                  </Button>
                ) : (
                  <Button onClick={endGame} variant="destructive">
                    ⏹️ End Game
                  </Button>
                )}
                <Button onClick={resetGame} variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  🔄 Reset
                </Button>
              </div>
            </div>

            {/* Game Board */}
            <div className="relative">
              <div
                className="grid gap-0 border-2 border-white/30 rounded-lg overflow-hidden bg-black/30"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  aspectRatio: '1'
                }}
              >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                  const x = index % GRID_SIZE;
                  const y = Math.floor(index / GRID_SIZE);
                  
                  const isSnake = gameState.snake.some((segment: Position) => 
                    segment.x === x && segment.y === y
                  );
                  const isHead = gameState.snake[0]?.x === x && gameState.snake[0]?.y === y;
                  const isFood = gameState.food.x === x && gameState.food.y === y;

                  return (
                    <div
                      key={index}
                      className={`aspect-square border border-white/10 ${
                        isSnake
                          ? isHead
                            ? 'bg-green-400'
                            : 'bg-green-600'
                          : isFood
                          ? 'bg-red-500'
                          : 'bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>

              {gameOver && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <div className="text-2xl font-bold mb-2">🎮 Game Over!</div>
                    <div className="text-lg">Final Score: {score}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls Info */}
            <div className="mt-4 text-sm text-white/70 text-center">
              Use arrow keys to control the snake • Eat red food to grow • Avoid walls and yourself
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <div>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              🏆 Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <div className="text-white/60 text-center py-4">
                  No scores yet! Be the first to play!
                </div>
              ) : (
                leaderboard.map((entry: LeaderboardEntry, index: number) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0
                        ? 'bg-yellow-500/20 border border-yellow-500/30'
                        : index === 1
                        ? 'bg-gray-300/20 border border-gray-300/30'
                        : index === 2
                        ? 'bg-orange-600/20 border border-orange-600/30'
                        : 'bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                      </span>
                      <span className="text-white font-medium">
                        {entry.player_name}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {entry.high_score}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
