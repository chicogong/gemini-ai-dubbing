import React from 'react';
import { Mic, Waves } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-md shadow-indigo-200">
            <Mic className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">VoxGen Pro</h1>
            <p className="text-xs text-slate-500 font-medium">AI 智能配音工作室</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-4 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
          <div className="flex items-center space-x-1.5">
             <Waves className="w-3.5 h-3.5 text-indigo-500" />
             <span>Gemini 2.5 Flash 语音合成</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;