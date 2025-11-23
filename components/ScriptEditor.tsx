import React, { useState } from 'react';
import { Sparkles, Eraser, Expand, Languages, PenTool, CheckCircle2, Copy, Wand2, Loader2, MessageSquarePlus } from 'lucide-react';
import { optimizeScript } from '../services/geminiService';
import { AIActionType } from '../types';

interface ScriptEditorProps {
  text: string;
  setText: (text: string) => void;
  disabled: boolean;
  maxChars: number;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({ text, setText, disabled, maxChars }) => {
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [customTopic, setCustomTopic] = useState('');

  const handleAIAction = async (action: AIActionType | 'custom') => {
    if (isAiProcessing) return;
    
    setIsAiProcessing(true);
    setShowAiMenu(false);

    let systemInstruction = "你是一个专业的配音文案编辑。请直接输出处理后的文案，不要包含任何解释、引号或前缀后缀。保持语言流畅，适合朗读。";
    let prompt = "";

    switch (action) {
      case 'polish':
        prompt = "请润色这段文案，使其更加通顺、自然，更有文采，适合高质量配音。";
        break;
      case 'fix':
        prompt = "请修正这段文案中的错别字和语病，保持原意不变。";
        break;
      case 'expand':
        prompt = "请基于这段文案的核心思想进行扩写，丰富细节，使其更加生动，长度增加约 50%。";
        break;
      case 'style_promo':
        prompt = "请将这段文案改写为【激昂的广告宣传片】风格，使用短句，富有号召力。";
        break;
      case 'style_story':
        prompt = "请将这段文案改写为【娓娓道来的故事】风格，注重情感铺垫和画面感。";
        break;
      case 'translate':
        prompt = "如果原文是中文请翻译成地道的英文；如果是英文请翻译成中文。仅输出译文。";
        break;
      case 'custom':
        systemInstruction = "你是一个专业的配音脚本创作者。";
        prompt = `请根据以下主题或要求生成一段精彩的配音文案：${customTopic}`;
        break;
    }

    try {
      // 如果是自定义生成，且没有原文，我们允许原文为空
      const textToProcess = action === 'custom' ? (text || "无") : text;
      
      if (!textToProcess.trim() && action !== 'custom') {
        alert("请先输入需要处理的文字");
        setIsAiProcessing(false);
        return;
      }

      const newText = await optimizeScript(textToProcess, systemInstruction, prompt);
      setText(newText);
      setCustomTopic('');
    } catch (error) {
      console.error(error);
      alert("AI 处理失败，请重试");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded mr-2 uppercase tracking-wide">AI 助手</span>
            
            <div className="relative group">
                <button 
                    disabled={isAiProcessing || disabled}
                    onClick={() => handleAIAction('polish')}
                    className="p-2 hover:bg-white text-slate-600 hover:text-indigo-600 rounded-lg transition-all hover:shadow-sm border border-transparent hover:border-slate-200"
                    title="智能润色"
                >
                    <Sparkles className="w-4 h-4" />
                </button>
            </div>

            <button 
                disabled={isAiProcessing || disabled}
                onClick={() => handleAIAction('fix')}
                className="p-2 hover:bg-white text-slate-600 hover:text-emerald-600 rounded-lg transition-all hover:shadow-sm border border-transparent hover:border-slate-200"
                title="语法纠错"
            >
                <CheckCircle2 className="w-4 h-4" />
            </button>

            <button 
                disabled={isAiProcessing || disabled}
                onClick={() => handleAIAction('expand')}
                className="p-2 hover:bg-white text-slate-600 hover:text-blue-600 rounded-lg transition-all hover:shadow-sm border border-transparent hover:border-slate-200"
                title="内容扩写"
            >
                <Expand className="w-4 h-4" />
            </button>

             <button 
                disabled={isAiProcessing || disabled}
                onClick={() => handleAIAction('translate')}
                className="p-2 hover:bg-white text-slate-600 hover:text-orange-600 rounded-lg transition-all hover:shadow-sm border border-transparent hover:border-slate-200"
                title="中英互译"
            >
                <Languages className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-slate-300 mx-1"></div>

            <div className="relative">
                <button 
                    onClick={() => setShowAiMenu(!showAiMenu)}
                    disabled={isAiProcessing || disabled}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm ${showAiMenu ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
                >
                    <Wand2 className="w-3.5 h-3.5" />
                    创意生成
                </button>

                {showAiMenu && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-2 animate-in fade-in zoom-in-95 duration-200">
                        <div className="space-y-1">
                            <button onClick={() => handleAIAction('style_promo')} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 hover:text-indigo-600">
                                <span className="text-lg">📢</span> 广告宣传片风格
                            </button>
                            <button onClick={() => handleAIAction('style_story')} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 hover:text-indigo-600">
                                <span className="text-lg">📖</span> 情感故事风格
                            </button>
                            
                            <div className="border-t border-slate-100 my-1 pt-2 px-1">
                                <p className="text-[10px] text-slate-400 font-semibold mb-1 uppercase">自定义主题生成</p>
                                <div className="flex gap-1">
                                    <input 
                                        type="text" 
                                        value={customTopic}
                                        onChange={(e) => setCustomTopic(e.target.value)}
                                        placeholder="如：介绍火星"
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        onKeyDown={(e) => { if(e.key === 'Enter') handleAIAction('custom'); }}
                                    />
                                    <button 
                                        onClick={() => handleAIAction('custom')}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1.5 rounded shadow-sm transition-colors"
                                    >
                                        <MessageSquarePlus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="flex items-center gap-1">
            <button 
                onClick={copyToClipboard}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="复制文案"
            >
                <Copy className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setText('')}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="清空"
            >
                <Eraser className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Text Area */}
      <div className="relative flex-grow bg-white">
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在此输入文案，或使用上方 AI 工具生成..."
            disabled={disabled || isAiProcessing}
            maxLength={maxChars}
            className="w-full h-full p-6 text-base leading-relaxed text-slate-800 placeholder-slate-400 outline-none resize-none scroll-smooth bg-transparent"
            style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
        />
        
        {/* Loading Overlay */}
        {isAiProcessing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                <p className="text-indigo-900 font-semibold text-sm animate-pulse">AI 正在思考创作中...</p>
            </div>
        )}

        {/* Char Counter */}
        <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            {text.length} / {maxChars}
        </div>
      </div>
    </div>
  );
};

export default ScriptEditor;