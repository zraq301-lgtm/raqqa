import React, { useState, useEffect } from "react";
import { useUser, useSignIn, SignOutButton } from "@clerk/clerk-react";
import { Capacitor, CapacitorHttp } from "@capacitor/core";

export default function ProfileSetup({ onComplete }) {
  // حماية آمنة لاستدعاء الـ Hooks الخاصة بـ Clerk لضمان عدم انهيار الشاشة
  let clerkUser = null;
  let clerkSignIn = null;
  let isClerkLoaded = false;

  try {
    const userContext = useUser();
    const signInContext = useSignIn();
    clerkUser = userContext.user;
    clerkSignIn = signInContext.signIn;
    isClerkLoaded = userContext.isLoaded;
  } catch (e) {
    console.warn("Clerk لم يجهر بعد خلف الكواليس...");
  }

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    if (isClerkLoaded) {
      setForceShow(true);
    } else {
      const timer = setTimeout(() => setForceShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isClerkLoaded]);

  const handleSocialSignIn = async (provider) => {
    if (!clerkSignIn) {
      setStatusMessage("❌ نظام الدخول جاري تهيئته، يرجى الانتظار ثوانٍ...");
      return;
    }
    try {
      await clerkSignIn.authenticateWithRedirect({
        strategy: `oauth_${provider}`,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/"
      });
    } catch (err) {
      setStatusMessage(`❌ خطأ أثناء توجيه الدخول: ${err.message || err}`);
    }
  };

  const handleResetDatabase = async () => {
    setLoading(true);
    setStatusMessage("");

    // 🎯 ضبط الرابط الديناميكي الاحترافي للـ API الموحد لـ Vercel والموبايل
    const TARGET_API_URL = Capacitor.isNativePlatform()
      ? "https://raqqa-hjl8.vercel.app/api/route" // رابط خارجي صريح للموبايل
      : "/api/route"; // مسار نسبي فائق السرعة والأمان للـ Web

    const payload = {
      type: "user.created",
      data: {
        id: clerkUser?.id || "unknown_id",
        email_addresses: [{ email: clerkUser?.primaryEmailAddress?.emailAddress || "no-email@internal" }]
      }
    };

    try {
      let responseStatus;
      let responseData;

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
        if (onComplete) onComplete(); 
      } else {
        setStatusMessage(`❌ رفض السيرفر: ${responseData?.error || "خطأ غير معروف"}`);
      }
    } catch (error) {
      setStatusMessage("❌ حدث خطأ في الاتصال بالسيرفر الخلفي لـ رقة");
    } finally {
      setLoading(false);
    }
  };

  if (!forceShow) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center font-sans" dir="rtl">
        <div className="text-center space-y-3">
          <div className="text-rose-500 font-bold animate-pulse text-2xl">رقة ✨</div>
          <div className="text-xs text-slate-400">جاري الاتصال بالبنية التحتية...</div>
        </div>
      </div>
    );
  }

  const userIsSignedIn = !!clerkUser;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-rose-100 via-purple-50 to-pink-200 flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-pink-200/50 border border-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500"></div>

        <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 bg-clip-text text-transparent tracking-wide">
          رقة ✨
        </h1>
        <p className="text-slate-500 mb-10 text-sm font-medium">
          ملاذكِ الذكي لمتابعة روتينكِ الصحي بخصوصية تامة
        </p>

        {!userIsSignedIn ? (
          <div className="space-y-8 animate-fade-in">
            <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-100/60 text-rose-700 text-sm font-medium leading-relaxed shadow-inner">
              مرحباً بكِ في عالمكِ الخاص الفخم.. يرجى النقر على أيقونة الدخول المفضلة لكِ:
            </div>
            
            <div className="flex justify-center items-center gap-8 py-4">
              <button 
                onClick={() => handleSocialSignIn("google")}
                className="group relative flex flex-col items-center justify-center w-24 h-24 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60 transition-all duration-300 active:scale-95"
              >
                <span className="absolute inset-0 bg-rose-400/20 rounded-3xl blur-xl opacity-100 animate-pulse"></span>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-12 h-12 relative z-10 transition-transform" alt="Google" />
                <span className="text-[11px] font-bold text-slate-500 mt-2 relative z-10">Gmail</span>
              </button>

              <button 
                onClick={() => handleSocialSignIn("facebook")}
                className="group relative flex flex-col items-center justify-center w-24 h-24 bg-[#1877F2] rounded-3xl shadow-xl shadow-blue-400/40 transition-all duration-300 active:scale-95"
              >
                <span className="absolute inset-0 bg-blue-500/40 rounded-3xl blur-xl opacity-100 animate-pulse"></span>
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-12 h-12 relative z-10 transition-transform" alt="Facebook" />
                <span className="text-[11px] font-bold text-white mt-2 relative z-10">Facebook</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-center bg-gradient-to-r from-rose-50 to-purple-50 p-4 rounded-2xl gap-4 border border-rose-100/50 shadow-sm">
              {clerkUser?.imageUrl && (
                <img src={clerkUser.imageUrl} className="w-12 h-12 rounded-full border-2 border-pink-300 p-0.5" alt="profile" />
              )}
              <div className="text-right">
                <p className="font-bold text-slate-700">{clerkUser?.fullName || "مرحباً بكِ"}</p>
                <p className="text-xs text-slate-400 font-mono">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>

            <div className="mt-4 p-5 bg-purple-50/40 rounded-2xl border border-purple-100 text-right">
              <button
                onClick={handleResetDatabase}
                disabled={loading}
                className={`w-full text-sm font-semibold py-3.5 px-4 rounded-xl transition duration-300 shadow-md ${
                  loading 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-95 text-white active:scale-95"
                }`}
              >
                {loading ? "جاري تهيئة غرف البيانات..." : "⚡ فرش وبناء مساحتكِ الآن"}
              </button>

              {statusMessage && (
                <div className="text-xs mt-3 p-3 rounded-xl border bg-white text-slate-700 font-medium text-center shadow-sm">
                  {statusMessage}
                </div>
              )}
            </div>

            {isClerkLoaded && (
              <SignOutButton>
                <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 py-2.5 rounded-xl transition text-xs border border-slate-200">
                  تسجيل الخروج
                </button>
              </SignOutButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
