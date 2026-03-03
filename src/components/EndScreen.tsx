import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { submitScore } from "@/services/leaderboardService";
import Leaderboard from "./Leaderboard";
import { Button } from "@/components/ui/button";

interface EndScreenProps {
  isWon: boolean;
  reward: string | null;
  score: number;
  flips: number;
  difficulty: string;
  onReplay: () => void;
  dailyPlaysLeft: number;
}

const EndScreen = ({ isWon, reward, score, flips, difficulty, onReplay, dailyPlaysLeft }: EndScreenProps) => {
  const { user } = useAuth();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isWon && user && !submitted) {
      submitScore(user.name, user.email, score, difficulty);
      setSubmitted(true);
    }
  }, [isWon, user, score, difficulty, submitted]);

  if (showLeaderboard) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl px-4 animate-fade-in">
        <Leaderboard />
        <Button
          onClick={() => setShowLeaderboard(false)}
          className="w-full max-w-sm h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg rounded-2xl shadow-lg"
        >
          ← Back to Results
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 animate-scale-in w-full max-w-sm mx-auto px-4 text-center">
      {/* Icon */}
      <div className="text-7xl">{isWon ? "🏆" : "⏰"}</div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight">
          {isWon ? "Nicely Done!" : "Time's Up!"}
        </h2>
        <p className="text-muted-foreground font-medium">
          {isWon
            ? `You cleared ${difficulty} mode in ${flips} flips.`
            : "Don't give up! Every match counts."}
        </p>
      </div>

      {/* Score Card */}
      <div className="glass-card rounded-3xl p-8 w-full shadow-xl">
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1">Your Score</p>
        <p className="text-6xl font-black text-primary tracking-tighter">{score.toLocaleString()}</p>
        <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-xl font-black">{flips}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Flips</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="text-xl font-black capitalize">{difficulty}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Mode</p>
          </div>
        </div>
      </div>

      {/* Reward */}
      {reward && (
        <div className="w-full bg-primary/5 border-2 border-primary/20 border-dashed rounded-2xl p-5">
          <p className="text-primary font-black text-lg">{reward}</p>
          <p className="text-xs text-muted-foreground font-medium mt-1">Claim this in your Jumia account!</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full">
        <Button
          onClick={onReplay}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl rounded-2xl shadow-xl glow-primary transition-all active:scale-[0.98] hover:scale-[1.01]"
        >
          {dailyPlaysLeft > 0 ? "Play Again →" : "Return Home"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowLeaderboard(true)}
          className="w-full h-12 border-primary/20 text-primary hover:bg-primary/5 font-bold text-base rounded-2xl"
        >
          🏅 View Leaderboard
        </Button>
      </div>

      <p className="text-xs font-bold text-muted-foreground">
        {dailyPlaysLeft > 0
          ? `${dailyPlaysLeft} play${dailyPlaysLeft !== 1 ? "s" : ""} left today`
          : "Daily limit reached — see you tomorrow!"}
      </p>
    </div>
  );
};

export default EndScreen;
