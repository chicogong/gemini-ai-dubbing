import React, { useState } from 'react';
import Header from './components/Header';
import VoiceSelector from './components/VoiceSelector';
import HistoryItem from './components/HistoryItem';
import ScriptEditor from './components/ScriptEditor';
import { VoiceName, GeneratedAudio, GenerationState } from './types';
import { DEFAULT_VOICE } from './constants';
import { generateSpeech } from './services/geminiService';
import { Wand2, AlertCircle, History, Mic2, Sparkles, X } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(DEFAULT_VOICE);
  const [history, setHistory] = useState<GeneratedAudio[]>([]);
  const [latestAudio, setLatestAudio] = useState<GeneratedAudio | null>(null);
  const [status, setStatus] = useState<GenerationState>({
    isGenerating: false,
    error: null,
  });
  const [loadingText, setLoadingText] = useState("AI 正在合成...");

  const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setStatus({ isGenerating: true, error: null });
    setLatestAudio(null); // Clear previous result so user notices the new one
    
    // Dynamic loading text logic to make the wait feel shorter
    setLoadingText("正在连接大脑...");
    const loadingMessages = [
        "正在构建声纹...",
        "正在合成语音...",
        "正在调整语调...",
        "正在进行后期处理..."
    ];
    let msgIndex = 0;
    const intervalId = setInterval(() => {
        setLoadingText(loadingMessages[msgIndex]);
        msgIndex = (msgIndex + 1) % loadingMessages.length;
    }, 1500);

    try {
      const { blob, duration } = await generateSpeech(text, selectedVoice);
      const blobUrl = URL.createObjectURL(blob);

      const newItem: GeneratedAudio = {
        id: generateId(),
        text: text.trim(),
        voice: selectedVoice,
        timestamp: Date.now(),
        blobUrl,
        duration,
      };

      setHistory((prev) => [newItem, ...prev]);
      setLatestAudio(newItem); // Show immediately
      
    } catch (error: any) {
      console.error(error);
      setStatus({ 
        isGenerating: false, 
        error: error.message || "生成失败。请检查您的网络连接或 API Key。" 
      });
    } finally {
      clearInterval(intervalId);
      setStatus(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleDelete = (id: string) => {
    setHistory((prev) => {
        const item = prev.find(i => i.id === id);
        if (item) {
            URL.revokeObjectURL(item.blobUrl);
        }
        return prev.filter((item) => item.id !== id);
    });
    if (latestAudio?.id === id) {
        setLatestAudio(null);
    }
  };

  const maxChars = 2000;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />

      <main className="max-w-5xl mx-auto p-4 md:p-6 pb-20">
        
        {/* Tabs Navigation */}
        <div className="flex justify-center mb-8">
            <div className="bg-slate-200/50 p-1 rounded-xl inline-flex shadow-inner">
                <button 
                    onClick={() => setActiveTab('create')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'create' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Mic2 className="w-4 h-4" />
                    配音创作
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <History className="w-4 h-4" />
                    作品库
                    {history.length > 0 && (
                        <span className={`text-[10px] px-1.5 rounded-full ${activeTab === 'history' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-300 text-slate-600'}`}>
                            {history.length}
                        </span>
                    )}
                </button>
            </div>
        </div>

        {/* Tab Content: CREATE */}
        {activeTab === 'create' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                
                {/* Voice Selection */}
                <section>
                    <VoiceSelector 
                        selectedVoice={selectedVoice} 
                        onSelectVoice={setSelectedVoice}
                        disabled={status.isGenerating}
                    />
                </section>

                {/* Editor Section */}
                <section className="flex flex-col gap-4">
                     <div className="flex items-center justify-between px-1">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <PenToolIcon className="w-4 h-4 text-indigo-600" />
                          配音文案工作室
                        </label>
                        {status.error && (
                          <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 px-3 py-1 rounded-full border border-red-200 animate-in fade-in slide-in-from-right-5">
                            <AlertCircle className="w-3 h-3" />
                            {status.error}
                          </div>
                        )}
                     </div>
                     
                     <div className="flex-grow">
                        <ScriptEditor 
                           text={text} 
                           setText={setText} 
                           disabled={status.isGenerating} 
                           maxChars={maxChars}
                        />
                     </div>

                     <div className="flex justify-end pt-2">
                        <button
                          onClick={handleGenerate}
                          disabled={status.isGenerating || !text.trim()}
                          className={`
                            flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all duration-300
                            ${status.isGenerating || !text.trim()
                              ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none' 
                              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transform hover:-translate-y-1'
                            }
                          `}
                        >
                          {status.isGenerating ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span className="min-w-[100px] text-left">{loadingText}</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-5 h-5" />
                              <span>立即生成语音</span>
                            </>
                          )}
                        </button>
                     </div>
                </section>

                {/* LATEST GENERATED AUDIO - IMMEDIATE PLAYBACK */}
                {latestAudio && !status.isGenerating && (
                    <div className="bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl p-4 mt-6 animate-in fade-in zoom-in-95 duration-500">
                         <div className="flex items-center justify-between mb-3 px-1">
                            <span className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                <span className="bg-amber-400 p-1 rounded-md text-white shadow-sm shadow-amber-200">
                                    <Sparkles className="w-3.5 h-3.5" />
                                </span>
                                生成完成！点击下方播放
                            </span>
                            <button 
                                onClick={() => setLatestAudio(null)} 
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <HistoryItem item={latestAudio} onDelete={(id) => handleDelete(id)} />
                    </div>
                )}
            </div>
        )}

        {/* Tab Content: HISTORY */}
        {activeTab === 'history' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                 {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <History className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">暂无配音作品</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-xs">
                      切换到“配音创作”标签页，输入文案并点击生成，您的作品将显示在这里。
                    </p>
                    <button 
                        onClick={() => setActiveTab('create')}
                        className="mt-6 text-indigo-600 font-semibold text-sm hover:underline"
                    >
                        去创作 &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.map((item) => (
                      <HistoryItem 
                        key={item.id} 
                        item={item} 
                        onDelete={handleDelete} 
                      />
                    ))}
                  </div>
                )}
            </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
          VoxGen Pro Studio • Powered by Gemini 2.5
      </footer>
    </div>
  );
};

// Helper Icon for this file
const PenToolIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
);

export default App;