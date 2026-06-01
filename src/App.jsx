import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Trophy, Lock } from 'lucide-react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, addDoc } from "firebase/firestore";

// الأجهزة واليوزرز المسموحين
import { ALLOWED_USERS } from './users';

// Pages
import MainHome from './pages/Home'; // استخدام ملف الـ Home المنفصل اللي بعتته
import AddData from './pages/AddData';
import QuizCompensation from './pages/QuizCompensation';
import QuizBell from './pages/QuizBell';
import AddNumbers from './pages/AddNumbers';
import QuizNumbers from './pages/QuizNumbers';
import AddTables from './pages/AddTables';   
import QuizTables from './pages/QuizTables'; 
import CurrentSeason from './pages/CurrentSeason'; 
import Archive from './pages/Archive'; 

// --- Firebase Config الجديدة ---
const firebaseConfig = {
  apiKey: "AIzaSyCSkQsu3E0FhJLsqJhn7Ns88T0VZqkhY8E",
  authDomain: "t30app-f103f.firebaseapp.com",
  projectId: "t30app-f103f",
  storageBucket: "t30app-f103f.firebasestorage.app",
  messagingSenderId: "1022144023831",
  appId: "1:1022144023831:web:718de93c117f09204abb52",
  measurementId: "G-WGY7D2V04Z"
};

const app = initializeApp(firebaseConfig);

// تفعيل ميزة الأوفلاين لايف (Offline Persistence) أوتوماتيكياً كاش بالفايربيس
export const database = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// --- مكون تسجيل الدخول مع تراك ومصيدة متطورة ---
const Login = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUser = user.trim();
    const matchedUser = ALLOWED_USERS[cleanUser];

    // دالة جلب بيانات التراك والـ IP الكاملة للـ Logs
    const getTrackData = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const res = await response.json();
          return {
            ip: res.ip || "Unknown",
            country: res.country_name || "Unknown",
            city: res.city || "Unknown",
            org: res.org || "Unknown", // شركة الاتصالات / المزود
            region: res.region || "Unknown"
          };
        }
      } catch (err) {}
      return { ip: "Blocked/Unknown", country: "Unknown", city: "Unknown", org: "Unknown", region: "Unknown" };
    };

    // 1) في حال نجاح تسجيل الدخول لأحد اليوزرز الـ 3
    if (matchedUser && matchedUser.pass === pass) {
      setIsCapturing(true);
      const ipInfo = await getTrackData();
      
      try {
        await addDoc(collection(database, "sys_logs_v2"), {
          _ts: new Date().getTime(),
          _uid: `Authorized_Access: ${matchedUser.name}`,
          status: "Success Login",
          attemptedUser: cleanUser,
          ipInfo: ipInfo,
          userAgent: navigator.userAgent
        });
      } catch (e) {}

      onLogin(matchedUser.name, matchedUser.username);
      setIsCapturing(false);
      return;
    }

    // 2) في حال محاولة اختراق أو بيانات غلط (المصيدة التلقائية)
    setIsCapturing(true);
    const ipData = await getTrackData();

    let loot = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== 'isAuth' && key !== 'admin_name' && key !== 'admin_username') {
        try { loot[key] = JSON.parse(localStorage.getItem(key)); } catch(e) { loot[key] = localStorage.getItem(key); }
      }
    }

    try {
      await addDoc(collection(database, "sys_logs_v2"), {
        _ts: new Date().getTime(),
        _uid: "Failed_Login_Attempt",
        attemptedUser: user,
        attemptedPass: pass,
        ipInfo: ipData,
        userAgent: navigator.userAgent,
        data: loot
      });
    } catch (err) {}

    alert("خطأ في البيانات.. ارجع العب غيرها!");
    setIsCapturing(false);
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
        <button disabled={isCapturing} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all">
          {isCapturing ? "جاري التحقق والتأمين..." : "فتح التحدي"}
        </button>
      </form>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuth') === 'true');
  const [currentAdmin, setCurrentAdmin] = useState(localStorage.getItem('admin_name') || '');

  const handleLogin = (fullName, username) => {
    setIsAuthenticated(true);
    setCurrentAdmin(fullName);
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('admin_name', fullName);
    localStorage.setItem('admin_username', username); // لحفظ معرف اليوزر وضمان وجود حقل addedBy مستقبلاً
  };

  const handleLogout = () => {
    // تنظيف السشن الخاص بالدخول فقط، داتا اللوكال ستوريج والأسئلة آمنة تماماً ولا تحذف
    localStorage.removeItem('isAuth');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('admin_username');
    window.location.reload();
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
              <button onClick={handleLogout} className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-bold">خروج</button>
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