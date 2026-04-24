import pkg from 'pg';
import admin from 'firebase-admin';

const { Pool } = pkg;

// 1. إعداد Firebase Admin
const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

// 2. إعداد قاعدة بيانات نيون
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1
});

const CATEGORY_MAP = {
  '788594722': 'العناية بالبشرة',
  '788519318': 'الأناقة',
  '768006428': 'الصحة',
  '788485478': 'الأمومة',
  '10783713': 'عام', 
  '788402012': 'الرشاقة',
  '347212703': 'وصفات'
};

export default async function handler(req, res) {
  const { method, headers } = req;
  const AI_API_URL = "https://raqqa-hjl8.vercel.app/api/raqqa-ai";
  const BASE_ASSETS_URL = "https://raqqa-hjl8.vercel.app/assets/notifications";

  try {
    // التحقق من الهيدر الأمني
    if (headers['zazotona'] !== '12sonds25') {
      return res.status(401).json({ success: false, error: 'Unauthorized Access' });
    }

    // نحن نهتم فقط بطلب الـ POST القادم من الأكشن
    if (method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const { postId, title, body, category, image, type } = req.body;

    // الشرط الجوهري: إذا كان المقال ووردبريس، نتحقق من قاعدة البيانات أولاً
    if (type === "wordpress_article" && postId) {
      const { rows: existing } = await pool.query(
        `SELECT id FROM sent_posts WHERE post_id = $1 LIMIT 1`, 
        [String(postId)]
      );

      // إذا وجدنا الـ ID، نوقف العملية فوراً ولا نرسل شيئاً لفيربيس
      if (existing.length > 0) {
        console.log(`Post ${postId} already sent. Skipping...`);
        return res.status(200).json({ 
          success: true, 
          skipped: true, 
          message: "هذا المقال تم إرساله من قبل، لن يتم التكرار." 
        });
      }
    }

    // إذا وصلنا هنا، يعني المقال جديد
    const categoryKey = category || '10783713';
    const categoryLabel = CATEGORY_MAP[categoryKey] || 'رقة';
    const imageUrl = image || `${BASE_ASSETS_URL}/${categoryKey}.png`;
    
    let finalTitle = title || "رقة 🌸";
    let finalBody = body || "اكتشفي الجديد في تطبيق رقة";

    // 3. استدعاء الذكاء الاصطناعي للصياغة
    try {
      const aiRes = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `بصفتك خبيرة محتوى لتطبيق "رقة"، صِيغي إشعاراً جذاباً جداً وقصيراً. 
          القسم: ${categoryLabel}
          العنوان الأصلي: ${finalTitle}
          المطلوب: عنوان مشوق مع إيموجي ونص يحفز على فتح التطبيق.`
        })
      });
      const aiData = await aiRes.json();
      finalTitle = aiData.title || finalTitle;
      finalBody = aiData.message || aiData.text || aiData.body || finalBody;
    } catch (e) { console.warn("AI Error, using original."); }

    // 4. تجهيز وإرسال الإشعار عبر فيربيس
    const messagePayload = {
      notification: { title: finalTitle, body: finalBody, image: imageUrl },
      data: { 
        image: imageUrl, 
        category: String(categoryKey),
        post_id: String(postId || ""),
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      },
      topic: "all_users"
    };

    const messageId = await admin.messaging().send(messagePayload);

    // 5. حفظ الـ ID في قاعدة البيانات فوراً بعد الإرسال الناجح لمنع التكرار مستقبلاً
    if (postId) {
      await pool.query(
        'INSERT INTO sent_posts (post_id, title) VALUES ($1, $2) ON CONFLICT (post_id) DO NOTHING', 
        [String(postId), finalTitle]
      );
    }

    return res.status(200).json({ success: true, messageId, status: "sent" });

  } catch (error) {
    console.error("API Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
