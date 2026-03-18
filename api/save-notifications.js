import pkg from 'pg';
const { Pool } = pkg;

const dbUrl = new URL(process.env.DATABASE_URL);

const pool = new Pool({
  host: dbUrl.hostname,
  port: dbUrl.port,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.split('/')[1],
  ssl: { rejectUnauthorized: false },
  max: 1, 
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let { 
    fcmToken, user_id, category, title, body, 
    scheduled_for, next_appointment, expected_due_date 
  } = req.body;

  try {
    const isSentStatus = false;
    let notificationsToInsert = [];

    // 1. تحديد التاريخ الأساسي القادم من الواجهة
    let baseDate = scheduled_for ? new Date(scheduled_for) : new Date();

    // 2. منطق المعالجة حسب التصنيف (Category)
    switch (category) {
      case 'الحمل':
        if (expected_due_date) {
          const dueDate = new Date(expected_due_date);
          let tempDate = new Date(); // يبدأ من تاريخ اليوم
          
          // إضافة إشعار لكل شهر حتى تاريخ الولادة
          while (tempDate < dueDate) {
            tempDate.setMonth(tempDate.getMonth() + 1);
            if (tempDate <= dueDate) {
              notificationsToInsert.push({
                category: 'الحمل',
                date: new Date(tempDate),
                title: "رحلة الأمومة ✨",
                body: "تذكير شهري لمتابعة نمو جنينكِ.. رقة معكِ في كل خطوة."
              });
            }
          }
        } else {
          // إذا لم يرسل موعد ولادة، نستخدم التاريخ المرسل العادي
          notificationsToInsert.push({ category: 'الحمل', date: baseDate, title: title || "الحمل", body: body });
        }
        break;

      case 'موعد الطبيب':
        let doctorDate = next_appointment ? new Date(next_appointment) : baseDate;
        // تنبيه قبل الموعد بيومين
        doctorDate.setDate(doctorDate.getDate() - 2);
        notificationsToInsert.push({ category: 'موعد الطبيب', date: doctorDate, title: "موعدكِ الطبي 🩺", body: "نذكركِ بموعدكِ الطبي بعد يومين من الآن." });
        break;

      case 'الرضاعة':
        let nurseDate = new Date();
        nurseDate.setHours(nurseDate.getHours() + 1); // ساعة متقدمة
        notificationsToInsert.push({ category: 'الرضاعة', date: nurseDate, title: "وقت الرضاعة 🤱", body: "تذكير برضعة طفلكِ الآن." });
        break;

      case 'الأمومة':
      case 'الفقة':
      case 'المشاعر النفسية':
        let afterTwoDays = new Date();
        afterTwoDays.setDate(afterTwoDays.getDate() + 2);
        notificationsToInsert.push({ category: category, date: afterTwoDays, title: title || category, body: body });
        break;

      case 'العلاقات الحميمية':
        let afterThreeDays = new Date();
        afterThreeDays.setDate(afterThreeDays.getDate() + 3);
        notificationsToInsert.push({ category: category, date: afterThreeDays, title: title || category, body: body });
        break;

      case 'الرشاقة':
        // نستخدم التاريخ والوقت المرسل للرشاقة بالضبط
        notificationsToInsert.push({ category: 'الرشاقة', date: baseDate, title: "وقت النشاط 🏃‍♀️", body: "تمرين بسيط سيجعلكِ تشعرين بالانتعاش." });
        break;

      case 'الحيض':
      default:
        // للحيض وأي تصنيف آخر: نستخدم التاريخ المرسل من الواجهة كما هو بالضبط
        notificationsToInsert.push({ 
          category: category || 'عام', 
          date: baseDate, 
          title: title || "تنبيه رقة", 
          body: body || "لديكِ موعد مسجل الآن" 
        });
        break;
    }

    // 3. عملية الإدخال في قاعدة البيانات
    const query = `
      INSERT INTO notifications (user_id, fcm_token, category, title, body, is_sent, scheduled_for)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const userIdInt = isNaN(parseInt(user_id)) ? 1 : parseInt(user_id);
    let insertedIds = [];

    for (const note of notificationsToInsert) {
      const resDb = await pool.query(query, [
        userIdInt, 
        fcmToken, 
        note.category, 
        note.title, 
        note.body, 
        isSentStatus, 
        note.date
      ]);
      insertedIds.push(resDb.rows[0].id);
    }

    return res.status(200).json({ 
      success: true, 
      message: "تم الحفظ وتصحيح التصنيفات والتواريخ", 
      inserted_ids: insertedIds 
    });

  } catch (error) {
    console.error('❌ Neon Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
