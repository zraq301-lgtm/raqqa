import React, { useState, useEffect } from 'react';
import { Heart, Share2, Bookmark, MessagePink, Sparkles, Baby, Leaf, Sun } from 'lucide-react';

const MotherhoodHaven = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // محتوى تجريبي للأمومة
  const articles = [
    {
      id: 1,
      title: "همسات للياليكِ الأولى",
      category: "رعاية المولود",
      readTime: "5 دقائق",
      image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1000&auto=format&fit=crop",
      excerpt: "في سكون الليل، ينمو حب لا يوصف. إليكِ كيف تجعلين ساعات النوم الأولى أكثر هدوءاً..."
    },
    {
      id: 2,
      title: "تغذية الروح قبل الجسد",
      category: "صحة الأم",
      readTime: "4 دقائق",
      image: "https://images.unsplash.com/photo-1544126592-807daa2b565b?q=80&w=1000&auto=format&fit=crop",
      excerpt: "أنتِ المنبع، واعتناؤكِ بنفسك ليس رفاهية، بل هو وقود لعطائكِ المستمر."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFBFC] text-right font-sans pb-10" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital@0;1&family=Aref+Ruqaa&display=swap');
        
        .font-ruqaa { font-family: 'Aref Ruqaa', serif; }
        .font-amiri { font-family: 'Amiri', serif; }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 182, 193, 0.3);
          box-shadow: 0 8px 32px rgba(255, 182, 193, 0.1);
        }
        
        .floating { animation: float 6s ease-in-out infinite; }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }

        .fade-in { opacity: 0; transform: translateY(20px); transition: all 1s ease-out; }
        .fade-in.active { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* Hero Section - الجزء العلوي الفني */}
      <header className="relative h-[450px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-30 scale-110"
            alt="Motherhood background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFFBFC]/50 to-[#FFFBFC]"></div>
        </div>

        <div className={`relative z-10 text-center px-4 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="inline-block p-3 bg-white/50 rounded-full mb-4 floating">
            <Baby className="text-pink-400 w-8 h-8" />
          </div>
          <h1 className="font-ruqaa text-5xl md:text-7xl text-pink-600 mb-4 drop-shadow-sm">ملاذ الأمومة</h1>
          <p className="font-amiri text-xl text-gray-500 italic max-w-lg mx-auto leading-relaxed">
            "حيث يلتقي حنان القلب بعلم الرعاية، لنصنع معاً ذكريات لا تُنسى."
          </p>
        </div>
      </header>

      {/* Quick Stats - بطاقات سريعة */}
      <section className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 grid grid-cols-3 gap-4">
        {[
          { label: "رعاية", icon: <Leaf size={20}/>, color: "bg-green-50" },
          { label: "إشراق", icon: <Sun size={20}/>, color: "bg-yellow-50" },
          { label: "حب", icon: <Heart size={20}/>, color: "bg-pink-50" }
        ].map((item, i) => (
          <div key={i} className={`p-6 rounded-[2rem] ${item.color} flex flex-col items-center justify-center shadow-sm border border-white`}>
            <span className="text-gray-600 mb-2">{item.icon}</span>
            <span className="font-bold text-gray-700 text-sm">{item.label}</span>
          </div>
        ))}
      </section>

      {/* Articles Feed - عرض المحتوى الجمالي */}
      <section className="max-w-4xl mx-auto px-6 mt-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-ruqaa text-3xl text-gray-800">بوح المعرفة</h2>
          <div className="h-px flex-1 bg-pink-100 mx-6 opacity-50"></div>
          <Sparkles className="text-pink-300 animate-pulse" />
        </div>

        <div className="grid gap-12">
          {articles.map((art, index) => (
            <div 
              key={art.id} 
              className={`fade-in ${isVisible ? 'active' : ''} glass-card rounded-[3rem] overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-2xl hover:-translate-y-1`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="md:w-2/5 h-64 md:h-auto overflow-hidden">
                <img src={art.image} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" alt={art.title} />
              </div>
              
              <div className="md:w-3/5 p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-4 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold">{art.category}</span>
                  <span className="text-gray-400 text-xs">{art.readTime} قراءة</span>
                </div>
                
                <h3 className="font-amiri text-2xl font-bold text-gray-800 mb-4 hover:text-pink-500 cursor-pointer transition-colors">
                  {art.title}
                </h3>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {art.excerpt}
                </p>
                
                <div className="flex items-center justify-between border-t border-pink-50 pt-6">
                  <button className="text-pink-600 font-bold text-sm hover:translate-x-[-5px] transition-transform">
                    اقرئي المزيد ←
                  </button>
                  <div className="flex gap-4 text-gray-400">
                    <Heart size={18} className="hover:text-pink-500 cursor-pointer transition-colors" />
                    <Bookmark size={18} className="hover:text-blue-400 cursor-pointer transition-colors" />
                    <Share2 size={18} className="hover:text-green-400 cursor-pointer transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Quote */}
      <footer className="mt-24 text-center px-6">
        <div className="max-w-2xl mx-auto p-12 rounded-[4rem] bg-gradient-to-br from-pink-50 to-white border border-pink-100">
          <p className="font-ruqaa text-2xl text-pink-400 mb-4">"قلب الأم هو مدرسة الطفل الأولى"</p>
          <div className="w-12 h-1 bg-pink-200 mx-auto rounded-full"></div>
        </div>
      </footer>
    </div>
  );
};

export default MotherhoodHaven;
