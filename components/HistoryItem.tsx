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
    <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
      <audio ref={audioRef} src={item.blobUrl} />
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
           <div className="bg-indigo-50 p-1.5 rounded-full">
            <UserCircle className="w-4 h-4 text-indigo-600" />
           </div>
           <span className="text-sm font-bold text-slate-800">{item.voice}</span>
           <span className="text-xs text-slate-300">•</span>
           <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
             <Clock className="w-3 h-3" />
             {new Date(item.timestamp).toLocaleTimeString('zh-CN')}
           </span>
        </div>
        <button 
          onClick={() => onDelete(item.id)}
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
          title="删除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <p className="text-slate-600 text-sm mb-5 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
        "{item.text}"
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white transition-all shadow-md shadow-indigo-200 hover:scale-105 active:scale-95"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>
        
        <div className="flex-grow bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div 
            className="bg-indigo-500 h-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <button
          onClick={handleDownload}
          className="flex-shrink-0 w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600 flex items-center justify-center text-slate-500 transition-all"
          title="下载 WAV"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default HistoryItem;