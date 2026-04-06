import React from 'react';
import { ShoppingCart, Star, ShieldCheck, Truck } from 'lucide-react';

const RaqqaProductPage = () => {
  // رابط الأفلييت الخاص بك الذي زودتني به
  const AFFILIATE_LINK = "https://rzekl.com/g/1e8d1144944131b5064a16525dc3e8/";

  // بيانات تجريبية للمنتج (يمكنك تغييرها حسب المنتج الفعلي)
  const product = {
    name: "خاتم الزركون الملكي - تشكيلة رقة للأناقة",
    description: "قطعة فنية مصممة خصيصاً لتبرز جمال يديكِ. مصنوع من مواد عالية الجودة ومطلي بطبقة مقاومة للصدأ مع فصوص الزركون السويسرية اللامعة.",
    price: "85.00",
    oldPrice: "120.00",
    currency: "AED",
    rating: 4.9,
    reviews: 128,
    image: "https://ae01.alicdn.com/kf/S7b...jpg" // ضع هنا رابط صورة المنتج الحقيقية
  };

  return (
    <div className="min-h-screen bg-[#fffafa] pb-20 font-sans text-right" dir="rtl">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-xl font-black text-rose-500">رقة Store</h1>
        <button className="p-2 bg-rose-50 rounded-full text-rose-500">
          <ShoppingCart size={20} />
        </button>
      </div>

      <div className="max-w-md mx-auto">
        {/* Product Image Section */}
        <div className="relative aspect-square bg-white shadow-inner overflow-hidden rounded-b-[3rem]">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-contain p-8"
            onError={(e) => e.target.src='https://via.placeholder.com/500x500?text=Raqqa+Jewelry'}
          />
          <div className="absolute top-4 right-4 bg-rose-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
            خصم 30%
          </div>
        </div>

        {/* Product Details */}
        <div className="p-8 -mt-8 bg-white rounded-t-[3rem] shadow-2xl relative z-10">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-black text-gray-800 leading-tight flex-1">
              {product.name}
            </h2>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <span className="text-sm text-gray-400">({product.reviews} مراجعة)</span>
          </div>

          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-3xl font-black text-rose-500">{product.price} {product.currency}</span>
            <span className="text-lg text-gray-300 line-through">{product.oldPrice}</span>
          </div>

          <p className="text-gray-500 leading-relaxed mb-8 text-sm">
            {product.description}
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-rose-50/50 p-4 rounded-2xl flex flex-col items-center text-center">
              <Truck className="text-rose-400 mb-2" size={24} />
              <span className="text-[10px] font-bold text-gray-600">شحن سريع وآمن</span>
            </div>
            <div className="bg-rose-50/50 p-4 rounded-2xl flex flex-col items-center text-center">
              <ShieldCheck className="text-rose-400 mb-2" size={24} />
              <span className="text-[10px] font-bold text-gray-600">ضمان جودة رقة</span>
            </div>
          </div>

          {/* Call to Action Button */}
          <a 
            href={AFFILIATE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gradient-to-r from-rose-400 to-rose-600 text-white text-center py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-rose-200 hover:scale-[1.02] transition-transform active:scale-95"
          >
            اشترِ الآن من علي إكسبريس
          </a>
          
          <p className="text-center text-[10px] text-gray-400 mt-4">
            سيتم توجيهك بأمان إلى صفحة المنتج لإتمام الشراء
          </p>
        </div>
      </div>
    </div>
  );
};

export default RaqqaProductPage;
