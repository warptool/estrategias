/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useMotionValue, animate, AnimatePresence } from 'motion/react';
import { RefreshCw, Heart, History, Share2, X, Download, ChevronDown } from 'lucide-react';
import { STRATEGIES } from './constants';
import { toPng } from 'html-to-image';

export default function App() {
  const [currentStrategy, setCurrentStrategy] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

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
      if (currentStrategy) {
        setHistory(prev => [currentStrategy, ...prev].slice(0, 10));
      }
      setCurrentStrategy(nextStrategy);
      setIsShuffling(false);
    }, 600);
  };

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 80;
    // Swipe down for history
    if (info.offset.y > 120) {
      setShowHistory(true);
      triggerHaptic(10);
      return;
    }
    
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.offset.y) > threshold) {
      handleRefresh();
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(15);
    if (favorites.includes(currentStrategy)) {
      setFavorites(prev => prev.filter(f => f !== currentStrategy));
    } else {
      setFavorites(prev => [currentStrategy, ...prev]);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cardRef.current) return;
    triggerHaptic(20);
    
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#121212',
        pixelRatio: 2, // Better quality
        style: {
          transform: 'scale(1)',
          borderRadius: '0px'
        }
      });
      
      const link = document.createElement('a');
      link.download = `estrategia-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error sharing image:', err);
    }
  };

  const cardShadows = `
    0px 9px 60px 0px rgba(0, 0, 0, 0.70),
    0px 4px 4px 0px rgba(0, 0, 0, 0.25),
    inset 0px 4px 5px 0px rgba(255, 250, 235, 0.50)
  `;

  return (
    <div 
      className="flex flex-col items-center justify-between min-h-screen p-8 md:p-12 font-inter-tight select-none overflow-hidden relative"
      style={{ background: 'radial-gradient(circle at center, #1E1E1E 0%, #121212 100%)' }}
    >
      <div className="grain-overlay" />
      
      {/* Top Navigation */}
      <div className="w-full flex justify-between items-center z-20">
        <button 
          onClick={() => setShowHistory(true)}
          className="p-2 text-[#F0EEE7]/40 hover:text-[#F0EEE7] transition-colors"
        >
          <History className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <ChevronDown className="w-4 h-4 text-[#F0EEE7]/20 animate-bounce" />
          <span className="text-[10px] text-[#F0EEE7]/20 uppercase tracking-widest">Desliza para historial</span>
        </div>
        <button 
          onClick={() => setShowFavorites(true)}
          className="p-2 text-[#F0EEE7]/40 hover:text-[#F0EEE7] transition-colors"
        >
          <Heart className={`w-6 h-6 ${favorites.length > 0 ? 'fill-current text-red-400/60' : ''}`} />
        </button>
      </div>

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
                ref={cardRef}
                className="w-full h-full cursor-grab active:cursor-grabbing preserve-3d"
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.4}
                onDragEnd={handleDragEnd}
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
                  
                  <p className="text-[#151515] text-center text-lg md:text-2xl font-inter-tight font-medium leading-tight relative z-10 mb-8">
                    {currentStrategy}
                  </p>

                  {/* Card Actions */}
                  <div className="flex gap-6 relative z-20 mt-auto">
                    <button 
                      onClick={toggleFavorite}
                      className={`p-2 rounded-full transition-all ${favorites.includes(currentStrategy) ? 'bg-red-500/10 text-red-500' : 'bg-black/5 text-black/40 hover:text-black'}`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(currentStrategy) ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                      onClick={handleShare}
                      className="p-2 rounded-full bg-black/5 text-black/40 hover:text-black transition-all"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
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

      {/* Drawers */}
      <AnimatePresence>
        {(showHistory || showFavorites) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowHistory(false); setShowFavorites(false); }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#1A1A1A] rounded-t-[32px] p-8 max-h-[80vh] overflow-y-auto relative border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-cormorant text-[#F0EEE7]">
                  {showHistory ? 'Historial' : 'Favoritos'}
                </h3>
                <button 
                  onClick={() => { setShowHistory(false); setShowFavorites(false); }}
                  className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {(showHistory ? history : favorites).length === 0 ? (
                  <p className="text-white/20 text-center py-12 italic">No hay nada por aquí todavía...</p>
                ) : (
                  (showHistory ? history : favorites).map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-6 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group"
                    >
                      <p className="text-[#F0EEE7]/80 text-sm leading-relaxed flex-1 pr-4">{item}</p>
                      <button 
                        onClick={() => {
                          setCurrentStrategy(item);
                          setIsFlipped(true);
                          setShowHistory(false);
                          setShowFavorites(false);
                        }}
                        className="p-2 bg-white/5 rounded-lg text-white/20 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Download className="w-4 h-4 rotate-[-90deg]" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



