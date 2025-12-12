import React, { useEffect, useState, useMemo } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { motion, AnimatePresence} from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TestCard } from './TestCard';
import { ResultCard } from './ResultCard';
import { TestModal } from './TestModal';
import { TestPage } from './TestPage';
import { TeacherTestCard } from './TeacherTestCard';
import { TestResultsPage } from './TestResultsPage';
import { MyResultsPage } from './MyResultsPage';
import { CreateTestPage } from './CreateTestPage';
import { AnalyticsPage } from './AnalyticsPage';
import { useAuth } from '../contexts/AuthContext';
import { HistoryPage } from './HistoryPage';
import { SettingsPage } from './SettingsPage';
import { Test, TestResult, TestSession, CreateTestData, Question } from '../types';
import {
  createTest,
  getTeacherTests,
  getAvailableTests,
  getTestQuestions,
  submitTestResults,
} from '../api/api';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'tests' |'history'| 'results' | 'analytics' | 'settings'>('tests');
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTestSession, setCurrentTestSession] = useState<TestSession | null>(null);
  const [showTestResults, setShowTestResults] = useState(false);
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [upcomingSubjectFilter, setUpcomingSubjectFilter] = useState<string>('all');
  const [upcomingSortOrder, setUpcomingSortOrder] = useState<'desc' | 'asc'>('desc');
  const [historySubjectFilter, setHistorySubjectFilter] = useState<string>('all');
  const [historySortOrder, setHistorySortOrder] = useState<'desc' | 'asc'>('desc');

const token = user?.token ?? '';
const userId = user?.id ? Number(user.id) : 0; 
const groupId = user?.groupNumber ? Number(user.groupNumber) : 0;
const isTeacher = user?.role === 'teacher';

const subjects = useMemo(() => {
    const unique = Array.from(
      new Set(
        tests
          .map((t) => t.subject)
          .filter((s): s is string => Boolean(s && s.trim()))
      )
    ).sort();
    return ['all', ...unique];
  }, [tests]);

