import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Play, RotateCcw, AlertCircle, VolumeX, Volume2 } from 'lucide-react';
import SoundManager from './SoundManager';
import WordDetails from './WordDetails';
import VirtualKeyboard from './VirtualKeyboard';
import { fetchWordDetails } from '../utils/vocabHelper';

export default function TypingArena({
  wordsList,
  duration,
  soundProfile,
  soundEnabled,
  autoPlayAudio,
  showTranslation = true,
  definitionCache,
  setDefinitionCache,
  onSessionComplete
}) {
  // Test states
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [words, setWords] = useState([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [typedChars, setTypedChars] = useState(''); // input of active word
  const [completedWordsInput, setCompletedWordsInput] = useState([]); // array of strings typed for past words
  const [isFocused, setIsFocused] = useState(true);

  // Performance tracking
  const [correctCharCount, setCorrectCharCount] = useState(0);
  const [totalCharCount, setTotalCharCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [missedWords, setMissedWords] = useState(new Set()); // keeps track of words with errors

  // Refs
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const arenaRef = useRef(null);
  const finishSessionRef = useRef(null);
  const wordStreamRef = useRef(null);
  const prefetchingRef = useRef(new Set());

  // Keep the ref pointing to the latest version of finishSession
  useEffect(() => {
    finishSessionRef.current = finishSession;
  });

  // Initialize/Reset session
  useEffect(() => {
    resetTest();
    return () => clearInterval(timerRef.current);
  }, [wordsList, duration]);

  const resetTest = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    
    // Shuffle and pick words
    const shuffled = [...wordsList].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setCurrentWordIdx(0);
    setTypedChars('');
    setCompletedWordsInput([]);
    setStarted(false);
    setTimeLeft(duration === 'zen' ? 0 : duration);
    setElapsedTime(0);
    setCorrectCharCount(0);
    setTotalCharCount(0);
    setErrorCount(0);
    setMissedWords(new Set());
    if (wordStreamRef.current) {
      wordStreamRef.current.scrollTop = 0;
    }
    prefetchingRef.current = new Set();
    
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  // Timer logic
  useEffect(() => {
    if (started) {
      if (duration === 'zen') {
        timerRef.current = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000);
      } else if (timeLeft > 0) {
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              if (finishSessionRef.current) {
                finishSessionRef.current();
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
    return () => clearInterval(timerRef.current);
  }, [started, duration, timeLeft]);

  // Scroll active word into view
  useEffect(() => {
    if (wordStreamRef.current) {
      const activeEl = wordStreamRef.current.querySelector('.active-word');
      if (activeEl) {
        const container = wordStreamRef.current;
        const activeTop = activeEl.offsetTop;
        const activeHeight = activeEl.offsetHeight;
        const containerHeight = container.clientHeight;
        const containerScrollTop = container.scrollTop;

        // If the active word is below the visible area of the container
        if (activeTop + activeHeight > containerScrollTop + containerHeight) {
          container.scrollTo({
            top: activeTop - containerHeight / 2 + activeHeight / 2,
            behavior: 'smooth'
          });
        } 
        // If the active word is above the visible area of the container (e.g. on restart)
        else if (activeTop < containerScrollTop) {
          container.scrollTo({
            top: activeTop,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [currentWordIdx]);

  // Pre-fetch upcoming words in the background (current word + next 3 words)
  useEffect(() => {
    if (!words || words.length === 0) return;

    const prefetchRange = 3;
    for (let i = 0; i <= prefetchRange; i++) {
      const nextIdx = currentWordIdx + i;
      if (nextIdx < words.length) {
        const nextWordObj = words[nextIdx];
        const nextWord = nextWordObj.word;
        const nextType = nextWordObj.type;

        if (!definitionCache[nextWord] && !prefetchingRef.current.has(nextWord)) {
          prefetchingRef.current.add(nextWord);
          fetchWordDetails(nextWord, nextType).then((details) => {
            setDefinitionCache((prev) => ({
              ...prev,
              [nextWord]: details
            }));
            prefetchingRef.current.delete(nextWord);
          }).catch(() => {
            prefetchingRef.current.delete(nextWord);
          });
        }
      }
    }
  }, [currentWordIdx, words, definitionCache, setDefinitionCache]);

  const finishSession = (finalCompleted = completedWordsInput, finalTyped = typedChars) => {
    // Calculate final stats
    // Calculate how many total correct characters were typed
    // Every 5 characters is 1 word in typing metrics
    const finalTimeElapsed = duration === 'zen' ? elapsedTime : (duration - timeLeft);
    const activeTimeElapsed = finalTimeElapsed > 0 ? finalTimeElapsed : 1; // avoid division by 0
    const timeInMinutes = activeTimeElapsed / 60;
    
    // We compute total correct characters from scratch
    let totalCorrect = 0;
    let totalTyped = 0;
    const finalMissed = [];

    finalCompleted.forEach((typed, idx) => {
      const target = words[idx]?.word || '';
      let wordHadError = false;
      for (let i = 0; i < typed.length; i++) {
        totalTyped++;
        if (typed[i] === target[i]) {
          totalCorrect++;
        } else {
          wordHadError = true;
        }
      }
      // If they typed less characters than target
      if (typed.length < target.length) {
        wordHadError = true;
      }
      if (wordHadError && words[idx]) {
        finalMissed.push(words[idx]);
      }
    });

    // Add currently typing word progress
    for (let i = 0; i < finalTyped.length; i++) {
      totalTyped++;
      if (finalTyped[i] === words[currentWordIdx]?.word[i]) {
        totalCorrect++;
      } else {
        if (words[currentWordIdx]) {
          const alreadyIn = finalMissed.some(w => w.word === words[currentWordIdx].word);
          if (!alreadyIn) finalMissed.push(words[currentWordIdx]);
        }
      }
    }

    const calculatedWpm = Math.round((totalCorrect / 5) / timeInMinutes);
    const rawWpm = Math.round((totalTyped / 5) / timeInMinutes);
    const accuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 0;

    onSessionComplete({
      wpm: calculatedWpm,
      rawWpm: rawWpm,
      accuracy: accuracy,
      errors: errorCount,
      correctChars: totalCorrect,
      totalChars: totalTyped,
      missedWords: finalMissed
    });
  };

  // Input keystroke handler
  const handleInputChange = (e) => {
    const val = e.target.value;
    
    // Start session on first keypress
    if (!started) {
      setStarted(true);
    }

    const targetWord = words[currentWordIdx]?.word || '';
    
    // Check if backspaced
    const isBackspace = val.length < typedChars.length;
    
    if (!isBackspace && val.length > 0) {
      const lastTypedChar = val[val.length - 1];
      const targetChar = targetWord[val.length - 1];

      if (lastTypedChar === targetChar) {
        SoundManager.playKey();
      } else {
        SoundManager.playError();
        setErrorCount((p) => p + 1);
        // Track missed word
        if (words[currentWordIdx]) {
          setMissedWords((prev) => new Set([...prev, words[currentWordIdx].word]));
        }
      }
    } else if (isBackspace) {
      SoundManager.playKey();
    }

    setTypedChars(val);
  };

  // Intercept Spacebar to advance words
  const handleKeyDown = (e) => {
    if (e.key === ' ' && typedChars.length > 0) {
      e.preventDefault();
      // Advance to next word
      const currentTarget = words[currentWordIdx]?.word || '';
      
      // Save current input to completed array
      const newCompleted = [...completedWordsInput, typedChars];
      setCompletedWordsInput(newCompleted);

      // Reset active word input
      setTypedChars('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }

      // Check if we hit the end of the word list
      if (currentWordIdx + 1 >= words.length) {
        clearInterval(timerRef.current);
        finishSession(newCompleted, '');
      } else {
        setCurrentWordIdx((prev) => prev + 1);
      }
      SoundManager.playKey();
    }
  };

  const handleArenaClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const activeWord = words[currentWordIdx] || null;
  const nextCharNeeded = activeWord
    ? typedChars.length < activeWord.word.length
      ? activeWord.word[typedChars.length]
      : ' ' // spacebar when word is complete
    : '';

  // WPM Real-time calculation helper
  const getRealtimeWpm = () => {
    const timeElapsed = duration === 'zen' ? elapsedTime : (duration - timeLeft);
    if (timeElapsed === 0) return 0;
    
    let totalCorrect = 0;
    completedWordsInput.forEach((typed, idx) => {
      const target = words[idx]?.word || '';
      for (let i = 0; i < typed.length; i++) {
        if (typed[i] === target[i]) totalCorrect++;
      }
    });
    for (let i = 0; i < typedChars.length; i++) {
      if (typedChars[i] === words[currentWordIdx]?.word[i]) totalCorrect++;
    }

    return Math.round((totalCorrect / 5) / (timeElapsed / 60));
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Top Header stats */}
      <div className="flex justify-between items-center bg-darker-maroon backdrop-blur-md p-4 border border-dark-mustard glow-primary">
        <div className="flex items-center gap-6">
          {/* Time Remaining / Elapsed */}
          <div>
            <span className="text-[10px] font-bold text-dark-mustard uppercase tracking-wider block">
              {duration === 'zen' ? 'Time Elapsed' : 'Time Left'}
            </span>
            <span className="text-xl font-mono text-soft-pink">
              {duration === 'zen' ? `${elapsedTime}s` : `${timeLeft}s`}
            </span>
          </div>
          {/* Real-time WPM */}
          <div>
            <span className="text-[10px] font-bold text-dark-mustard uppercase tracking-wider block">Live WPM</span>
            <span className="text-xl font-mono text-soft-pink">{getRealtimeWpm()}</span>
          </div>
          {/* Progress */}
          <div>
            <span className="text-[10px] font-bold text-dark-mustard uppercase tracking-wider block">Progress</span>
            <span className="text-xl font-mono text-soft-pink">
              {currentWordIdx}/{words.length} words
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {duration === 'zen' && started && (
            <button
              onClick={() => finishSession()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-light-cream bg-coral border border-slate-800 hover:bg-coral/80 rounded-xl active:scale-95 transition-all cursor-pointer animate-fade-in"
            >
              Finish Practice
            </button>
          )}
          {/* Restart Button */}
          <button
            onClick={resetTest}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-darker-maroon bg-dark-mustard border border-slate-800 hover:border-dark-maroon hover:text-light-cream rounded-xl active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={13} />
            Restart
          </button>
        </div>
      </div>

      {/* Typing Arena Block */}
      <div
        ref={arenaRef}
        onClick={handleArenaClick}
        className={`relative bg-light-cream backdrop-blur-xl border-2 p-8 min-h-[14rem] flex flex-col justify-center cursor-text transition-all duration-300 ${
          isFocused ? 'border-dark-maroon/80' : 'border-dark-maroon/20 bg-red-950/5'
        }`}
      >
        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="text"
          value={typedChars}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute opacity-0 pointer-events-none w-0 h-0"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
        />

        {/* Focus Blur Overlay */}
        {!isFocused && (
          <div className="absolute inset-0 bg-dark-mustard/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30 transition-all">
            <AlertCircle className="text-light-cream animate-bounce" size={32} />
            <div className="text-lg font-semibold text-light-cream">Out of Focus</div>
            <div className="text-xs text-light-cream">Click anywhere inside the box or press any key to resume typing.</div>
          </div>
        )}

        {/* Word Stream Container */}
        <div ref={wordStreamRef} className="flex flex-wrap gap-x-4 gap-y-3 text-lg md:text-xl font-mono leading-relaxed select-none overflow-y-hidden max-h-32 scroll-smooth">
          {words.map((wordObj, wordIdx) => {
            const isCurrent = wordIdx === currentWordIdx;
            const isPast = wordIdx < currentWordIdx;
            const hasError = missedWords.has(wordObj.word);

            // Calculate styling for characters
            return (
              <span
                key={wordObj.word + '-' + wordIdx}
                className={`relative px-1 py-0.5 rounded transition-all duration-150 ${
                  isCurrent ? 'bg-dark-maroon/30 border-b-2 border-dark-maroon/30 scale-102 active-word' : ''
                } ${isPast && hasError ? 'border-b border-red-500/30' : ''}`}
              >
                {wordObj.word.split('').map((char, charIdx) => {
                  let charClass = 'text-slate-600 char-transition'; // Untyped default
                  let isCaretHere = false;

                  if (isCurrent) {
                    if (charIdx === typedChars.length) {
                      isCaretHere = true;
                    }
                    
                    if (charIdx < typedChars.length) {
                      const typedChar = typedChars[charIdx];
                      charClass = typedChar === char
                        ? 'text-coral font-medium' // Correct
                        : 'text-red-400 underline decoration-red-500 decoration-2 font-medium'; // Incorrect
                    }
                  } else if (isPast) {
                    // Match characters typed vs target
                    const pastTyped = completedWordsInput[wordIdx] || '';
                    const typedChar = pastTyped[charIdx];
                    charClass = typedChar === char ? 'text-coral' : 'text-red-500/80';
                  }

                  return (
                    <span key={charIdx} className={`relative ${charClass}`}>
                      {/* Caret visual representation */}
                      {isCaretHere && isFocused && (
                        <span className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-dark-maroon animate-caret-blink" />
                      )}
                      {char}
                    </span>
                  );
                })}

                {/* Extra character handling typed past the target word length */}
                {isCurrent && typedChars.length > wordObj.word.length && (
                  <span className="text-red-400 underline decoration-red-500 decoration-2 font-medium">
                    {typedChars.substring(wordObj.word.length).split('').map((char, extraIdx) => (
                      <span key={extraIdx} className="relative">
                        {extraIdx + wordObj.word.length === typedChars.length && isFocused && (
                          <span className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-indigo-400 animate-caret-blink" />
                        )}
                        {char}
                      </span>
                    ))}
                  </span>
                )}

                {/* caret helper for spacebar at end of active word */}
                {isCurrent && typedChars.length === wordObj.word.length && isFocused && (
                  <span className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-[4px] h-[70%] bg-indigo-400 animate-caret-blink" />
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* IELTS Word Dictionary Card (Below Typing Arena) */}
      <WordDetails
        wordInfo={activeWord}
        autoPlayEnabled={autoPlayAudio}
        playbackRate={1.0}
        showTranslation={showTranslation}
        definitionCache={definitionCache}
        setDefinitionCache={setDefinitionCache}
      />

      {/* Interactive 10-Finger QWERTY Helper */}
      <VirtualKeyboard nextChar={nextCharNeeded} />
    </div>
  );
}
