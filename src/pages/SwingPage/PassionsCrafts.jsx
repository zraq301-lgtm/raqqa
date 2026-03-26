import React, { useState } from 'react';

const AIDecorPreview = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  // محاكاة عملية التوليد بالذكاء الاصطناعي
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center font-sans">
      
      {/* Container الرئيسي بأسلوب Glassmorphism */}
      <div className="max-w-4xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* الجانب الأيسر: منطقة الرفع والعرض */}
        <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-white/10">
          <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-purple-500 p-2 rounded-lg text-sm">AI</span>
            محلل الديكور الذكي
          </h2>
          
          <div className="relative group cursor-pointer border-2 border-dashed border-white/30 rounded-2xl h-64 flex flex-col items-center justify-center hover:border-purple-400 transition-all duration-300">
            <div className="text-white/60 group-hover:scale-110 transition-transform text-center p-4">
              <p className="mb-2">📷 ارفع صورة غرفتك هنا</p>
              <p className="text-xs">يدعم JPG, PNG بجودة عالية</p>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full mt-6 py-4 rounded-xl font-bold text-white transition-all shadow-lg shadow-purple-500/20 
              ${isGenerating ? 'bg-gray-600 cursor-wait' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-95'}`}
          >
            {isGenerating ? 'جاري تحليل الإضاءة والمساحة...' : 'ابدأ التحويل الإبداعي ✨'}
          </button>
        </div>

        {/* الجانب الأيمن: الخيارات والنتائج */}
        <div className="w-full md:w-80 p-8 bg-black/20">
          <h3 className="text-white/80 text-sm font-semibold mb-4 tracking-wider">اختر نمط الإلهام</h3>
          
          <div className="space-y-3">
            {['مودرن هادئ', 'بوهيمي دافئ', 'مينيماليزم', 'صناعي (Industrial)'].map((style, idx) => (
              <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:bg-white/10 cursor-pointer transition-colors text-sm flex justify-between items-center">
                {style}
                <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
              </div>
            ))}
          </div>

          <hr className="my-6 border-white/10" />

          <div className="bg-gradient-to-tr from-purple-500/20 to-blue-500/20 p-4 rounded-2xl border border-white/10">
            <p className="text-white text-xs leading-relaxed">
              💡 <strong>نصيحة إبداعية:</strong> نمط الإضاءة الجانبية سيبرز جمال قطع الأثاث الخشبية في غرفتك بشكل أفضل.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIDecorPreview;
