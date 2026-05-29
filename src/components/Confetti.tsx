import React, { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  shape: "circle" | "square" | "triangle";
  angle: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = ["#ff5964", "#35a7ff", "#38b000", "#ffc857", "#e71d36", "#2ec4b6", "#ff9f1c", "#a2d2ff", "#ffafcc"];

export const Confetti: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate burst particles on mount
    const initialParticles: Particle[] = Array.from({ length: 100 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 14;
      const size = 5 + Math.random() * 9;
      const shapes: ("circle" | "square" | "triangle")[] = ["circle", "square", "triangle"];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      return {
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 - 80, // Burst from center-ish area
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size,
        shape,
        angle,
        speed,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: 1,
      };
    });

    setParticles(initialParticles);

    // Animation Loop
    let animationFrameId: number;
    const startTime = Date.now();

    const updateParticles = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > 3500) {
        setParticles([]);
        return;
      }

      setParticles((prev) =>
        prev
          .map((p) => {
            // Apply gravity and drag
            const vx = Math.cos(p.angle) * p.speed;
            const vy = Math.sin(p.angle) * p.speed + 0.25; // gravity pull
            const newAngle = Math.atan2(vy, vx);
            const newSpeed = Math.max(0.4, p.speed * 0.975); // drag slowing down

            return {
              ...p,
              x: p.x + Math.cos(newAngle) * newSpeed,
              y: p.y + Math.sin(newAngle) * newSpeed,
              angle: newAngle,
              speed: newSpeed,
              rotation: p.rotation + p.rotationSpeed,
              opacity: Math.max(0, 1 - elapsed / 3500), // fade out
            };
          })
          .filter((p) => p.y < window.innerHeight + 50 && p.opacity > 0)
      );

      animationFrameId = requestAnimationFrame(updateParticles);
    };

    animationFrameId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => {
        const style: React.CSSProperties = {
          position: "absolute",
          left: `${p.x}px`,
          top: `${p.y}px`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          backgroundColor: p.shape !== "triangle" ? p.color : "transparent",
          opacity: p.opacity,
          transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
          borderRadius: p.shape === "circle" ? "50%" : "0%",
        };

        if (p.shape === "triangle") {
          style.borderLeft = `${p.size / 2}px solid transparent`;
          style.borderRight = `${p.size / 2}px solid transparent`;
          style.borderBottom = `${p.size}px solid ${p.color}`;
          style.width = "0";
          style.height = "0";
        }

        return <div key={p.id} style={style} />;
      })}
    </div>
  );
};
