import Dexie, { type Table } from 'dexie';
import type { Transaction, Category, PaymentMethod, BudgetItem, BudgetReallocation } from '../types';

export class FinanceDatabase extends Dexie {
  expenses!: Table<Transaction>;
  categories!: Table<Category>;
  methods!: Table<PaymentMethod>;
  budgets!: Table<BudgetItem>;
  reallocations!: Table<BudgetReallocation>;

  constructor() {
    super('FinanceDB');
    
    this.version(2).stores({
      expenses: '++id, amount, category, method, date, type',
      categories: '++id, name, type',
      methods: '++id, name'
    });

    this.version(3).stores({
      expenses: '++id, amount, category, method, date, type, necessity, frequency, planning, incomeFrequency',
      categories: '++id, name, type',
      methods: '++id, name'
    });

    this.version(4).stores({
      expenses: '++id, amount, category, method, date, type, necessity, frequency, planning, incomeFrequency',
      categories: '++id, name, type',
      methods: '++id, name',
      budgets: '++id, period, category, type, [period+category]',
      reallocations: '++id, period, date'
    });
  }
}

export const db = new FinanceDatabase();

export async function seedInitialData() {
  const catCount = await db.categories.count();
  if (catCount === 0) {
    await db.categories.bulkAdd([
      { name: 'Продукты', type: 'expense', color: '#ef4444', icon: 'ShoppingCart' },
      { name: 'Транспорт', type: 'expense', color: '#3b82f6', icon: 'Car' },
      { name: 'Жилье и КУ', type: 'expense', color: '#10b981', icon: 'Home' },
      { name: 'Развлечения', type: 'expense', color: '#8b5cf6', icon: 'Film' },
      { name: 'Здоровье', type: 'expense', color: '#ec4899', icon: 'HeartPulse' },
      { name: 'Кафе и Рестораны', type: 'expense', color: '#f59e0b', icon: 'Utensils' },
      { name: 'Одежда', type: 'expense', color: '#06b6d4', icon: 'ShoppingBag' },
      { name: 'Зарплата', type: 'income', color: '#10b981', icon: 'Wallet' },
      { name: 'Фриланс', type: 'income', color: '#6366f1', icon: 'Laptop' },
      { name: 'Инвестиции', type: 'income', color: '#84cc16', icon: 'TrendingUp' },
    ]);
  }

  const methodCount = await db.methods.count();
  if (methodCount === 0) {
    await db.methods.bulkAdd([
      { name: 'Карта' },
      { name: 'Наличные' },
      { name: 'СБП / Перевод' },
      { name: 'Сберегательный счет' }
    ]);
  }
}