useEffect(() => {
  if (!user || !token || userId === 0) {
    console.log('Немає user, token або userId');
    return;
  }

  const loadTests = async () => {
    try {
      let data: any[] = [];

      if (isTeacher) {
        const response = await fetch(`https://veritas-t6l0.onrender.com/tests/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Помилка завантаження тестів викладача');
        data = await response.json();
      } else {
        if (!groupId) return;
        const response = await fetch(`https://veritas-t6l0.onrender.com/student/tests/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Помилка завантаження тестів студента');
        data = await response.json();
      }


      setTests(
        data.map((t: any): Test => ({
          id: String(t.id),
          subject: t.subject ?? '',
          lecturer: t.lecturer,
          title: t.title ?? '',
          startTime: t.start_at ?? '',
          endTime: t.end_at ??'',
          duration: `${t.time_limit_min ?? 30}хв`,
          maxScore: Number(t.max_score) ?? 0,
          color: user.role === 'teacher' ? 'blue' : 'purple',
          status: t.status ?? 'published',
          groups:
      Array.isArray(t.groups)
        ? t.groups
        : typeof t.groups === 'string'
        ? t.groups.split(',').map((g: string) => g.trim()).filter(Boolean)
        : [],
  }))
      );
    } catch (err: any) {
      console.error('Помилка отримання тестів:', err.message);
    }
  };

  loadTests();
}, [user, token, userId, groupId]);
  const handleSaveTest = async (testData: CreateTestData) => {
    if (!token || !userId) {
      alert('Користувач не авторизований');
      return;
    }

    try {
      await createTest(
        {
          title: testData.title,
          subject: testData.subject,
          time_limit_min: testData.timeLimit,
          created_by: userId,
          max_score: 100,
          status: 'published',
          startDate: testData.startDate,
          startTime: testData.startTime,
          endDate: testData.endDate,
          endTime: testData.endTime,
          group_ids: testData.groups,
          questions: testData.questions.map((q) => ({
            question: q.question,
            type: q.type,
            points: q.points,
            options: q.type === 'text' ? undefined : q.options,
            correctAnswer: q.correctAnswer ?? [],
          })),
        },
        token
      );

      alert('Тест успішно створено!');
      setShowCreateTest(false);
    } catch (err) {
      console.error('Помилка створення тесту:', err);
      alert('Не вдалося створити тест');
    }
  };

  const handleStartTest = (test: Test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const handleModalStart = async () => {
    setIsModalOpen(false);
    if (!selectedTest || !token) return;

    try {
     const data = await getTestQuestions(Number(selectedTest.id), token);

const questions: Question[] = data.map((q: any): Question => {
  let parsedOptions: any[] = [];

  try {
    if (typeof q.options === "string") {
      parsedOptions = JSON.parse(q.options);
    } 
    else if (Array.isArray(q.options)) {
      parsedOptions = q.options;
    } 
    else {
      parsedOptions = [];
    }
  } catch {
    parsedOptions = [];
  }

  const safeOptions = parsedOptions.map((opt) => ({
  id: Number(opt.id),  
  text: String(opt.text),
  is_correct: Boolean(opt.is_correct)
}));


  return {
    id: String(q.question_id ?? q.id),
    type: q.q_type ?? q.type ?? "single",
    question: q.text ?? q.question ?? "",
    options: safeOptions,
    points: Number(q.points) ?? 1
  };
});

      const duration = parseInt(selectedTest.duration.replace('хв', '')) || 30;

      const testSession: TestSession = {
        id: `session-${selectedTest.id}`,
        testId: selectedTest.id,
        subject: selectedTest.subject,
        title: selectedTest.title,
        lecturer: selectedTest.lecturer,
        startTime: selectedTest.startTime,
        endTime: selectedTest.endTime,
        duration,
        timeRemaining: duration * 60,
        questions,
        answers: {},
      };

      setCurrentTestSession(testSession);
    } catch (err) {
      console.error('Помилка завантаження питань:', err);
      alert('Не вдалося завантажити питання');
    }
  };
  const handleBackToHome = () => {
    setCurrentTestSession(null);
    setActiveTab('tests');
  };

const handleTestComplete = (session: TestSession) => {
  const score = session.finalScore ?? 0;
  const maxScore = session.questions.reduce((s, q) => s + q.points, 0);

 setResults((prev) => [
  ...prev,
  {
    id: `result-${Date.now()}`,
    testId: session.testId,
    subject: session.subject,
    lecturer: session.lecturer,
    title: session.title,
    startTime: session.startTime,
    endTime: session.endTime,
    score: session.finalScore ?? 0,
    maxScore: session.questions.reduce((s, q) => s + q.points, 0),
    status: 'completed' as const,
    studentName: user?.lastName,
    studentGroup: user?.groupNumber,
  },
]); 

  setCurrentTestSession(null);
  setActiveTab('results');
};

const parseDate = (str: string): Date | null => {
  if (!str) return null;
  try {
    if (str.includes('T') || str.includes('Z')) {
      return new Date(str);
    }

    if (str.includes('-') && str.includes(':')) {
      const cleaned = str.replace(/:\d{2}$/, '');
      return new Date(`${cleaned}Z`); 
    }

    if (str.includes('.') && str.includes(',')) {
      const [datePart, timePart] = str.split(', ');
      const [day, month, year] = datePart.split('.').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      return new Date(Date.UTC(year, month - 1, day, hours, minutes));
    }

    return null;
  } catch {
    return null;
  }
};

  const handleViewResults = (test: Test) => {
    setSelectedTest(test);
    setShowTestResults(true);
  };

  const handleBackFromResults = () => {
    setShowTestResults(false);
    setSelectedTest(null);
  };

  const parseLocalDate = (str: string) => {
  const [date, time] = str.split(" ");
  return new Date(date + "T" + time + "Z");
};


  const handleCreateTest = () => setShowCreateTest(true);
  const handleBackFromCreate = () => setShowCreateTest(false);
  const isTestAvailable = (test: Test) => {
    if (!test.startTime || !test.endTime) return false;
    const now = new Date();
     const start = parseDate(test.startTime);
  const end = parseDate(test.endTime);
   if (!start || !end) return false;
    return now >= start && now <= end;
  };

  const completedTestIds = results.map((r) => String(r.testId));

  const isTestEnded = (test: Test) => {
  if (!test.endTime) return false;

  const end = parseDate(test.endTime);
  if (!end) return false; 

  return new Date() > end;
};


 const upcomingTests = isTeacher
    ? tests.filter(t => !isTestEnded(t))
    : tests.filter(t => !completedTestIds.includes(String(t.id)) && isTestAvailable(t));

  const historyTests = isTeacher
    ? tests.filter(t => isTestEnded(t))
    : tests.filter(t => completedTestIds.includes(String(t.id)) || !isTestAvailable(t));

  const parseDateSafe = (value: string) => parseLocalDate(value).getTime();

  const filteredUpcoming = useMemo(() => {
    const filtered = upcomingTests.filter((t) =>
      upcomingSubjectFilter === 'all' ? true : t.subject === upcomingSubjectFilter
    );

    return [...filtered].sort((a, b) => {
      const da = parseDateSafe(a.startTime);
      const db = parseDateSafe(b.startTime);
      return upcomingSortOrder === 'desc' ? db - da : da - db;
    });
  }, [upcomingTests, upcomingSubjectFilter, upcomingSortOrder]);

  const filteredHistory = useMemo(() => {
    const filtered = historyTests.filter((t) =>
      historySubjectFilter === 'all' ? true : t.subject === historySubjectFilter
    );

    return [...filtered].sort((a, b) => {
      const da = parseDateSafe(a.startTime);
      const db = parseDateSafe(b.startTime);
      return historySortOrder === 'desc' ? db - da : da - db;
    });
  }, [historyTests, historySubjectFilter, historySortOrder]);

  if (currentTestSession) {
    return (
      <TestPage
        session={currentTestSession}
        onComplete={handleTestComplete}
        onBackToHome={handleBackToHome}
      />
    );
  }

  if (showTestResults && selectedTest) {
    return <TestResultsPage test={selectedTest} onBack={handleBackFromResults} />;
  }

  if (showCreateTest) {
    return <CreateTestPage onBack={handleBackFromCreate} onSave={handleSaveTest} />;
  }

  const renderContent = () => {
  if (activeTab === 'tests') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex flex-col">
           <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
            Актуальні тести
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
           Ваші завдання вже чекають виконання
          </p>
          </div>

          {user?.role === 'teacher' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreateTest}
              className="
                bg-gradient-to-r from-purple-500 to-blue-500 
                text-white px-6 py-3 rounded-full font-semibold 
                shadow-lg hover:shadow-purple-300/40
                transition-all flex items-center space-x-2
              "
            >
              <Plus size={20} />
              <span>СТВОРИТИ ТЕСТ</span>
            </motion.button>
          )}
        </motion.div>
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          <AnimatePresence>
    {filteredUpcoming.length > 0 ? (
      filteredUpcoming.map((test, i) => (
        <motion.div
          key={test.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="w-full"
        >
          {user?.role === 'teacher' ? (
            <TeacherTestCard
              test={test}
              onViewResults={handleViewResults}
            />
          ) : (
            <TestCard
              test={test}
              onStartTest={handleStartTest}
            />
          )}
        </motion.div>
      ))
    ) : (
      <p className="text-gray-500 col-span-full text-center text-xl py-6">
        Вітаємо! Ніякий із тестів не є актуальним для Вас, можете відпочивати
      </p>
    )}
  </AnimatePresence>
        </motion.div>
      </motion.div>
      </div>
      </div>
    );
  }
  if (activeTab === "history") {
    return (
      <HistoryPage
        tests={filteredHistory}
        subjects={subjects}
        subjectFilter={historySubjectFilter}
        setSubjectFilter={setHistorySubjectFilter}
        sortOrder={historySortOrder}
        setSortOrder={setHistorySortOrder}
        isTeacher={isTeacher}
        onStartTest={handleStartTest}
        onViewResults={handleViewResults}
      />
    );
  }
    if (activeTab === 'results') {
  if (user?.role === 'teacher') {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 text-lg">
          Результати доступні при перегляді тесту
        </p>
      </div>
    );
  }

  if (user?.role === 'student') {
    return <MyResultsPage />;
  }
  return (
    <div className="flex items-center justify-center h-96">
      <p className="text-gray-500 text-lg">Увійдіть в систему</p>
    </div>
  );
}

if (activeTab === 'analytics') {
  return <AnalyticsPage />;
}
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 text-lg">Розділ у розробці</p>
      </div>
    );
  };

if (activeTab === 'settings') {
    return <SettingsPage onBack={() => setActiveTab('tests')} />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'create-test') handleCreateTest();
          else setActiveTab(tab as 'tests' | 'results');
        }}
      />
      <div className="flex-1 flex flex-col md:ml-80">
        <main className="flex-1 p-8 overflow-auto">{renderContent()}</main>
      </div>

      <TestModal
        test={selectedTest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStart={handleModalStart}
      />
    </div>
  );
};