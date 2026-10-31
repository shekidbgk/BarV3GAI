import React, { useRef, useState } from 'react';
import {
  BookOpen,
  Wine,
  ChefHat,
  Search,
  Plus,
  Edit3,
  Trash2,
  Camera,
  X,
  Image as ImageIcon,
  FileText,
  Layers,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import {
  TECH_CARD_GROUPS,
  TechCardGroup,
  TechCardIngredient,
  TechCardItem,
  TechCardSection,
} from '../../types';
import { canManageTechCards, filterTechCards } from '../../utils/logic';

export const TechCardsView: React.FC = () => {
  const { currentUser, techCards, addTechCard, updateTechCard, deleteTechCard } = useApp();
  const photoInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  // Initial section based on role (all users can view both sections)
  const initialSection: TechCardSection =
    currentUser.role === 'head_chef' || currentUser.role === 'cook' ? 'kitchen' : 'bar';

  const [activeSection, setActiveSection] = useState<TechCardSection>(initialSection);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state for Add / Edit TTK card
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [formSection, setFormSection] = useState<TechCardSection>(activeSection);
  const [formGroup, setFormGroup] = useState<TechCardGroup>(
    activeSection === 'bar' ? 'bar_cocktails' : 'kitchen_dishes'
  );
  const [formTitle, setFormTitle] = useState('');
  const [formIngredients, setFormIngredients] = useState<TechCardIngredient[]>([
    { id: 'ing-init-1', name: '', amount: '' },
  ]);
  const [formPrepTech, setFormPrepTech] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');

  const canManage = canManageTechCards(currentUser.role);

  const sectionGroups = TECH_CARD_GROUPS.filter((g) => g.section === activeSection);
  const filteredCards = filterTechCards(
    techCards,
    activeSection,
    selectedGroupFilter,
    searchQuery
  );

  const openCreateModal = () => {
    setEditingCardId(null);
    setFormSection(activeSection);
    setFormGroup(activeSection === 'bar' ? 'bar_cocktails' : 'kitchen_dishes');
    setFormTitle('');
    setFormIngredients([
      { id: 'ing-' + Date.now() + '-1', name: '', amount: '' },
      { id: 'ing-' + Date.now() + '-2', name: '', amount: '' },
    ]);
    setFormPrepTech('');
    setFormPhotoUrl('');
    setIsEditorOpen(true);
  };

  const openEditModal = (card: TechCardItem) => {
    setEditingCardId(card.id);
    setFormSection(card.section);
    setFormGroup(card.group);
    setFormTitle(card.title);
    setFormIngredients(
      card.ingredients.length > 0
        ? card.ingredients.map((i) => ({ ...i }))
        : [{ id: 'ing-' + Date.now(), name: '', amount: '' }]
    );
    setFormPrepTech(card.preparationTech);
    setFormPhotoUrl(card.photoUrl || '');
    setIsEditorOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddIngredientRow = () => {
    setFormIngredients((prev) => [
      ...prev,
      { id: 'ing-' + Date.now() + '-' + prev.length, name: '', amount: '' },
    ]);
  };

  const handleRemoveIngredientRow = (id: string) => {
    if (formIngredients.length <= 1) return;
    setFormIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const handleIngredientChange = (id: string, field: 'name' | 'amount', value: string) => {
    setFormIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPrepTech.trim()) return;

    const validIngredients = formIngredients
      .map((i) => ({
        id: i.id,
        name: i.name.trim(),
        amount: i.amount.trim(),
      }))
      .filter((i) => i.name.length > 0);

    if (validIngredients.length === 0) return;

    if (editingCardId) {
      updateTechCard(editingCardId, {
        section: formSection,
        group: formGroup,
        title: formTitle.trim(),
        ingredients: validIngredients,
        preparationTech: formPrepTech.trim(),
        photoUrl: formPhotoUrl || undefined,
      });
    } else {
      addTechCard({
        section: formSection,
        group: formGroup,
        title: formTitle.trim(),
        ingredients: validIngredients,
        preparationTech: formPrepTech.trim(),
        photoUrl: formPhotoUrl || undefined,
      });
    }

    setIsEditorOpen(false);
    setEditingCardId(null);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Section Switcher: «Для бара» / «Для кухни» */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-neutral-900 border border-neutral-800">
        <button
          type="button"
          onClick={() => {
            setActiveSection('bar');
            setSelectedGroupFilter('all');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            activeSection === 'bar'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Wine className="w-4 h-4" />
          <span>Для бара</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSection('kitchen');
            setSelectedGroupFilter('all');
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            activeSection === 'kitchen'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Для кухни</span>
        </button>
      </div>

      {/* 2. Top Banner & Add Card Button */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-900/60 border border-neutral-800 shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-100">
              Технологические карты ({activeSection === 'bar' ? 'Для бара' : 'Для кухни'})
            </h2>
            <p className="text-[11px] text-neutral-400">
              Рецептуры, граммовки, технология приготовления и фотоэталоны
            </p>
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 active:scale-95 transition shadow-md shadow-amber-500/20 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить ТТК</span>
          </button>
        )}
      </div>

      {/* 3. Search by Card Name & Group Filter */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск карточки ТТК по наименованию..."
            aria-label="Поиск карточки ТТК по наименованию"
            className="w-full rounded-xl bg-neutral-900 border border-neutral-800 pl-10 pr-4 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* Group Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedGroupFilter('all')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition ${
              selectedGroupFilter === 'all'
                ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            Все группы
          </button>

          {activeSection === 'bar' && (
            <button
              type="button"
              onClick={() => setSelectedGroupFilter('bar_all_preps')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition ${
                selectedGroupFilter === 'bar_all_preps'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              Все заготовки бара
            </button>
          )}

          {sectionGroups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGroupFilter(g.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition ${
                selectedGroupFilter === g.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {g.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Vertical Mobile-Friendly TTK Cards List */}
      <div className="space-y-4">
        {filteredCards.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/40 p-6">
            <BookOpen className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-400">
              Технологические карты не найдены
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Попробуйте изменить поисковый запрос или выберите другую группу
            </p>
          </div>
        ) : (
          filteredCards.map((card) => {
            const groupInfo = TECH_CARD_GROUPS.find((g) => g.id === card.group);

            return (
              <article
                key={card.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/95 overflow-hidden shadow-md flex flex-col"
              >
                {/* Photo Reference (Фотоэталон) if available */}
                {card.photoUrl && (
                  <div className="relative w-full h-44 sm:h-52 bg-neutral-950 border-b border-neutral-800 overflow-hidden">
                    <img
                      src={card.photoUrl}
                      alt={`Фотоэталон: ${card.title}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-neutral-950/85 backdrop-blur-sm border border-amber-500/30 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-amber-400" />
                      Фотоэталон
                    </span>
                  </div>
                )}

                <div className="p-4 space-y-4">
                  {/* Card Header: Group Badge, Title & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                        <Layers className="w-3 h-3" />
                        <span>{groupInfo ? groupInfo.label : card.group}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-neutral-100 leading-snug">
                        {card.title}
                      </h3>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(card)}
                          className="p-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-amber-300 hover:border-amber-500/40 transition"
                          title="Редактировать ТТК"
                          aria-label={`Редактировать ${card.title}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTechCard(card.id)}
                          className="p-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-500/40 transition"
                          title="Удалить ТТК"
                          aria-label={`Удалить ${card.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Ingredients Table (Таблица ингредиентов) */}
                  <div className="rounded-xl border border-neutral-800 overflow-hidden bg-neutral-950/60">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-neutral-800 bg-neutral-950 text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                          <th className="py-2 px-3">Наименование ингредиента</th>
                          <th className="py-2 px-3 text-right w-32">Объем / Кол-во</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/70">
                        {card.ingredients.map((ing) => (
                          <tr key={ing.id} className="hover:bg-neutral-900/50">
                            <td className="py-2 px-3 font-medium text-neutral-200">
                              {ing.name}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-amber-300 whitespace-nowrap">
                              {ing.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Preparation Technology Block (Технология приготовления) */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Технология приготовления</span>
                    </div>
                    <p className="text-xs text-neutral-200 whitespace-pre-line leading-relaxed">
                      {card.preparationTech}
                    </p>
                  </div>

                  {card.updatedAt && (
                    <div className="text-[10px] text-neutral-500 flex items-center justify-between pt-1 border-t border-neutral-800/60">
                      <span>Раздел: {card.section === 'bar' ? 'Для бара' : 'Для кухни'}</span>
                      <span>
                        Обновлено: {card.updatedAt} {card.updatedBy ? `(${card.updatedBy})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Add / Edit TTK Card Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                {editingCardId
                  ? 'Редактировать карточку ТТК'
                  : 'Новая технологическая карта (ТТК)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                aria-label="Закрыть окно"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-4">
              {/* Section & Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Раздел ТТК *
                  </label>
                  <select
                    value={formSection}
                    onChange={(e) => {
                      const nextSec = e.target.value as TechCardSection;
                      setFormSection(nextSec);
                      setFormGroup(nextSec === 'bar' ? 'bar_cocktails' : 'kitchen_dishes');
                    }}
                    className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-neutral-100 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="bar">Для бара</option>
                    <option value="kitchen">Для кухни</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Группа *
                  </label>
                  <select
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value as TechCardGroup)}
                    className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-neutral-100 focus:border-amber-400 focus:outline-none"
                  >
                    {TECH_CARD_GROUPS.filter((g) => g.section === formSection).map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Наименование (заготовки или блюда) *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Например: Кордиал Малина-Шисо / Тартар из лосося"
                  className="w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3.5 py-2 text-xs text-neutral-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Ingredients Table Builder */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">
                    Таблица ингредиентов *
                  </span>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="text-xs font-semibold text-amber-300 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Добавить ингредиент
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase text-neutral-400 px-1">
                  <div className="col-span-7">Наименование ингредиента</div>
                  <div className="col-span-4">Объем/Кол-во</div>
                  <div className="col-span-1"></div>
                </div>

                {formIngredients.map((ing, idx) => (
                  <div key={ing.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-7">
                      <input
                        type="text"
                        required={idx === 0}
                        value={ing.name}
                        onChange={(e) =>
                          handleIngredientChange(ing.id, 'name', e.target.value)
                        }
                        placeholder="Ингредиент..."
                        className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-2.5 py-1.5 text-xs text-neutral-100 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        required={idx === 0}
                        value={ing.amount}
                        onChange={(e) =>
                          handleIngredientChange(ing.id, 'amount', e.target.value)
                        }
                        placeholder="50 мл / 20 г"
                        className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-2.5 py-1.5 text-xs text-neutral-100 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {formIngredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredientRow(ing.id)}
                          className="p-1 text-neutral-500 hover:text-rose-400"
                          aria-label="Удалить строку ингредиента"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Preparation Technology */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Технология приготовления *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formPrepTech}
                  onChange={(e) => setFormPrepTech(e.target.value)}
                  placeholder="Пошаговое описание процесса приготовления, подачи и условий хранения..."
                  className="w-full rounded-xl bg-neutral-950 border border-neutral-700 p-3 text-xs text-neutral-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Photo Reference Upload */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300">
                    Фотоэталон подачи (изображение)
                  </span>
                  {formPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormPhotoUrl('')}
                      className="text-[11px] text-rose-400 hover:underline"
                    >
                      Удалить фото
                    </button>
                  )}
                </div>

                {formPhotoUrl && (
                  <img
                    src={formPhotoUrl}
                    alt="Предпросмотр фотоэталона"
                    className="w-full h-36 object-cover rounded-xl border border-neutral-700"
                  />
                )}

                <div className="flex items-center gap-2">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="ttk-photo-upload"
                  />
                  <label
                    htmlFor="ttk-photo-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-semibold text-amber-300 hover:border-amber-500/40 cursor-pointer transition"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{formPhotoUrl ? 'Заменить фотоэталон' : 'Загрузить фотоэталон'}</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 transition"
                >
                  {editingCardId ? 'Сохранить изменения' : 'Создать карточку ТТК'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
