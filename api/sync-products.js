import pkg from 'pg';
const { Pool } = pkg;

// إعداد الاتصال بنفس الطريقة التي أرسلتها
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
    console.log('🔄 جاري بدء مزامنة المنتجات...');

    // 1. الحصول على التوكن من Admitad
    const authRes = await fetch('https://api.admitad.com/token/', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: 'grant_type=client_credentials&scope=public_data products advcampaigns'
    });
    const authData = await authRes.json();
    if (!authData.access_token) throw new Error('فشل الحصول على توكن Admitad');

    // 2. جلب العروض النشطة
    const prodRes = await fetch('https://api.admitad.com/advcampaigns/?limit=20&connection_status=active', {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });
    const data = await prodRes.json();
    const offers = data.results || [];

    // 3. التحديث في نيون باستخدام Pool.query (نفس أسلوب كودك)
    for (const item of offers) {
      const query = `
        INSERT INTO "Product" ("admitadId", "name", "url", "image", "price", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT ("admitadId") 
        DO UPDATE SET 
          "name" = EXCLUDED."name",
          "url" = EXCLUDED."url",
          "image" = EXCLUDED."image",
          "updatedAt" = NOW()
      `;

      const values = [
        item.id.toString(),
        item.name,
        item.goto_link,
        item.logo,
        'عرض خاص'
      ];

      await pool.query(query, values);
    }

    return res.status(200).json({ 
      success: true, 
      count: offers.length,
      message: "تمت المزامنة بنجاح باستخدام نفس إعدادات قاعدة البيانات الشغالة ✅" 
    });

  } catch (error) {
    console.error('❌ Sync Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
