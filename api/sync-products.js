// تأكد أن هذا هو أول سطر ولا يوجد أي استيراد لـ 'postgres'
import pkg from 'pg';
const { Pool } = pkg;

// إعداد الاتصال
const dbUrl = new URL(process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL);
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
  // بيانات Admitad
  const clientId = "WnZbtkibif97XaxcqaJMTNupXoPMctK";
  const clientSecret = "E92XkRBsGlGGRptKgWxY5GB6JfRDP4";
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    // 1. جلب التوكن
    const authRes = await fetch('https://api.admitad.com/token/', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: 'grant_type=client_credentials&scope=public_data products advcampaigns'
    });
    const authData = await authRes.json();
    if (!authData.access_token) throw new Error('Admitad Auth Failed');

    // 2. جلب المنتجات
    const prodRes = await fetch('https://api.admitad.com/advcampaigns/?limit=20&connection_status=active', {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });
    const data = await prodRes.json();
    const offers = data.results || [];

    // 3. التحديث في نيون (Neon) باستخدام Pool
    for (const item of offers) {
      await pool.query(`
        INSERT INTO "Product" ("admitadId", "name", "url", "image", "price", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT ("admitadId") DO UPDATE SET 
          "name" = EXCLUDED."name", 
          "url" = EXCLUDED."url", 
          "image" = EXCLUDED."image", 
          "updatedAt" = NOW()
      `, [item.id.toString(), item.name, item.goto_link, item.logo, 'عرض خاص']);
    }

    return res.status(200).json({ success: true, count: offers.length });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
