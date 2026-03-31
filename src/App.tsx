/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, animate, AnimatePresence } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { STRATEGIES } from './constants';

export default function App() {
  const [currentStrategy, setCurrentStrategy] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  
  // Motion value for flip only
  const flipRotation = useMotionValue(0);

  const triggerHaptic = (intensity: number = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(intensity);
    }
  };

  const getRandomStrategy = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * STRATEGIES.length);
    return STRATEGIES[randomIndex];
  }, []);

  useEffect(() => {
    const strategy = getRandomStrategy();
    setCurrentStrategy(strategy);
  }, [getRandomStrategy]);

  // Animate flip rotation when isFlipped changes
  useEffect(() => {
    animate(flipRotation, isFlipped ? 180 : 0, {
      type: 'spring',
      stiffness: 260,
      damping: 25,
    });
  }, [isFlipped, flipRotation]);

  const handleFlip = () => {
    triggerHaptic(15);
    setIsFlipped(!isFlipped);
  };

  const handleRefresh = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    triggerHaptic(20);
    setIsShuffling(true);
    setIsFlipped(false);
    
    // Shuffle animation
    setTimeout(() => {
      const nextStrategy = getRandomStrategy();
      setCurrentStrategy(nextStrategy);
      setIsShuffling(false);
    }, 600);
  };

  const cardShadows = `
    0px 9px 60px 0px rgba(0, 0, 0, 0.70),
    0px 4px 4px 0px rgba(0, 0, 0, 0.25),
    inset 0px 4px 5px 0px rgba(255, 250, 235, 0.50)
  `;

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-8 md:p-12 font-inter-tight select-none overflow-hidden relative"
      style={{ background: 'radial-gradient(circle at center, #1E1E1E 0%, #121212 100%)' }}
    >
      <div className="grain-overlay" />
      
      <div className="flex-1 flex items-center justify-center w-full relative">
        <AnimatePresence mode="wait">
          {!isShuffling ? (
            <motion.div
              key="card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -20 }}
              className="relative w-full max-w-[320px] aspect-[3/4.5] perspective-1000"
            >
              <motion.div
                className="w-full h-full cursor-pointer preserve-3d"
                style={{
                  rotateY: flipRotation,
                  transformStyle: 'preserve-3d',
                }}
                onTap={handleFlip}
              >
                {/* Front Side (Estrategia) */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center backface-hidden overflow-hidden border border-white/5"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(180deg, #F0EEE7 60%, #E0DBCA 100%)',
                    boxShadow: cardShadows,
                    transform: 'translateZ(1px)'
                  }}
                >
                  <div className="absolute inset-0 opacity-[0.12] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
                  <div className="absolute inset-0 border-[0.5px] border-black/5 rounded-2xl pointer-events-none" />
                  <h2 className="text-[#151515] text-3xl font-cormorant font-light tracking-wide relative z-10">
                    Estrategia
                  </h2>
                </div>

                {/* Back Side (Strategy Content) */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl flex flex-col items-center justify-center p-10 backface-hidden overflow-hidden border border-white/5"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg) translateZ(1px)',
                    background: 'linear-gradient(180deg, #F0EEE7 60%, #E0DBCA 100%)',
                    boxShadow: cardShadows
                  }}
                >
                  <div className="absolute inset-0 opacity-[0.12] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
                  <div className="absolute inset-0 border-[0.5px] border-black/5 rounded-2xl pointer-events-none" />
                  
                  <div className="flex-1 flex items-center justify-center w-full relative z-10">
                    <p className="text-[#151515] text-center text-lg md:text-2xl font-inter-tight font-medium leading-tight">
                      {currentStrategy}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="shuffle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-2"
            >
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 0.4, 
                    repeat: Infinity, 
                    delay: i * 0.1 
                  }}
                  className="w-12 h-16 bg-[#F0EEE7] rounded-md shadow-lg border border-black/5"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        id="refresh-button"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleRefresh()}
        className="mb-4 w-14 h-14 rounded-xl text-[#151515] transition-colors flex items-center justify-center shadow-lg group relative overflow-hidden z-10 shrink-0"
        style={{ background: 'linear-gradient(180deg, #F0EEE7 60%, #E0DBCA 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
        <RefreshCw className={`w-8 h-8 group-hover:rotate-180 transition-transform duration-700 ease-in-out relative z-10 ${isShuffling ? 'animate-spin' : ''}`} />
      </motion.button>
    </div>
  );
}



