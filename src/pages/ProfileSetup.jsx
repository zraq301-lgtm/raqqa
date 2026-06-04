import { SignInButton, SignOutButton, useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Capacitor, CapacitorHttp } from "@capacitor/core";

export default function ProfileSetup() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  // مفتاح أمان لكسر التعليق إذا تأخر Clerk لأكثر من ثانيتين
  const [showInterface, setShowInterface] = useState(false);

  useEffect(() => {
    // إذا اكتمل التحميل من Clerk، اظهر الواجهة فوراً
    if (isLoaded) {
      setShowInterface(true);
    } else {
      // إذا تأخر Clerk (خاصة على الموبايل)، اظهر الواجهة بعد ثانيتين للأمان
      const timer = setTimeout(() => setShowInterface(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  const handleResetDatabase = async () => {
    setLoading(true);
    setStatusMessage("");
    const TARGET_API_URL = "https://raqqa-hjl8.vercel.app/api/user/setup-rooms/route";
    
    const payload = {
      type: "user.created",
      data: {
        id: user?.id || "unregistered_user",
        email_addresses: [{ email: user?.primaryEmailAddress?.emailAddress || "no-email@local" }]
      }
    };

    try {
      let response;
      if (Capacitor.isNativePlatform()) {
        response = await CapacitorHttp.post({
          url: TARGET_API_URL,
          headers: { 'Content-Type': 'application/json' },
          data: payload
        });
      } else {
        const res = await fetch(TARGET_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        response = { status: res.status, data: await res.json() };
      }

      if (response.status === 200 || response.status === 201) {
        setStatusMessage("✨ تم بناء غرفكِ بنجاح!");
      } else {
        setStatusMessage(`❌ خطأ: ${response.data?.error || "فشل السيرفر"}`);
      }
    } catch (error) {
      setStatusMessage("❌ حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  // الشرط المعدل: لا تعرض شاشة التحميل إلا إذا كان showInterface كاذباً
  if (!showInterface) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-rose-500 animate-pulse font-bold">جاري تحضير رقة... ✨</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-rose-50 to-pink-100 flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl text-center border border-white">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">رقة ✨</h1>
        
        {/* إذا لم يتم تسجيل الدخول، تظهر واجهة الدخول بدلاً من الشاشة البيضاء */}
        {!isSignedIn ? (
          <div className="space-y-6">
            <p className="text-slate-500 text-sm">يرجى تسجيل الدخول للوصول إلى عالمكِ الخاص.</p>
            <SignInButton mode="modal">
              <button className="w-full bg-rose-400 text-white font-bold py-3 rounded-2xl shadow-lg active:scale-95 transition">
                تسجيل الدخول عبر Clerk
              </button>
            </SignInButton>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-rose-50 p-4 rounded-2xl flex items-center gap-4">
              <img src={user?.imageUrl} className="w-12 h-12 rounded-full border-2 border-rose-200" alt="profile" />
              <div className="text-right">
                <p className="font-bold text-slate-700">{user?.fullName}</p>
                <p className="text-xs text-slate-400">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>

            <button
              onClick={handleResetDatabase}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold transition ${loading ? "bg-slate-200 text-slate-400" : "bg-purple-500 text-white hover:bg-purple-600"}`}
            >
              {loading ? "جاري البناء..." : "⚡ فرش وغرف البيانات الآن"}
            </button>

            {statusMessage && <div className="text-xs p-2 rounded-lg bg-white border border-rose-100">{statusMessage}</div>}

            <SignOutButton>
              <button className="w-full text-xs text-slate-400 mt-4 underline">تبديل الحساب</button>
            </SignOutButton>
          </div>
        )}
      </div>
    </div>
  );
}
