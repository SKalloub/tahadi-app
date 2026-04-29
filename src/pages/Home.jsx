import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Bell, PlusCircle, Hash } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  // دالة مساعدة عشان نضمن إنه المسار دايماً صح
  const goTo = (path) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 py-10">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter text-white">
          تحدي <span className="text-green-500 text-7xl md:text-8xl">30</span>
        </h1>
        <p className="text-slate-400 font-medium tracking-widest uppercase text-sm">جهز حالك للمنيكة الكروية على أصولها</p>
      </div>

      {/* Grid Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
        
        {/* كرت التعويض */}
        <button 
          onClick={() => goTo('/quiz-comp')}
          className="group relative bg-slate-800/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 hover:border-green-500/50 transition-all hover:-translate-y-2 flex flex-col items-end shadow-2xl"
        >
          <Zap className="text-green-500 mb-6 w-14 h-14 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all" />
          <h3 className="text-2xl font-black text-right mb-2 text-white">فقرة التعويض</h3>
          <p className="text-slate-400 text-right text-sm leading-relaxed">حزر اللاعب من مسيرته بأقل عدد أندية ممكن.</p>
          <div className="absolute bottom-4 left-6 opacity-0 group-hover:opacity-100 transition-opacity font-black text-green-500">ابدأ الآن ←</div>
        </button>

        {/* كرت الجرس */}
        <button 
          onClick={() => goTo('/quiz-bell')}
          className="group relative bg-slate-800/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 hover:border-yellow-500/50 transition-all hover:-translate-y-2 flex flex-col items-end shadow-2xl"
        >
          <Bell className="text-yellow-500 mb-6 w-14 h-14 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-all" />
          <h3 className="text-2xl font-bold text-right mb-2 text-white">فقرة الجرس</h3>
          <p className="text-slate-400 text-right text-sm leading-relaxed">أسئلة سريعة وعشوائية.. مين أسرع واحد بيكبس؟</p>
          <div className="absolute bottom-4 left-6 opacity-0 group-hover:opacity-100 transition-opacity font-black text-yellow-500">ابدأ الآن ←</div>
        </button>

        {/* كرت الأرقام */}
        <button 
          onClick={() => goTo('/quiz-numbers')}
          className="group relative bg-slate-800/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/50 transition-all hover:-translate-y-2 flex flex-col items-end shadow-2xl"
        >
          <div className="text-blue-500 mb-6 text-5xl font-black italic group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all">#10</div>
          <h3 className="text-2xl font-bold text-right mb-2 text-white">فقرة الأرقام</h3>
          <p className="text-slate-400 text-right text-sm leading-relaxed">اختبار في أرقام قمصان لاعبي أندية الدوريات الكبرى.</p>
          <div className="absolute bottom-4 left-6 opacity-0 group-hover:opacity-100 transition-opacity font-black text-blue-500">ابدأ الآن ←</div>
        </button>

      </div>

      {/* Footer Settings/Add Section */}
      <div className="flex flex-wrap justify-center gap-6 mt-6">
        <button 
          onClick={() => goTo('/add')}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl text-slate-300 hover:text-white transition-all border border-white/5 shadow-lg"
        >
          <PlusCircle size={20} className="text-green-500" />
          <span className="font-bold">إضافة (تعويض / جرس)</span>
        </button>

        <button 
          onClick={() => goTo('/add-numbers')}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl text-slate-300 hover:text-white transition-all border border-white/5 shadow-lg"
        >
          <Hash size={20} className="text-blue-500" />
          <span className="font-bold">إضافة أرقام أندية</span>
        </button>
      </div>
    </div>
  );
}