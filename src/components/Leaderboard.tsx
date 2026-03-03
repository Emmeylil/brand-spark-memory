import React, { useEffect, useState } from "react";
import { ScoreEntry, subscribeToLeaderboard } from "@/services/leaderboardService";
import { Trophy, Medal } from "lucide-react";

const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((data) => {
      setScores(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto glass-card rounded-3xl shadow-xl animate-scale-in overflow-hidden">
      {/* Header */}
      <div className="text-center p-6 pb-4">
        <Trophy className="w-10 h-10 text-primary mx-auto mb-2" />
        <h2 className="text-2xl font-black tracking-tight">Leaderboard</h2>
        <p className="text-sm text-muted-foreground">Real-time rankings</p>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No scores yet. Be the first!</div>
        ) : (
          <div className="space-y-2">
            {scores.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl transition-all hover:shadow-md ${
                  index < 3 ? "bg-primary/5 border border-primary/10" : "bg-muted/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 font-black text-base">
                    {index === 0 ? <Medal className="text-yellow-500 w-7 h-7" /> :
                      index === 1 ? <Medal className="text-gray-400 w-7 h-7" /> :
                        index === 2 ? <Medal className="text-orange-600 w-7 h-7" /> :
                          <span className="text-muted-foreground">#{index + 1}</span>}
                  </div>
                  <div>
                    <div className="font-bold text-sm flex items-center gap-2">
                      {entry.name}
                      {index === 0 && (
                        <span className="bg-primary/10 text-primary text-[9px] uppercase px-2 py-0.5 rounded-full font-black">#1</span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{entry.difficulty}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-primary">{entry.score.toLocaleString()}</div>
                  <div className="text-[9px] text-muted-foreground">
                    {entry.timestamp ? new Date(entry.timestamp.seconds * 1000).toLocaleDateString() : "Just now"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
