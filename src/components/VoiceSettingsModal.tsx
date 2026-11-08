import React, { useEffect, useState } from 'react';
import { X, Volume2, AlertTriangle, Mic } from 'lucide-react';
import { VoiceStyle, Language } from '../types/game';
import { sounds } from '../utils/soundEffects';
import { voiceQuality } from '../utils/voiceSelection';

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
  // Browsers load their voice list asynchronously; re-render when it arrives or the choice changes.
  const [, setVoiceTick] = useState(0);
  useEffect(() => sounds.voices.subscribe(() => setVoiceTick((n) => n + 1)), []);

  if (!isOpen) return null;

  const isNl = language === 'nl';
  const voiceEngine = sounds.voices;
  const availableVoices = voiceEngine.getVoicesFor(language);
  const activeVoice = voiceEngine.getVoiceFor(language);
  const activeQuality = activeVoice ? voiceQuality(activeVoice) : null;
  const preferredURI = voiceEngine.getPreferredVoiceURI(language);

  const handlePickVoice = (voiceURI: string) => {
    voiceEngine.setPreferredVoice(language, voiceURI || null);
    sounds.playChime();
    sounds.speak(
      isNl ? 'Hoi! Zo klink ik. Wat vind je ervan?' : 'Hi! This is how I sound. Do you like it?',
      language
    );
  };

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

        {/* Which voice is actually speaking, and a hint when it could sound better */}
        <div className="mt-4 rounded-2xl bg-slate-50 border-2 border-slate-100 p-3">
          <div className="flex items-center gap-2 text-sm font-black text-slate-800">
            <Mic className="w-4 h-4 text-pink-500" />
            {isNl ? 'Stem op dit apparaat' : 'Voice on this device'}
          </div>

          {!voiceEngine.isSupported() ? (
            <p className="mt-2 text-xs text-amber-700 flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {isNl
                ? 'Deze browser kan niet voorlezen. Probeer Chrome, Edge of Safari.'
                : 'This browser cannot read aloud. Try Chrome, Edge or Safari.'}
            </p>
          ) : !activeVoice ? (
            <p className="mt-2 text-xs text-amber-700 flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {isNl
                ? 'Geen Nederlandse stem gevonden. Installeer een Nederlandse stem in de instellingen van je apparaat (bijvoorbeeld bij Toegankelijkheid › Gesproken inhoud). Microsoft Edge heeft ook zeer natuurlijke Nederlandse stemmen.'
                : 'No English voice found. Install an English voice in your device settings (for example under Accessibility › Spoken Content).'}
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs text-slate-600 break-words">
                {activeVoice.name} <span className="text-slate-400">({activeVoice.lang})</span>
              </p>
              {activeQuality === 'robotic' || activeQuality === 'standard' ? (
                <p className="mt-1 text-[11px] text-slate-500">
                  {isNl
                    ? 'Tip: kies hieronder een stem met “Natural”, “Premium” of “Enhanced” in de naam voor een natuurlijker geluid.'
                    : 'Tip: pick a voice with “Natural”, “Premium” or “Enhanced” in its name below for more natural sound.'}
                </p>
              ) : null}
            </>
          )}

          {availableVoices.length > 1 && (
            <label className="mt-2 block text-xs font-bold text-slate-600">
              {isNl ? 'Andere stem kiezen' : 'Choose another voice'}
              <select
                value={preferredURI ?? ''}
                onChange={(e) => handlePickVoice(e.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-800"
              >
                <option value="">
                  {isNl ? 'Automatisch (beste stem)' : 'Automatic (best voice)'}
                </option>
                {availableVoices.map((v) => {
                  const q = voiceQuality(v);
                  const star = q === 'neural' ? '★★ ' : q === 'high' ? '★ ' : '';
                  return (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {star}
                      {v.name} ({v.lang})
                    </option>
                  );
                })}
              </select>
            </label>
          )}
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
