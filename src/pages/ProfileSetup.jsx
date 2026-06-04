import { useUser, useSignIn, SignOutButton } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Capacitor, CapacitorHttp } from "@capacitor/core";

export default function ProfileSetup() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signIn } = useSignIn(); 
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [forceShow, setForceShow] = useState(false);

  // حرس أمان: إذا تأخر Clerk لأي سبب في الموبايل، اظهر الواجهة فوراً ولا تعلّق الشاشة
  useEffect(() => {
    const timer = setTimeout(() => setForceShow(true), 1500);
    if (isLoaded) setForceShow(true);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  // دالة الدخول المباشرة للمنصات (جوجل وفيسبوك)
  const handleSocialSignIn = async (provider) => {
    if (!signIn) {
      setStatusMessage("❌ نظام Clerk جاري تحضيره، انتظر لحظة وأعد الضغط...");
      return;
    }
    try {
      await signIn.authenticateWithRedirect({
        strategy: `oauth_${provider}`,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/"
      });
    } catch (err) {
      console.error(err);
      setStatusMessage(`❌ خطأ أثناء التوجيه: ${err.message || err}`);
    }
  };

  // دالة تهيئة غرف البيانات الـ 9 في السيرفر
  const handleResetDatabase = async () => {
    setLoading(true);
    setStatusMessage("");
    const TARGET_API_URL = "https://raqqa-hjl8.vercel.app/api/user/setup-rooms/route";
    
    const payload = {
      type: "user.created",
      data: {
        id: user?.id || "unknown_id",
        email_addresses: [{ email: user?.primaryEmailAddress?.emailAddress || "no-email@internal" }]
      }
    };

    try {
      let responseStatus;
      let responseData;

      // استخدام CapacitorHttp القياسي والصواب لتخطي حظر الموبايل
      if (Capacitor.isNativePlatform()) {
        const response = await CapacitorHttp.post({
          url: TARGET_API_URL,
          headers: { 'Content-Type': 'application/json' },
          data: payload
        });
        responseStatus = response.status;
        responseData = response.data;
      } else {
        const res = await fetch(TARGET_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        responseStatus = res.status;
        responseData = await res.json();
      }

      if (responseStatus === 200 || responseStatus === 201) {
        setStatusMessage("✨ ممتاز! تم بناء وتجهيز غرفكِ الـ 9 بنجاح داخل رقة.");
      } else {
        setStatusMessage(`❌ رفض السيرفر: ${responseData?.error || "خطأ غير معروف"}`);
      }
    } catch (error) {
      setStatusMessage("❌ حدث خطأ في الاتصال بالشبكة الخارجية");
    } finally {
      setLoading(false);
    }
  };

  // لن تظهر شاشة بيضاء معلقة بعد الآن
  if (!forceShow) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-rose-500 font-bold animate-pulse">جاري تحضير رقة... ✨</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-rose-50 via-purple-50 to-pink-100 flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white text-center relative overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-300 via-pink-400 to-purple-400"></div>

        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
          رقة ✨
        </h1>
        <p className="text-slate-500 mb-8 text-sm">
          ملاذكِ الذكي لمتابعة روتينكِ الصحي بخصوصية تامة
        </p>

        {!isSignedIn ? (
          /* 1️⃣ واجهة تسجيل الدخول - تظهر فوراً وبدون تعليق */
          <div className="space-y-4">
            <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 text-rose-700 text-sm">
              أهلاً بكِ في عالمكِ الخاص.. يرجى اختيار طريقة الدخول الآمنة للبدء:
            </div>
            
            {/* زر جوجل */}
            <button 
              onClick={() => handleSocialSignIn("google")}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-3.5 px-4 rounded-2xl hover:bg-slate-50 transition shadow-sm font-bold text-slate-700 active:scale-95"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
              تسجيل الدخول عبر حساب Gmail
            </button>

            {/* زر فيسبوك */}
            <button 
              onClick={() => handleSocialSignIn("facebook")}
              className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white py-3.5 px-4 rounded-2xl hover:opacity-95 transition shadow-md font-bold active:scale-95"
            >
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5 brightness-200" alt="F" />
              تسجيل الدخول عبر حساب فيسبوك
            </button>
          </div>
        ) : (
          /* 2️⃣ واجهة التحكم بعد الدخول بنجاح */
          <div className="space-y-6">
            <div className="flex items-center justify-center bg-rose-50 p-4 rounded-2xl gap-4 border border-rose-100">
              {user?.imageUrl && (
                <img src={user.imageUrl} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="profile" />
              )}
              <div className="text-right">
                <p className="font-bold text-slate-700">{user?.fullName || "مرحباً بكِ"}</p>
                <p className="text-xs text-slate-400 font-mono">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>

            <div className="mt-4 p-5 bg-purple-50/40 rounded-2xl border border-purple-100 text-right">
              <h3 className="text-xs font-bold text-purple-700 mb-1">لوحة التحكم الفنية</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                اضغطي أدناه لإرسال طلب بناء الـ 9 غرف فنية مستقلة داخل قاعدة البيانات نيون.
              </p>
              
              <button
                onClick={handleResetDatabase}
                disabled={loading}
                className={`w-full text-sm font-semibold py-3 px-4 rounded-xl transition duration-300 shadow-md ${
                  loading 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-95 text-white active:scale-95"
                }`}
              >
                {loading ? "جاري تهيئة غرف البيانات..." : "⚡ فرش وبناء مساحتكِ الآن"}
              </button>

              {statusMessage && (
                <div className="text-xs mt-3 p-3 rounded-xl border bg-slate-50 text-slate-700 font-medium text-center">
                  {statusMessage}
                </div>
              )}
            </div>

            <SignOutButton>
              <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 py-2 rounded-xl transition text-xs border border-slate-200">
                تسجيل الخروج
              </button>
            </SignOutButton>
          </div>
        )}
      </div>
    </div>
  );
}
