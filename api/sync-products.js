import pkg from 'pg';
const { Pool } = pkg;

// إعداد الاتصال بقاعدة البيانات
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
  // المفاتيح الجديدة التي استخرجتها الآن
  const clientId = "WnZnKbbif97XaxcqaJMTNupXoPMctK";
  const clientSecret = "tbsfrforvsR7NXnaX8cVOcxWj3ih28";
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    // 1. طلب التوكن باستخدام المفاتيح الجديدة
    const authRes = await fetch('https://api.admitad.com/token/', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: 'grant_type=client_credentials&scope=public_data products advcampaigns'
    });
    
    const authData = await authRes.json();

    if (!authData.access_token) {
      return res.status(401).json({ 
        success: false, 
        error: "Admitad Auth Failed", 
        details: authData.error_description || authData.error 
      });
    }

    // 2. جلب العروض النشطة (Admitad Campaigns)
    const prodRes = await fetch('https://api.admitad.com/advcampaigns/?limit=20&connection_status=active', {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });
    const data = await prodRes.json();
    const offers = data.results || [];

    // 3. تخزين البيانات في نيون (Neon) باستخدام الـ Pool
    for (const item of offers) {
      await pool.query(`
        INSERT INTO "Product" ("admitadId", "name", "url", "image", "price", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT ("admitadId") DO UPDATE SET 
          "name" = EXCLUDED."name", 
          "url" = EXCLUDED."url", 
          "image" = EXCLUDED."image", 
          "updatedAt" = NOW()
      `, [
        item.id.toString(), 
        item.name, 
        item.goto_link, 
        item.logo, 
        'عرض متاح'
      ]);
    }

    return res.status(200).json({ 
      success: true, 
      count: offers.length,
      message: "تمت المزامنة بنجاح! المفاتيح الجديدة تعمل ✅" 
    });

  } catch (error) {
    console.error('Execution Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
