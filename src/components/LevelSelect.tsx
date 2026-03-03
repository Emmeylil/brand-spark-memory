import { type Difficulty } from "@/hooks/useMemoryGame";

interface LevelSelectProps {
  onSelect: (difficulty: Difficulty) => void;
  dailyPlaysLeft: number;
}

const levels: { key: Difficulty; label: string; desc: string; cards: number; emoji: string; color: string }[] = [
  { key: "easy", label: "Easy", desc: "3×2 Grid", cards: 6, emoji: "🎁", color: "from-green-400 to-emerald-500" },
  { key: "medium", label: "Medium", desc: "4×3 Grid", cards: 12, emoji: "🚀", color: "from-primary to-orange-500" },
  { key: "hard", label: "Hard", desc: "4×4 Grid", cards: 16, emoji: "💎", color: "from-red-400 to-rose-500" },
];

const LevelSelect = ({ onSelect, dailyPlaysLeft }: LevelSelectProps) => {
  const noPlays = dailyPlaysLeft <= 0;

  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in w-full max-w-sm mx-auto px-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-black text-3xl tracking-tighter shadow-lg glow-primary transform -rotate-2">
            JUMIA
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Match<span className="text-primary">Mania</span>
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Flip cards to win exclusive rewards!</p>
        </div>
      </div>

      {noPlays ? (
        <div className="text-center space-y-4 glass-card rounded-3xl p-8 shadow-xl w-full">
          <div className="text-6xl mb-2">⏰</div>
          <p className="text-2xl font-black">Come back later!</p>
          <p className="text-muted-foreground font-medium leading-relaxed">
            You've reached your daily limit. Fresh rewards await you tomorrow!
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 w-full">
            {levels.map((level) => (
              <button
                key={level.key}
                onClick={() => onSelect(level.key)}
                className="group relative glass-card hover:bg-card rounded-2xl p-5 text-left transition-all active:scale-[0.97] shadow-sm hover:shadow-xl border border-border hover:border-primary/30"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-black text-xl group-hover:text-primary transition-colors">
                      {level.label}
                    </h3>
                    <p className="text-sm text-muted-foreground font-semibold">{level.desc} · {level.cards} Cards</p>
                  </div>
                  <div className={`bg-gradient-to-br ${level.color} p-3.5 rounded-2xl shadow-md transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    <span className="text-2xl">{level.emoji}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="glass-card px-6 py-2.5 rounded-full shadow-sm">
            <p className="text-sm font-black text-primary uppercase tracking-widest">
              {dailyPlaysLeft} plays left today
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LevelSelect;
