import React, { useState, useEffect } from 'react';
import { LetterInfo, Language } from '../types/game';
import { sounds } from '../utils/soundEffects';

interface LetterAvatarProps {
  letterInfo: LetterInfo;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  status?: 'idle' | 'celebrating' | 'wrong' | 'speaking';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  showWord?: boolean;
  language?: Language;
  asDiv?: boolean;
}

export default function LetterAvatar({
  letterInfo,
  size = 'md',
  status = 'idle',
  interactive = true,
  onClick,
  className = '',
  showWord = false,
  language = 'en',
  asDiv = false,
}: LetterAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  // Natural toddler-friendly eye blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 2800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Pupil movement based on state
  useEffect(() => {
    if (status === 'wrong') {
      setPupilOffset({ x: 4, y: 3 });
    } else if (status === 'celebrating') {
      setPupilOffset({ x: 0, y: -2 });
    } else {
      setPupilOffset({ x: 0, y: 0 });
    }
  }, [status]);

  const sizeClasses = {
    sm: 'w-16 h-16 text-3xl rounded-2xl',
    md: 'w-24 h-24 sm:w-28 sm:h-28 text-5xl sm:text-6xl rounded-3xl',
    lg: 'w-32 h-32 sm:w-40 sm:h-40 text-7xl sm:text-8xl rounded-[2.2rem]',
    xl: 'w-44 h-44 sm:w-52 sm:h-52 text-8xl sm:text-9xl rounded-[2.8rem]',
    hero: 'w-48 h-48 sm:w-60 sm:h-60 text-8xl sm:text-[8rem] rounded-[3rem]',
  };

  const currentWord = language === 'nl' ? letterInfo.wordNl || letterInfo.word : letterInfo.word;
  const currentPhonics = language === 'nl' ? letterInfo.phonicsNl || letterInfo.phonics : letterInfo.phonics;
  const currentEmoji = language === 'nl' ? letterInfo.emojiNl || letterInfo.emoji : letterInfo.emoji;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else if (interactive) {
      sounds.playBoing();
      sounds.speak(`${letterInfo.letter}! ${currentWord}!`, language);
    }
  };

  const isWobbly = status === 'wrong';
  const isBouncy = status === 'celebrating';
  const isClickable = interactive || Boolean(onClick);
  const shouldUseDiv = asDiv || !isClickable;
  const Tag = shouldUseDiv ? 'div' : 'button';

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <Tag
        {...(!shouldUseDiv ? { type: 'button', onClick: handleClick } : {})}
        {...(shouldUseDiv && onClick ? { onClick: handleClick, role: 'button', tabIndex: 0 } : {})}
        aria-label={`Letter ${letterInfo.letter} for ${letterInfo.word}`}
        style={{
          backgroundColor: letterInfo.color,
          boxShadow: `0 10px 0 ${letterInfo.shadowColor}, 0 20px 25px -5px rgba(0,0,0,0.25)`,
        }}
        className={`relative ${sizeClasses[size]} flex items-center justify-center font-bold text-white transition-all select-none
          ${isClickable ? 'cursor-pointer active:translate-y-2 active:shadow-none hover:scale-[1.03]' : ''}
          ${isWobbly ? 'animate-shake-wrong' : ''}
          ${isBouncy ? 'animate-kid-wiggle' : ''}
        `}
      >
        {/* Subtle top gloss highlight */}
        <div className="absolute top-2 left-3 right-3 h-1/4 bg-white/25 rounded-t-2xl pointer-events-none" />

        {/* Waving little hands on side */}
        <div
          className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-6 rounded-full opacity-90 transition-transform ${
            isBouncy ? '-rotate-45' : 'rotate-12'
          }`}
          style={{ backgroundColor: letterInfo.shadowColor }}
        />
        <div
          className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-6 rounded-full opacity-90 transition-transform ${
            isBouncy ? 'rotate-45' : '-rotate-12'
          }`}
          style={{ backgroundColor: letterInfo.shadowColor }}
        />

        {/* Big Letter Text */}
        <span
          className="relative z-10 drop-shadow-md select-none mt-2"
          style={{
            textShadow: '0 3px 0 rgba(0,0,0,0.2)',
          }}
        >
          {letterInfo.letter}
        </span>

        {/* Cute Googly Eyes SVG */}
        <div className="absolute w-[68%] top-[18%] left-[16%] pointer-events-none z-20">
          <svg viewBox="0 0 100 48" className="w-full h-full drop-shadow-md">
            {/* Left Eye Socket */}
            <circle cx="28" cy="24" r="16" fill="#FFFFFF" />
            {/* Right Eye Socket */}
            <circle cx="72" cy="24" r="16" fill="#FFFFFF" />

            {/* Left Cheek Blush */}
            <circle cx="10" cy="38" r="7" fill="#FFAAAA" opacity="0.6" />
            {/* Right Cheek Blush */}
            <circle cx="90" cy="38" r="7" fill="#FFAAAA" opacity="0.6" />

            {isBlinking ? (
              // Closed eye lids
              <>
                <path d="M 14 24 Q 28 32 42 24" stroke="#333333" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 58 24 Q 72 32 86 24" stroke="#333333" strokeWidth="4" fill="none" strokeLinecap="round" />
              </>
            ) : status === 'celebrating' ? (
              // Happy star/sparkle eyes on celebration
              <>
                <circle cx="28" cy="22" r="7" fill="#1E293B" />
                <circle cx="25" cy="19" r="2.5" fill="#FFFFFF" />
                <circle cx="31" cy="24" r="1.5" fill="#FFFFFF" />

                <circle cx="72" cy="22" r="7" fill="#1E293B" />
                <circle cx="69" cy="19" r="2.5" fill="#FFFFFF" />
                <circle cx="75" cy="24" r="1.5" fill="#FFFFFF" />
              </>
            ) : (
              // Normal animated pupils
              <>
                <circle
                  cx={28 + pupilOffset.x}
                  cy={24 + pupilOffset.y}
                  r="7"
                  fill="#1E293B"
                  className="transition-all duration-150"
                />
                <circle
                  cx={25 + pupilOffset.x}
                  cy={21 + pupilOffset.y}
                  r="2.5"
                  fill="#FFFFFF"
                />

                <circle
                  cx={72 + pupilOffset.x}
                  cy={24 + pupilOffset.y}
                  r="7"
                  fill="#1E293B"
                  className="transition-all duration-150"
                />
                <circle
                  cx={69 + pupilOffset.x}
                  cy={21 + pupilOffset.y}
                  r="2.5"
                  fill="#FFFFFF"
                />
              </>
            )}

            {/* Cute Smile */}
            <path
              d={
                status === 'wrong'
                  ? 'M 40 42 Q 50 36 60 42' // slightly bewildered wobbly mouth
                  : 'M 38 38 Q 50 48 62 38' // happy big smile
              }
              stroke="#1E293B"
              strokeWidth="3.5"
              fill={status === 'celebrating' ? '#FF6B6B' : 'none'}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </Tag>

      {/* Optional Word Badge beneath */}
      {showWord && (
        <div className="mt-3 text-center">
          <div className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
            {currentWord} {currentEmoji}
          </div>
          <div className="text-sm text-white/90 font-medium">
            /{currentPhonics}/
          </div>
        </div>
      )}
    </div>
  );
}
