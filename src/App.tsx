import React, { useState, useEffect } from 'react';
import { seedInitialData } from './db/database';
import { ExpensesTab } from './components/ExpensesTab';
import { BudgetTab } from './components/BudgetTab';
import { SettingsTab } from './components/SettingsTab';
import { ReportsTab } from './components/ReportsTab';
import { DeployGuideModal } from './components/DeployGuideModal';
import { Wallet, PieChart, Settings, Rocket, ShieldCheck, PiggyBank } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'budget' | 'reports' | 'settings'>('expenses');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    seedInitialData().then(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-gray-500">Загрузка базы данных IndexedDB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Мои Финансы</h1>
              <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Локальная база данных Dexie (IndexedDB)
              </p>
            </div>
          </div>

          {/* Deployment Guide Action Button */}
          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20 transition-all shadow-sm"
          >
            <Rocket className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Как задеплоить?</span>
            <span className="sm:hidden">Деплой</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-md border-t border-white/10">
          <div className="max-w-4xl mx-auto flex">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 border-b-2 transition-all ${
                activeTab === 'expenses'
                  ? 'border-white text-white font-bold bg-white/10'
                  : 'border-transparent text-blue-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Затраты</span>
            </button>

            <button
              onClick={() => setActiveTab('budget')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 border-b-2 transition-all ${
                activeTab === 'budget'
                  ? 'border-white text-white font-bold bg-white/10'
                  : 'border-transparent text-blue-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <PiggyBank className="w-4 h-4" />
              <span>Бюджет</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 border-b-2 transition-all ${
                activeTab === 'reports'
                  ? 'border-white text-white font-bold bg-white/10'
                  : 'border-transparent text-blue-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Отчеты</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 border-b-2 transition-all ${
                activeTab === 'settings'
                  ? 'border-white text-white font-bold bg-white/10'
                  : 'border-transparent text-blue-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Настройки</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-20">
        {activeTab === 'expenses' && <ExpensesTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Личные Финансы • Автономное веб-приложение</span>
          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="text-blue-600 hover:underline font-medium"
          >
            Инструкция по деплою на Vercel / GitHub Pages
          </button>
        </div>
      </footer>

      {/* Deploy Modal */}
      <DeployGuideModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </div>
  );
}

