"use client";

import { SignInButton, SignOutButton, UseUser } from "@clerk/nextjs";
import { useState } from "react";

export default function LoginPage() {
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // دالة مخصصة لطلب تنظيف وتهيئة الجداول يدويًا عبر الرابط الخاص بك عند الحاجة
  const handleResetDatabase = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      // استدعاء رابط الـ API الخاص بك الذي قمنا بإنشائه ومربوط بـ GitHub
      const response = await fetch("/api/webhooks/clerk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // محاكاة إرسال بيانات مستخدم للتجربة والتنظيف
        body: JSON.stringify({
          type: "user.created",
          data: {
            id: user?.id || "test_user_123",
            email_addresses: [
              { email_address: user?.primaryEmailAddress?.emailAddress || "test@example.com" }
            ]
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        setStatusMessage("✅ تم تنظيف السكيمات وبناء الجداول الـ 9 بنجاح في نيون!");
      } else {
        setStatusMessage(`❌ فشل السيرفر: ${data.error || "خطأ غير معروف"}`);
      }
    } catch (error) {
      setStatusMessage("❌ حدث خطأ أثناء الاتصال بالسيرفر");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 text-center">
        <h1 className="text-3xl font-bold mb-2 text-indigo-400">تطبيق رقة ✨</h1>
        <p className="text-slate-400 mb-8 text-sm">منصتكِ الذكية لمتابعة الصحة، الحمل، واليوميات</p>

        {!isSignedIn ? (
          // واجهة المستخدم إذا لم تكن مسجلة دخول
          <div>
            <div className="mb-6 p-4 bg-slate-850 rounded-lg border border-slate-700 text-slate-300 text-sm">
              يرجى تسجيل الدخول للوصول إلى السكيما والجداول الخاصة بكِ.
            </div>
            
            <SignInButton mode="modal">
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/30">
                تسجيل الدخول / إنشاء حساب بجيميل
              </button>
            </SignInButton>
          </div>
        ) : (
          // واجهة المستخدم بعد تسجيل الدخول بنجاح
          <div>
            <div className="flex items-center justify-center space-x-4 space-x-reverse mb-6">
              {user?.imageUrl && (
                <img src={user.imageUrl} alt="Profile" className="w-12 h-12 rounded-full border-2 border-indigo-500" />
              )}
              <div className="text-right">
                <p className="font-semibold text-slate-200">{user?.fullName || "مرحباً بكِ"}</p>
                <p className="text-xs text-slate-400">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>

            {/* زر "فرش الجداول" والتهيئة اليدوية للتجربة والفحص المباشر */}
            <div className="mt-4 p-4 bg-slate-750 rounded-xl border border-slate-750 mb-6">
              <p className="text-xs text-slate-400 mb-3 text-right">أداة المطور: اضغط أدناه لطلب رابط الـ Webhook وعمل فرش وبناء للجداول الـ 9 فوراً في Neon</p>
              <button
                onClick={handleResetDatabase}
                disabled={loading}
                className={`w-full text-sm font-medium py-2.5 px-4 rounded-lg transition duration-200 ${
                  loading ? "bg-amber-605 cursor-not-allowed text-slate-800" : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {loading ? "جاري فرش وبناء الجداول..." : "⚡ فرش وبناء جداول السكيما الآن"}
              </button>

              {statusMessage && (
                <p className="text-xs mt-3 p-2 bg-slate-900 rounded border border-slate-700 text-center">
                  {statusMessage}
                </p>
              )}
            </div>

            <SignOutButton>
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded-xl transition duration-200 text-sm">
                تسجيل الخروج
              </button>
            </SignOutButton>
          </div>
        )}
      </div>
      
      <footer className="mt-8 text-xs text-slate-500">
        تطبيق رقة المستضاف على Vercel ومتصل بـ Clerk & Neon Postgres
      </footer>
    </div>
  );
}
