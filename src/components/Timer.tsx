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
    <div className="bg-amber-50/50 dark:bg-amber-900/5 p-6 rounded-[2rem] border-2 border-amber-100/50 dark:border-amber-900/20 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <TimerIcon size={20} className="text-primary" />
          </div>
          <span className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-xs">{t('timer')}</span>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
          <input 
            type="number" 
            value={inputMins}
            onChange={(e) => setInputMins(Number(e.target.value))}
            className="w-8 bg-transparent text-center font-bold text-sm focus:outline-none"
          />
          <span className="text-[10px] font-bold text-gray-400 uppercase">{t('min')}</span>
        </div>
      </div>
      
      <div className="text-5xl font-black text-center mb-6 tracking-tighter text-gray-900 dark:text-white tabular-nums">
        {formatTime(seconds)}
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={isActive ? pause : start}
          className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all duration-300 shadow-lg ${
            isActive 
              ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' 
              : 'bg-primary text-white shadow-primary/30 hover:scale-105 active:scale-95'
          }`}
        >
          {isActive ? <><Pause size={20} /> {t('pause')}</> : <><Play size={20} /> {t('start')}</>}
        </button>
        <button 
          onClick={handleReset}
          className="p-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-400 hover:text-primary transition-all shadow-md hover:scale-105"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};
