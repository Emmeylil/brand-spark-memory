import LevelSelect from "@/components/LevelSelect";
import GameBoard from "@/components/GameBoard";
import EndScreen from "@/components/EndScreen";
import { useMemoryGame } from "@/hooks/useMemoryGame";
import { Link } from "react-router-dom";
import { Confetti } from "@/components/Confetti";
import { AnniversaryBackground } from "@/components/AnniversaryBackground";
import Leaderboard from "@/components/Leaderboard";
import { Clock, Calendar } from "lucide-react";
import jumiaLogo from "@/assets/jumia-logo.png";

interface GameClosedCardProps {
  config: { startTime: string; endTime: string; weekdaysOnly: boolean };
}

const GameClosedCard = ({ config }: GameClosedCardProps) => {
  const formatTime12h = (time24: string) => {
    try {
      const [hoursStr, minutesStr] = time24.split(":");
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      return `${formattedHours}:${formattedMinutes} ${ampm}`;
    } catch {
      return time24;
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-6 px-4 animate-fade-in">
      <div className="text-center space-y-4 w-full">
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

      <div className="glass-card rounded-3xl p-8 shadow-xl w-full border border-white/40 flex flex-col items-center text-center space-y-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full border border-primary/20 animate-pulse">
          <Clock className="w-10 h-10 text-primary animate-spin" style={{ animationDuration: '60s' }} />
          <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-1 text-[10px] font-black uppercase tracking-wider px-2 shadow">
            Offline
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight">Game is Currently Closed</h2>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            Thank you for visiting! We operate on specific schedules to bring you fresh daily rewards.
          </p>
        </div>

        <div className="w-full bg-white/40 rounded-2xl p-4 border border-white/60 space-y-3.5 text-left shadow-inner">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl text-primary">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">Operating Days</p>
              <p className="font-bold text-sm text-foreground">
                {config.weekdaysOnly ? "Monday - Friday (Weekdays Only)" : "Everyday (Monday - Sunday)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl text-primary">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">Operating Hours</p>
              <p className="font-bold text-sm text-foreground">
                {formatTime12h(config.startTime)} - {formatTime12h(config.endTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs font-semibold text-primary/80 bg-primary/5 px-4 py-2 rounded-full border border-primary/10 animate-bounce">
          💡 Check back tomorrow during operational hours!
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const { state, startGame, flipCard, resetGame, config, isAvailable } = useMemoryGame();
  const { isStarted, isWon, isLost } = state;

  const showEnd = isWon || isLost;

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center py-8 relative overflow-hidden">
      <AnniversaryBackground />
      <Confetti />

      <div className="relative z-10 w-full flex flex-col items-center justify-center gap-8 py-4">
        {!isStarted && !showEnd && (
          <div className="w-full max-w-sm flex flex-col items-center gap-8 px-4 animate-fade-in">
            {isAvailable ? (
              <LevelSelect onSelect={startGame} dailyPlaysLeft={state.dailyPlaysLeft} />
            ) : (
              <GameClosedCard config={config} />
            )}
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
