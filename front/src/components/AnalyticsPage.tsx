import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { TestResult } from '../types';

interface AnalyticsData {
  subject: string;
  averageScore: number;
  totalAttempts: number;
  maxScore: number;
}

interface GroupAnalytics {
  group: string;
  averageScore: number;
  studentsPassed: number;
  totalStudents: number;
}

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Фільтри
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

 useEffect(() => {
  const fetchResults = async () => {
    if (!user || !user.token) {
      setLoading(false);
      return;
    }

    try {
      let url = '';

      if (isTeacher) {
        url = 'https://veritas-t6l0.onrender.com/teacher/analytics';
      } else {
        url = `https://veritas-t6l0.onrender.com/student/analytics/${user.id}`;
      }

      console.log('Запит на аналітику →', url);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Помилка:', res.status, text);
        setResults([]);
        return;
      }

      const data = await res.json();
      let resultsArray: TestResult[] = [];

      if (isTeacher) {
        resultsArray = Array.isArray(data) ? data : [];
      } else {
        resultsArray = Array.isArray(data) 
          ? data 
          : Array.isArray(data.allResults) 
            ? data.allResults 
            : Array.isArray(data.results) 
              ? data.results 
              : [];
      }

      console.log('Фінальні дані для графіка:', resultsArray);
      setResults(resultsArray);

    } catch (err) {
      console.error('Помилка fetch:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  fetchResults();
}, [user, isTeacher]);

  const subjects = useMemo(() => {
    const unique = [...new Set(results.map(r => r.subject))];
    return ['all', ...unique.sort()];
  }, [results]);

 const groups = useMemo(() => {
  if (!isTeacher) return ['all'];

  const unique = [...new Set(
    results
      .map(r => r.studentGroup)
      .filter(g => g && g.trim() !== '')
  )];

  return ['all', ...unique.sort()];
}, [results, isTeacher]);

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchSubject = selectedSubject === 'all' || r.subject === selectedSubject;
      const matchGroup = !isTeacher || selectedGroup === 'all' || r.studentGroup === selectedGroup;
      return matchSubject && matchGroup;
    });
  }, [results, selectedSubject, selectedGroup, isTeacher]);

  const subjectAnalytics = useMemo(() => {
    const grouped = filteredResults.reduce((acc, r) => {
      const key = r.subject;
      if (!acc[key]) {
        acc[key] = { total: 0, count: 0, maxScore: r.maxScore };
      }
      acc[key].total += r.score;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number; maxScore: number }>);

    return Object.entries(grouped).map(([subject, data]) => ({
      subject,
      averageScore: Math.round((data.total / data.count) * 10) / 10,
      totalAttempts: data.count,
      maxScore: data.maxScore,
      percentage: Math.round((data.total / data.count / data.maxScore) * 100),
    }));
  }, [filteredResults]);

 const groupAnalytics = useMemo(() => {
  console.log('Перераховуємо groupAnalytics...');

  if (!isTeacher || filteredResults.length === 0) {
    console.log('Повертаємо [] — немає даних або не викладач');
    return [];
  }

  const grouped: Record<string, { total: number; count: number; passed: number }> = {};

  filteredResults.forEach(r => {
    const group = r.studentGroup?.trim();
    if (!group) return;

    if (!grouped[group]) {
      grouped[group] = { total: 0, count: 0, passed: 0 };
    }

    const score = Number(r.score || 0);
    const maxScore = Number(r.maxScore || 100);

    grouped[group].total += score;
    grouped[group].count += 1;
    if (score >= maxScore * 0.6) {
      grouped[group].passed += 1;
    }
  });

  const result = Object.entries(grouped).map(([group, data]) => ({
    group,
    averageScore: Math.round((data.total / data.count) * 10) / 10,
    studentsPassed: data.passed,
    totalStudents: data.count,
    passRate: Math.round((data.passed / data.count) * 100),
  }));

  console.log('groupAnalytics готовий:', result);
  return result;
}, [filteredResults, isTeacher]);

const studentProgress = useMemo(() => {
  if (isTeacher) return [];

  const safeGetDate = (r: any): string => {
    const raw = 'completedAt' in r ? r.completedAt : r.endTime;

    if (!raw || typeof raw !== 'string') return ''; 

    const d = new Date(raw);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('uk-UA');
  };

  return filteredResults
    .sort((a, b) => {
      const ra = 'completedAt' in a ? a.completedAt : a.endTime;
      const rb = 'completedAt' in b ? b.completedAt : b.endTime;

      const da = typeof ra === 'string' ? new Date(ra).getTime() : 0;
      const db = typeof rb === 'string' ? new Date(rb).getTime() : 0;

      return da - db;
    })
    .map((r, i) => ({
      attempt: i + 1,
      score: r.score,
      maxScore: r.maxScore,
      percentage: Math.round((r.score / r.maxScore) * 100),
      date: safeGetDate(r),
    }));
}, [filteredResults, isTeacher]);

