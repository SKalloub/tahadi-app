import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { collection, onSnapshot, query } from "firebase/firestore";
import { database } from '../App';

export default function QuizNumbers() {
  const [allClubsData, setAllClubsData] = useState([]);
  const [question, setQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  // جلب الأرقام لايف من الفايربيس
  useEffect(() => {
    const q = query(collection(database, "clubNumbers"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clubsList = [];
      snapshot.forEach((doc) => clubsList.push(doc.data()));
      setAllClubsData(clubsList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const generateQuestion = () => {
    if (allClubsData.length === 0) return;

    // اختيار نادٍ عشوائي يحتوي على لاعبين
    const validClubs = allClubsData.filter(c => c.players && c.players.length > 0);
    if (validClubs.length === 0) return;

    const randomClub = validClubs[Math.floor(Math.random() * validClubs.length)];
    const randomPlayer = randomClub.players[Math.floor(Math.random() * randomClub.players.length)];
    
    setQuestion({ club: randomClub.club, player: randomPlayer });
    setShowAnswer(false);
  };

  // توليد أول سؤال فور تحميل الداتا من السيرفر
  useEffect(() => {
    if (allClubsData.length > 0) {
      generateQuestion();
    }
  }, [allClubsData]);

  if (loading) return <div className="text-center mt-20 text-slate-400 font-bold text-lg animate-pulse">جاري جلب بنك أرقام اللاعبين من السيرفر... 🌐</div>;
  if (!question) return <div className="text-center mt-20 text-slate-500 font-bold text-xl">ما في أرقام أندية بالـ Cloud لسا! روح ضيف من شاشة الإدارة يا كابتن.</div>;

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-10 rounded-[3rem] border border-white/10 shadow-2xl text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
          <span className="text-3xl font-black italic text-white">#{question.player.number}</span>
        </div>
        
        <h2 className="text-xl text-slate-400 mb-2 uppercase tracking-widest font-bold">من يرتدي هذا الرقم في</h2>
        <h3 className="text-4xl font-black mb-12 text-white italic">{question.club}؟</h3>

        {showAnswer && (
          <div className="mb-8 animate-in zoom-in duration-300">
            <p className="text-blue-400 text-3xl font-black tracking-tighter uppercase">{question.player.name}</p>
          </div>
        )}

        <div className="space-y-4">
          <button onClick={() => setShowAnswer(true)} className="w-full py-4 bg-white text-black rounded-2xl font-black transition-all hover:bg-slate-200">كشف اللاعب 👁️</button>
          <button onClick={generateQuestion} className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 text-white transition-all">
            <RefreshCw size={18} /> لاعب آخر 🔁
          </button>
        </div>
      </div>
    </div>
  );
}