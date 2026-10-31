import React, { useState } from 'react';
import {
  Info,
  MessageSquare,
  Send,
  CheckCircle2,
  ArrowLeft,
  Wine,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { FeedbackMessage } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface AppInfoViewProps {
  onBack?: () => void;
}

export const AppInfoView: React.FC<AppInfoViewProps> = ({ onBack }) => {
  const { venue, feedbacks, submitFeedback } = useApp();

  const [category, setCategory] = useState<FeedbackMessage['category']>('suggestion');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    submitFeedback(category, message);
    setMessage('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 4000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-900/60 border border-neutral-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-amber-400 transition"
              aria-label="Назад"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-100">Информация о приложении</h2>
            <p className="text-[11px] text-neutral-400">
              Сведения о версии BarOps и форма обратной связи
            </p>
          </div>
        </div>
      </div>

      {/* App Version Card */}
      <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Wine className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-neutral-100">BarOps B2B SaaS</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                Версия 2.4.0
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Операционная система для управления барами, кухнями и ресторанным сервисом
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">
              Сборка и платформа
            </span>
            <span className="font-semibold text-neutral-200 mt-0.5 block">
              Release 2026.10 (PWA Ready)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">
              Активное заведение
            </span>
            <span className="font-semibold text-amber-400 mt-0.5 block">
              {venue.name} ({venue.venueCode})
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Модули: Чек-листы, Задания, ТТК, Заявки, Склад Бара и Кухни</span>
          </div>
          <PWAInstallButton compact />
        </div>
      </div>

      {/* Feedback Form Block */}
      <form
        onSubmit={handleFeedbackSubmit}
        className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3.5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <MessageSquare className="w-4 h-4" />
            <span>Блок обратной связи</span>
          </div>
          {sentSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Отправлено!
            </span>
          )}
        </div>

        <p className="text-xs text-neutral-400">
          Есть предложения по улучшению работы чек-листов, ТТК или складского учета? Напишите нам:
        </p>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Тема обращения
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FeedbackMessage['category'])}
            className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-neutral-100 focus:border-amber-400 focus:outline-none"
          >
            <option value="suggestion">Предложение по улучшению функционала</option>
            <option value="bug">Сообщение об ошибке в работе</option>
            <option value="question">Вопрос по настройке заведения</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Ваше сообщение *
          </label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Опишите вашу идею, замечание или вопрос..."
            className="w-full rounded-xl bg-neutral-950 border border-neutral-700 p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 active:scale-95 transition shadow-md shadow-amber-500/10"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Отправить обратную связь</span>
        </button>
      </form>

      {/* Sent Feedback History */}
      {feedbacks.length > 0 && (
        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Отправленные обращения ({feedbacks.length})
          </div>
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span className="font-semibold text-amber-400">{fb.userName}</span>
                <span>{fb.createdAt}</span>
              </div>
              <p className="text-neutral-200">{fb.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
