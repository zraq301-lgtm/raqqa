const postgres = require('postgres');

async function updateAdmitadToNeon() {
  const clientId = "WnZbtkibif97XaxcqaJMTNupXoPMctK";
  const clientSecret = "E92XkRBsGlGGRptKgWxY5GB6JfRDP4";
  const databaseUrl = process.env.POSTGRES_PRISMA_URL;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  // اتصال مباشر بنيون
  const sql = postgres(databaseUrl, { ssl: 'require' });

  try {
    console.log('🔄 جاري الاتصال بـ Admitad...');
    const authResponse = await fetch('https://api.admitad.com/token/', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: `grant_type=client_credentials&scope=public_data products advcampaigns`
    });
    
    const authData = await authResponse.json();
    if (!authData.access_token) throw new Error('فشل الحصول على التوكن');

    const res = await fetch('https://api.admitad.com/advcampaigns/?limit=20&connection_status=active', {
      headers: { 'Authorization': `Bearer ${authData.access_token}` }
    });
    const data = await res.json();
    const offers = data.results || [];

    console.log(`📦 تم جلب ${offers.length} عرض. جاري التحديث في نيون...`);

    for (const item of offers) {
      await sql`
        INSERT INTO "Product" ("admitadId", "name", "url", "image", "price", "updatedAt")
        VALUES (${item.id.toString()}, ${item.name}, ${item.goto_link}, ${item.logo}, 'عرض خاص', NOW())
        ON CONFLICT ("admitadId") 
        DO UPDATE SET 
          "name" = EXCLUDED."name",
          "url" = EXCLUDED."url",
          "image" = EXCLUDED."image",
          "updatedAt" = NOW()
      `;
    }

    console.log('✅ تم التحديث بنجاح!');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

updateAdmitadToNeon();
