import React, { useState, useEffect, useRef } from 'react';
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
  createdAt: number;
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
  try {
    window.dispatchEvent(
      new CustomEvent('kid-cheer-event', {
        detail: detail || {},
      })
    );
  } catch {}
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
];

const CHEER_EMOJIS = ['⭐', '🎉', '🌟', '🏆', '💖', '🌈', '🎈', '✨'];
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
  const milestoneTimerRef = useRef<any>(null);

  // Self-cleaning heartbeat: ensures floaters NEVER linger even if window events or tabs lag
  useEffect(() => {
    const cleaner = setInterval(() => {
      const now = Date.now();
      setFloaters((prev) => prev.filter((f) => now - f.createdAt < 1400));
    }, 800);

    return () => clearInterval(cleaner);
  }, []);

  // Listen for cheer events
  useEffect(() => {
    const handleCheerEvent = (e: any) => {
      const detail: KidCheerDetail = e?.detail || {};
      const now = Date.now();

      const wordsList = language === 'nl' ? CHEER_WORDS_NL : CHEER_WORDS_EN;
      const randomWord = wordsList[Math.floor(Math.random() * wordsList.length)];
      const randomEmoji = CHEER_EMOJIS[Math.floor(Math.random() * CHEER_EMOJIS.length)];
      const randomColor = CHEER_COLORS[Math.floor(Math.random() * CHEER_COLORS.length)];

      const message = detail.message || randomWord;
      const emoji = detail.emoji || randomEmoji;

      // Safe positions within center viewport
      const posX = detail.x ?? window.innerWidth * (0.3 + Math.random() * 0.4);
      const posY = detail.y ?? window.innerHeight * (0.35 + Math.random() * 0.3);

      const newFloater: FloatingCheer = {
        id: now + Math.random(),
        message,
        emoji,
        x: Math.max(80, Math.min(window.innerWidth - 80, posX)),
        y: Math.max(100, Math.min(window.innerHeight - 100, posY)),
        color: randomColor,
        rotation: (Math.random() - 0.5) * 16,
        createdAt: now,
      };

      // Keep at most 3 floaters at a time so screen is never crowded
      setFloaters((prev) => [...prev.slice(-2), newFloater]);
    };

    window.addEventListener('kid-cheer-event', handleCheerEvent);
    return () => window.removeEventListener('kid-cheer-event', handleCheerEvent);
  }, [language]);

  // Streak celebration milestones (5, 10, 15, 20...)
  useEffect(() => {
    if (streak > 0 && (streak === 5 || streak === 10 || streak % 10 === 0)) {
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
        emoji: streak >= 10 ? '👑' : '⭐',
      };

      setMilestoneBanner(banner);

      if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current);
      milestoneTimerRef.current = setTimeout(() => {
        setMilestoneBanner(null);
      }, 2000);
    }

    return () => {
      if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current);
    };
  }, [streak, language]);

  return (
    // STRICT pointer-events-none on everything so it can NEVER block toddler taps or interactions!
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {/* Floating Cheer Badges popping up and gently floating up & fading away */}
      {floaters.map((f) => (
        <div
          key={f.id}
          style={{
            left: `${f.x}px`,
            top: `${f.y}px`,
            transform: `translate(-50%, -50%) rotate(${f.rotation}deg)`,
            borderColor: f.color,
          }}
          className="absolute flex items-center gap-2 px-3.5 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.25)] border-3 sm:border-4 pointer-events-none animate-pop-in"
        >
          <span className="text-2xl sm:text-3xl animate-kid-bounce">{f.emoji}</span>
          <span
            className="text-lg sm:text-2xl font-black tracking-wide drop-shadow-sm whitespace-nowrap"
            style={{ color: f.color }}
          >
            {f.message}
          </span>
          <span className="text-lg sm:text-xl animate-spin">✨</span>
        </div>
      ))}

      {/* Milestone Fanfare Banner Popup - strictly pointer-events-none */}
      {milestoneBanner && (
        <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 w-11/12 max-w-sm sm:max-w-md pointer-events-none animate-pop-in">
          <div className="relative bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 p-1 rounded-3xl shadow-[0_12px_30px_rgba(0,0,0,0.35)] border-4 border-white pointer-events-none">
            <div className="bg-white/95 rounded-[1.4rem] p-3 sm:p-4 text-center flex flex-col items-center pointer-events-none">
              <div className="text-4xl sm:text-5xl animate-kid-bounce mb-1">
                {milestoneBanner.emoji}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-950 tracking-wide drop-shadow">
                {milestoneBanner.title}
              </h2>
              <p className="text-xs sm:text-sm font-extrabold text-amber-900 mt-1">
                {milestoneBanner.subtitle}
              </p>

              {/* Cheerful Animated Mascot Letters */}
              <div className="flex items-center gap-2.5 mt-2 text-2xl sm:text-3xl pointer-events-none">
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
