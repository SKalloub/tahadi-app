import React, { useState, useEffect } from 'react';
import { PlayCircle, SkipForward, Trophy, HelpCircle, Trash2, ArrowLeft, LayoutGrid, Play } from 'lucide-react';
import { collection, onSnapshot, query, deleteDoc, doc, where } from "firebase/firestore";
import { database } from '../App';

export default function QuizCompensation() {
  const [allPlayers, setAllPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleClubsCount, setVisibleClubsCount] = useState(1);
  const [showName, setShowName] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminCleanName = (localStorage.getItem('admin_name') || 'مجهول').trim().toLowerCase();
    
    let q;
    if (adminCleanName === "harak") {
      q = query(collection(database, "players"), where("addedBy", "==", "harak"));
    } else {
      q = query(collection(database, "players"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersList = [];
      const catsSet = new Set();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const docAddedBy = (data.addedBy || "").trim().toLowerCase();
        const cat = data.category || 'عام';

        if (adminCleanName !== "harak" || docAddedBy === "harak") {
          playersList.push({ ...data, id: doc.id, category: cat });
          catsSet.add(cat);
        }
      });
      
      setAllPlayers(playersList);
      setCategories(Array.from(catsSet));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const startQuiz = (cat) => {
    const filtered = allPlayers.filter(p => p.category === cat);
    if (filtered.length === 0) return alert('هذه الفئة فارغة على السيرفر!');
    
    setFilteredPlayers([...filtered].sort(() => Math.random() - 0.5));
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setVisibleClubsCount(1);
    setShowName(false);
  };

  const deleteCurrentPlayer = async () => {
    const currentPlayer = filteredPlayers[currentIndex];
    if (!currentPlayer || !currentPlayer.id) return;

    if (!window.confirm(`بدك تحذف اللاعب [${currentPlayer.name}] نهائياً؟`)) return;

    try {
      await deleteDoc(doc(database, "players", currentPlayer.id));
      const updated = filteredPlayers.filter((_, i) => i !== currentIndex);
      setFilteredPlayers(updated);
      setShowName(false);
      setVisibleClubsCount(1);
      
      if (updated.length === 0) {
        setSelectedCategory(null);
      } else if (currentIndex >= updated.length) {
        setCurrentIndex(0);
      }
    } catch (e) { alert('فشل الحذف من السيرفر!'); }
  };

  if (loading) return <div className="text-center mt-20 text-slate-400 font-bold text-lg animate-pulse">جاري سحب مسيرات التعويض... 🌐</div>;

  // شاشة اختيار كاتيغوري التعويض
  if (!selectedCategory) {
    return (
      <div dir="rtl" className="max-w-2xl mx-auto mt-10 p-6 font-sans">
        <h2 className="text-3xl font-black text-center mb-8 text-white flex items-center justify-center gap-3 italic text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
          <LayoutGrid className="text-green-500" /> كاتيغوريات التعويض والمسيرات ⚽
        </h2>
        {categories.length === 0 ? (
          <p className="text-slate-500 text-center italic">لا توجد مسيرات مضافة حالياً...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => (
              <button key={cat} onClick={() => startQuiz(cat)} className="bg-slate-800/40 hover:bg-slate-700/60 p-6 rounded-3xl border border-white/5 text-right group flex justify-between items-center transition-all shadow-lg">
                <Play className="text-green-500 opacity-40 group-hover:opacity-100 transition-all" size={20}/>
                <div className="text-right">
                  <span className="text-xl font-bold text-white block group-hover:text-green-400 transition-colors">{cat}</span>
                  <span className="text-xs text-slate-400 font-bold block mt-1">{allPlayers.filter(p => p.category === cat).length} لاعب جاهز</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const currentPlayer = filteredPlayers[currentIndex];
  if (!currentPlayer) return <div className="text-center mt-20 text-white font-bold">خلصت مسيرات الفئة! <button onClick={() => setSelectedCategory(null)} className="text-green-500 underline mr-2">رجوع للتصنيفات</button></div>;

  return (
    <div dir="rtl" className="flex flex-col items-center gap-6 mt-10 px-4 text-white font-sans">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setSelectedCategory(null)} className="text-slate-400 hover:text-white text-xs flex items-center gap-1 font-bold"><ArrowLeft size={14}/> التصنيفات</button>
          <div className="flex items-center gap-4">
            <button onClick={deleteCurrentPlayer} className="text-slate-500 hover:text-red-500 p-1 rounded-lg" title="حذف اللاعب">
              <Trash2 size={18} />
            </button>
            <span className="text-slate-500 font-mono font-bold text-xs">PLAYER {currentIndex + 1} / {filteredPlayers.length}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <p className="text-slate-400 text-xs font-bold">الحالة: <span className="text-green-400">{currentPlayer.status}</span></p>
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
            <h3 className="text-3xl font-black text-white italic">{currentPlayer.name}</h3>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button disabled={!currentPlayer.clubs || visibleClubsCount >= currentPlayer.clubs.length || showName} onClick={() => setVisibleClubsCount(v => v + 1)} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-white text-sm py-4 rounded-2xl font-bold transition-all">النادي التالي ←</button>
          <button onClick={() => setShowName(true)} className="bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-2xl font-black text-sm transition-all">كشف الاسم 👁️</button>
        </div>
        
        <button onClick={() => { setShowName(false); setVisibleClubsCount(1); setCurrentIndex((prev) => (prev + 1) % filteredPlayers.length); }} className="w-full bg-white text-black py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">اللاعب التالي <SkipForward size={20}/></button>
      </div>
    </div>
  );
}