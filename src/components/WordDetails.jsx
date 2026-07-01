import React, { useEffect, useState } from 'react';
import { Volume2, BookOpen, Compass, GraduationCap, Loader2, AlertCircle } from 'lucide-react';

export default function WordDetails({
  wordInfo,
  autoPlayEnabled = false,
  playbackRate = 1.0,
  definitionCache = {},
  setDefinitionCache
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [details, setDetails] = useState({ ipa: '', definition: '', example: '' });

  const word = wordInfo?.word || '';
  const type = wordInfo?.type || '';
  const band = wordInfo?.band || '';
  const category = wordInfo?.category || '';

  useEffect(() => {
    if (!word) return;
    let active = true;

    // Reset error states
    setError(false);

    // Check if definition exists in Cache
    if (definitionCache[word]) {
      setDetails(definitionCache[word]);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from Dictionary API on the fly
    setLoading(true);
    const fetchDetails = async () => {
      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!res.ok) {
          throw new Error('Word details not found in Dictionary API');
        }
        const data = await res.json();
        
        if (!active) return;

        const entry = data[0];
        const ipaText = entry.phonetic || (entry.phonetics && entry.phonetics.find(p => p.text)?.text) || `/${word}/`;
        
        // Find meaning matching POS or default
        const meaning = entry.meanings.find(m => m.partOfSpeech.toLowerCase() === type.toLowerCase()) || entry.meanings[0];
        const def = meaning?.definitions[0]?.definition || "Definition not available.";
        let ex = meaning?.definitions[0]?.example || `Understanding the term "${word}" is highly beneficial for academic IELTS essays.`;

        const newDetails = { ipa: ipaText, definition: def, example: ex };

        // Save in Cache
        if (setDefinitionCache) {
          setDefinitionCache(prev => ({ ...prev, [word]: newDetails }));
        }

        setDetails(newDetails);
        setLoading(false);
      } catch (err) {
        if (!active) return;
        
        // Fallback definitions if API fails or offline
        const fallbackDetails = {
          ipa: `/${word}/`,
          definition: `An academic vocabulary word commonly utilized in high-level contexts.`,
          example: `Developing a strong understanding of "${word}" is highly valued in formal writing tasks.`
        };

        if (setDefinitionCache) {
          setDefinitionCache(prev => ({ ...prev, [word]: fallbackDetails }));
        }

        setDetails(fallbackDetails);
        setLoading(false);
        setError(true);
      }
    };

    fetchDetails();

    return () => {
      active = false;
    };
  }, [word, type]);

  // TTS Pronunciation function
  const playPronunciation = () => {
    if (!word) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = playbackRate;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-pronounce hook when details finish loading
  useEffect(() => {
    if (!word) return;
    if (autoPlayEnabled && !loading) {
      const timer = setTimeout(() => {
        playPronunciation();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [word, loading, autoPlayEnabled]);

  if (!wordInfo) {
    return (
      <div className="flex items-center justify-center p-8 bg-slate-900/30 backdrop-blur-md rounded-2xl border border-slate-800 text-slate-500 italic h-36">
        Start typing to reveal vocabulary details.
      </div>
    );
  }

  // Color maps for bands
  const bandColors = {
    '8.0+': 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm shadow-rose-500/5',
    '7.0': 'bg-dark-mustard/10 text-amber-400 border border-dark-mustard/20 shadow-sm shadow-dark-mustard/5',
    '6.0': 'bg-sky-500/10 text-dark-blue border border-sky-500/20 shadow-sm shadow-sky-500/5'
  };

  const badgeClass = bandColors[band] || 'bg-coral/10 text-light-cream border border-coral/20';

  return (
    <div className="bg-light-cream backdrop-blur-xl border-2 border-dark-maroon p-6 glow-primary transition-all duration-300">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-extrabold tracking-wide text-darker-maroon">{word}</h2>
          
          {loading ? (
            <Loader2 className="animate-spin text-dark-maroon" size={16} />
          ) : (
            <span className="text-sm font-mono text-dark-maroon bg-sky-blue px-2.5 py-0.5">
              {details.ipa}
            </span>
          )}

          <span className="text-xs font-semibold uppercase tracking-wider text-darker-maroon bg-soft-pink px-2 py-0.5">
            {type}
          </span>

          {error && (
            <span className="flex items-center gap-1 text-[10px] text-amber-500/80 bg-amber-500/5 border border-amber-500/15 px-2 py-0.5 rounded">
              <AlertCircle size={10} /> Local Fallback Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-light-cream bg-coral px-3 py-1 rounded-full border border-dark-maroon/60">
            {category}
          </span>
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${badgeClass}`}>
            <GraduationCap size={13} />
            IELTS Band {band}
          </span>
          <button
            onClick={playPronunciation}
            disabled={loading}
            className="p-2 rounded-full bg-light-cream border border-dark-maroon text-dark-maroon hover:bg-soft-mustard active:scale-95 disabled:opacity-40 transition-all duration-150 shadow-md cursor-pointer"
            title="Listen Pronunciation"
          >
            <Volume2 size={16} />
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-dark-maroon min-h-[5.5rem]">
        {loading ? (
          <div className="col-span-2 flex items-center justify-center gap-2 text-sm text-slate-500 py-4">
            <Loader2 className="animate-spin text-indigo-500" size={18} />
            Fetching definition and pronunciation details from Kamus API...
          </div>
        ) : (
          <>
            {/* Definition */}
            <div className="flex gap-3 animate-fade-in">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-coral mb-1">Definition</h3>
                <p className="text-dark-maroon leading-relaxed text-xs">{details.definition}</p>
              </div>
            </div>

            {/* Example Sentence */}
            <div className="flex gap-3 animate-fade-in">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-coral mb-1">Context Usage</h3>
                <p className="text-dark-maroon italic leading-relaxed text-xs">
                  "{details.example}"
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
