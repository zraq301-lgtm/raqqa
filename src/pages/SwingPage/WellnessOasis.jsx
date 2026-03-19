import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BreathingExercise = () => {
  const [phase, setPhase] = useState('ابدئي'); // مراحل: شهيق، كتم، زفير
  const [isActive, setIsActive] = useState(false);

  const phases = [
    { text: 'شهيق عميق', duration: 4, scale: 1.5, color: 'rgba(255, 182, 193, 0.6)' },
    { text: 'اكتمي النفس', duration: 4, scale: 1.5, color: 'rgba(221, 160, 221, 0.6)' },
    { text: 'زفير هادئ', duration: 4, scale: 1, color: 'rgba(255, 192, 203, 0.4)' },
  ];

  useEffect(() => {
    let timer;
    if (isActive) {
      let currentPhaseIdx = 0;
      setPhase(phases[currentPhaseIdx].text);

      timer = setInterval(() => {
        currentPhaseIdx = (currentPhaseIdx + 1) % phases.length;
        setPhase(phases[currentPhaseIdx].text);
      }, 4000); // تغيير المرحلة كل 4 ثوانٍ
    } else {
      setPhase('ابدئي');
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl max-w-sm mx-auto mt-10">
      <h2 className="text-2xl font-bold text-rose-600 mb-8">واحة السكينة</h2>
      
      {/* دائرة التنفس المتحركة */}
      <div className="relative flex items-center justify-center h-64 w-64">
        <motion.div
          animate={isActive ? {
            scale: [1, 1.5, 1.5, 1],
            backgroundColor: [
              'rgba(255, 182, 193, 0.4)', 
              'rgba(255, 182, 193, 0.8)', 
              'rgba(221, 160, 221, 0.8)', 
              'rgba(255, 192, 203, 0.4)'
            ]
          } : { scale: 1 }}
          transition={isActive ? {
            duration: 12, // مجموع ثواني الدورة كاملة
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
          className="absolute h-40 w-40 rounded-full blur-xl"
        />
        
        <motion.div
          animate={isActive ? { scale: [1, 1.5, 1.5, 1] } : { scale: 1 }}
          transition={isActive ? { duration: 12, repeat: Infinity, ease: "easeInOut" } : {}}
          className="z-10 h-32 w-32 rounded-full border-2 border-white/50 bg-gradient-to-br from-rose-200 to-violet-200 shadow-inner flex items-center justify-center"
        >
          <span className="text-rose-800 font-medium text-lg transition-all duration-500">
            {phase}
          </span>
        </motion.div>
      </div>

      <button
        onClick={() => setIsActive(!isActive)}
        className="mt-10 px-8 py-3 bg-rose-400 hover:bg-rose-500 text-white rounded-full font-semibold transition-colors shadow-lg"
      >
        {isActive ? 'إيقاف التمرين' : 'ابدئي الآن'}
      </button>

      <p className="mt-4 text-sm text-gray-600 text-center">
        ركزي على حركة الدائرة، واسمحي لهدوئك الداخلي بالظهور.
      </p>
    </div>
  );
};

export default BreathingExercise;
