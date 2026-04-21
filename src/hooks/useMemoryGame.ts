import { useState, useCallback, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

export interface GameItem {
  id: string;
  name: string;
  imageUrl: string;
}

export type Difficulty = "easy" | "medium" | "hard";

interface Card {
  id: number;
  icon: string;
  imageUrl?: string;
  isFlipped: boolean;
  isMatched: boolean;
  animState: "idle" | "shake" | "match";
}

interface GameState {
  cards: Card[];
  flips: number;
  score: number;
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

const FALLBACK_ICONS: string[] = [
  "smartphone", "sneakers", "watch", "laptop", "headphones", "backpack", "camera", "sunglasses",
];

const MATCH_POINTS: Record<Difficulty, number> = {
  easy: 100,
  medium: 150,
  hard: 200,
};

const MISS_PENALTY = 10;

const DIFFICULTY_CONFIG: Record<Difficulty, { pairs: number; time: number }> = {
  easy: { pairs: 3, time: 15 },
  medium: { pairs: 6, time: 25 },
  hard: { pairs: 8, time: 30 },
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
  } catch { }
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


function createCards(difficulty: Difficulty, gameItems: GameItem[]): { cards: Card[]; actualPairs: number } {
  const { pairs } = DIFFICULTY_CONFIG[difficulty];

  let selectedItems: { icon: string; imageUrl?: string }[] = [];

  if (gameItems.length > 0) {
    // Use backend items only — cap to the number of available items, max = difficulty pairs
    const actualPairs = Math.min(pairs, gameItems.length);
    selectedItems = shuffleArray(gameItems).slice(0, actualPairs).map(item => ({
      icon: item.name,
      imageUrl: item.imageUrl,
    }));
  } else {
    // No backend items at all — fall back to local icon set
    selectedItems = shuffleArray(FALLBACK_ICONS).slice(0, pairs).map(icon => ({ icon }));
  }

  const doubled = [...selectedItems, ...selectedItems];

  return {
    cards: shuffleArray(doubled).map((item, i) => ({
      id: i,
      icon: item.icon,
      imageUrl: item.imageUrl,
      isFlipped: false,
      isMatched: false,
      animState: "idle" as const,
    })),
    actualPairs: selectedItems.length,
  };
}

export function useMemoryGame() {
  const stored = getStoredData();
  const [state, setState] = useState<GameState>({
    cards: [],
    flips: 0,
    score: 0,
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

  const [gameItems, setGameItems] = useState<GameItem[]>([]);

  useEffect(() => {
    const fetchGameItems = async () => {
      try {
        const q = query(collection(db, "game_items"), limit(20));
        const querySnapshot = await getDocs(q);
        const items: GameItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as GameItem);
        });
        setGameItems(items);
      } catch (error) {
        console.error("Error fetching game items:", error);
      }
    };
    fetchGameItems();
  }, []);

  const startGame = useCallback((difficulty: Difficulty) => {
    const stored = getStoredData();
    if (stored.plays >= DAILY_PLAY_LIMIT) return;

    stopTimer();
    const config = DIFFICULTY_CONFIG[difficulty];
    const { cards, actualPairs } = createCards(difficulty, gameItems);
    flippedRef.current = [];
    lockRef.current = false;

    setState({
      cards,
      flips: 0,
      score: 0,
      timeLeft: config.time,
      isWon: false,
      isLost: false,
      isStarted: true,
      difficulty,
      matchedPairs: 0,
      totalPairs: actualPairs,
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
  }, [stopTimer, gameItems]);

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
        const newFlips = prev.flips + 1;

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

              const points = MATCH_POINTS[p.difficulty];
              let newScore = p.score + points;

              if (won) {
                const timeBonus = p.timeLeft * 50;
                newScore += timeBonus;
              }

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
                flips: newFlips,
                score: newScore,
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
              const newScore = Math.max(0, p.score - MISS_PENALTY);
              return { ...p, cards: shaken, flips: newFlips, score: newScore };
            });

            setTimeout(() => {
              setState(p => {
                const reset = p.cards.map(c =>
                  c.id === first || c.id === second
                    ? { ...c, isFlipped: false, animState: "idle" as const }
                    : c
                );
                flippedRef.current = [];
                lockRef.current = false;
                return { ...p, cards: reset };
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
