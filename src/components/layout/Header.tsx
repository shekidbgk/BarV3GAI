import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  MapPin,
  Bell,
  ChevronDown,
  Check,
  CheckCheck,
  Trash2,
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

interface HeaderProps {
  onOpenSideMenu: () => void;
  onNavigate: (screen: ActiveScreenType) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSideMenu, onNavigate }) => {
  const {
    currentUser,
    currentOutletId,
    setCurrentOutletId,
    outlets,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useApp();

  const [isOutletOpen, setIsOutletOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const outletRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (outletRef.current && !outletRef.current.contains(e.target as Node)) {
        setIsOutletOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const accessibleOutlets =
    currentUser.role === 'admin'
      ? outlets
      : outlets.filter((o) => currentUser.outletIds.includes(o.id));

  const currentOutlet =
    outlets.find((o) => o.id === currentOutletId) || accessibleOutlets[0] || outlets[0];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleDef = ROLE_DEFINITIONS[currentUser.role];
  const RoleIcon = ROLE_ICONS[currentUser.role];

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 px-3 sm:px-4 py-2.5">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Hamburger Menu Button + Outlet Selector Dropdown */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSideMenu}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 text-neutral-200 hover:text-amber-400 transition active:scale-95"
            aria-label="Открыть боковое меню"
            title="Меню"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative" ref={outletRef}>
            <button
              type="button"
              onClick={() => setIsOutletOpen(!isOutletOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 text-left transition active:scale-95"
              aria-label="Выбрать точку продаж"
            >
              <div className="w-5 h-5 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
                <MapPin className="w-3 h-3" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-neutral-400 leading-none">
                  Точка
                </span>
                <span className="text-xs font-semibold text-neutral-100 max-w-[100px] sm:max-w-[140px] truncate leading-tight">
                  {currentOutlet ? currentOutlet.name : 'Выбрать'}
                </span>
              </div>
              <ChevronDown
                className={`w-3 h-3 text-neutral-400 transition-transform ${
                  isOutletOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isOutletOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-2 py-1 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Доступные точки ({accessibleOutlets.length})
                </div>
                {accessibleOutlets.map((outlet) => (
                  <button
                    key={outlet.id}
                    type="button"
                    onClick={() => {
                      setCurrentOutletId(outlet.id);
                      setIsOutletOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                      outlet.id === currentOutlet?.id
                        ? 'bg-amber-500/20 text-amber-300 font-semibold'
                        : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span>{outlet.name}</span>
                      {outlet.address && (
                        <span className="text-[10px] text-neutral-500 truncate max-w-[160px]">
                          {outlet.address}
                        </span>
                      )}
                    </div>
                    {outlet.id === currentOutlet?.id && (
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls: User Profile Badge & Notifications Bell */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 transition"
            title="Открыть профиль пользователя"
            aria-label={`Профиль: ${currentUser.name} (${roleDef.label})`}
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <RoleIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span className="text-xs font-semibold text-amber-300 max-w-[110px] truncate">
              {roleDef.label}
            </span>
          </button>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition active:scale-95"
              aria-label="Уведомления"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-neutral-950 shadow-md animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-1 text-left">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-neutral-100 uppercase tracking-wider">
                      Уведомления {unreadCount > 0 && `(${unreadCount})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="p-1 rounded text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition"
                        title="Прочитать все"
                        aria-label="Прочитать все уведомления"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={clearNotifications}
                        className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition"
                        title="Очистить список"
                        aria-label="Очистить все уведомления"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-neutral-500">
                      Нет новых уведомлений
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer ${
                          n.read
                            ? 'bg-neutral-950/40 border-neutral-800/60 text-neutral-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-neutral-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-semibold ${
                              n.read ? 'text-neutral-300' : 'text-amber-300'
                            }`}
                          >
                            {n.title}
                          </span>
                          <span className="text-[10px] text-neutral-500">{n.timestamp}</span>
                        </div>
                        <p className="text-xs leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
