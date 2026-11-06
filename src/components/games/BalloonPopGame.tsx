import React, { useState, useEffect, useRef } from 'react';
import { ALPHABET_DATA } from '../../data/alphabetData';
import { LetterInfo, Language } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { triggerKidCheer } from '../CheerCelebration';
import { Sparkles, Trophy } from 'lucide-react';

interface BalloonItem {
  id: number;
  letter: LetterInfo;
  x: number;
  y: number;
  speed: number;
  size: number;
  sway: number;
  swaySpeed: number;
  isRainbow?: boolean;
}

interface BalloonPopGameProps {
  onEarnStar: () => void;
  onUnlockSticker?: (letter: string) => void;
  language: Language;
}

export default function BalloonPopGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: BalloonPopGameProps) {
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [mode, setMode] = useState<'free' | 'target'>('free');
  const [targetLetter, setTargetLetter] = useState<LetterInfo>(ALPHABET_DATA[0]);
  const [popPopups, setPopPopups] = useState<
    { id: number; x: number; y: number; text: string; color: string }[]
  >([]);
  const nextIdRef = useRef(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Pick target letter
  useEffect(() => {
    if (mode === 'target') {
      const random = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
      setTargetLetter(random);
      if (language === 'nl') {
        sounds.speak(`Plop de letter ${random.letter}!`, 'nl');
      } else {
        sounds.speak(`Pop the letter ${random.letter}!`, 'en');
      }
    } else {
      if (language === 'nl') {
        sounds.speak('Plop een ballon om de letter te horen!', 'nl');
      } else {
        sounds.speak('Pop any balloon to hear its sound!', 'en');
      }
    }
  }, [mode, language]);

  // Balloon Spawner and Physics loop
  useEffect(() => {
    let animId: number;
    let lastSpawn = Date.now();

    const spawnBalloon = () => {
      const randomLetter = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
      const isRainbow = Math.random() < 0.12;

      const newBalloon: BalloonItem = {
        id: nextIdRef.current++,
        letter: randomLetter,
        x: 8 + Math.random() * 75,
        y: window.innerHeight + 80,
        speed: 1.2 + Math.random() * 1.4,
        size: 90 + Math.random() * 25,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        isRainbow,
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
          y: window.innerHeight * 0.4 + i * 90,
          speed: 1.2 + Math.random() * 1.4,
          size: 95,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.025,
        },
      ]);
    }

    const loop = () => {
      const now = Date.now();
      if (now - lastSpawn > 1100 && balloons.length < 8) {
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
          .filter((b) => b.y > -160)
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
    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const wordName =
      language === 'nl' ? balloon.letter.wordNl || balloon.letter.word : balloon.letter.word;

    // Spawn popping visual text
    const popupId = Date.now();
    setPopPopups((prev) => [
      ...prev,
      {
        id: popupId,
        x: clientX,
        y: clientY,
        text: `${balloon.letter.letter}! ${wordName}`,
        color: balloon.letter.color,
      },
    ]);
    setTimeout(() => {
      setPopPopups((prev) => prev.filter((p) => p.id !== popupId));
    }, 1000);

    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));

    if (balloon.isRainbow) {
      sounds.playKidsCheer();
      fireConfettiBurst(clientX, clientY);
      triggerKidCheer({
        message: language === 'nl' ? 'REGENBOOG MAGIE!' : 'RAINBOW MAGIC!',
        emoji: '🌈',
        x: clientX,
        y: clientY,
      });
      onEarnStar();
      if (language === 'nl') {
        sounds.speak('Regenboog magie!', 'nl');
      } else {
        sounds.speak('Rainbow magic!', 'en');
      }
      setBalloons((prev) => prev.slice(0, 1));
      return;
    }

    if (mode === 'target') {
      if (balloon.letter.letter === targetLetter.letter) {
        sounds.playTada();
        fireConfettiBurst(clientX, clientY);
        triggerKidCheer({
          message: language === 'nl' ? 'SUPER GEPLOPT!' : 'GREAT POP!',
          emoji: '🎈',
          x: clientX,
          y: clientY,
        });
        onEarnStar();
        if (onUnlockSticker) onUnlockSticker(balloon.letter.letter);

        if (language === 'nl') {
          sounds.speak(`Super! ${balloon.letter.letter}!`, 'nl');
        } else {
          sounds.speak(`Great! ${balloon.letter.letter}!`, 'en');
        }

        const newTarget = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
        setTargetLetter(newTarget);
        const newWord = language === 'nl' ? newTarget.wordNl || newTarget.word : newTarget.word;
        setTimeout(() => {
          // Just say the new word, don't repeat questions
          sounds.speak(newWord, language);
        }, 1100);
      } else {
        sounds.playBoing();
        // Just say the popped word, no repeating lecture
        sounds.speak(wordName, language);
      }
    } else {
      sounds.speak(`${balloon.letter.letter}! ${wordName}!`, language);
      if (Math.random() < 0.25) {
        onEarnStar();
        triggerKidCheer({ emoji: '🎈', x: clientX, y: clientY });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex flex-col justify-between select-none"
    >
      {/* Sky Clouds Decoration */}
      <div className="absolute top-10 left-6 text-white/40 text-6xl pointer-events-none animate-gentle-float">
        ☁️
      </div>
      <div
        className="absolute top-24 right-10 text-white/30 text-7xl pointer-events-none animate-gentle-float"
        style={{ animationDelay: '1.5s' }}
      >
        ☁️
      </div>

      {/* Top Banner / Mode Switcher */}
      <div className="z-20 flex flex-col items-center mt-1 px-4">
        <div className="bg-white/30 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/50 mb-2">
          <button
            onClick={() => {
              setMode('free');
              sounds.playPop();
            }}
            className={`px-4 py-1.5 text-xs sm:text-sm font-extrabold rounded-full transition-all cursor-pointer ${
              mode === 'free'
                ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                : 'text-white hover:text-yellow-200'
            }`}
          >
            {language === 'nl' ? '🎈 Vrij Plop Speelveld' : '🎈 Free Pop Playground'}
          </button>
          <button
            onClick={() => {
              setMode('target');
              sounds.playPop();
            }}
            className={`px-4 py-1.5 text-xs sm:text-sm font-extrabold rounded-full transition-all cursor-pointer ${
              mode === 'target'
                ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                : 'text-white hover:text-yellow-200'
            }`}
          >
            {language === 'nl' ? '🎯 Letter Avontuur' : '🎯 Letter Quest'}
          </button>
        </div>

        {mode === 'target' ? (
          <div
            onClick={() =>
              sounds.speak(
                language === 'nl'
                  ? `Plop de letter ${targetLetter.letter}!`
                  : `Pop the letter ${targetLetter.letter}!`,
                language
              )
            }
            className="flex items-center gap-3 bg-white/40 backdrop-blur-md px-6 py-2 rounded-full border-2 border-white shadow-lg cursor-pointer animate-pulse-glow"
          >
            <span className="text-xl sm:text-2xl font-black text-white drop-shadow">
              {language === 'nl' ? 'Plop de Letter:' : 'Pop the Letter:'}
            </span>
            <span
              className="text-4xl sm:text-5xl font-black px-4 py-1 rounded-2xl text-white drop-shadow-md"
              style={{ backgroundColor: targetLetter.color }}
            >
              {targetLetter.letter}
            </span>
            <span className="text-3xl">{targetLetter.emoji}</span>
          </div>
        ) : (
          <div className="text-white font-extrabold text-lg sm:text-xl drop-shadow text-center">
            {language === 'nl'
              ? 'Tik op de zwevende ballonnen om letters en woordjes te leren! 🎈✨'
              : 'Tap the floating balloons to pop and hear the letters! 🎈✨'}
          </div>
        )}
      </div>

      {/* Balloons Playfield */}
      <div className="absolute inset-0 pointer-events-auto">
        {balloons.map((b) => {
          const swayX = Math.sin(b.sway) * 22;

          return (
            <div
              key={b.id}
              onClick={(e) => handlePop(b, e)}
              style={{
                left: `${b.x}%`,
                top: `${b.y}px`,
                transform: `translateX(${swayX}px)`,
                width: `${b.size}px`,
                height: `${b.size * 1.25}px`,
              }}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 active:scale-90"
            >
              {/* Balloon Oval Body */}
              <div
                style={{
                  backgroundColor: b.isRainbow ? '#F43F5E' : b.letter.color,
                  backgroundImage: b.isRainbow
                    ? 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #FFE66D, #A78BFA)'
                    : undefined,
                  boxShadow: `0 8px 16px rgba(0,0,0,0.25), inset -6px -6px 0 ${b.letter.shadowColor}`,
                }}
                className="relative w-full h-[85%] rounded-[50%_50%_50%_50%/40%_40%_60%_60%] flex flex-col items-center justify-center text-white"
              >
                {/* Shiny Specular Highlight */}
                <div className="absolute top-2 left-3 w-5 h-8 bg-white/40 rounded-full rotate-25 pointer-events-none" />

                {b.isRainbow ? (
                  <Sparkles className="w-12 h-12 text-white animate-spin" />
                ) : (
                  <>
                    <span className="text-4xl sm:text-5xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                      {b.letter.letter}
                    </span>
                    <span className="text-2xl mt-1">{b.letter.emoji}</span>
                  </>
                )}

                {/* Knot */}
                <div
                  style={{ backgroundColor: b.letter.shadowColor }}
                  className="absolute -bottom-1.5 w-3 h-3 rounded-full"
                />
              </div>

              {/* String */}
              <div className="w-0.5 h-12 bg-white/60 mx-auto" />
            </div>
          );
        })}

        {/* Popped text floats */}
        {popPopups.map((p) => (
          <div
            key={p.id}
            style={{ left: `${p.x}px`, top: `${p.y}px` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pop-in z-40 bg-white px-4 py-2 rounded-2xl shadow-xl border-2 border-yellow-300 font-black text-xl sm:text-2xl"
          >
            <span style={{ color: p.color }}>{p.text}</span> ✨
          </div>
        ))}
      </div>

      {/* Bottom Hint */}
      <div className="z-10 text-center py-2 text-white/70 text-sm font-bold">
        {language === 'nl'
          ? 'Blijf ploppen voor glimmende sterren! ⭐'
          : 'Keep popping to earn shiny stars! ⭐'}
      </div>
    </div>
  );
}
