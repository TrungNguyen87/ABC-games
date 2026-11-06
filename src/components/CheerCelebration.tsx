import React, { useState, useEffect } from 'react';
import { Language } from '../types/game';
import { sounds } from '../utils/soundEffects';
import { fireConfettiBurst } from './ConfettiCanvas';

export interface KidCheerDetail {
  message?: string;
  emoji?: string;
  type?: 'star' | 'word' | 'streak' | 'magic' | 'super';
  x?: number;
  y?: number;
}

interface FloatingCheer {
  id: number;
  message: string;
  emoji: string;
  x: number;
  y: number;
  color: string;
  rotation: number;
}

interface MilestoneBanner {
  title: string;
  subtitle: string;
  emoji: string;
}

/**
 * Global helper to trigger celebratory cheer effects for kids.
 */
export function triggerKidCheer(detail?: KidCheerDetail) {
  window.dispatchEvent(
    new CustomEvent('kid-cheer-event', {
      detail: detail || {},
    })
  );
}

interface CheerCelebrationProps {
  streak: number;
  language: Language;
}

const CHEER_WORDS_NL = [
  'HOERA!',
  'SUPER!',
  'GEWELDIG!',
  'GOED ZO!',
  'TOPPER!',
  'MAGISCH!',
  'BRAVO!',
  'KAMPJOEN!',
  'PRACHTIG!',
  'WOW!',
];

const CHEER_WORDS_EN = [
  'HOORAY!',
  'SUPER!',
  'AWESOME!',
  'GREAT JOB!',
  'YOU DID IT!',
  'MAGICAL!',
  'BRAVO!',
  'CHAMPION!',
  'WONDERFUL!',
  'WOW!',
];

const CHEER_EMOJIS = ['⭐', '🎉', '🌟', '🏆', '💖', '🌈', '🎈', '✨', '👏', '🦄', '🍎', '🍂'];
const CHEER_COLORS = [
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#3B82F6', // Blue
];

export default function CheerCelebration({ streak, language }: CheerCelebrationProps) {
  const [floaters, setFloaters] = useState<FloatingCheer[]>([]);
  const [milestoneBanner, setMilestoneBanner] = useState<MilestoneBanner | null>(null);

  // Listen for cheer events
  useEffect(() => {
    const handleCheerEvent = (e: any) => {
      const detail: KidCheerDetail = e?.detail || {};

      const wordsList = language === 'nl' ? CHEER_WORDS_NL : CHEER_WORDS_EN;
      const randomWord = wordsList[Math.floor(Math.random() * wordsList.length)];
      const randomEmoji = CHEER_EMOJIS[Math.floor(Math.random() * CHEER_EMOJIS.length)];
      const randomColor = CHEER_COLORS[Math.floor(Math.random() * CHEER_COLORS.length)];

      const message = detail.message || randomWord;
      const emoji = detail.emoji || randomEmoji;

      const posX = detail.x ?? window.innerWidth * (0.25 + Math.random() * 0.5);
      const posY = detail.y ?? window.innerHeight * (0.3 + Math.random() * 0.35);

      const newFloater: FloatingCheer = {
        id: Date.now() + Math.random(),
        message,
        emoji,
        x: posX,
        y: posY,
        color: randomColor,
        rotation: (Math.random() - 0.5) * 24,
      };

      setFloaters((prev) => [...prev.slice(-6), newFloater]);

      setTimeout(() => {
        setFloaters((prev) => prev.filter((f) => f.id !== newFloater.id));
      }, 1400);
    };

    window.addEventListener('kid-cheer-event', handleCheerEvent);
    return () => window.removeEventListener('kid-cheer-event', handleCheerEvent);
  }, [language]);

  // Streak celebration milestones (3, 5, 10, 15, 20...)
  useEffect(() => {
    if (streak > 0 && (streak === 3 || streak === 5 || streak === 10 || streak % 10 === 0)) {
      sounds.playKidsCheer();
      fireConfettiBurst('rainbow');

      const isNl = language === 'nl';
      const banner: MilestoneBanner = {
        title: isNl ? `🌟 ${streak} OP EEN RIJ! 🌟` : `🌟 ${streak} IN A ROW! 🌟`,
        subtitle:
          streak >= 10
            ? isNl
              ? 'Wauw, jij bent een echte ABC Superster! 🏆'
              : 'Wow, you are a real ABC Superstar! 🏆'
            : isNl
            ? 'Wat knap van jou! Blijf zo doorgaan! 🎉'
            : 'Super good job! Keep on shining! 🎉',
        emoji: streak >= 10 ? '👑' : streak >= 5 ? '🏆' : '⭐',
      };

      setMilestoneBanner(banner);

      const timer = setTimeout(() => {
        setMilestoneBanner(null);
      }, 2600);

      return () => clearTimeout(timer);
    }
  }, [streak, language]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {/* Floating Cheer Badges popping up from tap locations */}
      {floaters.map((f) => (
        <div
          key={f.id}
          style={{
            left: `${f.x}px`,
            top: `${f.y}px`,
            transform: `translate(-50%, -50%) rotate(${f.rotation}deg)`,
            borderColor: f.color,
          }}
          className="absolute flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.25)] border-4 animate-pop-in pointer-events-none"
        >
          <span className="text-3xl animate-kid-bounce">{f.emoji}</span>
          <span
            className="text-xl sm:text-2xl font-black tracking-wide drop-shadow-sm whitespace-nowrap"
            style={{ color: f.color }}
          >
            {f.message}
          </span>
          <span className="text-xl animate-spin">✨</span>
        </div>
      ))}

      {/* Milestone Fanfare Banner Popup */}
      {milestoneBanner && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-11/12 max-w-md animate-pop-in pointer-events-auto">
          <div className="relative bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 p-1 rounded-3xl shadow-[0_12px_30px_rgba(0,0,0,0.35)] border-4 border-white">
            <div className="bg-white/95 rounded-[1.4rem] p-4 text-center flex flex-col items-center">
              <div className="text-5xl animate-kid-bounce mb-1">
                {milestoneBanner.emoji}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-wide drop-shadow">
                {milestoneBanner.title}
              </h2>
              <p className="text-sm sm:text-base font-extrabold text-amber-900 mt-1">
                {milestoneBanner.subtitle}
              </p>

              {/* Cheerful Animated Mascot Letters clapping */}
              <div className="flex items-center gap-3 mt-2 text-3xl">
                <span className="animate-kid-bounce" style={{ animationDelay: '0s' }}>
                  🎉
                </span>
                <span className="animate-kid-bounce" style={{ animationDelay: '0.15s' }}>
                  👏
                </span>
                <span className="animate-kid-bounce" style={{ animationDelay: '0.3s' }}>
                  ⭐
                </span>
                <span className="animate-kid-bounce" style={{ animationDelay: '0.45s' }}>
                  👏
                </span>
                <span className="animate-kid-bounce" style={{ animationDelay: '0.6s' }}>
                  🎈
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
