import React from 'react';
import {
  Home,
  Calendar,
  BarChart3,
  Clock,
  Settings,
  Plus,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const studentMenuItems = [
    { id: 'tests', icon: Home, label: 'Актуальні тести' },
    { id: 'results', icon: Calendar, label: 'Мої результати' },
    { id: 'analytics', icon: BarChart3, label: 'Аналітика' },
    { id: 'history', icon: Clock, label: 'Історія' },
  ];

  const teacherMenuItems = [
    { id: 'tests', icon: Home, label: 'Актуальні тести' },
    { id: 'create-test', icon: Plus, label: 'Створити тест' },
    { id: 'analytics', icon: BarChart3, label: 'Аналітика' },
    { id: 'history', icon: Clock, label: 'Історія' },
  ];

  const menuItems = user?.role === 'teacher' ? teacherMenuItems : studentMenuItems;

  return (
    <aside
      className="
        w-80 bg-purple-600 text-white 
        flex flex-col justify-between
        sticky top-0 
        h-screen 
        overflow-y-auto
        shadow-xl
      "
    >
     {/* Верхня частина */}
<div className="p-6">
  {/* Логотип */}
  <div className="w-16 h-16 flex items-center justify-center mb-8 p-1">
    <img 
      src="/veritaswh.svg" 
      alt="Veritas Logo" 
      className="w-full h-full object-contain"
    />
  </div>

        {/* Профіль користувача */}
        <div className="bg-purple-500 rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              {user?.firstName ? (
                <span className="text-purple-600 font-bold text-2xl">
                  {user.firstName[0]}
                </span>
              ) : (
                <UserIcon size={36} className="text-purple-600" />
              )}
            </div>

            <div>
              <h3 className="text-white font-bold text-lg">
                {user?.firstName || 'Невідомий користувач'}
              </h3>
              <p className="text-purple-200 text-sm">
                {user?.role === 'teacher' ? 'Викладач' : 'Студент'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full bg-purple-400 hover:bg-purple-300 text-white py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Вихід
          </button>
        </div>
      </div>

      {/* Меню */}
      <nav className="flex flex-col flex-1 justify-between px-6">
        <div className="flex flex-col space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full h-14 rounded-xl flex items-center px-4 transition-all ${
                  activeTab === item.id
                    ? 'bg-white text-purple-600 shadow-lg font-semibold'
                    : 'text-purple-200 hover:text-white hover:bg-purple-500'
                }`}
              >
                <Icon size={24} className="mr-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Кнопка "Налаштування" */}
        <button
          onClick={() => onTabChange('settings')}
          className={`w-full h-14 rounded-xl flex items-center px-4 transition-all mb-6 ${
            activeTab === 'settings'
              ? 'bg-white text-purple-600 shadow-lg font-semibold'
              : 'text-purple-200 hover:text-white hover:bg-purple-500'
          }`}
        >
          <Settings size={24} className="mr-3" />
          <span>Налаштування</span>
        </button>
      </nav>
    </aside>
  );
};
