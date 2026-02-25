interface EndScreenProps {
  isWon: boolean;
  reward: string | null;
  moves: number;
  difficulty: string;
  onReplay: () => void;
  dailyPlaysLeft: number;
}

const EndScreen = ({ isWon, reward, moves, difficulty, onReplay, dailyPlaysLeft }: EndScreenProps) => {
  return (
    <div className="flex flex-col items-center gap-6 animate-scale-in w-full max-w-sm mx-auto px-4 text-center">
      <div className="text-6xl">
        {isWon ? "🎉" : "😢"}
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-display text-foreground">
          {isWon ? "You Won!" : "Game Over"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {isWon
            ? `Completed ${difficulty} in ${moves} moves!`
            : "Better luck next time — try again!"}
        </p>
      </div>

      {reward && (
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-5 w-full glow-accent">
          <p className="text-accent font-display text-lg">{reward}</p>
          <p className="text-xs text-muted-foreground mt-1">Share with friends to multiply your rewards!</p>
        </div>
      )}

      {!isWon && (
        <div className="bg-card border border-border rounded-2xl p-4 w-full">
          <p className="text-sm text-muted-foreground">💡 Try again to improve your score and unlock rewards!</p>
        </div>
      )}

      <button
        onClick={onReplay}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display text-lg rounded-2xl py-4 transition-all active:scale-[0.98] glow-primary"
      >
        {dailyPlaysLeft > 0 ? "Play Again" : "Back to Menu"}
      </button>

      <p className="text-xs text-muted-foreground">
        {dailyPlaysLeft > 0
          ? `${dailyPlaysLeft} play${dailyPlaysLeft !== 1 ? "s" : ""} remaining today`
          : "Come back tomorrow for more plays!"}
      </p>
    </div>
  );
};

export default EndScreen;
