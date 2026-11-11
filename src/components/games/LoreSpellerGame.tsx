import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Language, LetterStyleOption } from '../../types/game';
import { SPELLING_WORDS, SpellingWord, SpellingCategory } from '../../data/spellingWords';
import { ALPHABET_DATA } from '../../data/alphabetData';
import AlphabetLoreAvatar from '../AlphabetLoreAvatar';
import LetterAvatar from '../LetterAvatar';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { triggerKidCheer } from '../CheerCelebration';
import { Volume2, Sparkles, RefreshCw, Lightbulb, ChevronRight, Wand2, Moon, Sun, Shuffle } from 'lucide-react';

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

type SpellerCategory = 'sinterklaas' | 'christmas' | 'halloween' | 'fruits' | 'animals' | 'toys' | 'autumn' | 'all';

export default function LoreSpellerGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: LoreSpellerGameProps) {
  const [category, setCategory] = useState<SpellerCategory>('sinterklaas');
  const [letterStyle, setLetterStyle] = useState<LetterStyleOption>('lore');
  const [isSpookyHalloween, setIsSpookyHalloween] = useState<boolean>(false);
  const [showHelperSilhouette, setShowHelperSilhouette] = useState<boolean>(true);
  const playedWordIdsRef = useRef<Set<string>>(new Set());
  const [currentWord, setCurrentWord] = useState<SpellingWord>(() => {
    const sintWords = SPELLING_WORDS.filter((w) => w.category === 'sinterklaas');
    return sintWords[0] || SPELLING_WORDS[0];
  });
  const [isWordComplete, setIsWordComplete] = useState<boolean>(false);
  const [slots, setSlots] = useState<LetterSlot[]>([]);
  const [letterPool, setLetterPool] = useState<PoolLetter[]>([]);
  const [selectedPoolIndex, setSelectedPoolIndex] = useState<number | null>(null);
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);
  const [celebrationMessage, setCelebrationMessage] = useState<string>('');
  const [showWordDrawer, setShowWordDrawer] = useState<boolean>(false);

  // Initialize playedWordIdsRef on mount
  useEffect(() => {
    playedWordIdsRef.current.add(currentWord.id);
  }, []);

  // Filter words in the current category
  const categoryWords: SpellingWord[] = useMemo(() => {
    return category === 'all'
      ? SPELLING_WORDS
      : SPELLING_WORDS.filter((w) => w.category === category);
  }, [category]);

  // Improved randomizer: cycles through all words in the selected category without repetition
  const pickNewRandomWord = (selectedCat: SpellerCategory, currentId?: string) => {
    setSelectedPoolIndex(null);
    setHoveredSlotIndex(null);
    const pool =
      selectedCat === 'all'
        ? SPELLING_WORDS
        : SPELLING_WORDS.filter((w) => w.category === selectedCat);

    // Filter out words that were already played in this cycle
    let unplayed = pool.filter((w) => !playedWordIdsRef.current.has(w.id) && w.id !== currentId);
    if (unplayed.length === 0) {
      playedWordIdsRef.current.clear();
      unplayed = pool.filter((w) => w.id !== currentId);
      if (unplayed.length === 0) unplayed = pool;
    }

    const chosen = unplayed[Math.floor(Math.random() * unplayed.length)] || pool[0];
    playedWordIdsRef.current.add(chosen.id);
    setCurrentWord(chosen);
  };

  const targetWord = (language === 'nl' ? currentWord.wordNl : currentWord.wordEn).toUpperCase();

  // Helper to shuffle array with Fisher-Yates algorithm
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Setup word slots and letter choices
  useEffect(() => {
    setIsWordComplete(false);
    setCelebrationMessage('');
    setSelectedPoolIndex(null);
    setHoveredSlotIndex(null);

    const letters = targetWord.split('');
    const initialSlots: LetterSlot[] = letters.map((l, idx) => ({
      index: idx,
      expectedLetter: l,
      placedLetter: null,
      placedPoolIndex: null,
    }));
    setSlots(initialSlots);

    // Smart friendly distractors: pick 4-5 common preschool letters not in the word
    const friendlyVowels = ['A', 'E', 'O', 'I', 'U'];
    const friendlyConsonants = ['B', 'D', 'K', 'M', 'N', 'P', 'R', 'S', 'T', 'L', 'H'];
    const candidates = [...friendlyVowels, ...friendlyConsonants].filter(
      (char) => !letters.includes(char)
    );
    const shuffledCandidates = shuffleArray(candidates);
    // Provide 4 distractors so pool has at least 7-10 options for kids to choose from
    const distractors = shuffledCandidates.slice(0, 4);

    const allLetters = [...letters, ...distractors];
    // Fisher-Yates shuffle
    const shuffled = shuffleArray(allLetters).map((letter, idx) => ({
      id: `${letter}-${idx}-${Date.now()}-${Math.random()}`,
      letter,
      used: false,
    }));

    setLetterPool(shuffled);

    // Speak word cue concisely
    const hint = language === 'nl' ? currentWord.hintNl : currentWord.hintEn;
    const wordSpoken = language === 'nl' ? currentWord.wordNl : currentWord.wordEn;
    sounds.speak(`${wordSpoken}! ${hint}`, language);
  }, [currentWord, targetWord, language]);

  const handleSpeakWord = () => {
    const wordSpoken = language === 'nl' ? currentWord.wordNl : currentWord.wordEn;
    const hint = language === 'nl' ? currentWord.hintNl : currentWord.hintEn;
    sounds.playBoing();
    sounds.speak(`${wordSpoken}! ${hint}`, language);
  };

  // Place a specific pool letter into a specific slot (via drag & drop or selection)
  const handlePlacePoolLetterInSlot = (poolIdx: number, slotIdx: number) => {
    if (isWordComplete) return;

    const poolItem = letterPool[poolIdx];
    if (!poolItem) return;

    sounds.playPop();

    const nextSlots = [...slots];
    const nextPool = [...letterPool];

    // If target slot already has a letter, return old letter to pool
    const existingSlot = nextSlots[slotIdx];
    if (existingSlot.placedPoolIndex !== null && existingSlot.placedPoolIndex !== poolIdx) {
      const oldPoolIdx = existingSlot.placedPoolIndex;
      if (nextPool[oldPoolIdx]) {
        nextPool[oldPoolIdx] = { ...nextPool[oldPoolIdx], used: false };
      }
    }

    // If this pool letter was already in another slot, clear that slot
    const prevSlotIdx = nextSlots.findIndex((s) => s.placedPoolIndex === poolIdx);
    if (prevSlotIdx !== -1 && prevSlotIdx !== slotIdx) {
      nextSlots[prevSlotIdx] = {
        ...nextSlots[prevSlotIdx],
        placedLetter: null,
        placedPoolIndex: null,
      };
    }

    // Assign letter to slot
    nextSlots[slotIdx] = {
      ...nextSlots[slotIdx],
      placedLetter: poolItem.letter,
      placedPoolIndex: poolIdx,
    };
    nextPool[poolIdx] = { ...nextPool[poolIdx], used: true };

    setSlots(nextSlots);
    setLetterPool(nextPool);
    setSelectedPoolIndex(null);

    // Speak letter sound
    sounds.speak(poolItem.letter, language);

    // Check if word is now completed
    const allFilled = nextSlots.every((s) => s.placedLetter !== null);
    if (allFilled) {
      const spelledWord = nextSlots.map((s) => s.placedLetter).join('');
      if (spelledWord === targetWord) {
        handleWordSuccess(spelledWord);
      } else {
        sounds.playBoing();
        sounds.speak(language === 'nl' ? 'Bijna!' : 'Almost!', language);
      }
    }
  };

  // Tap a pool letter: SELECTS it (does NOT auto-assign to slot!)
  const handleSelectPoolLetter = (poolIdx: number) => {
    if (isWordComplete) return;

    const poolItem = letterPool[poolIdx];
    if (poolItem.used) return;

    if (selectedPoolIndex === poolIdx) {
      // Deselect
      setSelectedPoolIndex(null);
      sounds.playRustle();
    } else {
      // Select
      setSelectedPoolIndex(poolIdx);
      sounds.playBoing();
      sounds.speak(poolItem.letter, language);
    }
  };

  // Tap a slot: If letter selected in pool, place it here! If not, remove existing letter.
  const handleSlotClick = (slotIdx: number) => {
    if (isWordComplete) return;

    if (selectedPoolIndex !== null) {
      handlePlacePoolLetterInSlot(selectedPoolIndex, slotIdx);
    } else {
      handleRemoveFromSlot(slotIdx);
    }
  };

  // Remove letter from slot and return to pool
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
    fireConfettiBurst(
      category === 'sinterklaas'
        ? 'stars'
        : category === 'christmas'
        ? 'winter'
        : category === 'halloween'
        ? 'halloween'
        : 'rainbow'
    );

    sounds.playTada();
    sounds.playSparkle();

    triggerKidCheer({
      message: language === 'nl' ? 'HOERA GESPELD!' : 'YOU SPELLED IT!',
      emoji: currentWord.emoji,
    });

    onEarnStar();
    onUnlockSticker(spelled.charAt(0));

    const wordSpoken = language === 'nl' ? currentWord.wordNl : currentWord.wordEn;
    const msg = language === 'nl' ? `Super! ${wordSpoken}!` : `Awesome! ${wordSpoken}!`;

    setCelebrationMessage(msg);
    sounds.speak(msg, language);
  };

  const handleNextWord = () => {
    sounds.playPop();
    pickNewRandomWord(category, currentWord.id);
  };

  // Theme scene styling
  const isSintTheme = category === 'sinterklaas';
  const isXmasTheme = category === 'christmas';
  const isHalloweenTheme = category === 'halloween';

  const bgGradient = isSintTheme
    ? 'from-red-950 via-slate-900 to-amber-950 text-white'
    : isXmasTheme
    ? 'from-emerald-950 via-slate-900 to-red-950 text-white'
    : isHalloweenTheme
    ? 'from-purple-950 via-indigo-950 to-slate-950 text-white'
    : 'bg-gradient-to-b from-sky-400 via-indigo-600 to-purple-800 text-white';

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-between p-2 sm:p-3 rounded-3xl transition-colors duration-500 overflow-y-auto overflow-x-hidden scrollbar-none select-none bg-gradient-to-b ${bgGradient}`}
    >
      {/* Ambient Theme Background Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {isSintTheme ? (
          <>
            <div className="absolute top-4 left-6 text-4xl animate-bounce">👑</div>
            <div className="absolute top-12 right-10 text-4xl animate-pulse">🎁</div>
            <div className="absolute bottom-8 left-12 text-4xl animate-kid-float">🐴</div>
            <div className="absolute top-24 left-1/3 text-3xl animate-spin">🍪</div>
            <div className="absolute bottom-16 right-16 text-3xl animate-bounce">👞</div>
          </>
        ) : isXmasTheme ? (
          <>
            <div className="absolute top-4 left-6 text-4xl animate-bounce">🎄</div>
            <div className="absolute top-12 right-10 text-4xl animate-pulse">⭐</div>
            <div className="absolute bottom-8 left-12 text-4xl animate-kid-float">⛄</div>
            <div className="absolute top-24 left-1/3 text-3xl animate-spin">❄️</div>
            <div className="absolute bottom-16 right-16 text-3xl animate-bounce">🔔</div>
          </>
        ) : isHalloweenTheme ? (
          <>
            <div className="absolute top-4 left-6 text-4xl animate-bounce">🦇</div>
            <div className="absolute top-12 right-10 text-4xl animate-pulse">🎃</div>
            <div className="absolute bottom-8 left-12 text-4xl animate-kid-float">👻</div>
            <div className="absolute top-24 left-1/3 text-3xl animate-spin">🕷️</div>
            <div className="absolute bottom-16 right-16 text-3xl animate-bounce">🕸️</div>
          </>
        ) : (
          <>
            <div className="absolute top-4 left-8 text-4xl animate-kid-float">☁️</div>
            <div className="absolute top-8 right-12 text-4xl animate-kid-bounce">☀️</div>
            <div className="absolute bottom-10 left-16 text-4xl animate-kid-wiggle">🌈</div>
          </>
        )}
      </div>

      {/* Top Controls: Style Switcher, Seasonal Category Pills & Hint */}
      <div className="relative z-10 w-full max-w-4xl flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 bg-black/35 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-2xl border border-white/20">
        {/* Style Switcher: Normal Letters vs Alphabet Lore */}
        <button
          onClick={() => {
            sounds.playPop();
            setLetterStyle((prev) => (prev === 'lore' ? 'normal' : 'lore'));
          }}
          className={`px-2.5 sm:px-3 py-1 rounded-full font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
            letterStyle === 'normal'
              ? 'bg-amber-400 text-amber-950 shadow-amber-400/50 scale-105 ring-2 ring-white'
              : 'bg-purple-600 text-white hover:bg-purple-500'
          }`}
          title={language === 'nl' ? 'Kies Normale letters of Alphabet Lore' : 'Choose Normal letters or Alphabet Lore'}
        >
          <span>{letterStyle === 'normal' ? '🔤 Normaal' : '👾 Lore'}</span>
        </button>

        {/* Categories: Sinterklaas, Christmas, Halloween, Fruits, Animals, Toys, Autumn, All */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 max-w-full">
          {(
            [
              { id: 'sinterklaas' as const, labelNl: '👑 Sinterklaas', labelEn: '👑 Sint' },
              { id: 'christmas' as const, labelNl: '🎄 Kerstmis', labelEn: '🎄 Xmas' },
              { id: 'halloween' as const, labelNl: '🎃 Halloween', labelEn: '🎃 Spooky' },
              { id: 'fruits' as const, labelNl: '🍎 Fruit & Eten', labelEn: '🍎 Fruit' },
              { id: 'animals' as const, labelNl: '🐾 Dieren', labelEn: '🐾 Animals' },
              { id: 'toys' as const, labelNl: '🧸 Speelgoed', labelEn: '🧸 Toys' },
              { id: 'autumn' as const, labelNl: '🍂 Herfst', labelEn: '🍂 Autumn' },
              { id: 'all' as const, labelNl: '⭐ Alles', labelEn: '⭐ All' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playPop();
                setCategory(cat.id);
                pickNewRandomWord(cat.id);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                category === cat.id
                  ? 'bg-amber-400 text-amber-950 shadow-md font-black scale-105'
                  : 'text-white/80 hover:text-white bg-white/10'
              }`}
            >
              {language === 'nl' ? cat.labelNl : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sounds.playPop();
              setShowWordDrawer(!showWordDrawer);
            }}
            className={`px-2.5 py-1 sm:py-1.5 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer transition-all shadow-md ${
              showWordDrawer
                ? 'bg-amber-400 text-amber-950 ring-2 ring-white scale-105'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={language === 'nl' ? 'Bekijk alle woorden in deze categorie' : 'Browse all words in this category'}
          >
            <span>📖</span>
            <span>{language === 'nl' ? `Woorden (${categoryWords.length})` : `Words (${categoryWords.length})`}</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              sounds.playSparkle();
              pickNewRandomWord(category, currentWord.id);
            }}
            title={language === 'nl' ? 'Ander willekeurig woordje' : 'Pick new random word'}
            className="px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-md active:scale-95 transition-transform"
          >
            <span>🎲</span>
            <span className="hidden sm:inline">{language === 'nl' ? 'Nieuw' : 'New'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setShowHelperSilhouette(!showHelperSilhouette);
            }}
            title={language === 'nl' ? 'Hulp letters aan/uit' : 'Toggle letter silhouette hint'}
            className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
              showHelperSilhouette
                ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">{language === 'nl' ? 'Hulp' : 'Hint'}</span>
          </button>
        </div>
      </div>

      {/* Word Drawer: Kids can browse & tap ANY of the 24+ words in this category */}
      {showWordDrawer && (
        <div className="relative z-20 w-full max-w-4xl bg-black/45 backdrop-blur-md rounded-2xl p-2 border-2 border-amber-400/60 shadow-2xl animate-pop-in my-1">
          <div className="flex items-center justify-between px-2 mb-1 text-[11px] font-black text-amber-300">
            <span>
              {language === 'nl'
                ? `👇 Tik op een woord om direct te spellen (${categoryWords.length} opties):`
                : `👇 Tap any word to spell it right away (${categoryWords.length} options):`}
            </span>
            <button
              onClick={() => setShowWordDrawer(false)}
              className="text-white/70 hover:text-white cursor-pointer px-1.5 py-0.5 rounded bg-white/10 text-[10px]"
            >
              ✕ {language === 'nl' ? 'Sluiten' : 'Close'}
            </button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-1">
            {categoryWords.map((item: SpellingWord) => {
              const itemWord = (language === 'nl' ? item.wordNl : item.wordEn).toUpperCase();
              const isCurrent = item.id === currentWord.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playPop();
                    setCurrentWord(item);
                    playedWordIdsRef.current.add(item.id);
                    setShowWordDrawer(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-white scale-105'
                      : 'bg-white/15 hover:bg-white/25 text-white'
                  }`}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span>{itemWord}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Target Word Presentation Card */}
      <div className="relative z-10 flex flex-col items-center justify-center my-1 sm:my-auto w-full max-w-2xl text-center flex-shrink-0">
        {/* Word Picture & Audio Button */}
        <div className="relative inline-flex flex-col items-center mb-1">
          <div
            onClick={handleSpeakWord}
            className="cursor-pointer group flex items-center justify-center w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-white/25 backdrop-blur-md border-3 border-white/60 shadow-xl active:scale-95 transition-transform"
          >
            <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform animate-kid-bounce">
              {currentWord.emoji}
            </span>
            <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white p-1.5 rounded-full shadow-lg">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>

          <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-wide drop-shadow-md">
            {language === 'nl' ? currentWord.wordNl : currentWord.wordEn}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-white/90 max-w-md drop-shadow px-2">
            {language === 'nl' ? currentWord.hintNl : currentWord.hintEn}
          </p>
        </div>

        {/* Word Letter Slots - Drop Targets for Drag & Drop and Tap Placement */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap my-2 max-w-full px-2">
          {slots.map((slot) => {
            const hasLetter = slot.placedLetter !== null;
            const isHovered = hoveredSlotIndex === slot.index;

            return (
              <button
                key={slot.index}
                type="button"
                onClick={() => handleSlotClick(slot.index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDragEnter={() => setHoveredSlotIndex(slot.index)}
                onDragLeave={() => setHoveredSlotIndex(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  const poolIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                  if (!isNaN(poolIdx)) {
                    handlePlacePoolLetterInSlot(poolIdx, slot.index);
                  }
                  setHoveredSlotIndex(null);
                }}
                className={`relative w-14 h-20 sm:w-18 sm:h-24 md:w-20 md:h-28 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center transition-all duration-200 border-3 ${
                  hasLetter
                    ? 'border-white bg-white/20 cursor-pointer active:scale-95 shadow-xl'
                    : isHovered
                    ? 'border-amber-300 bg-amber-400/30 scale-105 border-dashed shadow-lg'
                    : selectedPoolIndex !== null
                    ? 'border-dashed border-amber-300 bg-amber-400/15 animate-pulse'
                    : 'border-dashed border-white/50 bg-white/10'
                }`}
                style={{
                  boxShadow: hasLetter ? '0 6px 0 rgba(0,0,0,0.3)' : undefined,
                }}
              >
                {hasLetter ? (
                  <div className="animate-pop-in">
                    {letterStyle === 'lore' ? (
                      <AlphabetLoreAvatar
                        letter={slot.placedLetter!}
                        size="md"
                        isSpookyHalloween={isHalloweenTheme}
                        interactive={false}
                        asDiv={true}
                      />
                    ) : (
                      <LetterAvatar
                        letterInfo={
                          ALPHABET_DATA.find((l) => l.letter === slot.placedLetter!) || ALPHABET_DATA[0]
                        }
                        size="md"
                        interactive={false}
                        asDiv={true}
                        language={language}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    {/* Helper Silhouette */}
                    {showHelperSilhouette ? (
                      <span className="text-3xl sm:text-4xl font-black text-white/35 select-none">
                        {slot.expectedLetter}
                      </span>
                    ) : (
                      <span className="text-base font-bold text-white/40">?</span>
                    )}
                  </div>
                )}

                {/* Subtitle slot order badge */}
                <div className="absolute -bottom-2 text-[10px] font-black bg-black/60 text-amber-200 px-2 py-0.5 rounded-full border border-white/30">
                  {slot.index + 1}
                </div>
              </button>
            );
          })}
        </div>

        {/* Success Banner Overlay when Word is complete */}
        {isWordComplete && (
          <div className="animate-pop-in flex flex-col items-center bg-emerald-500/95 text-white px-6 py-2.5 rounded-3xl shadow-2xl border-2 border-white my-1">
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
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Available Letter Pool - Supports DRAG & DROP and TAP-TO-PLACE */}
      <div className="relative z-10 w-full max-w-4xl bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 border-2 border-white/20 flex flex-col items-center flex-shrink-0">
        <div className="flex items-center justify-between w-full px-2 mb-1.5">
          <span className="text-xs sm:text-sm font-black text-white/95 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-300" />
            {language === 'nl'
              ? 'Sleep de letters naar de vakjes (of tik op een letter en dan op een vakje):'
              : 'Drag letters into the slots (or tap a letter then tap a slot):'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playRustle();
                setLetterPool((prev) => shuffleArray(prev));
              }}
              title={language === 'nl' ? 'Schud de letters' : 'Shuffle letter choices'}
              className="text-[11px] font-bold text-white/80 hover:text-white flex items-center gap-1 cursor-pointer bg-white/10 px-2.5 py-1 rounded-full"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{language === 'nl' ? 'Schudden' : 'Shuffle'}</span>
            </button>

            <button
              onClick={() => {
                sounds.playRustle();
                // Reset all slots
                const nextSlots = slots.map((s) => ({
                  ...s,
                  placedLetter: null,
                  placedPoolIndex: null,
                }));
                setSlots(nextSlots);
                setLetterPool((prev) => prev.map((p) => ({ ...p, used: false })));
                setSelectedPoolIndex(null);
              }}
              title={language === 'nl' ? 'Opnieuw beginnen' : 'Reset letters'}
              className="text-[11px] font-bold text-white/80 hover:text-white flex items-center gap-1 cursor-pointer bg-white/10 px-2.5 py-1 rounded-full"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'nl' ? 'Herstel' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Letter Pool Tiles */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {letterPool.map((poolItem, poolIdx) => {
            const isSelected = selectedPoolIndex === poolIdx;

            return (
              <button
                key={poolItem.id}
                type="button"
                draggable={!poolItem.used && !isWordComplete}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', poolIdx.toString());
                  setSelectedPoolIndex(poolIdx);
                }}
                onClick={() => handleSelectPoolLetter(poolIdx)}
                disabled={poolItem.used || isWordComplete}
                className={`relative w-15 h-20 sm:w-18 sm:h-24 md:w-20 md:h-26 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center transition-all duration-150 select-none ${
                  poolItem.used
                    ? 'opacity-20 pointer-events-none scale-90 translate-y-2'
                    : isSelected
                    ? 'ring-4 ring-yellow-400 bg-amber-400/40 -translate-y-2 scale-110 shadow-2xl z-20 cursor-grab active:cursor-grabbing'
                    : 'bg-white/20 hover:bg-white/30 border-2 border-white/40 cursor-grab active:cursor-grabbing shadow-lg hover:scale-105 active:scale-95'
                }`}
                style={{
                  boxShadow: !poolItem.used
                    ? isSelected
                      ? '0 8px 20px rgba(251, 191, 36, 0.6)'
                      : '0 5px 0 rgba(0,0,0,0.3)'
                    : undefined,
                }}
              >
                {letterStyle === 'lore' ? (
                  <AlphabetLoreAvatar
                    letter={poolItem.letter}
                    size="md"
                    isSpookyHalloween={isHalloweenTheme}
                    interactive={false}
                    asDiv={true}
                  />
                ) : (
                  <LetterAvatar
                    letterInfo={
                      ALPHABET_DATA.find((l) => l.letter === poolItem.letter) || ALPHABET_DATA[0]
                    }
                    size="md"
                    interactive={false}
                    asDiv={true}
                    language={language}
                  />
                )}
                {isSelected && (
                  <span className="absolute -top-2 bg-yellow-400 text-yellow-950 font-black text-[9px] px-1.5 py-0.2 rounded-full shadow animate-bounce">
                    {language === 'nl' ? 'Gekozen' : 'Ready'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
