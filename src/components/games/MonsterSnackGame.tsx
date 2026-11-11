import React, { useState, useEffect, useCallback } from 'react';
import { ALPHABET_DATA, getLetterWord, getLetterEmoji } from '../../data/alphabetData';
import { LetterInfo, Language } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { triggerKidCheer } from '../CheerCelebration';
import { Sparkles, Volume2 } from 'lucide-react';

interface MonsterSnackGameProps {
  onEarnStar: () => void;
  onUnlockSticker?: (letter: string) => void;
  language: Language;
}

type SnackTheme = 'sinterklaas' | 'christmas' | 'classic';

export default function MonsterSnackGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: MonsterSnackGameProps) {
  const [theme, setTheme] = useState<SnackTheme>('sinterklaas');
  const [targetLetter, setTargetLetter] = useState<LetterInfo>(ALPHABET_DATA[0]);
  const [cookieOptions, setCookieOptions] = useState<LetterInfo[]>([]);
  const [monsterState, setMonsterState] = useState<'hungry' | 'chewing' | 'happy' | 'disgusted'>('hungry');
  const [isLocked, setIsLocked] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string>('');
  const hasIntroducedRef = React.useRef(false);

  const nextRound = useCallback(() => {
    setIsLocked(false);
    setMonsterState('hungry');

    const target = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
    setTargetLetter(target);

    const wrong = ALPHABET_DATA.filter((l) => l.letter !== target.letter)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    const cookies = [...wrong, target].sort(() => 0.5 - Math.random());
    setCookieOptions(cookies);

    const targetWord = getLetterWord(target, language);
    setSpeechBubble(targetWord);

    if (!hasIntroducedRef.current) {
      hasIntroducedRef.current = true;
      if (language === 'nl') {
        if (theme === 'sinterklaas') {
          sounds.speak(`Voer het paardje met letter ${target.letter} van ${targetWord}!`, 'nl');
        } else if (theme === 'christmas') {
          sounds.speak(`Voer de sneeuwpop met letter ${target.letter} van ${targetWord}!`, 'nl');
        } else {
          sounds.speak(`Voer het monster met letter ${target.letter} van ${targetWord}!`, 'nl');
        }
      } else {
        sounds.speak(`Feed letter ${target.letter} for ${targetWord}!`, 'en');
      }
    } else {
      sounds.speak(`${target.letter}! ${targetWord}!`, language);
    }
  }, [theme, language]);

  useEffect(() => {
    nextRound();
  }, [nextRound]);

  const handleFeedCookie = (cookie: LetterInfo) => {
    if (isLocked) return;

    const cookieWord = getLetterWord(cookie, language);
    const cookieEmoji = getLetterEmoji(cookie, language);

    if (cookie.letter === targetLetter.letter) {
      setIsLocked(true);
      setMonsterState('chewing');
      sounds.playMunch();
      setSpeechBubble(cookieWord);

      setTimeout(() => {
        setMonsterState('happy');
        sounds.playTada();
        fireConfettiBurst(
          theme === 'sinterklaas' ? 'stars' : theme === 'christmas' ? 'winter' : 'rainbow'
        );
        triggerKidCheer({
          message:
            language === 'nl'
              ? theme === 'sinterklaas'
                ? 'LEKKERE PEPERNOOT!'
                : 'LEKKER GEGETEN!'
              : 'YUMMY SNACK!',
          emoji: theme === 'sinterklaas' ? '🍪' : theme === 'christmas' ? '❄️' : '🍪',
        });
        onEarnStar();
        if (onUnlockSticker) onUnlockSticker(cookie.letter);

        setSpeechBubble(cookieWord);
        sounds.speak(
          language === 'nl'
            ? `Super! ${cookie.letter} van ${cookieWord}!`
            : `Great! ${cookie.letter} for ${cookieWord}!`,
          language
        );
      }, 700);

      setTimeout(() => {
        nextRound();
      }, 2200);
    } else {
      setMonsterState('disgusted');
      sounds.playBoing();
      sounds.speak(`${cookie.letter}! ${cookieWord}!`, language);

      setTimeout(() => {
        setMonsterState('hungry');
      }, 1000);
    }
  };

  const bgStyle =
    theme === 'sinterklaas'
      ? 'from-red-950 via-slate-900 to-amber-950'
      : theme === 'christmas'
      ? 'from-emerald-950 via-slate-900 to-blue-950'
      : 'from-amber-400 via-orange-400 to-emerald-500';

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-between py-2 px-3 sm:px-6 max-w-4xl mx-auto select-none bg-gradient-to-b ${bgStyle} rounded-3xl transition-colors duration-500`}
    >
      {/* Top Banner & Theme Selector */}
      <div className="z-20 flex flex-col items-center mt-1">
        {/* Theme Pills */}
        <div className="bg-black/35 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/30 mb-2">
          {[
            { id: 'sinterklaas' as const, labelNl: '👑 Paardje Amerigo', labelEn: '👑 Amerigo Horse' },
            { id: 'christmas' as const, labelNl: '⛄ Sneeuwpop', labelEn: '⛄ Snowman' },
            { id: 'classic' as const, labelNl: '👾 Smulmonster', labelEn: '👾 Snack Monster' },
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

        {/* Target Request Banner */}
        <div
          onClick={() => {
            const targetWord = getLetterWord(targetLetter, language);
            sounds.speak(
              language === 'nl'
                ? `Voer letter ${targetLetter.letter} van ${targetWord}!`
                : `Feed letter ${targetLetter.letter} for ${targetWord}!`,
              language
            );
          }}
          className="flex items-center gap-2 sm:gap-3 bg-white/40 backdrop-blur-md px-5 py-2 rounded-full border-2 border-white shadow-xl cursor-pointer active:scale-95 transition-transform"
        >
          <span className="text-white text-base sm:text-lg font-black drop-shadow">
            {language === 'nl' ? 'Gevraagd:' : 'Wants:'}
          </span>
          <span
            className="text-3xl sm:text-4xl font-black px-4 py-0.5 rounded-2xl text-white drop-shadow-md"
            style={{ backgroundColor: targetLetter.color }}
          >
            {targetLetter.letter}
          </span>
          <span className="text-3xl filter drop-shadow">
            {getLetterEmoji(targetLetter, language)}
          </span>
          <span className="text-base sm:text-lg font-black text-amber-200">
            {getLetterWord(targetLetter, language)}
          </span>
          <Volume2 className="w-4 h-4 text-white animate-pulse ml-1" />
        </div>
      </div>

      {/* Center Animated Character */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        {/* Character Card */}
        <div
          className={`relative w-48 h-48 sm:w-60 sm:h-60 rounded-[3rem] border-6 flex flex-col items-center justify-center transition-all duration-300 ${
            theme === 'sinterklaas'
              ? 'bg-gradient-to-b from-amber-100 to-amber-200 border-amber-600 shadow-[0_12px_0_#b45309]'
              : theme === 'christmas'
              ? 'bg-gradient-to-b from-sky-100 to-white border-blue-400 shadow-[0_12px_0_#0284c7]'
              : 'bg-emerald-500 border-emerald-700 shadow-[0_12px_0_#047857]'
          }`}
        >
          {theme === 'sinterklaas' ? (
            /* Amerigo Horse Character */
            <div className="flex flex-col items-center">
              <span className="text-7xl sm:text-8xl animate-kid-bounce">🐴</span>
              <span className="text-xs sm:text-sm font-black text-amber-950 mt-1 bg-amber-300/80 px-3 py-0.5 rounded-full">
                {language === 'nl' ? 'Paard Amerigo' : 'Amerigo the Horse'}
              </span>
            </div>
          ) : theme === 'christmas' ? (
            /* Snowman Character */
            <div className="flex flex-col items-center">
              <span className="text-7xl sm:text-8xl animate-kid-bounce">⛄</span>
              <span className="text-xs sm:text-sm font-black text-blue-950 mt-1 bg-sky-200 px-3 py-0.5 rounded-full">
                {language === 'nl' ? 'Vrolijke Sneeuwpop' : 'Happy Snowman'}
              </span>
            </div>
          ) : (
            /* Cookie Monster */
            <>
              {/* Googly Monster Eyes */}
              <div className="flex items-center gap-4 mt-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center border-4 border-emerald-800 shadow-inner relative overflow-hidden">
                  <div
                    className={`w-6 h-6 bg-slate-900 rounded-full transition-transform ${
                      monsterState === 'chewing' ? 'scale-75' : ''
                    } ${monsterState === 'disgusted' ? 'translate-x-2' : ''}`}
                  >
                    <div className="w-2 h-2 bg-white rounded-full ml-1 mt-1" />
                  </div>
                </div>

                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center border-4 border-emerald-800 shadow-inner relative overflow-hidden">
                  <div
                    className={`w-6 h-6 bg-slate-900 rounded-full transition-transform ${
                      monsterState === 'chewing' ? 'scale-75' : ''
                    } ${monsterState === 'disgusted' ? '-translate-x-2' : ''}`}
                  >
                    <div className="w-2 h-2 bg-white rounded-full ml-1 mt-1" />
                  </div>
                </div>
              </div>

              {/* Big Monster Mouth */}
              <div
                className={`relative w-36 sm:w-44 bg-rose-950 rounded-full flex items-center justify-center overflow-hidden border-4 border-emerald-800 transition-all duration-200 ${
                  monsterState === 'chewing'
                    ? 'h-8'
                    : monsterState === 'happy'
                    ? 'h-24'
                    : monsterState === 'disgusted'
                    ? 'h-10 rotate-12'
                    : 'h-20'
                }`}
              >
                <div className="absolute top-0 flex gap-2">
                  <div className="w-4 h-4 bg-white rounded-b-md" />
                  <div className="w-4 h-5 bg-white rounded-b-md" />
                  <div className="w-4 h-4 bg-white rounded-b-md" />
                </div>
                <div className="absolute bottom-0 w-24 h-10 bg-rose-500 rounded-t-full" />
                {monsterState === 'hungry' && (
                  <span className="z-10 text-3xl font-black text-yellow-300 drop-shadow">
                    {targetLetter.letter}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Chewing / Reaction Bubble */}
          {monsterState === 'chewing' && (
            <div className="absolute -top-6 bg-yellow-300 text-yellow-950 font-black px-4 py-1 rounded-full shadow-lg animate-bounce text-sm">
              {language === 'nl' ? 'Mjum mjum mjum! 🍪' : 'Nom nom nom! 🍪'}
            </div>
          )}
          {monsterState === 'happy' && (
            <div className="absolute -top-6 bg-emerald-400 text-emerald-950 font-black px-4 py-1 rounded-full shadow-lg animate-bounce text-sm">
              {language === 'nl' ? 'Heerlijk gegeten! 🌟' : 'Super delicious! 🌟'}
            </div>
          )}
        </div>
      </div>

      {/* Treat / Cookie Plate */}
      <div className="w-full flex flex-col items-center">
        <div className="text-white font-extrabold text-sm sm:text-base drop-shadow mb-2 text-center">
          {theme === 'sinterklaas'
            ? language === 'nl'
              ? 'Kies de juiste pepernoot om het paard te voeren! 🍪'
              : 'Choose the right spiced cookie for the horse! 🍪'
            : theme === 'christmas'
            ? language === 'nl'
              ? 'Kies het kerstkoekje voor de sneeuwpop! ⛄'
              : 'Choose the holiday cookie for the snowman! ⛄'
            : language === 'nl'
            ? 'Tik op het letterkoekje om het monster te voeren! 🍪'
            : 'Tap the letter cookie to feed the monster! 🍪'}
        </div>

        <div className="bg-white/35 backdrop-blur-md p-3 sm:p-5 rounded-[2.5rem] border-4 border-white/60 shadow-2xl flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
          {cookieOptions.map((cookie) => {
            const word = getLetterWord(cookie, language);
            const emoji = getLetterEmoji(cookie, language);

            return (
              <button
                key={cookie.letter}
                onClick={() => handleFeedCookie(cookie)}
                disabled={isLocked}
                className="group relative w-22 h-26 sm:w-28 sm:h-32 rounded-3xl flex flex-col items-center justify-center font-black text-white cursor-pointer transition-all active:scale-90 active:translate-y-2 hover:scale-105 shadow-xl border-3 border-white/40"
                style={{
                  backgroundColor: cookie.color,
                  boxShadow: `0 8px 0 ${cookie.shadowColor}, 0 14px 22px rgba(0,0,0,0.3)`,
                }}
              >
                <span className="text-4xl sm:text-5xl font-black drop-shadow-md select-none leading-none">
                  {cookie.letter}
                </span>
                <span className="text-2xl sm:text-3xl filter drop-shadow my-0.5">{emoji}</span>
                <span className="text-[10px] sm:text-xs font-black bg-black/35 px-2 py-0.5 rounded-full text-white">
                  {word}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
