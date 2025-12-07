import React, { useEffect, useState } from "react";
import { Test } from "../types";
import { useAuth } from "../contexts/AuthContext";

interface TestCardProps {
  test: Test;
  onStartTest: (test: Test) => void;
}

export const TestCard: React.FC<TestCardProps> = ({ test, onStartTest }) => {
  const { user } = useAuth();

  const [alreadySubmitted, setAlreadySubmitted] = useState<boolean>(false);
  const [loadingCheck, setLoadingCheck] = useState<boolean>(true);

  // === Перевіряємо, чи студент уже проходив тест ===
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(
          `http://localhost:8021/submissions/check/${test.id}`,
          { headers: { Authorization: `Bearer ${user?.token}` } }
        );

        const data = await res.json();
        setAlreadySubmitted(data.alreadySubmitted === true);
      } catch (err) {
        console.error("Помилка перевірки проходження:", err);
      } finally {
        setLoadingCheck(false);
      }
    };

    if (user?.token) check();
  }, [test.id, user?.token]);

  // -------------------- Парс дат --------------------
  const parseDate = (str?: string): Date | null => {
    if (!str) return null;
    const date = new Date(str);
    return isNaN(date.getTime()) ? null : date;
  };

  const formatDisplayDate = (str?: string): string => {
    const d = parseDate(str);
    if (!d) return "—";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}.${mm}.${yyyy}, ${hh}:${min}`;
  };

  const now = new Date();
  const start = parseDate(test.startTime);
  const end = parseDate(test.endTime);

  const isTimeAvailable = start && end && now >= start && now <= end;

  // -------------------- Логіка статусу --------------------
  let statusLabel = "Недоступно";

  if (alreadySubmitted) {
    statusLabel = "Ви вже проходили тест";
  } else if (!isTimeAvailable) {
    if (start && now < start) statusLabel = "Ще не розпочато";
    else if (end && now > end) statusLabel = "Час минув";
  } else {
    statusLabel = "Розпочати тест";
  }

  // -------------------- Дизейбл кнопки --------------------
  const isDisabled =
    loadingCheck ||
    alreadySubmitted ||
    !isTimeAvailable;

  const handleClick = () => {
    if (!isDisabled) onStartTest(test);
  };

  return (
    <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 overflow-hidden">
      <div className="p-8 flex flex-col h-full">
        
        <h3 className="text-3xl font-black text-center text-purple-700 mb-6">
          {test.subject}
        </h3>

        <p className="text-center text-gray-700 text-lg font-medium mb-6">
          "{test.title}"
        </p>

        <div className="space-y-3 text-sm text-gray-700 mb-8">
          <p>
            <span className="font-semibold text-purple-600">Викладач:</span>{" "}
            {test.lecturer}
          </p>
          <p>
            <span className="font-semibold text-purple-600">Початок:</span>{" "}
            {formatDisplayDate(test.startTime)}
          </p>
          <p>
            <span className="font-semibold text-purple-600">Завершення:</span>{" "}
            {formatDisplayDate(test.endTime)}
          </p>
        </div>

        <div className="flex justify-center mt-auto">
          <button
            onClick={handleClick}
            disabled={isDisabled}
            className={`
              px-6 py-3 rounded-full font-semibold text-white transition-all
              ${
                isDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-500 hover:bg-purple-600 shadow-md hover:shadow-lg"
              }
            `}
          >
            {loadingCheck ? "Завантаження..." : statusLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
