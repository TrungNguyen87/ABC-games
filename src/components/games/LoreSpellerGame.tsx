import React, { useState, useEffect, useMemo } from 'react';
import { Language } from '../../types/game';
import { SPELLING_WORDS, SpellingWord } from '../../data/spellingWords';
import AlphabetLoreAvatar from '../AlphabetLoreAvatar';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { Volume2, Sparkles, RefreshCw, Lightbulb, ChevronRight, Wand2, Moon, Sun } from 'lucide-react';

interface LoreSpellerGameProps {
  onEarnStar: () => void;
  onUnlockSticker: (letter: string) => void;
  language: Language;
}

interface LetterSlot {
  index: number;
  expectedLetter: string;
  placedLetter: string | null;
  placedPoolIndex: number | null;
}

interface PoolLetter {
  id: string;
  letter: string;
  used: boolean;
}

export default function LoreSpellerGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: LoreSpellerGameProps) {
  const [category, setCategory] = useState<'all' | 'halloween' | 'autumn' | 'animals'>('halloween');
  const [isSpookyHalloween, setIsSpookyHalloween] = useState<boolean>(true);
  const [showHelperSilhouette, setShowHelperSilhouette] = useState<boolean>(true);
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [isWordComplete, setIsWordComplete] = useState<boolean>(false);
  const [slots, setSlots] = useState<LetterSlot[]>([]);
  const [letterPool, setLetterPool] = useState<PoolLetter[]>([]);
  const [celebrationMessage, setCelebrationMessage] = useState<string>('');

  // Filter words by selected category
  const activeWords = useMemo(() => {
    if (category === 'all') return SPELLING_WORDS;
    return SPELLING_WORDS.filter((w) => w.category === category);
  }, [category]);

  const currentWord: SpellingWord = activeWords[wordIndex % activeWords.length] || SPELLING_WORDS[0];
  const targetWord = (language === 'nl' ? currentWord.wordNl : currentWord.wordEn).toUpperCase();

  // Setup current word slots and letter choices
  useEffect(() => {
    setIsWordComplete(false);
    setCelebrationMessage('');

    const letters = targetWord.split('');
    const initialSlots: LetterSlot[] = letters.map((l, idx) => ({
      index: idx,
      expectedLetter: l,
      placedLetter: null,
      placedPoolIndex: null,
    }));
    setSlots(initialSlots);

    // Build letter pool: letters in word + 2 random distractors
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const distractors: string[] = [];
    while (distractors.length < 2) {
      const rand = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!letters.includes(rand) && !distractors.includes(rand)) {
        distractors.push(rand);
      }
    }

    const allLetters = [...letters, ...distractors];
    // Shuffle pool
    const shuffled = allLetters
      .map((val) => ({ val, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((item, idx) => ({
        id: `${item.val}-${idx}-${Date.now()}`,
        letter: item.val,
        used: false,
      }));

    setLetterPool(shuffled);

    // Speak introductory cue with soft young lady voice
    const hint = language === 'nl' ? currentWord.hintNl : currentWord.hintEn;
    const wordSpoken = language === 'nl' ? currentWord.wordNl : currentWord.wordEn;
    if (isSpookyHalloween) {
      sounds.playGhost();
    }
    sounds.speak(
      language === 'nl'
        ? `Kun jij ${wordSpoken} spellen? ${hint}`
        : `Can you spell ${wordSpoken}? ${hint}`,
      language
    );
  }, [wordIndex, targetWord, language, isSpookyHalloween]);

  const handleSpeakWord = () => {
    const wordSpoken = language === 'nl' ? currentWord.wordNl : currentWord.wordEn;
    const hint = language === 'nl' ? currentWord.hintNl : currentWord.hintEn;
    sounds.playBoing();
    sounds.speak(
      language === 'nl' ? `${wordSpoken}! ${hint}` : `${wordSpoken}! ${hint}`,
      language
    );
  };

  // Tap a letter from pool to place into next empty slot
  const handleSelectPoolLetter = (poolIdx: number) => {
    if (isWordComplete) return;

    const poolItem = letterPool[poolIdx];
    if (poolItem.used) return;

    // Find first empty slot
    const emptySlotIdx = slots.findIndex((s) => s.placedLetter === null);
    if (emptySlotIdx === -1) return;

    sounds.playPop();

    // Update slots
    const nextSlots = [...slots];
    nextSlots[emptySlotIdx] = {
      ...nextSlots[emptySlotIdx],
      placedLetter: poolItem.letter,
      placedPoolIndex: poolIdx,
    };
    setSlots(nextSlots);

    // Mark pool item as used
    const nextPool = [...letterPool];
    nextPool[poolIdx] = { ...nextPool[poolIdx], used: true };
    setLetterPool(nextPool);

    // Check if word is now filled
    const allFilled = nextSlots.every((s) => s.placedLetter !== null);
    if (allFilled) {
      const spelledWord = nextSlots.map((s) => s.placedLetter).join('');
      if (spelledWord === targetWord) {
        // 🎉 Correct!
        handleWordSuccess(spelledWord);
      } else {
        // ⚠️ Mismatch
        sounds.playBoing();
        sounds.speak(
          language === 'nl'
            ? 'Bijna goed! Tik op een letter om hem te wisselen.'
            : 'Almost there! Tap a letter to swap it.',
          language
        );
      }
    }
  };

  // Tap placed slot to remove and return letter to pool
  const handleRemoveFromSlot = (slotIdx: number) => {
    if (isWordComplete) return;

    const slot = slots[slotIdx];
    if (slot.placedLetter === null || slot.placedPoolIndex === null) return;

    sounds.playRustle();

    const poolIdx = slot.placedPoolIndex;

    const nextSlots = [...slots];
    nextSlots[slotIdx] = {
      ...nextSlots[slotIdx],
      placedLetter: null,
      placedPoolIndex: null,
    };
    setSlots(nextSlots);

    const nextPool = [...letterPool];
    if (nextPool[poolIdx]) {
      nextPool[poolIdx] = { ...nextPool[poolIdx], used: false };
      setLetterPool(nextPool);
    }
  };

  const handleWordSuccess = (spelled: string) => {
    setIsWordComplete(true);
    fireConfettiBurst(isSpookyHalloween ? 'halloween' : category === 'autumn' ? 'autumn' : 'rainbow');

    if (isSpookyHalloween) {
      sounds.playSpookyBoo();
    } else {
      sounds.playCheer();
    }
    sounds.playSparkle();

    onEarnStar();
    // Unlock the first letter sticker
    onUnlockSticker(spelled.charAt(0));

    const wordSpoken = language === 'nl' ? currentWord.wordNl : currentWord.wordEn;
    const funSound = language === 'nl' ? currentWord.funSoundNl : currentWord.funSoundEn;
    const msg =
      language === 'nl'
        ? `Hoera! Je hebt ${wordSpoken} gespeld! ${funSound || 'Geweldig!'}`
        : `Hooray! You spelled ${wordSpoken}! ${funSound || 'Awesome!'}`;

    setCelebrationMessage(msg);
    sounds.speak(msg, language);
  };

  const handleNextWord = () => {
    sounds.playPop();
    setWordIndex((prev) => prev + 1);
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-between p-2 sm:p-3 rounded-3xl transition-colors duration-500 overflow-y-auto overflow-x-hidden scrollbar-none select-none ${
        isSpookyHalloween
          ? 'bg-gradient-to-b from-purple-950 via-indigo-950 to-slate-950 text-white'
          : 'bg-gradient-to-b from-sky-300 via-indigo-200 to-amber-100 text-slate-800'
      }`}
    >
      {/* Halloween Ambient Stars & Ghosts or Sunny Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {isSpookyHalloween ? (
          <>
            <div className="absolute top-4 left-6 text-3xl animate-bounce">🦇</div>
            <div className="absolute top-12 right-10 text-3xl animate-pulse">🎃</div>
            <div className="absolute bottom-8 left-12 text-3xl animate-kid-float">👻</div>
            <div className="absolute top-24 left-1/3 text-2xl animate-spin">🕷️</div>
            <div className="absolute bottom-16 right-16 text-3xl animate-bounce">🕸️</div>
          </>
        ) : (
          <>
            <div className="absolute top-4 left-8 text-4xl animate-kid-float">☁️</div>
            <div className="absolute top-8 right-12 text-4xl animate-kid-bounce">☀️</div>
            <div className="absolute bottom-10 left-16 text-3xl animate-kid-wiggle">🌈</div>
          </>
        )}
      </div>

      {/* Top Controls: Spooky Halloween Toggle, Hint Helper, Category Pills */}
      <div className="relative z-10 w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 bg-black/20 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20">
        {/* Halloween Mode Switch */}
        <button
          onClick={() => {
            sounds.playPop();
            const next = !isSpookyHalloween;
            setIsSpookyHalloween(next);
            if (next) {
              sounds.playSpookyBoo();
              sounds.speak(
                language === 'nl'
                  ? 'Boe! Welkom in Spooky Halloween stijl!'
                  : 'Boo! Welcome to Spooky Halloween style!',
                language
              );
            } else {
              sounds.playSparkle();
              sounds.speak(
                language === 'nl' ? 'Zonnige vrolijke wereld!' : 'Sunny playful world!',
                language
              );
            }
          }}
          className={`px-3 py-1.5 rounded-full font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
            isSpookyHalloween
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/50 hover:bg-amber-400'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {isSpookyHalloween ? (
            <>
              <Moon className="w-4 h-4 fill-current" />
              <span>🎃 Halloween Lore</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4" />
              <span>🌈 Zonnige Lore</span>
            </>
          )}
        </button>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {[
            { id: 'halloween', labelNl: '🎃 Halloween', labelEn: '🎃 Spooky' },
            { id: 'autumn', labelNl: '🍂 Herfst', labelEn: '🍂 Autumn' },
            { id: 'animals', labelNl: '🐾 Dieren', labelEn: '🐾 Animals' },
            { id: 'all', labelNl: '⭐ Alles', labelEn: '⭐ All Words' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playPop();
                setCategory(cat.id as any);
                setWordIndex(0);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                category === cat.id
                  ? 'bg-white text-indigo-900 shadow-sm font-black'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {language === 'nl' ? cat.labelNl : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Hint Silhouette Toggle for 3-Year-Olds */}
        <button
          onClick={() => {
            sounds.playPop();
            setShowHelperSilhouette(!showHelperSilhouette);
          }}
          title={language === 'nl' ? 'Hulp letters aan/uit' : 'Toggle letter silhouette hint'}
          className={`px-2.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
            showHelperSilhouette
              ? 'bg-yellow-400 text-yellow-950 shadow-sm'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 fill-current" />
          <span>{language === 'nl' ? 'Hulpvorm' : 'Hint'}</span>
        </button>
      </div>

      {/* Main Target Word Presentation Card */}
      <div className="relative z-10 flex flex-col items-center justify-center my-1 sm:my-auto w-full max-w-2xl text-center flex-shrink-0">
        {/* Word Picture & Audio Button */}
        <div className="relative inline-flex flex-col items-center mb-1">
          <div
            onClick={handleSpeakWord}
            className="cursor-pointer group flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/20 backdrop-blur-md border-3 border-white/50 shadow-xl active:scale-95 transition-transform"
          >
            <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform animate-kid-bounce">
              {currentWord.emoji}
            </span>
            <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white p-1.5 rounded-full shadow-lg">
              <Volume2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-wide drop-shadow-md">
            {language === 'nl' ? currentWord.wordNl : currentWord.wordEn}
          </h2>
          <p className="text-[11px] sm:text-xs font-medium text-white/90 max-w-md drop-shadow px-2">
            {language === 'nl' ? currentWord.hintNl : currentWord.hintEn}
          </p>
        </div>

        {/* Word Letter Slots (Target Drop / Tap Targets) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap my-1.5 max-w-full px-2">
          {slots.map((slot) => {
            const hasLetter = slot.placedLetter !== null;
            return (
              <button
                key={slot.index}
                type="button"
                onClick={() => handleRemoveFromSlot(slot.index)}
                disabled={!hasLetter || isWordComplete}
                className={`relative w-12 h-16 sm:w-15 sm:h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border-2 sm:border-3 ${
                  hasLetter
                    ? 'border-white/80 cursor-pointer active:scale-95'
                    : 'border-dashed border-white/50 bg-white/15'
                }`}
                style={{
                  boxShadow: hasLetter
                    ? '0 4px 0 rgba(0,0,0,0.3)'
                    : 'inset 0 2px 4px rgba(0,0,0,0.15)',
                }}
              >
                {hasLetter ? (
                  <div className="animate-pop-in">
                    <AlphabetLoreAvatar
                      letter={slot.placedLetter!}
                      size="sm"
                      isSpookyHalloween={isSpookyHalloween}
                      interactive={false}
                      asDiv={true}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    {/* Faint Silhouette Hint for Toddlers */}
                    {showHelperSilhouette ? (
                      <span className="text-2xl sm:text-3xl font-black text-white/30 select-none">
                        {slot.expectedLetter}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-white/40">?</span>
                    )}
                  </div>
                )}

                {/* Subtitle slot order indicator */}
                <div className="absolute -bottom-2 text-[9px] sm:text-[10px] font-black bg-black/40 text-white/90 px-1.5 py-0.2 rounded-full">
                  {slot.index + 1}
                </div>
              </button>
            );
          })}
        </div>

        {/* Success Banner Overlay when Word is complete */}
        {isWordComplete && (
          <div className="animate-pop-in flex flex-col items-center bg-emerald-500/90 text-white px-5 py-2.5 rounded-3xl shadow-2xl border-2 border-white my-1">
            <div className="flex items-center gap-2 text-lg sm:text-xl font-black">
              <span>🌟</span>
              <span>{celebrationMessage || (language === 'nl' ? 'Geweldig Gedaan!' : 'Awesome Job!')}</span>
              <span>🎉</span>
            </div>
            <button
              onClick={handleNextWord}
              className="mt-2 px-5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm sm:text-base rounded-full shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none flex items-center gap-1.5 cursor-pointer transition-all animate-kid-bounce"
            >
              <span>{language === 'nl' ? 'VOLGEND WOORDJE!' : 'NEXT WORD!'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Available Alphabet Lore Letters Choices (Pool at Bottom) */}
      <div className="relative z-10 w-full max-w-4xl bg-black/35 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 border-2 border-white/20 flex flex-col items-center flex-shrink-0">
        <div className="flex items-center justify-between w-full px-2 mb-1">
          <span className="text-[11px] sm:text-xs font-black text-white/90 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {language === 'nl'
              ? 'Tik op de letters om het woordje te spellen:'
              : 'Tap letters to spell the word:'}
          </span>
          <button
            onClick={() => {
              sounds.playRustle();
              // Reset slots and pool
              const nextSlots = slots.map((s) => ({
                ...s,
                placedLetter: null,
                placedPoolIndex: null,
              }));
              setSlots(nextSlots);
              setLetterPool((prev) => prev.map((p) => ({ ...p, used: false })));
            }}
            title={language === 'nl' ? 'Opnieuw beginnen' : 'Reset letters'}
            className="text-[11px] text-white/80 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{language === 'nl' ? 'Herstel' : 'Reset'}</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 md:gap-3 flex-wrap">
          {letterPool.map((item, idx) => (
            <div
              key={item.id}
              className={`transition-all duration-200 ${
                item.used
                  ? 'opacity-20 pointer-events-none scale-90 translate-y-1'
                  : 'hover:scale-105 active:scale-95'
              }`}
            >
              <AlphabetLoreAvatar
                letter={item.letter}
                size="md"
                isSpookyHalloween={isSpookyHalloween}
                interactive={!item.used && !isWordComplete}
                onClick={() => handleSelectPoolLetter(idx)}
                language={language}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
