import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Bell, PlusCircle, Hash, Target } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] gap-10 py-12 font-sans bg-slate-950 text-white selection:bg-amber-500 selection:text-black">
      
      {/* Header Section */}
      <div className="text-center space-y-3 animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          تحدي <span className="text-green-500 transition-all hover:text-green-400 cursor-default">30</span>
        </h1>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs md:text-sm max-w-md mx-auto leading-relaxed">
         مقر تدريبات تحدي الثلاثين⚽🔥
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl px-4 space-y-6">
        
        {/* المربع العلوي: الأربع فقرات الأساسية متوزعة بالتساوي */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* كرت التعويض */}
          <button 
            onClick={() => goTo('/quiz-comp')}
            className="group relative bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-end shadow-xl text-right overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-green-500/10 transition-all"></div>
            <Zap className="text-green-500 mb-5 w-12 h-12 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-300" />
            <h3 className="text-xl font-black mb-2 text-white">فقرة التعويض</h3>
            <p className="text-slate-400 text-sm leading-relaxed">حزر اللاعب من مسيرته بأقل عدد أندية ممكن.</p>
            <div className="mt-4 text-xs font-black text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">ابدأ الآن ←</div>
          </button>

          {/* كرت الجرس */}
          <button 
            onClick={() => goTo('/quiz-bell')}
            className="group relative bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 hover:border-yellow-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-end shadow-xl text-right overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-yellow-500/10 transition-all"></div>
            <Bell className="text-yellow-500 mb-5 w-12 h-12 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all duration-300" />
            <h3 className="text-xl font-black mb-2 text-white">فقرة الجرس</h3>
            <p className="text-slate-400 text-sm leading-relaxed">أسئلة سريعة وعشوائية.. مين أسرع واحد بيكبس؟</p>
            <div className="mt-4 text-xs font-black text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">ابدأ الآن ←</div>
          </button>

          {/* كرت الأرقام */}
          <button 
            onClick={() => goTo('/quiz-numbers')}
            className="group relative bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-end shadow-xl text-right overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-all"></div>
            <div className="text-blue-500 mb-5 text-4xl font-black italic tracking-tighter group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-300">#10</div>
            <h3 className="text-xl font-black mb-2 text-white">فقرة الأرقام</h3>
            <p className="text-slate-400 text-sm leading-relaxed">اختبار في أرقام قمصان لاعبي أندية الدوريات الكبرى.</p>
            <div className="mt-4 text-xs font-black text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">ابدأ الآن ←</div>
          </button>

          {/* كرت الأوبجكتيفس الجديد بالملي */}
          <button 
            onClick={() => goTo('/quiz-objectives')}
            className="group relative bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-end shadow-xl text-right overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-purple-500/10 transition-all"></div>
            <Target className="text-purple-500 mb-5 w-12 h-12 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300" />
            <h3 className="text-xl font-black mb-2 text-white">قائمة المهام Objectives</h3>
            <p className="text-slate-400 text-sm leading-relaxed">إدارة ومتابعة أهداف (جرس ومستحيل، المزاد، ماذا تعرف).</p>
            <div className="mt-4 text-xs font-black text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">استعرض المهام ←</div>
          </button>

        </div>
      </div>

      {/* Footer Settings/Add Section */}
      <div className="flex flex-wrap justify-center gap-3 mt-4 bg-slate-900/30 p-3.5 rounded-[2rem] border border-white/5 shadow-inner max-w-2xl w-full mx-4 backdrop-blur-sm">
        <button 
          onClick={() => goTo('/add')}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl text-slate-300 hover:text-white transition-all border border-white/5 text-xs font-bold flex-1 justify-center"
        >
          <PlusCircle size={16} className="text-green-500" />
          <span>إدارة (تعويض / جرس)</span>
        </button>

        <button 
          onClick={() => goTo('/add-numbers')}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl text-slate-300 hover:text-white transition-all border border-white/5 text-xs font-bold flex-1 justify-center"
        >
          <Hash size={16} className="text-blue-500" />
          <span>إدارة الأرقام</span>
        </button>
      </div>
    </div>
  );
}