import React, { useState, useEffect } from 'react';
import { ALPHABET_DATA, getLetterWord, getLetterEmoji } from '../../data/alphabetData';
import { LetterInfo, Language } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { triggerKidCheer } from '../CheerCelebration';
import { Sparkles, Volume2 } from 'lucide-react';

interface WaterSplash {
  id: number;
  x: number;
  y: number;
}

interface PuddleSplashGameProps {
  onEarnStar: () => void;
  onUnlockSticker?: (letter: string) => void;
  language: Language;
}

type HopTheme = 'sinterklaas' | 'christmas' | 'autumn';

export default function PuddleSplashGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: PuddleSplashGameProps) {
  const [theme, setTheme] = useState<HopTheme>('sinterklaas');
  const [puddleLetters, setPuddleLetters] = useState<LetterInfo[]>([]);
  const [targetLetter, setTargetLetter] = useState<LetterInfo>(ALPHABET_DATA[0]);
  const [activePuddleIdx, setActivePuddleIdx] = useState<number | null>(null);
  const [splashes, setSplashes] = useState<WaterSplash[]>([]);
  const [mode, setMode] = useState<'free' | 'target'>('target');
  const [feedback, setFeedback] = useState<string>('');
  const hasIntroducedRef = React.useRef<boolean>(false);
  const roundTimerRef = React.useRef<any>(null);

  const resetPuddles = () => {
    if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    const shuffled = [...ALPHABET_DATA].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    setPuddleLetters(selected);

    const randomTarget = selected[Math.floor(Math.random() * selected.length)];
    setTargetLetter(randomTarget);
    setActivePuddleIdx(null);
    setFeedback('');

    const wordName = getLetterWord(randomTarget, language);

    roundTimerRef.current = setTimeout(() => {
      if (mode === 'target') {
        if (!hasIntroducedRef.current) {
          hasIntroducedRef.current = true;
          if (language === 'nl') {
            if (theme === 'sinterklaas') {
              sounds.speak(`Spring op het dak van ${randomTarget.letter} van ${wordName}!`, 'nl');
            } else if (theme === 'christmas') {
              sounds.speak(`Spring in de sneeuw van ${randomTarget.letter} van ${wordName}!`, 'nl');
            } else {
              sounds.speak(`Spring in de plas van ${randomTarget.letter} van ${wordName}!`, 'nl');
            }
          } else {
            sounds.speak(`Hop into letter ${randomTarget.letter} for ${wordName}!`, 'en');
          }
        } else {
          sounds.speak(`${randomTarget.letter}! ${wordName}!`, language);
        }
      } else {
        if (!hasIntroducedRef.current) {
          hasIntroducedRef.current = true;
          sounds.speak(
            language === 'nl'
              ? theme === 'sinterklaas'
                ? 'Lekker over de daken springen met Amerigo!'
                : theme === 'christmas'
                ? 'Lekker door de sneeuw springen!'
                : 'Lekker in de plassen springen!'
              : 'Hop and jump around!',
            language
          );
        }
      }
    }, 350);
  };

  useEffect(() => {
    resetPuddles();
    return () => {
      if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    };
  }, [theme, mode, language]);

  const handlePuddleTap = (
    letter: LetterInfo,
    idx: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    setActivePuddleIdx(idx);
    sounds.playSplash();

    const rect = e.currentTarget.getBoundingClientRect();
    const splashX = rect.left + rect.width / 2;
    const splashY = rect.top + rect.height / 2;

    const splashId = Date.now();
    setSplashes((prev) => [...prev, { id: splashId, x: splashX, y: splashY }]);
    setTimeout(() => {
      setSplashes((prev) => prev.filter((s) => s.id !== splashId));
    }, 800);

    const wordName = getLetterWord(letter, language);
    const emoji = getLetterEmoji(letter, language);

    if (mode === 'target') {
      if (letter.letter === targetLetter.letter) {
        sounds.playTada();
        fireConfettiBurst(
          splashX,
          splashY,
          theme === 'sinterklaas' ? 'stars' : theme === 'christmas' ? 'winter' : 'autumn'
        );
        triggerKidCheer({
          message: language === 'nl' ? 'GOED GESPRONGEN!' : 'GREAT HOP!',
          emoji,
          x: splashX,
          y: splashY,
        });
        onEarnStar();
        if (onUnlockSticker) onUnlockSticker(letter.letter);

        setFeedback(`Goed zo! ${letter.letter} van ${wordName}! 🎉`);
        sounds.speak(
          language === 'nl'
            ? `Super! ${letter.letter} van ${wordName}!`
            : `Great! ${letter.letter} for ${wordName}!`,
          language
        );

        if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
        roundTimerRef.current = setTimeout(() => {
          resetPuddles();
        }, 1800);
      } else {
        sounds.playBoing();
        setFeedback(`${letter.letter} (${wordName})`);
        sounds.speak(`${letter.letter}! ${wordName}!`, language);
      }
    } else {
      setFeedback(`${letter.letter} (${wordName})`);
      sounds.speak(`${letter.letter}! ${wordName}!`, language);
      if (Math.random() < 0.3) {
        onEarnStar();
        triggerKidCheer({ emoji, x: splashX, y: splashY });
      }
    }
  };

  const bgGradient =
    theme === 'sinterklaas'
      ? 'from-red-950 via-slate-900 to-amber-950 text-white'
      : theme === 'christmas'
      ? 'from-emerald-950 via-slate-900 to-sky-950 text-white'
      : 'from-sky-400 via-sky-300 to-emerald-400 text-slate-800';

  return (
    <div
      className={`relative w-full h-full overflow-hidden flex flex-col justify-between py-2 px-3 sm:px-6 max-w-4xl mx-auto select-none bg-gradient-to-b ${bgGradient} transition-colors duration-500`}
    >
      {/* Ambient scenery */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {theme === 'sinterklaas' ? (
          <>
            <div className="absolute top-6 left-10 text-5xl animate-bounce">🌙</div>
            <div className="absolute top-12 right-12 text-6xl animate-bounce">⭐</div>
            <div className="absolute top-20 left-1/3 text-4xl">🐴</div>
            <div className="absolute top-28 right-1/4 text-4xl">🎁</div>
          </>
        ) : theme === 'christmas' ? (
          <>
            <div className="absolute top-6 left-10 text-5xl animate-bounce">❄️</div>
            <div className="absolute top-12 right-12 text-6xl animate-bounce">⭐</div>
            <div className="absolute top-20 left-1/3 text-4xl">🎄</div>
            <div className="absolute top-28 right-1/4 text-4xl">⛄</div>
          </>
        ) : (
          <>
            <div className="absolute top-6 left-10 text-5xl animate-bounce">🌧️</div>
            <div className="absolute top-12 right-12 text-6xl animate-bounce">🌧️</div>
            <div className="absolute top-20 left-1/3 text-4xl">🍁</div>
            <div className="absolute top-28 right-1/4 text-4xl">🍂</div>
          </>
        )}
      </div>

      {/* Top Banner, Theme Tabs & Mode Switcher */}
      <div className="z-20 flex flex-col items-center mt-1">
        {/* Themes Tabs */}
        <div className="bg-black/35 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/30 mb-1.5">
          {[
            { id: 'sinterklaas' as const, labelNl: '👑 Dak-Springen', labelEn: '👑 Rooftop Hop' },
            { id: 'christmas' as const, labelNl: '🎄 Sneeuw-Springen', labelEn: '🎄 Snow Hop' },
            { id: 'autumn' as const, labelNl: '👢 Plassen-Springen', labelEn: '👢 Puddle Hop' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sounds.playPop();
                setTheme(t.id);
              }}
              className={`px-3 py-1 text-xs font-black rounded-full transition-all cursor-pointer ${
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
        <div className="bg-white/30 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/50 mb-2">
          <button
            onClick={() => {
              setMode('free');
              sounds.playPop();
            }}
            className={`px-4 py-1.5 text-xs sm:text-sm font-extrabold rounded-full transition-all cursor-pointer ${
              mode === 'free'
                ? 'bg-amber-400 text-amber-950 shadow-md'
                : 'text-white hover:text-amber-200'
            }`}
          >
            {language === 'nl' ? '🤸 Vrij Springen' : '🤸 Free Hop'}
          </button>
          <button
            onClick={() => {
              setMode('target');
              sounds.playPop();
            }}
            className={`px-4 py-1.5 text-xs sm:text-sm font-extrabold rounded-full transition-all cursor-pointer ${
              mode === 'target'
                ? 'bg-amber-400 text-amber-950 shadow-md'
                : 'text-white hover:text-amber-200'
            }`}
          >
            {language === 'nl' ? '🎯 Spring-Opdracht' : '🎯 Hop Quest'}
          </button>
        </div>

        {mode === 'target' ? (
          <div
            onClick={() => {
              const targetWord = getLetterWord(targetLetter, language);
              sounds.speak(
                language === 'nl'
                  ? `Spring naar letter ${targetLetter.letter} van ${targetWord}!`
                  : `Hop into letter ${targetLetter.letter} for ${targetWord}!`,
                language
              );
            }}
            className="flex items-center gap-3 bg-white/40 backdrop-blur-md px-6 py-2 rounded-full border-2 border-white shadow-xl cursor-pointer animate-pulse-glow"
          >
            <span className="text-base sm:text-lg font-black drop-shadow">
              {language === 'nl' ? 'Spring naar:' : 'Hop into:'}
            </span>
            <span
              className="text-3xl sm:text-4xl font-black px-4 py-1 rounded-2xl text-white drop-shadow-md"
              style={{ backgroundColor: targetLetter.color }}
            >
              {targetLetter.letter}
            </span>
            <span className="text-3xl sm:text-4xl filter drop-shadow">
              {getLetterEmoji(targetLetter, language)}
            </span>
            <Volume2 className="w-4 h-4 animate-pulse ml-1" />
          </div>
        ) : (
          <div className="font-extrabold text-sm sm:text-base drop-shadow text-center bg-white/35 backdrop-blur-sm px-6 py-1.5 rounded-full">
            {language === 'nl'
              ? 'Tik op de stapstenen om vrolijk rond te springen! ✨'
              : 'Tap the stepping pads to hop and splash! ✨'}
          </div>
        )}
      </div>

      {/* Main Playfield: The Stepping Pads */}
      <div className="relative flex-1 w-full flex items-center justify-center my-2">
        <div className="grid grid-cols-2 gap-5 sm:gap-8 w-full max-w-2xl px-2">
          {puddleLetters.map((letter, idx) => {
            const isActive = activePuddleIdx === idx;
            const wordName = getLetterWord(letter, language);
            const emoji = getLetterEmoji(letter, language);

            return (
              <button
                key={letter.letter}
                onClick={(e) => handlePuddleTap(letter, idx, e)}
                className={`group relative h-36 sm:h-44 rounded-[50%_60%_70%_40%/60%_40%_60%_40%] p-3 shadow-2xl flex flex-col items-center justify-center cursor-pointer border-4 border-white/70 transition-all active:scale-95 duration-150 select-none
                  ${isActive ? 'scale-105 ring-4 ring-yellow-300 brightness-110' : 'hover:scale-[1.02]'}
                  ${
                    theme === 'sinterklaas'
                      ? 'bg-gradient-to-br from-amber-600 via-red-600 to-rose-700'
                      : theme === 'christmas'
                      ? 'bg-gradient-to-br from-sky-200 via-teal-300 to-blue-400 text-slate-900'
                      : 'bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-500 text-white'
                  }
                `}
                style={{
                  boxShadow:
                    '0 12px 24px rgba(0,0,0,0.35), inset 0 4px 10px rgba(255,255,255,0.6)',
                }}
              >
                {/* Ripple Ring */}
                <div className="absolute inset-2 rounded-full border border-white/40 pointer-events-none animate-pulse" />

                <span
                  className="text-5xl sm:text-6xl font-black drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110"
                  style={{ color: theme === 'christmas' ? '#0f172a' : '#ffffff' }}
                >
                  {letter.letter}
                </span>

                <div className="flex items-center gap-1.5 mt-1 bg-black/40 px-3 py-1 rounded-full text-white">
                  <span className="text-xl sm:text-2xl filter drop-shadow">{emoji}</span>
                  <span className="text-xs sm:text-sm font-black">{wordName}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Animated Splash Drops */}
        {splashes.map((s) => (
          <div
            key={s.id}
            style={{ left: `${s.x}px`, top: `${s.y}px` }}
            className="fixed pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-50 animate-pop-in"
          >
            <div className="text-6xl animate-ping">
              {theme === 'sinterklaas' ? '⭐' : theme === 'christmas' ? '❄️' : '💦'}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Feedback Banner */}
      <div className="z-10 text-center py-2 font-black text-sm sm:text-base drop-shadow bg-black/25 backdrop-blur-xs rounded-full mx-auto px-6">
        {feedback || (language === 'nl' ? 'Spring maar lekker rond! 🌟' : 'Hop around and have fun! 🌟')}
      </div>
    </div>
  );
}
