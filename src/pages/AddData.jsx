import React, { useState } from 'react';
import { UserPlus, MessageSquare, Save, Plus } from 'lucide-react';

export default function AddData() {
  const [activeTab, setActiveTab] = useState('player');
  
  // لفقرة التعويض
  const [playerName, setPlayerName] = useState('');
  const [status, setStatus] = useState('معتزل');
  const [clubs, setClubs] = useState(['']);

  // لفقرة الجرس
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const savePlayer = () => {
    if (!playerName || clubs[0] === '') return alert('عبّي البيانات يا كابتن!');
    const players = JSON.parse(localStorage.getItem('players') || '[]');
    players.push({ name: playerName, status, clubs: clubs.filter(c => c.trim()) });
    localStorage.setItem('players', JSON.stringify(players));
    setPlayerName(''); setClubs(['']);
    alert('تم حفظ اللاعب بنجاح!');
  };

  const saveQuestion = () => {
    if (!question || !answer) return alert('وين السؤال والإجابة؟');
    const questions = JSON.parse(localStorage.getItem('bellQuestions') || '[]');
    questions.push({ question, answer });
    localStorage.setItem('bellQuestions', JSON.stringify(questions));
    setQuestion(''); setAnswer('');
    alert('تم حفظ السؤال!');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex bg-slate-800 p-2 rounded-2xl mb-8 shadow-inner">
        <button onClick={() => setActiveTab('player')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition ${activeTab === 'player' ? 'bg-green-600 shadow-lg text-white' : 'text-slate-400'}`}>
          <UserPlus size={18}/> التعويض
        </button>
        <button onClick={() => setActiveTab('bell')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition ${activeTab === 'bell' ? 'bg-yellow-500 text-black shadow-lg' : 'text-slate-400'}`}>
          <MessageSquare size={18}/> الجرس
        </button>
      </div>

      {activeTab === 'player' ? (
        <div className="space-y-6 bg-slate-800/40 p-8 rounded-[2rem] border border-white/5 backdrop-blur-md">
          <input className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-green-500" placeholder="اسم اللاعب (مثلاً: روي ميكاي)" value={playerName} onChange={e => setPlayerName(e.target.value)} />
          <select className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl outline-none" value={status} onChange={e => setStatus(e.target.value)}>
            <option>معتزل</option>
            <option>حالي</option>
            <option>مدرب</option>
          </select>
          <div className="space-y-3">
            <p className="text-sm text-slate-400 mr-2">مسيرة اللاعب بالترتيب:</p>
            {clubs.map((club, idx) => (
              <input key={idx} className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl outline-none" placeholder={`النادي رقم ${idx + 1}`} value={club} onChange={e => {
                const newClubs = [...clubs];
                newClubs[idx] = e.target.value;
                setClubs(newClubs);
              }} />
            ))}
            <button onClick={() => setClubs([...clubs, ''])} className="flex items-center gap-2 text-green-400 font-bold p-2 hover:bg-green-400/10 rounded-lg transition">
              <Plus size={18}/> إضافة نادي آخر
            </button>
          </div>
          <button onClick={savePlayer} className="w-full bg-green-600 py-5 rounded-2xl font-black text-xl hover:bg-green-500 transition-all flex items-center justify-center gap-2">
            <Save /> حفظ اللاعب
          </button>
        </div>
      ) : (
        <div className="space-y-6 bg-slate-800/40 p-8 rounded-[2rem] border border-white/5 backdrop-blur-md">
          <textarea className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl outline-none h-32 focus:ring-2 focus:ring-yellow-500" placeholder="اكتب السؤال هون..." value={question} onChange={e => setQuestion(e.target.value)} />
          <input className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500" placeholder="الإجابة النموذجية" value={answer} onChange={e => setAnswer(e.target.value)} />
          <button onClick={saveQuestion} className="w-full bg-yellow-500 text-black py-5 rounded-2xl font-black text-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2">
            <Save /> حفظ السؤال
          </button>
        </div>
      )}
    </div>
  );
}