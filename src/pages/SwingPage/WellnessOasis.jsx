import React, { useState } from 'react';
import { Dumbbell, Droplets, Moon, Sun, CheckCircle2, Heart, Play } from 'lucide-react';

const WellnessOasis = () => {
  const [waterCount, setWaterCount] = useState(0);
  const [tasks, setTasks] = useState([
    { id: 1, text: 'تمارين تمدد (Stretching)', done: false },
    { id: 2, text: 'قناع طبيعي للوجه', done: false },
    { id: 3, text: 'قراءة 5 صفحات', done: false },
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div style={styles.container}>
      {/* Background Decor */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div style={styles.glassWrapper}>
        {/* Header Section */}
        <header style={styles.header}>
          <h1 style={styles.title}>واحة العافية</h1>
          <p style={styles.subtitle}>اعتني بنفسكِ، فأنتِ تستحقين الأفضل</p>
        </header>

        {/* Workout Card (The New Feature) */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <Dumbbell color="#d4a373" size={24} />
            <h2 style={styles.cardTitle}>تحدي النشاط اليومي</h2>
          </div>
          <div style={styles.workoutContent}>
            <div style={styles.workoutInfo}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>يوغا الصباح والركض الخفيف</h3>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>15 دقيقة لتعزيز مرونة جسمكِ وطاقتكِ</p>
            </div>
            <button style={styles.playButton}>
              <Play fill="white" size={16} />
              <span>ابدئي الآن</span>
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <div style={styles.grid}>
          {/* Water Tracker */}
          <div style={{ ...styles.card, flex: 1 }}>
            <div style={styles.cardHeader}>
              <Droplets color="#00b4d8" size={20} />
              <span style={styles.smallTitle}>شرب الماء</span>
            </div>
            <div style={styles.counterBody}>
              <span style={styles.counterNum}>{waterCount}/8</span>
              <button 
                onClick={() => setWaterCount(Math.min(8, waterCount + 1))}
                style={styles.addButton}
              >+</button>
            </div>
          </div>

          {/* Mood Tracker */}
          <div style={{ ...styles.card, flex: 1 }}>
            <div style={styles.cardHeader}>
              <Heart color="#e5989b" size={20} />
              <span style={styles.smallTitle}>المزاج</span>
            </div>
            <div style={styles.emojiRow}>
              <span>✨</span><span>🌸</span><span>🌙</span>
            </div>
          </div>
        </div>

        {/* Self-Care Checklist */}
        <section style={styles.card}>
          <h2 style={{ ...styles.cardTitle, marginBottom: '15px' }}>قائمة العناية بالذات</h2>
          {tasks.map(task => (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id)}
              style={{ ...styles.taskItem, opacity: task.done ? 0.6 : 1 }}
            >
              <CheckCircle2 color={task.done ? "#b7b7a4" : "#e9edc6"} />
              <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
                {task.text}
              </span>
            </div>
          ))}
        </section>

        {/* Daily Tip Footer */}
        <footer style={styles.tipFooter}>
          <Sun size={18} />
          <p>نصيحة اليوم: الجمال يبدأ من الداخل، كوني لطيفة مع نفسكِ.</p>
        </footer>
      </div>
    </div>
  );
};

// --- CSS in JS Styles ---
const styles = {
  container: {
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    direction: 'rtl',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'linear-gradient(135deg, #faedcd 0%, #fefae0 100%)',
    borderRadius: '50%',
    top: '-50px',
    left: '-50px',
    zIndex: 0,
  },
  blob2: {
    position: 'absolute',
    width: '250px',
    height: '250px',
    background: 'linear-gradient(135deg, #e9edc6 0%, #d4a37322 100%)',
    borderRadius: '50%',
    bottom: '-20px',
    right: '-20px',
    zIndex: 0,
  },
  glassWrapper: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '30px',
    padding: '30px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    zIndex: 1,
    border: '1px solid rgba(255,255,255,0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  title: {
    color: '#d4a373',
    fontSize: '2rem',
    fontWeight: '800',
    margin: 0,
  },
  subtitle: {
    color: '#777',
    fontSize: '0.9rem',
    marginTop: '5px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
    border: '1px solid #f1f1f1',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#555',
  },
  workoutContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fefae0',
    padding: '15px',
    borderRadius: '15px',
  },
  playButton: {
    backgroundColor: '#d4a373',
    border: 'none',
    borderRadius: '12px',
    padding: '10px 15px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(212, 163, 115, 0.3)',
  },
  grid: {
    display: 'flex',
    gap: '15px',
  },
  smallTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  counterBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
  },
  counterNum: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#00b4d8',
  },
  addButton: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#e9edc6',
    cursor: 'pointer',
    fontSize: '1.2rem',
  },
  emojiRow: {
    display: 'flex',
    justifyContent: 'space-around',
    fontSize: '1.4rem',
    marginTop: '10px',
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#fcfcfc',
    borderRadius: '12px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: '0.3s',
  },
  tipFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#d4a37311',
    padding: '15px',
    borderRadius: '15px',
    fontSize: '0.85rem',
    color: '#8a5a44',
    lineHeight: '1.4',
  }
};

export default WellnessOasis;
