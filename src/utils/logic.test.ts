import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authenticateUser,
  calculateChecklistProgress,
  canAccessDepartment,
  canAccessWarehouse,
  canEditWarehouseNomenclature,
  canManageTechCards,
  canModifyAccountStructure,
  filterTechCards,
  getVisibleBottomTabs,
  getVisibleChecklistDepartments,
  getVisibleTaskDepartments,
  getVisibleWarehouses,
  normalizeStoredUsers,
  normalizeStoredVenue,
  sortChecklistItems,
} from './logic';
import { ALLOWED_UNITS, ChecklistItem, TechCardItem } from '../types';
import { INITIAL_OUTLETS, INITIAL_USERS, INITIAL_VENUE } from '../store/initialData';

test('Waiter role hides Requests and Warehouse tabs', () => {
  const waiterTabs = getVisibleBottomTabs('waiter');
  assert.deepEqual(waiterTabs, ['checklists', 'tasks', 'ttk']);
  assert.equal(waiterTabs.includes('requests'), false);
  assert.equal(waiterTabs.includes('warehouse'), false);

  const bartenderTabs = getVisibleBottomTabs('bartender');
  assert.deepEqual(bartenderTabs, ['checklists', 'tasks', 'ttk', 'requests', 'warehouse']);
});

test('Department visibility rules for Waiter, Bartender, Cook, and Admin', () => {
  // Waiter: only hall in Checklists and Tasks
  assert.deepEqual(getVisibleChecklistDepartments('waiter'), ['hall']);
  assert.deepEqual(getVisibleTaskDepartments('waiter'), ['hall']);
  assert.equal(canAccessDepartment('waiter', 'bar'), false);
  assert.equal(canAccessDepartment('waiter', 'kitchen'), false);
  assert.equal(canAccessDepartment('waiter', 'hall'), true);

  // Bartender: only bar in Checklists (kitchen hidden)
  assert.deepEqual(getVisibleChecklistDepartments('bartender'), ['bar']);
  assert.equal(canAccessDepartment('bartender', 'kitchen'), false);
  assert.equal(canAccessDepartment('bartender', 'bar'), true);

  // Cook: only kitchen
  assert.deepEqual(getVisibleChecklistDepartments('cook'), ['kitchen']);

  // Admin: all 3 departments
  assert.deepEqual(getVisibleChecklistDepartments('admin'), ['bar', 'kitchen', 'hall']);
});

test('Warehouse separation and nomenclature editor permissions', () => {
  assert.deepEqual(getVisibleWarehouses('bartender'), ['bar']);
  assert.deepEqual(getVisibleWarehouses('head_bartender'), ['bar']);
  assert.deepEqual(getVisibleWarehouses('cook'), ['kitchen']);
  assert.deepEqual(getVisibleWarehouses('head_chef'), ['kitchen']);
  assert.deepEqual(getVisibleWarehouses('admin'), ['bar', 'kitchen']);
  assert.deepEqual(getVisibleWarehouses('waiter'), []);

  assert.equal(canAccessWarehouse('bartender', 'bar'), true);
  assert.equal(canAccessWarehouse('bartender', 'kitchen'), false);
  assert.equal(canAccessWarehouse('cook', 'kitchen'), true);
  assert.equal(canAccessWarehouse('cook', 'bar'), false);

  // Nomenclature editing
  assert.equal(canEditWarehouseNomenclature('admin', 'bar'), true);
  assert.equal(canEditWarehouseNomenclature('admin', 'kitchen'), true);
  assert.equal(canEditWarehouseNomenclature('head_bartender', 'bar'), true);
  assert.equal(canEditWarehouseNomenclature('head_bartender', 'kitchen'), false);
  assert.equal(canEditWarehouseNomenclature('head_chef', 'kitchen'), true);
  assert.equal(canEditWarehouseNomenclature('head_chef', 'bar'), false);
  assert.equal(canEditWarehouseNomenclature('bartender', 'bar'), false);
  assert.equal(canEditWarehouseNomenclature('cook', 'kitchen'), false);

  // Allowed units strictly 5 values
  assert.deepEqual(ALLOWED_UNITS, ['бутылка', 'литр', 'упаковка', 'килограмм', 'штука']);
});

test('Account structure modification restricted strictly to Administrator', () => {
  assert.equal(canModifyAccountStructure('admin'), true);
  assert.equal(canModifyAccountStructure('head_bartender'), false);
  assert.equal(canModifyAccountStructure('head_chef'), false);
  assert.equal(canModifyAccountStructure('bartender'), false);
  assert.equal(canModifyAccountStructure('cook'), false);
  assert.equal(canModifyAccountStructure('waiter'), false);
});

