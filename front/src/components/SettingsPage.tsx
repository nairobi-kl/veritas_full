// src/components/SettingsPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Lock, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SettingsPageProps {
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { user, logout } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fullName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : 'Не вказано';

  const group = user?.groupCode && user?.groupNumber
    ? `${user.groupCode}-${user.groupNumber}`
    : 'Не вказано';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert('Паролі не збігаються');
    if (newPassword.length < 6) return alert('Мінімум 6 символів');

    try {
      const res = await fetch('https://veritas-t6l0.onrender.com/student/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Пароль успішно змінено!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(data.message || 'Помилка');
      }
    } catch {
      alert('Не вдалося підключитися до сервера');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Видалити акаунт назавжди?')) return;
    if (!confirm('ОСТАННЄ ПОПЕРЕДЖЕННЯ. Це неможливо скасувати!')) return;

    try {
      const res = await fetch('https://veritas-t6l0.onrender.com/student/delete-account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (res.ok) {
        alert('Акаунт видалено');
        logout();
      } else {
        const data = await res.json();
        alert(data.message || 'Помилка видалення');
      }
    } catch {
      alert('Сервер недоступний');
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await fetch('https://veritas-t6l0.onrender.com/student/export-results', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (!res.ok) throw new Error('Помилка завантаження');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `результати_${user?.role === 'teacher' ? 'всіх' : 'мої'}_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Не вдалося завантажити файл');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-medium mb-6 transition"
      >
        <ArrowLeft size={20} />
        Назад до тестів
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-8">
          Налаштування
        </h1>
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-6 border border-purple-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <User className="w-7 h-7 text-purple-600" />
            Профіль
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-lg">
            <div><p className="text-gray-600">Ім'я</p><p className="font-semibold">{fullName}</p></div>
            <div><p className="text-gray-600">Пошта</p><p className="font-semibold">{user?.email}</p></div>
            {user?.role === 'student' && (
              <div><p className="text-gray-600">Група</p><p className="font-bold text-purple-600">{group}</p></div>
            )}
            <div><p className="text-gray-600">Роль</p><p className="font-bold text-purple-600 capitalize">{user?.role === 'teacher' ? 'Викладач' : 'Студент'}</p></div>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-6 border border-purple-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Lock className="w-7 h-7 text-purple-600" />
            Зміна пароля
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <input type="password" placeholder="Старий пароль" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100" />
            <input type="password" placeholder="Новий пароль" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100" />
            <input type="password" placeholder="Повторіть новий пароль" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100" />
            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition">
              Змінити пароль
            </button>
          </form>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-red-800 mb-6">Небезпечна зона</h2>
            <button
              onClick={handleExportExcel}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl mb-4 transition flex items-center justify-center gap-3"
            >
              <Download className="w-5 h-5" />
              Завантажити всі результати (Excel)
            </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-3"
          >
            <Trash2 className="w-5 h-5" />
            Видалити акаунт назавжди
          </button>
        </div>
      </motion.div>
    </div>
  );
};