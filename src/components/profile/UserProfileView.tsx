import React, { useRef, useState } from 'react';
import {
  User as UserIcon,
  Camera,
  Trash2,
  Building2,
  ShieldCheck,
  MapPin,
  Save,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { ROLE_DEFINITIONS } from '../../types';

const PRESET_AVATARS = [
  'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#f59e0b"/><circle cx="60" cy="45" r="22" fill="#09090b"/><path d="M24 105c6-22 22-32 36-32s30 10 36 32" fill="#09090b"/></svg>`
    ),
  'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#10b981"/><circle cx="60" cy="45" r="22" fill="#09090b"/><path d="M24 105c6-22 22-32 36-32s30 10 36 32" fill="#09090b"/></svg>`
    ),
  'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#6366f1"/><circle cx="60" cy="45" r="22" fill="#ffffff"/><path d="M24 105c6-22 22-32 36-32s30 10 36 32" fill="#ffffff"/></svg>`
    ),
];

interface UserProfileViewProps {
  onBack?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onBack }) => {
  const { currentUser, venue, outlets, updateCurrentUserProfile } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const [aboutMe, setAboutMe] = useState(currentUser.aboutMe || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [savedNotice, setSavedNotice] = useState(false);

  const roleDef = ROLE_DEFINITIONS[currentUser.role];
  const userOutlets = outlets.filter((o) => currentUser.outletIds.includes(o.id));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        updateCurrentUserProfile({ avatarUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    updateCurrentUserProfile({ avatarUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectPresetAvatar = (preset: string) => {
    setAvatarUrl(preset);
    updateCurrentUserProfile({ avatarUrl: preset });
  };

  const handleSaveAboutMe = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({ aboutMe: aboutMe.trim(), avatarUrl });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
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
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-100">Профиль пользователя</h2>
            <p className="text-[11px] text-neutral-400">
              Личная карточка сотрудника и настройки аватара
            </p>
          </div>
        </div>
      </div>

      {/* 1. Avatar Management Block */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
          1. Аватар пользователя
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={currentUser.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-500/50 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-amber-500/15 border-2 border-dashed border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold text-2xl">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2.5 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profile-avatar-upload"
              />
              <label
                htmlFor="profile-avatar-upload"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 cursor-pointer transition active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{avatarUrl ? 'Изменить фото' : 'Загрузить фото'}</span>
              </label>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/25 transition active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Удалить аватар</span>
                </button>
              )}
            </div>

            <div className="pt-1">
              <span className="text-[11px] text-neutral-400 block mb-1.5">
                Или выберите готовый корпоративный аватар:
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(preset)}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition ${
                      avatarUrl === preset
                        ? 'border-amber-400 scale-105'
                        : 'border-neutral-700 opacity-75 hover:opacity-100'
                    }`}
                    aria-label={`Выбрать аватар ${idx + 1}`}
                  >
                    <img src={preset} alt={`Аватар ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. User Account & Role Information (Read-only for non-admins) */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
          2. Информация о пользователе
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">
              ФИО сотрудника
            </span>
            <span className="text-sm font-bold text-neutral-100 mt-0.5 block">
              {currentUser.name}
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              Логин: {currentUser.login}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">
              Группа / Роль в системе
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${roleDef.badgeColor}`}>
                {roleDef.label}
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block">
              {roleDef.description}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-amber-400" /> Заведение
            </span>
            <span className="text-sm font-bold text-neutral-100 mt-0.5 block">
              {venue.name}
            </span>
            <span className="text-[11px] text-amber-400 font-mono">
              Код заведения: {venue.venueCode}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" /> Привязанные точки продаж
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {userOutlets.map((o) => (
                <span
                  key={o.id}
                  className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-200"
                >
                  {o.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {currentUser.role !== 'admin' && (
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Смена группы пользователя и структуры заведения доступна только группе «Администратор».
            </span>
          </div>
        )}
      </div>

      {/* 3. Editable "О себе" Section */}
      <form
        onSubmit={handleSaveAboutMe}
        className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
            3. Информация от пользователя («О себе»)
          </div>
          {savedNotice && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Сохранено
            </span>
          )}
        </div>

        <p className="text-xs text-neutral-400">
          Расскажите о своей специализации, графике смен, профессиональных навыках или контактных данных для коллег:
        </p>

        <textarea
          rows={4}
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
          placeholder="Заполните информацию о себе..."
          aria-label="О себе"
          className="w-full rounded-xl bg-neutral-950 border border-neutral-700 p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none leading-relaxed"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 active:scale-95 transition shadow-md shadow-amber-500/10"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Сохранить профиль</span>
          </button>
        </div>
      </form>
    </div>
  );
};
