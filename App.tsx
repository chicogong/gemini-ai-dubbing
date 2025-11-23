import React, { useState } from 'react';
import Header from './components/Header';
import VoiceSelector from './components/VoiceSelector';
import HistoryItem from './components/HistoryItem';
import { VoiceName, GeneratedAudio, GenerationState } from './types';
import { DEFAULT_VOICE } from './constants';
import { generateSpeech } from './services/geminiService';
import { Wand2, AlertCircle, History } from 'lucide-react';

const App: React.FC = () => {
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

  const charCount = text.length;
  const maxChars = 1000;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
            <VoiceSelector 
              selectedVoice={selectedVoice} 
              onSelectVoice={setSelectedVoice}
              disabled={status.isGenerating}
            />

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                配音文案 / 脚本
              </label>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="在此输入您想要转换的文字内容..."
                  disabled={status.isGenerating}
                  maxLength={maxChars}
                  className="w-full h-48 bg-slate-950 border border-slate-700 rounded-xl p-4 text-base leading-relaxed text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
                />
                <div className="absolute bottom-4 right-4 text-xs text-slate-500 bg-slate-900/80 px-2 py-1 rounded">
                  {charCount} / {maxChars}
                </div>
              </div>
            </div>

            {status.error && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-800/50 rounded-lg flex items-start gap-3 text-red-300 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{status.error}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={status.isGenerating || !text.trim()}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition-all
                  ${status.isGenerating || !text.trim()
                    ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                    : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 active:transform active:scale-95'
                  }
                `}
              >
                {status.isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>生成语音</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center text-slate-500 text-sm">
             <p>由 Google Gemini 2.5 Flash TTS 模型驱动。生成 24kHz 高保真 WAV 音频。</p>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              生成历史
            </h2>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">
              {history.length}
            </span>
          </div>

          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {history.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500">暂无生成记录</p>
                <p className="text-slate-600 text-sm mt-1">请选择声音并输入文案开始制作。</p>
              </div>
            ) : (
              history.map((item) => (
                <HistoryItem 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDelete} 
                />
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;