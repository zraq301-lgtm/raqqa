import React from 'react';

const Swing = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-sm w-full max-w-md text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Ref-Link-Icon" />
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">واجهة Swing</h2>
        <p className="text-gray-500 mb-6">هذه الصفحة جاهزة الآن لاستقبال المحتوى الخاص بك.</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-left">
            <span className="text-xs text-blue-500 font-semibold uppercase">الحالة</span>
            <p className="text-lg font-bold text-blue-700">نشط</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-left">
            <span className="text-xs text-green-500 font-semibold uppercase">التحديث</span>
            <p className="text-lg font-bold text-green-700">تلقائي</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swing;
