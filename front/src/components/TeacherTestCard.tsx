import React from 'react';
import { Test } from '../types';

interface TeacherTestCardProps {
  test: Test;
  onViewResults: (test: Test) => void;
}

export const TeacherTestCard: React.FC<TeacherTestCardProps> = ({ test, onViewResults }) => {
  const getBackgroundColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-gradient-to-br from-blue-200 to-blue-300',
      purple: 'bg-gradient-to-br from-purple-200 to-purple-300',
      pink: 'bg-gradient-to-br from-pink-200 to-pink-300',
    };
    return colors[color] || colors.blue;
  };

  const parseDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;

    let date: Date;

    if (dateStr.includes('T') || dateStr.includes('-')) {
      date = new Date(dateStr);
    } else if (dateStr.includes(',') && dateStr.includes('.')) {
      const [datePart, timePart] = dateStr.split(', ');
      const [day, month, year] = datePart.split('.').map(Number);
      const [hours, minutes, seconds] = timePart.split(':').map(Number);
      date = new Date(year, month - 1, day, hours, minutes, seconds || 0);
    } else {
      return null;
    }

    return isNaN(date.getTime()) ? null : date;
  };

  const formatDisplayDate = (dateStr: string | undefined): string => {
    const date = parseDate(dateStr);
    if (!date) return '—';

    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');

    return `${dd}.${mm}.${yyyy}, ${hh}:${min}`;
  };

  const now = new Date();
  const start = parseDate(test.startTime);
  const end = parseDate(test.endTime);

  const isAvailable = start && end && now >= start && now <= end;


  return (
    <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 overflow-hidden">
      <div className="p-8">
        <h3 className="text-3xl font-black text-center text-purple-700 mb-6">{test.subject}</h3>
        <p className="text-center text-gray-700 text-lg font-medium mb-6">"{test.title}"</p>

      <div className="space-y-3 text-sm text-gray-600 mb-8">
        <p className="text-gray-700">
          <span className="font-semibold">Групи:</span> {Array.isArray(test.groups)
  ? test.groups.join(', ')
  : test.groups || '—'
}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Тема тесту:</span> "{test.title}"
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Розпочато:</span> {formatDisplayDate(test.startTime)}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Завершення:</span> {formatDisplayDate(test.endTime)}
        </p>
      </div>

      <div className="flex justify-center mt-auto">
        <button
          onClick={() => onViewResults(test)}
          className="bg-purple-400 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-500 transition-colors"
        >
          Переглянути результати
        </button>
      </div>
      </div>
      </div>
  );
};