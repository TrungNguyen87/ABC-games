import React, { useState, useEffect, useRef } from 'react';
import { ALPHABET_DATA } from '../../data/alphabetData';
import { LetterInfo, Language } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { Sparkles, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';

interface LetterTraceGameProps {
  onEarnStar: () => void;
  onUnlockSticker?: (letter: string) => void;
  language: Language;
}

export default function LetterTraceGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: LetterTraceGameProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isCaseUpper, setIsCaseUpper] = useState(true);
  const [tracedPoints, setTracedPoints] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const hitPointsRef = useRef<Set<number>>(new Set());
  const isCompleteRef = useRef(false);

  const letterInfo: LetterInfo = ALPHABET_DATA[currentIdx];
  const waypoints = letterInfo.pathPoints || [
    { x: 30, y: 20 },
    { x: 30, y: 80 },
    { x: 70, y: 20 },
    { x: 70, y: 80 },
  ];

  const letterWord = language === 'nl' ? letterInfo.wordNl || letterInfo.word : letterInfo.word;

  // Reset canvas on letter change
  useEffect(() => {
    hitPointsRef.current.clear();
    isCompleteRef.current = false;
    setTracedPoints([]);
    setIsComplete(false);
    clearCanvas();
    if (language === 'nl') {
      sounds.speak(`Laten we de letter ${letterInfo.letter} tekenen!`, 'nl');
    } else {
      sounds.speak(`Let's trace the letter ${letterInfo.letter}!`, 'en');
    }
  }, [currentIdx, isCaseUpper, language]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleComplete = () => {
    setIsComplete(true);
    sounds.playCheer();
    fireConfettiBurst();
    onEarnStar();
    if (onUnlockSticker) onUnlockSticker(letterInfo.letter);

    if (language === 'nl') {
      sounds.speak(
        `Hoera! Je hebt de letter ${letterInfo.letter} getekend! ${letterInfo.letter} is voor ${letterWord}!`,
        'nl'
      );
    } else {
      sounds.speak(
        `Hooray! You traced the letter ${letterInfo.letter}! ${letterInfo.letter} is for ${letterWord}!`,
        'en'
      );
    }
  };

  const checkWaypointHit = (canvasX: number, canvasY: number, width: number, height: number) => {
    if (isCompleteRef.current) return;

    waypoints.forEach((wp, index) => {
      const targetX = (wp.x / 100) * width;
      const targetY = (wp.y / 100) * height;
      const distance = Math.hypot(canvasX - targetX, canvasY - targetY);

      if (distance < 45 && !hitPointsRef.current.has(index)) {
        hitPointsRef.current.add(index);
        sounds.playSparkle();
        setTracedPoints(Array.from(hitPointsRef.current));

        if (hitPointsRef.current.size >= waypoints.length && !isCompleteRef.current) {
          isCompleteRef.current = true;
          handleComplete();
        }
      }
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    drawSparkle(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    drawSparkle(e);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  const drawSparkle = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    checkWaypointHit(x, y, canvas.width, canvas.height);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 26;

    const colors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    ctx.strokeStyle = chosenColor;
    ctx.shadowBlur = 15;
    ctx.shadowColor = chosenColor;

    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    if (Math.random() < 0.3) {
      sounds.playSparkle();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-2 px-4 max-w-4xl mx-auto select-none">
      {/* Top Bar with Letter Switcher */}
      <div className="w-full flex items-center justify-between mt-1 px-2">
        <button
          onClick={() => {
            sounds.playPop();
            setCurrentIdx((prev) => (prev > 0 ? prev - 1 : ALPHABET_DATA.length - 1));
          }}
          className="w-12 h-12 bg-white/40 hover:bg-white/60 text-slate-800 rounded-2xl flex items-center justify-center font-bold shadow-md active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-white/30 backdrop-blur-md px-5 py-1.5 rounded-full border-2 border-white/60 flex items-center gap-2">
            <span className="text-2xl font-black text-white drop-shadow">
              {language === 'nl' ? `Teken Letter ${letterInfo.letter}` : `Trace Letter ${letterInfo.letter}`}
            </span>
            <span className="text-2xl">{letterInfo.emoji}</span>
          </div>

          <button
            onClick={() => {
              sounds.playPop();
              setIsCaseUpper(!isCaseUpper);
            }}
            className="px-3 py-1.5 bg-yellow-400 text-yellow-950 font-black rounded-full shadow-md text-sm active:scale-95 cursor-pointer"
          >
            {isCaseUpper ? 'A → a' : 'a → A'}
          </button>
        </div>

        <button
          onClick={() => {
            sounds.playPop();
            setCurrentIdx((prev) => (prev < ALPHABET_DATA.length - 1 ? prev + 1 : 0));
          }}
          className="w-12 h-12 bg-white/40 hover:bg-white/60 text-slate-800 rounded-2xl flex items-center justify-center font-bold shadow-md active:scale-95 cursor-pointer"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Tracing Board / Chalkboard Area */}
      <div className="relative w-full max-w-md aspect-square bg-slate-900/90 rounded-[3rem] border-8 border-amber-300 shadow-2xl flex items-center justify-center overflow-hidden my-2">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Faint Dotted Guide Letter */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-[15rem] sm:text-[18rem] font-black pointer-events-none select-none transition-all
            ${isComplete ? 'animate-kid-wiggle text-yellow-300 drop-shadow-[0_0_30px_#facc15]' : 'text-white/20'}
          `}
        >
          {isCaseUpper ? letterInfo.letter : letterInfo.lower}
        </div>

        {/* Waypoint Guiding Stars */}
        {waypoints.map((wp, idx) => {
          const isHit = tracedPoints.includes(idx);
          return (
            <div
              key={idx}
              style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center font-black pointer-events-none transition-all duration-300
                ${isHit ? 'bg-emerald-400 scale-125 text-white' : 'bg-amber-400 text-amber-950 animate-pulse'}
              `}
            >
              {isHit ? '✓' : idx + 1}
            </div>
          );
        })}

        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair z-20"
        />

        {/* Complete Celebration Overlay */}
        {isComplete && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30 flex flex-col items-center justify-center animate-pop-in">
            <div className="text-6xl mb-2 animate-bounce">🌟</div>
            <div className="text-4xl font-black text-yellow-300 drop-shadow-lg mb-2">
              {language === 'nl' ? 'SUPER GOED!' : 'GREAT JOB!'}
            </div>
            <div className="text-xl font-bold text-white mb-4">
              {letterInfo.letter} {language === 'nl' ? 'is voor' : 'is for'} {letterWord} {letterInfo.emoji}
            </div>
            <button
              onClick={() => {
                sounds.playPop();
                setCurrentIdx((prev) => (prev < ALPHABET_DATA.length - 1 ? prev + 1 : 0));
              }}
              className="px-8 py-3 bg-emerald-400 text-emerald-950 font-black text-xl rounded-full shadow-[0_5px_0_#047857] active:scale-95 cursor-pointer"
            >
              {language === 'nl' ? 'Volgende Letter! ➔' : 'Next Letter! ➔'}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            sounds.playPop();
            hitPointsRef.current.clear();
            isCompleteRef.current = false;
            clearCanvas();
            setTracedPoints([]);
            setIsComplete(false);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/40 hover:bg-white/60 text-slate-800 font-bold rounded-full shadow active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>{language === 'nl' ? 'Wis & Opnieuw' : 'Clear & Try Again'}</span>
        </button>

        <button
          onClick={() =>
            sounds.speak(
              `${letterInfo.letter}! ${letterWord}!`,
              language
            )
          }
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-yellow-950 font-black rounded-full shadow-[0_4px_0_#ca8a04] active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span>{language === 'nl' ? 'Luister' : 'Hear Letter'}</span>
        </button>
      </div>
    </div>
  );
}
