import React from 'react';
import { ShoppingBag, ExternalLink, Sparkles } from 'lucide-react';
import { allProducts } from './productsData'; // استيراد البيانات من الملف الذي أنشأناه

const RoqaStore = () => {
  return (
    <div className="bg-[#fff9fb] min-h-screen p-4 pb-24" style={{ direction: 'rtl' }}>
      {/* Header */}
      <header className="text-center mb-8 pt-6">
        <div className="inline-block bg-white p-3 rounded-3xl shadow-sm border border-rose-50 mb-4">
          <ShoppingBag className="text-rose-400 w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-gray-800">مختارات <span className="text-rose-500">رقة</span></h1>
        <p className="text-gray-400 text-[10px] mt-2 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" />
          أحدث عروض AliExpress بين يديكِ
        </p>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {allProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-[28px] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-50 flex flex-col transition-transform active:scale-95">
            {/* Image */}
            <div className="relative aspect-square mb-3 rounded-2xl overflow-hidden bg-gray-50">
              <img src={product.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                خصم {product.discount}
              </div>
            </div>

            {/* Content */}
            <h2 className="text-[10px] font-bold text-gray-700 line-clamp-2 mb-2 h-7 leading-tight">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-rose-600 font-black text-sm">{product.price} <small className="text-[8px]">USD</small></span>
              <span className="text-[9px] text-gray-300 line-through">{product.oldPrice}</span>
            </div>

            <a 
              href={product.url} 
              target="_blank" 
              className="mt-auto bg-gray-900 text-white text-center py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2"
            >
              تسوق الآن
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoqaStore;
