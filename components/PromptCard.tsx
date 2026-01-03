
import React, { useState } from 'react';
import { PromptScene } from '../types';

interface PromptCardProps {
  scene: PromptScene;
}

export const PromptCard: React.FC<PromptCardProps> = ({ scene }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    // Formatting the copy content for direct use in AI tools
    const textToCopy = scene.visualPrompt;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-[2rem] p-8 transition-all hover:bg-indigo-500/[0.02] border-white/5 hover:border-indigo-500/30 group">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <span className="bg-indigo-600/10 text-indigo-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-indigo-500/20">
            SCENE {scene.sceneNumber.toString().padStart(2, '0')}
          </span>
          <span className="text-slate-600 text-xs font-bold font-mono">
            [{scene.timeframe}]
          </span>
        </div>
        <button 
          onClick={copyToClipboard}
          className={`text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-xl transition-all flex items-center gap-2 ${
            copied 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
            : 'bg-slate-800/50 text-slate-400 hover:bg-indigo-600 hover:text-white border border-white/5'
          }`}
        >
          {copied ? 'Prompt Copied' : 'Copy Prompt'}
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <h4 className="text-indigo-500/40 text-[9px] font-black uppercase mb-3 tracking-[0.3em] flex items-center gap-2">
            <span className="w-4 h-px bg-indigo-500/40"></span>
            Visual Production Prompt
          </h4>
          <p className="text-slate-100 leading-relaxed text-xl font-medium tracking-tight">
            "{scene.visualPrompt}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-6 bg-white/5 border border-white/5 rounded-2xl p-5">
                <h4 className="text-purple-400 text-[9px] font-black uppercase mb-2 tracking-widest flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    Voice Over (Narration)
                </h4>
                <p className="text-slate-300 leading-relaxed text-sm font-medium">
                    {scene.voiceOver}
                </p>
            </div>
            <div className="md:col-span-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5">
                <h4 className="text-emerald-400 text-[9px] font-black uppercase mb-2 tracking-widest flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.803l8-1.6V11.114A4.369 4.369 0 0015 11c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V3z" />
                    </svg>
                    Soundscape & Music Instruments
                </h4>
                <p className="text-slate-300 leading-relaxed text-sm font-medium italic">
                    {scene.soundscape}
                </p>
            </div>
        </div>

        <div>
            <h4 className="text-slate-600 text-[9px] font-black uppercase mb-2 tracking-widest">Continuity Notes</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed italic border-l border-white/10 pl-4">
                {scene.continuityNotes}
            </p>
        </div>
      </div>
    </div>
  );
};
