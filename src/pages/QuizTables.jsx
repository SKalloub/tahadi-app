import React, { useState, useEffect } from 'react';
import { HelpCircle, ArrowLeft, Play } from 'lucide-react';
import { collection, onSnapshot, query } from "firebase/firestore";
import { database } from '../App';

export default function QuizTables() {
  const [selectedTourney, setSelectedTourney] = useState(null);
  
  // نظام الكويز النشط
  const [activeQuizCat, setActiveQuizCat] = useState(null); 
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [curQIdx, setCurQIdx] = useState(0);
  const [revealAns, setRevealAns] = useState(false);

  // داتا البطولة المفتوحة لايف
  const [categories, setCategories] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);

  const tournamentsList = {
    ucl: 'دوري أبطال أوروبا', cwc: 'كأس العالم للأندية', facup: 'كأس إنجلترا',
    copadelrey: 'كأس إسبانيا', coppaitalia: 'كأس إيطاليا', dfbpokal: 'كأس ألمانيا',
    cdf: 'كأس فرنسا', seriea: 'الدوري الإيطالي', laliga: 'الدوري الإسباني',
    epl: 'الدوري الإنجليزي', ligue1: 'الدوري الفرنسي', bundesliga: 'الدوري الألماني',
    eredivisie: 'الدوري الهولندي', wc: 'كأس العالم', euro: 'اليورو',
    coba: 'كوبا أمريكا', uel: 'الدوري الأوروبي', uecl: 'دوري المؤتمرات',
    cwc_old: 'كأس الكؤوس الأوروبية', others: 'دوريات أخرى'
  };

  // جلب الأسئلة والفئات حياً من السيرفر فور اختيار البطولة
  useEffect(() => {
    if (selectedTourney) {
      const q = query(collection(database, "tournamentQuizzes"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const questionsList = [];
        const catsSet = new Set();
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.tournament === selectedTourney) {
            questionsList.push({ ...data, id: doc.id });
            if (data.category) catsSet.add(data.category);
          }
        });
        
        setAllQuestions(questionsList);
        setCategories(Array.from(catsSet));
      });

      return () => unsubscribe();
    } else {
      setCategories([]);
      setAllQuestions([]);
      setActiveQuizCat(null);
    }
  }, [selectedTourney]);

  // تشغيل كويز الجرس بخلط صاعق وعشوائي
  const startCategoryQuiz = (catName) => {
    const q = allQuestions.filter(question => question.category === catName);
    if (q.length === 0) return alert('هذه الفئة فاضية على السيرفر، أضف لها بعض الأسئلة من لوحة التحكم!');
    
    // خلط عشوائي حقيقي
    setFilteredQuestions([...q].sort(() => Math.random() - 0.5)); 
    setActiveQuizCat(catName);
    setCurQIdx(0);
    setRevealAns(false);
  };

  // الشاشة الأولى: استعراض البطولات الـ 20 بكروت نيون فاخرة مرتبة
  if (!selectedTourney) {
    return (
      <div dir="rtl" className="max-w-6xl mx-auto py-8 px-4 font-sans text-white">
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-5xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">
            تحديات فقرة الجرس والسرعة 🔔
          </h1>
          <p className="text-slate-400 text-sm font-bold">اختر البطولة واجتز بنوك الأسئلة الفورية للفئات المخصصة</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Object.entries(tournamentsList).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setSelectedTourney(key)}
              className="bg-slate-800/30 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 hover:border-yellow-500/40 hover:bg-slate-800/70 transition-all hover:-translate-y-1 text-right shadow-xl flex flex-col justify-between h-36 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 bg-yellow-500/5 w-16 h-16 rounded-br-[3rem] group-hover:bg-yellow-500/10 transition-all"></div>
              <span className="text-lg font-black text-white leading-tight block group-hover:text-yellow-400 transition-colors z-10">{name}</span>
              <span className="text-[11px] text-slate-500 font-bold tracking-wider group-hover:text-slate-300 transition-colors">عرض فئات الجرس ←</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // الشاشة الثالثة: واجهة لعب الجرس
  if (activeQuizCat) {
    const activeQ = filteredQuestions[curQIdx];
    return (
      <div dir="rtl" className="max-w-xl mx-auto mt-10 px-4 font-sans text-white">
        <button onClick={() => setActiveQuizCat(null)} className="mb-4 text-slate-400 hover:text-white text-sm flex items-center gap-1 font-bold"><ArrowLeft size={14}/> رجوع للفئات</button>
        
        {!activeQ ? (
          <div className="bg-slate-800/80 p-10 rounded-[3rem] text-center border border-white/10 font-bold">
            <p className="text-xl text-yellow-500 mb-4">انتهت جميع أسئلة فئة [{activeQuizCat}]! 🏁</p>
            <button onClick={() => setActiveQuizCat(null)} className="text-sm underline text-white">رجوع للبطولة</button>
          </div>
        ) : (
          <div className="bg-slate-800/90 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <span className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-xl text-xs font-black text-yellow-500">فئة: {activeQuizCat}</span>
              <span className="bg-white/5 crystalline px-4 py-1 rounded-full text-xs font-mono text-white font-bold">{curQIdx + 1} / {filteredQuestions.length}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-center leading-relaxed mb-12 text-white italic">
              "{activeQ.question}"
            </h2>

            {revealAns && (
              <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl mb-8 animate-in zoom-in duration-300">
                <p className="text-center text-green-400 text-2xl font-black">{activeQ.answer}</p>
                <p className="text-[9px] text-center text-slate-500 mt-2 font-sans">بواسطة الكابتن: {activeQ.addedBy || 'مجهول'}</p>
              </div>
            )}

            <div className="space-y-4">
              <button 
                onClick={() => setRevealAns(true)} 
                className="w-full py-4 bg-white text-black rounded-2xl font-black text-base hover:bg-slate-200 shadow-xl transition-all"
              >
                كشف الإجابة القاطعة 👁️
              </button>
              <button 
                onClick={() => { setCurQIdx(prev => prev + 1); setRevealAns(false); }} 
                className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold text-sm text-white transition-all"
              >
                السؤال التالي ←
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // الشاشة الثانية: استعراض فئات الجرس التابعة للبطولة
  return (
    <div dir="rtl" className="max-w-4xl mx-auto py-8 px-4 font-sans text-white pb-32">
      <button onClick={() => setSelectedTourney(null)} className="mb-6 text-slate-400 hover:text-white text-sm flex items-center gap-1 font-bold bg-slate-800 px-4 py-2 rounded-xl w-fit"><ArrowLeft size={14}/> رجوع للبطولات الرئيسية</button>
      
      <div className="mb-10">
        <h2 className="text-4xl font-black text-yellow-500 italic">{tournamentsList[selectedTourney]}</h2>
        <p className="text-slate-500 text-xs font-bold mt-1">اختر فئة التحدي لبدء فقرة السرعة والجرس فوراً</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-r-4 border-yellow-500 pr-3 mb-6">
          <HelpCircle className="text-yellow-500" size={24} />
          <h3 className="text-xl font-black text-white">فئات الجرس المتاحة</h3>
        </div>
        
        {categories.length === 0 ? (
          <p className="text-slate-600 text-sm italic px-2">لا توجد فئات جرس مضافة حالياً في هذه البطولة على السيرفر المشترك...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(catName => (
              <button
                key={catName}
                onClick={() => startCategoryQuiz(catName)}
                className="bg-slate-800/40 hover:bg-slate-800/80 p-6 rounded-2xl border border-white/5 text-right flex justify-between items-center transition-all group"
              >
                <div>
                  <span className="font-black text-lg text-white block group-hover:text-yellow-400 transition-colors">{catName}</span>
                  <span className="text-xs text-slate-500 font-bold block mt-1">{allQuestions.filter(q => q.category === catName).length} سؤال جاهز للجلد</span>
                </div>
                <Play size={18} className="text-yellow-500 opacity-40 group-hover:opacity-100 transition-all" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}