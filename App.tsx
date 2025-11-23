import React, { useState } from 'react';
import Header from './components/Header';
import VoiceSelector from './components/VoiceSelector';
import HistoryItem from './components/HistoryItem';
import ScriptEditor from './components/ScriptEditor';
import { VoiceName, GeneratedAudio, GenerationState } from './types';
import { DEFAULT_VOICE } from './constants';
import { generateSpeech } from './services/geminiService';
import { Wand2, AlertCircle, History, Mic2, Download } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(DEFAULT_VOICE);
  const [history, setHistory] = useState<GeneratedAudio[]>([]);
  const [status, setStatus] = useState<GenerationState>({
    isGenerating: false,
    error: null,
  });

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setStatus({ isGenerating: true, error: null });

    try {
      const { blob, duration } = await generateSpeech(text, selectedVoice);
      const blobUrl = URL.createObjectURL(blob);

      const newItem: GeneratedAudio = {
        id: crypto.randomUUID(),
        text: text.trim(),
        voice: selectedVoice,
        timestamp: Date.now(),
        blobUrl,
        duration,
      };

      setHistory((prev) => [newItem, ...prev]);
      // Optional: switch to history tab or show success toast
      // setActiveTab('history'); 
    } catch (error: any) {
      setStatus({ 
        isGenerating: false, 
        error: error.message || "生成失败。请检查您的网络连接或 API Key。" 
      });
    } finally {
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
                          <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 px-3 py-1 rounded-full border border-red-200">
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
                              <span>AI 正在合成...</span>
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