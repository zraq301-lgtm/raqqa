import pkg from 'pg';
const { Pool } = pkg;

// إعداد الاتصال باستخدام المتغير DATABASE_URL المربوط بـ Neon
const dbUrl = new URL(process.env.DATABASE_URL);
const pool = new Pool({
  host: dbUrl.hostname,
  port: dbUrl.port,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.split('/')[1],
  ssl: { rejectUnauthorized: false },
  max: 1
});

export default async function handler(req, res) {
  // البيانات الجديدة التي أرسلتها الآن
  const clientId = "WnZnKbbif97XaxcqaJMTNupXoPMctK";
  const clientSecret = "E92XkRBsGlGGRptKgWxY5GB6JfRDP4";
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    // 1. طلب توكن الوصول من Admitad بالبيانات الجديدة
    const authRes = await fetch('https://api.admitad.com/token/', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'scope': 'public_data products advcampaigns'
      })
    });
    
    const authData = await authRes.json();

    // فحص إذا كانت هناك مشكلة في المصادقة
    if (!authData.access_token) {
      return res.status(401).json({ 
        success: false, 
        error: "فشل المصادقة مع Admitad", 
        details: authData.error_description || authData.error 
      });
    }

    // 2. جلب العروض النشطة (limit=20 كبداية)
    const prodRes = await fetch('https://api.admitad.com/advcampaigns/?limit=20&connection_status=active', {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });
    const data = await prodRes.json();
    const offers = data.results || [];

    // 3. التحديث في قاعدة بيانات نيون (Neon)
    for (const item of offers) {
      await pool.query(`
        INSERT INTO "Product" ("admitadId", "name", "url", "image", "price", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT ("admitadId") 
        DO UPDATE SET 
          "name" = EXCLUDED."name",
          "url" = EXCLUDED."url",
          "image" = EXCLUDED."image",
          "updatedAt" = NOW()
      `, [
        item.id.toString(),
        item.name,
        item.goto_link,
        item.logo,
        'عرض خاص'
      ]);
    }

    return res.status(200).json({ 
      success: true, 
      count: offers.length,
      message: "تم تحديث المنتجات بنجاح باستخدام المفاتيح الجديدة ✅" 
    });

  } catch (error) {
    console.error('❌ Sync Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
