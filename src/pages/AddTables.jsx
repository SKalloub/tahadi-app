import React, { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, Download, Upload, ArrowRight, Table as TableIcon } from 'lucide-react';
import { getStorageData, saveStorageData } from '../lib/storage';

export default function AddTables() {
  const [tables, setTables] = useState([]);
  const [selectedTableIdx, setSelectedTableIdx] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setTables(getStorageData('footballTables', []));
  }, []);

  const createNewTable = () => {
    const name = prompt("اسم الجدول (مثلاً: تاريخ الدوري الهولندي):");
    if (!name) return;
    const columns = prompt("الأعمدة (افصل بينها بفاصلة):", "العام,الفريق الفائز,المدرب,الهداف");
    if (!columns) return;

    const newTable = {
      id: Date.now(),
      name,
      columns: columns.split(',').map(c => c.trim()),
      rows: []
    };
    const updated = [...tables, newTable];
    setTables(updated);
    saveStorageData('footballTables', updated);
  };

  const addRow = (tableIdx) => {
    const updated = [...tables];
    const newRow = {};
    updated[tableIdx].columns.forEach(col => newRow[col] = "");
    updated[tableIdx].rows.push(newRow);
    setTables(updated);
  };

  const updateCell = (tableIdx, rowIdx, col, value) => {
    const updated = [...tables];
    updated[tableIdx].rows[rowIdx][col] = value;
    setTables(updated);
  };

  const saveAll = () => {
    saveStorageData('footballTables', tables);
    alert("تم الحفظ بنجاح! 💾");
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(tables, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tables_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setTables(data);
        saveStorageData('footballTables', data);
        alert("تم الاستيراد بنجاح! ✅");
      } catch (err) { alert("ملف غير صالح! ❌"); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 pb-32">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-white italic">إدارة الجداول 📊</h1>
        <div className="flex gap-3">
          <input type="file" ref={fileInputRef} onChange={importJSON} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="p-3 bg-slate-800 text-slate-300 rounded-xl hover:text-white"><Upload size={20}/></button>
          <button onClick={exportJSON} className="p-3 bg-slate-800 text-slate-300 rounded-xl hover:text-white"><Download size={20}/></button>
          <button onClick={createNewTable} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
            <Plus size={20}/> جدول جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar: Table List */}
        <div className="space-y-3">
          {tables.map((t, idx) => (
            <button 
              key={t.id} 
              onClick={() => setSelectedTableIdx(idx)}
              className={`w-full text-right p-4 rounded-2xl border transition-all ${selectedTableIdx === idx ? 'bg-purple-600 border-purple-400 text-white shadow-lg' : 'bg-slate-800/40 border-white/5 text-slate-400 hover:border-purple-500/50'}`}
            >
              <div className="font-bold">{t.name}</div>
              <div className="text-[10px] opacity-60 uppercase">{t.rows.length} سطر</div>
            </button>
          ))}
        </div>

        {/* Main: Table Editor */}
        <div className="md:col-span-3">
          {selectedTableIdx !== null ? (
            <div className="bg-slate-800/40 border border-white/5 rounded-[2.5rem] p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">{tables[selectedTableIdx].name}</h2>
                <button onClick={() => addRow(selectedTableIdx)} className="text-green-500 hover:bg-green-500/10 p-2 rounded-lg flex items-center gap-1 text-sm font-bold">
                  <Plus size={16}/> إضافة سطر
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr>
                      {tables[selectedTableIdx].columns.map(col => (
                        <th key={col} className="p-4 text-slate-500 text-xs font-black border-b border-white/5 uppercase tracking-wider">{col}</th>
                      ))}
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables[selectedTableIdx].rows.map((row, rIdx) => (
                      <tr key={rIdx} className="group hover:bg-white/[0.02]">
                        {tables[selectedTableIdx].columns.map(col => (
                          <td key={col} className="p-2 border-b border-white/5">
                            <input 
                              className="w-full bg-transparent text-white p-2 rounded-lg outline-none focus:bg-slate-900 border border-transparent focus:border-purple-500/30 text-sm"
                              value={row[col]}
                              onChange={(e) => updateCell(selectedTableIdx, rIdx, col, e.target.value)}
                            />
                          </td>
                        ))}
                        <td className="p-2 border-b border-white/5">
                          <button 
                            onClick={() => {
                              const updated = [...tables];
                              updated[selectedTableIdx].rows.splice(rIdx, 1);
                              setTables(updated);
                            }}
                            className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={saveAll} className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2">
                <Save size={20}/> حفظ جميع التعديلات
              </button>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-[2.5rem]">
              <TableIcon size={48} className="mb-4 opacity-20"/>
              <p>اختر جدولاً أو أنشئ واحداً جديداً للبدء</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}