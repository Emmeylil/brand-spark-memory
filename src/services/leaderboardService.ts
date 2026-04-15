import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ScoreEntry {
    id?: string;
    name: string;
    email: string;
    score: number;
    timeTaken: number;
    difficulty: "easy" | "medium" | "hard";
    timestamp: Timestamp;
}

const SCORES_COLLECTION = "scores";

export const submitScore = async (
    name: string,
    email: string,
    score: number,
    difficulty: string,
    timeTaken: number
) => {
    try {
        await addDoc(collection(db, SCORES_COLLECTION), {
            name,
            email,
            score,
            timeTaken,
            difficulty,
            timestamp: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error submitting score:", error);
    }
};

export const subscribeToLeaderboard = (
    callback: (scores: ScoreEntry[]) => void,
    maxEntries: number = 10
) => {
    const q = query(
        collection(db, SCORES_COLLECTION),
        orderBy("timeTaken", "asc"),
        limit(maxEntries)
    );

    return onSnapshot(q, (snapshot) => {
        const scores = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as ScoreEntry[];
        callback(scores);
    });
};
