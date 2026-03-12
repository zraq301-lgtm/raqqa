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

  // استلام البيانات
  let { 
    fcmToken, 
    title, 
    body, 
    category,
    token,
    isFromMake // متغير نستخدمه للتأكد إذا كان الطلب من ميك
  } = req.body;

  const targetToken = fcmToken || token;

  try {
    // 1. التحقق من وجود توكن الجهاز
    if (!targetToken) {
      return res.status(400).json({ error: "Missing Device Token (fcmToken)" });
    }

    // --- قوالب النصوص الذكية ---
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

    const finalCategory = category || 'general';
    const selected = templates[finalCategory] || { t: "تنبيه من رقة 🌸", b: "لديكِ تحديث جديد في التطبيق." };

    // ⚡ التعديل الجوهري: إذا كان الطلب من ميك، نستخدم القالب إجبارياً ونتجاهل النصوص المرسلة
    let finalTitle, finalBody;
    
    if (isFromMake === true || String(isFromMake).toLowerCase() === "true") {
      finalTitle = selected.t;
      finalBody = selected.b;
    } else {
      // إذا كان من الواجهة، نستخدم النص المرسل أو القالب كاحتياط
      finalTitle = title && title.trim() !== "" ? title : selected.t;
      finalBody = body && body.trim() !== "" ? body : selected.b;
    }

    // 3. تحديث رابط الصورة
    const imageUrl = `https://raqqa-hjl8.vercel.app/assets/notifications/${finalCategory}.png`;

    // 4. بناء كائن الإشعار
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

    return res.status(200).json({ 
      success: true, 
      message_id: messageId,
      details: {
        sent_to: targetToken,
        category: finalCategory,
        using_template: true
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
