import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Table as TableIcon, Trophy, Search } from 'lucide-react';
import { getStorageData } from '../lib/storage';

export default function QuizTables() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // جلب الجداول المخزنة في الـ LocalStorage
    const savedTables = getStorageData('footballTables', []);
    setTables(savedTables);
  }, []);

  // تصفية الجداول حسب البحث
  const filteredTables = tables.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 pb-32 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"
          >
            <ArrowRight size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter">فقرة الجداول 📊</h1>
            <p className="text-slate-400 text-sm mt-1">أرشيف البطولات والداتا الكروية</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="ابحث عن جدول..."
            className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-3 pr-12 pl-4 text-white outline-none focus:border-purple-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {!selectedTable ? (
        /* عرض قائمة الجداول المتاحة */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.length > 0 ? (
            filteredTables.map((table) => (
              <button 
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className="group bg-slate-800/40 backdrop-blur-sm p-6 rounded-[2rem] border border-white/5 hover:border-purple-500/50 transition-all hover:-translate-y-1 text-right flex flex-col gap-4 shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform">
                    <Trophy size={28} />
                  </div>
                  <span className="text-[10px] bg-white/5 text-slate-400 px-3 py-1 rounded-full uppercase font-bold tracking-widest">
                    {table.rows.length} سطر
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{table.name}</h3>
                  <p className="text-slate-500 text-xs line-clamp-1">
                    الأعمدة: {table.columns.join(' • ')}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
              <TableIcon size={48} className="mx-auto mb-4 text-slate-700" />
              <p className="text-slate-500">ما في جداول لسه.. ضيفهم من صفحة الإدارة!</p>
            </div>
          )}
        </div>
      ) : (
        /* عرض محتوى الجدول المختار */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button 
            onClick={() => setSelectedTable(null)}
            className="text-purple-500 font-bold flex items-center gap-2 hover:underline"
          >
            <ArrowRight size={18} /> العودة لكل الجداول
          </button>
          
          <div className="bg-slate-800/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 bg-gradient-to-l from-purple-500/10 to-transparent">
              <h2 className="text-2xl font-black text-white italic">{selectedTable.name}</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-white/[0.02]">
                    {selectedTable.columns.map((col, idx) => (
                      <th key={idx} className="p-5 text-purple-400 text-xs font-black uppercase tracking-widest border-b border-white/5">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {selectedTable.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                      {selectedTable.columns.map((col, cIdx) => (
                        <td key={cIdx} className={`p-5 text-sm ${cIdx === 0 ? 'font-bold text-white' : 'text-slate-300'}`}>
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}