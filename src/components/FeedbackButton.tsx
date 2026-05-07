import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, X, Send, ThumbsUp, ThumbsDown, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { set, get } from 'idb-keyval';

type FeedbackType = 'bug' | 'feature' | 'general' | null;
type Rating = 'up' | 'down' | null;

interface FeedbackEntry {
  id: string;
  type: string;
  message: string;
  email?: string;
  rating: Rating;
  timestamp: number;
}

const STORAGE_KEY = 'cuise-feedback';
// Placeholder for Formspree ID - User can replace this later
const FORMSPREE_ID = 'mjvnnrqy'; 

export const FeedbackButton: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<Rating>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!type || !message.trim() || !rating) {
      setShowValidation(true);
      return;
    }

    setIsSending(true);
    setError(false);
    setShowValidation(false);

    const feedback: FeedbackEntry = {
      id: Date.now().toString(),
      type: type as string,
      message,
      email,
      rating,
      timestamp: Date.now(),
    };

    try {
      // 1. Save to IndexedDB
      const existing = await get<FeedbackEntry[]>(STORAGE_KEY) || [];
      await set(STORAGE_KEY, [...existing, feedback]);

      // 2. Send to Formspree
      const response = await fetch("https://formspree.io/f/mjglorbe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackType: feedback.type,
          message: feedback.message,
          email: feedback.email,
          rating: feedback.rating
        })
      });

      if (!response.ok) throw new Error('Formspree error');

      setIsSent(true);
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
      }, 4000);
    } catch (err) {
      console.error('Feedback error:', err);
      setError(true);
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setType(null);
    setMessage('');
    setEmail('');
    setRating(null);
    setIsSent(false);
    setError(false);
    setShowValidation(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-primary text-text-app rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-[100] group"
      >
        <Star size={24} />
        <div className="absolute bottom-0 right-16 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none mb-1">
          <div className="bg-surface-app border border-border-app rounded-lg shadow-lg px-3 py-2 whitespace-nowrap text-right">
            <p className="text-text-app text-sm font-medium">{t('feedback_tooltip')}</p>
            <p className="text-text-app/60 text-xs">{t('feedback_tooltip_sub')}</p>
          </div>
          <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-border-app ml-[-1px] relative">
            <div className="absolute top-[-6px] left-[-9px] w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-surface-app"></div>
          </div>
        </div>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-bg-app/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-bg-app rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border-app">
            <div className="p-8 border-b border-border-app flex justify-between items-center bg-surface-app">
              <h3 className="text-2xl font-black text-text-app">{t('feedback')}</h3>
              <button 
                onClick={() => { setIsOpen(false); resetForm(); }}
                className="p-2 rounded-full hover:bg-surface-app transition text-text-app/60"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              {isSent ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                    <CheckCircle2 size={48} />
                  </div>
                  <p className="text-xl font-bold text-center text-text-app">{t('feedback_sent')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-text-app/40 mb-3">
                      {t('feedback_type')}*
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['bug', 'feature', 'general'] as ('bug' | 'feature' | 'general')[]).map((tValue) => (
                        <button
                          key={tValue}
                          type="button"
                          onClick={() => setType(tValue)}
                          className={`py-3 px-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all border-2 ${
                            type === tValue 
                              ? 'bg-primary border-primary text-text-app shadow-lg shadow-primary/20' 
                              : 'bg-surface-app border-transparent text-text-app/50 hover:bg-surface-app/80'
                          }`}
                        >
                          {t(tValue === 'bug' ? 'bug_report' : tValue === 'feature' ? 'feature_request' : 'general_feedback')}
                        </button>
                      ))}
                    </div>
                    {showValidation && !type && (
                      <p className="text-red-500 text-[10px] font-bold mt-2 flex items-center gap-1">
                        <AlertCircle size={12} /> {t('required_field')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-text-app/40 mb-3">
                      {t('message')}*
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t('message')}
                      className={`w-full px-4 py-4 rounded-2xl bg-surface-app border-2 outline-none transition-all h-32 resize-none text-text-app ${
                        showValidation && !message.trim() ? 'border-red-500/50' : 'border-transparent focus:border-primary/30'
                      }`}
                    />
                    {showValidation && !message.trim() && (
                      <p className="text-red-500 text-[10px] font-bold mt-2 flex items-center gap-1">
                        <AlertCircle size={12} /> {t('required_field')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-text-app/40 mb-3">
                      {t('email_optional')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-4 py-4 rounded-2xl bg-surface-app border-2 border-transparent focus:border-primary/30 outline-none transition-all text-text-app"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-text-app/40 mb-3">
                        {t('rating')}*
                      </label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setRating(rating === 'up' ? null : 'up')}
                          className={`p-3 rounded-xl transition-all ${
                            rating === 'up' ? 'bg-green-500 text-text-app shadow-lg shadow-green-500/20 scale-110' : 'bg-surface-app text-text-app/40'
                          } ${showValidation && !rating ? 'ring-2 ring-red-500/50' : ''}`}
                        >
                          <ThumbsUp size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRating(rating === 'down' ? null : 'down')}
                          className={`p-3 rounded-xl transition-all ${
                            rating === 'down' ? 'bg-red-500 text-text-app shadow-lg shadow-red-500/20 scale-110' : 'bg-surface-app text-text-app/40'
                          } ${showValidation && !rating ? 'ring-2 ring-red-500/50' : ''}`}
                        >
                          <ThumbsDown size={20} />
                        </button>
                      </div>
                      {showValidation && !rating && (
                        <p className="text-red-500 text-[10px] font-bold mt-2 flex items-center gap-1">
                          <AlertCircle size={12} /> {t('required_field')}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSending}
                      className="px-8 py-4 bg-primary text-text-app rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                      {t('send_feedback')}
                    </button>
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm font-medium text-center bg-red-500/10 py-2 rounded-xl">
                      {t('feedback_error')}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