const groupFullAnalytics = useMemo(() => {
  if (!isTeacher || filteredResults.length === 0) return [];

  const grouped = filteredResults.reduce((acc, r) => {
    const group = r.studentGroup?.trim() || 'Без групи';
    if (!acc[group]) {
      acc[group] = {
        scores: [],
        excellent: 0,
        good: 0,
        satisfactory: 0,
        poor: 0,
      };
    }

    const percent = (r.score / r.maxScore) * 100;
    acc[group].scores.push(percent);

    if (percent >= 90) acc[group].excellent++;
    else if (percent >= 75) acc[group].good++;
    else if (percent >= 60) acc[group].satisfactory++;
    else acc[group].poor++;

    return acc;
  }, {} as Record<string, any>);

  return Object.entries(grouped).map(([group, data]) => {
    const total = data.scores.length;
    const avg = data.scores.reduce((a: number, b: number) => a + b, 0) / total;

    return {
      group,
      averagePercent: Math.round(avg * 10) / 10,
      excellent: Math.round((data.excellent / total) * 100 * 10) / 10,
      good: Math.round((data.good / total) * 100 * 10) / 10,
      satisfactory: Math.round((data.satisfactory / total) * 100 * 10) / 10,
      poor: Math.round((data.poor / total) * 100 * 10) / 10,
    };
  });
}, [filteredResults, isTeacher]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-gray-600">Завантаження аналітики...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-left mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
            {isTeacher ? 'Аналітика викладача' : 'Моя аналітика'}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
            {isTeacher ? 'Статистика по групах та предметах' : 'Ваш прогрес у навчанні'}
          </p>
        </motion.div>


        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-10 border border-purple-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Фільтри</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">Предмет</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-lg"
              >
                <option value="all">Всі предмети</option>
                {subjects.filter(s => s !== 'all').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {isTeacher && (
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Група</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg"
                >
                  <option value="all">Всі групи</option>
                  {groups.filter(g => g !== 'all').map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-purple-100"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Середній бал по предметах
            </h3>
            {subjectAnalytics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e6ff" />
                  <XAxis dataKey="subject" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e0d4ff', borderRadius: '16px' }}
                  />
                  <Bar dataKey="averageScore" fill="#a78bfa" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-10">Немає даних</p>
            )}
          </motion.div>

          {isTeacher ? (
        <motion.div
  initial={{ opacity: 0, x: 30 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.4 }}
  className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-purple-100"
>
  <h3 className="text-2xl font-bold text-gray-800 mb-6">
    Розподіл оцінок по групах
  </h3>

  {groupFullAnalytics.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={groupFullAnalytics} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0e6ff" />
        <XAxis dataKey="group" tick={{ fill: '#6b7280', fontSize: 14 }} />
        <YAxis tick={{ fill: '#6b7280' }} domain={[0, 100]} />
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', border: '2px solid #e0d4ff', borderRadius: '16px' }}
          formatter={(value: number) => `${value.toFixed(1)}%`}
        />
        <Legend 
          verticalAlign="top" 
          height={36}
          wrapperStyle={{ 
    top: 1,                     
    paddingBottom: 20            
  }}
          iconType="rect"
          formatter={(value) => <span className="text-sm font-medium">{value}</span>}
        />

        <Bar dataKey="excellent" name="Відмінно (90–100%)" fill="#34d399" radius={[8, 8, 0, 0]} stackId="a" />
        <Bar dataKey="good" name="Добре (75–89%)" fill="#60a5fa" radius={[8, 8, 0, 0]} stackId="a" />
        <Bar dataKey="satisfactory" name="Задовільно (60–74%)" fill="#fbbf24" radius={[8, 8, 0, 0]} stackId="a" />
        <Bar dataKey="poor" name="Незадовільно (<60%)" fill="#f87171" radius={[8, 8, 0, 0]} stackId="a" />

       <Bar
  dataKey="averagePercent"
  name="Середній бал"
  fill="transparent"
  label={{
    position: 'top',
    fill: '#1f2937',
    fontSize: 15,
    fontWeight: 'bold',
    formatter: (value: unknown) => `${Math.round(Number(value))}%`
  }}
/>
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <p className="text-center text-gray-500 py-10">Немає зданих тестів у групах</p>
  )}
</motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-purple-100"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Ваш прогрес</h3>
              {studentProgress.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={studentProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e6ff" />
                    <XAxis dataKey="attempt" tick={{ fill: '#6b7280' }} />
                    <YAxis tick={{ fill: '#6b7280' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '2px solid #e0d4ff', borderRadius: '16px' }}
                    />
                    <Line type="monotone" dataKey="percentage" stroke="#a78bfa" strokeWidth={4} dot={{ fill: '#a78bfa' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-10">Ви ще не проходили тести</p>
              )}
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Всього спроб', value: filteredResults.length, color: 'from-purple-500 to-purple-600' },
            { label: 'Середній бал', value: subjectAnalytics.length > 0 ? Math.round(subjectAnalytics.reduce((a, b) => a + b.averageScore, 0) / subjectAnalytics.length * 10) / 10 : 0, color: 'from-blue-500 to-blue-600' },
            { label: 'Найкращий результат', value: Math.max(...filteredResults.map(r => r.score), 0), color: 'from-emerald-500 to-emerald-600' },
            { label: isTeacher ? 'Активних груп' : 'Пройдено тестів', value: isTeacher ? groupAnalytics.length : filteredResults.length, color: 'from-pink-500 to-pink-600' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 text-center border border-purple-100"
            >
              <div className={`bg-gradient-to-r ${stat.color} text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg`}>
                {stat.value}
              </div>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};