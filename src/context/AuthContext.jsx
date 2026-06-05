import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient.jsx';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. فحص الجلسة الحالية عند إقلاع التطبيق
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. الاستماع لأي تغيير في حالة تسجيل الدخول (دخول / خروج)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // دالة تسجيل الدخول عبر جوجل (OAuth) المربوطة بالمعرفات الجديدة
  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // يتم التوجيه تلقائياً بناءً على الرابط المعتمد في الـ Redirect URIs بجوجل
          redirectTo: window.location.origin, 
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("خطأ أثناء تسجيل الدخول بجوجل:", error.message);
    }
  };

  // دالة تسجيل الخروج
  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
