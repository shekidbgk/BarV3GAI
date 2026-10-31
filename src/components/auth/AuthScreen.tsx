import React, { useEffect, useState } from 'react';
import {
  Wine,
  Lock,
  User as UserIcon,
  Building2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ChevronDown,
  ChevronUp,
  LogIn,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { ROLE_DEFINITIONS, User } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const AuthScreen: React.FC = () => {
  const { login, registerVenue, venue, venues, users, outlets } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // 3 fields for Login: Код/Название заведения, Логин/Имя, Пароль
  const [venueCode, setVenueCode] = useState(venue.venueCode || 'BAR777');
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showAccountsHelper, setShowAccountsHelper] = useState(true);

  useEffect(() => {
    if (venue?.venueCode) {
      setVenueCode(venue.venueCode);
    }
  }, [venue?.venueCode]);

  // Register form state
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueCode, setNewVenueCode] = useState('');
  const [newAdminLogin, setNewAdminLogin] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const res = login(venueCode, loginInput, passwordInput);
    if (!res.success) {
      setLoginError(res.error || 'Ошибка входа');
    }
  };

  const handleQuickFill = (u: User) => {
    setLoginError(null);
    setVenueCode(u.venueCode || venue.venueCode || 'BAR777');
    setLoginInput(u.login);
    setPasswordInput(u.password || '123');
  };

  const handleInstantLogin = (u: User) => {
    setLoginError(null);
    const targetVenue = u.venueCode || venue.venueCode || 'BAR777';
    const targetPass = u.password || '123';
    setVenueCode(targetVenue);
    setLoginInput(u.login);
    setPasswordInput(targetPass);
    const res = login(targetVenue, u.login, targetPass);
    if (!res.success) {
      setLoginError(res.error || 'Ошибка входа');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName.trim() || !newVenueCode.trim() || !newAdminLogin.trim()) {
      return;
    }
    registerVenue(newVenueName, newVenueCode, newAdminLogin, newAdminPassword);
    setRegisterSuccess(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between px-4 py-6 sm:py-10 max-w-lg mx-auto">
      {/* Brand Header */}
      <div className="text-center pt-2 pb-5">
        <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-neutral-900 to-amber-950/40 border border-amber-500/30 shadow-lg shadow-amber-500/10 mb-3.5">
          <Wine className="w-9 h-9 text-amber-400" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-amber-400">
            BAR<span className="text-neutral-100">OPS</span>
          </h1>
          <span className="text-[10px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
            B2B SaaS
          </span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xs mx-auto">
          Мобильная операционная система для баров, кухонь и ресторанного сервиса
        </p>
      </div>

      {/* Main Card with Tabs */}
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 shadow-2xl p-5 sm:p-6 backdrop-blur-md space-y-5">
        <div className="grid grid-cols-2 p-1 rounded-xl bg-neutral-950/80 border border-neutral-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError(null);
            }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
              activeTab === 'login'
                ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Вход в заведение
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setLoginError(null);
            }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
              activeTab === 'register'
                ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Привязка заведения
          </button>
        </div>

        {/* Tab 1: Login Form + Available Accounts Directory */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {loginError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-venue-code"
                  className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider"
                >
                  Код или название заведения
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-venue-code"
                    type="text"
                    required
                    value={venueCode}
                    onChange={(e) => setVenueCode(e.target.value)}
                    placeholder="Например: BAR777 или Мята Lounge"
                    className="w-full rounded-xl bg-neutral-950 border border-neutral-700/80 pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono tracking-wide transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="auth-login"
                  className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider"
                >
                  Логин или ФИО сотрудника
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-login"
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Например: admin или Алексей Морозов"
                    className="w-full rounded-xl bg-neutral-950 border border-neutral-700/80 pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider"
                >
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-password"
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="По умолчанию: 123"
                    className="w-full rounded-xl bg-neutral-950 border border-neutral-700/80 pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.99] transition"
              >
                Войти
              </button>
            </form>

            {/* Interactive Available Organizations & Users Helper */}
            <div className="rounded-xl bg-neutral-950/90 border border-neutral-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAccountsHelper((prev) => !prev)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-semibold text-amber-300 hover:bg-neutral-900/60 transition"
              >
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Доступные организации и сотрудники ({users.length})</span>
                </span>
                {showAccountsHelper ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              {showAccountsHelper && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-neutral-800/80 space-y-2.5">
                  {/* Organizations & Outlets badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                      Организации:
                    </span>
                    {venues.map((v) => (
                      <button
                        key={v.venueCode}
                        type="button"
                        onClick={() => setVenueCode(v.venueCode)}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border font-mono transition ${
                          venueCode.trim().toUpperCase() === v.venueCode.toUpperCase()
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        {v.venueCode} ({v.name})
                      </button>
                    ))}
                    {outlets.length > 0 && (
                      <span className="text-[10px] text-neutral-500">
                        • Точки: {outlets.map((o) => o.name).join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Users list */}
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                    {users.map((u) => {
                      const roleDef = ROLE_DEFINITIONS[u.role] || ROLE_DEFINITIONS.bartender;
                      const isSelected =
                        loginInput.trim().toLowerCase() === u.login.toLowerCase();

                      return (
                        <div
                          key={u.id}
                          onClick={() => handleQuickFill(u)}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500/40'
                              : 'bg-neutral-900/70 border-neutral-800/90 hover:border-neutral-700'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-neutral-100 truncate">
                                {u.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${roleDef.badgeColor}`}
                              >
                                {roleDef.label}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                              <span>
                                Код: <strong className="text-amber-300">{u.venueCode}</strong>
                              </span>
                              <span>
                                Логин: <strong className="text-neutral-200">{u.login}</strong>
                              </span>
                              <span>
                                Пароль: <strong className="text-neutral-200">{u.password || '123'}</strong>
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInstantLogin(u);
                            }}
                            aria-label={`Войти как ${u.name}`}
                            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-bold text-[11px] hover:bg-amber-400 active:scale-95 transition"
                          >
                            <LogIn className="w-3 h-3" />
                            <span>Войти</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Register / Bind New Venue Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {registerSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Заведение успешно зарегистрировано! Выполняется вход...</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
                Название заведения
              </label>
              <input
                type="text"
                required
                value={newVenueName}
                onChange={(e) => setNewVenueName(e.target.value)}
                placeholder="Название бара или ресторана"
                className="w-full rounded-xl bg-neutral-950 border border-neutral-700/80 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
                Код заведения
              </label>
              <input
                type="text"
                required
                value={newVenueCode}
                onChange={(e) => setNewVenueCode(e.target.value.toUpperCase())}
                placeholder="Например, CRAFT01"
                className="w-full rounded-xl bg-neutral-950 border border-neutral-700/80 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono uppercase tracking-wider transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
                Логин Администратора
              </label>
              <input
                type="text"
                required
                value={newAdminLogin}
                onChange={(e) => setNewAdminLogin(e.target.value)}
                placeholder="admin"
                className="w-full rounded-xl bg-neutral-950 border border-neutral-700/80 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
                Пароль Администратора
              </label>
              <input
                type="password"
                required
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-neutral-950 border border-neutral-700/80 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition"
            >
              Привязать заведение и войти
            </button>
          </form>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 flex items-center justify-between gap-3 text-xs text-neutral-500">
        <div>
          Активное заведение:{' '}
          <span className="font-mono text-amber-400 font-semibold">
            {venue.venueCode} ({venue.name})
          </span>
        </div>
        <PWAInstallButton compact />
      </div>
    </div>
  );
};