test('Technological Cards (TTK) permissions and filtering', () => {
  assert.equal(canManageTechCards('admin'), true);
  assert.equal(canManageTechCards('head_bartender'), true);
  assert.equal(canManageTechCards('head_chef'), true);
  assert.equal(canManageTechCards('bartender'), false);
  assert.equal(canManageTechCards('cook'), false);
  assert.equal(canManageTechCards('waiter'), false);

  const sampleCards: TechCardItem[] = [
    {
      id: 'ttk-1',
      section: 'bar',
      group: 'bar_cocktails',
      title: 'Негрони Классический',
      ingredients: [{ id: 'i1', name: 'Джин', amount: '30 мл' }],
      preparationTech: 'Смешать методом стир со льдом.',
    },
    {
      id: 'ttk-2',
      section: 'bar',
      group: 'bar_prep_syrups',
      title: 'Кордиал Лайм-Лемонграсс',
      ingredients: [{ id: 'i2', name: 'Сок лайма', amount: '500 мл' }],
      preparationTech: 'Варить при 60 градусах.',
    },
    {
      id: 'ttk-3',
      section: 'kitchen',
      group: 'kitchen_dishes',
      title: 'Тартар из говядины',
      ingredients: [{ id: 'i3', name: 'Вырезка говяжья', amount: '120 г' }],
      preparationTech: 'Нарезать мелким кубиком.',
    },
  ];

  const barCards = filterTechCards(sampleCards, 'bar', 'all', '');
  assert.equal(barCards.length, 2);

  const barPrepCards = filterTechCards(sampleCards, 'bar', 'bar_all_preps', '');
  assert.equal(barPrepCards.length, 1);
  assert.equal(barPrepCards[0].title, 'Кордиал Лайм-Лемонграсс');

  const searched = filterTechCards(sampleCards, 'bar', 'all', 'негрони');
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, 'ttk-1');

  const kitchenDishes = filterTechCards(sampleCards, 'kitchen', 'kitchen_dishes', '');
  assert.equal(kitchenDishes.length, 1);
  assert.equal(kitchenDishes[0].title, 'Тартар из говядины');
});

test('Checklist progress calculation and pin sorting', () => {
  const items: ChecklistItem[] = [
    { id: '1', outletId: 'o1', department: 'bar', type: 'morning', title: 'A', completed: true, pinned: false },
    { id: '2', outletId: 'o1', department: 'bar', type: 'morning', title: 'B', completed: false, pinned: true },
  ];

  const progress = calculateChecklistProgress(items);
  assert.equal(progress.completed, 1);
  assert.equal(progress.total, 2);
  assert.equal(progress.percentage, 50);

  const sorted = sortChecklistItems(items);
  assert.equal(sorted[0].id, '2');
});

test('Authentication handles venue codes, organization names, outlet names, full names, trimmed passwords, and legacy storage', () => {
  // 1. Standard login by code + login + password
  const res1 = authenticateUser({
    venueInput: 'BAR777',
    loginInput: 'admin',
    passwordInput: '123',
    venue: INITIAL_VENUE,
    outlets: INITIAL_OUTLETS,
    users: INITIAL_USERS,
  });
  assert.equal(res1.success, true);
  assert.equal(res1.user?.role, 'admin');

  // 2. Login with whitespace and case differences
  const res2 = authenticateUser({
    venueInput: ' bar777 ',
    loginInput: ' BARTENDER ',
    passwordInput: ' 123 ',
    venue: INITIAL_VENUE,
    outlets: INITIAL_OUTLETS,
    users: INITIAL_USERS,
  });
  assert.equal(res2.success, true);
  assert.equal(res2.user?.id, 'u-bartender');

  // 3. Login by organization name ("Мята Lounge") and employee full name ("Анна Смирнова")
  const res3 = authenticateUser({
    venueInput: 'Мята Lounge',
    loginInput: 'Анна Смирнова',
    passwordInput: '123',
    venue: INITIAL_VENUE,
    outlets: INITIAL_OUTLETS,
    users: INITIAL_USERS,
  });
  assert.equal(res3.success, true);
  assert.equal(res3.user?.role, 'head_bartender');

  // 4. Login by outlet name ("Бар Юг")
  const res4 = authenticateUser({
    venueInput: 'Бар Юг',
    loginInput: 'head_chef',
    passwordInput: '123',
    venue: INITIAL_VENUE,
    outlets: INITIAL_OUTLETS,
    users: INITIAL_USERS,
  });
  assert.equal(res4.success, true);
  assert.equal(res4.matchedOutletId, 'out-2');
  assert.equal(res4.user?.role, 'head_chef');

  // 5. Legacy / corrupted stored user objects self-heal without throwing TypeError
  const repairedVenue = normalizeStoredVenue({ code: 'craft01' }, INITIAL_VENUE);
  assert.equal(repairedVenue.venueCode, 'CRAFT01');

  const repairedUsers = normalizeStoredUsers(
    [{ id: 'u-admin', name: 'Алексей Морозов', role: 'admin' }],
    INITIAL_USERS,
    'BAR777'
  );
  assert.equal(repairedUsers.length >= 6, true);
  const repairedAdmin = repairedUsers.find((u) => u.id === 'u-admin');
  assert.equal(repairedAdmin?.login, 'admin');
  assert.equal(repairedAdmin?.password, '123');
});

