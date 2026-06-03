import { SignInButton, SignOutButton, useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { CapacitorHttp } from "@capacitor/core";

export default function LoginPage() {
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // دالة طلب تنظيف وتهيئة الجداول باستخدام CapacitorHttp بدلاً من fetch التقليدي
  const handleResetDatabase = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      const options = {
        url: "https://raqqa-hjl8.vercel.app/api/webhooks/clerk",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          type: "user.created",
          data: {
            id: user?.id || "test_user_123",
            email_addresses: [
              { email_address: user?.primaryEmailAddress?.emailAddress || "test@example.com" }
            ]
          }
        }
      };

      // إرسال الطلب عبر الجسر النيتف لـ Capacitor لمنع أخطاء CORS على الهواتف
      const response = await CapacitorHttp.post(options);

      if (response.status === 200 || response.status === 201) {
        setStatusMessage("✨ تم تهيئة السكيما وبناء غرفكِ الـ 9 بنجاح في رقة!");
      } else {
        setStatusMessage(`❌ تواصل مع السيرفر فشل: ${response.data?.error || "خطأ غير معروف"}`);
      }
    } catch (error) {
      setStatusMessage("❌ حدث خطأ أثناء الاتصال بالنظام الخارجي");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-rose-50 via-purple-50 to-pink-100 text-slate-800 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-pink-100 border border-white/50 text-center relative overflow-hidden">
        
        {/* زخرفة خلفية علوية ناعمة */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-300 via-pink-400 to-purple-400"></div>

        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent tracking-wide">
          رقة ✨
        </h1>
        <p className="text-slate-500 mb-8 text-sm font-medium">
          ملاذكِ الذكي لمتابعة روتينكِ الصحي، الحمل، واليوميات بخصوصية تامة
        </p>

        {!isSignedIn ? (
          // واجهة المستخدم إذا لم تكن مسجلة دخول
          <div className="space-y-6">
            <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 text-rose-700 text-sm leading-relaxed">
              أهلاً بكِ في عالمكِ الخاص.. يرجى تسجيل الدخول للوصول إلى دليلكِ الصحي وجداولكِ الآمنة.
            </div>
            
            <SignInButton mode="modal">
              <button className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-semibold py-3.5 px-4 rounded-2xl transition duration-300 shadow-lg shadow-pink-200 text-base active:scale-95">
                تسجيل الدخول عبر Gmail
              </button>
            </SignInButton>
          </div>
        ) : (
          // واجهة المستخدم بعد تسجيل الدخول بنجاح
          <div>
            <div className="flex items-center justify-center space-x-4 space-x-reverse bg-gradient-to-r from-rose-50 to-purple-50 p-4 rounded-2xl border border-rose-100/50 mb-6">
              {user?.imageUrl && (
                <img src={user.imageUrl} alt="Profile" className="w-14 w-14 rounded-full border-2 border-pink-300 p-0.5 shadow-sm" />
              )}
              <div className="text-right">
                <p className="font-bold text-slate-700 text-md">{user?.fullName || "مرحباً بكِ"}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>

            {/* قسم إدارة المطور لفرش الجداول */}
            <div className="mt-4 p-5 bg-purple-50/40 rounded-2xl border border-purple-100 mb-6 text-right">
              <h3 className="text-xs font-bold text-purple-700 mb-1">لوحة التحكم الفنية</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                اضغطي أدناه لتحديث الجداول وإرسال الطلب الآمن عبر جسر CapacitorHttp إلى قاعدة البيانات.
              </p>
              
              <button
                onClick={handleResetDatabase}
                disabled={loading}
                className={`w-full text-sm font-semibold py-3 px-4 rounded-xl transition duration-300 shadow-md ${
                  loading 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-purple-100 active:scale-95"
                }`}
              >
                {loading ? "جاري تهيئة غرف البيانات..." : "⚡ فرش وبناء مساحتكِ الآن"}
              </button>

              {statusMessage && (
                <div className={`text-xs mt-3 p-3 rounded-xl border text-center font-medium ${
                  statusMessage.includes("✅") || statusMessage.includes("✨")
                    ? "bg-emerald-50 border-emerald-150 text-emerald-700"
                    : "bg-rose-50 border-rose-150 text-rose-700"
                }`}>
                  {statusMessage}
                </div>
              )}
            </div>

            <SignOutButton>
              <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-medium py-2.5 px-4 rounded-xl transition duration-200 text-xs border border-slate-250/60">
                مغادرة الحساب الحالي
              </button>
            </SignOutButton>
          </div>
        )}
      </div>
      
      <footer className="mt-8 text-xs text-slate-400/80 font-medium tracking-wide">
        جميع بياناتكِ مشفرة ومحفوظة عبر سكيما مستقلة في نيون 🔒
      </footer>
    </div>
  );
}
