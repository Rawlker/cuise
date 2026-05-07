import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Timer as TimerIcon } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import { useTranslation } from 'react-i18next';

interface TimerProps {
  initialMinutes?: number;
}

export const Timer: React.FC<TimerProps> = ({ initialMinutes = 5 }) => {
  const { t } = useTranslation();
  const [inputMins, setInputMins] = useState(initialMinutes);
  const { seconds, isActive, start, pause, reset, formatTime } = useTimer(inputMins * 60);

  const handleReset = () => {
    reset(inputMins * 60);
  };

  return (
    <div className="bg-amber-500/5 p-6 rounded-[2rem] border-2 border-amber-500/20 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-surface-app rounded-xl shadow-sm">
            <TimerIcon size={20} className="text-primary" />
          </div>
          <span className="font-bold text-text-app/60 uppercase tracking-widest text-xs">{t('timer')}</span>
        </div>
        <div className="flex items-center gap-2 bg-surface-app px-3 py-1 rounded-full shadow-sm border border-border-app">
          <input 
            type="number" 
            value={inputMins}
            onChange={(e) => setInputMins(Number(e.target.value))}
            className="w-8 bg-transparent text-center font-bold text-sm focus:outline-none text-text-app"
          />
          <span className="text-[10px] font-bold text-text-app/40 uppercase">{t('min')}</span>
        </div>
      </div>
      
      <div className="text-5xl font-black text-center mb-6 tracking-tighter text-text-app tabular-nums">
        {formatTime(seconds)}
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={isActive ? pause : start}
          className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all duration-300 shadow-lg ${
            isActive 
              ? 'bg-surface-app text-text-app/60' 
              : 'bg-primary text-white shadow-primary/30 hover:scale-105 active:scale-95'
          }`}
        >
          {isActive ? <><Pause size={20} /> {t('pause')}</> : <><Play size={20} /> {t('start')}</>}
        </button>
        <button 
          onClick={handleReset}
          className="p-4 rounded-2xl bg-surface-app text-text-app/40 hover:text-primary transition-all shadow-md hover:scale-105"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};
