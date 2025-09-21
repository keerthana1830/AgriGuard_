import React, { useEffect } from 'react';
import { LeafIcon } from './Icons';

export const SprinklerAnimation: React.FC<{ onEnd: () => void }> = ({ onEnd }) => {
  useEffect(() => {
    const timer = setTimeout(onEnd, 2500); // Animation lasts for up to 2.5 seconds
    return () => clearTimeout(timer);
  }, [onEnd]);

  return (
    <div 
      className="fixed inset-0 bg-blue-900 bg-opacity-70 flex items-center justify-center z-50 overflow-hidden backdrop-blur-sm cursor-pointer"
      onClick={onEnd}
    >
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 100 }).map((_, i) => {
          const style = {
            '--duration': `${Math.random() * 1.5 + 1}s`,
            '--delay': `${Math.random() * 1.5}s`,
            '--x-start': `${Math.random() * 100}vw`,
            '--x-end': `${Math.random() * 100}vw`,
            '--size': `${Math.random() * 2 + 1}px`,
          };
          return (
            <div
              key={i}
              className="absolute top-0 animate-rain-drop rounded-full bg-blue-200"
              style={style as React.CSSProperties}
            ></div>
          );
        })}
      </div>
      <div className="text-center text-white z-10 animate-fade-in-scale">
        <LeafIcon className="w-24 h-24 text-white mx-auto drop-shadow-lg" />
        <h2 className="text-3xl font-bold mt-4">TREATMENT ACTIVE</h2>
        <p className="text-lg opacity-80">Dispensing recommended solution.</p>
        <p className="text-sm opacity-70 mt-4 animate-pulse">(Click anywhere to continue)</p>
      </div>
      <style>{`
        @keyframes rain-drop {
          from {
            transform: translateY(-10vh) translateX(var(--x-start));
          }
          to {
            transform: translateY(110vh) translateX(var(--x-end));
          }
        }
        .animate-rain-drop {
          animation: rain-drop var(--duration) var(--delay) linear forwards;
          width: var(--size);
          height: calc(var(--size) * 8);
          clip-path: ellipse(50% 10% at 50% 10%);
        }
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
