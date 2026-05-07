import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Timer as TimerIcon, Play, Pause, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Recipe } from '../types';
import { useTimer } from '../hooks/useTimer';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  // Split instructions into steps
  const steps = useMemo(() => {
    if (!recipe.instructions) return [];
    
    // Split by newlines and filter empty lines
    let rawSteps = recipe.instructions
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    // If we only have one long step, try splitting by sentences
    if (rawSteps.length <= 1) {
      rawSteps = recipe.instructions
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
    
    return rawSteps;
  }, [recipe.instructions]);

  // Extract timer from step text
  const extractTime = useCallback((text: string) => {
    const regex = /(\d+)\s*(minutes|mins|min|minutos|minuto)/i;
    const match = text.match(regex);
    return match ? parseInt(match[1], 10) : null;
  }, []);

  const timeInStep = steps[currentStep] ? extractTime(steps[currentStep]) : null;
  const { seconds, isActive, start, pause, reset, formatTime } = useTimer((timeInStep || 0) * 60);

  // Reset timer when step changes
  useEffect(() => {
    if (timeInStep) {
      reset(timeInStep * 60);
    } else {
      reset(0);
    }
  }, [currentStep, timeInStep, reset]);

  // WakeLock API
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.error('WakeLock error:', err);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, []);

  if (steps.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-1">{t('cooking_mode')}</h2>
          <p className="text-lg font-bold truncate max-w-[200px] md:max-w-md">{recipe.title}</p>
        </div>
        <button 
          onClick={onClose}
          className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-500 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 max-w-4xl mx-auto w-full">
        <div className="min-h-full flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-8 px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm uppercase tracking-widest">
            {t('step_of', { current: currentStep + 1, total: steps.length })}
          </div>
          
          <p 
            className="font-bold leading-tight md:leading-snug dark:text-white mb-12 transition-all duration-300"
            style={{ 
              fontSize: steps[currentStep].length > 400 ? '1.5rem' : 
                        steps[currentStep].length > 200 ? '2rem' : 
                        steps[currentStep].length > 100 ? '2.5rem' : '3rem',
              lineHeight: '1.2'
            }}
          >
            {steps[currentStep]}
          </p>

          {timeInStep && (
            <div className="w-full max-w-md bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[3rem] border-2 border-amber-100 dark:border-amber-900/20 shadow-xl animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-center gap-3 mb-4">
                <TimerIcon className="text-primary" size={24} />
                <span className="font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">{t('timer')}</span>
              </div>
              <div className="text-7xl font-black mb-8 tabular-nums dark:text-white">
                {formatTime(seconds)}
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={isActive ? pause : start}
                  className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all ${
                    isActive 
                      ? 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300' 
                      : 'bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105'
                  }`}
                >
                  {isActive ? <><Pause size={24} /> {t('pause')}</> : <><Play size={24} /> {t('start')}</>}
                </button>
                <button 
                  onClick={() => reset(timeInStep * 60)}
                  className="p-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-400 hover:text-primary shadow-md"
                >
                  <RotateCcw size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 md:p-10 border-t dark:border-gray-800 flex gap-4 md:gap-8 max-w-4xl mx-auto w-full">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex-1 flex items-center justify-center gap-3 p-6 md:p-8 rounded-[2rem] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-xl md:text-2xl disabled:opacity-30 transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ChevronLeft size={32} />
          {t('previous')}
        </button>
        <button
          onClick={() => {
            if (currentStep < steps.length - 1) {
              setCurrentStep(currentStep + 1);
            } else {
              onClose();
            }
          }}
          className="flex-1 flex items-center justify-center gap-3 p-6 md:p-8 rounded-[2rem] bg-primary text-white font-black text-xl md:text-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          {currentStep === steps.length - 1 ? t('exit') : t('next')}
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};
