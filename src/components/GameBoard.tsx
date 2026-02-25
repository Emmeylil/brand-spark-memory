import MemoryCard from "./MemoryCard";
import type { Difficulty } from "@/hooks/useMemoryGame";

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
  animState: "idle" | "shake" | "match";
}

interface GameBoardProps {
  cards: Card[];
  difficulty: Difficulty;
  moves: number;
  maxMoves: number;
  timeLeft: number;
  matchedPairs: number;
  totalPairs: number;
  onFlip: (id: number) => void;
  onBack: () => void;
}

const gridClass: Record<Difficulty, string> = {
  easy: "grid-cols-3",
  medium: "grid-cols-4",
  hard: "grid-cols-4",
};

const GameBoard = ({
  cards, difficulty, moves, maxMoves, timeLeft,
  matchedPairs, totalPairs, onFlip, onBack,
}: GameBoardProps) => {
  const movesLeft = maxMoves - moves;
  const timeWarning = timeLeft <= 10;
  const movesWarning = movesLeft <= 3;

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto px-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          ← Back
        </button>
        <p className="text-xs text-muted-foreground">
          {matchedPairs}/{totalPairs} pairs
        </p>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Flip the cards to find matching pairs
      </p>

      {/* Grid */}
      <div className={`grid ${gridClass[difficulty]} gap-2 sm:gap-3`}>
        {cards.map((card) => (
          <MemoryCard
            key={card.id}
            icon={card.icon}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
            animState={card.animState}
            onClick={() => onFlip(card.id)}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center bg-card rounded-2xl p-4 border border-border">
        <div className="text-center">
          <p className={`text-xl font-display ${timeWarning ? "text-destructive animate-pulse-glow" : "text-foreground"}`}>
            {timeLeft}s
          </p>
          <p className="text-xs text-muted-foreground">Time</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <p className={`text-xl font-display ${movesWarning ? "text-destructive animate-pulse-glow" : "text-foreground"}`}>
            {movesLeft}
          </p>
          <p className="text-xs text-muted-foreground">Moves left</p>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
