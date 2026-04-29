import React, { useState, useEffect } from 'react';
import { PlayCircle, SkipForward, Trophy, HelpCircle } from 'lucide-react';

export default function QuizCompensation() {
  const [players, setPlayers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleClubsCount, setVisibleClubsCount] = useState(1);
  const [showName, setShowName] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('players') || '[]');
    if (data.length > 0) {
      setPlayers(data.sort(() => Math.random() - 0.5));
    }
  }, []);

  // إذا ما في داتا، اعطيني هاد الشكل عشان نعرف إنه الموقع شغال
  if (players.length === 0) return (
    <div className="flex flex-col items-center justify-center mt-20 p-10 border-2 border-dashed border-slate-700 rounded-[3rem] text-slate-500">
      <HelpCircle size={48} className="mb-4 opacity-20" />
      <p className="text-xl font-bold">يا كابتن، روح ضيف لاعبين أول!</p>
      <a href="/add" className="mt-4 text-green-500 underline">اضغط هنا للإضافة</a>
    </div>
  );

  const currentPlayer = players[currentIndex];

  const handleNextPlayer = () => {
    setShowName(false);
    setVisibleClubsCount(1);
    setCurrentIndex((prev) => (prev + 1) % players.length);
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-10 animate-in fade-in duration-700">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <Trophy className="text-yellow-500" size={24} />
          <span className="text-slate-500 font-mono font-bold">PLAYER {currentIndex + 1}/{players.length}</span>
        </div>
        
        <p className="text-slate-400 text-sm mb-4 tracking-widest uppercase">مسيرة لاعب {currentPlayer.status}</p>
        
        <div className="space-y-3 mb-10">
          {currentPlayer.clubs.slice(0, visibleClubsCount).map((club, i) => (
            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3 animate-in slide-in-from-right duration-300">
              <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-[10px] font-bold">{i+1}</span>
              <span className="text-lg font-semibold">{club}</span>
            </div>
          ))}
        </div>

        {showName && (
          <div className="mb-8 p-4 bg-green-500/20 border border-green-500/50 rounded-2xl text-center animate-in zoom-in duration-300">
            <p className="text-xs text-green-400 uppercase font-black mb-1">الإجابة الصحيحة</p>
            <h3 className="text-3xl font-black text-white italic">{currentPlayer.name}</h3>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button 
            disabled={visibleClubsCount >= currentPlayer.clubs.length || showName}
            onClick={() => setVisibleClubsCount(v => v + 1)}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 py-4 rounded-2xl font-bold transition-all shadow-lg"
          >
            النادي التالي
          </button>
          <button 
            onClick={() => setShowName(true)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-2xl font-black transition-all shadow-lg shadow-yellow-500/10"
          >
            كشف الاسم
          </button>
        </div>
        
        <button 
          onClick={handleNextPlayer}
          className="w-full bg-white text-black py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
        >
          اللاعب التالي <SkipForward size={20}/>
        </button>
      </div>
    </div>
  );
}