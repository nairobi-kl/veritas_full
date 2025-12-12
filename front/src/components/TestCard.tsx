import React, { useEffect, useState } from "react";
import { Test } from "../types";
import { useAuth } from "../contexts/AuthContext";

interface TestCardProps {
  test: Test;
  onStartTest: (test: Test) => void;
   disabled?: boolean; 
}

export const TestCard: React.FC<TestCardProps> = ({ test, onStartTest }) => {
  const { user } = useAuth();

  const [alreadySubmitted, setAlreadySubmitted] = useState<boolean>(false);
  const [loadingCheck, setLoadingCheck] = useState<boolean>(true);
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(
          `https://veritas-t6l0.onrender.com/submissions/check/${test.id}`,
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
const parseDate = (str?: string): Date | null => {
  if (!str) return null;
  try {
    if (str.includes('T') || str.includes('Z')) {
      return new Date(str);
    }
    const [datePart, timePart] = str.split(' ');
    if (datePart && timePart) {
      return new Date(`${datePart}T${timePart}Z`);
    }
    return null;
  } catch {
    return null;
  }
};

const formatDisplayDate = (str?: string): string => {
  const d = parseDate(str);
  if (!d || isNaN(d.getTime())) return "—";
  return d.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', '');
};


  const now = new Date();
  const start = parseDate(test.startTime);
  const end = parseDate(test.endTime);
  

  const isTimeAvailable = start && end && now >= start && now <= end;

  let statusLabel = "Недоступно";

  if (alreadySubmitted) {
    statusLabel = "Ви вже проходили тест";
  } else if (!isTimeAvailable) {
    if (start && now < start) statusLabel = "Ще не розпочато";
    else if (end && now > end) statusLabel = "Час минув";
  } else {
    statusLabel = "Розпочати тест";
  }
  const isDisabled =
    loadingCheck ||
    alreadySubmitted ||
    !isTimeAvailable;

  const handleClick = () => {
    if (!isDisabled) onStartTest(test);
  };

  return (
    <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 overflow-hidden min-h-[400px]">
      <div className="p-8 flex flex-col h-full">
        
        <h3 className="text-3xl font-black text-center min-h-[80px] text-purple-700 mb-6">
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
