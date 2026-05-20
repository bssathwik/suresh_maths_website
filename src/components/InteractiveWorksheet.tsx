import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, RefreshCcw, Send } from 'lucide-react';
import { WorksheetItem } from '../data/mockData';

interface InteractiveWorksheetProps {
  items: WorksheetItem[];
  onComplete?: () => void;
}

export default function InteractiveWorksheet({ items, onComplete }: InteractiveWorksheetProps) {
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ [id: string]: boolean }>({});

  const handleInputChange = (id: string, value: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    const newResults: { [id: string]: boolean } = {};
    items.forEach(item => {
      newResults[item.id] = (answers[item.id] || '').trim().toLowerCase() === item.correctAnswer.toLowerCase();
    });
    setResults(newResults);
    setSubmitted(true);
    if (onComplete) onComplete();
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setResults({});
  };

  const score = Object.values(results).filter(Boolean).length;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="space-y-6">
        {items.map((item, index) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={item.id}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Problem {index + 1}</span>
                <label className="text-lg font-bold text-gray-900">{item.question}</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly={submitted}
                  value={answers[item.id] || ''}
                  onChange={(e) => handleInputChange(item.id, e.target.value)}
                  placeholder="Your answer..."
                  className={`w-full md:w-48 px-4 py-3 rounded-xl border-2 font-bold focus:outline-none transition-all ${
                    submitted 
                      ? results[item.id] 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10'
                  }`}
                />
                {submitted && (
                  results[item.id] 
                    ? <CheckCircle2 size={24} className="text-emerald-500 flex-shrink-0" />
                    : <XCircle size={24} className="text-rose-500 flex-shrink-0" />
                )}
              </div>
            </div>
            {submitted && !results[item.id] && (
              <p className="mt-3 text-sm font-bold text-gray-400">
                Correct answer: <span className="text-indigo-600">{item.correctAnswer}</span>
              </p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-12 sticky bottom-0 p-6 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        {!submitted ? (
          <>
            <div>
              <p className="text-sm font-bold text-gray-500">Ready to check your answers?</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black uppercase tracking-widest">Complete all items for best results</p>
            </div>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Send size={20} />
              Submit Worksheet
            </button>
          </>
        ) : (
          <>
            <div>
              <p className="text-sm font-bold text-gray-500">Worksheet Results</p>
              <p className="text-2xl font-black text-gray-900">Score: {score} / {items.length}</p>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg"
            >
              <RefreshCcw size={20} />
              Restart Worksheet
            </button>
          </>
        )}
      </div>
    </div>
  );
}
