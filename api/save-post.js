import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') return response.status(200).end();

    try {
        const sql = neon(process.env.DATABASE_URL);
        
        // جلب الـ body مهما كان شكله
        const body = request.body;
        
        // تحويل كل شيء لمصفوفة حتى لو أرسلت كائن واحد
        let dataToSave = Array.isArray(body) ? body : (body.posts || body.data || [body]);

        const results = [];

        for (const item of dataToSave) {
            // إجبار استخراج البيانات: سيبحث في كل الاحتمالات الممكنة
            const content = item.content || item.text || item.body || item.message || JSON.stringify(item); 
            const media_url = item.media_url || item.url || item.image || item.link || '';
            const section = item.section || body.section || 'bouh-display';
            const age = parseInt(item.age || body.age || 0);
            const name = item.name || body.name || 'User';
            const p_type = item.type || (media_url ? 'رابط' : 'نصي');

            // تنفيذ الإدخال (بدون فلترة - سيحفظ مهما حدث)
            const res = await sql`
                INSERT INTO posts (
                    content, media_url, section, type, age, name
                ) VALUES (
                    ${String(content)}, 
                    ${String(media_url)}, 
                    ${String(section)}, 
                    ${String(p_type)}, 
                    ${age}, 
                    ${String(name)}
                ) RETURNING id;
            `;
            results.push(res[0].id);
        }

        return response.status(200).json({ 
            success: true, 
            message: "تم الإجبار على الحفظ",
            inserted_ids: results,
            // هذا السطر سيكشف لك في الـ Response ماذا استلم السيرفر فعلياً
            raw_data_received: body 
        });

    } catch (error) {
        console.error('CRITICAL DATABASE ERROR:', error);
        return response.status(500).json({ 
            success: false, 
            error: error.message,
            stack: error.stack
        });
    }
}
