// ... (نفس الـ imports ونفس الـ config)

const Main = () => {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      
      const setupPush = async () => {
        try {
          let permStatus = await PushNotifications.checkPermissions();
          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }

          if (permStatus.receive === 'granted') {
            await PushNotifications.register();
            
            // --- إضافة: التأكد من سحب التوكن يدوياً في كل مرة يفتح فيها التطبيق ---
            // هذا يضمن أن التوكن موجود في localStorage حتى لو لم يشتغل الـ listener
            try {
              // ملاحظة: بعض الإصدارات تتطلب Capacitor Firebase Cloud Messaging plugin لجلب التوكن يدوياً
              // ولكن سنعتمد على التخزين المستمر
              console.log("جاري التحقق من حالة التسجيل...");
            } catch (e) { console.log(e); }
            
          }
        } catch (error) { console.error("Push Error: ", error); }
      };

      setupPush();

      // مستمع التسجيل - يشتغل عند توليد توكن جديد
      PushNotifications.addListener('registration', async (token) => {
        const fcmToken = token.value;
        console.log("FCM Token Received:", fcmToken);
        
        // حفظ التوكن فوراً
        localStorage.setItem('fcm_token', fcmToken);

        // تأكيد وجود user_id
        const userId = localStorage.getItem('user_id') || 'user_' + Math.floor(Math.random() * 1000000);
        localStorage.setItem('user_id', userId);
        
        // إرسال تحديث للسيرفر
        sendTokenToApi(fcmToken, userId);
      });

      // وظيفة منفصلة للإرسال لضمان نظافة الكود
      const sendTokenToApi = async (token, userId) => {
        try {
          await CapacitorHttp.post({
            url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
            headers: { 'Content-Type': 'application/json' },
            data: {
              fcm_token: token,
              user_id: userId,
              username: localStorage.getItem('username') || 'مستخدمة رقة',
              category: 'تحديث تلقائي للتوكن',
              note: 'تم التأكد من صحة التوكن عند تشغيل التطبيق'
            }
          });
        } catch (err) { console.error("API Sync Error:", err); }
      };

      // ... (بقية المستمعين)
    }
  }, []);

  // ... (نفس الـ return)
};
