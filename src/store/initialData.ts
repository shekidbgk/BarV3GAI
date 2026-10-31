import {
  AppNotification,
  AppPreferences,
  ChecklistItem,
  InventoryReport,
  Outlet,
  ProductItem,
  RequestItem,
  Role,
  RolePermissions,
  TaskItem,
  TechCardItem,
  User,
  VenueConfig,
} from '../types';
import { DEFAULT_PERMISSIONS } from '../utils/logic';

export const INITIAL_VENUE: VenueConfig = {
  venueCode: 'BAR777',
  name: 'Мята Lounge',
};

export const INITIAL_PREFERENCES: AppPreferences = {
  theme: 'dark',
  notificationsEnabled: true,
  notificationSound: 'chime',
};

export const INITIAL_OUTLETS: Outlet[] = [
  { id: 'out-1', name: 'Бар Центр', address: 'ул. Тверская, 12' },
  { id: 'out-2', name: 'Бар Юг', address: 'пр. Московский, 102' },
];

const ALL_OUTLETS = INITIAL_OUTLETS.map((o) => o.id);

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    venueCode: 'BAR777',
    login: 'admin',
    password: '123',
    name: 'Алексей Морозов',
    role: 'admin',
    outletIds: ALL_OUTLETS,
    aboutMe: 'Управляющий сетью баров «Мята Lounge». Контроль качества, стандартов сервиса и ХАССП.',
  },
  {
    id: 'u-head-bar',
    venueCode: 'BAR777',
    login: 'head_bar',
    password: '123',
    name: 'Анна Смирнова',
    role: 'head_bartender',
    outletIds: ALL_OUTLETS,
    aboutMe: 'Шеф-бармен. Разработка сезонных коктейльных карт, авторских кордиалов и настоек.',
  },
  {
    id: 'u-head-chef',
    venueCode: 'BAR777',
    login: 'head_chef',
    password: '123',
    name: 'Игорь Петров',
    role: 'head_chef',
    outletIds: ALL_OUTLETS,
    aboutMe: 'Шеф-повар. Контроль отдачи блюд, заготовочного цеха и инвентаризации кухни.',
  },
  {
    id: 'u-bartender',
    venueCode: 'BAR777',
    login: 'bartender',
    password: '123',
    name: 'Максим Орлов',
    role: 'bartender',
    outletIds: ['out-1'],
    aboutMe: 'Бармен вечерней смены. Специализация — классическая миксология.',
  },
  {
    id: 'u-cook',
    venueCode: 'BAR777',
    login: 'cook',
    password: '123',
    name: 'Елена Волкова',
    role: 'cook',
    outletIds: ['out-1'],
    aboutMe: 'Повар горячего и холодного цехов.',
  },
  {
    id: 'u-waiter',
    venueCode: 'BAR777',
    login: 'waiter',
    password: '123',
    name: 'Дмитрий Соколов',
    role: 'waiter',
    outletIds: ['out-1'],
    aboutMe: 'Официант основного зала и VIP-зоны.',
  },
];

export const INITIAL_PERMISSIONS: Record<Role, RolePermissions> = DEFAULT_PERMISSIONS;

