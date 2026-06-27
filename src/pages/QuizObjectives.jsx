import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Trash2, CheckCircle2, Circle, Target } from 'lucide-react';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { database } from '../App';
import { useNavigate } from 'react-router-dom';

export default function QuizObjectives() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null); // الفئة المختارة
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  
  // جلب اسم المستخدم الحالي، وإذا لم يوجد نعتبره يوزر عادي (مثلاً اسم جهازه أو مجهول)
  const currentAdmin = localStorage.getItem('admin_name') || 'يوزر عادي';

  // لستة الأسماء المعتمدة كـ Admins بالمقر (عدلها وضيق عليها حسب رغبتك)
  const adminList = ['Saeed', 'Saeed Kalloub', 'Admin']; 
  const isAdmin = adminList.includes(currentAdmin);

  // الثلاث فئات الثابتة المطلوبة
  const categories = [
    { id: 'bell-impossible', name: 'جرس ومستحيل', color: 'text-yellow-500 border-yellow-500/10 bg-yellow-500/5' },
    { id: 'auction', name: 'المزاد', color: 'text-red-400 border-red-500/10 bg-red-500/5' },
    { id: 'what-know', name: 'ماذا تعرف', color: 'text-blue-400 border-blue-500/10 bg-blue-500/5' }
  ];

  // الاستماع الحي للمهام من الفايربيز
  useEffect(() => {
    const q = query(collection(database, "objectives"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setTasks(list);
    });
    return () => unsubscribe();
  }, []);

  // إضافة مهمة جديدة للفئة الحالية
  const handleAddTask = async () => {
    if (!newTaskText.trim()) return alert('اكتب المهمة أولاً!');
    try {
      await addDoc(collection(database, "objectives"), {
        text: newTaskText.trim(),
        category: selectedCategory.id,
        completed: false,
        addedBy: currentAdmin, // بنسجل مين اللي أضافها
        timestamp: Date.now()
      });
      setNewTaskText('');
    } catch (e) {
      alert('خطأ في حفظ المهمة!');
    }
  };

  // عمل تشيك (تغيير حالة المهمة بين مكتملة وغير مكتملة)
  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const docRef = doc(database, "objectives", taskId);
      await updateDoc(docRef, { completed: !currentStatus });
    } catch (e) {
      alert('فشل تحديث الحالة!');
    }
  };

  // حذف مهمة نهائياً
  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (!window.confirm('حذف هذه المهمة نهائياً؟')) return;
    try {
      await deleteDoc(doc(database, "objectives", taskId));
    } catch (e) {
      alert('فشل الحذف!');
    }
  };

  // الفلترة السحرية حسب الصلاحية:
  // الأدمن يشوف كل المهام، اليوزر يشوف بس المهام اللي "addedBy" تطابق اسمه الحالي
  const visibleTasks = tasks.filter(t => {
    if (isAdmin) return true; // الأدمن يرى كل شيء
    return t.addedBy === currentAdmin; // اليوزر يرى أهدافه فقط
  });

  // تصفية المهام حسب الفئة المفتوحة حالياً من ضمن المهام المسموح برؤيتها
  const filteredTasks = visibleTasks.filter(t => t.category === selectedCategory?.id);

  return (
    <div dir="rtl" className="max-w-2xl mx-auto py-8 px-4 pb-20 font-sans min-h-[85vh] text-white">
      
      {/* البار العلوي التوضيحي لمعرفة الحساب المفتوح */}
      <div className="text-[11px] text-left text-slate-500 mb-2 px-2">
        المستخدم الحالي: <span className={isAdmin ? "text-purple-400 font-bold" : "text-slate-400"}>{currentAdmin} {isAdmin ? "(أدمن)" : "(لاعب)"}</span>
      </div>

      {/* الشاشة الأولى: اختيار الفئة */}
      {!selectedCategory ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate('/')} className="text-slate-400 text-xs flex items-center gap-1 hover:text-white bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5"><ArrowRight size={14}/> رجوع للهوم</button>
            <h1 className="text-xl font-black">قائمة الفئات (Objectives) 🎯</h1>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {categories.map(cat => {
              // حساب العدادات بناءً على ما يُسمح للمستخدم برؤيته
              const catTasksCount = visibleTasks.filter(t => t.category === cat.id).length;
              const completedCount = visibleTasks.filter(t => t.category === cat.id && t.completed).length;

              return (
                <button 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(cat)}
                  className="w-full bg-slate-900/60 hover:bg-slate-900 p-6 rounded-3xl border border-white/5 text-right transition-all shadow-lg hover:-translate-y-1 flex items-center justify-between group"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-black text-lg text-white group-hover:text-purple-400 transition-colors">{cat.name}</span>
                    <span className="text-xs text-slate-400 font-bold">
                      {isAdmin ? "إجمالي مهام المقر:" : "مهامي المضافة:"} ({completedCount} من {catTasksCount} مكتمل)
                    </span>
                  </div>
                  <span className={`text-xs font-black px-3 py-1.5 rounded-xl border ${cat.color}`}>
                    عرض المهام ←
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        
        /* الشاشة الثانية: إدارة وتشيك المهام داخل الفئة المحددة */
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-white/5">
            <button onClick={() => setSelectedCategory(null)} className="text-slate-400 text-xs flex items-center gap-1 hover:text-white"><ArrowRight size={14}/> رجوع للفئات</button>
            <div className="text-purple-400 font-black text-sm">الفئة: {selectedCategory.name}</div>
          </div>

          {/* بوكس إضافة مهمة جديدة سريعة */}
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 flex gap-2 items-center">
            <input 
              className="flex-1 bg-slate-950 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-purple-500 text-sm text-right" 
              placeholder="اكتب مهمة جديدة هنا..." 
              value={newTaskText} 
              onChange={e => setNewTaskText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            />
            <button onClick={handleAddTask} className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-colors shrink-0">
              <Plus size={18}/>
            </button>
          </div>

          {/* عرض لستة المهام مع التشيك لايف */}
          <div className="space-y-3">
            <h4 className="text-slate-400 text-[11px] font-black px-1">
              {isAdmin ? "كل المهام الحالية بالفئة" : "مهامي الحالية بالفئة"} ({filteredTasks.length})
            </h4>
            
            {filteredTasks.length === 0 ? (
              <p className="text-center text-slate-500 text-xs py-8">لا يوجد مهام لعرضها هنا حالياً. ضيف أول مهمة فوق! 🚀</p>
            ) : (
              filteredTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => toggleTaskStatus(task.id, task.completed)}
                  className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex justify-between items-center cursor-pointer hover:border-white/10 transition-all select-none group"
                >
                  <div className="flex items-center gap-3 text-right overflow-hidden flex-1">
                    {task.completed ? (
                      <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0" />
                    ) : (
                      <Circle className="text-slate-600 w-5 h-5 shrink-0 group-hover:text-purple-500" />
                    )}
                    <div className="overflow-hidden flex-1">
                      <p className={`text-sm font-bold truncate ${task.completed ? 'text-slate-500 line-through font-medium' : 'text-white'}`}>
                        {task.text}
                      </p>
                      {/* يظهر اسم كاتب المهمة للأدمن فقط لزيادة الترتيب */}
                      {isAdmin && (
                        <span className="text-[9px] text-purple-400/70 font-medium block mt-0.5">بواسطة: {task.addedBy}</span>
                      )}
                    </div>
                  </div>

                  {/* الحذف متاح دائماً لليوزر على مهامه، وللأدمن على كل شيء */}
                  <button 
                    onClick={(e) => handleDeleteTask(task.id, e)}
                    className="p-2 text-slate-600 hover:text-red-500 transition-colors mr-2"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}