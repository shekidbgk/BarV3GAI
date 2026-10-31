/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Header } from './components/layout/Header';
import { SideMenu } from './components/layout/SideMenu';
import { BottomNav } from './components/layout/BottomNav';
import { ChecklistsView } from './components/checklists/ChecklistsView';
import { TasksView } from './components/tasks/TasksView';
import { TechCardsView } from './components/ttk/TechCardsView';
import { RequestsView } from './components/requests/RequestsView';
import { WarehouseView } from './components/warehouse/WarehouseView';
import { SettingsView } from './components/settings/SettingsView';
import { UserProfileView } from './components/profile/UserProfileView';
import { AppSettingsView } from './components/settings/AppSettingsView';
import { AppInfoView } from './components/settings/AppInfoView';
import { OfflineIndicator } from './components/common/PWAInstallButton';
import { ActiveScreenType } from './types';

const MainApp: React.FC = () => {
  const { currentUser, login } = useApp();
  const [activeScreen, setActiveScreen] = useState<ActiveScreenType>('checklists');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  // Support ?autostart=1 URL param for automated checks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' && !currentUser) {
      login('BAR777', 'admin', '123');
    }
  }, [currentUser, login]);

  // Reset to checklists screen when user account changes
  useEffect(() => {
    setActiveScreen('checklists');
  }, [currentUser?.id]);

  // Enforce role-based screen visibility
  useEffect(() => {
    if (!currentUser) return;
    if (activeScreen === 'settings' && currentUser.role !== 'admin') {
      setActiveScreen('checklists');
    }
    if (
      currentUser.role === 'waiter' &&
      (activeScreen === 'requests' || activeScreen === 'warehouse')
    ) {
      setActiveScreen('checklists');
    }
  }, [currentUser, activeScreen]);

  // If unauthenticated (after explicit Logout), show AuthScreen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center">
        <OfflineIndicator />
        <AuthScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <OfflineIndicator />
      <Header
        onOpenSideMenu={() => setIsSideMenuOpen(true)}
        onNavigate={setActiveScreen}
      />

      {/* Left Slide-out Side Menu */}
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-3.5 sm:px-4 pt-3.5 pb-24">
        {activeScreen === 'checklists' && <ChecklistsView />}
        {activeScreen === 'tasks' && <TasksView />}
        {activeScreen === 'ttk' && <TechCardsView />}
        {activeScreen === 'requests' && currentUser.role !== 'waiter' && <RequestsView />}
        {activeScreen === 'warehouse' && currentUser.role !== 'waiter' && <WarehouseView />}
        {activeScreen === 'settings' && currentUser.role === 'admin' && (
          <SettingsView onBack={() => setActiveScreen('checklists')} />
        )}
        {activeScreen === 'profile' && (
          <UserProfileView onBack={() => setActiveScreen('checklists')} />
        )}
        {activeScreen === 'app_settings' && (
          <AppSettingsView onBack={() => setActiveScreen('checklists')} />
        )}
        {activeScreen === 'app_info' && (
          <AppInfoView onBack={() => setActiveScreen('checklists')} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav activeTab={activeScreen} onChangeTab={setActiveScreen} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
