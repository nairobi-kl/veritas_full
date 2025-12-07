import React from 'react';
import { TestResult } from '../types';

interface ResultCardProps {
  result: TestResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const getBackgroundColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'ОРГАНІЗАЦІЯ БАЗ ДАНИХ': 'bg-gradient-to-br from-blue-200 to-blue-300',
      'ОПЕРАЦІЙНІ СИСТЕМИ': 'bg-gradient-to-br from-purple-200 to-purple-300',
      'ВИЩА МАТЕМАТИКА': 'bg-gradient-to-br from-pink-200 to-pink-300',
    };
    return colors[subject] || 'bg-gradient-to-br from-gray-200 to-gray-300';
  };


  return (
    <div className={`${getBackgroundColor(result.subject)} p-6 rounded-2xl shadow-lg h-full flex flex-col`}>
      <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
        {result.subject}
      </h3>
      
      <div className="text-center space-y-2 mb-6 flex-grow">
        <p className="text-gray-700">
          <span className="font-semibold">Викладач:</span> {result.lecturer}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Тема тесту:</span> "{result.title}"
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Розпочато:</span> {result.startTime}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Завершено:</span> {result.endTime}
        </p>
      </div>

      <div className="flex justify-center mt-auto">
        <div className="bg-purple-300 text-purple-800 px-6 py-3 rounded-full font-bold text-lg">
          Ваш результат: {result.score}/{result.maxScore}
        </div>
      </div>
    </div>
  );
};