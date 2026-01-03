
import React, { useState, useCallback, useMemo } from 'react';
import { VisualStyle, MusicStyle, Language, VideoType, StoryGenerationResult, Gender } from './types';
import { generateVisualPrompts } from './services/geminiService';
import { PromptCard } from './components/PromptCard';

const STYLE_PREVIEWS: Record<VisualStyle, string> = {
  [VisualStyle.CINEMATIC]: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=300&h=200',
  [VisualStyle.MAKOTO_SHINKAI]: 'https://images.unsplash.com/photo-1541512416146-3cf58d6b27cc?auto=format&fit=crop&q=80&w=300&h=200',
  [VisualStyle.ANIME_GHIBLI]: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&q=80&w=300&h=200',
  [VisualStyle.DARK_FANTASY_ANIME]: 'https://images.unsplash.com/photo-1502700807168-484a3e7889d0?auto=format&fit=crop&q=80&w=300&h=200',
  [VisualStyle.REALISTIC]: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=200',
  [VisualStyle.CYBERPUNK]: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=300&h=200',
  [VisualStyle.D3_RENDER]: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=300&h=200',
  [VisualStyle.SKETCH]: 'https://images.unsplash.com/photo-1515155075601-23009d0cb6d4?auto=format&fit=crop&q=80&w=300&h=200',
  [VisualStyle.OIL_PAINTING]: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=300&h=200'
};

const MUSIC_PREVIEWS: Record<MusicStyle, string> = {
  [MusicStyle.ORCHESTRAL]: 'https://images.unsplash.com/photo-1465847899034-d174df934bc0?auto=format&fit=crop&q=80&w=300&h=200',
  [MusicStyle.ELECTRONIC]: 'https://images.unsplash.com/photo-1514525253361-bee8718a300a?auto=format&fit=crop&q=80&w=300&h=200',
  [MusicStyle.AMBIENT]: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=300&h=200',
  [MusicStyle.LOFI]: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=300&h=200',
  [MusicStyle.DARK_FANTASY]: 'https://images.unsplash.com/photo-1519074063912-21199324706c?auto=format&fit=crop&q=80&w=300&h=200',
  [MusicStyle.CINEMATIC]: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=300&h=200'
};

