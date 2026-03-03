import LevelSelect from "@/components/LevelSelect";
import GameBoard from "@/components/GameBoard";
import EndScreen from "@/components/EndScreen";
import { useMemoryGame } from "@/hooks/useMemoryGame";

const Index = () => {
  const { state, startGame, flipCard, resetGame } = useMemoryGame();
  const { isStarted, isWon, isLost } = state;

  const showEnd = isWon || isLost;

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center py-8">
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
        />
      )}
    </div>
  );
};

export default Index;
