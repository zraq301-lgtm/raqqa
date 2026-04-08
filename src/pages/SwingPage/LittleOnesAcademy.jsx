import React from 'react';
import { ShoppingBag, ExternalLink, Sparkles, Tag, Percent } from 'lucide-react';
import { allProducts } from './productsData'; // استدعاء البيانات كما هي دون تغيير

const RoqaStore = () => {
  return (
    <div className="bg-[#fff9fb] min-h-screen p-4 pb-24" style={{ direction: 'rtl' }}>
      {/* Header */}
      <header className="text-center mb-8 pt-6">
        <div className="inline-block bg-white p-3 rounded-3xl shadow-sm border border-rose-50 mb-4">
          <ShoppingBag className="text-rose-400 w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">
          مختارات <span className="text-rose-500 font-arabic">رقة</span>
        </h1>
        <p className="text-gray-400 text-[11px] mt-2 flex items-center justify-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          أفضل العروض المختارة بعناية لكِ
        </p>
      </header>

      {/* Grid - تم ضبط الاستجابة هنا لتعمل على الموبايل والتابلت والكمبيوتر */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 max-w-7xl mx-auto">
        {allProducts.map((product) => (
          <div 
            key={product.id} 
            className="group bg-white rounded-[24px] p-2.5 shadow-[0_4px_20px_rgba(255,182,193,0.1)] border border-rose-50/50 flex flex-col transition-all duration-300 hover:shadow-md active:scale-95"
          >
            {/* Image Container */}
            <div className="relative aspect-square mb-3 rounded-[18px] overflow-hidden bg-[#fffcfd]">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              {/* Discount Badge with Icon */}
              <div className="absolute top-2 right-2 bg-rose-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <Percent className="w-2.5 h-2.5 text-rose-100" />
                <span>{product.discount} خصم</span>
              </div>
            </div>

            {/* Product Details */}
            <div className="px-1 flex flex-col flex-grow">
              <h2 className="text-[10px] md:text-[11px] font-bold text-gray-700 line-clamp-2 mb-2 h-7 leading-snug">
                {product.name}
              </h2>

              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <div className="flex items-center gap-0.5 bg-rose-50 px-1.5 py-0.5 rounded-md">
                  <Tag className="w-2.5 h-2.5 text-rose-400" />
                  <span className="text-rose-600 font-black text-[13px]">{product.price}</span>
                </div>
                <span className="text-[9px] text-gray-300 line-through decoration-rose-200/50">{product.oldPrice}</span>
              </div>

              {/* Action Button */}
              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-auto w-full bg-gray-900 hover:bg-rose-600 text-white text-center py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                اكتشفي الآن
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoqaStore;
