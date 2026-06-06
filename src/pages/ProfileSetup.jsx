import React, { useState } from 'react';
import { User, Mail, Shield, Settings, Key, Bell, Save, Camera } from 'lucide-react';

export default function ProfilePage() {
  // حالات إدارة البيانات (يمكن ربطها بـ API لاحقاً)
  const [profile, setProfile] = useState({
    name: 'أحمد الرفاعي',
    role: 'مطور ويب متكامل / رائد أعمال',
    email: 'ahmed.dev@example.com',
    phone: '+20 123 456 7890',
    bio: 'شغوف ببناء تطبيقات ويب وذكاء اصطناعي ذكية وعالية الكفاءة، وأسعى دائماً لتحويل الأفكار المعقدة إلى منتجات رقمية سهلة الاستخدام.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop'
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // هنا يتم معالجة حفظ البيانات أو إرسالها للسيرفر
    alert('تم حفظ التعديلات بنجاح!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-slate-100 font-sans p-4 md:p-8 dir-rtl" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* العناوين الرئيسية */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">إعدادات الحساب</h1>
          <p className="text-slate-400 text-sm mt-1">إدارة معلوماتك الشخصية وإعدادات الأمان الخاصة بك.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* القائمة الجانبية - Navigation */}
          <div className="lg:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'general'
                  ? 'bg-gradient-to-l from-cyan-500/20 to-teal-500/10 text-cyan-400 border-r-4 border-cyan-500 shadow-lg shadow-cyan-500/5'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <User size={18} />
              <span className="font-medium">المعلومات العامة</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'security'
                  ? 'bg-gradient-to-l from-cyan-500/20 to-teal-500/10 text-cyan-400 border-r-4 border-cyan-500 shadow-lg shadow-cyan-500/5'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Key size={18} />
              <span className="font-medium">الأمان وكلمة المرور</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'notifications'
                  ? 'bg-gradient-to-l from-cyan-500/20 to-teal-500/10 text-cyan-400 border-r-4 border-cyan-500 shadow-lg shadow-cyan-500/5'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Bell size={18} />
              <span className="font-medium">الإشعارات</span>
            </button>
          </div>

          {/* محتوى البطاقة الرئيسي - Main Content Container */}
          <div className="lg:col-span-3">
            <div className="backdrop-blur-xl bg-slate-900/40 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              
              {/* هيدر الملف الشخصي (الصورة والغلاف) */}
              <div className="h-32 bg-gradient-to-r from-cyan-600/30 to-purple-600/30 relative"></div>
              
              <div className="px-6 pb-6 relative">
                {/* الصورة الشخصية */}
                <div className="flex flex-col sm:flex-row items-center gap-4 -mt-12 mb-6 relative z-10">
                  <div className="relative group">
                    <img
                      src={profile.avatar}
                      alt="Avatar"
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-900 shadow-xl group-hover:opacity-80 transition"
                    />
                    <label className="absolute bottom-1 right-1 bg-cyan-500 p-1.5 rounded-xl text-slate-950 cursor-pointer shadow-lg hover:scale-105 transition">
                      <Camera size={14} />
                      <input type="file" className="hidden" accept="image/*" />
                    </label>
                  </div>
                  <div className="text-center sm:text-right mt-2 sm:mt-12">
                    <h2 className="text-xl font-bold text-slate-100">{profile.name}</h2>
                    <p className="text-sm text-cyan-400">{profile.role}</p>
                  </div>
                </div>

                <hr className="border-slate-800/60 my-6" />

                {/* تبويب: المعلومات العامة */}
                {activeTab === 'general' && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">الاسم الكامل</label>
                        <input
                          type="text"
                          name="name"
                          value={profile.name}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">المسمى الوظيفي</label>
                        <input
                          type="text"
                          name="role"
                          value={profile.role}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">البريد الإلكتروني</label>
                        <input
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition text-left dir-ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">رقم الهاتف</label>
                        <input
                          type="text"
                          name="phone"
                          value={profile.phone}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition text-left dir-ltr"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">النبذة الشخصية (Bio)</label>
                      <textarea
                        name="bio"
                        rows="4"
                        value={profile.bio}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none"
                      ></textarea>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/10 transition duration-200"
                      >
                        <Save size={18} />
                        حفظ التغييرات
                      </button>
                    </div>
                  </form>
                )}

                {/* تبويب: الأمان */}
                {activeTab === 'security' && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4 max-w-xl">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">كلمة المرور الحالية</label>
                        <input
                          type="password"
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 transition text-left"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">كلمة المرور الجديدة</label>
                        <input
                          type="password"
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 transition text-left"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">تأكيد كلمة المرور الجديدة</label>
                        <input
                          type="password"
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 transition text-left"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition duration-200"
                      >
                        <Save size={18} />
                        تحديث كلمة المرور
                      </button>
                    </div>
                  </form>
                )}

                {/* تبويب: الإشعارات */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-slate-200 mb-4">تفضيلات الإشعارات</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800/60 rounded-xl cursor-pointer">
                        <div>
                          <p className="text-sm font-medium text-slate-200">إشعارات البريد الإلكتروني</p>
                          <p className="text-xs text-slate-400">استقبل تقارير الأداء الأسبوعية وتحديثات النظام الأساسية.</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-cyan-500" />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800/60 rounded-xl cursor-pointer">
                        <div>
                          <p className="text-sm font-medium text-slate-200">إشعارات العمليات والأمان</p>
                          <p className="text-xs text-slate-400">تنبيهات فورية عند تسجيل الدخول من جهاز جديد أو حدوث عمليات شراء.</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-cyan-500" />
                      </label>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
