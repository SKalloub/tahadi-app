import React, { useState, useEffect } from 'react';
import { HelpCircle, LayoutGrid, Play, Trash2, ArrowLeft } from 'lucide-react';
import { collection, onSnapshot, query, deleteDoc, doc } from "firebase/firestore";
import { database } from '../App';

export default function QuizBell() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب الاسم المخزن وتجهيزه للمقارنة بشتى الطرق
    const storedName = (localStorage.getItem('admin_name') || '').trim().toLowerCase();
    
    // فحص شامل: هل الاسم حراك (إنجليزي أو عربي) أو كريم (إنجليزي أو عربي)؟
    const isHarak = storedName === "harak" || storedName.includes("حراك") || storedName.includes("أحمد حراك");
    const isKarim = storedName === "karim" || storedName.includes("كريم");
    const isRegularUser = isHarak || isKarim;

    const q = query(collection(database, "bellQuestions"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questionsList = [];
      const catsSet = new Set();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const docAddedBy = (data.addedBy || "").trim().toLowerCase();
        const cat = data.category || 'عام';

        // شرط الفلترة المحصن:
        // إذا كان أدمن -> يمرق كل شي
        // إذا كان حراك -> يمرق فقط الإشي اللي فيه harak أو حراك
        // إذا كان كريم -> يمرق فقط الإشي اللي فيه karim أو كريم
        let shouldInclude = !isRegularUser; 
        
        if (isHarak && (docAddedBy === "harak" || docAddedBy.includes("حراك"))) {
          shouldInclude = true;
        }
        if (isKarim && (docAddedBy === "karim" || docAddedBy.includes("كريم"))) {
          shouldInclude = true;
        }

        if (shouldInclude) {
          questionsList.push({ ...data, id: doc.id, category: cat });
          catsSet.add(cat);
        }
      });

      setAllQuestions(questionsList);
      setCategories(Array.from(catsSet));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = allQuestions.filter(q => q.category === selectedCategory);
      if (filtered.length === 0) {
        setSelectedCategory(null);
      }
    }
  }, [allQuestions, selectedCategory]);

  const startQuiz = (cat) => {
    const filtered = allQuestions.filter(q => q.category === cat);
    if (filtered.length === 0) return alert('هذه الفئة فارغة على السيرفر!');
    
    setFilteredQuestions([...filtered].sort(() => Math.random() - 0.5));
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const deleteCurrentQuestion = async () => {
    const currentQ = filteredQuestions[currentIndex];
    if (!currentQ || !currentQ.id) return;

    if (!window.confirm('هل تريد حذف هذا السؤال نهائياً من السيرفر المشترك؟')) return;
    
    try {
      await deleteDoc(doc(database, "bellQuestions", currentQ.id));
      
      const updatedFiltered = filteredQuestions.filter((_, i) => i !== currentIndex);
      setFilteredQuestions(updatedFiltered);
      setShowAnswer(false);
      
      if (updatedFiltered.length === 0) {
        setSelectedCategory(null);
      } else if (currentIndex >= updatedFiltered.length) {
        setCurrentIndex(0);
      }
    } catch (e) {
      alert('حدث خطأ أثناء الحذف من السيرفر!');
    }
  };

  if (loading) return <div className="text-center mt-20 text-slate-400 font-bold text-lg animate-pulse">جاري جلب فئات الجرس من السيرفر... 🌐</div>;

  if (!selectedCategory) {
    return (
      <div dir="rtl" className="max-w-2xl mx-auto mt-10 p-6 font-sans">
        <h2 className="text-3xl font-black text-center mb-8 text-white flex items-center justify-center gap-3 italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
          <LayoutGrid className="text-yellow-500" /> اختار الكاتيغوري وبلش جلد 🔔
        </h2>
        
        {categories.length === 0 ? (
          <p className="text-slate-500 text-center italic">لا توجد أسئلة أو فئات جرس مرفوعة حالياً...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => (
              <button key={cat} onClick={() => startQuiz(cat)} className="bg-slate-800/40 hover:bg-slate-700/60 p-6 rounded-3xl border border-white/5 text-right group flex justify-between items-center transition-all shadow-lg">
                <Play className="text-yellow-500 opacity-40 group-hover:opacity-100 transition-all" size={20}/>
                <div className="text-right">
                  <span className="text-xl font-bold text-white block group-hover:text-yellow-400 transition-colors">{cat}</span>
                  <span className="text-xs text-slate-400 font-bold block mt-1">{allQuestions.filter(q => q.category === cat).length} سؤال جاهز</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const currentQ = filteredQuestions[currentIndex];
  if (!currentQ) return <div className="text-center mt-20 text-white font-bold">خلصت الأسئلة! <button onClick={() => setSelectedCategory(null)} className="text-yellow-500 underline mr-2">رجوع للتصنيفات</button></div>;

  return (
    <div dir="rtl" className="max-w-xl mx-auto mt-10 px-4 font-sans text-white">
      <button onClick={() => setSelectedCategory(null)} className="mb-4 text-slate-400 hover:text-white text-sm flex items-center gap-1 font-bold"><ArrowLeft size={14}/> رجوع للتصنيفات</button>
      
      <div className="bg-slate-800/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative">
        <div className="flex justify-between items-center mb-10">
          <HelpCircle className="text-yellow-500" size={32} />
          <div className="flex items-center gap-4">
            <button onClick={deleteCurrentQuestion} className="text-slate-500 hover:text-red-500 transition-colors p-1" title="حذف السؤال">
              <Trash2 size={20}/>
            </button>
            <span className="bg-white/5 px-4 py-1 rounded-full text-xs font-mono font-bold">{currentIndex + 1} / {filteredQuestions.length}</span>
          </div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-black text-center leading-relaxed mb-12 italic">"{currentQ.question}"</h2>
        
        {showAnswer && (
          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl mb-8 animate-in zoom-in duration-300">
            <p className="text-center text-green-400 text-2xl font-black">{currentQ.answer}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <button onClick={() => setShowAnswer(true)} className="w-full py-4 bg-white text-black rounded-2xl font-black text-base hover:bg-slate-200 shadow-xl transition-all">كشف الإجابة القطعية 👁️</button>
          <button onClick={() => { setCurrentIndex((prev) => (prev + 1) % filteredQuestions.length); setShowAnswer(false); }} className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold text-sm transition-all">السؤال التالي ←</button>
        </div>
      </div>
    </div>
  );
}