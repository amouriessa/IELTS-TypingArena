import React from 'react';

// Finger groups for standard touch typing QWERTY
const keyFingerMap = {
  // Left Pinky
  'q': 'left-pinky', 'a': 'left-pinky', 'z': 'left-pinky',
  // Left Ring
  'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring',
  // Left Middle
  'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle',
  // Left Index
  'r': 'left-index', 't': 'left-index', 'f': 'left-index', 'g': 'left-index', 'v': 'left-index', 'b': 'left-index',
  // Thumbs
  ' ': 'thumb',
  // Right Index
  'y': 'right-index', 'u': 'right-index', 'h': 'right-index', 'j': 'right-index', 'n': 'right-index', 'm': 'right-index',
  // Right Middle
  'i': 'right-middle', 'k': 'right-middle', ',': 'right-middle',
  // Right Ring
  'o': 'right-ring', 'l': 'right-ring', '.': 'right-ring',
  // Right Pinky
  'p': 'right-pinky', ';': 'right-pinky', "'": 'right-pinky', '/': 'right-pinky',
  // Special keys
  'backspace': 'right-pinky', 'enter': 'right-pinky', 'shift': 'right-pinky'
};

// Finger descriptive labels
const fingerLabels = {
  'left-pinky': 'Left Pinky',
  'left-ring': 'Left Ring Finger',
  'left-middle': 'Left Middle Finger',
  'left-index': 'Left Index Finger',
  'thumb': 'Either Thumb',
  'right-index': 'Right Index Finger',
  'right-middle': 'Right Middle Finger',
  'right-ring': 'Right Ring Finger',
  'right-pinky': 'Right Pinky'
};

