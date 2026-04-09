import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const clientId = "WnZbtkibif97XaxcqaJMTNupXoPMctK";
    const clientSecret = "E92XkRBsGlGGRptKgWxY5GB6JfRDP4";
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // 1. جلب التوكن من Admitad
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

    // 2. جلب العروض
    const prodRes = await fetch('https://api.admitad.com/advcampaigns/?limit=20&connection_status=active', {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });
    const data = await prodRes.json();
    const offers = data.results || [];

    // 3. الاتصال بقاعدة البيانات باستخدام مكتبة Vercel الرسمية
    const client = await db.connect();

    // 4. التحديث في نيون (Neon)
    for (const item of offers) {
      await client.sql`
        INSERT INTO "Product" ("admitadId", "name", "url", "image", "price", "updatedAt")
        VALUES (
          ${item.id.toString()}, 
          ${item.name}, 
          ${item.goto_link}, 
          ${item.logo}, 
          'عرض خاص', 
          NOW()
        )
        ON CONFLICT ("admitadId") DO UPDATE SET 
          "name" = EXCLUDED."name", 
          "url" = EXCLUDED."url", 
          "image" = EXCLUDED."image", 
          "updatedAt" = NOW();
      `;
    }

    return res.status(200).json({ success: true, count: offers.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
