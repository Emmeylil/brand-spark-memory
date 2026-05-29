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

  // Helper to parse Firestore/JS timestamps safely
  const getSeconds = (ts: any): number => {
    if (!ts) return 0;
    if (typeof ts.seconds === "number") return ts.seconds;
    if (typeof ts.toMillis === "function") return Math.floor(ts.toMillis() / 1000);
    if (ts instanceof Date) return Math.floor(ts.getTime() / 1000);
    if (typeof ts === "number") return Math.floor(ts / 1000);
    const parsed = Date.parse(ts);
    if (!isNaN(parsed)) return Math.floor(parsed / 1000);
    return 0;
  };

  // Sort: Day descending, then score descending, then timeTaken ascending
  const sortedScores = [...scores].sort((a, b) => {
    const timeA = getSeconds(a.timestamp);
    const timeB = getSeconds(b.timestamp);
    
    const dateA = new Date(timeA * 1000).toDateString();
    const dateB = new Date(timeB * 1000).toDateString();
    
    if (dateA !== dateB) {
      const startOfDayA = new Date(timeA * 1000);
      startOfDayA.setHours(0, 0, 0, 0);
      const startOfDayB = new Date(timeB * 1000);
      startOfDayB.setHours(0, 0, 0, 0);
      return startOfDayB.getTime() - startOfDayA.getTime(); // Date descending
    }
    
    if (b.score !== a.score) {
      return b.score - a.score; // Score descending
    }
    
    return a.timeTaken - b.timeTaken; // Time taken ascending
  });

  // Group sorted scores by calendar day
  interface DayGroup {
    dateLabel: string;
    entries: ScoreEntry[];
  }

  const groups: DayGroup[] = [];
  sortedScores.forEach((entry) => {
    const time = getSeconds(entry.timestamp);
    const date = time ? new Date(time * 1000) : new Date();
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    let dateLabel = "";
    if (date.toDateString() === today.toDateString()) {
      dateLabel = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateLabel = "Yesterday";
    } else {
      dateLabel = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    }
    
    let group = groups.find(g => g.dateLabel === dateLabel);
    if (!group) {
      group = { dateLabel, entries: [] };
      groups.push(group);
    }
    group.entries.push(entry);
  });

  return (
    <div className="w-full max-w-2xl mx-auto glass-card rounded-3xl shadow-xl animate-scale-in overflow-hidden">
      {/* Header */}
      <div className="text-center p-6 pb-4">
        <Trophy className="w-10 h-10 text-primary mx-auto mb-2" />
        <h2 className="text-2xl font-black tracking-tight">Leaderboard</h2>
        <p className="text-sm text-muted-foreground font-semibold">Daily rankings</p>
      </div>

      {/* Content */}
      <div className="px-4 pb-6 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-medium">No scores yet. Be the first!</div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.dateLabel} className="space-y-2">
                <div className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 py-1.5 px-4 rounded-xl inline-flex items-center gap-1.5 border border-primary/20 mb-1">
                  📅 {group.dateLabel}
                </div>
                <div className="space-y-2">
                  {group.entries.map((entry, index) => (
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
                              <span className="bg-primary/15 text-primary text-[9px] uppercase px-2 py-0.5 rounded-full font-black">Daily #1</span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                            Completed in {entry.timeTaken}s
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-primary">{entry.score.toLocaleString()}</div>
                        <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">points</div>
                      </div>
                    </div>
                  ))}
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
