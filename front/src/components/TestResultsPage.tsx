import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, Users, Trophy, Clock, Filter } from 'lucide-react';
import { Test } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface StudentResult {
  id: string;
  studentId: string | null;
  studentName: string;
  studentGroup: string;
  score: number;
  maxScore: number;
  completedAt: string;
}

interface StudentAnswer {
  questionId: number;
  questionText: string;
  type: string;
  points: number;
  answerText: string | null;
  selectedOptions: number[];
  options: { id: number; text: string; is_correct: 0 | 1 | boolean }[];
}

interface TestResultsPageProps {
  test: Test;
  onBack: () => void;
  submissionId?: number;
}

export const TestResultsPage: React.FC<TestResultsPageProps> = ({
  test,
  onBack,
  submissionId,
}) => {
  const { token } = useAuth();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('Всі групи');

  // відповіді конкретного студента
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [answersLoading, setAnswersLoading] = useState(false);
  const [answersError, setAnswersError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      if (!token || !test.id) return;

      try {
        const endpoint = submissionId
          ? `http://localhost:8021/submissions/${submissionId}/answers`
          : `http://localhost:8021/tests/${test.id}/results`;

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Не вдалося завантажити результати');

        const data = await res.json();

        const formattedResults: StudentResult[] = Array.isArray(data)
          ? data.map((r: any) => ({
              id: r.id || r.submission_id,
              // робимо максимально надійний пошук studentId
              studentId:
                r.student_id ??
                r.studentId ??
                r.user_id ??
                null,
              studentName: r.student_name || r.studentName || 'Невідомий студент',
              studentGroup: r.group_name || r.studentGroup || 'Без групи',
              score: r.score || r.total_score || 0,
              maxScore: r.max_score || test.maxScore || 100,
              completedAt: new Date(
                r.completed_at || r.submitted_at || r.created_at
              ).toLocaleString('uk-UA'),
            }))
          : [];

        setResults(formattedResults);
      } catch (err) {
        console.error('Помилка завантаження результатів:', err);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [test.id, token, submissionId, test.maxScore]);

  const uniqueGroups = ['Всі групи', ...Array.from(new Set(results.map(r => r.studentGroup)))];

  const filteredResults =
    selectedGroup === 'Всі групи'
      ? results
      : results.filter(r => r.studentGroup === selectedGroup);

  const getScoreColor = (score: number, max: number) => {
    const percent = (score / max) * 100;
    if (percent >= 90) return 'from-emerald-400 to-emerald-600';
    if (percent >= 70) return 'from-blue-400 to-blue-600';
    if (percent >= 50) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  // клік по студенту – тягнемо відповіді з бекенду і показуємо в модальному вікні
  const handleStudentClick = async (result: StudentResult) => {
    if (!token) return;

    if (!result.studentId) {
      console.error('studentId відсутній у результаті:', result);
      setAnswersError('Не вдалося визначити студента для цього результату');
      setShowModal(true);
      return;
    }

    setSelectedStudent(result);
    setAnswersLoading(true);
    setAnswersError(null);
    setStudentAnswers([]);

    try {
      const res = await fetch(
        `http://localhost:8021/student/${result.studentId}/test/${test.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error('Не вдалося завантажити відповіді студента');
      }

      const data = await res.json(); // { studentId, testId, results }

      const formatted: StudentAnswer[] = Array.isArray(data.results)
        ? data.results.map((row: any) => ({
            questionId: row.question_id,
            questionText: row.question,
            type: row.type,
            points: row.points,
            answerText: row.answer_text,
            selectedOptions: Array.isArray(row.selected_options)
              ? row.selected_options
              : [],
            options: Array.isArray(row.options) ? row.options : [],
          }))
        : [];

      setStudentAnswers(formatted);
    } catch (err) {
      console.error(err);
      setAnswersError('Сталася помилка при завантаженні відповідей');
    } finally {
      setAnswersLoading(false);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setStudentAnswers([]);
    setAnswersError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 border-8 border-purple-300 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* ХЕДЕР */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-10"
        >
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="group flex items-center gap-3 text-purple-700 hover:text-purple-900 transition-all"
            >
              <div className="p-3 bg-white/80 backdrop-blur rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                <ArrowLeft size={28} />
              </div>
              <span className="text-xl font-bold">Назад до тестів</span>
            </button>
          </div>

          <div className="text-right">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3 justify-end">
              <Trophy className="text-purple-600" size={40} />
              Результати тесту
            </h1>
            <p className="text-purple-600 text-lg">{test.subject}</p>
          </div>
        </motion.div>

        {/* КАРТКА ТЕСТУ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 mb-10 border border-purple-100"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            "{test.title}"
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="bg-purple-100/60 rounded-2xl p-5">
              <Users className="mx-auto mb-2 text-purple-700" size={32} />
              <p className="text-sm text-gray-600">Групи</p>
              <p className="font-bold text-purple-800">
                {test.groups?.join(', ') || '—'}
              </p>
            </div>
            <div className="bg-pink-100/60 rounded-2xl p-5">
              <Clock className="mx-auto mb-2 text-pink-700" size={32} />
              <p className="text-sm text-gray-600">Тривалість</p>
              <p className="font-bold text-pink-800">
                {test.duration || 'Без обмежень'}
              </p>
            </div>
            <div className="bg-blue-100/60 rounded-2xl p-5">
              <Trophy className="mx-auto mb-2 text-blue-700" size={32} />
              <p className="text-sm text-gray-600">Макс. бал</p>
              <p className="font-bold text-blue-800">{test.maxScore || 100}</p>
            </div>
            <div className="bg-emerald-100/60 rounded-2xl p-5">
              <Users className="mx-auto mb-2 text-emerald-700" size={32} />
              <p className="text-sm text-gray-600">Учасників</p>
              <p className="font-bold text-emerald-800">{results.length}</p>
            </div>
          </div>
        </motion.div>

        {/* ФІЛЬТР */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="appearance-none bg-white/90 backdrop-blur border-2 border-purple-200 rounded-2xl px-8 py-4 pr-12 text-lg font-medium text-purple-800 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all shadow-lg hover:shadow-xl"
            >
              {uniqueGroups.map(group => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <Filter
              className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 pointer-events-none"
              size={24}
            />
          </div>
        </motion.div>

        {/* СПИСОК СТУДЕНТІВ */}
        <AnimatePresence mode="wait">
          {filteredResults.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredResults.map((result, i) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <div
                    onClick={() => handleStudentClick(result)}
                    className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden cursor-pointer transition-all hover:shadow-2xl border border-purple-100"
                  >
                    <div
                      className={`h-3 bg-gradient-to-r ${getScoreColor(
                        result.score,
                        result.maxScore
                      )}`}
                    />
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-700 transition-colors">
                        {result.studentName}
                      </h3>
                      <div className="space-y-3 text-gray-600">
                        <p className="flex items-center gap-2">
                          <Users size={18} className="text-purple-500" />
                          {result.studentGroup}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock size={18} className="text-pink-500" />
                          {result.completedAt}
                        </p>
                      </div>
                      <div className="mt-6 pt-6 border-t border-purple-100">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-medium text-gray-700">
                            Результат:
                          </span>
                          <motion.span
                            key={result.score}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                          >
                            {result.score}
                            <span className="text-2xl text-gray-500">
                              /{result.maxScore}
                            </span>
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl p-12 max-w-md mx-auto">
                <Users size={80} className="mx-auto mb-6 text-purple-300" />
                <p className="text-2xl font-bold text-gray-700">
                  {selectedGroup !== 'Всі групи'
                    ? `Немає результатів у групі "${selectedGroup}"`
                    : 'Студенти ще не пройшли тест'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* МОДАЛЬНЕ ВІКНО З ВІДПОВІДЯМИ */}
        <AnimatePresence>
          {showModal && selectedStudent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Відповіді: {selectedStudent.studentName}
                </h2>

                {answersLoading && (
                  <p className="text-gray-600">Завантаження...</p>
                )}
                {answersError && (
                  <p className="text-red-500 mb-3">{answersError}</p>
                )}

                {!answersLoading &&
                  !answersError &&
                  studentAnswers.map((ans, i) => (
                    <div
                      key={ans.questionId}
                      className="mb-4 p-4 bg-purple-50 rounded-xl"
                    >
                      <p className="text-sm text-gray-500">Питання {i + 1}</p>
                      <p className="font-semibold text-gray-800 mb-2">
                        {ans.questionText}
                      </p>

                      {/* MULTIPLE / SINGLE */}
                      {ans.options.length > 0 && (
                        <ul className="space-y-1 mb-2">
                          {ans.options.map(opt => (
                            <li
                              key={opt.id}
                              className={[
                                'px-3 py-1 rounded-lg',
                                ans.selectedOptions.includes(opt.id)
                                  ? 'bg-purple-200'
                                  : 'bg-gray-200',
                                opt.is_correct ? 'border border-green-600' : '',
                              ].join(' ')}
                            >
                              {opt.text}{' '}
                              {opt.is_correct ? '✔️' : ''}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* TEXT ANSWER */}
                      {ans.type === 'text' && (
                        <p className="text-gray-700">
                          <strong>Відповідь студента:</strong>{' '}
                          {ans.answerText || '—'}
                        </p>
                      )}
                    </div>
                  ))}

                {!answersLoading &&
                  !answersError &&
                  studentAnswers.length === 0 && (
                    <p className="text-gray-600">
                      Немає збережених відповідей для цього тесту.
                    </p>
                  )}

                <button
                  onClick={closeModal}
                  className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700"
                >
                  Закрити
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
