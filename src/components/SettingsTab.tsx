import React, { useState, useEffect } from 'react';
import { db } from '../db/database';
import type { Category, PaymentMethod, Transaction } from '../types';
import { 
  FolderPlus, 
  Trash2, 
  CreditCard, 
  Download, 
  Upload, 
  RotateCcw, 
  Tag, 
  CheckCircle2,
  AlertTriangle 
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  // Category Inputs
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');

  // Method Input
  const [newMethodName, setNewMethodName] = useState('');

  // Status message
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    const cats = await db.categories.toArray();
    const meths = await db.methods.toArray();
    setCategories(cats);
    setMethods(meths);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    await db.categories.add({
      name: trimmed,
      type: newCatType
    });

    setNewCatName('');
    showToast(`Категория "${trimmed}" добавлена`);
    loadData();
  };

  // Delete Category
  const handleDeleteCategory = async (id?: number, name?: string) => {
    if (!id) return;
    if (confirm(`Удалить категорию "${name}"?`)) {
      await db.categories.delete(id);
      showToast(`Категория "${name}" удалена`);
      loadData();
    }
  };

  // Add Payment Method
  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMethodName.trim();
    if (!trimmed) return;

    await db.methods.add({ name: trimmed });
    setNewMethodName('');
    showToast(`Способ оплаты "${trimmed}" добавлен`);
    loadData();
  };

  // Delete Method
  const handleDeleteMethod = async (id?: number, name?: string) => {
    if (!id) return;
    if (confirm(`Удалить способ оплаты "${name}"?`)) {
      await db.methods.delete(id);
      showToast(`Способ оплаты "${name}" удален`);
      loadData();
    }
  };

  // Backup JSON Export
  const handleExportBackup = async () => {
    const expensesArr = await db.expenses.toArray();
    const categoriesArr = await db.categories.toArray();
    const methodsArr = await db.methods.toArray();

    const backupData = {
      version: 1,
      exportDate: new Date().toISOString(),
      expenses: expensesArr,
      categories: categoriesArr,
      methods: methodsArr
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Finance_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Резервная копия скачана!');
  };

  // Backup JSON Import
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.expenses && Array.isArray(json.expenses)) {
          if (confirm('Импорт заменит или добавит данные. Продолжить?')) {
            await db.expenses.clear();
            await db.categories.clear();
            await db.methods.clear();

            await db.expenses.bulkAdd(json.expenses);
            if (json.categories) await db.categories.bulkAdd(json.categories);
            if (json.methods) await db.methods.bulkAdd(json.methods);

            showToast('Данные успешно импортированы!');
            loadData();
          }
        } else {
          alert('Неверный формат файла резервной копии');
        }
      } catch (err) {
        alert('Ошибка при чтении файла');
      }
    };
    reader.readAsText(file);
  };

  // Reset database
  const handleResetData = async () => {
    if (confirm('Внимание! Все транзакции, категории и способы оплаты будут сброшены. Вы уверены?')) {
      await db.expenses.clear();
      await db.categories.clear();
      await db.methods.clear();

      // Seed default
      await db.categories.bulkAdd([
        { name: 'Продукты', type: 'expense' },
        { name: 'Транспорт', type: 'expense' },
        { name: 'Жилье и КУ', type: 'expense' },
        { name: 'Зарплата', type: 'income' }
      ]);
      await db.methods.bulkAdd([
        { name: 'Карта' },
        { name: 'Наличные' }
      ]);

      showToast('База данных сброшена до начальных настроек');
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-600" />
          Управление Категориями
        </h2>

        {/* Add Form */}
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2">
          <select
            value={newCatType}
            onChange={e => setNewCatType(e.target.value as 'expense' | 'income')}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-gray-50 text-gray-700"
          >
            <option value="expense">Расход</option>
            <option value="income">Доход</option>
          </select>
          <input
            type="text"
            placeholder="Название категории..."
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1 shadow-sm"
          >
            <FolderPlus className="w-4 h-4" /> Добавить
          </button>
        </form>

        {/* Categories List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div>
            <p className="text-xs font-bold text-rose-600 uppercase mb-2">Категории расходов</p>
            <div className="space-y-1.5">
              {categories
                .filter(c => c.type === 'expense' || !c.type)
                .map(c => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium"
                  >
                    <span className="text-gray-800">{c.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase mb-2">Категории доходов</p>
            <div className="space-y-1.5">
              {categories
                .filter(c => c.type === 'income')
                .map(c => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium"
                  >
                    <span className="text-gray-800">{c.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Виды платежей
        </h2>

        <form onSubmit={handleAddMethod} className="flex gap-2">
          <input
            type="text"
            placeholder="Новый способ оплаты (напр., Карта МИР)..."
            value={newMethodName}
            onChange={e => setNewMethodName(e.target.value)}
            className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center gap-1 shadow-sm"
          >
            Добавить
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {methods.map(m => (
            <div
              key={m.id}
              className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium"
            >
              <span className="text-gray-800">{m.name}</span>
              <button
                onClick={() => handleDeleteMethod(m.id, m.name)}
                className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Data Management */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Резервное копирование и управление данными</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Скачать копию (JSON)</p>
              <p className="text-xs text-gray-500 mt-1">Сохраните файл со всеми транзакциями и настройками на компьютер.</p>
            </div>
            <button
              onClick={handleExportBackup}
              className="py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Экспорт JSON
            </button>
          </div>

          <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Восстановить из файла</p>
              <p className="text-xs text-gray-500 mt-1">Загрузите ранее сохраненный файл резервной копии .json</p>
            </div>
            <label className="py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Загрузить JSON
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={handleResetData}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 py-1"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Сбросить базу данных до стандартных значений
          </button>
        </div>
      </div>
    </div>
  );
};
