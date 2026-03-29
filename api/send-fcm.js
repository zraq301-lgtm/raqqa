import admin from 'firebase-admin';

// 1. معالجة المفتاح الخاص بشكل آمن لـ Node 24
// هذه الخطوة تضمن تنظيف المفتاح من أي علامات اقتباس زائدة أو مسافات
const rawKey = process.env.FIREBASE_PRIVATE_KEY;
const formattedKey = rawKey 
  ? rawKey.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1').trim() 
  : undefined;

// سجل فحص يظهر في Vercel Logs (يمكنك حذفه بعد التأكد من العمل)
console.log(`[Firebase Init] Key Present: ${!!formattedKey}, Length: ${formattedKey?.length}`);

const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": formattedKey,
};

// 2. منع إعادة تهيئة Firebase إذا كان يعمل بالفعل
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
    isFromMake 
  } = req.body;

  const targetToken = fcmToken || token;

  try {
    if (!targetToken) {
      return res.status(400).json({ error: "Missing Device Token (fcmToken)" });
    }

    // التحقق من صلاحية المفتاح قبل المحاولة
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

    let finalTitle, finalBody;
    
    if (isFromMake === true || String(isFromMake).toLowerCase() === "true") {
      finalTitle = selected.t;
      finalBody = selected.b;
    } else {
      finalTitle = title && title.trim() !== "" ? title : selected.t;
      finalBody = body && body.trim() !== "" ? body : selected.b;
    }

    const imageUrl = `https://raqqa-hjl8.vercel.app/assets/notifications/${finalCategory}.png`;

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

    const messageId = await admin.messaging().send(messagePayload);

    return res.status(200).json({ 
      success: true, 
      message_id: messageId,
      details: {
        sent_to: targetToken,
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
