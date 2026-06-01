import React, { useState, useEffect, useRef } from 'react';
import { 
  UserPlus, MessageSquare, Plus, FolderPlus, 
  ArrowRight, Trash2, Download, Upload 
} from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, writeBatch, getDocs, where } from "firebase/firestore";
import { database } from '../App';

export default function AddData() {
  const [activeTab, setActiveTab] = useState('player');
  const globalFileRef = useRef(null);
  const playerFileRef = useRef(null);   // ريفرنس لملف استيراد اللاعبين
  const categoryFileRef = useRef(null); // ريفرنس لملف الفئة المنفردة
  
  // جلب اسم المسؤول الحالي من السشن
  const currentAdmin = localStorage.getItem('admin_name') || 'مجهول';

  // --- States ---
  const [playerForm, setPlayerForm] = useState({ name: '', status: 'معتزل', clubs: [''] });
  const [allPlayers, setAllPlayers] = useState([]);
  const [bellForm, setBellForm] = useState({ question: '', answer: '' });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('الكل'); // فلتر المجلدات بالواجهة
  const [newCategoryFolder, setNewCategoryFolder] = useState(''); // لتحديد مجلد عند إنشاء فئة جديدة
  const [allBellQuestions, setAllBellQuestions] = useState([]);
  const [categoryQuestions, setCategoryQuestions] = useState([]);
  const [importingPlayers, setImportingPlayers] = useState(false); // حالة رفع اللاعبين
  const [importingCat, setImportingCat] = useState(false);         // حالة رفع فئة منفردة

  // --- Real-time Listeners (Firebase) ---
  useEffect(() => {
    // 1. استماع حي للاعبين
    const qPlayers = query(collection(database, "players"));
    const unsubscribePlayers = onSnapshot(qPlayers, (snapshot) => {
      const playersList = [];
      snapshot.forEach((doc) => playersList.push({ ...doc.data(), id: doc.id }));
      setAllPlayers(playersList);
    });

    // 2. استماع حي لأسئلة الجرس العام والفئات
    const qBell = query(collection(database, "bellQuestions"));
    const unsubscribeBell = onSnapshot(qBell, (snapshot) => {
      const bellList = [];
      const catsSet = new Set(['عام']);
      snapshot.forEach((doc) => {
        const data = doc.data();
        bellList.push({ ...data, id: doc.id });
        if (data.category) catsSet.add(data.category);
      });
      setAllBellQuestions(bellList);
      setCategories(Array.from(catsSet));
    });

    return () => {
      unsubscribePlayers();
      unsubscribeBell();
    };
  }, []);

  // تحديث أسئلة الفئة المحددة عند تغيير الفئة أو قائمة الأسئلة الكاملة
  useEffect(() => {
    if (selectedCategory) {
      setCategoryQuestions(allBellQuestions.filter(q => q.category === selectedCategory));
    }
  }, [selectedCategory, allBellQuestions]);

  // --- Helper: Download JSON ---
  const downloadJSON = (data, fileName) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- 1. Global Backup (Firebase Cloud to JSON File) ---
  const exportAll = () => {
    const backup = {
      players: allPlayers,
      bellQuestions: allBellQuestions,
      quizCategories: categories
    };
    downloadJSON(backup, 'full_backup');
  };

  const importAll = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const batch = writeBatch(database);
        
        if (data.players && Array.isArray(data.players)) {
          data.players.forEach(p => {
            const docRef = doc(collection(database, "players"));
            batch.set(docRef, { name: p.name, status: p.status, clubs: p.clubs, addedBy: p.addedBy || currentAdmin });
          });
        }
        if (data.bellQuestions && Array.isArray(data.bellQuestions)) {
          data.bellQuestions.forEach(q => {
            const docRef = doc(collection(database, "bellQuestions"));
            batch.set(docRef, { question: q.question, answer: q.answer, category: q.category || 'عام', addedBy: q.addedBy || currentAdmin });
          });
        }
        await batch.commit();
        alert('تم رفع واستيراد الكل إلى السيرفر بنجاح!');
      } catch (err) { alert('الملف غير صالح أو حدث خطأ أثناء الرفع لمستودع البيانات!'); }
    };
    reader.readAsText(file);
  };

  // --- خاصية استيراد قائمة لاعبين (التعويض) من ملف JSON ---
  const handlePlayersImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        const playersArray = Array.isArray(parsedData) ? parsedData : (parsedData.players || parsedData.data);

        if (!Array.isArray(playersArray)) {
          return alert('صيغة ملف اللاعبين غير صحيحة! يجب أن يكون الملف عبارة عن مصفوفة لاعبين.');
        }

        if (playersArray.length === 0) return alert('الملف المرفوع فارغ!');

        if (!window.confirm(`هل تريد استيراد وحقن قائمة تحتوي على ${playersArray.length} لاعب إلى سيرفر التعويض لايف؟`)) return;

        setImportingPlayers(true);
        const batch = writeBatch(database);
        const playersCollectionRef = collection(database, "players");

        playersArray.forEach((p) => {
          const newDocRef = doc(playersCollectionRef);
          let clubsList = [''];
          if (Array.isArray(p.clubs)) {
            clubsList = p.clubs;
          } else if (typeof p.sub === 'string') {
            clubsList = p.sub.split('←').map(c => c.trim());
          } else if (typeof p.clubs === 'string') {
            clubsList = p.clubs.split(',').map(c => c.trim());
          }

          batch.set(newDocRef, {
            name: p.name || p.playerName || 'لاعب مجهول',
            status: p.status || 'معتزل',
            clubs: clubsList.filter(c => c),
            addedBy: p.addedBy || currentAdmin,
            timestamp: Date.now()
          });
        });

        await batch.commit();
        alert(`تم سحق البيانات واستيراد ${playersArray.length} لاعب بنجاح! ⚽🔥`);
      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء معالجة ملف اللاعبين، تأكد من سلامة كود الـ JSON.');
      } finally {
        setImportingPlayers(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // --- خاصية استيراد فئة منفردة قديمة مع أسئلتها ---
  const handleSingleCategoryImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        const catName = parsedData.categoryName || parsedData.category;
        const questionsArray = parsedData.questions;

        if (!catName || !Array.isArray(questionsArray)) {
          return alert('صيغة الملف غير مدعومة! تأكد أن الملف يحتوي على اسم الفئة ومصفوفة الأسئلة المتوافقة.');
        }

        if (questionsArray.length === 0) return alert('هذه الفئة فارغة ولا تحتوي على أسئلة!');

        if (!window.confirm(`هل أنت متأكد من استيراد فئة [${catName}] وحقن ${questionsArray.length} سؤال على السيرفر المشترك؟`)) return;

        setImportingCat(true);
        const batch = writeBatch(database);
        const bellCollectionRef = collection(database, "bellQuestions");

        questionsArray.forEach((item) => {
          const newDocRef = doc(bellCollectionRef);
          batch.set(newDocRef, {
            question: item.question || 'سؤال فارغ',
            answer: item.answer || 'لا توجد إجابة',
            category: catName,
            addedBy: currentAdmin,
            timestamp: Date.now()
          });
        });

        await batch.commit();
        alert(`تم استيراد فئة [${catName}] بنجاح وحقن جميع الأسئلة أونلاين! 🎉`);
      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء قراءة أو رفع ملف الفئة، تأكد من سلامة صيغة الـ JSON.');
      } finally {
        setImportingCat(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // --- 2. Players Handlers ---
  const savePlayer = async () => {
    if (!playerForm.name || playerForm.clubs[0] === '') return alert('عبّي البيانات!');
    try {
      await addDoc(collection(database, "players"), {
        name: playerForm.name.trim(),
        status: playerForm.status,
        clubs: playerForm.clubs.filter(c => c.trim()),
        addedBy: currentAdmin
      });
      setPlayerForm({ name: '', status: 'معتزل', clubs: [''] });
    } catch (e) { alert("خطأ في الاتصال بقاعدة البيانات!"); }
  };

  const deletePlayer = async (id) => {
    if (!window.confirm('حذف هذا اللاعب نهائياً من الجميع؟')) return;
    try {
      await deleteDoc(doc(database, "players", id));
    } catch (e) { alert("فشل الحذف!"); }
  };

  // --- 3. Bell Questions & Categories Handlers ---
const addCategory = () => {
    const name = newCategoryName.trim();
    const folder = newCategoryFolder.trim() || 'عام';
    
    if (!name) return alert('اسم الفئة غير صالح');
    
    // تركيب الاسم المدمج: المجلد // اسم الفئة
    const fullCatName = `${folder} // ${name}`;
    
    if (categories.includes(fullCatName) || categories.includes(name)) {
      return alert('هذه الفئة موجودة مسبقاً');
    }
    
    setCategories([...categories, fullCatName]);
    setNewCategoryName('');
    setNewCategoryFolder('');
  };

  // دالة حذف الفئة بشكل كامل مع خيار مسح أسئلتها بالـ Cloud
 const deleteCategory = async (catName, e) => {
    e.stopPropagation(); // منع فتح الفئة عند الضغط على زر الحذف
    
    // جلب الأسئلة المتعلقة بالفئة لمعرفة كم سؤال سيتم مسحه
    const relatedQuestions = allBellQuestions.filter(q => q.category === catName);
    
    const confirmMessage = relatedQuestions.length > 0 
      ? `هل أنت متأكد من حذف فئة [${catName}] بالكامل؟\nتنبيه: تحتوي هذه الفئة على (${relatedQuestions.length}) سؤال وسيتم حذفهم جميعاً لايف من السيرفر!`
      : `هل تريد حذف الفئة الفارغة [${catName}] نهائياً؟`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const batch = writeBatch(database);
      
      // 1. استخدام batch.delete الصحيح لكل سؤال تابع للفئة
      relatedQuestions.forEach((q) => {
        const questionDocRef = doc(database, "bellQuestions", q.id);
        batch.delete(questionDocRef); // التعديل الصحيح هون باستخدام .delete() وليس .set(..., null)
      });

      // 2. تنفيذ العملية دفعة واحدة على السيرفر
      await batch.commit();

      // 3. تحديث الستيت المحلي لإزالة اسم الفئة من الواجهة
      setCategories(categories.filter(c => c !== catName));
      
      alert(`تم سحق فئة [${catName}] وحذف جميع أسئلتها أونلاين بنجاح! 🗑️💥`);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء محاولة حذف الفئة لايف!");
    }
  };

const saveQuestion = async () => {
    if (!bellForm.question.trim() || !bellForm.answer.trim()) {
      return alert('الرجاء كتابة السؤال والإجابة أولاً!');
    }

    try {
      await addDoc(collection(database, "bellQuestions"), {
        question: bellForm.question.trim(),
        answer: bellForm.answer.trim(),
        category: selectedCategory, // ستحمل القيمة المدمجة تلقائياً مثل "المدربين // أين يدرب حالياً؟"
        addedBy: currentAdmin,
        timestamp: Date.now()
      });

      // تفريغ الحقول بعد الحفظ بنجاح
      setBellForm({ question: '', answer: '' });
    } catch (e) {
      console.error(e);
      alert("خطأ في الاتصال بقاعدة البيانات أثناء حفظ السؤال!");
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('حذف هذا السؤال؟')) return;
    try {
      await deleteDoc(doc(database, "bellQuestions", id));
    } catch (e) { alert("فشل الحذف!"); }
  };

  return (
    <div dir="rtl" className="max-w-2xl mx-auto py-8 px-4 pb-20 font-sans">
      {/* GLOBAL HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-white italic tracking-tighter">إدارة البيانات اللايف 🌐</h1>
        <div className="flex gap-2 bg-slate-800 p-1.5 rounded-2xl border border-white/5 shadow-lg">
          <input type="file" ref={globalFileRef} onChange={importAll} className="hidden" accept=".json" />
          <button onClick={() => globalFileRef.current.click()} className="p-2.5 text-slate-400 hover:text-white transition-colors" title="استيراد شامل للسيرفر">
            <Upload size={20} />
          </button>
          <button onClick={exportAll} className="p-2.5 text-slate-400 hover:text-white transition-colors border-r border-white/10" title="تصدير شامل">
            <Download size={20} />
          </button>
        </div>
      </div>

      <nav className="flex bg-slate-800 p-2 rounded-2xl mb-8 shadow-inner">
        <TabButton active={activeTab === 'player'} onClick={() => setActiveTab('player')} icon={<UserPlus size={18}/>} label="التعويض" activeColor="bg-green-600" />
        <TabButton active={activeTab === 'bell'} onClick={() => setActiveTab('bell')} icon={<MessageSquare size={18}/>} label="الجرس العام" activeColor="bg-yellow-500 text-black" />
      </nav>

      {activeTab === 'player' ? (
        <section className="space-y-10 animate-in fade-in duration-500">
          <div className="flex justify-center bg-slate-800/20 p-4 rounded-2xl border border-white/5">
            <label className={`flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl cursor-pointer border border-white/5 text-xs font-bold transition-all ${importingPlayers ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload size={16} className="text-green-500" />
              {importingPlayers ? 'جاري حقن داتا اللاعبين سحابياً...' : 'استيراد قائمة لاعبين تعويض (JSON)'}
              <input type="file" ref={playerFileRef} onChange={handlePlayersImport} className="hidden" accept=".json" />
            </label>
          </div>

          <div className="space-y-6 bg-slate-800/40 p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-green-500 tracking-widest uppercase">إضافة لاعب جديد</span>
            </div>
            
            <input className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-green-500 text-right" placeholder="اسم اللاعب" value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} />
            
            <select className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-white outline-none text-right" value={playerForm.status} onChange={e => setPlayerForm({...playerForm, status: e.target.value})}>
              <option>معتزل</option><option>حالي</option><option>مدرب</option>
            </select>

            <div className="space-y-3">
              {playerForm.clubs.map((club, idx) => (
                <input key={idx} className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-white outline-none text-right" placeholder={`النادي رقم ${idx + 1}`} value={club} onChange={e => {
                  const newClubs = [...playerForm.clubs];
                  newClubs[idx] = e.target.value;
                  setPlayerForm({...playerForm, clubs: newClubs});
                }} />
              ))}
              <button onClick={() => setPlayerForm({...playerForm, clubs: [...playerForm.clubs, '']})} className="text-green-400 font-bold p-2 hover:bg-green-400/10 rounded-lg flex items-center gap-1 text-sm">
                <Plus size={14}/> نادٍ آخر
              </button>
            </div>
            <button onClick={savePlayer} className="w-full bg-green-600 py-5 rounded-2xl font-black text-xl text-white hover:bg-green-500 transition-all shadow-lg">حفظ اللاعب</button>
          </div>

          <div className="space-y-4">
            <h3 className="text-white/50 text-xs font-black px-2 uppercase tracking-widest text-right">قائمة اللاعبين (مشتركة لايف - {allPlayers.length})</h3>
            <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-1">
              {allPlayers.map(p => (
                <ListItem key={p.id} title={p.name} sub={`${p.clubs.join(' ← ')}`} addedBy={p.addedBy} onDelete={() => deletePlayer(p.id)} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          {!selectedCategory ? (
            <div className="space-y-6">
              <div className="flex justify-center bg-slate-800/20 p-4 rounded-2xl border border-white/5">
                <label className={`flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl cursor-pointer border border-white/5 text-xs font-bold transition-all ${importingCat ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Upload size={16} className="text-yellow-500" />
                  {importingCat ? 'جاري الرفع والسحق السحابي...' : 'استيراد فئة جرس منفردة (JSON)'}
                  <input type="file" ref={categoryFileRef} onChange={handleSingleCategoryImport} className="hidden" accept=".json" />
                </label>
              </div>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-2" dir="rtl">
                {['الكل', ...Array.from(new Set(categories.map(c => c.includes(' // ') ? c.split(' // ')[0] : 'عام')))].map(folder => (
                  <button
                    key={folder}
                    onClick={() => setSelectedFolder(folder)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedFolder === folder ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  >
                    📁 {folder}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {categories
                  .filter(cat => {
                    if (selectedFolder === 'الكل') return true;
                    const catFolder = cat.includes(' // ') ? cat.split(' // ')[0] : 'عام';
                    return catFolder === selectedFolder;
                  })
                  .map(cat => {
                    // فصل اسم المجلد عن اسم الفئة الحقيقي للعرض النظيف
                    const hasFolder = cat.includes(' // ');
                    const displayFolder = hasFolder ? cat.split(' // ')[0] : 'عام';
                    const displayName = hasFolder ? cat.split(' // ')[1] : cat;

                    return (
                      <CategoryCard 
                        key={cat} 
                        name={displayName} 
                        folderName={displayFolder}
                        onClick={() => setSelectedCategory(cat)} 
                        onDelete={(e) => deleteCategory(cat, e)}
                        isDeletable={cat !== 'عام'} 
                      />
                    );
                  })}
                
                {/* كارت إضافة فئة جديدة معدل لدعم المجلدات */}
                <div className="bg-slate-900/40 p-4 rounded-3xl border border-dashed border-white/20 flex flex-col gap-2">
                  <input className="bg-transparent text-xs text-white outline-none p-2 border-b border-white/10 text-right" placeholder="اسم المجلد (مثال: المدربين)..." value={newCategoryFolder} onChange={e => setNewCategoryFolder(e.target.value)} />
                  <input className="bg-transparent text-xs text-white outline-none p-2 border-b border-white/10 text-right" placeholder="فئة جديدة..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                  <button onClick={addCategory} className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded-xl flex items-center justify-center gap-1"><FolderPlus size={14}/> إضافة فئة</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20">
                <button onClick={() => setSelectedCategory(null)} className="text-slate-400 text-xs flex items-center gap-1 hover:text-white"><ArrowRight size={14}/> رجوع لقائمة الفئات</button>
                <div className="flex items-center gap-3">
                  {selectedCategory !== 'عام' && (
                    <button 
                      onClick={(e) => {
                        deleteCategory(selectedCategory, e);
                        setSelectedCategory(null);
                      }} 
                      className="text-red-400 hover:text-red-500 flex items-center gap-1 text-xs bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/10 transition-colors"
                    >
                      <Trash2 size={12}/> حذف هذه الفئة بالكامل
                    </button>
                  )}
                  <div className="text-yellow-500 font-black text-sm uppercase">فئة: {selectedCategory}</div>
                </div>
              </div>

              <div className="bg-slate-800/40 p-6 rounded-[2rem] border border-white/5 space-y-4 shadow-xl">
                <textarea className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-white outline-none h-24 focus:ring-2 focus:ring-yellow-500 text-right" placeholder="السؤال..." value={bellForm.question} onChange={e => setBellForm({...bellForm, question: e.target.value})} />
                <input className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-white outline-none text-right" placeholder="الإجابة" value={bellForm.answer} onChange={e => setBellForm({...bellForm, answer: e.target.value})} />
                <button onClick={saveQuestion} className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-yellow-400">حفظ السؤال بالـ Cloud</button>
              </div>

              <div className="space-y-3">
                <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 text-right">الأسئلة الحالية لهذه الفئة ({categoryQuestions.length})</h4>
                {categoryQuestions.map(q => <ListItem key={q.id} title={q.question} sub={`الجواب: ${q.answer}`} addedBy={q.addedBy} onDelete={() => deleteQuestion(q.id)} isSmall />)}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// --- المكونات الفرعية النظيفة ---
const TabButton = ({ active, onClick, icon, label, activeColor }) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl transition-all ${active ? `${activeColor} shadow-lg scale-105 text-white` : 'text-slate-400 hover:text-white'}`}>
    {icon} <span className="font-black text-sm">{label}</span>
  </button>
);

const CategoryCard = ({ name, folderName, onClick, onDelete, isDeletable }) => (
  <div className="relative group">
    <button onClick={onClick} className="w-full bg-slate-800/60 hover:bg-slate-700 p-6 rounded-3xl border border-white/5 text-center transition-all shadow-lg active:scale-95 flex flex-col items-center justify-center min-h-[140px]">
      <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-md border border-yellow-500/10 font-bold mb-2">📁 {folderName || 'عام'}</span>
      <span className="text-white font-black text-base block tracking-tight">{name}</span>
      <span className="text-yellow-500 text-[10px] font-bold mt-2 opacity-40 group-hover:opacity-100 transition-all uppercase tracking-widest">عرض الأسئلة ←</span>
    </button>
    
    {isDeletable && (
      <button 
        onClick={onDelete} 
        className="absolute top-3 left-3 p-2 text-slate-500 hover:text-red-500 bg-slate-900/40 hover:bg-slate-900 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-all shadow-md"
        title="حذف الفئة بجميع أسئلتها"
      >
        <Trash2 size={14} />
      </button>
    )}
  </div>
);

const ListItem = ({ title, sub, addedBy, onDelete, isSmall }) => (
  <div className="bg-slate-800/20 p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-white/10 transition-all" dir="rtl">
    <div className="text-right overflow-hidden flex-1">
      <p className={`text-white font-bold truncate ${isSmall ? 'text-xs leading-relaxed' : 'text-sm'}`}>{title}</p>
      <div className="flex gap-4 items-center mt-1">
        {sub && <p className="text-[11px] text-slate-400 font-medium">{sub}</p>}
        <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-md border border-purple-500/10 font-bold">بواسطة: {addedBy || 'غير معروف'}</span>
      </div>
    </div>
    <button onClick={onDelete} className="p-2 text-slate-600 hover:text-red-500 transition-colors mr-2"><Trash2 size={isSmall ? 14 : 18}/></button>
  </div>
);