export const INITIAL_CHECKLISTS: ChecklistItem[] = [
  { id: 'chk-1', outletId: 'out-1', department: 'bar', type: 'morning', title: 'Проверить чистоту барной стойки и инвентарь', completed: false, pinned: true },
  { id: 'chk-2', outletId: 'out-1', department: 'bar', type: 'morning', title: 'Нарезать цитрусовые для сервиса', description: 'Лайм, лимон, апельсин — по стандарту ХАССП', completed: false, pinned: false },
  { id: 'chk-3', outletId: 'out-1', department: 'bar', type: 'morning', title: 'Проверить сроки годности сиропов и соков', completed: false, pinned: false },
  { id: 'chk-4', outletId: 'out-1', department: 'bar', type: 'evening', title: 'Сверить остатки алкоголя с кассовой выручкой', completed: false, pinned: false },
  { id: 'chk-5', outletId: 'out-1', department: 'bar', type: 'evening', title: 'Закрыть холодильники и выключить подсветку', completed: false, pinned: false },
  {
    id: 'chk-6',
    outletId: 'out-1',
    department: 'bar',
    type: 'composite',
    title: 'Подготовка бара к пятничному сервису',
    completed: false,
    pinned: false,
    subtasks: [
      { id: 'sub-6-1', title: 'Заказать кусковой и краш-лёд на вечер', completed: false },
      { id: 'sub-6-2', title: 'Проверить наличие всех кордиалов по ТТК', completed: false },
      { id: 'sub-6-3', title: 'Натереть бокалы для коктейлей', completed: false },
    ],
  },
  { id: 'chk-7', outletId: 'out-1', department: 'kitchen', type: 'morning', title: 'Проверить температуру холодильных камер', completed: false, pinned: true },
  { id: 'chk-8', outletId: 'out-1', department: 'kitchen', type: 'morning', title: 'Принять поставку и сверить накладные', completed: false, pinned: false },
  { id: 'chk-9', outletId: 'out-1', department: 'kitchen', type: 'evening', title: 'Утилизировать остатки заготовок с истекающим сроком', completed: false, pinned: false },
  { id: 'chk-10', outletId: 'out-1', department: 'hall', type: 'morning', title: 'Проверить сервировку столов и чистоту меню', completed: false, pinned: true },
  { id: 'chk-11', outletId: 'out-1', department: 'hall', type: 'evening', title: 'Собрать и пересчитать чаевые, закрыть смену зала', completed: false, pinned: false },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'tsk-1',
    outletId: 'out-1',
    title: 'Проверить накладные поставки крафтового пива',
    description: 'Сверить количество кег и даты розлива',
    department: 'bar',
    assignedToUserId: 'u-bartender',
    assignedToName: 'Максим Орлов (Бармен)',
    assignedByUserId: 'u-head-bar',
    assignedByName: 'Анна Смирнова (Старший бармен)',
    deadline: 'Сегодня к 18:00',
    status: 'new',
    priority: 'high',
    createdAt: '31.10.2026 09:00',
  },
  {
    id: 'tsk-2',
    outletId: 'out-1',
    title: 'Подготовить заготовки соуса Демиглас для вечернего сервиса',
    department: 'kitchen',
    assignedToUserId: 'u-cook',
    assignedToName: 'Елена Волкова (Повар)',
    assignedByUserId: 'u-head-chef',
    assignedByName: 'Игорь Петров (Старший повар)',
    deadline: 'К 15:00',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '31.10.2026 08:30',
  },
  {
    id: 'tsk-3',
    outletId: 'out-1',
    title: 'Обновить резервы столов в VIP-зале на вечер',
    description: 'Расставить таблички Reserved и подготовить приветственные сеты',
    department: 'hall',
    assignedToUserId: 'u-waiter',
    assignedToName: 'Дмитрий Соколов (Официант)',
    assignedByUserId: 'u-admin',
    assignedByName: 'Алексей Морозов (Администратор)',
    deadline: 'Сегодня к 17:00',
    status: 'new',
    priority: 'high',
    createdAt: '31.10.2026 10:00',
  },
];

export const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: 'req-1',
    outletId: 'out-1',
    category: 'breakdown',
    department: 'bar',
    authorId: 'u-bartender',
    authorName: 'Максим Орлов (Бармен)',
    title: 'Течет кран в мойке за баром',
    description: 'Вода капает из-под сифона мойки первой станции, нужен сантехник',
    status: 'new',
    createdAt: '31.10.2026 10:15',
  },
  {
    id: 'req-2',
    outletId: 'out-1',
    category: 'procurement',
    department: 'kitchen',
    authorId: 'u-cook',
    authorName: 'Елена Волкова (Повар)',
    title: 'Заканчивается оливковое масло Extra Virgin',
    description: 'Нужно 5 литров для холодного цеха на завтрашнюю смену',
    status: 'in_progress',
    createdAt: '31.10.2026 11:00',
    resolvedBy: 'Игорь Петров (Старший повар)',
    statusNote: 'Заказано у поставщика, привезут завтра к 10:00',
  },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  { id: 'prod-1', outletId: 'out-1', warehouse: 'bar', category: 'Ликеры', name: 'Кофейный ликер Kahlua', unit: 'бутылка', actualCount: 4, minWarningCount: 2 },
  { id: 'prod-2', outletId: 'out-1', warehouse: 'bar', category: 'Ликеры', name: 'Ликер Бенедиктин', unit: 'бутылка', actualCount: 1, minWarningCount: 2 },
  { id: 'prod-3', outletId: 'out-1', warehouse: 'bar', category: 'Сиропы', name: 'Сироп Ваниль Monin', unit: 'бутылка', actualCount: 3 },
  { id: 'prod-4', outletId: 'out-1', warehouse: 'bar', category: 'Соки', name: 'Фреш лайма', unit: 'литр', actualCount: 6 },
  { id: 'prod-5', outletId: 'out-1', warehouse: 'bar', category: 'Лёд и вода', name: 'Вода содовая в сифонах', unit: 'упаковка', actualCount: 8 },
  { id: 'prod-6', outletId: 'out-1', warehouse: 'kitchen', category: 'Масла и соусы', name: 'Оливковое масло Extra Virgin', unit: 'литр', actualCount: 1, minWarningCount: 3 },
  { id: 'prod-7', outletId: 'out-1', warehouse: 'kitchen', category: 'Овощи', name: 'Томаты черри', unit: 'килограмм', actualCount: 8 },
  { id: 'prod-8', outletId: 'out-1', warehouse: 'kitchen', category: 'Мясо и рыба', name: 'Вырезка говяжья (Тендерлойн)', unit: 'килограмм', actualCount: 12 },
  { id: 'prod-9', outletId: 'out-1', warehouse: 'kitchen', category: 'Хозтовары', name: 'Перчатки нитриловые черные', unit: 'упаковка', actualCount: 5 },
];

