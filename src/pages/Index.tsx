import LevelSelect from "@/components/LevelSelect";
import GameBoard from "@/components/GameBoard";
import EndScreen from "@/components/EndScreen";
import { useMemoryGame } from "@/hooks/useMemoryGame";
import { Link } from "react-router-dom";

const Index = () => {
  const { state, startGame, flipCard, resetGame } = useMemoryGame();
  const { isStarted, isWon, isLost } = state;

  const showEnd = isWon || isLost;

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center py-8 relative">
      {!isStarted && !showEnd && (
        <LevelSelect onSelect={startGame} dailyPlaysLeft={state.dailyPlaysLeft} />
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
          reward={state.reward}
          score={state.score}
          flips={state.flips}
          difficulty={state.difficulty}
          onReplay={resetGame}
          dailyPlaysLeft={state.dailyPlaysLeft}
          timeLeft={state.timeLeft}
        />
      )}

      {!isStarted && !showEnd && (
        <div className="absolute top-4 right-4 animate-fade-in">
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
