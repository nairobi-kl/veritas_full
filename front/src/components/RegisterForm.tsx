import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Group {
  id: number;
  group_code: string;
  group_number: string;
}

export const RegisterForm: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const { register, error, isLoading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);

  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    group_id: '',
    role: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetch('https://veritas-t6l0.onrender.com/groups')
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setGroups(data) : setGroups([]))
      .catch(() => setGroups([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert('Паролі не збігаються!');
    return;
  }

  const password = formData.password.trim();

  const registerData = {
    user_name: formData.user_name.trim(),
    email: formData.email.trim(),
    password,
    confirmPassword: formData.confirmPassword.trim(), 
    role: formData.role,
    group_id:
      formData.role === 'admin'
        ? 6
        : Number(formData.group_id),
  };

  const success = await register(registerData);

  if (success) {
    alert('Реєстрація успішна! Тепер можете увійти.');
    onSwitchToLogin();
  }
};


  const isTeacher = formData.role === 'admin';

  return (
  <form onSubmit={handleSubmit} className="space-y-6">

    {error && error.type === 'register' && (
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
      type="text"
      name="user_name"
      value={formData.user_name}
      onChange={handleChange}
      placeholder="Прізвище та ім'я"
      required
      className="w-full px-5 py-4 text-[15px] bg-white/80 backdrop-blur rounded-xl focus:ring-4 focus:ring-purple-300 focus:outline-none"
    />
    <motion.input
      whileFocus={{ scale: 1.02 }}
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      placeholder="Корпоративна пошта"
      required
      className="w-full px-5 py-4 text-[15px] bg-white/80 backdrop-blur rounded-xl focus:ring-4 focus:ring-purple-300 focus:outline-none"
    />
    <motion.div whileFocus={{ scale: 1.02 }} className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Пароль"
        required
        className="w-full px-5 py-4 text-[15px] bg-white/80 backdrop-blur rounded-xl focus:ring-4 focus:ring-purple-300 focus:outline-none pr-12"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </motion.div>
    <motion.div whileFocus={{ scale: 1.02 }} className="relative">
      <input
        type={showConfirm ? 'text' : 'password'}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Повторіть пароль"
        required
        className="w-full px-5 py-4 text-[15px] bg-white/80 backdrop-blur rounded-xl focus:ring-4 focus:ring-purple-300 focus:outline-none pr-12"
      />
      <button
        type="button"
        onClick={() => setShowConfirm(!showConfirm)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600"
      >
        {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </motion.div>


    <motion.div whileFocus={{ scale: 1.02 }} className="relative">
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        required
        className="w-full px-5 py-4 text-[15px] bg-white/80 backdrop-blur rounded-xl focus:ring-4 focus:ring-purple-300 focus:outline-none appearance-none"
      >
        <option value="" disabled hidden>Профіль</option>
        <option value="student">Студент</option>
        <option value="admin">Викладач</option>
      </select>
      <ChevronDown
        className="absolute right-4 top-5 text-purple-600 pointer-events-none"
        size={20}
      />
    </motion.div>

    <AnimatePresence>
      {!isTeacher && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div whileFocus={{ scale: 1.02 }} className="relative">
            <select
              name="group_id"
              value={formData.group_id}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 text-[15px] bg-white/80 backdrop-blur rounded-xl focus:ring-4 focus:ring-purple-300 focus:outline-none appearance-none"
            >
              <option value="" disabled hidden>Група</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.group_code}-{g.group_number}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-4 top-5 text-purple-600 pointer-events-none"
              size={20}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {isTeacher && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-2xl text-center shadow-xl"
        >
          <p className="text-base mt-2">Ви автоматично приєднані до викладацької групи</p>
        </motion.div>
      )}
    </AnimatePresence>

    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      type="submit"
      disabled={isLoading}
      className="
        w-full 
        bg-gradient-to-r from-purple-600 to-blue-600 
        text-white 
        py-5 
        rounded-xl 
        font-bold text-lg 
        shadow-xl 
        hover:shadow-purple-500/30 
        transition-all
      "
    >
      {isLoading ? "Реєстрація..." : "Зареєструватися"}
    </motion.button>

    <div className="text-center pt-3">
      <p className="text-gray-600 text-sm">
        Вже зареєстровані?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-purple-600 font-bold hover:text-purple-700"
        >
          Увійти
        </button>
      </p>
    </div>
  </form>
)};
