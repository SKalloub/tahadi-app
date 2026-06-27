import React, { useState, useEffect } from 'react';
import { HelpCircle, LayoutGrid, Play, Trash2, ArrowLeft, Folder } from 'lucide-react';
import { collection, onSnapshot, query, deleteDoc, doc } from "firebase/firestore";
import { database } from '../App';
import { useNavigate } from 'react-router-dom';

export default function QuizBell() {
  const navigate = useNavigate();
  const [allQuestions, setAllQuestions] = useState([]);
  
  // نظام الفولدرات والفئات
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null); // الفولدر المختار حالياً
  const [categories, setCategories] = useState([]);           // الفئات التابعة للفولدر المختار
  const [selectedCategory, setSelectedCategory] = useState(null); // الفئة النشطة باللعبة (الاسم الكامل بالـ DB)

  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedName = (localStorage.getItem('admin_name') || '').trim().toLowerCase();
    
    const isHarak = storedName === "harak" || storedName.includes("حراك") || storedName.includes("أحمد حراك");
    const isKarim = storedName === "karim" || storedName.includes("كريم");
    const isRegularUser = isHarak || isKarim;

    const q = query(collection(database, "bellQuestions"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questionsList = [];
      const foldersSet = new Set();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const docAddedBy = (data.addedBy || "").trim().toLowerCase();
        
        // قراءة الفئة الخام من الداتابيز
        const rawCategory = data.category || 'عام';

        // الفصل السحري بناءً على الـ " // " المعتمد بصفحة الإضافة
        let currentFolder = 'عام';
        if (rawCategory.includes(' // ')) {
          currentFolder = rawCategory.split(' // ')[0];
        }

        let shouldInclude = !isRegularUser; 
        
        if (isHarak && (docAddedBy === "harak" || docAddedBy.includes("حراك"))) {
          shouldInclude = true;
        }
        if (isKarim && (docAddedBy === "karim" || docAddedBy.includes("كريم"))) {
          shouldInclude = true;
        }

        if (shouldInclude) {
          questionsList.push({ 
            ...data, 
            id: doc.id, 
            category: rawCategory, // بنحتفظ بالاسم الكامل للفلترة لاحقاً
            folder: currentFolder   // المجلد المستخلص
          });
          foldersSet.add(currentFolder);
        }
      });

      setAllQuestions(questionsList);
      // تحويل لـ Array وإضافة خيار "الكل" في بداية لستة المجلدات
      setFolders(['الكل', ...Array.from(foldersSet)]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // تحديث الفئات المتاحة بناءً على الفولدر المختار
  useEffect(() => {
    if (selectedFolder) {
      const catsSet = new Set();
      allQuestions.forEach(q => {
        if (selectedFolder === "الكل" || q.folder === selectedFolder) {
          catsSet.add(q.category);
        }
      });
      setCategories(Array.from(catsSet));
    } else {
      setCategories([]);
    }
  }, [allQuestions, selectedFolder]);

  // حماية في حال مسح الفئة لايف من الأدمن
  useEffect(() => {
    if (selectedCategory) {
      const filtered = allQuestions.filter(q => 
        q.category === selectedCategory && 
        (selectedFolder === "الكل" || q.folder === selectedFolder)
      );
      if (filtered.length === 0) {
        setSelectedCategory(null);
      }
    }
  }, [allQuestions, selectedCategory, selectedFolder]);

  const startQuiz = (cat) => {
    const filtered = allQuestions.filter(q => 
      q.category === cat && 
      (selectedFolder === "الكل" || q.folder === selectedFolder)
    );
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

  // الشاشة الأولى: اختيار الفولدر (Folder)
  if (!selectedFolder) {
    return (
      <div dir="rtl" className="max-w-2xl mx-auto mt-10 p-6 font-sans">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-slate-400 text-xs flex items-center gap-1 hover:text-white bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5"><ArrowLeft size={14}/> رجوع للهوم</button>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 italic">مجلدات الجرس 🔔</h2>
        </div>

        {allQuestions.length === 0 ? (
          <p className="text-slate-500 text-center italic">لا توجد أسئلة أو مجلدات جرس مرفوعة حالياً...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {folders.map(fld => {
              const count = allQuestions.filter(q => fld === "الكل" || q.folder === fld).length;
              return (
                <button key={fld} onClick={() => setSelectedFolder(fld)} className="bg-slate-900/60 hover:bg-slate-900 p-6 rounded-3xl border border-white/5 text-right group flex justify-between items-center transition-all shadow-lg hover:-translate-y-1">
                  <Folder className="text-yellow-500 opacity-60 group-hover:opacity-100 transition-all" size={24}/>
                  <div className="text-right">
                    <span className="text-lg font-black text-white block group-hover:text-yellow-400 transition-colors">{fld}</span>
                    <span className="text-xs text-slate-400 font-bold block mt-1">{count} سؤال متوفر</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // الشاشة الثانية: اختيار الكاتيغوري (Category) داخل الفولدر المختار
  if (!selectedCategory) {
    return (
      <div dir="rtl" className="max-w-2xl mx-auto mt-10 p-6 font-sans">
        <div className="flex justify-between items-center mb-8 bg-slate-900 p-4 rounded-2xl border border-white/5">
          <button onClick={() => setSelectedFolder(null)} className="text-slate-400 text-xs flex items-center gap-1 hover:text-white"><ArrowLeft size={14}/> رجوع للمجلدات</button>
          <div className="text-yellow-500 font-black text-sm">المجلد: {selectedFolder}</div>
        </div>

        <h3 className="text-xl font-black mb-6 text-white text-right flex items-center gap-2">
          <LayoutGrid size={20} className="text-yellow-500" /> اختار الفئة وبلش جلد 🔥
        </h3>

        {categories.length === 0 ? (
          <p className="text-slate-500 text-center italic">لا توجد فئات داخل هذا المجلد...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => {
              const count = allQuestions.filter(q => q.category === cat && (selectedFolder === "الكل" || q.folder === selectedFolder)).length;
              // عرض الاسم النظيف للفئة بدون اسم المجلد والـ " // " لترتيب المظهر بالفرونت إند
              const cleanCatName = cat.includes(' // ') ? cat.split(' // ')[1] : cat;

              return (
                <button key={cat} onClick={() => startQuiz(cat)} className="bg-slate-800/40 hover:bg-slate-700/60 p-6 rounded-3xl border border-white/5 text-right group flex justify-between items-center transition-all shadow-lg">
                  <Play className="text-yellow-500 opacity-40 group-hover:opacity-100 transition-all" size={20}/>
                  <div className="text-right">
                    <span className="text-xl font-bold text-white block group-hover:text-yellow-400 transition-colors">{cleanCatName}</span>
                    <span className="text-xs text-slate-400 font-bold block mt-1">{count} سؤال جاهز</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // الشاشة الثالثة: اللعب وعرض الأسئلة بداخل الفئة
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