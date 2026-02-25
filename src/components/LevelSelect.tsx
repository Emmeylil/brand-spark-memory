import { type Difficulty } from "@/hooks/useMemoryGame";

interface LevelSelectProps {
  onSelect: (difficulty: Difficulty) => void;
  dailyPlaysLeft: number;
}

const levels: { key: Difficulty; label: string; desc: string; cards: number }[] = [
  { key: "easy", label: "Easy", desc: "3×2 Grid", cards: 6 },
  { key: "medium", label: "Medium", desc: "4×3 Grid", cards: 12 },
  { key: "hard", label: "Hard", desc: "4×4 Grid", cards: 16 },
];

const LevelSelect = ({ onSelect, dailyPlaysLeft }: LevelSelectProps) => {
  const noPlays = dailyPlaysLeft <= 0;

  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in w-full max-w-sm mx-auto px-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-display text-foreground">
          Memory<span className="text-primary">Match</span>
        </h1>
        <p className="text-muted-foreground text-sm">Flip the cards to find matching pairs</p>
      </div>

      {noPlays ? (
        <div className="text-center space-y-3 bg-card rounded-2xl p-6 border border-border">
          <p className="text-xl font-display text-accent">⏰ Come back tomorrow!</p>
          <p className="text-muted-foreground text-sm">You've used all your daily plays. Your plays reset each day.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 w-full">
            {levels.map((level) => (
              <button
                key={level.key}
                onClick={() => onSelect(level.key)}
                className="group relative bg-card hover:bg-muted border border-border rounded-2xl p-4 text-left transition-all active:scale-[0.98] hover:glow-primary"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">
                      {level.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">{level.desc} · {level.cards} cards</p>
                  </div>
                  <div className="text-2xl">
                    {level.key === "easy" ? "🌟" : level.key === "medium" ? "🔥" : "💎"}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {dailyPlaysLeft} play{dailyPlaysLeft !== 1 ? "s" : ""} remaining today
          </p>
        </>
      )}
    </div>
  );
};

export default LevelSelect;
