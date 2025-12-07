import React from 'react';
import { X } from 'lucide-react';
import { Test } from '../types';

interface TestModalProps {
  test: Test | null;
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export const TestModal: React.FC<TestModalProps> = ({ test, isOpen, onClose, onStart }) => {
  if (!isOpen || !test) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <div className="bg-gradient-to-br from-purple-200 to-purple-300 p-8 rounded-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {test.subject}
          </h2>
          
          <div className="space-y-3 mb-8 text-gray-700">
            <p>
              <span className="font-semibold">Викладач:</span> {test.lecturer}
            </p>
            <p>
              <span className="font-semibold">Тема тесту:</span> "{test.title}"
            </p>
            <p>
              <span className="font-semibold">Розпочато:</span> {test.startTime}
            </p>
            <p>
              <span className="font-semibold">Завершення:</span> {test.endTime}
            </p>
            <p>
              <span className="font-semibold">Часове обмеження:</span> {test.duration}
            </p>
            <p>
              <span className="font-semibold">Максимальна кількість балів:</span> {test.maxScore}
            </p>
          </div>

          <button
            onClick={onStart}
            className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
          >
            Розпочати спробу
          </button>
        </div>
      </div>
    </div>
  );
};