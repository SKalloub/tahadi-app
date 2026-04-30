import React, { useState, useEffect, useRef } from 'react';
import { 
  UserPlus, MessageSquare, Plus, FolderPlus, 
  ArrowRight, Trash2, User, Download, Upload, Save
} from 'lucide-react';
import { getStorageData, saveStorageData } from '../lib/storage';

export default function AddData() {
  const [activeTab, setActiveTab] = useState('player');
  const globalFileRef = useRef(null);
  const playerFileRef = useRef(null);
  const categoryFileRef = useRef(null);
  
  // --- States ---
  const [playerForm, setPlayerForm] = useState({ name: '', status: 'معتزل', clubs: [''] });
  const [allPlayers, setAllPlayers] = useState([]);
  const [bellForm, setBellForm] = useState({ question: '', answer: '' });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryQuestions, setCategoryQuestions] = useState([]);

  // --- Load Data ---
  useEffect(() => {
    setCategories(getStorageData('quizCategories', ['عام']));
    setAllPlayers(getStorageData('players'));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const allQ = getStorageData('bellQuestions');
      setCategoryQuestions(allQ.filter(q => q.category === selectedCategory));
    }
  }, [selectedCategory]);

  // --- Helper: Download Logic ---
  const downloadJSON = (data, fileName) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- 1. Global Backup (Everything) ---
  const exportAll = () => {
    const backup = {
      players: getStorageData('players'),
      bellQuestions: getStorageData('bellQuestions'),
      quizCategories: getStorageData('quizCategories')
    };
    downloadJSON(backup, 'full_backup');
  };

  const importAll = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.players) saveStorageData('players', data.players);
        if (data.bellQuestions) saveStorageData('bellQuestions', data.bellQuestions);
        if (data.quizCategories) saveStorageData('quizCategories', data.quizCategories);
        alert('تم استيراد الكل بنجاح!');
        window.location.reload();
      } catch (err) { alert('الملف غير صالح!'); }
    };
    reader.readAsText(file);
  };

  // --- 2. Players Backup ---
  const exportPlayers = () => {
    const players = getStorageData('players');
    downloadJSON({ players }, 'players_only');
  };

  const importPlayers = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.players) {
          saveStorageData('players', data.players);
          setAllPlayers(data.players);
          alert('تم تحديث قائمة اللاعبين!');
        }
      } catch (err) { alert('خطأ في ملف اللاعبين!'); }
    };
    reader.readAsText(file);
  };

  // --- 3. Category Backup ---
  const exportCurrentCategory = () => {
    downloadJSON({ 
      categoryName: selectedCategory, 
      questions: categoryQuestions 
    }, `category_${selectedCategory}`);
  };

  const importToCategory = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.questions) {
          const allQ = getStorageData('bellQuestions');
          // دمج الأسئلة الجديدة مع القديمة مع التأكد من بقائها في الفئة الحالية
          const formattedNewQ = data.questions.map(q => ({ ...q, category: selectedCategory }));
          const updated = [...allQ, ...formattedNewQ];
          saveStorageData('bellQuestions', updated);
          setCategoryQuestions(updated.filter(q => q.category === selectedCategory));
          alert(`تم إضافة الأسئلة لفئة ${selectedCategory}`);
        }
      } catch (err) { alert('خطأ في استيراد الفئة!'); }
    };
    reader.readAsText(file);
  };

  // --- Form Handlers ---
  const savePlayer = () => {
    if (!playerForm.name || playerForm.clubs[0] === '') return alert('عبّي البيانات!');
    const newPlayer = { ...playerForm, id: Date.now(), clubs: playerForm.clubs.filter(c => c.trim()) };
    const updated = [...allPlayers, newPlayer];
    saveStorageData('players', updated);
    setAllPlayers(updated);
    setPlayerForm({ name: '', status: 'معتزل', clubs: [''] });
  };

  const deletePlayer = (id) => {
    if (!window.confirm('حذف؟')) return;
    const updated = allPlayers.filter(p => p.id !== id);
    setAllPlayers(updated);
    saveStorageData('players', updated);
  };

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name || categories.includes(name)) return alert('اسم غير صالح');
    const updated = [...categories, name];
    setCategories(updated);
    saveStorageData('quizCategories', updated);
    setNewCategoryName('');
  };

  const saveQuestion = () => {
    if (!bellForm.question || !bellForm.answer) return alert('ناقص بيانات!');
    const allQ = getStorageData('bellQuestions');
    const newQ = { ...bellForm, id: Date.now(), category: selectedCategory };
    const updated = [...allQ, newQ];
    saveStorageData('bellQuestions', updated);
    setCategoryQuestions([...categoryQuestions, newQ]);
    setBellForm({ question: '', answer: '' });
  };

  const deleteQuestion = (id) => {
    const allQ = getStorageData('bellQuestions');
    const updated = allQ.filter(q => q.id !== id);
    saveStorageData('bellQuestions', updated);
    setCategoryQuestions(categoryQuestions.filter(q => q.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 pb-20 font-sans">
      {/* GLOBAL HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-white italic tracking-tighter">إدارة البيانات</h1>
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
        <TabButton active={activeTab === 'player'} onClick={() => setActiveTab('player')} icon={<UserPlus size={18}/>} label="التعويض" activeColor="bg-green-600" />
        <TabButton active={activeTab === 'bell'} onClick={() => setActiveTab('bell')} icon={<MessageSquare size={18}/>} label="الجرس" activeColor="bg-yellow-500 text-black" />
      </nav>

      {activeTab === 'player' ? (
        <section className="space-y-10 animate-in fade-in duration-500">
          <div className="space-y-6 bg-slate-800/40 p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-green-500 tracking-widest uppercase">إضافة لاعب جديد</span>
              <div className="flex gap-1">
                <input type="file" ref={playerFileRef} onChange={importPlayers} className="hidden" accept=".json" />
                <button onClick={() => playerFileRef.current.click()} className="p-2 text-slate-400 hover:text-green-400"><Upload size={14}/></button>
                <button onClick={exportPlayers} className="p-2 text-slate-400 hover:text-green-400"><Download size={14}/></button>
              </div>
            </div>
            
            <input className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-green-500" placeholder="اسم اللاعب" value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} />
            
            <select className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-white outline-none" value={playerForm.status} onChange={e => setPlayerForm({...playerForm, status: e.target.value})}>
              <option>معتزل</option><option>حالي</option><option>مدرب</option>
            </select>

            <div className="space-y-3">
              {playerForm.clubs.map((club, idx) => (
                <input key={idx} className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-white outline-none" placeholder={`النادي رقم ${idx + 1}`} value={club} onChange={e => {
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
            <h3 className="text-white/50 text-xs font-black px-2 uppercase tracking-widest">قائمة اللاعبين المخزنة</h3>
            <div className="grid gap-3">
              {allPlayers.map(p => (
                <ListItem key={p.id} title={p.name} sub={`${p.clubs.join(' ← ')}`} onDelete={() => deletePlayer(p.id)} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          {!selectedCategory ? (
            <div className="grid grid-cols-2 gap-4">
              {categories.map(cat => <CategoryCard key={cat} name={cat} onClick={() => setSelectedCategory(cat)} />)}
              <div className="bg-slate-900/40 p-4 rounded-3xl border border-dashed border-white/20 flex flex-col gap-2">
                <input className="bg-transparent text-sm text-white outline-none p-2 border-b border-white/10" placeholder="فئة جديدة..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                <button onClick={addCategory} className="bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded-xl flex items-center justify-center gap-1"><FolderPlus size={14}/> إضافة</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20">
                <div>
                  <div className="text-yellow-500 font-black text-sm uppercase">فئة: {selectedCategory}</div>
                  <div className="flex gap-4 mt-2">
                    <input type="file" ref={categoryFileRef} onChange={importToCategory} className="hidden" accept=".json" />
                    <button onClick={() => categoryFileRef.current.click()} className="text-[10px] text-yellow-500/60 hover:text-yellow-500 flex items-center gap-1 underline decoration-dotted">استيراد لهذه الفئة</button>
                    <button onClick={exportCurrentCategory} className="text-[10px] text-yellow-500/60 hover:text-yellow-500 flex items-center gap-1 underline decoration-dotted">تصدير الفئة</button>
                  </div>
                </div>
                <button onClick={() => setSelectedCategory(null)} className="text-slate-400 text-xs flex items-center gap-1 hover:text-white">رجوع <ArrowRight size={14}/></button>
              </div>

              <div className="bg-slate-800/40 p-6 rounded-[2rem] border border-white/5 space-y-4 shadow-xl">
                <textarea className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-white outline-none h-24 focus:ring-2 focus:ring-yellow-500" placeholder="السؤال..." value={bellForm.question} onChange={e => setBellForm({...bellForm, question: e.target.value})} />
                <input className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-white outline-none" placeholder="الإجابة" value={bellForm.answer} onChange={e => setBellForm({...bellForm, answer: e.target.value})} />
                <button onClick={saveQuestion} className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-yellow-400">حفظ السؤال</button>
              </div>

              <div className="space-y-3">
                <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest px-2">الأسئلة الحالية</h4>
                {categoryQuestions.map(q => <ListItem key={q.id} title={q.question} onDelete={() => deleteQuestion(q.id)} isSmall />)}
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

const CategoryCard = ({ name, onClick }) => (
  <button onClick={onClick} className="bg-slate-800/60 hover:bg-slate-700 p-8 rounded-3xl border border-white/5 text-center transition-all shadow-lg group active:scale-95">
    <span className="text-white font-black text-lg block tracking-tight">{name}</span>
    <span className="text-yellow-500 text-[10px] font-bold mt-2 opacity-40 group-hover:opacity-100 transition-all uppercase tracking-widest">عرض الأسئلة</span>
  </button>
);

const ListItem = ({ title, sub, onDelete, isSmall }) => (
  <div className="bg-slate-800/20 p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-white/10 transition-all">
    <div className="text-right overflow-hidden flex-1">
      <p className={`text-white font-bold truncate ${isSmall ? 'text-xs leading-relaxed' : 'text-sm'}`}>{title}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-1 font-mono">{sub}</p>}
    </div>
    <button onClick={onDelete} className="p-2 text-slate-600 hover:text-red-500 transition-colors mr-2"><Trash2 size={isSmall ? 14 : 18}/></button>
  </div>
);