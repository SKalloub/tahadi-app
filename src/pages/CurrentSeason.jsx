import React, { useState, useEffect } from 'react';
import { HelpCircle, ArrowLeft, Play, Trash2, FolderPlus, Upload } from 'lucide-react';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, where, writeBatch } from "firebase/firestore";
import { database } from '../App';

export default function CurrentSeason() {
  const [selectedLeague, setSelectedLeague] = useState(null); // الدوري المختار
  const [selectedCat, setSelectedCat] = useState(null);       // الفئة المختارة للعب أو الإدارة
  
  // نظام اللعب والكويز
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [curQIdx, setCurQIdx] = useState(0);
  const [revealAns, setRevealAns] = useState(false);

  // داتا الموسم الحالي لايف من السيرفر
  const [categories, setCategories] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  // Forms لعمليات الإضافة
  const [newCatName, setNewCatName] = useState('');
  const [quizForm, setQuizForm] = useState({ question: '', answer: '' });

  // الدوريات الثابتة للموسم الحالي 2026
  const currentSeasonLeagues = {
    ucl: 'دوري أبطال أوروبا',
    laliga: 'الدوري الإسباني',
    epl: 'الدوري الإنجليزي',
    seriea: 'الدوري الإيطالي',
    bundesliga: 'الدوري الألماني',
    ligue1: 'الدوري الفرنسي',
    uel: 'الدوري الأوروبي',
    uecl: 'دوري المؤتمرات',
    others: 'دوريات أخرى'
  };

  // تحميل الفئات والأسئلة الخاصة بالدوري المختار حياً من الـ Firestore
  useEffect(() => {
    if (selectedLeague) {
      setLoading(true);
      // جلب الأسئلة والكاتيغوريز الخاصة بهذا الدوري فقط
      const q = query(collection(database, "currentSeason"), where("league", "==", selectedLeague));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const questionsList = [];
        const catsSet = new Set();
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.type === 'question') {
            questionsList.push({ ...data, id: doc.id });
          } else if (data.type === 'category') {
            catsSet.add(data.name);
          }
        });
        
        setAllQuestions(questionsList);
        setCategories(Array.from(catsSet));
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setCategories([]);
      setAllQuestions([]);
      setSelectedCat(null);
      setIsQuizMode(false);
    }
  }, [selectedLeague]);

  // دالة استيراد الفئة والأسئلة من ملف الـ JSON المرفق
  const handleJsonImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        
        // التحقق من بنية الملف المرفق
        const categoryName = parsedData.categoryName || parsedData.category;
        const questionsArray = parsedData.questions;

        if (!categoryName || !Array.isArray(questionsArray)) {
          return alert('صيغة ملف الـ JSON غير متوافقة مع ملفات الفئات القديمة!');
        }

        if (questionsArray.length === 0) return alert('الملف لا يحتوي على أي أسئلة!');

        if (!window.confirm(`هل تريد استيراد فئة [${categoryName}] ورفع ${questionsArray.length} سؤال تابع لها إلى دوري [${currentSeasonLeagues[selectedLeague]}]؟`)) return;

        setImporting(true);
        const batch = writeBatch(database);
        const currentSeasonRef = collection(database, "currentSeason");

        // 1. إضافة وثيقة الفئة (Category) أولاً إذا لم تكن موجودة بالقائمة الحالية
        if (!categories.includes(categoryName)) {
          const newCatDocRef = doc(currentSeasonRef);
          batch.set(newCatDocRef, {
            type: 'category',
            name: categoryName,
            league: selectedLeague
          });
        }

        // 2. فك وحقن الأسئلة داخل الـ Batch
        questionsArray.forEach((item) => {
          const newQuestionDocRef = doc(currentSeasonRef);
          batch.set(newQuestionDocRef, {
            type: 'question',
            league: selectedLeague,
            category: categoryName, // ربط السؤال بالفئة المستوردة
            question: item.question || 'سؤال فارغ',
            answer: item.answer || 'لا توجد إجابة',
            timestamp: Date.now()
          });
        });

        // تنفيذ الرفع السحابي دفعة واحدة
        await batch.commit();
        alert(`تم استيراد فئة [${categoryName}] ورفع جميع الأسئلة بنجاح! 🎉`);
      } catch (error) {
        console.error("Import error:", error);
        alert('حدث خطأ أثناء معالجة الملف، تأكد من سلامة صيغة الـ JSON المرفوع.');
      } finally {
        setImporting(false);
        e.target.value = ''; // تصفير قيمة الـ input
      }
    };

    fileReader.readAsText(file);
  };

  // --- عمليات إدارة الفئات سحابياً ---
  const handleAddCategory = async () => {
    const name = newCatName.trim();
    if (!name || categories.includes(name)) return alert('اسم فئة غير صالح أو مكرر!');
    
    try {
      await addDoc(collection(database, "currentSeason"), {
        type: 'category',
        name: name,
        league: selectedLeague
      });
      setNewCatName('');
    } catch (e) {
      alert('خطأ في الاتصال بالسيرفر، لم تضاف الفئة!');
    }
  };

  const handleDeleteCategory = async (catName, e) => {
    e.stopPropagation(); 
    if (!window.confirm(`هل أنت متأكد من حذف فئة [${catName}] وكل أسئلتها نهائياً من الـ Cloud؟`)) return;
    
    try {
      allQuestions.filter(q => q.category === catName).forEach(async (question) => {
        await deleteDoc(doc(database, "currentSeason", question.id));
      });
      alert('تم إرسال طلب حذف الفئة ومحتوياتها للسيرفر! 🗑️');
    } catch (err) {
      console.error(err);
    }
  };

  // --- عمليات إدارة الأسئلة سحابياً ---
  const handleSaveQuestion = async () => {
    if (!quizForm.question || !quizForm.answer) return alert('أكمل السؤال والجواب أولاً!');
    
    try {
      await addDoc(collection(database, "currentSeason"), {
        type: 'question',
        league: selectedLeague,
        category: selectedCat,
        question: quizForm.question,
        answer: quizForm.answer,
        timestamp: Date.now()
      });
      setQuizForm({ question: '', answer: '' });
    } catch (e) {
      alert('فشل حفظ السؤال في السيرفر السحابي!');
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await deleteDoc(doc(database, "currentSeason", id));
    } catch (e) {
      alert('فشل الحذف من السيرفر!');
    }
  };

  // --- نظام تشغيل جولة اللعب ---
  const startQuiz = () => {
    const q = allQuestions.filter(q => q.category === selectedCat);
    if (q.length === 0) return alert('الفئة هادي ما فيها أسئلة، ضيف أسئلة من الفورم أولاً!');
    setFilteredQuestions([...q].sort(() => Math.random() - 0.5));
    setCurQIdx(0);
    setRevealAns(false);
    setIsQuizMode(true);
  };

  // ==========================================
  // الشاشة الرابعة: واجهة اللعب وكشف الإجابة (الكويز)
  // ==========================================
  if (selectedCat && isQuizMode) {
    const activeQ = filteredQuestions[curQIdx];
    return (
      <div dir="rtl" className="max-w-xl mx-auto mt-10 px-4 font-sans text-white">
        <button onClick={() => setIsQuizMode(false)} className="mb-4 text-slate-400 hover:text-white text-sm flex items-center gap-1 font-bold">
          <ArrowLeft size={14}/> إنهاء التحدي والرجوع للبنك
        </button>
        
        {!activeQ ? (
          <div className="bg-slate-800/80 p-10 rounded-[3rem] text-center border border-white/10 font-bold">
            <p className="text-xl text-yellow-500 mb-4">خلصت كل أسئلة فئة [{selectedCat}]! 🔥🏁</p>
            <button onClick={() => setIsQuizMode(false)} className="text-sm underline text-white">رجوع لإدارة الأسئلة</button>
          </div>
        ) : (
          <div className="bg-slate-800/90 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <span className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-xl text-xs font-black text-yellow-500">
                {selectedCat} 🔔
              </span>
              <span className="bg-white/5 px-4 py-1 rounded-full text-xs font-mono font-bold">
                {curQIdx + 1} / {filteredQuestions.length}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-center leading-relaxed mb-12 italic">
              "{activeQ.question}"
            </h2>

            {revealAns && (
              <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl mb-8 animate-in zoom-in">
                <p className="text-center text-green-400 text-2xl font-black">{activeQ.answer}</p>
              </div>
            )}

            <div className="space-y-4">
              <button 
                onClick={() => setRevealAns(true)} 
                className="w-full py-4 bg-white text-black rounded-2xl font-black text-base hover:bg-slate-200 shadow-xl"
              >
                كشف الإجابة النموذجية 👁️
              </button>
              <button 
                onClick={() => { setCurQIdx(prev => prev + 1); setRevealAns(false); }} 
                className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold text-sm"
              >
                السؤال التالي ←
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // الشاشة الثالثة: إدارة وحقن أسئلة فئة معينة وبدء تحديها
  // ==========================================
  if (selectedCat) {
    const currentCatQuestions = allQuestions.filter(q => q.category === selectedCat);
    return (
      <div dir="rtl" className="max-w-4xl mx-auto py-8 px-4 font-sans text-white pb-32">
        <button onClick={() => setSelectedCat(null)} className="mb-6 text-slate-400 hover:text-white text-sm flex items-center gap-1 font-bold bg-slate-800 px-4 py-2 rounded-xl">
          <ArrowLeft size={14}/> رجوع لقائمة الفئات
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-yellow-600/20 to-slate-800 p-6 rounded-[2rem] border border-yellow-500/20 mb-8">
          <div>
            <span className="text-xs text-yellow-400 font-bold block mb-1">{currentSeasonLeagues[selectedLeague]}</span>
            <h2 className="text-3xl font-black text-white">إدارة بنك فئة: <span className="text-yellow-400">[{selectedCat}]</span></h2>
          </div>
          <button onClick={startQuiz} className="bg-yellow-500 text-black px-8 py-4 rounded-2xl font-black text-base flex items-center gap-2 hover:bg-yellow-400 shadow-xl transition-all w-full md:w-auto justify-center">
            <Play size={20} fill="black" /> ابدأ فقرة الجرس الحالية 🔔
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-800/40 p-6 rounded-3xl border border-white/5 h-fit space-y-4">
            <h3 className="text-sm font-black text-slate-300 border-b border-white/5 pb-2">➕ حقن سؤال جرس سحابي</h3>
            <textarea 
              className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-white outline-none h-20 text-xs font-bold focus:border-yellow-500" 
              placeholder="اكتب السؤال هان..." 
              value={quizForm.question}
              onChange={e => setQuizForm({...quizForm, question: e.target.value})}
            />
            <input 
              className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-white outline-none text-xs font-black focus:border-yellow-500" 
              placeholder="الإجابة..." 
              value={quizForm.answer}
              onChange={e => setQuizForm({...quizForm, answer: e.target.value})}
            />
            <button onClick={handleSaveQuestion} className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-xl font-black text-xs text-white">
              حفظ وتخزين أونلاين 💾
            </button>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-black text-slate-400 px-1">الأسئلة المدرجة أونلاين ({currentCatQuestions.length}):</h3>
            {currentCatQuestions.length === 0 ? (
              <p className="text-slate-600 text-sm italic p-4 bg-slate-900/20 rounded-2xl border border-dashed border-white/5">لا توجد أسئلة مضافة في هذه الفئة بعد، أضف أول سؤال من الفورم الجانبي!</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {currentCatQuestions.map(q => (
                  <div key={q.id} className="bg-slate-950/60 p-4 rounded-xl flex justify-between items-center gap-4 border border-white/5 animate-in fade-in">
                    <span className="text-sm font-bold text-slate-200">
                      ❓ {q.question} <strong className="text-green-400 mr-2">({q.answer})</strong>
                    </span>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // الشاشة الثانية: داخل الدوري المختار
  // ==========================================
  if (selectedLeague) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto py-8 px-4 font-sans text-white pb-32">
        <button onClick={() => setSelectedLeague(null)} className="mb-6 text-slate-400 hover:text-white text-sm flex items-center gap-1 font-bold bg-slate-800 px-4 py-2 rounded-xl">
          <ArrowLeft size={14}/> رجوع للدوريات الكبرى
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-4xl font-black text-yellow-500 italic">{currentSeasonLeagues[selectedLeague]}</h2>
            <p className="text-slate-500 text-xs font-bold mt-1">أنشئ فئات الأسئلة الخاصة بهذا الدوري السحابي</p>
          </div>
          
          {/* زر استيراد ملف الـ JSON الذكي الخاص بالدوريات */}
          <label className={`flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-3 rounded-xl cursor-pointer border border-white/5 text-xs font-bold transition-all ${importing ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload size={16} className="text-yellow-500" />
            {importing ? 'جاري السحق والرفع السحابي...' : 'استيراد فئة كاملة بأسئلتها (JSON)'}
            <input type="file" accept=".json" onChange={handleJsonImport} className="hidden" />
          </label>
        </div>

        <div className="bg-slate-800/40 p-6 rounded-3xl border border-white/5 flex gap-2 items-center mb-8">
          <input 
            className="flex-1 bg-slate-900 border border-white/10 p-3 rounded-xl text-white outline-none text-sm font-bold focus:border-yellow-500" 
            placeholder="مثال: فئة انتقالات، مدربين، أرقام الموسم الحالي..." 
            value={newCatName} 
            onChange={e => setNewCatName(e.target.value)} 
          />
          <button onClick={handleAddCategory} className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-black text-xs flex items-center gap-1 hover:bg-yellow-400 transition-colors">
            <FolderPlus size={16}/> إضافة فئة
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-r-4 border-yellow-500 pr-3 mb-4">
            <HelpCircle className="text-yellow-500" size={20} />
            <h3 className="text-lg font-black text-white">فئات التحدي الحالية في الدوري</h3>
          </div>

          {loading ? (
            <p className="text-slate-400 text-sm animate-pulse">جاري تحديث الفئات لايف...</p>
          ) : categories.length === 0 ? (
            <p className="text-slate-600 text-sm italic px-2">لا توجد فئات مضافة لهذا الدوري بعد، اكتب اسم فئة بالأعلى أو ارفع ملف JSON!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map(catName => {
                const count = allQuestions.filter(q => q.category === catName).length;
                return (
                  <button
                    key={catName}
                    onClick={() => setSelectedCat(catName)}
                    className="bg-slate-800/30 hover:bg-slate-800/70 p-6 rounded-2xl border border-white/5 text-right flex justify-between items-center transition-all group shadow-md"
                  >
                    <div>
                      <span className="font-black text-lg text-white block group-hover:text-yellow-400 transition-colors">{catName}</span>
                      <span className="text-xs text-slate-500 font-bold block mt-1">{count} سؤال بالداخل</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play size={14} className="text-yellow-500 opacity-40 group-hover:opacity-100 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // الشاشة الأولى: استعراض الـ 9 دوريات الرئيسية للموسم الحالي
  // ==========================================
  return (
    <div dir="rtl" className="max-w-6xl mx-auto py-8 px-4 font-sans text-white pb-32">
      <div className="text-center mb-12 space-y-3">
        <h1 className="text-5xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">
          ✨ جرس وإدارة الموسم الحالي 2026 ✨
        </h1>
        <p className="text-slate-400 text-sm font-bold">كل دوري مستقل بالكامل؛ صمّم فئاته، احقن أسئلته، واجلد بالسرعة في نفس المكان</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {Object.entries(currentSeasonLeagues).map(([key, name]) => (
          <button
            key={key}
            onClick={() => setSelectedLeague(key)}
            className="bg-slate-800/30 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 hover:border-yellow-500/40 hover:bg-slate-800/70 transition-all hover:-translate-y-1 text-right shadow-xl flex flex-col justify-between h-36 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 bg-yellow-500/5 w-16 h-16 rounded-br-[3rem] group-hover:bg-yellow-500/10 transition-all"></div>
            <span className="text-xl font-black text-white leading-tight block group-hover:text-yellow-400 transition-colors z-10">{name}</span>
            <span className="text-[11px] text-slate-500 font-bold tracking-wider group-hover:text-slate-300 transition-colors">دخول للإدارة واللعب ←</span>
          </button>
        ))}
      </div>
    </div>
  );
}