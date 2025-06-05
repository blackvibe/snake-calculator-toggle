
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/utils/trpc';
import type { CalculatorHistory } from '../../../server/src/schema';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [history, setHistory] = useState<CalculatorHistory[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const historyData = await trpc.getCalculatorHistory.query(20);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load calculator history:', error);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperation: string) => {
    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operation) {
      const currentValue = previousValue || '0';
      const newValue = calculate(currentValue, display, operation);
      
      setDisplay(String(newValue));
      setPreviousValue(String(newValue));
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: string, secondValue: string, operation: string): number => {
    const prev = parseFloat(firstValue);
    const current = parseFloat(secondValue);

    switch (operation) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '×':
        return prev * current;
      case '÷':
        return current !== 0 ? prev / current : 0;
      default:
        return current;
    }
  };

  const performCalculation = async () => {
    if (operation && previousValue !== null) {
      const expression = `${previousValue} ${operation} ${display}`;
      
      try {
        // Calculate locally first for immediate feedback
        const result = calculate(previousValue, display, operation);
        setDisplay(String(result));
        
        // Then save to backend
        const historyEntry = await trpc.calculate.mutate({ 
          expression: expression 
        });
        
        // Update local history
        setHistory((prev: CalculatorHistory[]) => [historyEntry, ...prev].slice(0, 20));
        
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(true);
      } catch (error) {
        console.error('Failed to save calculation:', error);
        setDisplay('Error');
      }
    }
  };

  const clearHistory = async () => {
    try {
      await trpc.clearCalculatorHistory.mutate();
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const buttonClass = "h-16 text-lg font-semibold transition-all duration-200 hover:scale-105";
  const numberButtonClass = `${buttonClass} bg-white/20 hover:bg-white/30 text-white border-white/30`;
  const operatorButtonClass = `${buttonClass} bg-blue-600 hover:bg-blue-700 text-white`;
  const specialButtonClass = `${buttonClass} bg-orange-600 hover:bg-orange-700 text-white`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calculator */}
      <div className="lg:col-span-2">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              🧮 Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Display */}
            <div className="mb-6">
              <div className="bg-black/30 p-4 rounded-lg border border-white/30">
                <div className="text-right">
                  {operation && previousValue && (
                    <div className="text-sm text-white/60 mb-1">
                      {previousValue} {operation}
                    </div>
                  )}
                  <div className="text-3xl font-mono text-white break-all">
                    {display}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-4 gap-3">
              {/* Row 1 */}
              <Button onClick={clear} className={`${specialButtonClass} col-span-2`}>
                Clear
              </Button>
              <Button onClick={() => setDisplay(display.slice(0, -1) || '0')} className={specialButtonClass}>
                ⌫
              </Button>
              <Button onClick={() => performOperation('÷')} className={operatorButtonClass}>
                ÷
              </Button>

              {/* Row 2 */}
              <Button onClick={() => inputNumber('7')} className={numberButtonClass}>
                7
              </Button>
              <Button onClick={() => inputNumber('8')} className={numberButtonClass}>
                8
              </Button>
              <Button onClick={() => inputNumber('9')} className={numberButtonClass}>
                9
              </Button>
              <Button onClick={() => performOperation('×')} className={operatorButtonClass}>
                ×
              </Button>

              {/* Row 3 */}
              <Button onClick={() => inputNumber('4')} className={numberButtonClass}>
                4
              </Button>
              <Button onClick={() => inputNumber('5')} className={numberButtonClass}>
                5
              </Button>
              <Button onClick={() => inputNumber('6')} className={numberButtonClass}>
                6
              </Button>
              <Button onClick={() => performOperation('-')} className={operatorButtonClass}>
                -
              </Button>

              {/* Row 4 */}
              <Button onClick={() => inputNumber('1')} className={numberButtonClass}>
                1
              </Button>
              <Button onClick={() => inputNumber('2')} className={numberButtonClass}>
                2
              </Button>
              <Button onClick={() => inputNumber('3')} className={numberButtonClass}>
                3
              </Button>
              <Button onClick={() => performOperation('+')} className={operatorButtonClass}>
                +
              </Button>

              {/* Row 5 */}
              <Button onClick={() => inputNumber('0')} className={`${numberButtonClass} col-span-2`}>
                0
              </Button>
              <Button onClick={inputDecimal} className={numberButtonClass}>
                .
              </Button>
              <Button onClick={performCalculation} className={`${buttonClass} bg-green-600 hover:bg-green-700 text-white`}>
                =
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <div>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                📊 History
              </CardTitle>
              <Button 
                onClick={clearHistory}
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {history.length === 0 ? (
                  <div className="text-white/60 text-center py-4">
                    No calculations yet
                  </div>
                ) : (
                  history.map((entry: CalculatorHistory) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-lg bg-white/10 border border-white/20"
                    >
                      <div className="text-sm text-white/80 font-mono">
                        {entry.expression}
                      </div>
                      <div className="text-lg text-white font-semibold font-mono">
                        = {entry.result}
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        {entry.created_at.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
