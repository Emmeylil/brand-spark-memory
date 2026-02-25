interface MemoryCardProps {
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
  animState: "idle" | "shake" | "match";
  onClick: () => void;
}

const MemoryCard = ({ icon, isFlipped, isMatched, animState, onClick }: MemoryCardProps) => {
  const animClass =
    animState === "shake" ? "animate-shake" :
    animState === "match" ? "animate-match-pop" : "";

  return (
    <button
      onClick={onClick}
      disabled={isFlipped || isMatched}
      className="card-flip aspect-square w-full"
      aria-label={isFlipped ? `Card showing ${icon}` : "Face-down card"}
    >
      <div className={`card-inner relative w-full h-full ${isFlipped || isMatched ? "flipped" : ""}`}>
        {/* Back of card */}
        <div className="card-back absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-2 border-primary/30 shadow-lg cursor-pointer active:scale-95 transition-transform">
          <div className="text-primary-foreground font-display text-2xl opacity-80 select-none">?</div>
          <div className="absolute inset-2 rounded-lg border border-primary-foreground/20" />
        </div>

        {/* Front of card */}
        <div
          className={`card-front absolute inset-0 rounded-xl flex items-center justify-center border-2 shadow-lg transition-colors ${
            isMatched
              ? "bg-success/20 border-success glow-success"
              : "bg-card border-border"
          } ${animClass}`}
        >
          <span className="text-3xl sm:text-4xl select-none">{icon}</span>
        </div>
      </div>
    </button>
  );
};

export default MemoryCard;
