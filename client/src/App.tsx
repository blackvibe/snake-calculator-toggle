
import { useState, useEffect, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { SnakeGame } from '@/components/SnakeGame';
import { Calculator } from '@/components/Calculator';

function App() {
  const [currentMode, setCurrentMode] = useState<'snake' | 'calculator'>('snake');
  const [isLoading, setIsLoading] = useState(true);

  const loadAppMode = useCallback(async () => {
    try {
      const mode = await trpc.getAppMode.query();
      setCurrentMode(mode.current_mode);
    } catch (error) {
      console.error('Failed to load app mode:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppMode();
  }, [loadAppMode]);

  const handleModeToggle = async (checked: boolean) => {
    const newMode = checked ? 'calculator' : 'snake';
    setCurrentMode(newMode);
    
    try {
      await trpc.updateAppMode.mutate({ current_mode: newMode });
    } catch (error) {
      console.error('Failed to update app mode:', error);
      // Revert on error
      setCurrentMode(currentMode);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header with Mode Toggle */}
        <Card className="mb-6 bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                🎮 Game Hub
              </CardTitle>
              
              <div className="flex items-center gap-4">
                <span className={`text-sm font-medium transition-colors ${
                  currentMode === 'snake' ? 'text-green-400' : 'text-white/60'
                }`}>
                  🐍 Snake
                </span>
                
                <Switch
                  checked={currentMode === 'calculator'}
                  onCheckedChange={handleModeToggle}
                  className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-green-500"
                />
                
                <span className={`text-sm font-medium transition-colors ${
                  currentMode === 'calculator' ? 'text-blue-400' : 'text-white/60'
                }`}>
                  🧮 Calculator
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="transition-all duration-500 ease-in-out">
          {currentMode === 'snake' ? (
            <SnakeGame />
          ) : (
            <Calculator />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