// Helper SVG data URL generator for clean reference photos in TTK
function createSvgReferencePhoto(title: string, subtitle: string, accentHex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#18181b"/>
        <stop offset="100%" stop-color="#09090b"/>
      </linearGradient>
    </defs>
    <rect width="600" height="360" fill="url(#bg)"/>
    <circle cx="490" cy="80" r="140" fill="${accentHex}" fill-opacity="0.12"/>
    <circle cx="110" cy="290" r="110" fill="${accentHex}" fill-opacity="0.08"/>
    <rect x="36" y="36" width="528" height="288" rx="20" fill="none" stroke="${accentHex}" stroke-opacity="0.35" stroke-width="2"/>
    <text x="64" y="90" fill="${accentHex}" font-family="sans-serif" font-size="14" font-weight="bold" letter-spacing="2">ФОТОЭТАЛОН ПОДАЧИ • BAROPS ТТК</text>
    <text x="64" y="185" fill="#f4f4f5" font-family="sans-serif" font-size="28" font-weight="bold">${title}</text>
    <text x="64" y="225" fill="#a1a1aa" font-family="sans-serif" font-size="16">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_TECH_CARDS: TechCardItem[] = [
  {
    id: 'ttk-bar-1',
    section: 'bar',
    group: 'bar_cocktails',
    title: 'Смоки Негрони (Smoky Negroni)',
    ingredients: [
      { id: 'ing-1', name: 'Джин сухой лондонский', amount: '30 мл' },
      { id: 'ing-2', name: 'Красный сладкий вермут', amount: '30 мл' },
      { id: 'ing-3', name: 'Биттер Campari', amount: '30 мл' },
      { id: 'ing-4', name: 'Цедра красного апельсина', amount: '1 слайс (5 г)' },
      { id: 'ing-5', name: 'Щепа яблоневая для окуривания', amount: '2 г' },
    ],
    preparationTech:
      '1. Охладить смесительный стакан и бокал Рокс с крупным кубом прозрачного льда.\n2. Налить джин, красный вермут и биттер в смесительный стакан.\n3. Перемешать барной ложкой методом Stir в течение 25 секунд до оптимального обводнения.\n4. Перелить через стрейнер в бокал Рокс, сбрызнуть эфирными маслами цедры апельсина и подать под клошем с легким яблоневым дымом.',
    photoUrl: createSvgReferencePhoto('Смоки Негрони', 'Бокал Рокс • Прозрачный куб льда • Цедра апельсина', '#f59e0b'),
    updatedAt: '31.10.2026',
    updatedBy: 'Анна Смирнова',
  },
  {
    id: 'ttk-bar-2',
    section: 'bar',
    group: 'bar_prep_syrups',
    title: 'Кордиал Лайм — Лемонграсс',
    ingredients: [
      { id: 'ing-21', name: 'Фреш лайма процеженный', amount: '500 мл' },
      { id: 'ing-22', name: 'Сахарный песок тростниковый', amount: '400 г' },
      { id: 'ing-23', name: 'Стебли свежего лемонграсса', amount: '80 г' },
      { id: 'ing-24', name: 'Цедра лайма (без альбедо)', amount: '25 г' },
      { id: 'ing-25', name: 'Винная кислота', amount: '5 г' },
    ],
    preparationTech:
      '1. Стебли лемонграсса мелко нарезать и размять пестиком.\n2. Поместить все ингредиенты в вакуумный пакет.\n3. Готовить в су-виде при температуре 58°C в течение 2 часов.\n4. Охладить в ледяной бане, отфильтровать через кофейный фильтр и перелить в диспенсер с маркировкой ХАССП (срок хранения 14 суток при +2...+5°C).',
    photoUrl: createSvgReferencePhoto('Кордиал Лайм-Лемонграсс', 'Выход: 750 мл • Хранение до 14 суток при +4°C', '#10b981'),
    updatedAt: '31.10.2026',
    updatedBy: 'Анна Смирнова',
  },
  {
    id: 'ttk-bar-3',
    section: 'bar',
    group: 'bar_prep_pf',
    title: 'П/Ф Цитрусовый микс (Сауэр база)',
    ingredients: [
      { id: 'ing-31', name: 'Фреш лимона', amount: '600 мл' },
      { id: 'ing-32', name: 'Фреш лайма', amount: '400 мл' },
    ],
    preparationTech:
      '1. Выжать сок лимонов и лаймов на шнековой соковыжималке.\n2. Процедить через мелкое сито (шинуа) для удаления пульпы.\n3. Смешать в пропорции 60/40 и промаркировать бутылку (срок реализации — 24 часа).',
    photoUrl: createSvgReferencePhoto('П/Ф Цитрусовый микс', 'Выход: 1000 мл • Срок хранения 24 часа', '#eab308'),
    updatedAt: '31.10.2026',
    updatedBy: 'Анна Смирнова',
  },
  {
    id: 'ttk-bar-4',
    section: 'bar',
    group: 'bar_prep_tinctures',
    title: 'Настойка Пряная Вишня на бурбоне',
    ingredients: [
      { id: 'ing-41', name: 'Бурбон 40%', amount: '700 мл' },
      { id: 'ing-42', name: 'Вишня свежемороженая без косточки', amount: '350 г' },
      { id: 'ing-43', name: 'Палочка корицы цейлонской', amount: '1 шт (5 г)' },
      { id: 'ing-44', name: 'Кардамон зеленый (коробочки)', amount: '3 г' },
      { id: 'ing-45', name: 'Сироп демерара 1:1', amount: '100 мл' },
    ],
    preparationTech:
      '1. Вишню дефростировать, слегка размять со специями.\n2. Залить бурбоном и настаивать в темном месте 72 часа (либо 3 часа в су-виде при 60°C).\n3. Отфильтровать через марлю и фильтр-бумагу, добавить сироп демерара, перемешать.',
    photoUrl: createSvgReferencePhoto('Настойка Пряная Вишня', 'Выход: 950 мл • Крепость ~28%', '#f43f5e'),
    updatedAt: '31.10.2026',
    updatedBy: 'Анна Смирнова',
  },
  {
    id: 'ttk-bar-5',
    section: 'bar',
    group: 'bar_prep_alcohol',
    title: 'Джин на анчане и каффир-лайме',
    ingredients: [
      { id: 'ing-51', name: 'Джин сухой', amount: '700 мл' },
      { id: 'ing-52', name: 'Цветки синего чая Анчан', amount: '10 г' },
      { id: 'ing-53', name: 'Листья каффир-лайма сушеные', amount: '4 г' },
    ],
    preparationTech:
      '1. В стеклянную тару с джином добавить цветки анчана и листья каффир-лайма.\n2. Настаивать при комнатной температуре 45 минут до глубокого сапфирового цвета.\n3. Тщательно процедить через сито и перелить в рабочую бутылку.',
    photoUrl: createSvgReferencePhoto('Джин на анчане', 'Выход: 690 мл • Индиго-экстракт', '#6366f1'),
    updatedAt: '31.10.2026',
    updatedBy: 'Анна Смирнова',
  },
  {
    id: 'ttk-bar-6',
    section: 'bar',
    group: 'bar_craft_teas',
    title: 'Крафтовый чай Облепиха — Маракуйя — Имбирь',
    ingredients: [
      { id: 'ing-61', name: 'Пюре облепихи с/м', amount: '50 г' },
      { id: 'ing-62', name: 'Пюре маракуйи с косточкой', amount: '30 г' },
      { id: 'ing-63', name: 'Фреш имбиря', amount: '10 мл' },
      { id: 'ing-64', name: 'Мед цветочный', amount: '25 г' },
      { id: 'ing-65', name: 'Чай жасминовый заваренный (90°C)', amount: '350 мл' },
      { id: 'ing-66', name: 'Апельсин (кружок) и розмарин', amount: '20 г' },
    ],
    preparationTech:
      '1. Прогреть стеклянный заварочный чайник 500 мл.\n2. Положить на дно пюре облепихи, маракуйи, мед, фреш имбиря и кружок апельсина.\n3. Залить горячим жасминовым чаем, прогреть паром на питчере до 85°C и украсить веточкой свежего розмарина.',
    photoUrl: createSvgReferencePhoto('Чай Облепиха — Маракуйя', 'Подача во френч-прессе / стеклянном чайнике 500 мл', '#f97316'),
    updatedAt: '31.10.2026',
    updatedBy: 'Анна Смирнова',
  },
  {
    id: 'ttk-kit-1',
    section: 'kitchen',
    group: 'kitchen_prep',
    title: 'Соус Трюфельный Айоли (П/Ф Кухня)',
    ingredients: [
      { id: 'ing-71', name: 'Желток куриный пастеризованный', amount: '100 г' },
      { id: 'ing-72', name: 'Масло растительное рафинированное', amount: '400 мл' },
      { id: 'ing-73', name: 'Паста черного трюфеля', amount: '35 г' },
      { id: 'ing-74', name: 'Дижонская горчица', amount: '15 г' },
      { id: 'ing-75', name: 'Сок лимона', amount: '15 мл' },
      { id: 'ing-76', name: 'Соль морская мелкая', amount: '5 г' },
    ],
    preparationTech:
      '1. Соединить желток, горчицу, соль и сок лимона в стакане блендера.\n2. Тонкой струйкой вливать масло, взбивая погружным блендером до плотной эмульсии.\n3. Вмешать трюфельную пасту, переложить в диспенсер, наклеить маркировку ХАССП (срок хранения 48 часов при +2...+4°C).',
    photoUrl: createSvgReferencePhoto('Соус Трюфельный Айоли', 'Выход: 550 г • Холодный цех', '#a855f7'),
    updatedAt: '31.10.2026',
    updatedBy: 'Игорь Петров',
  },
  {
    id: 'ttk-kit-2',
    section: 'kitchen',
    group: 'kitchen_dishes',
    title: 'Тартар из говяжьей вырезки с бриошью',
    ingredients: [
      { id: 'ing-81', name: 'Вырезка говяжья зачищенная', amount: '110 г' },
      { id: 'ing-82', name: 'Каперсы мелкие и корнишоны', amount: '20 г' },
      { id: 'ing-83', name: 'Лук шалот (мелкий брюнуаз)', amount: '12 г' },
      { id: 'ing-84', name: 'Соус Трюфельный Айоли (П/Ф)', amount: '25 г' },
      { id: 'ing-85', name: 'Оливковое масло Extra Virgin', amount: '10 мл' },
      { id: 'ing-86', name: 'Хлеб Бриошь обжаренный', amount: '50 г' },
      { id: 'ing-87', name: 'Сыр Пармезан (лепестки)', amount: '10 г' },
    ],
    preparationTech:
      '1. Охлажденную вырезку нарезать вручную мелким кубиком 4x4 мм.\n2. Заправить оливковым маслом, мелко рубленным шалотом, каперсами и корнишонами.\n3. Выложить через сервировочное кольцо на охлажденную тарелку, сверху отсадить капли трюфельного айоли и украсить лепестками пармезана.\n4. Подать с теплой поджаренной на сливочном масле бриошью.',
    photoUrl: createSvgReferencePhoto('Тартар из говядины с бриошью', 'Выход блюда: 225 г • Подача на черной керамике', '#ef4444'),
    updatedAt: '31.10.2026',
    updatedBy: 'Игорь Петров',
  },
];

export const INITIAL_REPORTS: InventoryReport[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    outletId: 'out-1',
    title: 'Добро пожаловать в BarOps!',
    message: 'Открыт базовый аккаунт Администратора заведения «Мята Lounge». Все модули и ТТК готовы к работе.',
    timestamp: 'Только что',
    read: false,
    type: 'system',
  },
];
