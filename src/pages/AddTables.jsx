import React, { useState, useEffect } from 'react';
import { LayoutGrid, Trash2, HelpCircle, ArrowRight, FolderPlus, Save } from 'lucide-react';
import { getStorageData, saveStorageData } from '../lib/storage';

export default function AddTables() {
  const [selectedTourney, setSelectedTourney] = useState(null);

  const tournamentsList = {
    ucl: 'دوري أبطال أوروبا', cwc: 'كأس العالم للأندية', facup: 'كأس إنجلترا',
    copadelrey: 'كأس إسبانيا', coppaitalia: 'كأس إيطاليا', dfbpokal: 'كأس ألمانيا',
    cdf: 'كأس فرنسا', seriea: 'الدوري الإيطالي', laliga: 'الدوري الإسباني',
    epl: 'الدوري الإنجليزي', ligue1: 'الدوري الفرنسي', bundesliga: 'الدوري الألماني',
    eredivisie: 'الدوري الهولندي', wc: 'كأس العالم', euro: 'اليورو',
    coba: 'كوبا أمريكا', uel: 'الدوري الأوروبي', uecl: 'دوري المؤتمرات',
    cwc_old: 'كأس الكؤوس الأوروبية', others: 'دوريات أخرى'
  };

  // --- States لفئات وأسئلة الجرس ---
  const [newCatName, setNewCatName] = useState('');
  const [savedCats, setSavedCats] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [quizForm, setQuizForm] = useState({ question: '', answer: '' });
  const [savedQuestions, setSavedQuestions] = useState([]);

  useEffect(() => {
    if (selectedTourney) {
      const cats = getStorageData(`t_cats_${selectedTourney}`, []);
      setSavedCats(cats);
      if (cats.length > 0) setSelectedCat(cats[0]);
      setSavedQuestions(getStorageData(`t_questions_${selectedTourney}`, []));
    }
  }, [selectedTourney]);

  // إنشاء فئة جرس جديدة
  const addCategory = () => {
    const name = newCatName.trim();
    if (!name || savedCats.includes(name)) return alert('اسم فئة غير صالح أو مكرر');
    const updated = [...savedCats, name];
    saveStorageData(`t_cats_${selectedTourney}`, updated);
    setSavedCats(updated);
    setSelectedCat(name);
    setNewCatName('');
  };

  // حذف فئة جرس بكل أسئلتها
  const deleteCategory = (catName) => {
    if (!window.confirm(`هل أنت متأكد من حذف فئة [${catName}] وجميع الأسئلة التابعة لها؟`)) return;
    const updatedCats = savedCats.filter(c => c !== catName);
    const updatedQs = savedQuestions.filter(q => q.category !== catName);
    
    saveStorageData(`t_cats_${selectedTourney}`, updatedCats);
    saveStorageData(`t_questions_${selectedTourney}`, updatedQs);
    
    setSavedCats(updatedCats);
    setSavedQuestions(updatedQs);
    if (selectedCat === catName) setSelectedCat(updatedCats[0] || '');
  };

  // حفظ سؤال داخل الفئة المختارة
  const saveQuestion = () => {
    if (!selectedCat) return alert('أنشئ فئة جرس واخترها أولاً!');
    if (!quizForm.question || !quizForm.answer) return alert('اكتب السؤال والجواب!');
    const newQ = { id: Date.now(), category: selectedCat, ...quizForm };
    const updated = [...savedQuestions, newQ];
    saveStorageData(`t_questions_${selectedTourney}`, updated);
    setSavedQuestions(updated);
    setQuizForm({ question: '', answer: '' });
    alert('تم حفظ سؤال الجرس بنجاح! ⚡');
  };

  const deleteQuestion = (id) => {
    const updated = savedQuestions.filter(q => q.id !== id);
    saveStorageData(`t_questions_${selectedTourney}`, updated);
    setSavedQuestions(updated);
  };

  if (!selectedTourney) {
    return (
      <div dir="rtl" className="max-w-5xl mx-auto py-8 px-4 font-sans text-white">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center gap-3">
            <LayoutGrid size={36} /> إدارة فئات جرس البطولات 🔔
          </h2>
          <p className="text-slate-400 font-bold text-sm">اختر البطولة لحقن وإدارة فئات الأسئلة الخاصة بها</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(tournamentsList).map(([key, name]) => (
            <button key={key} onClick={() => setSelectedTourney(key)} className="bg-slate-800/60 hover:bg-slate-700/80 p-6 rounded-3xl border border-white/5 hover:border-yellow-500/40 transition-all text-center font-black text-sm group">
              <span className="group-hover:text-yellow-400 transition-colors block">{name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-4xl mx-auto py-8 px-4 font-sans text-white pb-32">
      <div className="flex justify-between items-center bg-yellow-500/10 p-6 rounded-[2rem] border border-yellow-500/20 mb-8">
        <div>
          <h3 className="text-2xl font-black text-yellow-400">بنك جرس بطولة: {tournamentsList[selectedTourney]}</h3>
        </div>
        <button onClick={() => setSelectedTourney(null)} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm font-bold bg-slate-800 px-4 py-2 rounded-xl">
          <ArrowRight size={16} /> رجوع للبطولات
        </button>
      </div>

      <div className="space-y-8 animate-in fade-in">
        {/* إضافة فئة جديدة */}
        <div className="bg-slate-800/40 p-6 rounded-3xl border border-white/5 flex gap-2 items-center">
          <input className="flex-1 bg-slate-900 border border-white/10 p-3 rounded-xl text-white outline-none text-sm font-bold" placeholder="إضافة فئة أسئلة جديدة (مثال: مدربين، هدافو النهائيات، ملاعب)..." value={newCatName} onChange={e => setNewCatName(e.target.value)} />
          <button onClick={addCategory} className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-black text-xs flex items-center gap-1"><FolderPlus size={16}/> إنشاء الفئة</button>
        </div>

        {savedCats.length > 0 ? (
          <div className="bg-slate-800/40 p-6 rounded-[2.5rem] border border-white/5 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">الفئة المستهدفة حالياً للحقن:</span>
              <select className="bg-slate-900 border border-white/10 p-2.5 rounded-xl text-yellow-500 text-xs font-black outline-none" value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
                {savedCats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <textarea className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-white outline-none h-20 focus:border-yellow-500 text-sm font-bold" placeholder="اكتب سؤال الجرس هنا..." value={quizForm.question} onChange={e => setQuizForm({...quizForm, question: e.target.value})} />
            <input className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-yellow-500 text-sm font-black" placeholder="الإجابة النموذجية..." value={quizForm.answer} onChange={e => setQuizForm({...quizForm, answer: e.target.value})} />
            <button onClick={saveQuestion} className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black text-sm hover:bg-yellow-400 shadow-lg">حفظ السؤال داخل فئة [{selectedCat}] 💾</button>
          </div>
        ) : (
          <div className="text-center p-8 bg-slate-900/40 rounded-2xl border border-dashed border-white/10 text-slate-500 font-bold text-sm">
            قم بإنشاء فئة أسئلة أولاً لتبدأ بإضافة أسئلة الجرس!
          </div>
        )}

        {/* عرض الفئات الحالية وأسئلتها */}
        {savedCats.length > 0 && (
          <div className="space-y-6">
            <h4 className="text-slate-400 text-xs font-black px-2 uppercase tracking-wider">الفئات المسجلة حالياً وأسئلتها:</h4>
            <div className="space-y-4">
              {savedCats.map(cat => (
                <div key={cat} className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-sm font-black text-yellow-500">📁 فئة: {cat}</span>
                    <button onClick={() => deleteCategory(cat)} className="text-xs text-red-400 hover:text-red-500 bg-red-500/10 px-2 py-1 rounded-lg">حذف الفئة بالكامل 🗑️</button>
                  </div>
                  <div className="space-y-1.5">
                    {savedQuestions.filter(q => q.category === cat).length === 0 ? (
                      <p className="text-slate-600 text-xs italic p-2">لا توجد أسئلة في هذه الفئة بعد...</p>
                    ) : (
                      savedQuestions.filter(q => q.category === cat).map(q => (
                        <div key={q.id} className="bg-slate-900/40 p-2.5 rounded-xl flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-bold">❓ {q.question} <strong className="text-green-400 mr-2">({q.answer})</strong></span>
                          <button onClick={() => deleteQuestion(q.id)} className="text-slate-600 hover:text-red-400 px-1"><Trash2 size={14}/></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}