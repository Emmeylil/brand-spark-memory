import { useState, useCallback, useEffect, useRef } from "react";

export type Difficulty = "easy" | "medium" | "hard";

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
  animState: "idle" | "shake" | "match";
}

interface GameState {
  cards: Card[];
  moves: number;
  maxMoves: number;
  timeLeft: number;
  isWon: boolean;
  isLost: boolean;
  isStarted: boolean;
  difficulty: Difficulty;
  matchedPairs: number;
  totalPairs: number;
  dailyPlaysLeft: number;
  reward: string | null;
}

const ICONS: string[] = [
  "🎁", "⭐", "🔥", "💎", "🎯", "🏆", "🚀", "💰",
];

const DIFFICULTY_CONFIG: Record<Difficulty, { pairs: number; maxMoves: number; time: number }> = {
  easy: { pairs: 3, maxMoves: 12, time: 30 },
  medium: { pairs: 6, maxMoves: 20, time: 45 },
  hard: { pairs: 8, maxMoves: 24, time: 55 },
};

const DAILY_PLAY_LIMIT = 5;
const STORAGE_KEY = "memory-game-data";

function getStoredData(): { plays: number; date: string; bestScores: Partial<Record<Difficulty, number>> } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const today = new Date().toDateString();
      if (data.date === today) return data;
      return { plays: 0, date: today, bestScores: data.bestScores || {} };
    }
  } catch {}
  return { plays: 0, date: new Date().toDateString(), bestScores: {} };
}

function saveStoredData(plays: number, bestScores: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    plays,
    date: new Date().toDateString(),
    bestScores,
  }));
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createCards(difficulty: Difficulty): Card[] {
  const { pairs } = DIFFICULTY_CONFIG[difficulty];
  const selected = shuffleArray(ICONS).slice(0, pairs);
  const doubled = [...selected, ...selected];
  return shuffleArray(doubled).map((icon, i) => ({
    id: i,
    icon,
    isFlipped: false,
    isMatched: false,
    animState: "idle" as const,
  }));
}

export function useMemoryGame() {
  const stored = getStoredData();
  const [state, setState] = useState<GameState>({
    cards: [],
    moves: 0,
    maxMoves: 12,
    timeLeft: 30,
    isWon: false,
    isLost: false,
    isStarted: false,
    difficulty: "easy",
    matchedPairs: 0,
    totalPairs: 3,
    dailyPlaysLeft: DAILY_PLAY_LIMIT - stored.plays,
    reward: null,
  });

  const flippedRef = useRef<number[]>([]);
  const lockRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startGame = useCallback((difficulty: Difficulty) => {
    const stored = getStoredData();
    if (stored.plays >= DAILY_PLAY_LIMIT) return;

    stopTimer();
    const config = DIFFICULTY_CONFIG[difficulty];
    const cards = createCards(difficulty);
    flippedRef.current = [];
    lockRef.current = false;

    setState({
      cards,
      moves: 0,
      maxMoves: config.maxMoves,
      timeLeft: config.time,
      isWon: false,
      isLost: false,
      isStarted: true,
      difficulty,
      matchedPairs: 0,
      totalPairs: config.pairs,
      dailyPlaysLeft: DAILY_PLAY_LIMIT - stored.plays - 1,
      reward: null,
    });

    saveStoredData(stored.plays + 1, stored.bestScores);

    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeLeft <= 1) {
          stopTimer();
          return { ...prev, timeLeft: 0, isLost: true };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [stopTimer]);

  const flipCard = useCallback((cardId: number) => {
    if (lockRef.current) return;

    setState(prev => {
      if (prev.isWon || prev.isLost) return prev;

      const card = prev.cards[cardId];
      if (card.isFlipped || card.isMatched) return prev;
      if (flippedRef.current.length >= 2) return prev;

      const newCards = prev.cards.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      );
      flippedRef.current.push(cardId);

      if (flippedRef.current.length === 2) {
        lockRef.current = true;
        const [first, second] = flippedRef.current;
        const isMatch = newCards[first].icon === newCards[second].icon;
        const newMoves = prev.moves + 1;

        if (isMatch) {
          setTimeout(() => {
            setState(p => {
              const matched = p.cards.map(c =>
                c.id === first || c.id === second
                  ? { ...c, isMatched: true, animState: "match" as const }
                  : c
              );
              const newMatchedPairs = p.matchedPairs + 1;
              const won = newMatchedPairs === p.totalPairs;
              if (won) stopTimer();

              let reward: string | null = null;
              if (won) {
                if (p.difficulty === "easy") reward = "🎉 You've unlocked a 10% discount code!";
                else if (p.difficulty === "medium") reward = "🏆 You've unlocked free shipping!";
                else reward = "💎 You've unlocked a mystery reward!";
              }

              flippedRef.current = [];
              lockRef.current = false;
              return {
                ...p,
                cards: matched,
                moves: newMoves,
                matchedPairs: newMatchedPairs,
                isWon: won,
                reward,
              };
            });
          }, 500);
        } else {
          setTimeout(() => {
            setState(p => {
              const shaken = p.cards.map(c =>
                c.id === first || c.id === second
                  ? { ...c, animState: "shake" as const }
                  : c
              );
              return { ...p, cards: shaken, moves: newMoves };
            });

            setTimeout(() => {
              setState(p => {
                const reset = p.cards.map(c =>
                  c.id === first || c.id === second
                    ? { ...c, isFlipped: false, animState: "idle" as const }
                    : c
                );
                const lost = newMoves >= p.maxMoves;
                if (lost) stopTimer();
                flippedRef.current = [];
                lockRef.current = false;
                return { ...p, cards: reset, isLost: lost };
              });
            }, 400);
          }, 600);
        }

        return { ...prev, cards: newCards };
      }

      return { ...prev, cards: newCards };
    });
  }, [stopTimer]);

  const resetGame = useCallback(() => {
    stopTimer();
    setState(prev => ({
      ...prev,
      isStarted: false,
      isWon: false,
      isLost: false,
      reward: null,
    }));
  }, [stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  return { state, startGame, flipCard, resetGame };
}
