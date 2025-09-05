import { useState, useEffect } from 'react';
import { Board, calculateWinner, getWinningLine } from './Board';
import { AudioControls } from './AudioControls';
import { useGameAudio } from '@/hooks/useGameAudio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, Trophy } from 'lucide-react';

export function Game() {
  const [history, setHistory] = useState<(string | null)[][]>([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [prevWinner, setPrevWinner] = useState<string | null>(null);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const winner = calculateWinner(currentSquares);
  const winningLine = getWinningLine(currentSquares);
  
  const {
    playMove,
    playWin,
    playDraw,
    playReset,
    toggleBackgroundMusic,
    setVolume,
    isMusicPlaying
  } = useGameAudio();

  // Play sounds when game state changes
  useEffect(() => {
    if (winner && !prevWinner) {
      playWin();
      setPrevWinner(winner);
    } else if (!winner && currentSquares.every(square => square !== null) && currentMove > 0) {
      playDraw();
    }
  }, [winner, currentSquares, currentMove, playWin, playDraw, prevWinner]);

  function handlePlay(nextSquares: (string | null)[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function handleMove(player: 'X' | 'O') {
    playMove(player);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  function resetGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setPrevWinner(null);
    playReset();
  }

  const moves = history.map((squares, move) => {
    const description = move > 0 
      ? `Ir hacia la jugada #${move}` 
      : 'Ir al inicio del juego';
    
    const isCurrentMove = move === currentMove;
    
    return (
      <li key={move}>
        <Button
          variant={isCurrentMove ? "default" : "outline"}
          size="sm"
          onClick={() => jumpTo(move)}
          className="w-full justify-start text-sm"
        >
          {description}
        </Button>
      </li>
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 pt-1 pb-2 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center justify-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            Tres-en-Linea-X
          </h1>
          <p className="text-sm text-muted-foreground">
            Juega al clásico de Tres en Linea
          </p>
        </div>

        {/* Profile Photo */}
        <div className="flex justify-end mb-1">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg">
            <img 
              src="/lovable-uploads/c3d956bb-c07d-4dd3-9e1d-c7d0d4405307.png" 
              alt="Profile" 
              className="w-full h-full object-cover object-[center_15%]"
              style={{ objectPosition: 'center 20%' }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 items-start mb-4">
          {/* Game Board */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="scale-110">
              <Board 
                xIsNext={xIsNext} 
                squares={currentSquares} 
                onPlay={handlePlay}
                onMove={handleMove}
                winningLine={winningLine}
              />
            </div>
          </div>

          {/* Game Info */}
          <div className="space-y-4">
            <Card className="shadow-[var(--shadow-medium)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Historial del Juego
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <ol className="space-y-2">{moves}</ol>
                </div>
                
                {(winner || currentSquares.every(square => square !== null)) && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <Button 
                      onClick={resetGame}
                      className="w-full"
                      size="default"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Nuevo Juego
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Stats */}
            <Card className="shadow-[var(--shadow-medium)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                  <span className="font-medium">Jugadas totales:</span>
                  <span className="text-lg font-bold">{currentMove}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                  <span className="font-medium">Turno actual:</span>
                  <span className={`text-lg font-bold ${xIsNext ? 'text-player-x' : 'text-player-o'}`}>
                    {xIsNext ? 'X' : 'O'}
                  </span>
                </div>
                {winner && (
                  <div className="flex justify-between items-center p-3 bg-winner-celebration text-white rounded-lg">
                    <span className="font-medium">Ganador:</span>
                    <span className="text-lg font-bold">{winner}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Audio Controls - Moved to bottom */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <AudioControls
              onToggleMusic={toggleBackgroundMusic}
              onVolumeChange={setVolume}
              isMusicPlaying={isMusicPlaying}
            />
          </div>
        </div>
      </div>
    </div>
  );
}