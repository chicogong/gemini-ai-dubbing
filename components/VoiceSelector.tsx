import React from 'react';
import { VoiceName, VoiceOption } from '../types';
import { VOICES } from '../constants';
import { User, Sparkles, Volume2 } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onSelectVoice: (voice: VoiceName) => void;
  disabled: boolean;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onSelectVoice, disabled }) => {
  return (
    <div className="mb-4">
      <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-indigo-600" />
        选择声音角色
      </label>
      
      {/* Horizontal Scrollable List for Compactness */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {VOICES.map((voice: VoiceOption) => (
          <button
            key={voice.id}
            onClick={() => onSelectVoice(voice.id)}
            disabled={disabled}
            className={`
              relative flex-shrink-0 w-48 p-3 rounded-xl border text-left transition-all duration-200
              flex flex-col gap-1.5 group
              ${
                selectedVoice === voice.id
                  ? 'bg-indigo-50 border-indigo-500 shadow-md shadow-indigo-100 ring-1 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex justify-between items-center w-full">
              <span className={`font-bold text-sm ${selectedVoice === voice.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                {voice.name}
              </span>
              <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-medium ${
                voice.gender === 'Male' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-pink-100 text-pink-700'
              }`}>
                {voice.gender === 'Male' ? '男声' : '女声'}
              </span>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-tight line-clamp-2 h-8">
              {voice.description}
            </p>

            {selectedVoice === voice.id && (
              <div className="absolute top-2 right-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoiceSelector;