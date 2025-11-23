import React from 'react';
import { VoiceName, VoiceOption } from '../types';
import { VOICES } from '../constants';
import { User, Sparkles } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onSelectVoice: (voice: VoiceName) => void;
  disabled: boolean;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onSelectVoice, disabled }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
        <User className="w-4 h-4" />
        选择声音角色
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {VOICES.map((voice: VoiceOption) => (
          <button
            key={voice.id}
            onClick={() => onSelectVoice(voice.id)}
            disabled={disabled}
            className={`
              relative p-4 rounded-xl border text-left transition-all duration-200
              flex flex-col gap-2 group
              ${
                selectedVoice === voice.id
                  ? 'bg-indigo-900/30 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-800/80'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex justify-between items-start w-full">
              <span className={`font-semibold ${selectedVoice === voice.id ? 'text-white' : 'text-slate-200'}`}>
                {voice.name}
              </span>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                voice.gender === 'Male' ? 'bg-blue-900/50 text-blue-300' : 'bg-pink-900/50 text-pink-300'
              }`}>
                {voice.gender === 'Male' ? '男声' : '女声'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {voice.description}
            </p>
            {selectedVoice === voice.id && (
              <div className="absolute top-2 right-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoiceSelector;