import { cn } from "@/lib/utils";

interface SquareProps {
  value: string | null;
  onSquareClick: () => void;
  isWinningSquare?: boolean;
}

export function Square({ value, onSquareClick, isWinningSquare = false }: SquareProps) {
  return (
    <button
      className={cn(
        "w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18",
        "bg-game-board border-2 border-border rounded-lg",
        "flex items-center justify-center",
        "text-2xl md:text-3xl lg:text-4xl font-bold",
        "transition-all duration-200 ease-in-out",
        "hover:bg-square-hover hover:scale-105",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "shadow-[var(--shadow-soft)]",
        {
          "text-player-x": value === "X",
          "text-player-o": value === "O",
          "bg-winner-celebration text-white animate-pulse-glow": isWinningSquare,
          "cursor-not-allowed opacity-50": value !== null,
          "cursor-pointer": value === null,
        }
      )}
      onClick={onSquareClick}
      disabled={value !== null}
    >
      {value && (
        <span className="animate-bounce-in">
          {value}
        </span>
      )}
    </button>
  );
}