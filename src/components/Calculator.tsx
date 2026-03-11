import React, { useState, useEffect, useRef } from 'react';
import { create, all } from 'mathjs';
import { 
  Delete, 
  RotateCcw, 
  Equal, 
  Plus, 
  Minus, 
  X, 
  Divide, 
  Percent, 
  Info,
  ChevronRight,
  ChevronLeft,
  Settings,
  History
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const math = create(all);

interface CalculatorProps {
  onResult?: (result: string) => void;
  onExpressionChange?: (expression: string) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onResult, onExpressionChange }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<{ expr: string; res: string }[]>([]);
  const [isScientific, setIsScientific] = useState(true);
  const displayRef = useRef<HTMLDivElement>(null);

  const handleNumber = (num: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    if (display === 'Error') return;
    setExpression(expression + display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleFunction = (fn: string) => {
    if (display === 'Error') return;
    try {
      const val = display === '0' ? '' : display;
      const newExpr = `${fn}(${val})`;
      const result = math.evaluate(newExpr);
      setDisplay(result.toString());
      setHistory([{ expr: newExpr, res: result.toString() }, ...history.slice(0, 9)]);
    } catch (err) {
      setDisplay('Error');
    }
  };

  const calculate = () => {
    try {
      const fullExpr = expression + display;
      const result = math.evaluate(fullExpr);
      const resultStr = result.toString();
      setDisplay(resultStr);
      setExpression('');
      setHistory([{ expr: fullExpr, res: resultStr }, ...history.slice(0, 9)]);
      if (onResult) onResult(resultStr);
    } catch (err) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  useEffect(() => {
    if (onExpressionChange) onExpressionChange(expression + display);
  }, [display, expression, onExpressionChange]);

  const Button = ({ 
    children, 
    onClick, 
    className, 
    variant = 'default' 
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string;
    variant?: 'default' | 'operator' | 'action' | 'scientific';
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "h-14 rounded-xl text-lg font-medium transition-all active:scale-95 flex items-center justify-center",
        variant === 'default' && "bg-white/5 hover:bg-white/10 text-white",
        variant === 'operator' && "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400",
        variant === 'action' && "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400",
        variant === 'scientific' && "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-sm",
        className
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full max-w-md bg-[#151619] rounded-3xl p-6 shadow-2xl border border-white/5 flex flex-col gap-6">
      {/* Display Area */}
      <div className="flex flex-col items-end justify-end min-h-[120px] bg-black/20 rounded-2xl p-4 overflow-hidden border border-white/5">
        <div className="text-white/40 text-sm font-mono truncate w-full text-right mb-1">
          {expression}
        </div>
        <div 
          ref={displayRef}
          className="text-white text-4xl font-mono truncate w-full text-right"
        >
          {display}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <Button onClick={clear} variant="action">C</Button>
        <Button onClick={backspace} variant="action"><Delete size={20} /></Button>
        <Button onClick={() => handleOperator('%')} variant="operator">%</Button>
        <Button onClick={() => handleOperator('/')} variant="operator"><Divide size={20} /></Button>

        {/* Scientific Row Toggle */}
        {isScientific && (
          <>
            <Button onClick={() => handleFunction('sin')} variant="scientific">sin</Button>
            <Button onClick={() => handleFunction('cos')} variant="scientific">cos</Button>
            <Button onClick={() => handleFunction('tan')} variant="scientific">tan</Button>
            <Button onClick={() => handleFunction('log')} variant="scientific">log</Button>
            <Button onClick={() => handleFunction('sqrt')} variant="scientific">√</Button>
            <Button onClick={() => handleFunction('exp')} variant="scientific">exp</Button>
            <Button onClick={() => handleOperator('^')} variant="scientific">^</Button>
            <Button onClick={() => handleNumber('PI')} variant="scientific">π</Button>
            <Button onClick={() => handleNumber('e')} variant="scientific">e</Button>
          </>
        )}

        {/* Numbers & Operators */}
        <Button onClick={() => handleNumber('7')}>7</Button>
        <Button onClick={() => handleNumber('8')}>8</Button>
        <Button onClick={() => handleNumber('9')}>9</Button>
        <Button onClick={() => handleOperator('*')} variant="operator"><X size={20} /></Button>

        <Button onClick={() => handleNumber('4')}>4</Button>
        <Button onClick={() => handleNumber('5')}>5</Button>
        <Button onClick={() => handleNumber('6')}>6</Button>
        <Button onClick={() => handleOperator('-')} variant="operator"><Minus size={20} /></Button>

        <Button onClick={() => handleNumber('1')}>1</Button>
        <Button onClick={() => handleNumber('2')}>2</Button>
        <Button onClick={() => handleNumber('3')}>3</Button>
        <Button onClick={() => handleOperator('+')} variant="operator"><Plus size={20} /></Button>

        <Button onClick={() => setIsScientific(!isScientific)} variant="default">
          {isScientific ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </Button>
        <Button onClick={() => handleNumber('0')}>0</Button>
        <Button onClick={() => handleNumber('.')}>.</Button>
        <Button onClick={calculate} variant="operator" className="bg-emerald-500 text-black hover:bg-emerald-400">
          <Equal size={24} />
        </Button>
      </div>

      {/* History Footer */}
      {history.length > 0 && (
        <div className="mt-2 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-3">
            <History size={12} />
            Recent History
          </div>
          <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {history.map((item, i) => (
              <div key={i} className="flex justify-between text-xs font-mono">
                <span className="text-white/40">{item.expr} =</span>
                <span className="text-emerald-400">{item.res}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
