
import { db } from '../db';
import { calculatorHistoryTable } from '../db/schema';
import { type CalculateInput, type CalculatorHistory } from '../schema';

export const calculate = async (input: CalculateInput): Promise<CalculatorHistory> => {
  try {
    // Evaluate the mathematical expression safely
    const result = evaluateExpression(input.expression);
    
    // Insert calculation record
    const insertResult = await db.insert(calculatorHistoryTable)
      .values({
        expression: input.expression,
        result: result.toString()
      })
      .returning()
      .execute();

    return insertResult[0];
  } catch (error) {
    console.error('Calculation failed:', error);
    throw error;
  }
};

// Safe expression evaluator for basic arithmetic
function evaluateExpression(expression: string): number {
  // Remove whitespace and validate allowed characters
  const cleanExpression = expression.replace(/\s/g, '');
  
  // Prevent empty expressions first
  if (!cleanExpression) {
    throw new Error('Invalid expression');
  }
  
  // Only allow numbers, basic operators, parentheses, and decimal points
  if (!/^[0-9+\-*/.()]+$/.test(cleanExpression)) {
    throw new Error('Invalid characters in expression');
  }
  
  // Prevent expressions with only operators
  if (/^[+\-*/.()]+$/.test(cleanExpression)) {
    throw new Error('Invalid expression');
  }
  
  try {
    // Use Function constructor for safer evaluation than eval()
    const result = new Function('return ' + cleanExpression)();
    
    // Check if result is a valid number
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Invalid calculation result');
    }
    
    return result;
  } catch (error) {
    throw new Error('Unable to evaluate expression');
  }
}
