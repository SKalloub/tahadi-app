import React from 'react';
import { Flame, Star, Award, ShieldAlert } from 'lucide-react';

export default function CurrentSeason() {
  return (
    <div dir="rtl" className="max-w-4xl mx-auto py-12 px-4 font-sans text-white text-center space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-green-500 text-black text-xs font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest">الميزة القادمة مباشرة</div>
        <Flame size={64} className="text-green-500 mx-auto animate-pulse" />
        <h2 className="text-4xl font-black italic tracking-tight">بوابة الموسم الحالي 2026 🔥</h2>
        <p className="text-slate-400 max-w-xl mx-auto font-bold text-sm leading-relaxed">
          هنا تكمن المفاجأة الكبرى.. كل ما يتعلق بالمنافسات الحالية، الصراعات الحية، تفاصيل الترتيب والنهائيات المشتعلة الآن في الملاعب!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto opacity-50">
        <div className="bg-slate-800/40 p-6 rounded-3xl border border-white/5 flex flex-col items-center">
          <Star className="text-yellow-500 mb-2" />
          <span className="font-bold text-sm">متابعة صراعات الهدافين</span>
        </div>
        <div className="bg-slate-800/40 p-6 rounded-3xl border border-white/5 flex flex-col items-center">
          <Award className="text-blue-500 mb-2" />
          <span className="font-bold text-sm">توقعات الجوائز الفورية</span>
        </div>
        <div className="bg-slate-800/40 p-6 rounded-3xl border border-white/5 flex flex-col items-center">
          <ShieldAlert className="text-red-500 mb-2" />
          <span className="font-bold text-sm">إحصائيات نيون حية</span>
        </div>
      </div>
      <p className="text-xs text-slate-600 font-bold italic">بانتظار إشارتك يا وحش لإطلاق شفرة الكود المخصصة لها بالكامل...</p>
    </div>
  );
}