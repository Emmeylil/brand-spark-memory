import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc, Timestamp, setDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Mail, TrendingUp, Trash2, Download, Trophy, LogOut, Image as ImageIcon, Plus, LayoutGrid, Calendar, SlidersHorizontal, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { Switch } from "@/components/ui/switch";

interface GameItem {
    id: string;
    name: string;
    imageUrl: string;
    timestamp: any;
}

interface PlayerRecord {
    id: string;
    name: string;
    email: string;
    score: number;
    timeTaken: number;
    difficulty: string;
    timestamp: any;
}

export default function Admin() {
    const [players, setPlayers] = useState<PlayerRecord[]>([]);
    const [gameItems, setGameItems] = useState<GameItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingCard, setAddingCard] = useState(false);
    const [newCard, setNewCard] = useState({ name: "", imageUrl: "" });
    const { logout } = useFirebaseAuth();

    const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

    const [leaderboardView, setLeaderboardView] = useState<"daily" | "raw">("daily");
    const [selectedDailyDate, setSelectedDailyDate] = useState<string>(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    });

    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email);
        setCopiedEmail(email);
        toast.success("Email address copied!");
        setTimeout(() => setCopiedEmail(null), 2000);
    };

    const getRankedLeaderboardForDate = (dateStrYMD: string): PlayerRecord[] => {
        const dayEntries = players.filter(player => {
            if (!player.timestamp) return false;
            const playDate = new Date(player.timestamp.seconds * 1000);
            const y = playDate.getFullYear();
            const m = String(playDate.getMonth() + 1).padStart(2, "0");
            const d = String(playDate.getDate()).padStart(2, "0");
            const recordDateYMD = `${y}-${m}-${d}`;
            return recordDateYMD === dateStrYMD;
        });

        const bestUserEntryMap: Record<string, PlayerRecord> = {};
        dayEntries.forEach(entry => {
            const email = entry.email.toLowerCase().trim();
            const existing = bestUserEntryMap[email];
            if (!existing) {
                bestUserEntryMap[email] = entry;
            } else {
                if (entry.score > existing.score) {
                    bestUserEntryMap[email] = entry;
                } else if (entry.score === existing.score) {
                    if (entry.timeTaken < existing.timeTaken) {
                        bestUserEntryMap[email] = entry;
                    }
                }
            }
        });

        return Object.values(bestUserEntryMap).sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.timeTaken - b.timeTaken;
        });
    };

    const getDailyWinners = (): { dateLabel: string; dateStr: string; winners: PlayerRecord[] }[] => {
        const dayEntriesMap: Record<string, PlayerRecord[]> = {};
        
        players.forEach(player => {
            if (!player.timestamp) return;
            const playDate = new Date(player.timestamp.seconds * 1000);
            const dateStr = playDate.toDateString();
            if (!dayEntriesMap[dateStr]) {
                dayEntriesMap[dateStr] = [];
            }
            dayEntriesMap[dateStr].push(player);
        });

        const dailyWinnersList: { dateLabel: string; dateStr: string; winners: PlayerRecord[] }[] = [];

        Object.keys(dayEntriesMap).forEach(dateStr => {
            const dayEntries = dayEntriesMap[dateStr];
            
            const bestUserEntryMap: Record<string, PlayerRecord> = {};
            dayEntries.forEach(entry => {
                const email = entry.email.toLowerCase().trim();
                const existing = bestUserEntryMap[email];
                if (!existing) {
                    bestUserEntryMap[email] = entry;
                } else {
                    if (entry.score > existing.score) {
                        bestUserEntryMap[email] = entry;
                    } else if (entry.score === existing.score) {
                        if (entry.timeTaken < existing.timeTaken) {
                            bestUserEntryMap[email] = entry;
                        }
                    }
                }
            });

            const sortedUnique = Object.values(bestUserEntryMap).sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return a.timeTaken - b.timeTaken;
            });

            const winners = sortedUnique.slice(0, 3);

            const dateObj = new Date(dateStr);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            let dateLabel = "";
            if (dateObj.toDateString() === today.toDateString()) {
                dateLabel = "Today";
            } else if (dateObj.toDateString() === yesterday.toDateString()) {
                dateLabel = "Yesterday";
            } else {
                dateLabel = dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
            }

            dailyWinnersList.push({
                dateLabel,
                dateStr,
                winners
            });
        });

        return dailyWinnersList.sort((a, b) => {
            return new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime();
        });
    };

    const [config, setConfig] = useState({
        startTime: "08:00",
        endTime: "23:59",
        weekdaysOnly: true,
    });
    const [savingConfig, setSavingConfig] = useState(false);

    const [scoreMin, setScoreMin] = useState<string>("");
    const [scoreMax, setScoreMax] = useState<string>("");
    const [dateStart, setDateStart] = useState<string>("");
    const [dateEnd, setDateEnd] = useState<string>("");

    const filteredPlayers = players.filter((player) => {
        if (scoreMin !== "") {
            const min = parseInt(scoreMin, 10);
            if (!isNaN(min) && player.score < min) return false;
        }
        if (scoreMax !== "") {
            const max = parseInt(scoreMax, 10);
            if (!isNaN(max) && player.score > max) return false;
        }
        if (player.timestamp) {
            const playDate = new Date(player.timestamp.seconds * 1000);
            const playDateString = playDate.toISOString().split("T")[0];
            
            if (dateStart !== "" && playDateString < dateStart) return false;
            if (dateEnd !== "" && playDateString > dateEnd) return false;
        } else {
            if (dateStart !== "" || dateEnd !== "") return false;
        }
        return true;
    });

    const sortedFilteredPlayers = [...filteredPlayers].sort((a, b) => {
        const timeA = a.timestamp ? a.timestamp.seconds : 0;
        const timeB = b.timestamp ? b.timestamp.seconds : 0;
        
        const dateA = new Date(timeA * 1000).toDateString();
        const dateB = new Date(timeB * 1000).toDateString();
        
        if (dateA !== dateB) {
            const startOfDayA = new Date(timeA * 1000).setHours(0, 0, 0, 0);
            const startOfDayB = new Date(timeB * 1000).setHours(0, 0, 0, 0);
            return startOfDayB - startOfDayA; // Date descending
        }
        
        if (b.score !== a.score) {
            return b.score - a.score; // Score descending
        }
        
        return a.timeTaken - b.timeTaken; // Time taken ascending
    });

    useEffect(() => {
        // Subscribe to scores
        const qScores = query(collection(db, "scores"), orderBy("timestamp", "desc"));
        const unsubScores = onSnapshot(qScores, (snapshot) => {
            const records: PlayerRecord[] = [];
            snapshot.forEach((doc) => {
                records.push({ id: doc.id, ...doc.data() } as PlayerRecord);
            });
            setPlayers(records);
            setLoading(false);
        });

        // Subscribe to game items
        const qItems = query(collection(db, "game_items"), orderBy("timestamp", "desc"));
        const unsubItems = onSnapshot(qItems, (snapshot) => {
            const items: GameItem[] = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as GameItem);
            });
            setGameItems(items);
        });

        // Subscribe to game configuration settings
        const configDocRef = doc(db, "game_config", "settings");
        const unsubConfig = onSnapshot(configDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setConfig({
                    startTime: data.startTime || "08:00",
                    endTime: data.endTime || "23:59",
                    weekdaysOnly: data.weekdaysOnly !== undefined ? data.weekdaysOnly : true,
                });
            }
        });

        return () => {
            unsubScores();
            unsubItems();
            unsubConfig();
        };
    }, []);

    const handleDeleteScore = async (id: string) => {
        if (!confirm("Are you sure you want to delete this score entry?")) return;
        try {
            await deleteDoc(doc(db, "scores", id));
            toast.success("Score entry deleted.");
        } catch (error) {
            console.error("Error deleting score:", error);
            toast.error("Failed to delete score.");
        }
    };

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCard.name || !newCard.imageUrl) {
            toast.error("Please fill in both name and image URL.");
            return;
        }

        setAddingCard(true);
        try {
            await addDoc(collection(db, "game_items"), {
                ...newCard,
                timestamp: Timestamp.now()
            });
            setNewCard({ name: "", imageUrl: "" });
            toast.success("Game card added successfully!");
        } catch (error) {
            console.error("Error adding card:", error);
            toast.error("Failed to add card.");
        } finally {
            setAddingCard(false);
        }
    };

    const handleDeleteCard = async (id: string) => {
        if (!confirm("Are you sure you want to delete this card?")) return;
        try {
            await deleteDoc(doc(db, "game_items", id));
            toast.success("Card deleted.");
        } catch (error) {
            console.error("Error deleting card:", error);
            toast.error("Failed to delete card.");
        }
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingConfig(true);
        try {
            await setDoc(doc(db, "game_config", "settings"), config);
            toast.success("Game availability settings saved successfully!");
        } catch (error) {
            console.error("Error saving game config:", error);
            toast.error("Failed to save game settings.");
        } finally {
            setSavingConfig(false);
        }
    };

    const handleExportCSV = () => {
        const dataToExport = sortedFilteredPlayers;
        if (dataToExport.length === 0) {
            toast.error("No player data matching filters to export.");
            return;
        }

        const headers = ["Name", "Email", "Score", "Time (s)", "Date"];
        const csvRows = [
            headers.join(","),
            ...dataToExport.map(p => {
                const date = p.timestamp ? new Date(p.timestamp.seconds * 1000).toISOString() : "N/A";
                return `${p.name},${p.email},${p.score},${p.timeTaken || 0},${date}`;
            })
        ];

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `memory_match_players_${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Player data exported!");
    };

    return (
        <div className="min-h-screen bg-secondary/30 p-4 sm:p-8 animate-fade-in">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-card p-6 rounded-3xl shadow-xl gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary p-3 rounded-2xl shadow-lg glow-primary transform -rotate-2">
                            <Trophy className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
                            <p className="text-muted-foreground font-medium">Manage Memory Match player scores</p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto flex-wrap">
                        <Button
                            variant="outline"
                            className="bg-primary/5 hover:bg-primary/10 border-primary/10 font-bold h-12 rounded-xl"
                            onClick={handleExportCSV}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-destructive/5 hover:bg-destructive/10 border-destructive/10 text-destructive font-bold h-12 rounded-xl"
                            onClick={logout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                        <div className="bg-primary/10 p-3 px-5 rounded-xl flex items-center gap-3 border border-primary/20">
                            <Users className="text-primary w-5 h-5" />
                            <div>
                                <p className="text-[10px] text-primary font-black uppercase tracking-widest">Total Entries</p>
                                <p className="font-black text-xl leading-none">
                                    {sortedFilteredPlayers.length !== players.length ? `${sortedFilteredPlayers.length} / ${players.length}` : players.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <Tabs defaultValue="leaderboard" className="w-full space-y-6">
                    <TabsList className="bg-white/50 p-1 rounded-2xl border border-white/50 backdrop-blur-md self-start flex-wrap gap-1">
                        <TabsTrigger value="leaderboard" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                            <Trophy className="w-4 h-4 mr-2" />
                            Leaderboard
                        </TabsTrigger>
                        <TabsTrigger value="winners" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                            <Trophy className="w-4 h-4 mr-2" />
                            Daily Winners
                        </TabsTrigger>
                        <TabsTrigger value="cards" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Game Cards
                        </TabsTrigger>
                        <TabsTrigger value="config" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Game Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="leaderboard" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="glass-card rounded-3xl shadow-xl border-none overflow-hidden">
                            <CardHeader className="bg-white/50 border-b border-border p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="text-primary w-5 h-5" />
                                        <CardTitle className="text-xl font-black">
                                            {leaderboardView === "daily" ? "Daily Leaderboard" : "Raw Score History"}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="font-medium">
                                        {leaderboardView === "daily" 
                                            ? "Ranked unique players for a selected date" 
                                            : "All individual game sessions across all difficulties"}
                                    </CardDescription>
                                </div>
                                <div className="flex bg-muted p-1 rounded-xl border border-muted-foreground/10 self-start sm:self-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setLeaderboardView("daily")}
                                        className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                                            leaderboardView === "daily" 
                                                ? "bg-white text-foreground shadow-sm hover:bg-white" 
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Daily Leaderboard
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setLeaderboardView("raw")}
                                        className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                                            leaderboardView === "raw" 
                                                ? "bg-white text-foreground shadow-sm hover:bg-white" 
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Raw History
                                    </Button>
                                </div>
                            </CardHeader>
                            
                            {leaderboardView === "daily" ? (
                                <>
                                    {/* Date Selection Panel */}
                                    <div className="bg-white/30 border-b border-border p-6 flex flex-col sm:flex-row gap-4 items-end">
                                        <div className="space-y-2 w-full sm:max-w-xs">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                📅 Select Leaderboard Date
                                            </label>
                                            <Input
                                                type="date"
                                                value={selectedDailyDate}
                                                onChange={(e) => setSelectedDailyDate(e.target.value)}
                                                className="bg-white/50 border-primary/10 rounded-xl h-11 focus-visible:ring-primary font-medium"
                                            />
                                        </div>
                                        <div>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    const now = new Date();
                                                    const y = now.getFullYear();
                                                    const m = String(now.getMonth() + 1).padStart(2, "0");
                                                    const d = String(now.getDate()).padStart(2, "0");
                                                    setSelectedDailyDate(`${y}-${m}-${d}`);
                                                }}
                                                className="h-11 rounded-xl font-bold border-primary/10 bg-primary/5 hover:bg-primary/10 text-primary transition-all"
                                            >
                                                Jump to Today
                                            </Button>
                                        </div>
                                    </div>

                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-muted/30">
                                                    <TableRow>
                                                        <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 w-20">Rank</TableHead>
                                                        <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Player</TableHead>
                                                        <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Contact</TableHead>
                                                        <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Time</TableHead>
                                                        <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Best Score</TableHead>
                                                        <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {loading ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center p-12">
                                                                <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : getRankedLeaderboardForDate(selectedDailyDate).map((player, index) => {
                                                        const isTop3 = index < 3;
                                                        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
                                                        
                                                        return (
                                                            <TableRow key={player.id} className="hover:bg-primary/[0.02] transition-colors border-b border-muted/50 last:border-0">
                                                                <TableCell className="px-6 py-4 font-black text-center text-sm">
                                                                    {isTop3 ? <span className="text-xl">{medal}</span> : <span className="text-muted-foreground">{medal}</span>}
                                                                </TableCell>
                                                                <TableCell className="font-bold px-6 py-4">
                                                                    <div className="flex items-center gap-2">
                                                                        {player.name}
                                                                        {index === 0 && (
                                                                            <span className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-500 text-[9px] uppercase px-2 py-0.5 rounded-full font-black">Winner</span>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-6 py-4">
                                                                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                                                        <Mail className="w-3.5 h-3.5" />
                                                                        {player.email}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right font-bold text-muted-foreground px-6 py-4">
                                                                    {player.timeTaken ? `${player.timeTaken}s` : '0s'} ({player.difficulty})
                                                                </TableCell>
                                                                <TableCell className="text-right font-black text-primary text-lg px-6 py-4">
                                                                    {player.score.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell className="text-center px-6 py-4">
                                                                    <div className="flex justify-center gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                                                                            onClick={() => handleCopyEmail(player.email)}
                                                                        >
                                                                            {copiedEmail === player.email ? (
                                                                                <Check className="w-4 h-4 text-green-600" />
                                                                            ) : (
                                                                                <Copy className="w-4 h-4" />
                                                                            )}
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                                                                            onClick={() => handleDeleteScore(player.id)}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                    {!loading && getRankedLeaderboardForDate(selectedDailyDate).length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center p-12 text-muted-foreground italic">
                                                                No entries recorded for this date.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </>
                            ) : (
                                <>
                                    {/* Filter Section */}
                                    <div className="bg-white/30 border-b border-border p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                <Trophy className="w-3 h-3 text-primary" /> Min Score
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="Min score"
                                                value={scoreMin}
                                                onChange={(e) => setScoreMin(e.target.value)}
                                                className="bg-white/50 border-primary/10 rounded-xl h-11 focus-visible:ring-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                <Trophy className="w-3 h-3 text-primary" /> Max Score
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="Max score"
                                                value={scoreMax}
                                                onChange={(e) => setScoreMax(e.target.value)}
                                                className="bg-white/50 border-primary/10 rounded-xl h-11 focus-visible:ring-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-primary" /> Start Date
                                            </label>
                                            <Input
                                                type="date"
                                                value={dateStart}
                                                onChange={(e) => setDateStart(e.target.value)}
                                                className="bg-white/50 border-primary/10 rounded-xl h-11 focus-visible:ring-primary font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-primary" /> End Date
                                            </label>
                                            <Input
                                                type="date"
                                                value={dateEnd}
                                                onChange={(e) => setDateEnd(e.target.value)}
                                                className="bg-white/50 border-primary/10 rounded-xl h-11 focus-visible:ring-primary font-medium"
                                            />
                                        </div>
                                        <div>
                                            <Button
                                                variant="outline"
                                                disabled={!scoreMin && !scoreMax && !dateStart && !dateEnd}
                                                onClick={() => {
                                                    setScoreMin("");
                                                    setScoreMax("");
                                                    setDateStart("");
                                                    setDateEnd("");
                                                }}
                                                className="w-full h-11 rounded-xl font-bold border-primary/10 bg-primary/5 hover:bg-primary/10 text-primary transition-all disabled:opacity-50"
                                            >
                                                <SlidersHorizontal className="w-4 h-4 mr-2" />
                                                Reset
                                            </Button>
                                        </div>
                                    </div>

                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-muted/30">
                                                    <TableRow>
                                                        <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Player</TableHead>
                                                        <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Contact</TableHead>
                                                        <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Time</TableHead>
                                                        <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Score</TableHead>
                                                        <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-right">Date</TableHead>
                                                        <TableHead className="font-black uppercase text-[10px] tracking-widest px-6 text-center">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {loading ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center p-12">
                                                                <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : sortedFilteredPlayers.map((player) => (
                                                        <TableRow key={player.id} className="hover:bg-primary/[0.02] transition-colors border-b border-muted/50 last:border-0">
                                                            <TableCell className="font-bold px-6 py-4">{player.name}</TableCell>
                                                            <TableCell className="px-6 py-4">
                                                                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                                                    <Mail className="w-3.5 h-3.5" />
                                                                    {player.email}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold text-muted-foreground px-6 py-4">
                                                                {player.timeTaken ? `${player.timeTaken}s` : '0s'}
                                                            </TableCell>
                                                            <TableCell className="text-right font-black text-primary text-lg px-6 py-4">
                                                                {player.score.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell className="text-right text-xs text-muted-foreground font-medium px-6 py-4">
                                                                {player.timestamp ? new Date(player.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}
                                                            </TableCell>
                                                            <TableCell className="text-center px-6 py-4">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                                                                    onClick={() => handleDeleteScore(player.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {!loading && players.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center p-12 text-muted-foreground italic">
                                                                No scores recorded yet.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                    {!loading && players.length > 0 && filteredPlayers.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center p-12 text-muted-foreground italic">
                                                                No scores matching the current filters.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="winners" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <Card className="glass-card rounded-3xl shadow-xl border-none overflow-hidden">
                            <CardHeader className="bg-white/50 border-b border-border p-6">
                                <div className="flex items-center gap-2">
                                    <Trophy className="text-primary w-5 h-5" />
                                    <CardTitle className="text-xl font-black">Daily Winners Showcase</CardTitle>
                                </div>
                                <CardDescription className="font-medium">Top 3 unique players of each day, ranked by score and speed</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {loading ? (
                                    <div className="text-center p-12">
                                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
                                    </div>
                                ) : getDailyWinners().length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground font-medium italic">
                                        No entries recorded yet.
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {getDailyWinners().map((dayGroup) => (
                                            <div key={dayGroup.dateStr} className="space-y-4 bg-white/20 p-6 rounded-2xl border border-primary/10 shadow-sm">
                                                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                                                    <h3 className="text-lg font-black text-primary flex items-center gap-2">
                                                        📅 {dayGroup.dateLabel}
                                                    </h3>
                                                    <span className="text-xs font-bold text-muted-foreground bg-white/60 px-3 py-1 rounded-full border border-border">
                                                        {dayGroup.winners.length} Winner{dayGroup.winners.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {dayGroup.winners.map((winner, index) => {
                                                        const rankMedal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
                                                        const rankLabel = index === 0 ? "1st Place (Daily Winner)" : index === 1 ? "2nd Place" : "3rd Place";
                                                        const bgColors = index === 0 ? "bg-yellow-500/5 border-yellow-500/20" : index === 1 ? "bg-slate-400/5 border-slate-400/20" : "bg-amber-600/5 border-amber-600/20";
                                                        
                                                        return (
                                                            <div key={winner.id} className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 ${bgColors}`}>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-2xl">{rankMedal}</span>
                                                                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-semibold">
                                                                            {rankLabel}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-base text-foreground truncate">{winner.name}</h4>
                                                                        <p className="text-xs text-muted-foreground truncate">{winner.email}</p>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="space-y-3">
                                                                    <div className="bg-white/40 rounded-lg p-2.5 flex justify-between items-center text-xs font-bold">
                                                                        <div>
                                                                            <span className="text-[9px] text-muted-foreground uppercase block font-semibold">Score</span>
                                                                            <span className="text-primary font-black text-sm">{winner.score.toLocaleString()}</span>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <span className="text-[9px] text-muted-foreground uppercase block font-semibold">Time taken</span>
                                                                            <span className="text-foreground">{winner.timeTaken}s ({winner.difficulty})</span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="flex gap-2">
                                                                        <Button 
                                                                            variant="outline" 
                                                                            size="sm"
                                                                            onClick={() => handleCopyEmail(winner.email)}
                                                                            className="flex-1 h-9 rounded-lg text-xs font-bold border-primary/10 hover:bg-primary/5"
                                                                        >
                                                                            {copiedEmail === winner.email ? (
                                                                                <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                                                                            ) : (
                                                                                <Copy className="w-3.5 h-3.5 mr-1" />
                                                                            )}
                                                                            Copy
                                                                        </Button>
                                                                        <Button 
                                                                            asChild 
                                                                            variant="outline" 
                                                                            size="sm"
                                                                            className="flex-1 h-9 rounded-lg text-xs font-bold border-primary/10 hover:bg-primary/5 bg-primary/5 text-primary hover:text-primary"
                                                                        >
                                                                            <a href={`mailto:${winner.email}?subject=Jumia Memory Match Daily Winner!&body=Hello ${winner.name},%0D%0A%0D%0ACongratulations! You won ${rankLabel} in yesterday's Memory Match challenge with a score of ${winner.score.toLocaleString()}!`}>
                                                                                <Mail className="w-3.5 h-3.5 mr-1" />
                                                                                Email
                                                                            </a>
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="cards" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        {/* Add New Card Form */}
                        <Card className="glass-card rounded-3xl shadow-xl border-none overflow-hidden">
                            <CardHeader className="bg-white/50 border-b border-border p-6">
                                <div className="flex items-center gap-2">
                                    <Plus className="text-primary w-5 h-5" />
                                    <CardTitle className="text-xl font-black">Add New Game Card</CardTitle>
                                </div>
                                <CardDescription className="font-medium">Define images to be shown on game squares</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleAddCard} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Card Name</label>
                                        <Input 
                                            placeholder="e.g. Luxury Watch" 
                                            value={newCard.name}
                                            onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                                            className="bg-white/50 border-primary/10 rounded-xl h-12 focus-visible:ring-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Image URL</label>
                                        <Input 
                                            placeholder="https://example.com/image.png" 
                                            value={newCard.imageUrl}
                                            onChange={(e) => setNewCard({...newCard, imageUrl: e.target.value})}
                                            className="bg-white/50 border-primary/10 rounded-xl h-12 focus-visible:ring-primary"
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex justify-end pt-2">
                                        <Button 
                                            type="submit" 
                                            disabled={addingCard}
                                            className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-xl shadow-lg glow-primary"
                                        >
                                            {addingCard ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Game Card
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Card List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {gameItems.map((item) => (
                                <Card key={item.id} className="glass-card rounded-2xl shadow-md border-none overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="aspect-square relative bg-white flex items-center justify-center p-6 border-b border-muted">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            onClick={() => handleDeleteCard(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <CardContent className="p-4">
                                        <p className="font-black text-center text-sm truncate">{item.name}</p>
                                    </CardContent>
                                </Card>
                            ))}
                            {gameItems.length === 0 && (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white/30 rounded-3xl border-2 border-dashed border-primary/20">
                                    <LayoutGrid className="w-12 h-12 text-primary/20 mb-4" />
                                    <p className="text-muted-foreground font-medium italic">No game cards added yet.</p>
                                    <p className="text-xs text-muted-foreground mt-1">Add your first card above to start customizing the game!</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="config" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="glass-card rounded-3xl shadow-xl border-none overflow-hidden max-w-2xl">
                            <CardHeader className="bg-white/50 border-b border-border p-6">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="text-primary w-5 h-5" />
                                    <CardTitle className="text-xl font-black">Game Availability Settings</CardTitle>
                                </div>
                                <CardDescription className="font-medium">
                                    Control when the game is open and active for players.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSaveConfig} className="space-y-6">
                                    {/* Weekdays Only Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-white/40 border border-primary/5 rounded-2xl">
                                        <div className="space-y-1 pr-4">
                                            <label className="text-sm font-black uppercase tracking-wider text-foreground block cursor-pointer" htmlFor="weekdays-only">
                                                📅 Weekdays Only
                                            </label>
                                            <p className="text-xs text-muted-foreground font-medium">
                                                When enabled, the game will only be available to play Monday through Friday.
                                            </p>
                                        </div>
                                        <Switch 
                                            id="weekdays-only"
                                            checked={config.weekdaysOnly}
                                            onCheckedChange={(checked) => setConfig({ ...config, weekdaysOnly: checked })}
                                        />
                                    </div>

                                    {/* Time Range Selectors */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                ⏰ Start Time
                                            </label>
                                            <Input 
                                                type="time" 
                                                value={config.startTime}
                                                onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
                                                className="bg-white/50 border-primary/10 rounded-xl h-12 focus-visible:ring-primary font-bold"
                                                required
                                            />
                                            <p className="text-[10px] text-muted-foreground font-medium pl-1">
                                                Time the game opens (default: 08:00 AM)
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                ⏰ End Time
                                            </label>
                                            <Input 
                                                type="time" 
                                                value={config.endTime}
                                                onChange={(e) => setConfig({ ...config, endTime: e.target.value })}
                                                className="bg-white/50 border-primary/10 rounded-xl h-12 focus-visible:ring-primary font-bold"
                                                required
                                            />
                                            <p className="text-[10px] text-muted-foreground font-medium pl-1">
                                                Time the game closes (default: 11:59 PM)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div className="flex justify-end pt-4 border-t border-muted">
                                        <Button 
                                            type="submit" 
                                            disabled={savingConfig}
                                            className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-xl shadow-lg glow-primary min-w-[150px]"
                                        >
                                            {savingConfig ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                            ) : (
                                                "Save Settings"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
