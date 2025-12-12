import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { ArrowLeft, Plus, Trash2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getGroups } from '../api/api';

export interface DraftQuestion {
  type: 'single' | 'multiple' | 'text';
  question: string;
  options?: string[];
  correctAnswer: number[];
  points: number;
}

export interface CreateQuestionData {
  id: string;
  type: 'single' | 'multiple' | 'text';
  question: string;
  options?: string[];
  correctAnswer: string[];
  points: number;
}

export interface CreateTestData {
  subject: string;
  title: string;
  timeLimit: number;
  groups: number[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  maxScore: number; 
  questions: CreateQuestionData[];
}

const saveTest = async (testData: any) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Не авторизовано');

  const response = await fetch('https://veritas-t6l0.onrender.com/tests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(testData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Не вдалося зберегти тест');
  }

  return response.json();
};

interface CreateTestPageProps {
  onBack: () => void;
  onSave: (testData: CreateTestData) => Promise<void>;
}

export const CreateTestPage: React.FC<CreateTestPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<{ id: number; group_code: string; group_number: string }[]>([]);

  const [testData, setTestData] = useState<CreateTestData>({
    subject: '',
    title: '',
    timeLimit: 30,
    groups: [],
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    maxScore: 100,
    questions: [],
  });

  const [newQuestion, setNewQuestion] = useState<DraftQuestion>({
    type: 'single',
    question: '',
    options: ['', ''],
    correctAnswer: [],
    points: 1,
  });
  const groupOptions = groups.map((g) => ({
    value: g.id,
    label: `${g.group_code}-${g.group_number}`,
  }));

  const totalPointsFromQuestions = testData.questions.reduce((sum, q) => sum + q.points, 0);

  useEffect(() => {
    if (!user?.token) return;
    getGroups(user.token)
      .then(setGroups)
      .catch((err) => console.error('Помилка отримання груп:', err));
  }, [user]);

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) {
      alert('Введіть текст питання!');
      return;
    }

    let finalCorrectAnswer: string[] = [];

    if (newQuestion.type === 'text') {
      finalCorrectAnswer = (newQuestion.options || [])
        .map((w) => w.trim())
        .filter((w) => w !== '');
      if (finalCorrectAnswer.length === 0) {
        alert('Введіть хоча б одне ключове слово!');
        return;
      }
    } else {
      if (newQuestion.correctAnswer.length === 0) {
        alert('Оберіть хоча б одну правильну відповідь!');
        return;
      }

      finalCorrectAnswer = newQuestion.correctAnswer
        .map((idx) => newQuestion.options?.[idx])
        .filter((opt): opt is string => typeof opt === 'string' && opt.trim() !== '');
    }

    const questionToAdd: CreateQuestionData = {
      id: Date.now().toString(),
      type: newQuestion.type,
      question: newQuestion.question,
      options: newQuestion.type === 'text' ? undefined : newQuestion.options?.filter((opt) => opt.trim() !== ''),
      correctAnswer: finalCorrectAnswer,
      points: newQuestion.points,
    };

    setTestData((prev) => ({
      ...prev,
      questions: [...prev.questions, questionToAdd],
    }));

    setNewQuestion({
      type: 'single',
      question: '',
      options: ['', ''],
      correctAnswer: [],
      points: 1,
    });
  };

  const handleRemoveQuestion = (id: string) => {
    setTestData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options?.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const handleAddOption = () => {
    setNewQuestion((prev) => ({
      ...prev,
      options: [...(prev.options ?? []), ''],
    }));
  };

  const handleCorrectAnswerToggle = (index: number) => {
    const option = newQuestion.options?.[index];
    if (!option?.trim()) return;

    setNewQuestion((prev) => {
      const cur = prev.correctAnswer;

      if (prev.type === 'single') {
        return { ...prev, correctAnswer: [index] };
      }

      if (prev.type === 'multiple') {
        const exists = cur.includes(index);
        return {
          ...prev,
          correctAnswer: exists ? cur.filter((i) => i !== index) : [...cur, index],
        };
      }

      return prev;
    });
  };

  const handleSave = async () => {
    if (!testData.subject || !testData.title || testData.questions.length === 0) {
      alert('Заповніть назву, предмет та додайте хоча б одне питання');
      return;
    }

    if (!testData.startDate || !testData.startTime || !testData.endDate || !testData.endTime) {
      alert('Оберіть дату і час початку та завершення тесту');
      return;
    }

    if (testData.maxScore < totalPointsFromQuestions) {
      if (!confirm(`Максимальний бал (${testData.maxScore}) менший за суму балів (${totalPointsFromQuestions}). Продовжити?`)) {
        return;
      }
    }

    const localToUTC = (date: string, time: string): { date: string; time: string } => {
  if (!date || !time) return { date: '', time: '' };
  const localDateTime = new Date(`${date}T${time}:00`); 
  const utcDate = localDateTime.toISOString().slice(0, 10);
  const utcTime = localDateTime.toISOString().slice(11, 16); 
  return { date: utcDate, time: utcTime };
};

const startUTC = localToUTC(testData.startDate, testData.startTime);
const endUTC = localToUTC(testData.endDate, testData.endTime);

    const payload = {
      title: testData.title,
      subject: testData.subject,
      time_limit_min: testData.timeLimit,
      created_by: Number(user?.id),
      max_score: testData.maxScore,
      status: 'published',
  startDate: startUTC.date,
  startTime: startUTC.time,
  endDate: endUTC.date,
  endTime: endUTC.time,
      group_ids: testData.groups,
      questions: testData.questions.map((q) => ({
        question: q.question,
        type: q.type,
        points: q.points,
        options: q.type === 'text' ? undefined : q.options,
        keywords: q.type === 'text' ? q.correctAnswer : undefined,
        correct_options: q.type !== 'text'
          ? q.correctAnswer 
          : undefined,
      })),
    };

    console.log('Відправляємо payload:', payload);

    try {
      await saveTest(payload);
      alert('Тест успішно створено!');
      onBack();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Помилка при збереженні');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-6 md:p-10"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex justify-between items-center mb-2"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Створення тесту
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Налаштуй параметри, додай питання — і тест готовий до публікації.
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 rounded-full px-4 py-2 bg-white/70 backdrop-blur-sm text-purple-600 hover:text-purple-700 shadow-sm hover:shadow-md border border-purple-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Назад</span>
          </button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-xl shadow-purple-100 p-6 md:p-8 mb-4 space-y-6 border border-white/60"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Назва предмету
              </label>
              <input
                type="text"
                placeholder="Наприклад: Алгоритми і структури даних"
                value={testData.subject}
                onChange={(e) => setTestData((p) => ({ ...p, subject: e.target.value }))}
                className="px-4 py-3 bg-gray-100/80 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all border border-transparent hover:border-purple-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Назва тесту
              </label>
              <input
                type="text"
                placeholder="Контрольна №1, модульний тест..."
                value={testData.title}
                onChange={(e) => setTestData((p) => ({ ...p, title: e.target.value }))}
                className="px-4 py-3 bg-gray-100/80 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg:white outline-none transition-all border border-transparent hover:border-purple-100"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4 md:p-5 border border-purple-100/70 shadow-inner">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/80 shadow-sm flex-shrink-0">
              <Info size={20} className="text-purple-600" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-gray-800">
                  Максимальний бал за тест
                </label>
                <span className="text-xs text-gray-500">
                  За питаннями: <strong>{totalPointsFromQuestions}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="number"
                  min="1"
                  value={testData.maxScore}
                  onChange={(e) =>
                    setTestData((p) => ({
                      ...p,
                      maxScore: parseInt(e.target.value) || 100,
                    }))
                  }
                  className="w-28 px-4 py-2 bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all hover:border-purple-400"
                />
                <span className="text-xs text-gray-500">
                  Можете задати ліміт вищий/нижчий за суму балів.
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Тривалість тесту (хвилини)
            </label>
            <input
              type="number"
              min="1"
              value={testData.timeLimit}
              onChange={(e) =>
                setTestData((p) => ({ ...p, timeLimit: parseInt(e.target.value) || 1 }))
              }
              className="w-full px-4 py-3 bg-gray-100/80 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all border border-transparent hover:border-purple-100"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Дата початку</label>
              <input
                type="date"
                value={testData.startDate}
                onChange={(e) => setTestData((p) => ({ ...p, startDate: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-100/80 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all border border-transparent hover:border-purple-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Дата завершення</label>
              <input
                type="date"
                value={testData.endDate}
                onChange={(e) => setTestData((p) => ({ ...p, endDate: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-100/80 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all border border-transparent hover:border-purple-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Час початку</label>
              <input
                type="time"
                value={testData.startTime}
                onChange={(e) => setTestData((p) => ({ ...p, startTime: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-100/80 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all border border-transparent hover:border-purple-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Час завершення</label>
              <input
                type="time"
                value={testData.endTime}
                onChange={(e) => setTestData((p) => ({ ...p, endTime: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-100/80 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all border border-transparent hover:border-purple-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Доступні групи
            </label>
            <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100">
              <Select
                isMulti
                options={groupOptions}
                placeholder="Оберіть групи..."
                className="text-gray-800"
                classNamePrefix="react-select"
                onChange={(selected: any) =>
                  setTestData((p) => ({
                    ...p,
                    groups: selected ? selected.map((opt: any) => opt.value) : [],
                  }))
                }
              />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-gradient-to-r from-blue-100/80 via-purple-50/80 to-blue-100/80 rounded-3xl p-5 md:p-6 mb-6 border border-blue-100/70 shadow-lg shadow-blue-100/60"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Нове питання</h2>
              <p className="text-xs text-gray-500">
                Оберіть тип, варіанти відповіді та бали — потім додавайте у список.
              </p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Введіть текст питання"
            value={newQuestion.question}
            onChange={(e) => setNewQuestion((p) => ({ ...p, question: e.target.value }))}
            className="w-full px-4 py-3 bg-white/90 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all mb-4 shadow-sm hover:shadow-md outline-none"
          />
          {newQuestion.type !== 'text' ? (
            <div className="space-y-2 mb-3">
              {newQuestion.options?.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-white/80 rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-purple-100"
                >
                  <input
                    type={newQuestion.type === 'multiple' ? 'checkbox' : 'radio'}
                    name={newQuestion.type === 'single' ? `radio-${Date.now()}` : undefined}
                    checked={newQuestion.correctAnswer.includes(index)}
                    onChange={() => handleCorrectAnswerToggle(index)}
                    className="w-4 h-4 text-purple-600 rounded-full focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder={`Варіант ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-gray-800"
                  />
                </div>
              ))}
              <button
                onClick={handleAddOption}
                className="mt-1 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors hover:underline"
              >
                <Plus size={16} />
                <span>Додати варіант</span>
              </button>
            </div>
          ) : (
            <textarea
              placeholder="Ключові слова (через кому)"
              value={newQuestion.options?.join(', ') || ''}
              onChange={(e) =>
                setNewQuestion((p) => ({
                  ...p,
                  options: e.target.value
                    .split(',')
                    .map((w) => w.trim())
                }))
              }
              className="w-full h-24 px-4 py-3 bg-white/90 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm hover:shadow-md"
            />
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={newQuestion.type}
                onChange={(e) => {
                  const type = e.target.value as 'single' | 'multiple' | 'text';
                  setNewQuestion((p) => ({
                    ...p,
                    type,
                    options: type === 'text' ? [''] : ['', ''],
                    correctAnswer: [],
                  }));
                }}
                className="px-3 py-2 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm hover:border-purple-200 transition-all"
              >
                <option value="single">Одиночний вибір</option>
                <option value="multiple">Множинний вибір</option>
                <option value="text">Текстова відповідь</option>
              </select>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  value={newQuestion.points}
                  onChange={(e) =>
                    setNewQuestion((p) => ({
                      ...p,
                      points: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-20 px-3 py-2 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm hover:border-purple-200 transition-all"
                />
                <span className="text-sm text-gray-600">балів</span>
              </div>
            </div>
            <button
              onClick={handleAddQuestion}
              className="inline-flex items-center justify-center bg-blue-500 text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-blue-600 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              Додати питання
            </button>
          </div>
        </motion.div>
        <div className="space-y-3">
          {testData.questions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="bg-purple-100/70 rounded-3xl p-5 border border-purple-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start space-x-4 mb-2">
                <div className="bg-purple-200 text-purple-800 rounded-2xl w-16 h-16 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-inner">
                  <div className="text-center leading-tight">
                    <div className="text-[11px] uppercase tracking-wide">Питання</div>
                    <div className="text-lg">{idx + 1}</div>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      {q.question}
                    </h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="text-purple-700 text-xs font-medium bg-white/70 rounded-full px-3 py-1 shadow-sm">
                        0.0 / {q.points}.0
                      </span>
                      <button
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-red-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {q.type !== 'text' && q.options && (
                    <div className="space-y-1 mt-2">
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-3 bg-white/80 rounded-xl px-3 py-2 border border-transparent"
                        >
                          <input
                            type={q.type === 'multiple' ? 'checkbox' : 'radio'}
                            disabled
                            checked={q.correctAnswer.includes(opt)}
                            className="w-4 h-4 text-purple-600"
                          />
                          <span className="text-gray-800 text-sm">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'text' && (
                    <div className="bg-white/80 rounded-xl p-3 text-gray-700 text-sm border border-purple-100 mt-1">
                      <strong>Ключові слова:</strong>{' '}
                      {q.correctAnswer.length > 0 ? q.correctAnswer.join(', ') : 'немає'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-center mt-8 mb-4">
          <button
            onClick={handleSave}
            className="bg-purple-600 text-white px-8 md:px-10 py-3 rounded-full font-semibold text-sm tracking-wide hover:bg-purple-700 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
          >
            Зберегти тестування
          </button>
        </div>
      </div>
    </motion.div>
  );
};
