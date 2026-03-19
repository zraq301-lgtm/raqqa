import React, { useState, useEffect } from 'react';
import { Dumbbell, Droplets, Heart, Sun, CheckCircle2, Play, Sparkles } from 'lucide-react';

const DynamicWellnessOasis = () => {
  const [waterCount, setWaterCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [tasks, setTasks] = useState([
    { id: 1, text: 'تمارين تمدد (Stretching)', done: false },
    { id: 2, text: 'جلسة تأمل 5 دقائق', done: false },
    { id: 3, text: 'ترطيب البشرة', done: false },
  ]);

  // تحديث شريط التقدم تلقائياً
  useEffect(() => {
    const completed = tasks.filter(t => t.done).length;
    setProgress((completed / tasks.length) * 100);
  }, [tasks]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div style={styles.container}>
      {/* 1. الخلفية المتحركة */}
      <div style={styles.animatedBg}></div>
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div style={styles.glassWrapper}>
        {/* Header مع أنيميشن الدخول */}
        <header style={styles.header}>
          <div style={styles.iconFloat}>
            <Sparkles color="#d4a373" size={30} />
          </div>
          <h1 style={styles.title}>واحة العافية</h1>
          <p style={styles.subtitle}>أهلاً بكِ في مساحتكِ الخاصة</p>
        </header>

        {/* 2. شريط الإنجاز الحيوي */}
        <div style={styles.progressContainer}>
           <div style={styles.progressText}>
             <span>إنجازكِ اليوم</span>
             <span>{Math.round(progress)}%</span>
           </div>
           <div style={styles.progressBarBg}>
             <div style={{ ...styles.progressBarFill, width: `${progress}%` }}></div>
           </div>
        </div>

        {/* 3. كرت الرياضة (بلمسة نابضة) */}
        <section style={styles.cardMain}>
          <div style={styles.cardContent}>
            <div style={styles.workoutTag}>خطة اليوم</div>
            <h2 style={styles.cardTitle}>تمارين الكارديو الخفيفة</h2>
            <p style={styles.cardDesc}>تنشيط الدورة الدموية في 10 دقائق</p>
            <button style={styles.pulseButton}>
              <Play fill="white" size={16} />
              <span>ابدئي النشاط</span>
            </button>
          </div>
          <Dumbbell style={styles.floatingDumbbell} size={60} color="rgba(212, 163, 115, 0.2)" />
        </section>

        {/* 4. قسم المتتبعات التفاعلي */}
        <div style={styles.grid}>
          <div style={styles.smallCard}>
            <Droplets className="animate-bounce" color="#00b4d8" size={24} />
            <span style={styles.counterNum}>{waterCount}</span>
            <span style={styles.label}>أكواب الماء</span>
            <button 
              onClick={() => setWaterCount(prev => Math.min(8, prev + 1))}
              style={styles.addBtnSmall}
            >+</button>
          </div>

          <div style={styles.smallCard}>
            <Heart style={styles.heartBeat} color="#e5989b" size={24} />
            <span style={styles.label}>الحالة اليوم</span>
            <div style={styles.emojiSelection}>
              <span style={styles.emoji}>🌸</span>
              <span style={styles.emoji}>✨</span>
              <span style={styles.emoji}>🍃</span>
            </div>
          </div>
        </div>

        {/* 5. قائمة المهام بأسلوب عصري */}
        <section style={styles.taskSection}>
          <h3 style={styles.sectionTitle}>خطوات العناية</h3>
          {tasks.map((task, index) => (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id)}
              style={{ 
                ...styles.taskItem, 
                animationDelay: `${index * 0.1}s`,
                backgroundColor: task.done ? '#f0f0f0' : '#fff'
              }}
            >
              <div style={{
                ...styles.checkCircle,
                backgroundColor: task.done ? '#b7b7a4' : 'transparent',
                borderColor: task.done ? '#b7b7a4' : '#d1d1d1'
              }}>
                {task.done && <CheckCircle2 size={16} color="white" />}
              </div>
              <span style={{ 
                textDecoration: task.done ? 'line-through' : 'none',
                color: task.done ? '#999' : '#444'
              }}>
                {task.text}
              </span>
            </div>
          ))}
        </section>
      </div>

      {/* CSS Keyframes injected via style tag */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 163, 115, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(212, 163, 115, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 163, 115, 0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heartbeat {
          0% { transform: scale(1); }
          15% { transform: scale(1.1); }
          30% { transform: scale(1); }
          45% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    direction: 'rtl',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#FAF9F6',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  glassWrapper: {
    width: '100%',
    maxWidth: '400px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(15px)',
    borderRadius: '40px',
    padding: '25px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
    zIndex: 2,
    animation: 'fadeIn 0.8s ease-out',
    border: '1px solid rgba(255,255,255,0.5)'
  },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { fontSize: '1.8rem', color: '#8b5e34', margin: 0, fontWeight: '800' },
  subtitle: { color: '#a5a5a5', fontSize: '0.9rem' },
  iconFloat: { animation: 'float 3s ease-in-out infinite' },

  progressContainer: { marginBottom: '25px' },
  progressText: { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px', color: '#666' },
  progressBarBg: { height: '8px', background: '#eee', borderRadius: '10px', overflow: 'hidden' },
  progressBarFill: { height: '100%', background: 'linear-gradient(90deg, #d4a373, #e9edc6)', transition: 'width 0.5s ease-in-out' },

  cardMain: {
    background: 'linear-gradient(135deg, #fff 0%, #fefae0 100%)',
    borderRadius: '25px',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '20px',
    boxShadow: '0 10px 20px rgba(212, 163, 115, 0.1)'
  },
  workoutTag: { display: 'inline-block', padding: '4px 12px', background: '#d4a373', color: '#fff', borderRadius: '20px', fontSize: '0.7rem', marginBottom: '10px' },
  cardTitle: { fontSize: '1.2rem', margin: '0 0 5px 0', color: '#444' },
  cardDesc: { fontSize: '0.85rem', color: '#777', marginBottom: '15px' },
  pulseButton: {
    border: 'none',
    background: '#d4a373',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    animation: 'pulse 2s infinite'
  },
  floatingDumbbell: { position: 'absolute', left: '-10px', bottom: '-10px', transform: 'rotate(-20deg)' },

  grid: { display: 'flex', gap: '15px', marginBottom: '25px' },
  smallCard: { 
    flex: 1, 
    background: '#fff', 
    borderRadius: '20px', 
    padding: '15px', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: '8px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.02)'
  },
  counterNum: { fontSize: '1.4rem', fontWeight: 'bold', color: '#333' },
  label: { fontSize: '0.75rem', color: '#999' },
  addBtnSmall: { border: 'none', background: '#f0f0f0', width: '25px', height: '25px', borderRadius: '50%', cursor: 'pointer' },
  heartBeat: { animation: 'heartbeat 1.5s infinite' },
  emojiSelection: { display: 'flex', gap: '8px', marginTop: '5px' },
  emoji: { cursor: 'pointer', fontSize: '1.1rem' },

  taskSection: { textAlign: 'right' },
  sectionTitle: { fontSize: '1rem', marginBottom: '15px', color: '#555' },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px',
    borderRadius: '18px',
    marginBottom: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    animation: 'fadeIn 0.5s ease-out forwards'
  },
  checkCircle: { width: '22px', height: '22px', borderRadius: '50%', border: '2px solid', display: 'flex', justifyContent: 'center', alignItems: 'center' },

  blob1: { position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', background: '#faedcd', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.6 },
  blob2: { position: 'absolute', bottom: '-10%', left: '-10%', width: '250px', height: '250px', background: '#e9edc6', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.5 },
};

export default DynamicWellnessOasis;
