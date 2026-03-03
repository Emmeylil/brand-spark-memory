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
  flips: number;
  score: number;
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
  cards, difficulty, flips, score, timeLeft,
  matchedPairs, totalPairs, onFlip, onBack,
}: GameBoardProps) => {
  const timeWarning = timeLeft <= 10;

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

      {/* Score display */}
      <div className="text-center">
        <p className="text-3xl font-display text-primary font-bold tracking-tight">{score} pts</p>
        <p className="text-xs text-muted-foreground mt-0.5">Flip the cards to find matching pairs</p>
      </div>

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
          <p className="text-xl font-display text-foreground">
            {flips}
          </p>
          <p className="text-xs text-muted-foreground">Flips</p>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
