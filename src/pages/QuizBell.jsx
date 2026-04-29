import React, { useState, useEffect } from 'react';
import { HelpCircle, Eye, ChevronRight } from 'lucide-react';

export default function QuizBell() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('bellQuestions') || '[]');
    setQuestions(data.sort(() => Math.random() - 0.5));
  }, []);

  if (questions.length === 0) return (
    <div className="text-center mt-20 p-10 bg-slate-800 rounded-3xl border border-dashed border-white/10">
      <p className="text-slate-400">ما ضفت أسئلة جرس لسا يا برو!</p>
    </div>
  );

  const currentQ = questions[currentIndex];

  const nextQuestion = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-slate-800/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <HelpCircle className="text-yellow-500" size={32} />
          <span className="bg-white/5 px-4 py-1 rounded-full text-xs font-mono">Q: {currentIndex + 1}</span>
        </div>

        <h2 className="text-3xl font-bold text-center leading-relaxed mb-12">
          {currentQ.question}
        </h2>

        {showAnswer && (
          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl mb-8 animate-in zoom-in duration-300">
            <p className="text-center text-green-400 text-2xl font-black">{currentQ.answer}</p>
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={() => setShowAnswer(true)}
            className="w-full py-4 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
          >
            <Eye size={20} /> كشف الإجابة
          </button>
          
          <button 
            onClick={nextQuestion}
            className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            السؤال التالي <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}