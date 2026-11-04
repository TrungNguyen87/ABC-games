import React, { useState } from 'react';
import { sounds } from '../utils/soundEffects';
import { Language } from '../types/game';

interface AlphabetLoreAvatarProps {
  letter: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSpookyHalloween?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  language?: Language;
  asDiv?: boolean;
}

export interface LoreCharacterDef {
  letter: string;
  name: string;
  color: string;
  shadowColor: string;
  soundQuote: string;
  soundQuoteNl: string;
  personality: string;
}

export const LORE_CHARACTERS: Record<string, LoreCharacterDef> = {
  A: { letter: 'A', name: 'A', color: '#EF4444', shadowColor: '#B91C1C', soundQuote: 'Ahhh!', soundQuoteNl: 'Aaaah!', personality: 'Bold Leader' },
  B: { letter: 'B', name: 'B', color: '#93C5FD', shadowColor: '#3B82F6', soundQuote: 'Beeee!', soundQuoteNl: 'Beee!', personality: 'Butterfly Buddy' },
  C: { letter: 'C', name: 'C', color: '#FDE047', shadowColor: '#CA8A04', soundQuote: 'Chomp Chomp!', soundQuoteNl: 'Hap Hap!', personality: 'Toothy Biter' },
  D: { letter: 'D', name: 'D', color: '#86EFAC', shadowColor: '#16A34A', soundQuote: 'Deee!', soundQuoteNl: 'Deee!', personality: 'Cheerful Green' },
  E: { letter: 'E', name: 'E', color: '#5EEAD4', shadowColor: '#0D9488', soundQuote: 'Eeeeee!', soundQuoteNl: 'Eeeee!', personality: 'Wide Grin' },
  F: { letter: 'F', name: 'F', color: '#18181B', shadowColor: '#000000', soundQuote: 'Efff!', soundQuoteNl: 'Efff!', personality: 'Spooky Villain' },
  G: { letter: 'G', name: 'G', color: '#A855F7', shadowColor: '#7E22CE', soundQuote: 'Guhhh!', soundQuoteNl: 'Geee!', personality: 'Grumpy Giant' },
  H: { letter: 'H', name: 'H', color: '#A7F3D0', shadowColor: '#059669', soundQuote: 'Hooooly Ghost!', soundQuoteNl: 'Spookje Hhh!', personality: 'Friendly Ghost' },
  I: { letter: 'I', name: 'I', color: '#BAE6FD', shadowColor: '#0284C7', soundQuote: 'Iii-i!', soundQuoteNl: 'Iii-i!', personality: 'Sweet Little Column' },
  J: { letter: 'J', name: 'J', color: '#C084FC', shadowColor: '#9333EA', soundQuote: 'Jaaay!', soundQuoteNl: 'Jeeey!', personality: 'Playful Hook' },
  K: { letter: 'K', name: 'K', color: '#FACC15', shadowColor: '#A16207', soundQuote: 'Moth Flutter!', soundQuoteNl: 'Fladder Vleugels!', personality: 'Moth Flyer' },
  L: { letter: 'L', name: 'L', color: '#2DD4BF', shadowColor: '#0F766E', soundQuote: 'Ellll!', soundQuoteNl: 'Ellll!', personality: 'Smug Teal' },
  M: { letter: 'M', name: 'M', color: '#991B1B', shadowColor: '#450A0A', soundQuote: 'Mmmm!', soundQuoteNl: 'Mmmm!', personality: 'Mighty Hero' },
  N: { letter: 'N', name: 'N', color: '#FB923C', shadowColor: '#C2410C', soundQuote: 'Ennn!', soundQuoteNl: 'Ennn!', personality: 'Happy Orange' },
  O: { letter: 'O', name: 'O', color: '#0284C7', shadowColor: '#075985', soundQuote: 'Ooooh!', soundQuoteNl: 'Ooooh!', personality: 'Wide Open O' },
  P: { letter: 'P', name: 'P', color: '#F472B6', shadowColor: '#BE185D', soundQuote: 'Peee!', soundQuoteNl: 'Peee!', personality: 'Pretty Pink' },
  Q: { letter: 'Q', name: 'Q', color: '#E2E8F0', shadowColor: '#94A3B8', soundQuote: 'Kyoo-kyoo!', soundQuoteNl: 'Kuuu-slak!', personality: 'Slug Snail' },
  R: { letter: 'R', name: 'R', color: '#B91C1C', shadowColor: '#7F1D1D', soundQuote: 'Arrrr!', soundQuoteNl: 'Errrr!', personality: 'Grinning Red' },
  S: { letter: 'S', name: 'S', color: '#84CC16', shadowColor: '#4D7C0F', soundQuote: 'Ssssssnake!', soundQuoteNl: 'Ssssslang!', personality: 'Slither Snake' },
  T: { letter: 'T', name: 'T', color: '#475569', shadowColor: '#1E293B', soundQuote: 'Tee-shark!', soundQuoteNl: 'Tee-haai!', personality: 'Hammerhead Shark' },
  U: { letter: 'U', name: 'U', color: '#A3E635', shadowColor: '#65A30D', soundQuote: 'Yooou!', soundQuoteNl: 'Uuuu!', personality: 'Cup Hugger' },
  V: { letter: 'V', name: 'V', color: '#2563EB', shadowColor: '#1D4ED8', soundQuote: 'Veee!', soundQuoteNl: 'Veee!', personality: 'Sharp Blue' },
  W: { letter: 'W', name: 'W', color: '#7E22CE', shadowColor: '#581C87', soundQuote: 'Double Trouble!', soundQuoteNl: 'Dubbele Pret!', personality: 'Twin Heads' },
  X: { letter: 'X', name: 'X', color: '#F1F5F9', shadowColor: '#94A3B8', soundQuote: 'Ninja Slash!', soundQuoteNl: 'Ninja Flits!', personality: 'Ninja Master' },
  Y: { letter: 'Y', name: 'Y', color: '#FEF08A', shadowColor: '#CA8A04', soundQuote: 'Whyyy?!', soundQuoteNl: 'Waarom?!', personality: 'Surprised Y' },
  Z: { letter: 'Z', name: 'Z', color: '#E2E8F0', shadowColor: '#64748B', soundQuote: 'Planet Zzz!', soundQuoteNl: 'Planeet Zet!', personality: 'Cosmic Planet' },
};

