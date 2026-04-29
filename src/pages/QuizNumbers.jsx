import React, { useState, useEffect } from 'react';
import { HelpCircle, RefreshCw } from 'lucide-react';

export default function QuizNumbers() {
  const [question, setQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const generateQuestion = () => {
    const data = JSON.parse(localStorage.getItem('clubNumbers') || '[]');
    if (data.length === 0) return;

    const randomClub = data[Math.floor(Math.random() * data.length)];
    const randomPlayer = randomClub.players[Math.floor(Math.random() * randomClub.players.length)];
    
    setQuestion({ club: randomClub.club, player: randomPlayer });
    setShowAnswer(false);
  };

  useEffect(() => { generateQuestion(); }, []);

  if (!question) return <div className="text-center mt-20 text-slate-500 font-bold text-xl">ما في أرقام أندية لسا! روح ضيف يا معلم</div>;

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-10 rounded-[3rem] border border-white/10 shadow-2xl text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
          <span className="text-3xl font-black italic">#{question.player.number}</span>
        </div>
        
        <h2 className="text-xl text-slate-400 mb-2 uppercase tracking-widest font-bold">من يرتدي هذا الرقم في</h2>
        <h3 className="text-4xl font-black mb-12 text-white italic">{question.club}؟</h3>

        {showAnswer && (
          <div className="mb-8 animate-in zoom-in duration-300">
            <p className="text-blue-400 text-3xl font-black tracking-tighter uppercase">{question.player.name}</p>
          </div>
        )}

        <div className="space-y-4">
          <button onClick={() => setShowAnswer(true)} className="w-full py-4 bg-white text-black rounded-2xl font-black">كشف اللاعب</button>
          <button onClick={generateQuestion} className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2">
            <RefreshCw size={18} /> لاعب آخر
          </button>
        </div>
      </div>
    </div>
  );
}