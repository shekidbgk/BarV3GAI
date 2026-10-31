import React from 'react';
import {
  CheckSquare,
  Zap,
  BookOpen,
  Inbox,
  Package,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { ActiveScreenType, BottomTabType } from '../../types';
import { getVisibleBottomTabs, getVisibleTaskDepartments } from '../../utils/logic';

export type TabType = ActiveScreenType;

interface BottomNavProps {
  activeTab: ActiveScreenType;
  onChangeTab: (tab: ActiveScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const { currentUser, tasks, requests, currentOutletId } = useApp();

  if (!currentUser) return null;

  const visibleTabIds = getVisibleBottomTabs(currentUser.role);
  const visibleTaskDepts = getVisibleTaskDepartments(currentUser.role);

  // Count active pending tasks for this user's visible departments & outlet
  const activeTasksCount = tasks.filter(
    (t) =>
      t.outletId === currentOutletId &&
      t.status !== 'completed' &&
      visibleTaskDepts.includes(t.department)
  ).length;

  // Count new requests for this outlet
  const pendingRequestsCount = requests.filter(
    (r) => r.outletId === currentOutletId && r.status === 'new'
  ).length;

  const allTabDefinitions: Record<
    BottomTabType,
    { id: BottomTabType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }
  > = {
    checklists: {
      id: 'checklists',
      label: 'Чек-лист',
      icon: CheckSquare,
    },
    tasks: {
      id: 'tasks',
      label: 'Задания',
      icon: Zap,
      badge: activeTasksCount > 0 ? activeTasksCount : undefined,
    },
    ttk: {
      id: 'ttk',
      label: 'ТТК',
      icon: BookOpen,
    },
    requests: {
      id: 'requests',
      label: 'Заявки',
      icon: Inbox,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
    warehouse: {
      id: 'warehouse',
      label: 'Склад',
      icon: Package,
    },
  };

  const tabs = visibleTabIds.map((id) => allTabDefinitions[id]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800/80 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
      aria-label="Нижняя панель навигации"
    >
      <div
        className={`max-w-md mx-auto grid gap-1 ${
          tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-5'
        }`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
                isActive
                  ? 'text-amber-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-neutral-950">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight truncate w-full text-center ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
