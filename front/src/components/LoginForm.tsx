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
  <form onSubmit={handleSubmit} className="space-y-5">

    {error && error.type === 'login' && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-xl text-center text-sm"
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
      className="
        w-full 
        px-5 py-4         /* було px-6 py-5 */
        text-[15px]       /* компактніший текст */
        bg-white/80 backdrop-blur 
        rounded-xl        /* було rounded-2xl */
        focus:ring-4 focus:ring-purple-300 
        transition-all
      "
    />
    <motion.div whileFocus={{ scale: 1.02 }} className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Пароль"
        required
        className="
          w-full 
          px-5 py-4
          text-[15px]
          bg-white/80 backdrop-blur 
          rounded-xl
          focus:ring-4 focus:ring-purple-300 
          pr-12
        "
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-700"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </motion.div>
    <a
      href="#"
      className="text-purple-600 hover:text-purple-700 text-xs font-medium block text-right"
    >
      Забули пароль?
    </a>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type="submit"
      disabled={isLoading}
      className="
        w-full 
        bg-gradient-to-r from-purple-600 to-blue-600 
        text-white 
        py-4               /* було py-5 */
        rounded-xl 
        font-bold text-base /* було text-lg */
        shadow-lg hover:shadow-xl 
        transition-all 
        flex items-center justify-center gap-2
      "
    >
      {isLoading ? 'Вхід...' : 'Увійти'}
      <ArrowRight size={20} />
    </motion.button>
    <div className="text-center pt-3">
      <p className="text-gray-600 text-sm">
        Новий користувач?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-purple-600 font-bold hover:text-purple-700"
        >
          Зареєструватися
        </button>
      </p>
    </div>
  </form>
);
};
