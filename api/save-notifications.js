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
    scheduled_for, startDate, endDate,
    next_appointment, expected_due_date, fitness_time
  } = req.body;

  try {
    const now = new Date();
    const isSentStatus = false;

    // --- منطق التصنيف والجدولة الزمنية ---
    let finalCategory = category;
    let finalScheduledDate = scheduled_for ? new Date(scheduled_for) : new Date();
    let notificationsToInsert = []; // مصفوفة لتخزين عدة إشعارات إذا لزم الأمر (مثل الحمل)

    switch (category) {
      case 'الحيض':
        // يسجل موعد الدورة القادمة (يفترض أنه مرسل في scheduled_for)
        finalScheduledDate = new Date(scheduled_for);
        break;

      case 'الحمل':
        if (expected_due_date) {
          const dueDate = new Date(expected_due_date);
          let tempDate = new Date();
          // إضافة إشعار لكل شهر من الآن وحتى تاريخ الولادة
          while (tempDate < dueDate) {
            tempDate.setMonth(tempDate.getMonth() + 1);
            if (tempDate <= dueDate) {
              notificationsToInsert.push({
                date: new Date(tempDate),
                title: "رحلة الحمل 🤰",
                body: "تذكير شهري: اقترب موعد لقاء طفلكِ، اعتني بنفسكِ جيداً."
              });
            }
          }
        }
        break;

      case 'الرضاعة':
        // تاريخ اليوم ولكن بساعة متقدمة (مثلاً بعد ساعة من الآن)
        finalScheduledDate = new Date();
        finalScheduledDate.setHours(finalScheduledDate.getHours() + 1);
        break;

      case 'الأمومة':
        // بعد يومان من التاريخ الحالي
        finalScheduledDate = new Date();
        finalScheduledDate.setDate(finalScheduledDate.getDate() + 2);
        break;

      case 'موعد الطبيب':
        // موعد الطبيب القادم ناقص يومان لتسهيل التنبيه المبكر
        if (next_appointment) {
          finalScheduledDate = new Date(next_appointment);
          finalScheduledDate.setDate(finalScheduledDate.getDate() - 2);
        }
        break;

      case 'الرشاقة':
        // توقيتات بالساعة (إذا أرسلت الواجهة ساعة معينة اليوم)
        if (fitness_time) {
          const [hours, minutes] = fitness_time.split(':');
          finalScheduledDate = new Date();
          finalScheduledDate.setHours(parseInt(hours), parseInt(minutes), 0);
        }
        break;

      case 'الفقة':
      case 'المشاعر النفسية':
        // تاريخ بعد يومان
        finalScheduledDate = new Date();
        finalScheduledDate.setDate(finalScheduledDate.getDate() + 2);
        break;

      case 'العلاقات الحميمية':
        // بعد ثلاثة أيام
        finalScheduledDate = new Date();
        finalScheduledDate.setDate(finalScheduledDate.getDate() + 3);
        break;

      default:
        finalScheduledDate = scheduled_for ? new Date(scheduled_for) : new Date();
    }

    // تجهيز الاستعلام
    const query = `
      INSERT INTO notifications (user_id, fcm_token, category, title, body, is_sent, scheduled_for, extra_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const userIdInt = isNaN(parseInt(user_id)) ? 1 : parseInt(user_id);
    const extraData = JSON.stringify({ next_appointment, expected_due_date, original_category: category });

    let insertedIds = [];

    // تنفيذ الإدخال
    if (notificationsToInsert.length > 0) {
      // حالة الحمل (عدة إشعارات)
      for (const note of notificationsToInsert) {
        const resDb = await pool.query(query, [userIdInt, fcmToken, category, note.title, note.body, isSentStatus, note.date, extraData]);
        insertedIds.push(resDb.rows[0].id);
      }
    } else {
      // الحالات العادية (إشعار واحد)
      const resDb = await pool.query(query, [userIdInt, fcmToken, category, title || category, body || `تذكير بخصوص ${category}`, isSentStatus, finalScheduledDate, extraData]);
      insertedIds.push(resDb.rows[0].id);
    }

    return res.status(200).json({ 
      success: true, 
      message: "تم حفظ البيانات بنجاح", 
      inserted_ids: insertedIds 
    });

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
