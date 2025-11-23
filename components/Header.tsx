import React from 'react';
import { Mic, Waves } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Mic className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">VoxGen Pro</h1>
            <p className="text-xs text-slate-400">AI 智能配音工作室</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-4 text-sm font-medium text-slate-400">
          <div className="flex items-center space-x-1">
             <Waves className="w-4 h-4" />
             <span>Gemini 2.5 Flash 语音合成</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;