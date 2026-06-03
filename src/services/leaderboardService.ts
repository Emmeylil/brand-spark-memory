import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    Timestamp,
    where
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
    daysLimit: number = 7
) => {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - daysLimit);
    dateLimit.setHours(0, 0, 0, 0);

    const q = query(
        collection(db, SCORES_COLLECTION),
        where("timestamp", ">=", Timestamp.fromDate(dateLimit)),
        orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const scores = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as ScoreEntry[];
        callback(scores);
    });
};

