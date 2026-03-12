import admin from 'firebase-admin';

// إعداد حساب الخدمة الخاص بفيربيس
const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

export default async function handler(req, res) {
  // استقبال طلبات POST من ميك أو من الواجهة
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // استلام البيانات (دعم أسماء الحقول المختلفة من الواجهة وميك)
  let { 
    fcmToken, 
    title, 
    body, 
    category,
    token 
  } = req.body;

  const targetToken = fcmToken || token;

  try {
    // 1. التحقق من وجود توكن الجهاز (إجباري)
    if (!targetToken) {
      return res.status(400).json({ error: "Missing Device Token (fcmToken)" });
    }

    // --- إضافة قوالب النصوص الذكية لجميع الأقسام ---
    const templates = {
      'period': { t: "رقة تذكركِ 🌸", b: "سيدتي، اقترب موعد أيامكِ الهادئة.. كوني مستعدة لتدليل نفسكِ رعايةً وراحة." },
      'pregnancy': { t: "رحلة الأمومة ✨", b: "تذكير رقيق لمتابعة نمو جنينكِ.. رقة معكِ في كل خطوة من هذه الرحلة." },
      'nursing': { t: "لحظات الارتباط 🤱", b: "وقت الرضاعة هو وقت الحب؛ تأكدي من شرب المياه والحصول على قسط من الراحة." },
      'motherhood': { t: "أنتِ أم رائعة 💖", b: "تذكير بمهمة طفلكِ القادمة.. اهتمامكِ يصنع مستقبله، ورقة تهتم بكِ." },
      'medical': { t: "موعدكِ الطبي 🩺", b: "حفاظاً على صحتكِ، نذكركِ بموعد الاستشارة الطبية اليوم. دمتِ بخير." },
      'mood': { t: "رقة تهتم بقلبكِ ✨", b: "كيف حالكِ اليوم؟ خذي نفساً عميقاً، وتذكري أن مشاعركِ دائماً محل تقدير." },
      'fiqh': { t: "رفيقتكِ الفقهية 📖", b: "تذكير بالأحكام الخاصة بدورتكِ الحالية؛ لتمارسي عباداتكِ بطمأنينة ويقين." },
      'fitness': { t: "وقت النشاط 🏃‍♀️", b: "حركتكِ اليوم هي استثمار في صحتكِ.. تمرين بسيط سيجعلكِ تشعرين بالانتعاش." },
      'intimacy': { t: "لحظات الود ❤️", b: "تذكير بتعزيز التواصل والود مع شريك حياتكِ.. رقة تتمنى لكِ حياة مليئة بالحب." }
    };

    // 2. معالجة النصوص (استخدام القالب إذا لم يتم إرسال نص مخصص)
    const selected = templates[category] || { t: "تنبيه من رقة 🌸", b: "لديكِ تحديث جديد في التطبيق." };
    
    const finalTitle = title && title.trim() !== "" ? title : selected.t;
    const finalBody = body && body.trim() !== "" ? body : selected.b;
    const finalCategory = category || 'general';

    // 3. تحديث الرابط الجديد للموقع ومسار الصور
    const imageUrl = `https://raqqa-hjl8.vercel.app/assets/notifications/${finalCategory}.png`;

    // 4. بناء كائن الإشعار لضمان الظهور على جميع المنصات
    const messagePayload = {
      notification: { 
        title: finalTitle, 
        body: finalBody,
        image: imageUrl 
      },
      token: targetToken,
      android: {
        priority: "high",
        notification: {
          channelId: "default",
          sound: "default",
          image: imageUrl,
          visibility: "public"
        }
      },
      apns: {
        payload: {
          aps: { 
            sound: "default",
            mutableContent: true 
          }
        },
        fcm_options: {
          image: imageUrl
        }
      }
    };

    // 5. الإرسال الفوري لـ Firebase
    const messageId = await admin.messaging().send(messagePayload);

    // 6. رد النجاح للواجهة أو لميك
    return res.status(200).json({ 
      success: true, 
      message_id: messageId,
      details: {
        sent_to: targetToken,
        category: finalCategory,
        image: imageUrl
      }
    });

  } catch (error) {
    console.error('❌ Firebase Dispatch Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
