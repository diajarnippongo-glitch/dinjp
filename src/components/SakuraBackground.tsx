import { useEffect, useState } from 'react';

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

export default function SakuraBackground() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 10,
      size: 10 + Math.random() * 8,
      opacity: 0.25 + Math.random() * 0.35,
    }));
    setPetals(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-20px] animate-sakura-fall"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
          }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2C11.5 5 14 6 17 6.5C14 7.5 12 9.5 11.5 12.5C10 10 7.5 9 5 9.5C7 7 8.5 5 10 2Z"
              fill="#fda4af"
            />
            <circle cx="10" cy="10" r="1.2" fill="#fb7185" />
          </svg>
        </div>
      ))}
    </div>
  );
}
