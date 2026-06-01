import React, { useState, useEffect } from 'react';
import { PlayCircle, SkipForward, Trophy, HelpCircle, Trash2 } from 'lucide-react';
import { collection, onSnapshot, query, deleteDoc, doc } from "firebase/firestore";
import { database } from '../App';

export default function QuizCompensation() {
  const [players, setPlayers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleClubsCount, setVisibleClubsCount] = useState(1);
  const [showName, setShowName] = useState(false);
  const [loading, setLoading] = useState(true);

  // استماع مباشر وقوي للاعبين المخزنين بالـ Cloud مع خلط صاعق عند أول تحميل
  useEffect(() => {
    const q = query(collection(database, "players"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersList = [];
      snapshot.forEach((doc) => {
        playersList.push({ ...doc.data(), id: doc.id });
      });
      
      // خلط عشوائي للمسيرات لتفادي التكرار الممل
      setPlayers(playersList.sort(() => Math.random() - 0.5));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // دالة حذف اللاعب الحالي من قاعدة البيانات السحابية واللعبة فوراً
  const deleteCurrentPlayer = async () => {
    const currentPlayer = players[currentIndex];
    if (!currentPlayer || !currentPlayer.id) return;

    if (!window.confirm(`بدك تحذف اللاعب [${currentPlayer.name}] نهائياً من قاعدة البيانات السحابية للجميع؟`)) return;

    try {
      // حذف من مستودع الفايربيس مباشرة عبر الـ id
      await deleteDoc(doc(database, "players", currentPlayer.id));
      
      // ضبط العدادات للمسيرة التالية تلقائياً
      setShowName(false);
      setVisibleClubsCount(1);
      
      // حماية المؤشر والـ Index من الخروج عن نطاق المصفوفة المحدثة
      if (currentIndex >= players.length - 1) {
        setCurrentIndex(0);
      }
      alert('تم مسح وثيقة اللاعب من السيرفر بنجاح! 🗑️');
    } catch (e) {
      alert('فشل اتصال الشبكة، لم يتم الحذف!');
    }
  };

  if (loading) return <div className="text-center mt-20 text-slate-400 font-bold text-lg animate-pulse">جاري سحب مسيرات اللاعبين من قاعدة البيانات... 🌐</div>;

  if (players.length === 0) return (
    <div className="flex flex-col items-center justify-center mt-20 p-10 border-2 border-dashed border-slate-700 rounded-[3rem] text-slate-500 max-w-md mx-auto">
      <HelpCircle size={48} className="mb-4 opacity-20" />
      <p className="text-xl font-bold text-center">يا كابتن، السيرفر فاضي! روح ضيف لاعبين ومسيرات أول!</p>
      <a href="/add" className="mt-4 text-green-500 underline font-bold">اضغط هنا للانتقال لشاشة الإضافة</a>
    </div>
  );

  const currentPlayer = players[currentIndex];

  const handleNextPlayer = () => {
    setShowName(false);
    setVisibleClubsCount(1);
    setCurrentIndex((prev) => (prev + 1) % players.length);
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-10 px-4 animate-in fade-in duration-700 text-white font-sans">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <Trophy className="text-yellow-500" size={24} />
          <div className="flex items-center gap-4">
            {/* زر الحذف السحابي الحي */}
            <button 
              onClick={deleteCurrentPlayer}
              className="text-slate-500 hover:text-red-500 transition-colors p-1 bg-red-500/5 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20"
              title="حذف اللاعب نهائياً من السيرفر"
            >
              <Trash2 size={18} />
            </button>
            <span className="text-slate-500 font-mono font-bold uppercase tracking-tighter text-xs">
              PLAYER {currentIndex + 1} / {players.length}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <p className="text-slate-400 text-xs tracking-widest uppercase font-bold">مسيرة لاعب: <span className="text-green-400">{currentPlayer.status}</span></p>
          <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/10 font-bold">بواسطة: {currentPlayer.addedBy || 'مجهول'}</span>
        </div>
        
        <div className="space-y-3 mb-10">
          {currentPlayer.clubs && currentPlayer.clubs.slice(0, visibleClubsCount).map((club, i) => (
            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3 animate-in slide-in-from-right duration-300">
              <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">{i+1}</span>
              <span className="text-lg font-semibold text-slate-200">{club}</span>
            </div>
          ))}
        </div>

        {showName && (
          <div className="mb-8 p-4 bg-green-500/20 border border-green-500/50 rounded-2xl text-center animate-in zoom-in duration-300">
            <p className="text-xs text-green-400 uppercase font-black mb-1">الإجابة الصحيحة</p>
            <h3 className="text-3xl font-black text-white italic tracking-tight">{currentPlayer.name}</h3>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button 
            disabled={!currentPlayer.clubs || visibleClubsCount >= currentPlayer.clubs.length || showName}
            onClick={() => setVisibleClubsCount(v => v + 1)}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-white text-sm py-4 rounded-2xl font-bold transition-all shadow-lg"
          >
            النادي التالي ←
          </button>
          <button 
            onClick={() => setShowName(true)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-yellow-500/10"
          >
            كشف الاسم 👁️
          </button>
        </div>
        
        <button 
          onClick={handleNextPlayer}
          className="w-full bg-white text-black py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-xl"
        >
          اللاعب التالي <SkipForward size={20}/>
        </button>
      </div>
    </div>
  );
}