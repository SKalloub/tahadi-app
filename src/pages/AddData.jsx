import React, { useState, useEffect, useRef } from 'react';
import { 
  UserPlus, MessageSquare, Plus, FolderPlus, 
  ArrowRight, Trash2, Download, Upload 
} from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, writeBatch } from "firebase/firestore";
import { database } from '../App';

export default function AddData() {
  const [activeTab, setActiveTab] = useState('player');
  const globalFileRef = useRef(null);
  const playerFileRef = useRef(null);
  const categoryFileRef = useRef(null);
  
  const currentAdmin = localStorage.getItem('admin_name') || 'مجهول';

  // --- States ---
  const [playerForm, setPlayerForm] = useState({ name: '', status: 'معتزل', clubs: [''] });
  const [allPlayers, setAllPlayers] = useState([]);
  const [playerCategories, setPlayerCategories] = useState([]);
  const [selectedPlayerCategory, setSelectedPlayerCategory] = useState(null);
  const [selectedPlayerFolder, setSelectedPlayerFolder] = useState('الكل');
  const [newPlayerCatName, setNewPlayerCatName] = useState('');
  const [newPlayerCatFolder, setNewPlayerCatFolder] = useState('');
  const [filteredPlayersList, setFilteredPlayersList] = useState([]);

  const [bellForm, setBellForm] = useState({ question: '', answer: '' });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryFolder, setNewCategoryFolder] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('الكل');
  const [allBellQuestions, setAllBellQuestions] = useState([]);
  const [categoryQuestions, setCategoryQuestions] = useState([]);

  const [importingPlayers, setImportingPlayers] = useState(false);
  const [importingCat, setImportingCat] = useState(false);

  // --- Real-time Listeners (Firebase) ---
  useEffect(() => {
    // جلب الاسم المخزن وفحصه للأمان والفلترة
    const storedName = currentAdmin.trim().toLowerCase();
    const isHarak = storedName === "harak" || storedName.includes("حراك") || storedName.includes("أحمد hراك");
    const isKarim = storedName === "karim" || storedName.includes("كريم");
    const isRegularUser = isHarak || isKarim;

    // 1. استماع حي للاعبين مع الفلترة بداخل الـ Client
    const qPlayers = query(collection(database, "players"));
    const unsubscribePlayers = onSnapshot(qPlayers, (snapshot) => {
      const playersList = [];
      const pCatsSet = new Set(['عام']);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const docAddedBy = (data.addedBy || "").trim().toLowerCase();
        
        // فحص الصلاحية لكل لاعب على حدة
        let shouldInclude = !isRegularUser;
        if (isHarak && (docAddedBy === "harak" || docAddedBy.includes("حراك"))) shouldInclude = true;
        if (isKarim && (docAddedBy === "karim" || docAddedBy.includes("كريم"))) shouldInclude = true;

        if (shouldInclude) {
          playersList.push({ ...data, id: doc.id });
          if (data.category) pCatsSet.add(data.category);
        }
      });
      setAllPlayers(playersList);
      setPlayerCategories(Array.from(pCatsSet));
    });

    // 2. استماع حي لأسئلة الجرس مع الفلترة بداخل الـ Client
    const qBell = query(collection(database, "bellQuestions"));
    const unsubscribeBell = onSnapshot(qBell, (snapshot) => {
      const bellList = [];
      const catsSet = new Set(['عام']);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const docAddedBy = (data.addedBy || "").trim().toLowerCase();
        
        // فحص الصلاحية لكل سؤال جرس
        let shouldInclude = !isRegularUser;
        if (isHarak && (docAddedBy === "harak" || docAddedBy.includes("حراك"))) shouldInclude = true;
        if (isKarim && (docAddedBy === "karim" || docAddedBy.includes("كريم"))) shouldInclude = true;

        if (shouldInclude) {
          bellList.push({ ...data, id: doc.id });
          if (data.category) catsSet.add(data.category);
        }
      });
      setAllBellQuestions(bellList);
      setCategories(Array.from(catsSet));
    });

    return () => {
      unsubscribePlayers();
      unsubscribeBell();
    };
  }, [currentAdmin]);

  // تحديث داتا اللاعبين التابعين للفئة المحددة للتعويض
  useEffect(() => {
    if (selectedPlayerCategory) {
      setFilteredPlayersList(allPlayers.filter(p => p.category === selectedPlayerCategory));
    }
  }, [selectedPlayerCategory, allPlayers]);

  // تحديث أسئلة الفئة المحددة للجرس
  useEffect(() => {
    if (selectedCategory) {
      setCategoryQuestions(allBellQuestions.filter(q => q.category === selectedCategory));
    }
  }, [selectedCategory, allBellQuestions]);

  // --- Backup Functions ---
  const downloadJSON = (data, fileName) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAll = () => {
    downloadJSON({ players: allPlayers, bellQuestions: allBellQuestions }, 'quiz_backup');
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
            batch.set(docRef, { name: p.name, status: p.status, clubs: p.clubs, category: p.category || 'عام', addedBy: p.addedBy || currentAdmin });
          });
        }
        if (data.bellQuestions && Array.isArray(data.bellQuestions)) {
          data.bellQuestions.forEach(q => {
            const docRef = doc(collection(database, "bellQuestions"));
            batch.set(docRef, { question: q.question, answer: q.answer, category: q.category || 'عام', addedBy: q.addedBy || currentAdmin });
          });
        }
        await batch.commit();
        alert('تم استيراد الملف السحابي بنجاح!');
      } catch (err) { alert('الملف غير صالح أو حدث خطأ أثناء الرفع!'); }
    };
    reader.readAsText(file);
  };

  // --- Players Logic ---
  const addPlayerCategory = () => {
    const name = newPlayerCatName.trim();
    const folder = newPlayerCatFolder.trim() || 'عام';
    if (!name) return alert('اسم الفئة غير صالح');
    const fullCatName = `${folder} // ${name}`;
    if (playerCategories.includes(fullCatName)) return alert('هذه الفئة موجودة مسبقاً');
    setPlayerCategories([...playerCategories, fullCatName]);
    setNewPlayerCatName('');
    setNewPlayerCatFolder('');
  };

  const deletePlayerCategory = async (catName, e) => {
    e.stopPropagation();
    const related = allPlayers.filter(p => p.category === catName);
    if (!window.confirm(`حذف فئة [${catName}] بالكامل؟\nسيتم حذف (${related.length}) لاعب نهائياً!`)) return;
    try {
      const batch = writeBatch(database);
      related.forEach(p => batch.delete(doc(database, "players", p.id)));
      await batch.commit();
      setPlayerCategories(playerCategories.filter(c => c !== catName));
      alert('تم حذف الفئة ولاعبيها بنجاح!');
    } catch (e) { alert('حدث خطأ أثناء الحذف!'); }
  };

  const savePlayer = async () => {
    if (!playerForm.name || playerForm.clubs[0] === '') return alert('عبّي البيانات كامة!');
    try {
      await addDoc(collection(database, "players"), {
        name: playerForm.name.trim(),
        status: playerForm.status,
        clubs: playerForm.clubs.filter(c => c.trim()),
        category: selectedPlayerCategory,
        addedBy: currentAdmin,
        timestamp: Date.now()
      });
      setPlayerForm({ name: '', status: 'معتزل', clubs: [''] });
    } catch (e) { alert("خطأ في حفظ اللاعب!"); }
  };

  // --- Bell Logic ---
  const addCategory = () => {
    const name = newCategoryName.trim();
    const folder = newCategoryFolder.trim() || 'عام';
    if (!name) return alert('اسم الفئة غير صالح');
    const fullCatName = `${folder} // ${name}`;
    if (categories.includes(fullCatName)) return alert('هذه الفئة موجودة مسبقاً');
    setCategories([...categories, fullCatName]);
    setNewCategoryName('');
    setNewCategoryFolder('');
  };

  const deleteCategory = async (catName, e) => {
    e.stopPropagation();
    const related = allBellQuestions.filter(q => q.category === catName);
    if (!window.confirm(`حذف فئة [${catName}] بالكامل؟\nستفقد (${related.length}) سؤالاً!`)) return;
    try {
      const batch = writeBatch(database);
      related.forEach(q => batch.delete(doc(database, "bellQuestions", q.id)));
      await batch.commit();
      setCategories(categories.filter(c => c !== catName));
      alert('تم الحذف السحابي بنجاح!');
    } catch (e) { alert('فشل الحذف!'); }
  };

  const saveQuestion = async () => {
    if (!bellForm.question.trim() || !bellForm.answer.trim()) return alert('اكتب السؤال والجواب أولاً!');
    try {
      await addDoc(collection(database, "bellQuestions"), {
        question: bellForm.question.trim(),
        answer: bellForm.answer.trim(),
        category: selectedCategory,
        addedBy: currentAdmin,
        timestamp: Date.now()
      });
      setBellForm({ question: '', answer: '' });
    } catch (e) { alert("خطأ في حفظ السؤال!"); }
  };

  return (
    <div dir="rtl" className="max-w-2xl mx-auto py-8 px-4 pb-20 font-sans">
      {/* GLOBAL HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-white italic tracking-tighter">إدارة البيانات اللايف 🌐</h1>
        <div className="flex gap-2 bg-slate-800 p-1.5 rounded-2xl border border-white/5 shadow-lg">
          <input type="file" ref={globalFileRef} onChange={importAll} className="hidden" accept=".json" />
          <button onClick={() => globalFileRef.current.click()} className="p-2.5 text-slate-400 hover:text-white transition-colors" title="استيراد شامل">
            <Upload size={20} />
          </button>
          <button onClick={exportAll} className="p-2.5 text-slate-400 hover:text-white transition-colors border-r border-white/10" title="تصدير شامل">
            <Download size={20} />
          </button>
        </div>
      </div>

      <nav className="flex bg-slate-800 p-2 rounded-2xl mb-8 shadow-inner">
        <TabButton active={activeTab === 'player'} onClick={() => { setActiveTab('player'); setSelectedPlayerCategory(null); }} icon={<UserPlus size={18}/>} label="التعويض (مسيرات)" activeColor="bg-green-600" />
        <TabButton active={activeTab === 'bell'} onClick={() => { setActiveTab('bell'); setSelectedCategory(null); }} icon={<MessageSquare size={18}/>} label="الجرس العام" activeColor="bg-yellow-500 text-black" />
      </nav>

      {/* SECTION: PLAYER COMPENSATION */}
      {activeTab === 'player' ? (
        <section className="space-y-6">
          {!selectedPlayerCategory ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* المجلدات */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                {['الكل', ...Array.from(new Set(playerCategories.map(c => c.includes(' // ') ? c.split(' // ')[0] : 'عام')))].map(folder => (
                  <button key={folder} onClick={() => setSelectedPlayerFolder(folder)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedPlayerFolder === folder ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    📁 {folder}
                  </button>
                ))}
              </div>

              {/* الفئات المفلترة */}
              <div className="grid grid-cols-2 gap-4">
                {playerCategories
                  .filter(cat => selectedPlayerFolder === 'الكل' || (cat.includes(' // ') ? cat.split(' // ')[0] : 'عام') === selectedPlayerFolder)
                  .map(cat => (
                    <CategoryCard 
                      key={cat} 
                      name={cat.includes(' // ') ? cat.split(' // ')[1] : cat} 
                      folderName={cat.includes(' // ') ? cat.split(' // ')[0] : 'عام'} 
                      onClick={() => setSelectedPlayerCategory(cat)} 
                      onDelete={(e) => deletePlayerCategory(cat, e)} 
                      isDeletable={cat !== 'عام'}
                      accentColor="text-green-400 border-green-500/10 bg-green-500/10"
                    />
                  ))}
                
                {/* إضافة فئة تعويض جديدة */}
                <div className="bg-slate-900/40 p-4 rounded-3xl border border-dashed border-white/20 flex flex-col gap-2">
                  <input className="bg-transparent text-xs text-white outline-none p-2 border-b border-white/10 text-right" placeholder="اسم المجلد (مثال: كؤوس عالم)..." value={newPlayerCatFolder} onChange={e => setNewPlayerCatFolder(e.target.value)} />
                  <input className="bg-transparent text-xs text-white outline-none p-2 border-b border-white/10 text-right" placeholder="فئة تعويض جديدة..." value={newPlayerCatName} onChange={e => setNewPlayerCatName(e.target.value)} />
                  <button onClick={addPlayerCategory} className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded-xl flex items-center justify-center gap-1"><FolderPlus size={14}/> إضافة فئة</button>
                </div>
              </div>
            </div>
          ) : (
            /* شاشة إضافة اللاعبين داخل الفئة المحددة */
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center bg-green-600/10 p-4 rounded-2xl border border-green-600/20">
                <button onClick={() => setSelectedPlayerCategory(null)} className="text-slate-400 text-xs flex items-center gap-1 hover:text-white"><ArrowRight size={14}/> رجوع للفئات</button>
                <div className="text-green-400 font-black text-sm">الفئة: {selectedPlayerCategory}</div>
              </div>

              <div className="space-y-4 bg-slate-800/40 p-6 rounded-[2rem] border border-white/5 shadow-xl">
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
                  <button onClick={() => setPlayerForm({...playerForm, clubs: [...playerForm.clubs, '']})} className="text-green-400 font-bold p-1 hover:bg-green-400/10 rounded-lg flex items-center gap-1 text-xs">
                    <Plus size={12}/> نادٍ آخر
                  </button>
                </div>
                <button onClick={savePlayer} className="w-full bg-green-600 py-4 rounded-2xl font-black text-lg hover:bg-green-500 text-white shadow-lg">حفظ اللاعب بالفئة</button>
              </div>

              <div className="space-y-3">
                <h4 className="text-slate-400 text-[10px] font-black px-2 text-right">اللاعبين المضافين لهذه الفئة ({filteredPlayersList.length})</h4>
                {filteredPlayersList.map(p => (
                  <ListItem key={p.id} title={p.name} sub={p.clubs.join(' ← ')} addedBy={p.addedBy} onDelete={async () => {
                    if (window.confirm('حذف هذا اللاعب نهائياً؟')) await deleteDoc(doc(database, "players", p.id));
                  }} isSmall />
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        /* SECTION: BELL QUESTIONS */
        <section className="space-y-6">
          {!selectedCategory ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                {['الكل', ...Array.from(new Set(categories.map(c => c.includes(' // ') ? c.split(' // ')[0] : 'عام')))].map(folder => (
                  <button key={folder} onClick={() => setSelectedFolder(folder)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedFolder === folder ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                    📁 {folder}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {categories
                  .filter(cat => selectedFolder === 'الكل' || (cat.includes(' // ') ? cat.split(' // ')[0] : 'عام') === selectedFolder)
                  .map(cat => (
                    <CategoryCard 
                      key={cat} 
                      name={cat.includes(' // ') ? cat.split(' // ')[1] : cat} 
                      folderName={cat.includes(' // ') ? cat.split(' // ')[0] : 'عام'} 
                      onClick={() => setSelectedCategory(cat)} 
                      onDelete={(e) => deleteCategory(cat, e)}
                      isDeletable={cat !== 'عام'} 
                      accentColor="text-yellow-500 border-yellow-500/10 bg-yellow-500/10"
                    />
                  ))}
                
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
                <button onClick={() => setSelectedCategory(null)} className="text-slate-400 text-xs flex items-center gap-1 hover:text-white"><ArrowRight size={14}/> رجوع للفئات</button>
                <div className="text-yellow-500 font-black text-sm">الفئة: {selectedCategory}</div>
              </div>

              <div className="bg-slate-800/40 p-6 rounded-[2rem] border border-white/5 space-y-4 shadow-xl">
                <textarea className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-white outline-none h-24 focus:ring-2 focus:ring-yellow-500 text-right" placeholder="السؤال..." value={bellForm.question} onChange={e => setBellForm({...bellForm, question: e.target.value})} />
                <input className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-white outline-none text-right" placeholder="الإجابة" value={bellForm.answer} onChange={e => setBellForm({...bellForm, answer: e.target.value})} />
                <button onClick={saveQuestion} className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-yellow-400">حفظ السؤال بالـ Cloud</button>
              </div>

              <div className="space-y-3">
                <h4 className="text-slate-400 text-[10px] font-black px-2 text-right">الأسئلة الحالية لهذه الفئة ({categoryQuestions.length})</h4>
                {categoryQuestions.map(q => <ListItem key={q.id} title={q.question} sub={`الجواب: ${q.answer}`} addedBy={q.addedBy} onDelete={async () => {
                  if (window.confirm('حذف هذا السؤال؟')) await deleteDoc(doc(database, "bellQuestions", q.id));
                }} isSmall />)}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// --- Sub-Components ---
const TabButton = ({ active, onClick, icon, label, activeColor }) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl transition-all ${active ? `${activeColor} shadow-lg scale-105 text-white` : 'text-slate-400 hover:text-white'}`}>
    {icon} <span className="font-black text-sm">{label}</span>
  </button>
);

const CategoryCard = ({ name, folderName, onClick, onDelete, isDeletable, accentColor }) => (
  <div className="relative group">
    <button onClick={onClick} className="w-full bg-slate-800/60 hover:bg-slate-700 p-6 rounded-3xl border border-white/5 text-center transition-all shadow-lg active:scale-95 flex flex-col items-center justify-center min-h-[140px]">
      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold mb-2 border ${accentColor}`}>📁 {folderName || 'عام'}</span>
      <span className="text-white font-black text-base block tracking-tight">{name}</span>
      <span className="text-slate-400 text-[10px] font-bold mt-2 opacity-45 group-hover:opacity-100 transition-all uppercase">عرض المحتوى ←</span>
    </button>
    {isDeletable && (
      <button onClick={onDelete} className="absolute top-3 left-3 p-2 text-slate-500 hover:text-red-500 bg-slate-900/40 hover:bg-slate-900 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-all shadow-md">
        <Trash2 size={14} />
      </button>
    )}
  </div>
);

const ListItem = ({ title, sub, addedBy, onDelete, isSmall }) => (
  <div className="bg-slate-800/20 p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-white/10 transition-all" dir="rtl">
    <div className="text-right overflow-hidden flex-1">
      <p className={`text-white font-bold truncate ${isSmall ? 'text-xs' : 'text-sm'}`}>{title}</p>
      <div className="flex gap-4 items-center mt-1">
        {sub && <p className="text-[11px] text-slate-400 font-medium truncate">{sub}</p>}
        <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-md border border-purple-500/10 font-bold whitespace-nowrap">بواسطة: {addedBy || 'غير معروف'}</span>
      </div>
    </div>
    <button onClick={onDelete} className="p-2 text-slate-600 hover:text-red-500 transition-colors mr-2"><Trash2 size={isSmall ? 14 : 18}/></button>
  </div>
);