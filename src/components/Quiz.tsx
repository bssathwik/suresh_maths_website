import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Question } from '../data/mockData';

interface QuizProps {
  questions: Question[];
  onComplete: (score: number) => void;
}

export default function Quiz({ questions, onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      onComplete(score);
    }
  };

  const restart = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setIsAnswered(false);
  };

  if (showResult) {
    return (
      <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl max-w-md mx-auto">
        <h3 className="text-2xl font-bold dark:text-white mb-4">Quiz Completed!</h3>
        <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-6">
          {score} / {questions.length}
        </div>
        <button
          onClick={restart}
          className="flex items-center gap-2 mx-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100/10"
        >
          <RotateCcw size={20} />
          Try Again
        </button>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Question {currentQuestion + 1} of {questions.length}</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mt-1">{q.text}</h2>
        </div>
      </div>

      <div className="grid gap-3 mb-8">
        {q.options.map((option, index) => {
          let styles = "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:border-indigo-600 dark:hover:border-indigo-400";
          if (isAnswered) {
            if (index === q.correctAnswer) styles = "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-950";
            else if (selectedOption === index) styles = "bg-rose-50 dark:bg-rose-950/20 border-rose-500 text-rose-700 dark:text-rose-400 ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-zinc-950";
            else styles = "bg-white dark:bg-zinc-900/50 border-gray-100 dark:border-zinc-800/80 text-gray-300 dark:text-zinc-650 opacity-40";
          } else if (selectedOption === index) {
            styles = "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400";
          }

          return (
            <motion.button
              key={index}
              whileHover={!isAnswered ? { x: 5 } : {}}
              onClick={() => handleOptionSelect(index)}
              className={`w-full p-4 rounded-2xl border-2 text-left font-semibold transition-all flex justify-between items-center ${styles}`}
            >
              {option}
              {isAnswered && index === q.correctAnswer && <CheckCircle2 size={20} className="text-emerald-500" />}
              {isAnswered && selectedOption === index && index !== q.correctAnswer && <XCircle size={20} className="text-rose-500" />}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <button
              onClick={handleNext}
              className="group flex items-center gap-1 bg-gray-900 dark:bg-zinc-800 text-white dark:text-gray-100 px-6 py-3 rounded-xl font-bold hover:bg-black dark:hover:bg-zinc-700 transition-all shadow-lg"
            >
              {currentQuestion === questions.length - 1 ? 'Finish' : 'Next Question'}
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
