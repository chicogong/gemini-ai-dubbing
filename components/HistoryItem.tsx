import React, { useRef, useState, useEffect } from 'react';
import { GeneratedAudio } from '../types';
import { Play, Pause, Download, Trash2, Clock, UserCircle } from 'lucide-react';

interface HistoryItemProps {
  item: GeneratedAudio;
  onDelete: (id: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onDelete }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = item.blobUrl;
    link.download = `voxgen_${item.voice}_${item.id.slice(0, 6)}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
      <audio ref={audioRef} src={item.blobUrl} />
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
           <div className="bg-slate-700 p-1.5 rounded-full">
            <UserCircle className="w-4 h-4 text-slate-300" />
           </div>
           <span className="text-sm font-medium text-slate-200">{item.voice}</span>
           <span className="text-xs text-slate-500">•</span>
           <span className="text-xs text-slate-500 flex items-center gap-1">
             <Clock className="w-3 h-3" />
             {new Date(item.timestamp).toLocaleTimeString('zh-CN')}
           </span>
        </div>
        <button 
          onClick={() => onDelete(item.id)}
          className="text-slate-500 hover:text-red-400 transition-colors"
          title="删除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <p className="text-slate-300 text-sm mb-4 line-clamp-2 italic font-light">
        "{item.text}"
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition-all shadow-lg shadow-indigo-900/20"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>
        
        <div className="flex-grow bg-slate-700 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-indigo-400 h-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <button
          onClick={handleDownload}
          className="flex-shrink-0 w-8 h-8 rounded-full border border-slate-600 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          title="下载 WAV"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default HistoryItem;