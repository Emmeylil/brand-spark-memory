import { type Difficulty } from "@/hooks/useMemoryGame";
import jumiaLogo from "@/assets/jumia-logo.png";

interface LevelSelectProps {
  onSelect: (difficulty: Difficulty) => void;
  dailyPlaysLeft: number;
}

const LevelSelect = ({ onSelect, dailyPlaysLeft }: LevelSelectProps) => {
  const noPlays = dailyPlaysLeft <= 0;

  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in w-full max-w-sm mx-auto px-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="px-5 py-2.5 rounded-2xl shadow-lg transform -rotate-2" style={{ backgroundColor: '#6ac1d5' }}>
            <img src={jumiaLogo} alt="Jumia" className="h-8 object-contain" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Memory <span className="text-primary">Match</span>
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
            <button
              onClick={() => onSelect("medium")}
              className="group relative bg-primary hover:bg-primary/95 text-white rounded-2xl p-6 text-center transition-all active:scale-[0.97] shadow-lg hover:shadow-xl glow-primary"
            >
              <span className="font-black text-2xl tracking-wide flex items-center justify-center gap-2">
                🚀 Start Game
              </span>
              <p className="text-xs text-white/80 font-bold uppercase tracking-wider mt-1.5">
                4×3 Grid • 12 Cards • 25s Limit
              </p>
            </button>
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