const App: React.FC = () => {
  const [script, setScript] = useState('');
  const [vStyle, setVStyle] = useState<VisualStyle>(VisualStyle.CINEMATIC);
  const [mStyle, setMStyle] = useState<MusicStyle>(MusicStyle.CINEMATIC);
  const [language, setLanguage] = useState<Language>(Language.INDONESIAN);
  const [videoType, setVideoType] = useState<VideoType>(VideoType.SHORT);
  const [gender, setGender] = useState<Gender>(Gender.FEMALE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StoryGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!script.trim()) {
      setError('Mohon masukkan naskah terlebih dahulu.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await generateVisualPrompts(script, vStyle, mStyle, language, videoType, gender);
      setResult(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Production Engine error.');
    } finally {
      setLoading(false);
    }
  }, [script, vStyle, mStyle, language, videoType, gender]);

  const handleReset = useCallback(() => {
    if (window.confirm('Bersihkan semua data produksi dan mulai baru?')) {
      setScript('');
      setResult(null);
      setError(null);
      setCopyStatus(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleDownloadTxt = useCallback(() => {
    if (!result) return;

    let txt = `PROYEK: ${result.title.toUpperCase()}\n`;
    txt += `DIBUAT PADA: ${new Date().toLocaleString()}\n`;
    txt += `====================================================\n\n`;
    
    txt += `[METADATA SEO]\n`;
    txt += `Judul: ${result.title}\n`;
    txt += `Deskripsi: ${result.summary}\n`;
    txt += `Tags: ${result.tags.join(', ')}\n`;
    txt += `Hashtags: ${result.hashtags.join(', ')}\n\n`;

    txt += `[THUMBNAIL MASTER PROMPT]\n`;
    txt += `${result.thumbnailPrompt}\n\n`;

    txt += `[CHARACTER BIBLE - CONSISTENCY ANCHOR]\n`;
    txt += `${result.characterReference}\n\n`;

    txt += `[SEQUENTIAL STORYBOARD]\n`;
    result.scenes.forEach(s => {
      txt += `ADENGAN ${s.sceneNumber} [${s.timeframe}]\n`;
      txt += `PROMPT VISUAL: ${s.visualPrompt}\n`;
      txt += `NARASI (VO): ${s.voiceOver}\n`;
      txt += `AUDIO (SFX): ${s.soundscape}\n`;
      txt += `TRANSISI: ${s.continuityNotes}\n`;
      txt += `----------------------------------------------------\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.substring(0, 20).replace(/\s/g, '_')}_storyboard.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result]);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const visualStyleButtons = useMemo(() => Object.values(VisualStyle).map((v) => (
    <button
      key={v}
      type="button"
      onClick={() => setVStyle(v)}
      className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
        vStyle === v ? 'border-indigo-500 scale-[0.98]' : 'border-transparent opacity-50 hover:opacity-100'
      }`}
    >
      <img src={STYLE_PREVIEWS[v]} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[7px] text-center font-black text-white uppercase leading-tight">{v.split(' ')[0]}</span>
      </div>
    </button>
  )), [vStyle]);

  const musicStyleButtons = useMemo(() => Object.values(MusicStyle).map((m) => (
    <button
      key={m}
      type="button"
      onClick={() => setMStyle(m)}
      className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
        mStyle === m ? 'border-emerald-500 scale-[0.98]' : 'border-transparent opacity-50 hover:opacity-100'
      }`}
    >
      <img src={MUSIC_PREVIEWS[m]} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[7px] text-center font-black text-white uppercase leading-tight">{m.split(' ')[0]}</span>
      </div>
    </button>
  )), [mStyle]);

  return (
    <div className="min-h-screen flex flex-col bg-[#02040a] text-slate-200 selection:bg-indigo-500/30">
      {/* Dynamic Header */}
      <nav className="border-b border-white/5 py-4 px-6 glass-card sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Visual Extend Engine</h1>
              <p className="text-[8px] text-indigo-400 font-bold uppercase">Sequential Storyboard AI</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {result && (
              <button 
                onClick={handleDownloadTxt}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/10"
              >
                Unduh .TXT
              </button>
            )}
            <button 
              onClick={handleReset}
              className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors px-3 py-2 rounded-lg hover:bg-rose-500/5"
            >
              Reset
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Input Sidebar */}
        <aside className="lg:col-span-4 space-y-6 print:hidden">
          <div className="glass-card rounded-[2rem] p-7 border-white/5 shadow-2xl sticky top-24">
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Naskah Cerita Utama</label>
                <textarea
                  className="w-full h-44 bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all resize-none custom-scrollbar"
                  placeholder="Ceritakan kisah Anda di sini untuk diubah menjadi storyboard..."
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setGender(Gender.MALE)} className={`py-3.5 rounded-xl text-[9px] font-black uppercase transition-all ${gender === Gender.MALE ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-slate-600'}`}>Karakter Pria</button>
                <button onClick={() => setGender(Gender.FEMALE)} className={`py-3.5 rounded-xl text-[9px] font-black uppercase transition-all ${gender === Gender.FEMALE ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-slate-600'}`}>Karakter Wanita</button>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Gaya Visual (Aesthetic)</label>
                <div className="grid grid-cols-3 gap-2">{visualStyleButtons}</div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Atmosfer Audio</label>
                <div className="grid grid-cols-3 gap-2">{musicStyleButtons}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="bg-slate-900 border border-white/10 text-[9px] rounded-xl p-3.5 outline-none text-slate-400 font-black uppercase appearance-none">
                  {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={videoType} onChange={(e) => setVideoType(e.target.value as VideoType)} className="bg-slate-900 border border-white/10 text-[9px] rounded-xl p-3.5 outline-none text-slate-400 font-black uppercase appearance-none">
                  <option value={VideoType.SHORT}>9:16 Vertical</option>
                  <option value={VideoType.LONG}>16:9 Cinematic</option>
                </select>
              </div>

              {error && <p className="text-[9px] font-bold text-rose-400 bg-rose-400/10 p-4 rounded-xl border border-rose-400/20 animate-bounce">{error}</p>}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${loading ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30'}`}
              >
                {loading ? 'Processing Storyboard Flow...' : 'Generate Connected Storyboard'}
              </button>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <section className="lg:col-span-8 space-y-10 min-h-screen">
          {!result && !loading && (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center opacity-20 text-center select-none">
              <div className="w-20 h-20 border-2 border-dashed border-slate-700 rounded-[2.5rem] mb-6 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.4em]">Awaiting Story Input</p>
            </div>
          )}

          {loading && (
            <div className="space-y-8 animate-pulse">
              <div className="h-56 bg-slate-900/50 rounded-[2.5rem]"></div>
              <div className="h-[500px] bg-slate-900/50 rounded-[2.5rem]"></div>
            </div>
          )}

          {result && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              {/* METADATA SECTION */}
              <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-48 w-48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>

                <div className="flex items-center gap-3 mb-10">
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border border-emerald-500/20">SEO Production Suite</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                  <div className="md:col-span-8 space-y-4">
                    <label className="text-[9px] font-black text-slate-500 uppercase flex justify-between">
                      Judul Video Viral
                      <button onClick={() => copyText(result.title, 't')} className="text-indigo-400 hover:text-white transition-colors uppercase tracking-widest">{copyStatus === 't' ? 'Copied' : 'Copy'}</button>
                    </label>
                    <h2 className="text-3xl font-black text-white leading-tight tracking-tight">{result.title}</h2>
                    
                    <div className="pt-4 space-y-3">
                      <label className="text-[9px] font-black text-slate-500 uppercase flex justify-between">
                        Deskripsi Video SEO
                        <button onClick={() => copyText(result.summary, 's')} className="text-indigo-400 hover:text-white transition-colors uppercase tracking-widest">{copyStatus === 's' ? 'Copied' : 'Copy'}</button>
                      </label>
                      <div className="bg-slate-900/40 p-5 rounded-2xl text-[11px] text-slate-300 leading-relaxed border border-white/5 italic">
                        {result.summary}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4 bg-slate-900/60 p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase block mb-3">Thumbnail Prompt</label>
                      <p className="text-[10px] text-slate-400 leading-relaxed italic line-clamp-6">"{result.thumbnailPrompt}"</p>
                    </div>
                    <button onClick={() => copyText(result.thumbnailPrompt, 'thm')} className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 text-[9px] font-black text-indigo-400 rounded-xl transition-all uppercase tracking-widest">
                      {copyStatus === 'thm' ? 'Prompt Copied' : 'Copy Thumbnail Prompt'}
                    </button>
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase">Optimized Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {result.tags?.map((t, i) => <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-slate-400">#{t.trim()}</span>)}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase">Viral Hashtags</label>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags?.map((t, i) => <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] text-indigo-400 font-black">#{t.trim()}</span>)}
                    </div>
                  </div>
                </div>
              </div>

              {/* CONSISTENCY BIBLE */}
              <div className="glass-card rounded-[2.5rem] p-10 border-l-[8px] border-indigo-600 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Visual Consistency Bible (Anchor)</h3>
                  </div>
                  <button onClick={() => copyText(result.characterReference, 'c')} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">{copyStatus === 'c' ? 'Copied Anchor' : 'Copy Anchor'}</button>
                </div>
                <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/5">
                  <p className="text-lg text-slate-400 leading-relaxed font-medium italic">
                    "{result.characterReference}"
                  </p>
                  <div className="mt-6 flex items-start gap-3 opacity-40">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Instruksi: Tempel deskripsi karakter ini di awal SETIAP prompt generator video Anda untuk hasil yang tidak berubah-ubah.</p>
                  </div>
                </div>
              </div>

              {/* SEQUENTIAL STORYBOARD */}
              <div className="space-y-2 relative">
                <div className="absolute left-10 top-20 bottom-0 w-1 bg-gradient-to-b from-indigo-600/20 via-indigo-600/5 to-transparent pointer-events-none rounded-full hidden md:block"></div>
                {result.scenes.map((s, idx) => (
                  <div key={idx} className="relative z-10">
                    <PromptCard scene={s} />
                    {idx < result.scenes.length - 1 && (
                      <div className="h-12 flex items-center justify-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600/30 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="py-16 border-t border-white/5 text-center opacity-30 select-none print:hidden">
        <p className="text-[9px] font-black uppercase tracking-[0.6em] text-indigo-400 mb-2">Sequential Production Engine</p>
        <p className="text-[8px] font-bold uppercase text-slate-600 tracking-widest">Aesthetics & Continuity Pipeline V1.8</p>
      </footer>
    </div>
  );
};

export default App;
