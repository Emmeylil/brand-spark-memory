import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Mail, TrendingUp, Trash2, Download, Trophy, LogOut, Image as ImageIcon, Plus, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";

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

        return () => {
            unsubScores();
            unsubItems();
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

    const handleExportCSV = () => {
        if (players.length === 0) {
            toast.error("No player data to export.");
            return;
        }

        const headers = ["Name", "Email", "Score", "Difficulty", "Date"];
        const csvRows = [
            headers.join(","),
            ...players.map(p => {
                const date = p.timestamp ? new Date(p.timestamp.seconds * 1000).toISOString() : "N/A";
                return `${p.name},${p.email},${p.score},${p.difficulty},${date}`;
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
                                <p className="font-black text-xl leading-none">{players.length}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <Tabs defaultValue="leaderboard" className="w-full space-y-6">
                    <TabsList className="bg-white/50 p-1 rounded-2xl border border-white/50 backdrop-blur-md self-start">
                        <TabsTrigger value="leaderboard" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                            <Trophy className="w-4 h-4 mr-2" />
                            Leaderboard
                        </TabsTrigger>
                        <TabsTrigger value="cards" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Game Cards
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="leaderboard" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="glass-card rounded-3xl shadow-xl border-none overflow-hidden">
                            <CardHeader className="bg-white/50 border-b border-border p-6">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="text-primary w-5 h-5" />
                                    <CardTitle className="text-xl font-black">Score History</CardTitle>
                                </div>
                                <CardDescription className="font-medium">All recorded game sessions across all difficulties</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Player</TableHead>
                                                <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Contact</TableHead>
                                                <TableHead className="font-black uppercase text-[10px] tracking-widest px-6">Mode</TableHead>
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
                                            ) : players.map((player) => (
                                                <TableRow key={player.id} className="hover:bg-primary/[0.02] transition-colors border-b border-muted/50 last:border-0">
                                                    <TableCell className="font-bold px-6 py-4">{player.name}</TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                                            <Mail className="w-3.5 h-3.5" />
                                                            {player.email}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${player.difficulty === 'hard' ? 'bg-red-100 text-red-600' :
                                                            player.difficulty === 'medium' ? 'bg-orange-100 text-orange-600' :
                                                                'bg-green-100 text-green-600'
                                                            }`}>
                                                            {player.difficulty}
                                                        </span>
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
                                        </TableBody>
                                    </Table>
                                </div>
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
                </Tabs>
            </div>
        </div>
    );
}
