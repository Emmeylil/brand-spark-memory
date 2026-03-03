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
  const progress = (matchedPairs / totalPairs) * 100;

  return (
    <div className="flex flex-col gap-5 w-full max-w-sm mx-auto px-4 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-primary transition-colors text-sm font-black uppercase tracking-widest flex items-center gap-1.5"
        >
          <span className="text-lg">←</span> Exit
        </button>
        <div className="glass-card text-primary px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
          {matchedPairs} / {totalPairs} Matched
        </div>
      </div>

      {/* Score */}
      <div className="text-center">
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">Score</p>
        <p className="text-5xl font-black text-primary tracking-tighter">{score.toLocaleString()}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Grid */}
      <div className={`grid ${gridClass[difficulty]} gap-2.5 p-3 glass-card rounded-3xl shadow-lg`}>
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
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center">
          <p className={`text-3xl font-black ${timeWarning ? "text-destructive animate-pulse" : ""}`}>
            {timeLeft}s
          </p>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Time</p>
        </div>
        <div className="glass-card rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center">
          <p className="text-3xl font-black">{flips}</p>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Flips</p>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
