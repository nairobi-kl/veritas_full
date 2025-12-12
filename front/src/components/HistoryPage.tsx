import React, {useState} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Test } from "../types";
import { TestCard } from "./TestCard";
import { TeacherTestCard } from "./TeacherTestCard";
import { ChevronDown } from "lucide-react";

interface HistoryPageProps {
  tests: Test[];
  subjects: string[];
  subjectFilter: string;
  setSubjectFilter: (val: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (val: "asc" | "desc") => void;
  isTeacher: boolean;
  onStartTest: (test: Test) => void;
  onViewResults: (test: Test) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  tests,
  subjects,
  subjectFilter,
  setSubjectFilter,
  sortOrder,
  setSortOrder,
  isTeacher,
  onStartTest,
  onViewResults
  
}) => {
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
const [isSortOpen, setIsSortOpen] = useState(false);
  return (
    <div className="mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
          Історія
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
<div className="relative sm:w-56 w-full">
  <button
    onClick={() => setIsSubjectOpen((prev) => !prev)}
    className="w-full px-6 py-4 bg-white/70 backdrop-blur-xl border border-white/50
               rounded-2xl shadow-lg text-gray-800 font-medium flex items-center justify-between"
  >
    <span>
      {subjectFilter === "all" ? "Усі предмети" : subjectFilter}
    </span>
    <ChevronDown className={`transition-transform ${isSubjectOpen ? "rotate-180" : ""}`} />
  </button>

  <AnimatePresence>
    {isSubjectOpen && (
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="absolute top-full mt-3 left-0 right-0 bg-white/90 backdrop-blur-2xl
                   rounded-3xl shadow-2xl border border-white/40 overflow-hidden z-50"
      >
        {subjects.map((s) => (
          <motion.button
            key={s}
            whileHover={{ backgroundColor: "rgba(168,85,247,0.08)" }}
            onClick={() => {
              setSubjectFilter(s);
              setIsSubjectOpen(false);
            }}
            className="w-full px-8 py-5 text-left font-medium text-gray-800 flex items-center justify-between"
          >
            <span>{s === "all" ? "Усі предмети" : s}</span>

            {subjectFilter === s && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3 h-3 bg-purple-600 rounded-full"
              />
            )}
          </motion.button>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
</div>
<div className="relative sm:w-56 w-full">
  <button
    onClick={() => setIsSortOpen((prev) => !prev)}
    className="w-full px-6 py-4 bg-white/70 backdrop-blur-xl border border-white/50
               rounded-2xl shadow-lg text-gray-800 font-medium flex items-center justify-between"
  >
    <span>
      {sortOrder === "desc"
        ? "Від найновіших"
        : "Від найстаріших"}
    </span>
    <ChevronDown className={`transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
  </button>

  <AnimatePresence>
    {isSortOpen && (
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="absolute top-full mt-3 left-0 right-0 bg-white/90 backdrop-blur-2xl
                   rounded-3xl shadow-2xl border border-white/40 overflow-hidden z-50"
      >
        {[
          { value: "desc", label: "Від найновіших до найстаріших" },
          { value: "asc", label: "Від найстаріших до найновіших" }
        ].map(({ value, label }) => (
          <motion.button
            key={value}
            whileHover={{ backgroundColor: "rgba(168,85,247,0.08)" }}
            onClick={() => {
              setSortOrder(value as "asc" | "desc");
              setIsSortOpen(false);
            }}
            className="w-full px-8 py-5 text-left font-medium text-gray-800 flex items-center justify-between"
          >
            <span>{label}</span>

            {sortOrder === value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3 h-3 bg-purple-600 rounded-full"
              />
            )}
          </motion.button>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
</div>
</div>
</div>

      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8"
      >
        <AnimatePresence>
          {tests.length > 0 ? (
            tests.map((test, i) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {isTeacher ? (
                  <TeacherTestCard
                    test={test}
                    onViewResults={onViewResults}
                  />
                ) : (
                  <TestCard
                    test={test}
                    onStartTest={onStartTest}
                    disabled
                  />
                )}
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center text-lg py-6">
              Історія порожня
            </p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
