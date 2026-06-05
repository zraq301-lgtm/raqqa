import React, { useState, useEffect } from "react";

export default function ProfileSetup() {
  const [test, setTest] = useState("جاري الفحص...");

  useEffect(() => {
    // اختبار بسيط جداً لنرى هل الجافاسكريبت يعمل أصلاً
    setTest("إذا رأيتِ هذه الرسالة، فكود الـ Frontend سليم والمشكلة في الربط!");
  }, []);

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-6 text-center font-sans" dir="rtl">
      <div className="p-8 bg-white rounded-3xl shadow-2xl border-2 border-rose-200">
        <h1 className="text-3xl font-black text-rose-500 mb-4 font-sans">رقة ✨ (نسخة الفحص)</h1>
        <p className="text-slate-600 font-bold">{test}</p>
        <div className="mt-6 text-[10px] text-slate-400">
          إذا ظهرت هذه الشاشة، أرسل لي كود ملف الـ API الخاص بك (user-route) فوراً!
        </div>
      </div>
    </div>
  );
}
