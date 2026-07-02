import React, { useState, useEffect } from 'react';
import { Play, Volume2, VolumeX, Star, History, Settings, Award, Layers } from 'lucide-react';
import rawWordsList from './data/ieltsWordsRaw.json';
import TypingArena from './components/TypingArena';
import ResultsScreen from './components/ResultsScreen';
import SoundManager from './components/SoundManager';
import logo from './assets/typingArena.png';


export default function App() {
  // Screens: 'home' | 'typing' | 'results'
  const [screen, setScreen] = useState('home');

  // Configuration settings
  const [selectedBand, setSelectedBand] = useState('all'); // 'all' | '6.0' | '7.0' | '8.0+'
  const [duration, setDuration] = useState(30); // 15 | 30 | 60 | 90
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundProfile, setSoundProfile] = useState('classic'); // 'classic' | 'clicky' | 'bubble'
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);

  // Runtime states
  const [activeWords, setActiveWords] = useState([]);
  const [sessionResults, setSessionResults] = useState(null);
  const [personalBests, setPersonalBests] = useState([]);
  const [isPracticingMissed, setIsPracticingMissed] = useState(false);
  const [previousSessionMissed, setPreviousSessionMissed] = useState([]);
  const [definitionCache, setDefinitionCache] = useState({});

  // Load personal bests from localStorage on load
  useEffect(() => {
    const scores = localStorage.getItem('ielts_typing_bests');
    if (scores) {
      setPersonalBests(JSON.parse(scores));
    }
    // Set initial SoundManager state
    SoundManager.toggle(soundEnabled);
    SoundManager.soundProfile = soundProfile;
  }, []);

  // Synchronize sound settings with SoundManager
  useEffect(() => {
    SoundManager.toggle(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    SoundManager.soundProfile = soundProfile;
  }, [soundProfile]);

  // Start a standard typing session
  const startSession = () => {
    // Filter words by band
    let filtered = [...rawWordsList];
    if (selectedBand !== 'all') {
      filtered = rawWordsList.filter((w) => w.band === selectedBand);
    }

    // Pick 60 random words for the session (plenty for 15s to 90s tests)
    const sessionWords = [...filtered]
      .sort(() => Math.random() - 0.5)
      .slice(0, 60);

    setActiveWords(sessionWords);
    setIsPracticingMissed(false);
    setScreen('typing');
  };

  // Start typing session focusing only on mistyped words from previous session
  const startPracticeMissedSession = () => {
    if (previousSessionMissed.length > 0) {
      setActiveWords(previousSessionMissed);
      setIsPracticingMissed(true);
      setScreen('typing');
    }
  };

  // Callback when typing timer expires or list ends
  const handleSessionComplete = (results) => {
    setSessionResults(results);
    setPreviousSessionMissed(results.missedWords);
    setScreen('results');

    // Save score if it qualifies as a personal best (higher WPM/Accuracy)
    const newAttempt = {
      wpm: results.wpm,
      accuracy: results.accuracy,
      band: isPracticingMissed ? 'Review Mode' : selectedBand,
      duration: duration,
      date: new Date().toLocaleDateString()
    };

    const updatedBests = [...personalBests, newAttempt]
      .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy)
      .slice(0, 5); // Keep top 5 personal bests

    setPersonalBests(updatedBests);
    localStorage.setItem('ielts_typing_bests', JSON.stringify(updatedBests));
  };

  const clearHistory = () => {
    setPersonalBests([]);
    localStorage.removeItem('ielts_typing_bests');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-6 px-4 md:px-8 font-sans">
      {/* Top Navbar */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-4 mb-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen('home')}>
          <img src={logo} alt="Logo" className="h-10 w-10 object-contain rounded-xl" />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-dark-maroon flex items-center gap-1.5">
              IELTS Typing Arena
            </h1>
            <span className="text-[10px] text-darker-maroon font-medium block leading-none">Learn Vocab • Master Typing</span>
          </div>
        </div>

        {/* Global Sound Toggles in Nav */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full border transition-all cursor-pointer ${soundEnabled
                ? 'bg-light-cream text-dark-maroon border-dark-maroon hover:bg-light-cream/60'
                : 'bg-soft-mustard text-dark-maroon border-dark-maroon hover:bg-soft-mustard/60'
              }`}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      {/* Main Screen Router */}
      <main className="flex-grow flex items-center justify-center w-full py-4">
        {screen === 'home' && (
          <div className="w-full max-w-2xl flex flex-col gap-8 animate-fade-in">
            {/* Hero Brand Section */}
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-dark-maroon text-soft-mustard text-[10px] font-medium mb-4 uppercase">
                <Star size={10} />
                IELTS Writing & Vocabulary Booster
                <Star size={10} />
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-dark-maroon to-coral bg-clip-text text-transparent font-vt323">
                Type Fast.
              </h2>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-dark-maroon to-coral bg-clip-text text-transparent font-vt323">
                Talk like a Band 9.0.
              </h2>
              <p className="text-dark-maroon text-sm max-w-md mx-auto mt-3 leading-relaxed">
                Train your 10-finger muscle memory while digesting essential academic English vocabulary, phonetic spellings, and context usages.
              </p>
            </div>

            {/* Config Dashboard Card */}
            <div className="bg-light-cream backdrop-blur-xl border-2 border-dark-maroon p-6 md:p-8 flex flex-col gap-6 glow-primary">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-dark-maroon flex items-center gap-2">
                <Settings size={14} className="text-dark-maroon" />
                Session Configurations
              </h3>

              {/* Band selection */}
              <div>
                <span className="text-xs font-semibold text-dark-maroon block mb-2">Target Vocabulary Level</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'All Bands' },
                    { id: '6.0', label: 'Band 6.0' },
                    { id: '7.0', label: 'Band 7.0' },
                    { id: '8.0+', label: 'Band 8.0+' }
                  ].map((band) => (
                    <button
                      key={band.id}
                      onClick={() => setSelectedBand(band.id)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer ${selectedBand === band.id
                          ? 'bg-sky-blue border-dark-maroon text-darker-maroon shadow-md shadow-sky-blue/20'
                          : 'bg-soft-mustard/50 border-dark-maroon text-coral hover:text-coral hover:border-dark-maroon'
                        }`}
                    >
                      {band.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration selector */}
              <div>
                <span className="text-xs font-semibold text-dark-maroon block mb-2">Test Duration</span>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 60, 90].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setDuration(sec)}
                      className={`px-3 py-2.5 rounded-xl border font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer ${duration === sec
                          ? 'bg-coral border-dark-maroon text-light-cream shadow-md shadow-coral/20'
                          : 'bg-soft-pink border-dark-maroon text-darker-maroon hover:text-darker-maroon hover:border-dark-maroon'
                        }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound & Speech Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-dark-maroon">
                {/* Keyboard Profile */}
                <div>
                  <span className="text-xs font-semibold text-dark-maroon block mb-1.5">Keyboard Click Sound</span>
                  <select
                    value={soundProfile}
                    onChange={(e) => setSoundProfile(e.target.value)}
                    disabled={!soundEnabled}
                    className="w-full bg-sky-blue border border-dark-maroon text-xs font-semibold rounded-xl p-2.5 text-darker-maroon focus:outline-none focus:border-coral disabled:opacity-40"
                  >
                    <option value="classic">Tactile Brown Switches</option>
                    <option value="clicky">Blue Mechanical Switches</option>
                    <option value="bubble">Bubble Pop Feedback</option>
                  </select>
                </div>

                {/* Pronounce Helper */}
                <div className="flex flex-col justify-end">
                  <span className="text-xs font-semibold text-dark-maroon block mb-1.5">Pronunciation Helper</span>
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoPlayAudio}
                      onChange={(e) => setAutoPlayAudio(e.target.checked)}
                      className="accent-dark-mustard h-4 w-4 rounded border-dark-maroon"
                    />
                    <span className="text-xs text-darker-maroon">Auto Pronounce words</span>
                  </label>
                </div>
              </div>

              {/* Action Trigger */}
              <button
                onClick={startSession}
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 font-bold font-vt323 text-xl bg-gradient-to-r from-dark-maroon to-coral hover:from-coral hover:to-dark-maroon text-light-cream rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-dark-maroon/35 cursor-pointer"
              >
                <Play size={16} fill="white" />
                Enter Arena
              </button>
            </div>

            {/* Personal Bests Dashboard */}
            <div className="bg-soft-pink border border-dark-maroon rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-dark-maroon flex items-center gap-2">
                  <Award size={14} className="text-dark-maroon" />
                  Personal Best Scores
                </h4>
                {personalBests.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-[10px] font-bold text-dark-maroon hover:text-rose-400/80 transition"
                  >
                    Clear Records
                  </button>
                )}
              </div>

              {personalBests.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {personalBests.map((best, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-light-cream/40 rounded-xl border border-dark-maroon text-sm font-mono"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-darker-maroon font-bold">#{idx + 1}</span>
                        <span className="font-extrabold text-sky-blue">{best.wpm} WPM</span>
                        <span className="text-coral font-semibold">{best.accuracy}% Acc</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="bg-sky-blue px-2 py-0.5 rounded border border-dark-maroon text-[10px] text-darker-maroon">
                          {best.band}
                        </span>
                        <span className="text-darker-maroon">{best.duration}s</span>
                        <span className="text-darker-maroon hidden sm:inline">{best.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 border border-dashed border-dark-maroon rounded-2xl text-xs text-slate-500 italic">
                  No session attempts recorded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {screen === 'typing' && (
          <TypingArena
            wordsList={activeWords}
            duration={duration}
            soundProfile={soundProfile}
            soundEnabled={soundEnabled}
            autoPlayAudio={autoPlayAudio}
            definitionCache={definitionCache}
            setDefinitionCache={setDefinitionCache}
            onSessionComplete={handleSessionComplete}
          />
        )}

        {screen === 'results' && (
          <ResultsScreen
            results={sessionResults}
            onRetry={startSession}
            onPracticeMissed={startPracticeMissedSession}
            onBackHome={() => setScreen('home')}
            definitionCache={definitionCache}
          />
        )}
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-4xl mx-auto text-center py-4 mt-8 border-t border-dark-maroon text-xs text-darker-maroon flex flex-wrap items-center justify-between gap-4">
        <div>IELTS Prep & 10-Finger Touch Typing Application</div>
        <div className="flex gap-4">
          <a href="https://github.com/amouriessa/IELTS-TypingArena.git" className="hover:text-dark-mustard transition">GitHub Repo</a>
          {/* <span>•</span>
          <a href="#" className="hover:text-dark-mustard transition">About Project</a> */}
        </div>
      </footer>
    </div>
  );
}
