import LevelSelect from "@/components/LevelSelect";
import GameBoard from "@/components/GameBoard";
import EndScreen from "@/components/EndScreen";
import { useMemoryGame } from "@/hooks/useMemoryGame";
import { Link } from "react-router-dom";
import { Confetti } from "@/components/Confetti";
import { AnniversaryBackground } from "@/components/AnniversaryBackground";
import Leaderboard from "@/components/Leaderboard";

const Index = () => {
  const { state, startGame, flipCard, resetGame } = useMemoryGame();
  const { isStarted, isWon, isLost } = state;

  const showEnd = isWon || isLost;

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center py-8 relative overflow-hidden">
      <AnniversaryBackground />
      <Confetti />

      <div className="relative z-10 w-full flex flex-col items-center justify-center gap-8 py-4">
        {!isStarted && !showEnd && (
          <div className="w-full max-w-sm flex flex-col items-center gap-8 px-4 animate-fade-in">
            <LevelSelect onSelect={startGame} dailyPlaysLeft={state.dailyPlaysLeft} />
            <Leaderboard />
          </div>
        )}

        {isStarted && !showEnd && (
          <GameBoard
            cards={state.cards}
            difficulty={state.difficulty}
            flips={state.flips}
            score={state.score}
            timeLeft={state.timeLeft}
            matchedPairs={state.matchedPairs}
            totalPairs={state.totalPairs}
            onFlip={flipCard}
            onBack={resetGame}
          />
        )}

        {showEnd && (
          <EndScreen
            isWon={isWon}
            score={state.score}
            flips={state.flips}
            difficulty={state.difficulty}
            onReplay={resetGame}
            dailyPlaysLeft={state.dailyPlaysLeft}
            timeLeft={state.timeLeft}
          />
        )}
      </div>

      {!isStarted && !showEnd && (
        <div className="absolute top-4 right-4 animate-fade-in z-20">
          <Link 
            to="/admin" 
            className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors bg-white/50 hover:bg-white/80 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm"
          >
            Admin ⚡
          </Link>
        </div>
      )}
    </div>
  );
};

export default Index;
