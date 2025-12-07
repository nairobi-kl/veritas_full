// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginForm: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const { login, error, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && error.type === 'login' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl text-center"
        >
          {error.message}
        </motion.div>
      )}

      <motion.input
        whileFocus={{ scale: 1.02 }}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Корпоративна пошта"
        required
        className="w-full px-6 py-5 bg-white/80 backdrop-blur rounded-2xl focus:ring-4 focus:ring-purple-300 focus:outline-none transition-all"
      />

      <motion.div whileFocus={{ scale: 1.02 }} className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          required
          className="w-full px-6 py-5 bg-white/80 backdrop-blur rounded-2xl focus:ring-4 focus:ring-purple-300 focus:outline-none pr-14"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-700"
        >
          {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </motion.div>

      <a href="#" className="text-purple-600 hover:text-purple-700 text-sm font-medium block text-right">
        Забули пароль?
      </a>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3"
      >
        {isLoading ? 'Вхід...' : 'Увійти'}
        <ArrowRight size={22} />
      </motion.button>

      <div className="text-center pt-4">
        <p className="text-gray-600">
          Новий користувач?{' '}
          <button type="button" onClick={onSwitchToRegister} className="text-purple-600 font-bold hover:text-purple-700">
            Зареєструватися
          </button>
        </p>
      </div>
    </form>
  );
};