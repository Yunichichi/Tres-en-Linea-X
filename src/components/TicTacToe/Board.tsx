import { Square } from "./Square";
import { cn } from "@/lib/utils";

interface BoardProps {
  xIsNext: boolean;
  squares: (string | null)[];
  onPlay: (squares: (string | null)[]) => void;
  winningLine?: number[] | null;
  onMove?: (player: 'X' | 'O') => void;
}

export function Board({ xIsNext, squares, onPlay, winningLine, onMove }: BoardProps) {
  function handleClick(i: number) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    const currentPlayer = xIsNext ? 'X' : 'O';
    nextSquares[i] = currentPlayer;
    
    // Play move sound
    if (onMove) {
      onMove(currentPlayer);
    }
    
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Ganador: ' + winner;
  } else if (squares.every(square => square !== null)) {
    status = '¡Empate!';
  } else {
    status = 'Siguiente jugador: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div 
        className={cn(
          "text-xl md:text-2xl font-semibold text-center px-6 py-3 rounded-full",
          "shadow-[var(--shadow-medium)] transition-all duration-300",
          {
            "bg-gradient-to-r from-winner-celebration to-green-400 text-white animate-pulse-glow": winner,
            "bg-card text-card-foreground": !winner,
          }
        )}
      >
        {status}
      </div>
      
      <div 
        className={cn(
          "grid grid-cols-3 gap-2 md:gap-3 p-4 bg-card rounded-2xl",
          "shadow-[var(--shadow-strong)] border border-border",
          "transition-all duration-300"
        )}
      >
        {squares.map((square, i) => (
          <Square
            key={i}
            value={square}
            onSquareClick={() => handleClick(i)}
            isWinningSquare={winningLine?.includes(i)}
          />
        ))}
      </div>
    </div>
  );
}

export function calculateWinner(squares: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export function getWinningLine(squares: (string | null)[]): number[] | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return null;
}