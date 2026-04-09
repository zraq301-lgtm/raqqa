// api/sync-products.js
import postgres from 'postgres';

export default async function handler(req, res) {
  // 1. إعداد البيانات
  const clientId = "WnZbtkibif97XaxcqaJMTNupXoPMctK";
  const clientSecret = "E92XkRBsGlGGRptKgWxY5GB6JfRDP4";
  const sql = postgres(process.env.POSTGRES_PRISMA_URL, { ssl: 'require' });
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    // 2. جلب التوكن من Admitad
    const authRes = await fetch('https://api.admitad.com/token/', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: 'grant_type=client_credentials&scope=public_data products advcampaigns'
    });
    const authData = await authRes.json();
    if (!authData.access_token) throw new Error('Auth Failed');

    // 3. جلب العروض
    const prodRes = await fetch('https://api.admitad.com/advcampaigns/?limit=20&connection_status=active', {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });
    const data = await prodRes.json();
    const offers = data.results || [];

    // 4. التحديث في نيون (SQL مباشر)
    for (const item of offers) {
      await sql`
        INSERT INTO "Product" ("admitadId", "name", "url", "image", "price", "updatedAt")
        VALUES (${item.id.toString()}, ${item.name}, ${item.goto_link}, ${item.logo}, 'عرض خاص', NOW())
        ON CONFLICT ("admitadId") DO UPDATE SET 
          "name" = EXCLUDED."name", "url" = EXCLUDED."url", "image" = EXCLUDED."image", "updatedAt" = NOW()
      `;
    }

    return res.status(200).json({ success: true, count: offers.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
