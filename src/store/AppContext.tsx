/**
 * BarOps Application State & Persistence Context
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AppNotification,
  AppPreferences,
  ChecklistItem,
  FeedbackMessage,
  InventoryReport,
  Outlet,
  ProductItem,
  RequestItem,
  RequestStatus,
  Role,
  RolePermissions,
  TaskItem,
  TaskStatus,
  TechCardItem,
  User,
  VenueConfig,
  WarehouseType,
} from '../types';
import {
  INITIAL_CHECKLISTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_OUTLETS,
  INITIAL_PERMISSIONS,
  INITIAL_PREFERENCES,
  INITIAL_PRODUCTS,
  INITIAL_REPORTS,
  INITIAL_REQUESTS,
  INITIAL_TASKS,
  INITIAL_TECH_CARDS,
  INITIAL_USERS,
  INITIAL_VENUE,
} from './initialData';
import {
  authenticateUser,
  canManageTechCards,
  canModifyAccountStructure,
  normalizeStoredUsers,
  normalizeStoredVenue,
} from '../utils/logic';
import { playNotificationSound } from '../utils/sound';

interface AppContextType {
  // Auth & Venue state
  venue: VenueConfig;
  venues: VenueConfig[];
  currentUser: User | null;
  currentOutletId: string;
  outlets: Outlet[];
  users: User[];
  permissions: Record<Role, RolePermissions>;
  preferences: AppPreferences;
  feedbacks: FeedbackMessage[];

  // Data collections
  checklists: ChecklistItem[];
  tasks: TaskItem[];
  requests: RequestItem[];
  products: ProductItem[];
  reports: InventoryReport[];
  techCards: TechCardItem[];
  notifications: AppNotification[];

  // Auth & Profile actions
  login: (venueCode: string, login: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  registerVenue: (venueName: string, venueCode: string, login: string, password?: string) => void;
  updateCurrentUserProfile: (data: { name?: string; avatarUrl?: string; aboutMe?: string }) => void;

  // Preferences & Feedback actions
  updatePreferences: (data: Partial<AppPreferences>) => void;
  submitFeedback: (category: FeedbackMessage['category'], message: string) => void;

  // Outlet selection
  setCurrentOutletId: (outletId: string) => void;

  // Checklists actions
  toggleChecklistItem: (itemId: string) => void;
  toggleSubtask: (itemId: string, subtaskId: string) => void;
  addChecklistItem: (item: Omit<ChecklistItem, 'id'>) => void;
  togglePinChecklist: (itemId: string) => void;
  deleteChecklistItem: (itemId: string) => void;

  // Tasks actions
  createTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;

  // Requests actions
  createRequest: (req: Omit<RequestItem, 'id' | 'createdAt' | 'status'>) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus, note?: string) => void;

  // Inventory actions
  updateProductCount: (productId: string, count: number | null) => void;
  addProduct: (product: Omit<ProductItem, 'id'>) => void;
  updateProduct: (productId: string, data: Partial<ProductItem>) => void;
  deleteProduct: (productId: string) => void;
  submitInventoryReport: (warehouse: WarehouseType) => InventoryReport;

  // Technological Cards (TTK) actions
  addTechCard: (card: Omit<TechCardItem, 'id' | 'updatedAt' | 'updatedBy'>) => void;
  updateTechCard: (id: string, card: Partial<Omit<TechCardItem, 'id'>>) => void;
  deleteTechCard: (id: string) => void;

  // Settings actions (Strictly Admin only)
  addOutlet: (name: string, address?: string) => void;
  updateOutlet: (id: string, name: string, address?: string) => void;
  deleteOutlet: (id: string) => void;
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  updateRolePermission: (role: Role, perm: keyof RolePermissions, value: boolean) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Reset demo
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_PREFIX = 'barops_v1_';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error loading storage ${key}:`, e);
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving storage ${key}:`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [venue, setVenue] = useState<VenueConfig>(() =>
    normalizeStoredVenue(loadStorage('venue', INITIAL_VENUE), INITIAL_VENUE)
  );
  const [venues, setVenues] = useState<VenueConfig[]>(() => {
    const stored = loadStorage<VenueConfig[]>('venues', [INITIAL_VENUE]);
    const list = Array.isArray(stored)
      ? stored.map((v) => normalizeStoredVenue(v, INITIAL_VENUE))
      : [INITIAL_VENUE];
    const merged = [venue, INITIAL_VENUE, ...list];
    return merged.filter(
      (v, idx, arr) =>
        arr.findIndex((x) => x.venueCode.toUpperCase() === v.venueCode.toUpperCase()) === idx
    );
  });
  const [outlets, setOutlets] = useState<Outlet[]>(() => {
    const loaded = loadStorage('outlets', INITIAL_OUTLETS);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : INITIAL_OUTLETS;
  });
  const [users, setUsers] = useState<User[]>(() =>
    normalizeStoredUsers(
      loadStorage('users', INITIAL_USERS),
      INITIAL_USERS,
      venue.venueCode,
      outlets.map((o) => o.id)
    )
  );
  // By default, open the base Administrator account with the test bar unless user explicitly logged out
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const isExplicitlyLoggedOut = loadStorage<boolean>('loggedOut', false);
    if (isExplicitlyLoggedOut) return null;
    const saved = loadStorage<User | null>('currentUser', null);
    if (saved && typeof saved === 'object' && typeof saved.login === 'string') {
      const matchedInUsers = users.find(
        (u) => u.id === saved.id || u.login.toLowerCase() === saved.login.toLowerCase()
      );
      if (matchedInUsers) return matchedInUsers;
    }
    return users[0] || INITIAL_USERS[0];
  });
  const [currentOutletId, setCurrentOutletIdState] = useState<string>(() => {
    const saved = loadStorage<string>('currentOutletId', '');
    if (saved && outlets.some((o) => o.id === saved)) return saved;
    return outlets[0]?.id || 'out-1';
  });
  const [permissions, setPermissions] = useState<Record<Role, RolePermissions>>(() =>
    loadStorage('permissions', INITIAL_PERMISSIONS)
  );
  const [preferences, setPreferences] = useState<AppPreferences>(() =>
    loadStorage('preferences', INITIAL_PREFERENCES)
  );
  const [feedbacks, setFeedbacks] = useState<FeedbackMessage[]>(() =>
    loadStorage('feedbacks', [])
  );

  const [checklists, setChecklists] = useState<ChecklistItem[]>(() =>
    loadStorage('checklists', INITIAL_CHECKLISTS)
  );
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadStorage('tasks', INITIAL_TASKS));
  const [requests, setRequests] = useState<RequestItem[]>(() => loadStorage('requests', INITIAL_REQUESTS));
  const [products, setProducts] = useState<ProductItem[]>(() => loadStorage('products', INITIAL_PRODUCTS));
  const [reports, setReports] = useState<InventoryReport[]>(() => loadStorage('reports', INITIAL_REPORTS));
  const [techCards, setTechCards] = useState<TechCardItem[]>(() =>
    loadStorage('techCards', INITIAL_TECH_CARDS)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadStorage('notifications', INITIAL_NOTIFICATIONS)
  );

  // Sync theme class on documentElement
  useEffect(() => {
    const html = document.documentElement;
    if (preferences.theme === 'light') {
      html.classList.remove('dark');
      html.classList.add('light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
    }
  }, [preferences.theme]);

  // Sync to localStorage
  useEffect(() => saveStorage('venue', venue), [venue]);
  useEffect(() => saveStorage('venues', venues), [venues]);
  useEffect(() => saveStorage('users', users), [users]);
  useEffect(() => saveStorage('currentUser', currentUser), [currentUser]);
  useEffect(() => saveStorage('outlets', outlets), [outlets]);
  useEffect(() => saveStorage('currentOutletId', currentOutletId), [currentOutletId]);
  useEffect(() => saveStorage('permissions', permissions), [permissions]);
  useEffect(() => saveStorage('preferences', preferences), [preferences]);
  useEffect(() => saveStorage('feedbacks', feedbacks), [feedbacks]);
  useEffect(() => saveStorage('checklists', checklists), [checklists]);
  useEffect(() => saveStorage('tasks', tasks), [tasks]);
  useEffect(() => saveStorage('requests', requests), [requests]);
  useEffect(() => saveStorage('products', products), [products]);
  useEffect(() => saveStorage('reports', reports), [reports]);
  useEffect(() => saveStorage('techCards', techCards), [techCards]);
  useEffect(() => saveStorage('notifications', notifications), [notifications]);

  // Push internal notification helper (respects notification settings)
  const addNotification = (
    title: string,
    message: string,
    type: AppNotification['type'],
    targetOutletId?: string
  ) => {
    if (!preferences.notificationsEnabled) return;
    const notif: AppNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      outletId: targetOutletId || currentOutletId,
      title,
      message,
      timestamp: 'Только что',
      read: false,
      type,
    };
    setNotifications((prev) => [notif, ...prev]);
    playNotificationSound(preferences.notificationSound);
  };

  // Auth functions (Supports venue code, organization name, outlet name, login, full name, and trimmed password)
  const login = (venueCode: string, loginVal: string, passwordVal?: string) => {
    const result = authenticateUser({
      venueInput: venueCode,
      loginInput: loginVal,
      passwordInput: passwordVal,
      venue,
      venues,
      outlets,
      users,
    });

    if (!result.success || !result.user) {
      return {
        success: false,
        error: result.error || 'Неверный логин или пароль сотрудника',
      };
    }

    const found = result.user;
    if (result.matchedVenue && result.matchedVenue.venueCode !== venue.venueCode) {
      setVenue(result.matchedVenue);
    }

    saveStorage('loggedOut', false);
    setCurrentUser(found);

    if (
      result.matchedOutletId &&
      (found.role === 'admin' || found.outletIds.includes(result.matchedOutletId))
    ) {
      setCurrentOutletIdState(result.matchedOutletId);
    } else if (!found.outletIds.includes(currentOutletId) && found.outletIds.length > 0) {
      setCurrentOutletIdState(found.outletIds[0]);
    }

    return { success: true };
  };

  const logout = () => {
    saveStorage('loggedOut', true);
    setCurrentUser(null);
  };

  const registerVenue = (
    venueName: string,
    venueCode: string,
    adminLogin: string,
    adminPassword?: string
  ) => {
    const code = venueCode.trim().toUpperCase();
    const cleanLogin = adminLogin.trim().toLowerCase();
    const cleanPassword = (adminPassword || '').trim() || '123';
    const newVenue: VenueConfig = {
      venueCode: code,
      name: venueName.trim(),
    };
    const adminUser: User = {
      id: 'u-' + Date.now(),
      venueCode: code,
      login: cleanLogin,
      password: cleanPassword,
      name: 'Администратор (' + adminLogin.trim() + ')',
      role: 'admin',
      outletIds: outlets.map((o) => o.id),
      aboutMe: `Владелец и администратор заведения «${newVenue.name}».`,
    };

    saveStorage('loggedOut', false);
    setVenue(newVenue);
    setVenues((prev) => {
      const filtered = prev.filter((v) => v.venueCode.toUpperCase() !== code);
      return [newVenue, ...filtered];
    });
    setUsers((prev) => {
      const withoutDuplicate = prev.filter(
        (u) =>
          !(
            (u.venueCode || '').trim().toUpperCase() === code &&
            (u.login || '').trim().toLowerCase() === cleanLogin
          )
      );
      return [adminUser, ...withoutDuplicate];
    });
    setCurrentUser(adminUser);
    addNotification(
      'Добро пожаловать!',
      `Заведение «${newVenue.name}» успешно привязано с кодом ${newVenue.venueCode}.`,
      'system'
    );
  };

  // Profile self-update (User can update their own avatar, aboutMe, and display name, NEVER role or account structure)
  const updateCurrentUserProfile = (data: { name?: string; avatarUrl?: string; aboutMe?: string }) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      name: data.name !== undefined ? data.name : currentUser.name,
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : currentUser.avatarUrl,
      aboutMe: data.aboutMe !== undefined ? data.aboutMe : currentUser.aboutMe,
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
  };

  const updatePreferences = (data: Partial<AppPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...data }));
  };

  const submitFeedback = (category: FeedbackMessage['category'], message: string) => {
    const fb: FeedbackMessage = {
      id: 'fb-' + Date.now(),
      userName: currentUser?.name || 'Пользователь',
      userRole: currentUser?.role || 'guest',
      venueName: venue.name,
      category,
      message: message.trim(),
      createdAt: new Date().toLocaleString('ru-RU'),
    };
    setFeedbacks((prev) => [fb, ...prev]);
    addNotification('Обратная связь', 'Ваше сообщение успешно отправлено команде разработки BarOps.', 'system');
  };

  const setCurrentOutletId = (outletId: string) => {
    setCurrentOutletIdState(outletId);
  };

  // Checklists
  const toggleChecklistItem = (itemId: string) => {
    setChecklists((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextCompleted = !item.completed;
          const updatedSubtasks = item.subtasks?.map((s) => ({ ...s, completed: nextCompleted }));
          return {
            ...item,
            completed: nextCompleted,
            completedBy: nextCompleted ? currentUser?.name || 'Сотрудник' : undefined,
            completedAt: nextCompleted
              ? new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
              : undefined,
            subtasks: updatedSubtasks,
          };
        }
        return item;
      })
    );
  };

  const toggleSubtask = (itemId: string, subtaskId: string) => {
    setChecklists((prev) =>
      prev.map((item) => {
        if (item.id === itemId && item.subtasks) {
          const newSubs = item.subtasks.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s));
          const allDone = newSubs.every((s) => s.completed);
          return {
            ...item,
            subtasks: newSubs,
            completed: allDone,
            completedBy: allDone ? currentUser?.name || 'Сотрудник' : item.completedBy,
            completedAt: allDone
              ? new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
              : item.completedAt,
          };
        }
        return item;
      })
    );
  };

  const addChecklistItem = (newItemData: Omit<ChecklistItem, 'id'>) => {
    const newItem: ChecklistItem = {
      ...newItemData,
      id: 'chk-' + Date.now(),
    };
    setChecklists((prev) => [newItem, ...prev]);
    addNotification(
      'Изменение чек-листа',
      `${currentUser?.name || 'Сотрудник'} добавил пункт: «${newItem.title}»`,
      'checklist',
      newItem.outletId
    );
  };

  const togglePinChecklist = (itemId: string) => {
    setChecklists((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, pinned: !item.pinned } : item))
    );
  };

  const deleteChecklistItem = (itemId: string) => {
    const itemToDelete = checklists.find((c) => c.id === itemId);
    setChecklists((prev) => prev.filter((item) => item.id !== itemId));
    if (itemToDelete) {
      addNotification(
        'Чек-лист обновлен',
        `Удален пункт: «${itemToDelete.title}»`,
        'checklist',
        itemToDelete.outletId
      );
    }
  };

  // Tasks
  const createTask = (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: 'tsk-' + Date.now(),
      createdAt:
        new Date().toLocaleDateString('ru-RU') +
        ' ' +
        new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    setTasks((prev) => [newTask, ...prev]);
    addNotification(
      'Новая задача',
      `Сотруднику ${newTask.assignedToName} назначена задача: «${newTask.title}»`,
      'task',
      newTask.outletId
    );
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status,
            completedAt:
              status === 'completed'
                ? new Date().toLocaleDateString('ru-RU') +
                  ' ' +
                  new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                : undefined,
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Requests
  const createRequest = (reqData: Omit<RequestItem, 'id' | 'createdAt' | 'status'>) => {
    const newReq: RequestItem = {
      ...reqData,
      id: 'req-' + Date.now(),
      status: 'new',
      createdAt:
        new Date().toLocaleDateString('ru-RU') +
        ' ' +
        new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    setRequests((prev) => [newReq, ...prev]);
    addNotification(
      'Новая заявка',
      `${newReq.authorName} создал заявку: «${newReq.title}»`,
      'request',
      newReq.outletId
    );
  };

  const updateRequestStatus = (requestId: string, status: RequestStatus, note?: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status,
            statusNote: note !== undefined ? note : r.statusNote,
            resolvedBy: currentUser?.name || 'Руководитель',
          };
        }
        return r;
      })
    );
  };

  // Products & Warehouse
  const updateProductCount = (productId: string, count: number | null) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            actualCount: count,
            lastUpdated:
              new Date().toLocaleDateString('ru-RU') +
              ' ' +
              new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return p;
      })
    );
  };

  const addProduct = (prodData: Omit<ProductItem, 'id'>) => {
    const newProd: ProductItem = {
      ...prodData,
      id: 'prod-' + Date.now(),
      lastUpdated:
        new Date().toLocaleDateString('ru-RU') +
        ' ' +
        new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    setProducts((prev) => [newProd, ...prev]);
  };

  const updateProduct = (productId: string, data: Partial<ProductItem>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, ...data, lastUpdated: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }
          : p
      )
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const submitInventoryReport = (warehouse: WarehouseType): InventoryReport => {
    const outlet = outlets.find((o) => o.id === currentOutletId) || outlets[0];
    const warehouseName = warehouse === 'bar' ? 'Склад Бара' : 'Склад Кухни';
    const warehouseProds = products.filter(
      (p) => p.warehouse === warehouse && p.outletId === currentOutletId
    );

    const report: InventoryReport = {
      id: 'rep-' + Date.now(),
      outletId: currentOutletId,
      outletName: outlet ? outlet.name : 'Точка продаж',
      warehouse,
      warehouseName,
      submittedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Сотрудник',
      submittedAt: new Date().toISOString(),
      items: warehouseProds.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        unit: p.unit,
        actualCount: p.actualCount ?? 0,
      })),
    };

    setReports((prev) => [report, ...prev]);
    addNotification(
      'Инвентаризация получена',
      `${report.submittedBy} отправил отчет по «${warehouseName}» (${report.outletName}). Зафиксировано позиций: ${report.items.length}`,
      'inventory',
      currentOutletId
    );

    return report;
  };

  // Technological Cards (TTK) Actions — guarded by canManageTechCards
  const addTechCard = (cardData: Omit<TechCardItem, 'id' | 'updatedAt' | 'updatedBy'>) => {
    if (!currentUser || !canManageTechCards(currentUser.role)) return;
    const newCard: TechCardItem = {
      ...cardData,
      id: 'ttk-' + Date.now(),
      updatedAt: new Date().toLocaleDateString('ru-RU'),
      updatedBy: currentUser.name,
    };
    setTechCards((prev) => [newCard, ...prev]);
    addNotification('Новая ТТК', `Добавлена техкарта: «${newCard.title}»`, 'ttk');
  };

  const updateTechCard = (id: string, cardData: Partial<Omit<TechCardItem, 'id'>>) => {
    if (!currentUser || !canManageTechCards(currentUser.role)) return;
    setTechCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              ...cardData,
              updatedAt: new Date().toLocaleDateString('ru-RU'),
              updatedBy: currentUser.name,
            }
          : c
      )
    );
  };

  const deleteTechCard = (id: string) => {
    if (!currentUser || !canManageTechCards(currentUser.role)) return;
    const target = techCards.find((c) => c.id === id);
    setTechCards((prev) => prev.filter((c) => c.id !== id));
    if (target) {
      addNotification('Удаление ТТК', `Удалена техкарта: «${target.title}»`, 'ttk');
    }
  };

  // Settings Actions (Strictly Admin only)
  const addOutlet = (name: string, address?: string) => {
    if (!currentUser || !canModifyAccountStructure(currentUser.role)) return;
    const newOutlet: Outlet = {
      id: 'out-' + Date.now(),
      name: name.trim(),
      address: address?.trim(),
    };
    setOutlets((prev) => [...prev, newOutlet]);
    setUsers((prev) =>
      prev.map((u) => (u.role === 'admin' ? { ...u, outletIds: [...u.outletIds, newOutlet.id] } : u))
    );
    if (currentUser.role === 'admin') {
      setCurrentUser((prev) => (prev ? { ...prev, outletIds: [...prev.outletIds, newOutlet.id] } : prev));
    }
  };

  const updateOutlet = (id: string, name: string, address?: string) => {
    if (!currentUser || !canModifyAccountStructure(currentUser.role)) return;
    setOutlets((prev) =>
      prev.map((o) => (o.id === id ? { ...o, name: name.trim(), address: address?.trim() } : o))
    );
  };

  const deleteOutlet = (id: string) => {
    if (!currentUser || !canModifyAccountStructure(currentUser.role)) return;
    if (outlets.length <= 1) return;
    setOutlets((prev) => prev.filter((o) => o.id !== id));
    if (currentOutletId === id) {
      const remaining = outlets.filter((o) => o.id !== id);
      if (remaining.length > 0) {
        setCurrentOutletIdState(remaining[0].id);
      }
    }
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    if (!currentUser || !canModifyAccountStructure(currentUser.role)) return;
    const newUser: User = {
      ...userData,
      id: 'u-' + Date.now(),
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    if (!currentUser || !canModifyAccountStructure(currentUser.role)) return;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...userData } : prev));
    }
  };

  const deleteUser = (id: string) => {
    if (!currentUser || !canModifyAccountStructure(currentUser.role)) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const updateRolePermission = (role: Role, perm: keyof RolePermissions, value: boolean) => {
    if (!currentUser || !canModifyAccountStructure(currentUser.role)) return;
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: value,
      },
    }));
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setVenue(INITIAL_VENUE);
    setVenues([INITIAL_VENUE]);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setOutlets(INITIAL_OUTLETS);
    setCurrentOutletIdState(INITIAL_OUTLETS[0].id);
    setPermissions(INITIAL_PERMISSIONS);
    setPreferences(INITIAL_PREFERENCES);
    setFeedbacks([]);
    setChecklists(INITIAL_CHECKLISTS);
    setTasks(INITIAL_TASKS);
    setRequests(INITIAL_REQUESTS);
    setProducts(INITIAL_PRODUCTS);
    setReports(INITIAL_REPORTS);
    setTechCards(INITIAL_TECH_CARDS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  return (
    <AppContext.Provider
      value={{
        venue,
        venues,
        currentUser,
        currentOutletId,
        outlets,
        users,
        permissions,
        preferences,
        feedbacks,
        checklists,
        tasks,
        requests,
        products,
        reports,
        techCards,
        notifications,
        login,
        logout,
        registerVenue,
        updateCurrentUserProfile,
        updatePreferences,
        submitFeedback,
        setCurrentOutletId,
        toggleChecklistItem,
        toggleSubtask,
        addChecklistItem,
        togglePinChecklist,
        deleteChecklistItem,
        createTask,
        updateTaskStatus,
        deleteTask,
        createRequest,
        updateRequestStatus,
        updateProductCount,
        addProduct,
        updateProduct,
        deleteProduct,
        submitInventoryReport,
        addTechCard,
        updateTechCard,
        deleteTechCard,
        addOutlet,
        updateOutlet,
        deleteOutlet,
        addUser,
        updateUser,
        deleteUser,
        updateRolePermission,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