// Colors for fingers in Tailwind v4
const fingerColors = {
  'left-pinky': { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', active: 'bg-rose-500/90 text-slate-950 border-rose-400 shadow-rose-500/40 glow-success' },
  'left-ring': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', active: 'bg-amber-500/90 text-slate-950 border-amber-400 shadow-amber-500/40 glow-success' },
  'left-middle': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', active: 'bg-emerald-500/90 text-slate-950 border-emerald-400 shadow-emerald-500/40 glow-success' },
  'left-index': { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', active: 'bg-indigo-500/90 text-slate-950 border-indigo-400 shadow-indigo-500/40 glow-success' },
  'thumb': { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', active: 'bg-slate-200 text-slate-950 border-white shadow-white/40 glow-success' },
  'right-index': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', active: 'bg-blue-500/90 text-slate-950 border-blue-400 shadow-blue-500/40 glow-success' },
  'right-middle': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', active: 'bg-cyan-500/90 text-slate-950 border-cyan-400 shadow-cyan-500/40 glow-success' },
  'right-ring': { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', active: 'bg-purple-500/90 text-slate-950 border-purple-400 shadow-purple-500/40 glow-success' },
  'right-pinky': { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', text: 'text-fuchsia-400', active: 'bg-fuchsia-500/90 text-slate-950 border-fuchsia-400 shadow-fuchsia-500/40 glow-success' }
};

export default function VirtualKeyboard({ nextChar }) {
  // Normalize character for mapping (lowercase)
  const targetChar = nextChar ? nextChar.toLowerCase() : '';
  const activeFinger = keyFingerMap[targetChar] || '';

  const keyboardRows = [
    // Row 1
    [
      { label: 'q', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'w', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'e', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'r', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 't', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'y', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'u', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'i', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'o', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'p', size: 'w-10 md:w-12 h-10 md:h-12' },
    ],
    // Row 2
    [
      { label: 'a', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 's', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'd', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'f', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'g', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'h', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'j', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'k', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'l', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: ';', size: 'w-10 md:w-12 h-10 md:h-12' },
    ],
    // Row 3
    [
      { label: 'z', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'x', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'c', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'v', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'b', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'n', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: 'm', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: ',', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: '.', size: 'w-10 md:w-12 h-10 md:h-12' },
      { label: '/', size: 'w-10 md:w-12 h-10 md:h-12' },
    ],
    // Row 4 (Space)
    [
      { label: ' ', size: 'w-56 md:w-72 h-10 md:h-12 mx-auto justify-center', isSpace: true }
    ]
  ];

  // Helper to render the hand outlines in a styled mini panel
  const renderHandFingers = () => {
    const isLActive = (f) => activeFinger === `left-${f}`;
    const isRActive = (f) => activeFinger === `right-${f}`;
    const isThumbActive = activeFinger === 'thumb';

    return (
      <div className="flex items-center gap-6 bg-soft-pink/20 px-4 py-2.5 rounded-xl border border-dark-maroon">
        <div className="text-right">
          <div className="text-[10px] font-bold text-darker-maroon uppercase tracking-wider">Active Finger</div>
          <div className="text-sm font-semibold text-coral">
            {fingerLabels[activeFinger] || 'Ready to Type'}
          </div>
        </div>

        {/* Hand visualizer */}
        <div className="flex items-center gap-3">
          {/* Left Hand */}
          <div className="flex items-end gap-1 h-8">
            <span className={`w-1.5 rounded-t-full transition-all duration-200 ${isLActive('pinky') ? 'h-5 bg-pink shadow shadow-pink' : 'h-3 bg-slate-800'}`} title="Pinky" />
            <span className={`w-1.5 rounded-t-full transition-all duration-200 ${isLActive('ring') ? 'h-7 bg-dark-mustard shadow shadow-dark-mustard' : 'h-5 bg-slate-800'}`} title="Ring" />
            <span className={`w-1.5 rounded-t-full transition-all duration-200 ${isLActive('middle') ? 'h-8 bg-coral shadow shadow-coral' : 'h-6 bg-slate-800'}`} title="Middle" />
            <span className={`w-1.5 rounded-t-full transition-all duration-200 ${isLActive('index') ? 'h-7 bg-dark-blue shadow shadow-dark-blue' : 'h-5 bg-slate-800'}`} title="Index" />
            <span className={`w-1.5 rounded-t-full transition-all duration-200 ${isThumbActive ? 'h-4 bg-emerald-400 shadow shadow-white' : 'h-3 bg-slate-800'}`} title="Thumb" />
          </div>
          {/* Divider */}
          <span className="w-[1px] h-6 bg-slate-800" />
          {/* Right Hand */}
          <div className="flex items-end gap-1 h-8">
            <span className={`w-1.5 rounded-t-full transition-all duration-200 ${isThumbActive ? 'h-4 bg-emerald-400 shadow shadow-white' : 'h-3 bg-slate-800'}`} title="Thumb" />
            <span className={`w-1.5 rounded-t-full transition-all duration-200 ${isRActive('index') ? 'h-7 bg-blue-500 shadow shadow-blue-500' : 'h-5 bg-slate-800'}`} title="Index" />
            <span className={`w-1.5 rounded-t-full transition-all duration-200 ${isRActive('middle') ? 'h-8 bg-cyan-500 shadow shadow-cyan-500' : 'h-6 bg-slate-800'}`} title="Middle" />
            <span className={`w-1.5 rounded-t-full transition-all duration-200 ${isRActive('ring') ? 'h-7 bg-purple-500 shadow shadow-purple-500' : 'h-5 bg-slate-800'}`} title="Ring" />
            <span className={`w-1.5 rounded-t-full transition-all duration-200 ${isRActive('pinky') ? 'h-5 bg-fuchsia-500 shadow shadow-fuchsia-500' : 'h-3 bg-slate-800'}`} title="Pinky" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-light-cream border-2 border-dark-maroon p-4 md:p-6 select-none shadow-inner">
      {/* Top Helper */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-dark-maroon">Target Key</span>
          {targetChar ? (
            <kbd className="px-3 py-1 font-mono text-sm font-bold bg-coral border border-dark-maroon/30 text-light-cream rounded shadow-md">
              {targetChar === ' ' ? 'Space' : targetChar}
            </kbd>
          ) : (
            <span className="text-xs text-dark-maroon italic">None</span>
          )}
        </div>

        {renderHandFingers()}
      </div>

      {/* Keyboard Grid */}
      <div className="flex flex-col gap-1.5 items-center justify-center font-mono">
        {keyboardRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1 md:gap-1.5 justify-center w-full">
            {row.map((key) => {
              const isTarget = key.label === targetChar;
              const finger = keyFingerMap[key.label];
              const colors = fingerColors[finger] || { bg: 'bg-slate-800/10', border: 'border-slate-800/40', text: 'text-slate-500' };

              let classes = `char-transition flex items-center justify-center text-xs md:text-sm font-semibold rounded-lg border uppercase ${key.size} `;

              if (isTarget) {
                // Active glowing state
                classes += `${colors.active} scale-105 border-2 animate-pulse z-10`;
              } else {
                // Static touch-typing guideline state
                classes += `${colors.bg} ${colors.border} ${colors.text}`;
              }

              return (
                <div key={key.label} className={classes}>
                  {key.isSpace ? 'Space' : key.label}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
