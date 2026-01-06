import { useEffect, useState } from "react";

const MOON_PHASES = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];

export function MoonPhase({ className = "" }: { className?: string }) {
  const [phase, setPhase] = useState(4); // Start with full moon

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % MOON_PHASES.length);
    }, 3750); // 30 seconds total cycle / 8 phases = 3.75 seconds per phase

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`text-6xl transition-all duration-1000 ease-in-out ${className}`}
      style={{ 
        transform: `scale(${phase === 4 ? 1.1 : 1})`,
        filter: `brightness(${phase === 4 ? 1.2 : 1})`
      }}
    >
      {MOON_PHASES[phase]}
    </div>
  );
}
