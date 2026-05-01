"use client";

import { useMemo } from 'react';
import { motion } from 'motion/react';

const seeded = (value: number) => {
  const x = Math.sin(value) * 10000;
  return x - Math.floor(x);
};

export function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const x = seeded(i * 7 + 1);
        const y = seeded(i * 13 + 2);
        const size = seeded(i * 17 + 3) * 4 + 2;
        const duration = seeded(i * 19 + 4) * 10 + 10;
        const delay = seeded(i * 23 + 5) * 5;
        const drift = seeded(i * 29 + 6) * 20 - 10;

        return {
          id: i,
          x: Math.round(x * 10000) / 100, // Round to 2 decimal places
          y: Math.round(y * 10000) / 100,
          size: Math.round(size * 100) / 100, // Round to 2 decimal places
          duration: Math.round(duration * 100) / 100,
          delay: Math.round(delay * 100) / 100,
          drift: Math.round(drift * 100) / 100,
        };
      }),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, particle.drift, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Neural network lines */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"
          style={{
            left: 0,
            right: 0,
            top: `${(i + 1) * 12}%`,
          }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}
