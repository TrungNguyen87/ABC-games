import React, { useState, useEffect } from 'react';
import { ALPHABET_DATA } from '../../data/alphabetData';
import { LetterInfo, Language } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { triggerKidCheer } from '../CheerCelebration';
import { Sparkles, RefreshCw } from 'lucide-react';

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

export default function PuddleSplashGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: PuddleSplashGameProps) {
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

    const wordName = language === 'nl' ? randomTarget.wordNl || randomTarget.word : randomTarget.word;

    roundTimerRef.current = setTimeout(() => {
      if (mode === 'target') {
        if (!hasIntroducedRef.current) {
          hasIntroducedRef.current = true;
          if (language === 'nl') {
            sounds.speak(`Spring in de plas van ${randomTarget.letter}!`, 'nl');
          } else {
            sounds.speak(`Hop into letter ${randomTarget.letter}!`, 'en');
          }
        } else {
          // Direct, non-repeating target cue
          sounds.speak(`${randomTarget.letter}! ${wordName}!`, language);
        }
      } else {
        if (!hasIntroducedRef.current) {
          hasIntroducedRef.current = true;
          sounds.speak(language === 'nl' ? 'Lekker spetteren en springen!' : 'Splash and hop!', language);
        }
      }
    }, 350);
  };

  useEffect(() => {
    resetPuddles();
    return () => {
      if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    };
  }, [mode, language]);

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

    const wordName = language === 'nl' ? letter.wordNl || letter.word : letter.word;

    if (mode === 'target') {
      if (letter.letter === targetLetter.letter) {
        sounds.playTada();
        fireConfettiBurst(splashX, splashY, 'autumn');
        triggerKidCheer({
          message: language === 'nl' ? 'PLONS! SUPER!' : 'SPLASH! YAY!',
          emoji: '💦',
          x: splashX,
          y: splashY,
        });
        onEarnStar();
        if (onUnlockSticker) onUnlockSticker(letter.letter);

        setFeedback(
          language === 'nl'
            ? `PLONS! Goed zo! Letter ${letter.letter}!`
            : `SPLASH! Great job! Letter ${letter.letter}!`
        );

        // Punchy varied celebration without repeating formulaic sentences
        sounds.speak(
          language === 'nl' ? `Super! ${wordName}!` : `Great! ${wordName}!`,
          language
        );

        if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
        roundTimerRef.current = setTimeout(() => {
          resetPuddles();
        }, 1800);
      } else {
        sounds.playBoing();
        setFeedback(
          language === 'nl'
            ? `Letter ${letter.letter}`
            : `Letter ${letter.letter}`
        );
        // Just say the tapped letter without repeating lecture
        sounds.speak(letter.letter, language);
      }
    } else {
      // Free play
      setFeedback(`Letter ${letter.letter} (${wordName})`);
      sounds.speak(`${letter.letter}! ${wordName}!`, language);
      if (Math.random() < 0.3) {
        onEarnStar();
        triggerKidCheer({ emoji: '💦', x: splashX, y: splashY });
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between py-2 px-3 sm:px-6 max-w-4xl mx-auto select-none bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-400">
      {/* Raindrops and Autumn Puddle Park scenery */}
      <div className="absolute top-6 left-10 text-5xl pointer-events-none opacity-50 animate-bounce">
        🌧️
      </div>
      <div
        className="absolute top-12 right-12 text-6xl pointer-events-none opacity-40 animate-bounce"
        style={{ animationDelay: '0.8s' }}
      >
        🌧️
      </div>
      <div className="absolute top-20 left-1/3 text-4xl pointer-events-none opacity-60">
        🍁
      </div>
      <div className="absolute top-28 right-1/4 text-4xl pointer-events-none opacity-60">
        🍂
      </div>

      {/* Top Banner & Mode Switcher */}
      <div className="z-20 flex flex-col items-center mt-1">
        <div className="bg-white/40 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/60 mb-2">
          <button
            onClick={() => {
              setMode('free');
              sounds.playPop();
            }}
            className={`px-4 py-1.5 text-xs sm:text-sm font-extrabold rounded-full transition-all cursor-pointer ${
              mode === 'free'
                ? 'bg-yellow-400 text-yellow-950 shadow-md'
                : 'text-slate-800 hover:bg-white/30'
            }`}
          >
            {language === 'nl' ? '👢 Vrij Plassen Springen' : '👢 Free Puddle Hopping'}
          </button>
          <button
            onClick={() => {
              setMode('target');
              sounds.playPop();
            }}
            className={`px-4 py-1.5 text-xs sm:text-sm font-extrabold rounded-full transition-all cursor-pointer ${
              mode === 'target'
                ? 'bg-yellow-400 text-yellow-950 shadow-md'
                : 'text-slate-800 hover:bg-white/30'
            }`}
          >
            {language === 'nl' ? '🎯 Spring-Opdracht' : '🎯 Puddle Quest'}
          </button>
        </div>

        {mode === 'target' ? (
          <div
            onClick={() =>
              sounds.speak(
                language === 'nl'
                  ? `Spring in de plas van letter ${targetLetter.letter}!`
                  : `Hop into the puddle of letter ${targetLetter.letter}!`,
                language
              )
            }
            className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-6 py-2 rounded-full border-2 border-white shadow-xl cursor-pointer animate-pulse-glow"
          >
            <span className="text-xl sm:text-2xl font-black text-slate-800 drop-shadow">
              {language === 'nl' ? 'Spring in plas:' : 'Hop in puddle:'}
            </span>
            <span
              className="text-3xl sm:text-4xl font-black px-4 py-1 rounded-2xl text-white drop-shadow-md"
              style={{ backgroundColor: targetLetter.color }}
            >
              {targetLetter.letter}
            </span>
            <span className="text-3xl">{targetLetter.emoji}</span>
          </div>
        ) : (
          <div className="text-slate-800 font-black text-base sm:text-xl drop-shadow text-center bg-white/40 backdrop-blur-sm px-6 py-1.5 rounded-full">
            {language === 'nl'
              ? 'Tik op de regenplassen om lekker te spetteren! 👢💦'
              : 'Tap the rain puddles to splash and jump! 👢💦'}
          </div>
        )}
      </div>

      {/* Main Playfield: The Cobbled Path & Water Puddles */}
      <div className="relative flex-1 w-full flex items-center justify-center my-2">
        <div className="grid grid-cols-2 gap-6 sm:gap-10 w-full max-w-2xl px-2">
          {puddleLetters.map((letter, idx) => {
            const isActive = activePuddleIdx === idx;
            const wordName = language === 'nl' ? letter.wordNl || letter.word : letter.word;

            return (
              <button
                key={letter.letter}
                onClick={(e) => handlePuddleTap(letter, idx, e)}
                className={`group relative h-36 sm:h-44 rounded-[50%_60%_70%_40%/60%_40%_60%_40%] bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-500 p-3 shadow-2xl flex flex-col items-center justify-center cursor-pointer border-4 border-white/70 transition-all active:scale-95 duration-150 select-none
                  ${isActive ? 'scale-105 ring-4 ring-yellow-300 brightness-110' : 'hover:scale-[1.02]'}
                `}
                style={{
                  boxShadow:
                    '0 12px 24px rgba(0,0,0,0.25), inset 0 4px 10px rgba(255,255,255,0.6)',
                }}
              >
                {/* Water Shimmer / Ripple Ring */}
                <div className="absolute inset-2 rounded-full border border-white/40 pointer-events-none animate-pulse" />

                {/* Happy Splash Character (Bunny in yellow raincoat) when active */}
                {isActive ? (
                  <div className="absolute -top-12 z-30 animate-kid-bounce text-6xl">
                    🐰👢
                  </div>
                ) : null}

                {/* Big Letter in Puddle */}
                <span
                  className="text-5xl sm:text-6xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] z-10"
                  style={{ textShadow: '0 3px 0 rgba(0,0,0,0.25)' }}
                >
                  {letter.letter}
                </span>

                {/* Autumn / Animal Companion in Puddle */}
                <div className="flex items-center gap-1 z-10 bg-white/75 backdrop-blur-sm px-3 py-1 rounded-full mt-1 border border-white">
                  <span className="text-xl sm:text-2xl">{letter.emoji}</span>
                  <span className="text-xs sm:text-sm font-black text-slate-800">
                    {wordName}
                  </span>
                </div>

                {/* Droplets floating */}
                <div className="absolute top-2 right-4 text-xs">💧</div>
                <div className="absolute bottom-3 left-4 text-xs">💦</div>
              </button>
            );
          })}
        </div>

        {/* Global Floating Splash Particles */}
        {splashes.map((s) => (
          <div
            key={s.id}
            style={{ left: `${s.x}px`, top: `${s.y}px` }}
            className="fixed pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-50 text-5xl sm:text-6xl animate-pop-in flex items-center gap-1"
          >
            <span>💦</span>
            <span className="text-yellow-300 text-3xl font-black drop-shadow-lg">
              PLONS!
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Feedback Banner */}
      <div className="h-12 flex items-center justify-center">
        {feedback ? (
          <div className="animate-pop-in bg-white px-6 py-2 rounded-full shadow-lg border-2 border-cyan-400 font-black text-slate-800 text-base sm:text-lg">
            {feedback}
          </div>
        ) : (
          <p className="text-slate-800 font-extrabold text-sm sm:text-base drop-shadow">
            {language === 'nl'
              ? 'Trek je laarzen aan en spring maar raak! 👢💦'
              : 'Put on your boots and splash into the puddles! 👢💦'}
          </p>
        )}
      </div>
    </div>
  );
}
