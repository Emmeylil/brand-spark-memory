import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import jumiaLogo from "@/assets/jumia-logo.png";
import { ShieldCheck } from "lucide-react";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome, Admin!");
      navigate("/admin");
    } catch (error: any) {
      console.error("Login failed", error);
      toast.error(error.message || "Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary p-4 rounded-2xl shadow-xl transform -rotate-12">
            <ShieldCheck className="w-8 h-8 text-white" />
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl shadow-2xl p-8 pt-12 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight">
              Admin <span className="text-primary">Secured</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Please authenticate to access the backend.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-border bg-background/50 focus:border-primary focus:ring-primary text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-border bg-background/50 focus:border-primary focus:ring-primary text-base"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg rounded-2xl shadow-lg glow-primary transition-all active:scale-[0.98] hover:scale-[1.01]"
            >
              {loading ? "Authenticating..." : "Access Dashboard →"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
