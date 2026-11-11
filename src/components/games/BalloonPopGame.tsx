import React, { useState, useEffect, useRef } from 'react';
import { ALPHABET_DATA, getLetterWord, getLetterEmoji } from '../../data/alphabetData';
import { LetterInfo, Language, AppTheme } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { triggerKidCheer } from '../CheerCelebration';
import { Sparkles, Volume2, Trophy } from 'lucide-react';

interface BalloonItem {
  id: number;
  letter: LetterInfo;
  x: number;
  y: number;
  speed: number;
  size: number;
  sway: number;
  swaySpeed: number;
  isSpecial?: boolean;
}

interface PopPopup {
  id: number;
  x: number;
  y: number;
  letter: string;
  word: string;
  emoji: string;
  color: string;
}

interface BalloonPopGameProps {
  onEarnStar: () => void;
  onUnlockSticker?: (letter: string) => void;
  language: Language;
  initialTheme?: AppTheme;
}

export default function BalloonPopGame({
  onEarnStar,
  onUnlockSticker,
  language,
  initialTheme = 'sinterklaas',
}: BalloonPopGameProps) {
  const [theme, setTheme] = useState<AppTheme>(initialTheme);
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [mode, setMode] = useState<'free' | 'target'>('free');
  const [targetLetter, setTargetLetter] = useState<LetterInfo>(ALPHABET_DATA[0]);
  const [popPopups, setPopPopups] = useState<PopPopup[]>([]);
  const nextIdRef = useRef(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetTimeoutRef = useRef<any>(null);

  // Theme metadata
  const themeConfig = {
    sinterklaas: {
      id: 'sinterklaas' as const,
      nameNl: '👑 Sinterklaas',
      nameEn: '👑 Sinterklaas',
      bgClass: 'from-red-950 via-slate-900 to-amber-950',
      skyElements: ['🌙', '⭐', '👑', '🎁', '🐴', '👞', '🍪'],
      specialLabelNl: 'Sinterklaas Verrassing!',
      specialLabelEn: 'Saint Nicholas Magic!',
      specialEmoji: '🎁',
    },
    christmas: {
      id: 'christmas' as const,
      nameNl: '🎄 Kerstmis',
      nameEn: '🎄 Christmas',
      bgClass: 'from-emerald-950 via-slate-900 to-red-950',
      skyElements: ['❄️', '⛄', '🎄', '🔔', '⭐', '🦌', '🕯️'],
      specialLabelNl: 'Kerstmis Wonder!',
      specialLabelEn: 'Christmas Wonder!',
      specialEmoji: '🎄',
    },
    halloween: {
      id: 'halloween' as const,
      nameNl: '🎃 Halloween',
      nameEn: '🎃 Halloween',
      bgClass: 'from-purple-950 via-slate-900 to-orange-950',
      skyElements: ['🎃', '🦇', '👻', '🕷️', '🌕', '🧙‍♀️'],
      specialLabelNl: 'Magisch Spookfeest!',
      specialLabelEn: 'Magic Spooky Party!',
      specialEmoji: '🎃',
    },
    autumn: {
      id: 'autumn' as const,
      nameNl: '🍂 Herfst',
      nameEn: '🍂 Autumn',
      bgClass: 'from-amber-950 via-stone-900 to-orange-950',
      skyElements: ['🍂', '🍁', '🌰', '🍄', '🐿️', '🌧️'],
      specialLabelNl: 'Gouden Herfst!',
      specialLabelEn: 'Golden Autumn!',
      specialEmoji: '🍁',
    },
    classic: {
      id: 'classic' as const,
      nameNl: '🌈 Regenboog',
      nameEn: '🌈 Rainbow',
      bgClass: 'from-sky-500 via-indigo-600 to-purple-700',
      skyElements: ['☁️', '☀️', '🌈', '🎈', '✨'],
      specialLabelNl: 'Regenboog Magie!',
      specialLabelEn: 'Rainbow Magic!',
      specialEmoji: '🌈',
    },
  };

  const currentThemeInfo = themeConfig[theme] || themeConfig.sinterklaas;

  // Set new target
  useEffect(() => {
    if (targetTimeoutRef.current) clearTimeout(targetTimeoutRef.current);

    if (mode === 'target') {
      const random = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
      setTargetLetter(random);
      const targetWord = getLetterWord(random, language);
      if (language === 'nl') {
        sounds.speak(`Plop de letter ${random.letter} van ${targetWord}!`, 'nl');
      } else {
        sounds.speak(`Pop the letter ${random.letter} for ${targetWord}!`, 'en');
      }
    } else {
      if (language === 'nl') {
        sounds.speak('Plop een ballon om de letter en het woordje te horen!', 'nl');
      } else {
        sounds.speak('Pop any balloon to hear the letter and word!', 'en');
      }
    }

    return () => {
      if (targetTimeoutRef.current) clearTimeout(targetTimeoutRef.current);
    };
  }, [mode, language]);

  // Balloon Spawner and Physics loop
  useEffect(() => {
    let animId: number;
    let lastSpawn = Date.now();

    const spawnBalloon = () => {
      const randomLetter = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
      const isSpecial = Math.random() < 0.14;

      const newBalloon: BalloonItem = {
        id: nextIdRef.current++,
        letter: randomLetter,
        x: 8 + Math.random() * 75,
        y: window.innerHeight + 80,
        speed: 1.1 + Math.random() * 1.3,
        size: 96 + Math.random() * 24,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        isSpecial,
      };

      setBalloons((prev) => [...prev.slice(-12), newBalloon]);
    };

    // Initial fill
    for (let i = 0; i < 5; i++) {
      const randomLetter = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
      setBalloons((prev) => [
        ...prev,
        {
          id: nextIdRef.current++,
          letter: randomLetter,
          x: 10 + i * 16 + Math.random() * 6,
          y: window.innerHeight * 0.45 + i * 85,
          speed: 1.1 + Math.random() * 1.3,
          size: 100,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.025,
          isSpecial: i === 2,
        },
      ]);
    }

    const loop = () => {
      const now = Date.now();
      if (now - lastSpawn > 1150 && balloons.length < 9) {
        spawnBalloon();
        lastSpawn = now;
      }

      setBalloons((prev) =>
        prev
          .map((b) => ({
            ...b,
            y: b.y - b.speed,
            sway: b.sway + b.swaySpeed,
          }))
          .filter((b) => b.y > -180)
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePop = (balloon: BalloonItem, e: React.MouseEvent | React.TouchEvent) => {
    sounds.playPop();

    let clientX = window.innerWidth * (balloon.x / 100);
    let clientY = balloon.y;
    if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const letterChar = balloon.letter.letter;
    const wordName = getLetterWord(balloon.letter, language);
    const emoji = getLetterEmoji(balloon.letter, language);

    // Spawn rich card popup showing letter + image + word
    const popupId = Date.now() + Math.random();
    setPopPopups((prev) => [
      ...prev,
      {
        id: popupId,
        x: clientX,
        y: clientY,
        letter: letterChar,
        word: wordName,
        emoji,
        color: balloon.letter.color,
      },
    ]);
    setTimeout(() => {
      setPopPopups((prev) => prev.filter((p) => p.id !== popupId));
    }, 1400);

    // Remove popped balloon
    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));

    // Special festive balloon burst
    if (balloon.isSpecial) {
      sounds.playKidsCheer();
      sounds.playSparkle();
      fireConfettiBurst(
        clientX,
        clientY,
        theme === 'sinterklaas'
          ? 'stars'
          : theme === 'christmas'
          ? 'winter'
          : theme === 'halloween'
          ? 'halloween'
          : theme === 'autumn'
          ? 'autumn'
          : 'rainbow'
      );
      triggerKidCheer({
        message:
          language === 'nl'
            ? currentThemeInfo.specialLabelNl
            : currentThemeInfo.specialLabelEn,
        emoji: currentThemeInfo.specialEmoji,
        x: clientX,
        y: clientY,
      });
      onEarnStar();
      sounds.speak(
        language === 'nl'
          ? currentThemeInfo.specialLabelNl
          : currentThemeInfo.specialLabelEn,
        language
      );
      return;
    }

    if (mode === 'target') {
      if (letterChar === targetLetter.letter) {
        // Correct target popped!
        sounds.playTada();
        fireConfettiBurst(clientX, clientY, 'rainbow');
        triggerKidCheer({
          message: language === 'nl' ? 'SUPER GEPLOPT!' : 'GREAT POP!',
          emoji,
          x: clientX,
          y: clientY,
        });
        onEarnStar();
        if (onUnlockSticker) onUnlockSticker(letterChar);

        // Always connect letter and Dutch word!
        if (language === 'nl') {
          sounds.speak(`Super! ${letterChar} van ${wordName}!`, 'nl');
        } else {
          sounds.speak(`Great! ${letterChar} for ${wordName}!`, 'en');
        }

        // Pick next target letter and announce it clearly
        const newTarget = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
        setTargetLetter(newTarget);
        const nextWord = getLetterWord(newTarget, language);

        if (targetTimeoutRef.current) clearTimeout(targetTimeoutRef.current);
        targetTimeoutRef.current = setTimeout(() => {
          if (language === 'nl') {
            sounds.speak(`Zoek nu de ${newTarget.letter} van ${nextWord}!`, 'nl');
          } else {
            sounds.speak(`Now find ${newTarget.letter} for ${nextWord}!`, 'en');
          }
        }, 1500);
      } else {
        // Wrong balloon popped in quest mode
        sounds.playBoing();
        // Speak the popped balloon's own letter and word so the child learns it!
        sounds.speak(`${letterChar}! ${wordName}!`, language);
      }
    } else {
      // Free play mode: letter and matching word
      sounds.speak(`${letterChar}! ${wordName}!`, language);
      if (Math.random() < 0.28) {
        onEarnStar();
        triggerKidCheer({ emoji, x: clientX, y: clientY });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden flex flex-col justify-between select-none bg-gradient-to-b ${currentThemeInfo.bgClass} transition-colors duration-700`}
    >
      {/* Themed Sky Atmosphere Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
        {currentThemeInfo.skyElements.map((icon, idx) => (
          <div
            key={idx}
            className="absolute text-5xl sm:text-7xl animate-gentle-float"
            style={{
              top: `${12 + (idx * 14) % 70}%`,
              left: `${8 + (idx * 23) % 85}%`,
              animationDelay: `${idx * 0.8}s`,
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Top Banner / Theme Switcher & Mode Switcher */}
      <div className="z-20 flex flex-col items-center mt-1 px-3">
        {/* Theme Pill Tabs */}
        <div className="bg-black/35 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/30 mb-1.5 max-w-full overflow-x-auto scrollbar-none">
          {(
            [
              { id: 'sinterklaas' as const, labelNl: '👑 Sinterklaas', labelEn: '👑 Sint' },
              { id: 'christmas' as const, labelNl: '🎄 Kerstmis', labelEn: '🎄 Xmas' },
              { id: 'halloween' as const, labelNl: '🎃 Halloween', labelEn: '🎃 Spooky' },
              { id: 'autumn' as const, labelNl: '🍂 Herfst', labelEn: '🍂 Autumn' },
              { id: 'classic' as const, labelNl: '🌈 Regenboog', labelEn: '🌈 Rainbow' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sounds.playPop();
                setTheme(t.id);
                sounds.speak(language === 'nl' ? t.labelNl : t.labelEn, language);
              }}
              className={`px-2.5 sm:px-3 py-1 text-xs font-black rounded-full transition-all cursor-pointer whitespace-nowrap ${
                theme === t.id
                  ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {language === 'nl' ? t.labelNl : t.labelEn}
            </button>
          ))}
        </div>

        {/* Mode Switcher */}
        <div className="bg-white/20 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/40 mb-2">
          <button
            onClick={() => {
              setMode('free');
              sounds.playPop();
            }}
            className={`px-3.5 py-1 text-xs sm:text-sm font-extrabold rounded-full transition-all cursor-pointer ${
              mode === 'free'
                ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                : 'text-white hover:text-yellow-200'
            }`}
          >
            {language === 'nl' ? '🎈 Vrij Plop Veld' : '🎈 Free Pop'}
          </button>
          <button
            onClick={() => {
              setMode('target');
              sounds.playPop();
            }}
            className={`px-3.5 py-1 text-xs sm:text-sm font-extrabold rounded-full transition-all cursor-pointer ${
              mode === 'target'
                ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                : 'text-white hover:text-yellow-200'
            }`}
          >
            {language === 'nl' ? '🎯 Zoek de Letter' : '🎯 Letter Quest'}
          </button>
        </div>

        {/* Target Letter Display Banner */}
        {mode === 'target' ? (
          <div
            onClick={() => {
              const targetWord = getLetterWord(targetLetter, language);
              sounds.speak(
                language === 'nl'
                  ? `Plop de letter ${targetLetter.letter} van ${targetWord}!`
                  : `Pop the letter ${targetLetter.letter} for ${targetWord}!`,
                language
              );
            }}
            className="flex items-center gap-2 sm:gap-3 bg-white/35 backdrop-blur-md px-5 py-2 rounded-3xl border-2 border-white shadow-xl cursor-pointer active:scale-95 transition-transform"
          >
            <div className="flex flex-col items-start">
              <span className="text-xs sm:text-sm font-black text-white/90 drop-shadow">
                {language === 'nl' ? 'Plop de Letter:' : 'Pop the Letter:'}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-amber-200">
                {language === 'nl' ? `van ${getLetterWord(targetLetter, language)}` : `for ${getLetterWord(targetLetter, language)}`}
              </span>
            </div>
            <span
              className="text-3xl sm:text-4xl font-black px-3.5 py-1 rounded-2xl text-white drop-shadow-md shadow-inner"
              style={{ backgroundColor: targetLetter.color }}
            >
              {targetLetter.letter}
            </span>
            <span className="text-3xl sm:text-4xl animate-bounce">
              {getLetterEmoji(targetLetter, language)}
            </span>
            <Volume2 className="w-4 h-4 text-white/80 animate-pulse ml-1" />
          </div>
        ) : (
          <div className="text-white font-extrabold text-sm sm:text-base drop-shadow text-center max-w-md px-2">
            {language === 'nl'
              ? '🎈 Tik op een ballon om de letter én het plaatje te ontdekken! ✨'
              : '🎈 Tap any balloon to discover the letter and picture! ✨'}
          </div>
        )}
      </div>

      {/* Balloons Playfield */}
      <div className="absolute inset-0 pointer-events-auto">
        {balloons.map((b) => {
          const swayX = Math.sin(b.sway) * 20;
          const letterEmoji = getLetterEmoji(b.letter, language);

          return (
            <div
              key={b.id}
              onClick={(e) => handlePop(b, e)}
              onTouchStart={(e) => {
                e.preventDefault();
                handlePop(b, e);
              }}
              style={{
                left: `${b.x}%`,
                top: `${b.y}px`,
                transform: `translateX(${swayX}px)`,
                width: `${b.size}px`,
                height: `${b.size * 1.28}px`,
              }}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 active:scale-90"
            >
              {/* Balloon Oval Body */}
              <div
                style={{
                  backgroundColor: b.isSpecial ? '#F59E0B' : b.letter.color,
                  backgroundImage: b.isSpecial
                    ? theme === 'sinterklaas'
                      ? 'linear-gradient(135deg, #DC2626, #F59E0B, #B91C1C)'
                      : theme === 'christmas'
                      ? 'linear-gradient(135deg, #16A34A, #DC2626, #F59E0B)'
                      : theme === 'halloween'
                      ? 'linear-gradient(135deg, #EA580C, #9333EA, #000000)'
                      : 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #FFE66D, #A78BFA)'
                    : undefined,
                  boxShadow: `0 8px 18px rgba(0,0,0,0.35), inset -6px -6px 0 ${b.letter.shadowColor}`,
                }}
                className="relative w-full h-[85%] rounded-[50%_50%_50%_50%/40%_40%_60%_60%] flex flex-col items-center justify-center text-white"
              >
                {/* Shiny Specular Highlight */}
                <div className="absolute top-2.5 left-3 w-5 h-8 bg-white/45 rounded-full rotate-25 pointer-events-none" />

                {b.isSpecial ? (
                  <div className="flex flex-col items-center">
                    <span className="text-4xl animate-bounce">{currentThemeInfo.specialEmoji}</span>
                    <Sparkles className="w-5 h-5 text-yellow-200 animate-spin mt-1" />
                  </div>
                ) : (
                  <>
                    <span className="text-3xl sm:text-4xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] leading-tight">
                      {b.letter.letter}
                    </span>
                    <span className="text-2xl sm:text-3xl mt-0.5 filter drop-shadow">
                      {letterEmoji}
                    </span>
                  </>
                )}

                {/* Knot */}
                <div
                  style={{ backgroundColor: b.letter.shadowColor }}
                  className="absolute -bottom-1.5 w-3.5 h-3.5 rounded-full"
                />
              </div>

              {/* String */}
              <div className="w-0.5 h-12 bg-white/70 mx-auto" />
            </div>
          );
        })}

        {/* Popped rich card popups: Shows Picture (Emoji) + Letter + Word */}
        {popPopups.map((p) => (
          <div
            key={p.id}
            style={{ left: `${p.x}px`, top: `${p.y}px` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pop-in z-50 bg-white/95 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-3 rounded-3xl shadow-2xl border-4 border-yellow-300 flex items-center gap-3 select-none"
          >
            <span className="text-4xl sm:text-5xl animate-bounce filter drop-shadow">
              {p.emoji}
            </span>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5">
                <span className="text-3xl sm:text-4xl font-black" style={{ color: p.color }}>
                  {p.letter}
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {language === 'nl' ? 'van' : 'for'}
                </span>
              </div>
              <span className="text-lg sm:text-xl font-black text-gray-900 leading-tight">
                {p.word}
              </span>
            </div>
            <span className="text-2xl animate-spin">✨</span>
          </div>
        ))}
      </div>

      {/* Bottom Hint */}
      <div className="z-10 text-center py-2 text-white/80 text-xs sm:text-sm font-bold bg-black/20 backdrop-blur-xs">
        {language === 'nl'
          ? '🌟 Plop mee voor sterren en feestelijke stickers! ⭐'
          : '🌟 Pop balloons to earn stars and festive stickers! ⭐'}
      </div>
    </div>
  );
}
