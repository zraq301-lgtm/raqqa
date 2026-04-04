import admin from 'firebase-admin';

// 1. معالجة المفتاح الخاص بشكل آمن لـ Node 24
const rawKey = process.env.FIREBASE_PRIVATE_KEY;
const formattedKey = rawKey 
  ? rawKey.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1').trim() 
  : undefined;

console.log(`[Firebase Init] Key Present: ${!!formattedKey}, Length: ${formattedKey?.length}`);

const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": formattedKey,
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (initError) {
    console.error('❌ Firebase Init Error:', initError.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let { 
    fcmToken, 
    title, 
    body, 
    category,
    token,
    isFromMake,
    type,       // أضفنا هذا لاستقبال نوع الطلب (وردبريس أم لا)
    image       // أضفنا هذا لاستقبال صورة المقال من وردبريس
  } = req.body;

  const targetToken = fcmToken || token;

  try {
    // --- تعديل ذكي: إذا كان الطلب من وردبريس، نرسل لـ Topic بدلاً من Token واحد ---
    const isWordPress = type === "wordpress_article";
    
    if (!targetToken && !isWordPress) {
      return res.status(400).json({ error: "Missing Device Token (fcmToken)" });
    }

    if (!formattedKey) {
      throw new Error("FIREBASE_PRIVATE_KEY is missing or undefined in environment variables.");
    }

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

    let finalTitle, finalBody, finalImage;
    
    if (isFromMake === true || String(isFromMake).toLowerCase() === "true") {
      finalTitle = selected.t;
      finalBody = selected.b;
      finalImage = `https://raqqa-hjl8.vercel.app/assets/notifications/${finalCategory}.png`;
    } else {
      finalTitle = title && title.trim() !== "" ? title : selected.t;
      finalBody = body && body.trim() !== "" ? body : selected.b;
      // إذا كانت هناك صورة مرسلة (من وردبريس) نستخدمها، وإلا نستخدم الصورة الافتراضية للفئة
      finalImage = image || `https://raqqa-hjl8.vercel.app/assets/notifications/${finalCategory}.png`;
    }

    // تجهيز كائن الرسالة
    const messagePayload = {
      notification: { 
        title: finalTitle, 
        body: finalBody,
        image: finalImage 
      },
      android: {
        priority: "high",
        notification: {
          channelId: "default",
          sound: "default",
          image: finalImage,
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
          image: finalImage
        }
      }
    };

    // --- تحديد الوجهة: إما Token جهاز واحد أو Topic لجميع المستخدمين ---
    if (isWordPress) {
      messagePayload.topic = "all_users"; 
    } else {
      messagePayload.token = targetToken;
    }

    const messageId = await admin.messaging().send(messagePayload);

    return res.status(200).json({ 
      success: true, 
      message_id: messageId,
      details: {
        sent_to: isWordPress ? "topic:all_users" : targetToken,
        category: finalCategory
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