export default function AlphabetLoreAvatar({
  letter,
  size = 'md',
  isSpookyHalloween = false,
  interactive = true,
  onClick,
  className = '',
  language = 'nl',
  asDiv = false,
}: AlphabetLoreAvatarProps) {
  const [isBouncing, setIsBouncing] = useState(false);

  const upperLetter = letter.toUpperCase();
  const lore = LORE_CHARACTERS[upperLetter] || {
    letter: upperLetter,
    name: upperLetter,
    color: '#EF4444',
    shadowColor: '#B91C1C',
    soundQuote: upperLetter,
    soundQuoteNl: upperLetter,
    personality: 'Letter Lore',
  };

  const sizeClasses = {
    sm: 'w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 text-2xl sm:text-3xl rounded-xl sm:rounded-2xl',
    md: 'w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 text-3xl sm:text-4xl rounded-2xl',
    lg: 'w-22 h-22 sm:w-24 sm:h-24 md:w-28 md:h-28 text-5xl sm:text-6xl rounded-[1.8rem]',
    xl: 'w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 text-6xl sm:text-7xl rounded-[2.2rem]',
  };

  const handleClick = () => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 500);

    if (onClick) {
      onClick();
    } else if (interactive) {
      sounds.playBoing();
      const quote = language === 'nl' ? lore.soundQuoteNl : lore.soundQuote;
      sounds.speak(`${upperLetter}! ${quote}`, language);
    }
  };

  const isClickable = interactive || Boolean(onClick);
  const shouldUseDiv = asDiv || !isClickable;
  const Tag = shouldUseDiv ? 'div' : 'button';

  const shadowHeight = size === 'sm' ? '4px' : size === 'md' ? '6px' : '8px';

  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none pt-2 ${className}`}>
      {/* Halloween Cute Spooky Hat / Bat Wings when Halloween mode is active */}
      {isSpookyHalloween && (
        <div
          className={`absolute z-30 pointer-events-none animate-bounce ${
            size === 'sm'
              ? '-top-2 text-base sm:text-lg'
              : size === 'md'
              ? '-top-3 sm:-top-3.5 text-xl'
              : '-top-4 sm:-top-5 text-2xl sm:text-3xl'
          }`}
        >
          {upperLetter === 'F' ? (
            <span>🦇</span>
          ) : upperLetter === 'H' ? (
            <span>👻</span>
          ) : (
            <span>🧙‍♀️</span>
          )}
        </div>
      )}

      <Tag
        {...(!shouldUseDiv ? { type: 'button', onClick: handleClick } : {})}
        {...(shouldUseDiv && onClick ? { onClick: handleClick, role: 'button', tabIndex: 0 } : {})}
        aria-label={`Alphabet Lore Character ${upperLetter}`}
        style={{
          backgroundColor: lore.color,
          boxShadow: `0 ${shadowHeight} 0 ${lore.shadowColor}, 0 10px 14px rgba(0,0,0,0.2)`,
        }}
        className={`relative ${sizeClasses[size]} flex items-center justify-center font-black transition-all select-none border-2 border-black/40
          ${isClickable ? 'cursor-pointer active:translate-y-1 active:shadow-none hover:scale-105' : ''}
          ${isBouncing ? 'animate-kid-wiggle' : ''}
          ${upperLetter === 'F' ? 'text-white' : upperLetter === 'X' || upperLetter === 'Z' || upperLetter === 'Q' ? 'text-slate-900' : 'text-white'}
        `}
      >
        {/* Special Lore Feature Accents */}
        {upperLetter === 'B' && (
          // B wings
          <div className="absolute -left-3 top-1 text-xl sm:text-2xl pointer-events-none opacity-90">
            🦋
          </div>
        )}

        {upperLetter === 'K' && (
          // K butterfly/moth wings
          <div className="absolute -right-3 top-1 text-xl sm:text-2xl pointer-events-none">
            🪽
          </div>
        )}

        {upperLetter === 'H' && (
          // H ghost glow
          <div className="absolute inset-0 rounded-3xl bg-emerald-200/40 animate-pulse pointer-events-none" />
        )}

        {upperLetter === 'S' && (
          // S snake tongue
          <div className="absolute -top-1.5 right-2 w-2 h-4 bg-red-600 rounded-full rotate-45 pointer-events-none" />
        )}

        {upperLetter === 'X' && (
          // X ninja headband
          <div className="absolute top-2 left-1 right-1 h-3 bg-purple-700 rounded-sm flex items-center justify-center pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-red-500" />
          </div>
        )}

        {/* Big Letter Text with stylized Comic Lore Outline */}
        <span
          className="relative z-10 font-black tracking-tight"
          style={{
            textShadow: '0 3px 0 rgba(0,0,0,0.3)',
          }}
        >
          {upperLetter}
        </span>

        {/* Bespoke Alphabet Lore Eyes & Teeth Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          {upperLetter === 'F' ? (
            // Villain F Jagged Fangs & Fierce Eyes
            <svg viewBox="0 0 100 100" className="w-full h-full p-1 drop-shadow-md">
              {/* Angry Eyes */}
              <circle cx="34" cy="30" r="10" fill="#FFFFFF" />
              <circle cx="36" cy="30" r="4.5" fill="#EF4444" />
              <circle cx="66" cy="30" r="10" fill="#FFFFFF" />
              <circle cx="64" cy="30" r="4.5" fill="#EF4444" />
              <line x1="22" y1="20" x2="44" y2="28" stroke="#FFFFFF" strokeWidth="3" />
              <line x1="78" y1="20" x2="56" y2="28" stroke="#FFFFFF" strokeWidth="3" />
              {/* Sharp White Jagged Teeth */}
              <polygon points="30,68 35,56 40,68 45,56 50,68 55,56 60,68 65,56 70,68" fill="#FFFFFF" />
            </svg>
          ) : upperLetter === 'A' ? (
            // Heroic A with Vertical Teeth Grill
            <svg viewBox="0 0 100 100" className="w-full h-full p-1 drop-shadow-md">
              <circle cx="32" cy="32" r="9" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
              <circle cx="33" cy="32" r="3.5" fill="#000000" />
              <circle cx="68" cy="32" r="9" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
              <circle cx="67" cy="32" r="3.5" fill="#000000" />
              {/* Vertical Teeth in Mouth */}
              <rect x="36" y="52" width="28" height="14" rx="3" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
              <line x1="43" y1="52" x2="43" y2="66" stroke="#000" strokeWidth="1.5" />
              <line x1="50" y1="52" x2="50" y2="66" stroke="#000" strokeWidth="1.5" />
              <line x1="57" y1="52" x2="57" y2="66" stroke="#000" strokeWidth="1.5" />
            </svg>
          ) : upperLetter === 'C' ? (
            // C with biting snapping mouth
            <svg viewBox="0 0 100 100" className="w-full h-full p-1">
              <circle cx="35" cy="32" r="8" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
              <circle cx="37" cy="32" r="3.5" fill="#000000" />
              {/* Snapping jaw teeth */}
              <polygon points="55,42 62,48 55,54" fill="#FFFFFF" stroke="#000" strokeWidth="1" />
            </svg>
          ) : upperLetter === 'I' ? (
            // Cute I with large square glasses
            <svg viewBox="0 0 100 100" className="w-full h-full p-1">
              <rect x="25" y="24" width="20" height="20" rx="4" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
              <circle cx="35" cy="34" r="4" fill="#000" />
              <rect x="55" y="24" width="20" height="20" rx="4" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
              <circle cx="65" cy="34" r="4" fill="#000" />
              <line x1="45" y1="34" x2="55" y2="34" stroke="#000" strokeWidth="2" />
              {/* Sweet smile */}
              <path d="M 42 64 Q 50 72 58 64" stroke="#000" strokeWidth="2" fill="none" />
            </svg>
          ) : upperLetter === 'Q' ? (
            // Snail slug face with cute shell
            <svg viewBox="0 0 100 100" className="w-full h-full p-1">
              {/* Eye stalks */}
              <circle cx="34" cy="22" r="7" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
              <circle cx="35" cy="22" r="3" fill="#000" />
              <circle cx="56" cy="22" r="7" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
              <circle cx="55" cy="22" r="3" fill="#000" />
              {/* Snail slug mouth */}
              <path d="M 40 44 Q 45 50 50 44" stroke="#000" strokeWidth="2" fill="none" />
            </svg>
          ) : (
            // Standard expressive Alphabet Lore eyes
            <svg viewBox="0 0 100 100" className="w-full h-full p-1 drop-shadow-md">
              <circle cx="32" cy="28" r="8" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
              <circle cx="33" cy="28" r="3.5" fill="#000000" />
              <circle cx="68" cy="28" r="8" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
              <circle cx="67" cy="28" r="3.5" fill="#000000" />
              {/* Cute smile or tooth */}
              <path d="M 38 48 Q 50 58 62 48" stroke="#000" strokeWidth="2" fill="#FFFFFF" />
            </svg>
          )}
        </div>
      </Tag>

      {/* Spooky text badge ONLY on large showcase avatars so grid letters are never truncated */}
      {isSpookyHalloween && (size === 'xl' || size === 'lg') && (
        <span className="text-[11px] sm:text-xs font-black text-amber-950 bg-amber-300 px-2 py-0.5 rounded-full mt-1 border border-amber-500 shadow-sm whitespace-nowrap">
          🎃 Lore {upperLetter}
        </span>
      )}
    </div>
  );
}
