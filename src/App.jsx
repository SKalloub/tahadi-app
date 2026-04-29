import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Trophy, PlusCircle, PlayCircle, Bell } from 'lucide-react';
import Home from './pages/Home';
import AddData from './pages/AddData';
import QuizCompensation from './pages/QuizCompensation';
import QuizBell from './pages/QuizBell';
import AddNumbers from './pages/AddNumbers';
import QuizNumbers from './pages/QuizNumbers';
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white font-sans bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-slate-900 to-black">
        <nav className="bg-slate-800/50 backdrop-blur-md border-b border-white/10 p-4 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
              <Trophy className="text-yellow-400" /> TAHADI <span className="text-green-500">30</span>
            </Link>
            <div className="flex gap-4">
              <Link title="إضافة" to="/add"><PlusCircle /></Link>
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;