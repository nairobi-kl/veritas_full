// MyResultsPage.tsx — 2025 Edition з фільтром за предметом
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Calendar, Sparkles, Filter, ChevronDown } from 'lucide-react';

interface MyResult {
  id: string;
  testId: string;
  title: string;
  subject: string;
  lecturer: string;
  score: number;
  maxScore: number;
  completedAt: string;
  startTime: string;
  endTime: string;
}

export const MyResultsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [results, setResults] = useState<MyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const loadMyResults = async () => {
      if (!token || !user?.id) return;

      try {
        const response = await fetch(
         `https://veritas-t6l0.onrender.com/student/results/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Помилка завантаження результатів:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMyResults();
  }, [user?.id, token]);

  const subjects = useMemo(() => {
    const unique = [...new Set(results.map(r => r.subject))].sort();
    return ['all', ...unique];
  }, [results]);

  const filteredResults = useMemo(() => {
    if (selectedSubject === 'all') return results;
    return results.filter(r => r.subject === selectedSubject);
  }, [results, selectedSubject]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

return (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
    
    <motion.div
      animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      className="absolute top-10 left-10 w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-purple-400/20 rounded-full blur-3xl"
    />
    
    <motion.div
      animate={{ x: [0, -120, 0], y: [0, 80, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      className="absolute bottom-10 right-10 w-48 h-48 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-blue-400/20 rounded-full blur-3xl"
    />

    <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 md:p-8">

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-8 mb-12 md:mb-16"
      >
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-3 md:mb-4">
            Мої досягнення
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
            {selectedSubject === 'all'
              ? 'Всі пройдені тести та ваші результати'
              : `Результати з предмету: ${selectedSubject}`}
          </p>
        </div>

        <motion.div 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          className="relative w-full sm:w-56"
        >
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full px-6 py-4 bg-white/70 backdrop-blur-xl border border-white/50
               rounded-2xl shadow-lg text-gray-800 font-medium flex items-center justify-between"
          >
            <Filter size={20} className="hidden sm:block" />
            <span>{selectedSubject === 'all' ? 'Всі предмети' : selectedSubject}</span>
            <motion.div animate={{ rotate: isFilterOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown size={20} />
            </motion.div>
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full mt-3 left-0 right-0 bg-white/90 backdrop-blur-2xl
                   rounded-3xl shadow-2xl border border-white/40 overflow-hidden z-50"
              >
                {subjects.map(subject => (
                  <motion.button
                    key={subject}
                    whileHover={{ backgroundColor: 'rgba(168,85,247,0.1)' }}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setIsFilterOpen(false);
                    }}
                    className="w-full px-8 py-5 text-left font-medium text-gray-800 flex items-center justify-between"
                  >
                    <span>{subject === 'all' ? 'Всі предмети' : subject}</span>
                    {selectedSubject === subject && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 bg-purple-600 rounded-full"
                      />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {filteredResults.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 sm:py-20 md:py-24"
        >
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 sm:p-14 md:p-16 max-w-lg mx-auto">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-purple-200 to-blue-200 
                            rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-purple-600" />
            </div>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {selectedSubject === 'all'
                ? 'Ви ще не проходили тестів'
                : `Немає результатів з предмету "${selectedSubject}"`}
            </h3>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredResults.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-gradient-to-br from-purple-200 to-purple-300 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow min-h-[280px]"
            >
              <div className="p-5 sm:p-6">
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-800 tracking-tight mb-3">
                  {result.subject}
                </h3>

                <p className="text-gray-700 font-semibold text-base sm:text-lg mb-4 leading-snug">
                  "{result.title}"
                </p>

                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <p className="text-gray-700">
                    <span className="font-semibold">Викладач:</span> {result.lecturer || '—'}
                  </p>

                  <p className="text-gray-700">
                    <span className="font-semibold">Оцінка:</span>{' '}
                    <span className="inline-block px-3 py-1 bg-purple-700 text-white rounded-full font-bold text-xs sm:text-sm">
                      {result.score} / {result.maxScore}
                    </span>
                  </p>

                  <p className="text-gray-600 text-xs">
                    Пройдено: {formatDate(result.completedAt)}
                  </p>
                </div>
              </div>

              <div className="bg-purple-700/30 px-5 sm:px-6 py-3 sm:py-4 border-t border-purple-400">
                <p className="text-[10px] sm:text-xs text-gray-700 font-medium">
                  {formatDate(result.startTime)} – {formatDate(result.endTime)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  </div>
);
}