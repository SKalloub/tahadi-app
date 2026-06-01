import React, { useState, useEffect } from 'react';
import { Plus, Hash, Trash2 } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc } from "firebase/firestore";
import { database } from '../App';

export default function AddNumbers() {
  const [clubName, setClubName] = useState('');
  const [players, setPlayers] = useState([{ number: '', name: '' }]);
  const [savedClubs, setSavedClubs] = useState([]);
  
  const currentAdmin = localStorage.getItem('admin_name') || 'مجهول';

  // استماع حي لأرقام الأندية المرفوعة بالـ Cloud
  useEffect(() => {
    const q = query(collection(database, "clubNumbers"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clubsList = [];
      snapshot.forEach((doc) => clubsList.push({ ...doc.data(), id: doc.id }));
      setSavedClubs(clubsList);
    });
    return () => unsubscribe();
  }, []);

  const saveClub = async () => {
    if (!clubName || players[0].name === '') return alert('عبّي بيانات النادي يا بطل!');
    
    try {
      await addDoc(collection(database, "clubNumbers"), {
        club: clubName.trim(),
        players: players.filter(p => p.name && p.number),
        addedBy: currentAdmin
      });
      setClubName(''); 
      setPlayers([{ number: '', name: '' }]);
      alert('تم حفظ أرقام النادي في الـ Cloud بنجاح! 🚀');
    } catch (e) { alert("فشل الاتصال وحفظ الداتا!"); }
  };

  const addPlayerRow = () => setPlayers([...players, { number: '', name: '' }]);

  const deleteClub = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف أرقام هذا النادي بالكامل؟")) return;
    try {
      await deleteDoc(doc(database, "clubNumbers", id));
    } catch(e) { alert("فشل الحذف"); }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 font-sans text-white space-y-10">
      <div className="bg-slate-800/40 p-8 rounded-[2rem] border border-white/5 backdrop-blur-md shadow-2xl">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
          <Hash className="text-blue-500" /> إضافة أرقام اللاعبين
        </h2>
        
        <input 
          className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl mb-6 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
          placeholder="اسم النادي (مثلاً: أرسنال)" 
          value={clubName} onChange={e => setClubName(e.target.value)} 
        />

        <div className="space-y-3 mb-6">
          {players.map((p, idx) => (
            <div key={idx} className="flex gap-2">
              <input 
                className="w-20 bg-slate-900 border border-white/10 p-3 rounded-xl outline-none text-center font-bold text-blue-400"
                placeholder="الرقم" value={p.number}
                onChange={e => {
                  const newP = [...players];
                  newP[idx].number = e.target.value;
                  setPlayers(newP);
                }}
              />
              <input 
                className="flex-1 bg-slate-900 border border-white/10 p-3 rounded-xl outline-none text-right font-bold text-sm"
                placeholder="اسم اللاعب" value={p.name}
                onChange={e => {
                  const newP = [...players];
                  newP[idx].name = e.target.value;
                  setPlayers(newP);
                }}
              />
            </div>
          ))}
        </div>

        <button onClick={addPlayerRow} className="flex items-center gap-2 text-blue-400 font-bold mb-8 text-sm hover:underline">
          <Plus size={18}/> إضافة لاعب آخر
        </button>

        <button onClick={saveClub} className="w-full bg-blue-600 py-4 rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
          حفظ النادي على السيرفر المشترك
        </button>
      </div>

      {/* عرض الأندية المضافة لايف */}
      <div className="space-y-4">
        <h3 className="text-slate-400 text-xs font-black px-2 uppercase tracking-wider">الأندية المسجلة لايف وعمومياً</h3>
        <div className="grid gap-3">
          {savedClubs.map(c => (
            <div key={c.id} className="bg-slate-800/30 border border-white/5 p-4 rounded-2xl flex justify-between items-center group">
              <div className="text-right">
                <h4 className="font-black text-sm text-blue-400">{c.club}</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">عدد اللاعبين: {c.players?.length || 0} | <span className="text-purple-400">بواسطة: {c.addedBy || 'مجهول'}</span></p>
              </div>
              <button onClick={() => deleteClub(c.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}