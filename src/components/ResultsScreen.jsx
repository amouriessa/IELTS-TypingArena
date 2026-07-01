import React, { useEffect, useState } from 'react';
import { RefreshCw, ArrowLeft, Trophy, AlertTriangle, BookOpen, Volume2, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import SoundManager from './SoundManager';

export default function ResultsScreen({ results, onRetry, onPracticeMissed, onBackHome, definitionCache = {} }) {
  const { wpm, rawWpm, accuracy, errors, correctChars, totalChars, missedWords } = results;
  const [expandedWord, setExpandedWord] = useState(null);

  // Trigger success chimes & confetti if stats are good
  useEffect(() => {
    if (accuracy >= 90 && wpm >= 30) {
      SoundManager.playSuccess();
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [wpm, accuracy]);

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Status message based on accuracy/speed
  const getStatusMessage = () => {
    if (accuracy >= 95 && wpm >= 50) return { title: 'Typing Master!', subtitle: 'Phenomenal speed and pristine accuracy.', color: 'text-emerald-400' };
    if (accuracy >= 90 && wpm >= 35) return { title: 'Great Job!', subtitle: 'Well done! You are learning fast.', color: 'text-indigo-400' };
    return { title: 'Keep Practicing!', subtitle: 'Focus on accuracy first, then speed will follow.', color: 'text-amber-400' };
  };

  const status = getStatusMessage();

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in">
      {/* Header Feedback Card */}
      <div className="bg-light-cream backdrop-blur-xl border-2 border-dark-maroon p-6 flex flex-col md:flex-row items-center justify-between gap-6 glow-primary">
        <div className="flex items-center gap-4">
          <div className="p-8">
            <div className="trophy-wrap">
              <div className="trophy"></div>
            </div>
          </div>
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${status.color}`}>{status.title}</h1>
            <p className="text-xs text-dark-maroon mt-1">{status.subtitle}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2 font-bold text-sm bg-dark-maroon text-soft-mustard shadow-lg shadow-dark-maroon/30 hover:bg-darker-maroon active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw size={15} />
            Practice Again
          </button>

          {missedWords.length > 0 && (
            <button
              onClick={onPracticeMissed}
              className="flex items-center gap-2 px-5 py-2 font-bold text-sm bg-soft-pink text-dark-maroon border border-dark-maroon hover:border-darker-maroon/60 active:scale-95 transition-all cursor-pointer"
            >
              <AlertTriangle size={15} />
              Practice Missed Words ({missedWords.length})
            </button>
          )}

          <button
            onClick={onBackHome}
            className="flex items-center gap-2 px-5 py-2 font-bold text-sm bg-soft-mustard text-dark-maroon hover:text-darker-maroon active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft size={15} />
            Back to Config
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* WPM */}
        <div className="bg-dark-maroon backdrop-blur-md p-5 text-center">
          <span className="text-[10px] font-bold text-soft-mustard uppercase tracking-wider block">Net WPM</span>
          <span className="text-4xl font-mono font-extrabold text-sky-blue block mt-1">{wpm}</span>
          <span className="text-xs text-light-cream block mt-1">speed metric</span>
        </div>

        {/* Accuracy */}
        <div className="bg-dark-maroon backdrop-blur-md p-5 text-center">
          <span className="text-[10px] font-bold text-soft-mustard uppercase tracking-wider block">Accuracy</span>
          <span className="text-4xl font-mono font-extrabold text-sky-blue block mt-1">{accuracy}%</span>
          <span className="text-xs text-light-cream block mt-1">target 95%+</span>
        </div>

        {/* Raw Speed */}
        <div className="bg-dark-maroon backdrop-blur-md p-5 text-center">
          <span className="text-[10px] font-bold text-soft-mustard uppercase tracking-wider block">Raw WPM</span>
          <span className="text-4xl font-mono font-extrabold text-sky-blue block mt-1">{rawWpm}</span>
          <span className="text-xs text-light-cream block mt-1">all keystrokes</span>
        </div>

        {/* Errors Breakdown */}
        <div className="bg-dark-maroon backdrop-blur-md p-5 text-center">
          <span className="text-[10px] font-bold text-soft-mustard uppercase tracking-wider block">Mistakes</span>
          <span className="text-4xl font-mono font-extrabold text-sky-blue block mt-1">{errors}</span>
          <span className="text-xs text-light-cream block mt-1">
            {correctChars}/{totalChars} keys
          </span>
        </div>
      </div>

      {/* Vocabulary Review Section */}
      <div className="bg-light-cream backdrop-blur-xl border-2 border-dark-maroon p-6">
        <h2 className="text-lg font-bold text-dark-maroon mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-dark-maroon" />
          IELTS Vocabulary Review List
        </h2>

        {missedWords.length > 0 ? (
          <div className="mb-4 p-3.5 bg-soft-pink border-2 border-dark-maroon rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="text-dark-maroon shrink-0 mt-0.5" size={16} />
            <div className="text-xs text-dark-maroon">
              <span className="font-bold text-darker-maroon">Target learning recommendation:</span> You had spelling mistakes in the following words. Click on them to view definitions, or use the <strong className="text-darker-maroon">"Practice Missed Words"</strong> button above to re-type just these words.
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3.5 bg-sky-blue border border-dark-maroon rounded-xl flex items-start gap-2.5">
            <Trophy className="text-dark-blue shrink-0 mt-0.5" size={16} />
            <div className="text-xs text-super-dark-blue">
              <span className="font-bold text-dark-blue">Perfect Vocabulary Spelling!</span> You typed every single IELTS word correctly during this session.
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-2">
          {missedWords.map((wordObj, idx) => {
            const isExpanded = expandedWord === wordObj.word;
            const cached = definitionCache[wordObj.word] || {
              ipa: `/${wordObj.word}/`,
              definition: "Definition details not cached.",
              example: ""
            };
            return (
              <div
                key={wordObj.word + '-' + idx}
                className={`bg-soft-mustard border-2 rounded-xl overflow-hidden transition-all duration-200 ${isExpanded ? 'border-dark-maroon bg-dark-mustard' : 'border-dark-maroon hover:border-darker-maroon'
                  }`}
              >
                {/* Accordion Trigger */}
                <div
                  onClick={() => setExpandedWord(isExpanded ? null : wordObj.word)}
                  className="flex items-center justify-between p-3.5 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-dark-maroon">{wordObj.word}</span>
                    <span className="text-xs font-mono text-super-dark-blue">{cached.ipa}</span>
                    <span className="text-[10px] font-bold text-light-cream bg-coral px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Mistyped
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-dark-maroon bg-light-cream px-2.5 py-0.5 rounded border border-dark-maroon">
                      Band {wordObj.band}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(wordObj.word);
                      }}
                      className="p-1.5 rounded-full bg-light-cream text-dark-maroon hover:text-darker-maroon hover:bg-white transition border border-dark-maroon"
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="p-4 border-t border-dark-maroon bg-dark-mustard text-sm flex flex-col gap-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-dark-maroon uppercase tracking-wider block mb-0.5">Definition ({wordObj.type})</span>
                      <p className="text-light-cream">{cached.definition}</p>
                    </div>
                    {cached.example && (
                      <div>
                        <span className="text-[10px] font-bold text-dark-maroon uppercase tracking-wider block mb-0.5">Example Sentence</span>
                        <p className="text-light-cream italic">"{cached.example}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Render other words typed correctly */}
          {results.totalChars > 0 &&
            results.missedWords
              .filter(w => !missedWords.some(mw => mw.word === w.word)) // Filter out duplicates
              // Just display a few other successfully typed words for review if any
              .map((wordObj, idx) => {
                const isExpanded = expandedWord === wordObj.word;
                const cached = definitionCache[wordObj.word] || {
                  ipa: `/${wordObj.word}/`,
                  definition: "Definition details not cached.",
                  example: ""
                };
                return (
                  <div
                    key={wordObj.word + '-correct-' + idx}
                    className={`bg-slate-900/10 border rounded-xl overflow-hidden transition-all duration-200 ${isExpanded ? 'border-indigo-500/30 bg-slate-900/60' : 'border-slate-850/40 hover:border-slate-800/60'
                      }`}
                  >
                    <div
                      onClick={() => setExpandedWord(isExpanded ? null : wordObj.word)}
                      className="flex items-center justify-between p-3.5 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-400">{wordObj.word}</span>
                        <span className="text-xs font-mono text-slate-600">{cached.ipa}</span>
                        <span className="text-[10px] font-bold text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wide">
                          Correct
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-600 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-900">
                          Band {wordObj.band}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(wordObj.word);
                          }}
                          className="p-1.5 rounded-lg bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                          <Volume2 size={13} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-slate-800/60 bg-slate-950/20 text-sm flex flex-col gap-2.5">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Definition ({wordObj.type})</span>
                          <p className="text-slate-300">{cached.definition}</p>
                        </div>
                        {cached.example && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Example Sentence</span>
                            <p className="text-slate-400 italic">"{cached.example}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
