// src/components/AuthLayout.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  isLogin: boolean;
  onToggle: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, isLogin, onToggle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 relative overflow-hidden flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -120, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-32 right-32 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl"
        />
        <div className="absolute top-8 left-8 z-10">
          <img src="/veritaslg.svg" alt="Veritas Logo" className="w-16 h-16 drop-shadow-2xl" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <img 
            src="/login.svg" 
            alt="Навчання" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-lg"
          >
            <div className="bg-gradient-to-r from-purple-600/70 to-blue-600/70 backdrop-blur-sm p-6 rounded-2xl max-w-md">
            <h1 className="text-2xl font-black mb-4 leading-tight drop-shadow-2xl">
              Успіх починається з першого кроку - входу
            </h1>
            <p className="text-lg text-gray-200 drop-shadow-lg">
              Авторизуйтеся у систему перевірки знань
            </p>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-gray-900 mb-3">{title}</h2>
            {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
          </div>
          <motion.div
            layout 
  transition={{ 
    type: "spring", 
    stiffness: 300, 
    damping: 30 
  }}
  className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl 
    p-8              /* зменшили padding */
    w-full 
    max-w-xl         /* 🔥 зменшує ширину РАЗОМ для login + register */
    mx-auto"
>
  <AnimatePresence mode="wait">
    <motion.div
      key={isLogin ? 'login' : 'register'}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      {children}
              </motion.div>
            </AnimatePresence>
            </motion.div>
            <div className="text-center mt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onToggle}
                className="text-purple-600 font-bold text-lg hover:text-purple-700 transition-colors"
              >
              </motion.button>
           </div>
            </motion.div>
      
      </div>
    </div>
  );
};