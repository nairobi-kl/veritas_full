import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { TestSession, Question } from "../types";

interface TestPageProps {
  session: TestSession;
  onComplete: (session: TestSession) => void;
  onBackToHome: () => void;
}

export const TestPage: React.FC<TestPageProps> = ({
  session,
  onComplete,
  onBackToHome,
}) => {
  const { user } = useAuth();

  const [answers, setAnswers] = useState<{
    [questionId: string]: string | string[];
  }>(session.answers);

  const [timeRemaining, setTimeRemaining] = useState(session.timeRemaining);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Перегляд історії */
  const isViewingHistory =
    session.finalScore !== undefined && session.finalScore !== null;

  /** Таймер */
  useEffect(() => {
    if (isViewingHistory) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isViewingHistory]);

  /** Формат часу */
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  /** Збереження відповіді */
  const handleAnswerChange = (
    questionId: string,
    answer: string | string[]
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // ==========================================================
  //  ПРАВИЛЬНЕ ФОРМУВАННЯ ВІДПОВІДЕЙ (БО БЕК ЧЕКАЄ option.id)
  // ==========================================================

  const buildFormattedAnswers = () => {
    return session.questions.map((q) => {
      const raw = answers[q.id];

      let selected: number[] = [];

      // MULTIPLE
      if (Array.isArray(raw)) {
        selected = raw
          .filter(Boolean)
          .map((v) => Number(v))
          .filter((n) => !Number.isNaN(n));
      }

      // SINGLE
      if (typeof raw === "string" && raw.trim() !== "") {
        const n = Number(raw);
        if (!Number.isNaN(n)) selected = [n];
      }

      return {
        question_id: Number(q.id),
        selected_option_ids: selected,
        answer_text:
          q.type === "text" && typeof raw === "string"
            ? raw.trim()
            : null,
      };
    });
  };

  // ==========================================================
  //  Надсилання
  // ==========================================================

  const handleComplete = async () => {
    if (isSubmitting || isViewingHistory) return;
    setIsSubmitting(true);

    const updatedSession = { ...session, answers, timeRemaining };

    try {
      if (!user?.id || !user?.token)
        throw new Error("Помилка авторизації");

      const formattedAnswers = buildFormattedAnswers();

      const payload = {
        test_id: Number(updatedSession.testId),
        student_id: Number(user.id),
        answers: formattedAnswers,
      };

      const res = await fetch("http://localhost:8021/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Помилка сервера");

      const totalScore = data.total_score ?? 0;
      setScore(totalScore);
      setShowResults(true);

      onComplete({ ...updatedSession, finalScore: totalScore });
    } catch (err: any) {
      alert(err.message);
      setScore(0);
      setShowResults(true);
      onComplete({ ...updatedSession, finalScore: 0 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = () => onBackToHome();

  // ==========================================================
  //  Малюємо питання
  // ==========================================================

  const renderQuestion = (question: Question, index: number) => {
    const current = answers[question.id];
    const safeOptions = (question.options ?? []).filter(Boolean);

    switch (question.type) {
      case "single":
      case "multiple":
        return (
          <div
            key={question.id}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <div className="flex justify-between mb-5">
              <div className="flex space-x-4">
                <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center font-bold text-sm">
                  <div className="text-center">
                    <div>Питання</div>
                    <div>{index + 1}</div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold">
                  {question.question}
                </h3>
              </div>

              <div className="text-purple-600 font-medium">
                {current
                  ? `${question.points}/${question.points}`
                  : `0/${question.points}`}
              </div>
            </div>

            <div className="space-y-3">
              {safeOptions.map((opt) => {
                const realId = String(opt.id);
                const isChecked =
                  question.type === "multiple"
                    ? Array.isArray(current) &&
                      current.includes(realId)
                    : current === realId;

                return (
                  <label
                    key={realId}
                    className="flex items-center space-x-3 bg-white p-3 rounded-lg hover:bg-purple-50 transition cursor-pointer"
                  >
                    <input
                      type={
                        question.type === "multiple"
                          ? "checkbox"
                          : "radio"
                      }
                      name={`q-${question.id}`}
                      value={realId}
                      checked={isChecked}
                      onChange={(e) => {
                        if (question.type === "multiple") {
                          const prev = Array.isArray(current)
                            ? [...current]
                            : [];
                          if (e.target.checked) {
                            if (!prev.includes(realId))
                              prev.push(realId);
                          } else {
                            const i = prev.indexOf(realId);
                            if (i >= 0) prev.splice(i, 1);
                          }
                          handleAnswerChange(question.id, prev);
                        } else {
                          handleAnswerChange(
                            question.id,
                            realId
                          );
                        }
                      }}
                      disabled={isViewingHistory}
                      className="w-5 h-5 text-purple-600"
                    />
                    <span>{opt.text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case "text":
        return (
          <div
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <div className="flex justify-between mb-5">
              <div className="flex space-x-4">
                <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center font-bold text-sm">
                  <div className="text-center">
                    <div>Питання</div>
                    <div>{index + 1}</div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold">
                  {question.question}
                </h3>
              </div>
              <div className="text-purple-600 font-medium">
                {current
                  ? `${question.points}/${question.points}`
                  : `0/${question.points}`}
              </div>
            </div>

            <textarea
              value={typeof current === "string" ? current : ""}
              onChange={(e) =>
                handleAnswerChange(
                  question.id,
                  e.target.value
                )
              }
              disabled={isViewingHistory}
              className="w-full h-32 border rounded-lg p-3 focus:ring-2 focus:ring-purple-500"
              placeholder="Введіть вашу відповідь..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  // ==========================================================
  //  РЕЗУЛЬТАТИ
  // ==========================================================

  if (showResults || isViewingHistory) {
    const totalPoints = session.questions.reduce(
      (s, q) => s + q.points,
      0
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between mb-8">
            <div className="w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center text-purple-600 font-bold">
              VE
            </div>

            <button
              onClick={handleGoHome}
              className="text-purple-600 hover:text-purple-700 flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>На головну</span>
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-200 to-purple-300 rounded-3xl p-12 shadow-xl text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              {session.subject}
            </h1>

            {!isViewingHistory ? (
              <div className="bg-purple-500 text-white rounded-2xl py-6 mb-8">
                <p className="text-lg font-semibold">Ваш результат:</p>
                <p className="text-4xl font-bold">
                  {score}/{totalPoints}
                </p>
              </div>
            ) : (
              <div className="bg-blue-100 border border-blue-300 text-blue-800 rounded-2xl py-6 mb-8">
                <p className="text-lg font-semibold">
                  Перегляд виконаної спроби
                </p>
              </div>
            )}

            <button
              onClick={handleGoHome}
              className="bg-white text-purple-700 rounded-full px-8 py-3 font-semibold shadow hover:bg-purple-50"
            >
              На головну
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  //  ОСНОВНА СТОРІНКА ТЕСТУ
  // ==========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center text-purple-600 font-bold">
              VE
            </div>
            <div>
              <h1 className="text-2xl font-bold">{session.subject}</h1>
              <p className="text-gray-600">
                Тема тесту: "{session.title}"
              </p>
            </div>
          </div>

          {!isViewingHistory && (
            <div className="bg-purple-200 text-purple-800 px-4 py-2 rounded-full flex items-center space-x-2 font-semibold">
              <Clock size={20} />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        <div className="space-y-8 mb-8">
          {session.questions.map((q, i) => renderQuestion(q, i))}
        </div>

        {!isViewingHistory && (
          <div className="flex justify-center">
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-full font-semibold transition ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              {isSubmitting ? "Збереження..." : "Завершити тестування"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
