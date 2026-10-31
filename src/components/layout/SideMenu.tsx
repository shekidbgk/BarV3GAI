import React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User as UserIcon,
  Settings,
  Sliders,
  Info,
  LogOut,
  ChevronRight,
  Building2,
  Wine,
  Shield,
  ChefHat,
  GlassWater,
  Flame,
  UtensilsCrossed,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { ActiveScreenType, Role, ROLE_DEFINITIONS } from '../../types';

const ROLE_ICONS: Record<Role, React.ComponentType<{ className?: string }>> = {
  admin: Shield,
  head_bartender: Wine,
  head_chef: ChefHat,
  bartender: GlassWater,
  cook: Flame,
  waiter: UtensilsCrossed,
};

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreen: ActiveScreenType;
  onNavigate: (screen: ActiveScreenType) => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  activeScreen,
  onNavigate,
}) => {
  const { currentUser, venue, logout, preferences } = useApp();

  if (!isOpen || !currentUser) return null;

  const roleDef = ROLE_DEFINITIONS[currentUser.role];
  const RoleIcon = ROLE_ICONS[currentUser.role];
  const isAdmin = currentUser.role === 'admin';

  const handleSelect = (screen: ActiveScreenType) => {
    onNavigate(screen);
    onClose();
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Боковое меню навигации"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Left Panel */}
      <aside className="relative z-10 w-80 max-w-[85vw] bg-neutral-900 border-r border-neutral-800 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Top User Summary & Close */}
        <div>
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Wine className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-extrabold tracking-wider text-amber-400">
                  BAR<span className="text-neutral-100">OPS</span>
                </span>
                <span className="block text-[10px] text-neutral-400 leading-none">
                  Меню управления
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-100 transition"
              aria-label="Закрыть боковое меню"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current User Card */}
          <div className="p-4 border-b border-neutral-800 bg-neutral-950/50">
            <div className="flex items-center gap-3">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-amber-500/40 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base shrink-0">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-neutral-100 truncate">
                  {currentUser.name}
                </div>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md border text-[10px] font-bold bg-amber-500/15 text-amber-300 border-amber-500/30">
                  <RoleIcon className="w-3 h-3" />
                  <span>{roleDef.label}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-neutral-400 truncate">
                  <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">
                    {venue.name} ({venue.venueCode})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-3 space-y-1.5" aria-label="Пункты бокового меню">
            {/* 1. Профиль пользователя */}
            <button
              type="button"
              onClick={() => handleSelect('profile')}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                activeScreen === 'profile'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                  : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-200 hover:bg-neutral-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Профиль пользователя</div>
                  <div className="text-[10px] text-neutral-400">
                    Аватар, роль, заведение и о себе
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </button>

            {/* 2. Системные настройки (только для Администратора) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleSelect('settings')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                  activeScreen === 'settings'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                    : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-200 hover:bg-neutral-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Системные настройки</div>
                    <div className="text-[10px] text-neutral-400">
                      Точки продаж, персонал и права групп
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>
            )}

            {/* 3. Настройки приложения */}
            <button
              type="button"
              onClick={() => handleSelect('app_settings')}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                activeScreen === 'app_settings'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                  : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-200 hover:bg-neutral-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Настройки приложения</div>
                  <div className="text-[10px] text-neutral-400">
                    Тема ({preferences.theme === 'dark' ? 'Темная' : 'Светлая'}), звук и уведомления
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </button>

            {/* 4. Информация о приложении */}
            <button
              type="button"
              onClick={() => handleSelect('app_info')}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                activeScreen === 'app_info'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                  : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-200 hover:bg-neutral-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Информация о приложении</div>
                  <div className="text-[10px] text-neutral-400">
                    Версия системы и обратная связь
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </button>
          </nav>
        </div>

        {/* Bottom Logout Action */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/40">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 font-bold text-xs transition active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Выход из приложения</span>
          </button>
        </div>
      </aside>
    </div>,
    document.body
  );
};
