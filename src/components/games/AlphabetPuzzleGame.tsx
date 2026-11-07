import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ALPHABET_DATA } from '../../data/alphabetData';
import { LetterInfo, Language, LetterStyleOption } from '../../types/game';
import AlphabetLoreAvatar from '../AlphabetLoreAvatar';
import LetterAvatar from '../LetterAvatar';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { triggerKidCheer } from '../CheerCelebration';
import {
  Sparkles,
  RefreshCw,
  Volume2,
  ChevronRight,
  Puzzle,
  CheckCircle2,
  Shuffle,
  Layers,
} from 'lucide-react';

interface AlphabetPuzzleGameProps {
  onEarnStar: () => void;
  onUnlockSticker?: (letter: string) => void;
  language: Language;
}

type PieceCount = 2 | 3 | 4;

interface PuzzleSlot {
  id: number;
  label: string;
  isFilled: boolean;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  width: number; // percentage
  height: number; // percentage
  clipPath: string;
  innerLeft: string;
  innerTop: string;
  innerWidth: string;
  innerHeight: string;
}

export default function AlphabetPuzzleGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: AlphabetPuzzleGameProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [letterStyle, setLetterStyle] = useState<LetterStyleOption>('normal');
  // Starts with single letter 2 pieces by default as requested!
  const [pieceCount, setPieceCount] = useState<PieceCount>(2);
  const [placedPieces, setPlacedPieces] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [celebrationMsg, setCelebrationMsg] = useState<string>('');

  // Dragging state
  const [draggingPieceId, setDraggingPieceId] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [isNearTarget, setIsNearTarget] = useState<boolean>(false);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const slotsRef = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const currentLetterInfo: LetterInfo = ALPHABET_DATA[currentIdx] || ALPHABET_DATA[0];
  const letterChar = currentLetterInfo.letter;
  const currentWord =
    language === 'nl'
      ? currentLetterInfo.wordNl || currentLetterInfo.word
      : currentLetterInfo.word;

  // Define puzzle geometry based on 2-piece, 3-piece, or 4-piece mode
  const puzzleSlots: PuzzleSlot[] = useMemo(() => {
    if (pieceCount === 2) {
      return [
        {
          id: 0,
          label: language === 'nl' ? '1: Boven' : '1: Top',
          isFilled: placedPieces.includes(0),
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          innerLeft: '0%',
          innerTop: '0%',
          innerWidth: '100%',
          innerHeight: '200%',
        },
        {
          id: 1,
          label: language === 'nl' ? '2: Onder' : '2: Bottom',
          isFilled: placedPieces.includes(1),
          x: 0,
          y: 50,
          width: 100,
          height: 50,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          innerLeft: '0%',
          innerTop: '-100%',
          innerWidth: '100%',
          innerHeight: '200%',
        },
      ];
    } else if (pieceCount === 3) {
      return [
        {
          id: 0,
          label: language === 'nl' ? '1: Boven' : '1: Top',
          isFilled: placedPieces.includes(0),
          x: 0,
          y: 0,
          width: 100,
          height: 33.33,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          innerLeft: '0%',
          innerTop: '0%',
          innerWidth: '100%',
          innerHeight: '300%',
        },
        {
          id: 1,
          label: language === 'nl' ? '2: Midden' : '2: Middle',
          isFilled: placedPieces.includes(1),
          x: 0,
          y: 33.33,
          width: 100,
          height: 33.34,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          innerLeft: '0%',
          innerTop: '-100%',
          innerWidth: '100%',
          innerHeight: '300%',
        },
        {
          id: 2,
          label: language === 'nl' ? '3: Onder' : '3: Bottom',
          isFilled: placedPieces.includes(2),
          x: 0,
          y: 66.67,
          width: 100,
          height: 33.33,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          innerLeft: '0%',
          innerTop: '-200%',
          innerWidth: '100%',
          innerHeight: '300%',
        },
      ];
    } else {
      // 4 pieces: 2x2 grid
      return [
        {
          id: 0,
          label: '1: Links-Boven',
          isFilled: placedPieces.includes(0),
          x: 0,
          y: 0,
          width: 50,
          height: 50,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          innerLeft: '0%',
          innerTop: '0%',
          innerWidth: '200%',
          innerHeight: '200%',
        },
        {
          id: 1,
          label: '2: Rechts-Boven',
          isFilled: placedPieces.includes(1),
          x: 50,
          y: 0,
          width: 50,
          height: 50,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          innerLeft: '-100%',
          innerTop: '0%',
          innerWidth: '200%',
          innerHeight: '200%',
        },
        {
          id: 2,
          label: '3: Links-Onder',
          isFilled: placedPieces.includes(2),
          x: 0,
          y: 50,
          width: 50,
          height: 50,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          innerLeft: '0%',
          innerTop: '-100%',
          innerWidth: '200%',
          innerHeight: '200%',
        },
        {
          id: 3,
          label: '4: Rechts-Onder',
          isFilled: placedPieces.includes(3),
          x: 50,
          y: 50,
          width: 50,
          height: 50,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          innerLeft: '-100%',
          innerTop: '-100%',
          innerWidth: '200%',
          innerHeight: '200%',
        },
      ];
    }
  }, [pieceCount, placedPieces, language]);

  // Start puzzle
  const startPuzzle = (index: number, pieces: PieceCount = pieceCount) => {
    setCurrentIdx(index);
    setPlacedPieces([]);
    setIsComplete(false);
    setCelebrationMsg('');
    setDraggingPieceId(null);
    setDragPos(null);

    const targetInfo = ALPHABET_DATA[index] || ALPHABET_DATA[0];
    const word =
      language === 'nl'
        ? targetInfo.wordNl || targetInfo.word
        : targetInfo.word;

    sounds.playPop();
    sounds.speak(
      language === 'nl'
        ? `Sleep de stukjes om letter ${targetInfo.letter} te maken!`
        : `Drag the pieces to build letter ${targetInfo.letter}!`,
      language
    );
  };

  useEffect(() => {
    startPuzzle(0, 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When a piece snaps into place
  const handleSnapPiece = useCallback((pieceId: number) => {
    if (isComplete || placedPieces.includes(pieceId)) return;

    sounds.playRustle();
    sounds.playPop();

    const nextPlaced = [...placedPieces, pieceId];
    setPlacedPieces(nextPlaced);

    // If all pieces placed, trigger celebration
    if (nextPlaced.length === pieceCount) {
      setIsComplete(true);
      sounds.playTada();
      sounds.playSparkle();
      fireConfettiBurst('rainbow');
      onEarnStar();
      if (onUnlockSticker) onUnlockSticker(letterChar);

      triggerKidCheer({
        message: language === 'nl' ? 'PUZZEL KLAAR!' : 'PUZZLE COMPLETE!',
        emoji: currentLetterInfo.emoji,
      });

      const message =
        language === 'nl'
          ? `Super! Je hebt letter ${letterChar} in elkaar gepuzzeld! ${currentWord}!`
          : `Awesome! You built letter ${letterChar}! ${currentWord}!`;

      setCelebrationMsg(message);
      sounds.speak(message, language);
    } else {
      sounds.playColorChime(nextPlaced.length / pieceCount);
    }
  }, [isComplete, placedPieces, pieceCount, onEarnStar, onUnlockSticker, letterChar, currentLetterInfo.emoji, currentWord, language]);

  // Check if position is near a slot on the board
  const checkNearSlot = useCallback((clientX: number, clientY: number, pieceId: number) => {
    const slotEl = slotsRef.current[pieceId];
    const boardEl = boardRef.current;
    if (!slotEl || !boardEl) return false;

    const slotRect = slotEl.getBoundingClientRect();
    const boardRect = boardEl.getBoundingClientRect();

    // Check distance to specific slot center
    const slotCenterX = slotRect.left + slotRect.width / 2;
    const slotCenterY = slotRect.top + slotRect.height / 2;
    const dist = Math.hypot(clientX - slotCenterX, clientY - slotCenterY);

    // Large forgiving snap distance for toddlers: 110px or within slot bounds
    const isInsideSlot =
      clientX >= slotRect.left - 40 &&
      clientX <= slotRect.right + 40 &&
      clientY >= slotRect.top - 40 &&
      clientY <= slotRect.bottom + 40;

    // Or if inside board and it's the only unplaced piece
    const isInsideBoard =
      clientX >= boardRect.left &&
      clientX <= boardRect.right &&
      clientY >= boardRect.top &&
      clientY <= boardRect.bottom;

    const onlyOneLeft = placedPieces.length === pieceCount - 1;

    return dist < 110 || isInsideSlot || (isInsideBoard && onlyOneLeft);
  }, [pieceCount, placedPieces.length]);

  // Pointer / Touch Dragging Events
  const handlePointerDown = (pieceId: number, e: React.PointerEvent) => {
    if (isComplete || placedPieces.includes(pieceId)) return;

    sounds.playRustle();
    setDraggingPieceId(pieceId);
    setDragPos({ x: e.clientX, y: e.clientY });
    setIsNearTarget(checkNearSlot(e.clientX, e.clientY, pieceId));

    // Capture pointer
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingPieceId === null) return;
    setDragPos({ x: e.clientX, y: e.clientY });
    setIsNearTarget(checkNearSlot(e.clientX, e.clientY, draggingPieceId));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingPieceId === null) return;

    const pieceId = draggingPieceId;
    const isNear = checkNearSlot(e.clientX, e.clientY, pieceId);

    setDraggingPieceId(null);
    setDragPos(null);
    setIsNearTarget(false);

    if (isNear) {
      handleSnapPiece(pieceId);
    } else {
      sounds.playBoing();
    }
  };

  const handlePointerCancel = () => {
    setDraggingPieceId(null);
    setDragPos(null);
    setIsNearTarget(false);
  };

  // Next random puzzle
  const handleRandomPuzzle = () => {
    let nextIdx: number;
    do {
      nextIdx = Math.floor(Math.random() * ALPHABET_DATA.length);
    } while (nextIdx === currentIdx && ALPHABET_DATA.length > 1);

    startPuzzle(nextIdx);
  };

  // Progress to next level (2 pieces -> 3 pieces -> 4 pieces)
  const handleNextLevel = () => {
    if (pieceCount === 2) {
      setPieceCount(3);
      startPuzzle(currentIdx, 3);
      sounds.speak(language === 'nl' ? 'Nu 3 puzzelstukjes!' : 'Now 3 puzzle pieces!', language);
    } else if (pieceCount === 3) {
      setPieceCount(4);
      startPuzzle(currentIdx, 4);
      sounds.speak(language === 'nl' ? 'Nu 4 puzzelstukjes!' : 'Now 4 puzzle pieces!', language);
    } else {
      handleRandomPuzzle();
    }
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className="relative w-full h-full flex flex-col items-center justify-between p-2 sm:p-3 rounded-3xl bg-gradient-to-b from-sky-400 via-indigo-500 to-purple-700 text-white overflow-y-auto overflow-x-hidden scrollbar-none select-none touch-none"
    >
      {/* Background Floating Toys & Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute top-4 left-6 text-3xl animate-bounce">🧩</div>
        <div className="absolute top-12 right-8 text-3xl animate-pulse">⭐</div>
        <div className="absolute bottom-8 left-12 text-3xl animate-kid-float">🎈</div>
        <div className="absolute bottom-16 right-16 text-3xl animate-spin">🌟</div>
      </div>

      {/* Top Bar: Style Toggle, Piece Count Progressive Levels (2, 3, 4), Random Button */}
      <div className="relative z-10 w-full max-w-4xl flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 bg-black/25 backdrop-blur-md px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border border-white/20">
        {/* Style Switcher: Normal Letters vs Alphabet Lore */}
        <div className="flex items-center gap-1 bg-white/15 p-0.5 rounded-full border border-white/30">
          <button
            onClick={() => {
              sounds.playPop();
              setLetterStyle('normal');
            }}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              letterStyle === 'normal'
                ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <span>🔤</span>
            <span>{language === 'nl' ? 'Normaal' : 'Normal'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setLetterStyle('lore');
            }}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              letterStyle === 'lore'
                ? 'bg-purple-500 text-white shadow-md scale-105 ring-2 ring-amber-300'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <span>👾</span>
            <span>Lore</span>
          </button>
        </div>

        {/* Piece Count Progressive Levels: 2 pieces, then 3, then 4 pieces */}
        <div className="flex items-center gap-1 bg-white/15 p-0.5 rounded-full border border-white/30">
          {[2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => {
                sounds.playPop();
                setPieceCount(count as PieceCount);
                setPlacedPieces([]);
                setIsComplete(false);
                sounds.speak(`${count} ${language === 'nl' ? 'puzzelstukjes' : 'puzzle pieces'}!`, language);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                pieceCount === count
                  ? 'bg-white text-indigo-950 shadow-md scale-105'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>🧩</span>
              <span>{count} {language === 'nl' ? 'Delen' : 'Pieces'}</span>
            </button>
          ))}
        </div>

        {/* Random / Next Puzzle Button */}
        <button
          onClick={handleRandomPuzzle}
          title={language === 'nl' ? 'Ander willekeurig letterpuzzel' : 'Next random puzzle'}
          className="px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-md active:scale-95 transition-transform"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>{language === 'nl' ? 'Nieuwe Puzzel' : 'Next Puzzle'}</span>
        </button>
      </div>

      {/* Target Letter Header Banner */}
      <div className="relative z-10 flex flex-col items-center text-center my-0.5">
        <div
          onClick={() => {
            sounds.playBoing();
            sounds.speak(`${letterChar}! ${currentWord}!`, language);
          }}
          className="cursor-pointer group inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-1 rounded-2xl border-2 border-white/40 shadow-lg active:scale-95 transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center shadow">
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="text-base sm:text-lg font-black tracking-wide drop-shadow flex items-center gap-1.5">
            <span>{currentLetterInfo.emoji}</span>
            <span>{letterChar} - {currentWord}</span>
          </span>
        </div>
      </div>

      {/* Main Center Puzzle Board (ENLARGED SCALE FOR EASY TODDLER DRAGGING) */}
      <div
        ref={boardRef}
        className={`relative z-10 w-72 h-72 sm:w-88 sm:h-88 md:w-[400px] md:h-[400px] bg-white/20 backdrop-blur-md rounded-3xl border-4 border-dashed p-2 shadow-2xl flex items-center justify-center my-auto overflow-hidden transition-all duration-300 ${
          isNearTarget
            ? 'border-emerald-400 ring-8 ring-emerald-300/60 scale-102 bg-white/30'
            : 'border-white/70'
        }`}
      >
        {/* Ghost background silhouette hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none scale-95">
          {letterStyle === 'lore' ? (
            <AlphabetLoreAvatar
              letter={letterChar}
              size="xl"
              interactive={false}
              asDiv={true}
              language={language}
            />
          ) : (
            <LetterAvatar
              letterInfo={currentLetterInfo}
              size="xl"
              interactive={false}
              asDiv={true}
              language={language}
            />
          )}
        </div>

        {/* Completed fused letter celebration view */}
        {isComplete ? (
          <div className="animate-pop-in relative z-20 flex flex-col items-center justify-center">
            <div className="animate-kid-bounce drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)] scale-120">
              {letterStyle === 'lore' ? (
                <AlphabetLoreAvatar
                  letter={letterChar}
                  size="xl"
                  interactive={true}
                  language={language}
                />
              ) : (
                <LetterAvatar
                  letterInfo={currentLetterInfo}
                  size="xl"
                  interactive={true}
                  status="celebrating"
                  language={language}
                />
              )}
            </div>
            <div className="mt-3 bg-emerald-500 text-white font-black text-sm sm:text-base px-5 py-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5" />
              <span>{language === 'nl' ? 'Puzzel Compleet! 🌟' : 'Puzzle Complete! 🌟'}</span>
            </div>
          </div>
        ) : (
          // In-progress puzzle slots on the board
          <div className="relative w-full h-full">
            {puzzleSlots.map((slot) => {
              const isFilled = placedPieces.includes(slot.id);
              const isSlotTarget = draggingPieceId === slot.id;

              return (
                <div
                  key={slot.id}
                  ref={(el) => {
                    slotsRef.current[slot.id] = el;
                  }}
                  onClick={() => !isFilled && handleSnapPiece(slot.id)}
                  style={{
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                    width: `${slot.width}%`,
                    height: `${slot.height}%`,
                  }}
                  className={`absolute rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isFilled
                      ? 'bg-transparent'
                      : isSlotTarget && isNearTarget
                      ? 'border-4 border-emerald-400 bg-emerald-400/30 scale-102 shadow-lg animate-pulse'
                      : 'border-2 border-dashed border-white/60 bg-black/15 hover:bg-white/20 cursor-pointer'
                  }`}
                >
                  {isFilled ? (
                    // Render the placed piece portion
                    <div
                      className="relative w-full h-full overflow-hidden animate-pop-in pointer-events-none"
                      style={{ clipPath: slot.clipPath }}
                    >
                      <div
                        className="absolute flex items-center justify-center"
                        style={{
                          left: slot.innerLeft,
                          top: slot.innerTop,
                          width: slot.innerWidth,
                          height: slot.innerHeight,
                        }}
                      >
                        {letterStyle === 'lore' ? (
                          <AlphabetLoreAvatar
                            letter={letterChar}
                            size="xl"
                            interactive={false}
                            asDiv={true}
                          />
                        ) : (
                          <LetterAvatar
                            letterInfo={currentLetterInfo}
                            size="xl"
                            interactive={false}
                            asDiv={true}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    // Empty slot target with guidance label
                    <div className="flex flex-col items-center justify-center opacity-60 pointer-events-none">
                      <span className="text-2xl font-black">🧩</span>
                      <span className="text-white/80 font-black text-xs sm:text-sm">
                        {slot.label}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Dragged Piece Preview (Renders right under the finger / pointer) */}
      {draggingPieceId !== null && dragPos && (
        <div
          style={{
            left: `${dragPos.x}px`,
            top: `${dragPos.y}px`,
          }}
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 scale-110 rotate-3 transition-transform duration-75"
        >
          <div
            className={`w-32 h-24 sm:w-40 sm:h-28 rounded-2xl bg-white text-indigo-950 flex flex-col items-center justify-center shadow-2xl border-4 ${
              isNearTarget
                ? 'border-emerald-400 ring-6 ring-emerald-300'
                : 'border-amber-400 ring-4 ring-amber-300/50'
            }`}
          >
            <span className="text-3xl font-black">
              🧩 {puzzleSlots[draggingPieceId]?.label || ''}
            </span>
            <span
              className="text-xs font-black px-2 py-0.5 rounded-full text-white mt-1"
              style={{ backgroundColor: currentLetterInfo.color }}
            >
              {letterChar}
            </span>
          </div>
        </div>
      )}

      {/* Celebration Next Level / Next Puzzle Banner */}
      {isComplete && (
        <div className="relative z-20 animate-pop-in flex items-center gap-2 my-1">
          {pieceCount < 4 && (
            <button
              onClick={handleNextLevel}
              className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-sm sm:text-base rounded-full shadow-[0_5px_0_#065f46] active:translate-y-1 active:shadow-none flex items-center gap-1.5 cursor-pointer transition-all animate-kid-bounce"
            >
              <span>{language === 'nl' ? `VOLGENDE NIVEAU (${pieceCount + 1} DELEN)! 🚀` : `NEXT LEVEL (${pieceCount + 1} PIECES)! 🚀`}</span>
            </button>
          )}

          <button
            onClick={handleRandomPuzzle}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm sm:text-base rounded-full shadow-[0_5px_0_#b45309] active:translate-y-1 active:shadow-none flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span>{language === 'nl' ? 'VOLGENDE LETTER! ✨' : 'NEXT LETTER! ✨'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Bottom Pieces Tray: DRAGGABLE PUZZLE PIECES (LARGE SCALE) */}
      <div className="relative z-10 w-full max-w-3xl bg-black/35 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2 sm:p-3 border-2 border-white/20 flex flex-col items-center flex-shrink-0">
        <div className="flex items-center justify-between w-full px-2 mb-1">
          <span className="text-[11px] sm:text-xs font-black text-white/95 flex items-center gap-1.5">
            <Puzzle className="w-4 h-4 text-amber-300 animate-spin" />
            <span>
              {language === 'nl'
                ? '👆 Pak en sleep de grote puzzelstukjes naar de letter:'
                : '👆 Grab and drag the big puzzle pieces onto the letter:'}
            </span>
          </span>

          <button
            onClick={() => setPlacedPieces([])}
            className="text-[11px] text-white/80 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{language === 'nl' ? 'Herstel' : 'Reset'}</span>
          </button>
        </div>

        {/* Scattered Draggable Puzzle Pieces Tray */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap w-full py-1">
          {puzzleSlots.map((slot) => {
            const isPlaced = placedPieces.includes(slot.id);
            const isBeingDragged = draggingPieceId === slot.id;

            return (
              <div
                key={slot.id}
                onPointerDown={(e) => handlePointerDown(slot.id, e)}
                onClick={() => !isPlaced && handleSnapPiece(slot.id)}
                className={`relative w-28 h-18 sm:w-36 sm:h-22 md:w-44 md:h-26 rounded-2xl flex flex-col items-center justify-center transition-all duration-150 select-none ${
                  isPlaced
                    ? 'opacity-20 pointer-events-none scale-90 translate-y-2'
                    : isBeingDragged
                    ? 'opacity-40 scale-95 border-2 border-dashed border-white'
                    : 'cursor-grab active:cursor-grabbing bg-white hover:bg-amber-100 hover:scale-105 active:scale-95 shadow-xl'
                }`}
                style={{
                  border: isPlaced ? '2px dashed rgba(255,255,255,0.4)' : '3px solid #ffffff',
                  boxShadow: isPlaced ? 'none' : '0 8px 0 rgba(0,0,0,0.3)',
                  touchAction: 'none',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-950">
                    🧩 {slot.label}
                  </span>
                  <span
                    className="text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg text-white"
                    style={{ backgroundColor: currentLetterInfo.color }}
                  >
                    {letterChar}
                  </span>
                </div>

                <span className="text-[10px] font-bold text-indigo-900/70 mt-0.5">
                  {language === 'nl' ? 'Sleep of tik mij!' : 'Drag or tap me!'}
                </span>

                {isPlaced && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 absolute -top-2 -right-2 fill-emerald-200" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Horizontal Letter Picker Strip A-Z */}
      <div className="relative z-10 w-full max-w-4xl flex items-center gap-1 overflow-x-auto scrollbar-none py-1 px-1 mt-0.5">
        {ALPHABET_DATA.map((item, idx) => (
          <button
            key={item.letter}
            onClick={() => startPuzzle(idx)}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm transition-all cursor-pointer flex-shrink-0 ${
              currentIdx === idx
                ? 'bg-amber-400 text-amber-950 scale-110 shadow-md ring-2 ring-white font-black'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {item.letter}
          </button>
        ))}
      </div>
    </div>
  );
}
