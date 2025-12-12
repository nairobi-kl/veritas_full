import React, { useEffect, useState } from 'react';
import {
  Home,
  Calendar,
  BarChart3,
  Clock,
  Settings,
  Plus,
  User as UserIcon,
  Download,
  Menu
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      setShowInstallButton(false);
    }

    setDeferredPrompt(null);
  };

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
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-purple-600 text-white p-2 rounded-xl shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={28} />
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          w-80 bg-purple-600 text-white 
          flex flex-col justify-between
          h-screen overflow-y-auto shadow-xl

          fixed top-0 left-0 z-50 
          transform transition-transform duration-300

          md:translate-x-0 
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6">
          <div className="w-16 h-16 flex items-center justify-center mb-8 p-1">
            <img 
              src="/veritaswh.svg" 
              alt="Veritas Logo" 
              className="w-full h-full object-contain"
            />
          </div>

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
          {showInstallButton && (
            <button
              onClick={handleInstall}
              className="w-full h-14 rounded-xl bg-white text-purple-600 shadow-lg font-semibold flex items-center justify-center mb-6 hover:bg-purple-100"
            >
              <Download size={22} className="mr-2" />
              Встановити додаток
            </button>
          )}
        </div>
        <nav className="flex flex-col flex-1 justify-between px-6">
          <div className="flex flex-col space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsOpen(false); 
                  }}
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

          <button
            onClick={() => {
              onTabChange('settings');
              setIsOpen(false);
            }}
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
    </>
  );
};
