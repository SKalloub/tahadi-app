import React, { useState } from 'react';
import { Save, Plus, Hash } from 'lucide-react';

export default function AddNumbers() {
  const [clubName, setClubName] = useState('');
  const [players, setPlayers] = useState([{ number: '', name: '' }]);

  const saveClub = () => {
    if (!clubName || players[0].name === '') return alert('عبّي بيانات النادي يا بطل!');
    const allClubs = JSON.parse(localStorage.getItem('clubNumbers') || '[]');
    allClubs.push({ club: clubName, players: players.filter(p => p.name && p.number) });
    localStorage.setItem('clubNumbers', JSON.stringify(allClubs));
    setClubName(''); setPlayers([{ number: '', name: '' }]);
    alert('تم حفظ أرقام النادي بنجاح!');
  };

  const addPlayerRow = () => setPlayers([...players, { number: '', name: '' }]);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-slate-800/40 p-8 rounded-[2rem] border border-white/5 backdrop-blur-md">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
          <Hash className="text-blue-500" /> إضافة أرقام اللاعبين
        </h2>
        
        <input 
          className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl mb-6 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="اسم النادي (مثلاً: أرسنال)" 
          value={clubName} onChange={e => setClubName(e.target.value)} 
        />

        <div className="space-y-3 mb-6">
          {players.map((p, idx) => (
            <div key={idx} className="flex gap-2">
              <input 
                className="w-20 bg-slate-900 border border-white/10 p-3 rounded-xl outline-none"
                placeholder="الرقم" value={p.number}
                onChange={e => {
                  const newP = [...players];
                  newP[idx].number = e.target.value;
                  setPlayers(newP);
                }}
              />
              <input 
                className="flex-1 bg-slate-900 border border-white/10 p-3 rounded-xl outline-none"
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

        <button onClick={addPlayerRow} className="flex items-center gap-2 text-blue-400 font-bold mb-8">
          <Plus size={18}/> إضافة لاعب آخر
        </button>

        <button onClick={saveClub} className="w-full bg-blue-600 py-5 rounded-2xl font-black text-xl hover:bg-blue-500 transition-all">
          حفظ النادي
        </button>
      </div>
    </div>
  );
}