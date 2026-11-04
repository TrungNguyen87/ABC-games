import React from 'react';
import { X, Volume2, Check, Sparkles, Heart } from 'lucide-react';
import { VoiceStyle, Language } from '../types/game';
import { sounds } from '../utils/soundEffects';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: VoiceStyle;
  onSelectStyle: (style: VoiceStyle) => void;
  language: Language;
}

export default function VoiceSettingsModal({
  isOpen,
  onClose,
  currentStyle,
  onSelectStyle,
  language,
}: VoiceSettingsModalProps) {
  if (!isOpen) return null;

  const voiceOptions: {
    id: VoiceStyle;
    titleNl: string;
    titleEn: string;
    descNl: string;
    descEn: string;
    badgeNl: string;
    badgeEn: string;
    avatar: string;
  }[] = [
    {
      id: 'soft-lady',
      titleNl: 'Zachte & Lieve Juf (Jonge Vrouw)',
      titleEn: 'Soft & Smooth Young Lady',
      descNl: 'Zachte, rustige en warme stem voor peuters. Zeer vriendelijk en kalm.',
      descEn: 'Softer, smoother, warm young lady voice tailored for preschoolers.',
      badgeNl: 'Aanbevolen ⭐',
      badgeEn: 'Recommended ⭐',
      avatar: '🌸👩‍🏫',
    },
    {
      id: 'sweet-story',
      titleNl: 'Gezellig Verhaaltjes',
      titleEn: 'Cozy Storyteller',
      descNl: 'Heerlijk ontspannen en rustig, alsof er een prentenboek wordt voorgelezen.',
      descEn: 'Relaxed, comforting bedtime story tone.',
      badgeNl: 'Rustig 🧸',
      badgeEn: 'Calm 🧸',
      avatar: '📖🧸',
    },
    {
      id: 'cheerful',
      titleNl: 'Vrolijke Speelmaat',
      titleEn: 'Playful Buddy',
      descNl: 'Vrolijk, enthousiast en energiek.',
      descEn: 'Upbeat, bright and cheerful preschool buddy.',
      badgeNl: 'Vrolijk ✨',
      badgeEn: 'Peppy ✨',
      avatar: '🎉✨',
    },
  ];

  const handleTestVoice = (style: VoiceStyle) => {
    sounds.setVoiceStyle(style);
    onSelectStyle(style);
    sounds.playChime();

    if (language === 'nl') {
      if (style === 'soft-lady') {
        sounds.speak(
          'Hoi lieverd! Ik ben jouw lieve juf. Zullen we samen gezellig leren en spelen?',
          'nl'
        );
      } else if (style === 'sweet-story') {
        sounds.speak(
          'Er was eens een klein eekhoorntje in het herfstbos...',
          'nl'
        );
      } else {
        sounds.speak(
          'Hallo vriendje! Kom, we gaan samen op avontuur!',
          'nl'
        );
      }
    } else {
      if (style === 'soft-lady') {
        sounds.speak(
          "Hello sweetheart! I am your gentle teacher. Let's learn and play together softly!",
          'en'
        );
      } else if (style === 'sweet-story') {
        sounds.speak(
          'Once upon a time in the cozy autumn woods...',
          'en'
        );
      } else {
        sounds.speak(
          "Hi little buddy! Let's have so much fun together!",
          'en'
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in select-none">
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border-4 border-yellow-400 p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playPop();
            onClose();
          }}
          className="absolute top-5 right-5 w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center text-2xl">
            👩‍🏫
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {language === 'nl' ? 'Kies een Stem' : 'Choose Voice'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {language === 'nl'
                ? 'Zachte, rustige en lieve stem voor kinderen'
                : 'Softer, smoother and gentle preschool voices'}
            </p>
          </div>
        </div>

        {/* Voice Option Cards */}
        <div className="space-y-3">
          {voiceOptions.map((opt) => {
            const isSelected = currentStyle === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => handleTestVoice(opt.id)}
                className={`p-4 rounded-3xl border-3 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-yellow-400 bg-amber-50/60 shadow-md ring-2 ring-yellow-300'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{opt.avatar}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base sm:text-lg text-slate-900">
                        {language === 'nl' ? opt.titleNl : opt.titleEn}
                      </span>
                      <span className="text-[10px] font-black bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                        {language === 'nl' ? opt.badgeNl : opt.badgeEn}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'nl' ? opt.descNl : opt.descEn}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestVoice(opt.id);
                  }}
                  className="shrink-0 w-10 h-10 rounded-full bg-yellow-400 hover:bg-yellow-300 text-yellow-950 flex items-center justify-center shadow active:scale-95 transition-transform"
                  title="Luister / Listen"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {language === 'nl'
              ? 'Tik op een stem om meteen te luisteren! 🎧'
              : 'Tap a voice to preview instantly! 🎧'}
          </span>
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="px-6 py-2 bg-yellow-400 text-yellow-950 font-black rounded-full shadow-[0_4px_0_#ca8a04] active:translate-y-1 cursor-pointer text-sm"
          >
            {language === 'nl' ? 'Klaar! ✓' : 'Done! ✓'}
          </button>
        </div>
      </div>
    </div>
  );
}
