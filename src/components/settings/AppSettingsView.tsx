import React from 'react';
import {
  Sliders,
  Moon,
  Sun,
  Bell,
  BellOff,
  Volume2,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { NOTIFICATION_SOUND_LABELS, NotificationSound } from '../../types';
import { playNotificationSound } from '../../utils/sound';

interface AppSettingsViewProps {
  onBack?: () => void;
}

export const AppSettingsView: React.FC<AppSettingsViewProps> = ({ onBack }) => {
  const { preferences, updatePreferences } = useApp();

  const sounds: NotificationSound[] = ['chime', 'bell', 'crystal', 'ping'];

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
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-100">Настройки приложения</h2>
            <p className="text-[11px] text-neutral-400">
              Персонализация темы оформления и звуковых уведомлений
            </p>
          </div>
        </div>
      </div>

      {/* 1. Theme Selection */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Тема оформления
        </div>
        <p className="text-xs text-neutral-400">
          Выберите комфортный режим отображения интерфейса (по умолчанию используется темная тема для работы в условиях приглушенного света бара):
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => updatePreferences({ theme: 'dark' })}
            className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition ${
              preferences.theme === 'dark'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold">Темная</div>
                <div className="text-[10px] text-neutral-400">По умолчанию</div>
              </div>
            </div>
            {preferences.theme === 'dark' && <Check className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            type="button"
            onClick={() => updatePreferences({ theme: 'light' })}
            className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition ${
              preferences.theme === 'light'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold">Светлая</div>
                <div className="text-[10px] text-neutral-400">Дневной режим</div>
              </div>
            </div>
            {preferences.theme === 'light' && <Check className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* 2. Notifications & Sound Selection */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Уведомления и звуковые сигналы
        </div>

        {/* Toggle Notifications */}
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {preferences.notificationsEnabled ? (
              <Bell className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <BellOff className="w-5 h-5 text-neutral-500 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold text-neutral-100">
                {preferences.notificationsEnabled
                  ? 'Уведомления включены'
                  : 'Уведомления отключены'}
              </div>
              <div className="text-[11px] text-neutral-400">
                Оповещения о новых задачах, заявках, чек-листах и инвентаризации
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={!preferences.notificationsEnabled}
              onChange={(e) =>
                updatePreferences({ notificationsEnabled: !e.target.checked })
              }
              className="sr-only peer"
              aria-label="Отключить уведомления"
            />
            <button
              type="button"
              onClick={() =>
                updatePreferences({
                  notificationsEnabled: !preferences.notificationsEnabled,
                })
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                preferences.notificationsEnabled
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
              }`}
            >
              {preferences.notificationsEnabled
                ? 'Отключить уведомления'
                : 'Включить уведомления'}
            </button>
          </label>
        </div>

        {/* Sound Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-neutral-300">
            Выбор звука уведомления:
          </label>

          <div className="space-y-2">
            {sounds.map((snd) => {
              const isSelected = preferences.notificationSound === snd;
              return (
                <div
                  key={snd}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      updatePreferences({ notificationSound: snd });
                      playNotificationSound(snd);
                    }}
                    className="flex-1 flex items-center gap-2.5 text-left"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-amber-400 bg-amber-400 text-neutral-950' : 'border-neutral-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-semibold">
                      {NOTIFICATION_SOUND_LABELS[snd]}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => playNotificationSound(snd)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-[11px] text-neutral-300 hover:text-amber-300 transition"
                    aria-label={`Прослушать ${NOTIFICATION_SOUND_LABELS[snd]}`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Тест</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
