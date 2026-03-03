import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      login(name, email);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-black text-3xl tracking-tighter shadow-lg glow-primary transform -rotate-2">
            JUMIA
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight">
              Match<span className="text-primary">Mania</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your details to play & win rewards
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 rounded-xl border-border bg-background/50 focus:border-primary focus:ring-primary text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-border bg-background/50 focus:border-primary focus:ring-primary text-base"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg rounded-2xl shadow-lg glow-primary transition-all active:scale-[0.98] hover:scale-[1.01]"
            >
              Start Playing →
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Play daily for a chance to win exclusive Jumia rewards
        </p>
      </div>
    </div>
  );
};

export default Login;
