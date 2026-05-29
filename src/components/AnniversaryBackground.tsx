import React, { useEffect, useState } from "react";

interface Balloon {
  id: number;
  x: number; // percentage width
  y: number; // percentage height
  size: number; // width in pixels
  color: string;
  delay: number; // animation delay
  duration: number; // float duration
  swaySpeed: number; // sway period
}

// Celebration color palette for balloons: Pink, Purple, Gold, Peach, Blue
const BALLOON_COLORS = [
  "rgba(255, 138, 174, 0.75)",  // Vibrant Pink
  "rgba(141, 153, 255, 0.75)",  // Periwinkle/Blue
  "rgba(189, 147, 249, 0.75)",  // Purple
  "rgba(255, 184, 108, 0.75)",  // Peach/Orange
  "rgba(255, 236, 179, 0.75)",  // Soft Gold/Yellow
];

export const AnniversaryBackground: React.FC = () => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  useEffect(() => {
    // Generate scattered decorative background balloons
    const items: Balloon[] = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: 5 + Math.random() * 90, // scattered horizontally
      y: 20 + Math.random() * 70, // scattered vertically
      size: 55 + Math.random() * 55, // different sizes
      color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      delay: Math.random() * -20, // negative delay so they are pre-distributed
      duration: 20 + Math.random() * 15, // slow floating speed
      swaySpeed: 4 + Math.random() * 4,
    }));
    setBalloons(items);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Golden Celebration Gradient Background */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: "linear-gradient(135deg, #dca130 0%, #edd06d 40%, #f4d474 60%, #dca130 100%)",
        }}
      />

      {/* Massive Faint "ANNIVERSARY" Watermark Text */}
      <div 
        className="absolute inset-0 flex items-center justify-center select-none font-display font-black text-center"
        style={{
          fontSize: "12vw",
          color: "rgba(255, 255, 255, 0.055)",
          whiteSpace: "nowrap",
          letterSpacing: "0.15em",
          transform: "rotate(-5deg)",
          zIndex: 1,
        }}
      >
        ANNIVERSARY
      </div>

      {/* Floating Balloons Container */}
      <div className="absolute inset-0 w-full h-full z-[2]">
        {balloons.map((b) => (
          <div
            key={b.id}
            className="absolute"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}px`,
              height: `${b.size * 1.3}px`,
              animation: `float-slow ${b.duration}s infinite linear`,
              animationDelay: `${b.delay}s`,
            }}
          >
            <svg
              viewBox="0 0 100 130"
              width="100%"
              height="100%"
              style={{
                filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.12))",
                animation: `sway ${b.swaySpeed}s infinite ease-in-out`,
                animationDelay: `${b.delay}s`,
              }}
            >
              {/* Balloon Body */}
              <ellipse cx="50" cy="50" rx="38" ry="48" fill={b.color} />
              
              {/* Highlight/Gloss Effect */}
              <ellipse 
                cx="35" 
                cy="32" 
                rx="8" 
                ry="14" 
                fill="rgba(255, 255, 255, 0.35)" 
                transform="rotate(-18 35 32)" 
              />
              
              {/* Balloon Knot */}
              <polygon points="46,98 54,98 50,88" fill={b.color} />
              
              {/* String */}
              <path
                d="M50,98 Q47,114 53,130"
                fill="none"
                stroke="rgba(0, 0, 0, 0.15)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float-slow {
          0% {
            transform: translateY(110vh);
          }
          100% {
            transform: translateY(-150px);
          }
        }
        @keyframes sway {
          0%, 100% {
            transform: rotate(-6deg) translateX(-6px);
          }
          50% {
            transform: rotate(6deg) translateX(6px);
          }
        }
      `}</style>
    </div>
  );
};
