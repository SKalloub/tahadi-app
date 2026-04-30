import React, { useState, useEffect } from 'react';
import { HelpCircle, LayoutGrid, Play, Trash2, ArrowLeft } from 'lucide-react';

export default function QuizBell() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const loadData = () => {
    const data = JSON.parse(localStorage.getItem('bellQuestions') || '[]');
    setAllQuestions(data);
    const cats = [...new Set(data.map(q => q.category || 'عام'))];
    setCategories(cats);
  };

  useEffect(() => { loadData(); }, []);

  const startQuiz = (cat) => {
    const filtered = allQuestions.filter(q => (q.category || 'عام') === cat);
    setFilteredQuestions(filtered.sort(() => Math.random() - 0.5));
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const deleteCurrentQuestion = () => {
    if (!window.confirm('حذف هذا السؤال نهائياً؟')) return;
    const currentQ = filteredQuestions[currentIndex];
    const updatedAll = allQuestions.filter(q => q.question !== currentQ.question);
    localStorage.setItem('bellQuestions', JSON.stringify(updatedAll));
    
    const updatedFiltered = filteredQuestions.filter((_, i) => i !== currentIndex);
    setFilteredQuestions(updatedFiltered);
    setAllQuestions(updatedAll);
    setShowAnswer(false);
    
    if (updatedFiltered.length === 0) setSelectedCategory(null);
    else if (currentIndex >= updatedFiltered.length) setCurrentIndex(0);
  };

  if (!selectedCategory) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <h2 className="text-3xl font-black text-center mb-8 text-white flex items-center justify-center gap-3">
          <LayoutGrid className="text-yellow-500" /> اختار الكاتيغوري
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(cat => (
            <button key={cat} onClick={() => startQuiz(cat)} className="bg-slate-800 hover:bg-slate-700 p-6 rounded-3xl border border-white/5 text-right group flex justify-between items-center transition-all">
              <Play className="text-yellow-500 opacity-0 group-hover:opacity-100" size={20}/>
              <div className="text-right">
                <span className="text-xl font-bold text-white block">{cat}</span>
                <span className="text-sm text-slate-400">{allQuestions.filter(q => q.category === cat).length} سؤال</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentQ = filteredQuestions[currentIndex];
  if (!currentQ) return <div className="text-center mt-20 text-white">خلصت الأسئلة! <button onClick={() => setSelectedCategory(null)} className="text-yellow-500 underline">رجوع</button></div>;

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <button onClick={() => setSelectedCategory(null)} className="mb-4 text-slate-400 hover:text-white text-sm flex items-center gap-1"><ArrowLeft size={14}/> رجوع للتصنيفات</button>
      <div className="bg-slate-800/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative">
        <div className="flex justify-between items-center mb-10">
          <HelpCircle className="text-yellow-500" size={32} />
          <div className="flex items-center gap-4">
            <button onClick={deleteCurrentQuestion} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
            <span className="bg-white/5 px-4 py-1 rounded-full text-xs font-mono text-white">{currentIndex + 1} / {filteredQuestions.length}</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center leading-relaxed mb-12 text-white">{currentQ.question}</h2>
        {showAnswer && (
          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl mb-8 animate-in zoom-in duration-300">
            <p className="text-center text-green-400 text-2xl font-black">{currentQ.answer}</p>
          </div>
        )}
        <div className="space-y-4">
          <button onClick={() => setShowAnswer(true)} className="w-full py-4 bg-white text-black rounded-2xl font-black hover:bg-slate-200 transition-colors">كشف الإجابة</button>
          <button onClick={() => { setCurrentIndex((prev) => (prev + 1) % filteredQuestions.length); setShowAnswer(false); }} className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold text-white transition-colors">السؤال التالي</button>
        </div>
      </div>
    </div>
  );
}