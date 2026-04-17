import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    // إعدادات CORS
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') return response.status(200).end();
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method Not Allowed' });

    try {
        const sql = neon(process.env.DATABASE_URL);
        const body = request.body || {};

        // 1. استخراج البيانات بشكل ذكي
        let entries = [];

        if (Array.isArray(body)) {
            // إذا كانت البيانات المرسلة مصفوفة مباشرة [{}, {}]
            entries = body;
        } else if (body.posts && Array.isArray(body.posts)) {
            // إذا كانت داخل خاصية posts
            entries = body.posts;
        } else if (body.data && Array.isArray(body.data)) {
            // إذا كانت داخل خاصية data
            entries = body.data;
        } else if (typeof body === 'object' && Object.keys(body).length > 0) {
            // إذا تم إرسال كائن واحد فقط {content: '...'}، نحوله لمصفوفة
            entries = [body];
        }

        // 2. التحقق النهائي: إذا لم نجد أي بيانات صالحة
        if (entries.length === 0) {
            return response.status(200).json({ 
                message: 'No data processed', 
                received: body 
            }); // نرسل 200 لتجنب كسر الواجهة الأمامية مع رسالة توضيحية
        }

        const age = body.age || 0;

        // 3. تنفيذ الحفظ باستخدام Transaction أو وعود متوازية لتحسين الأداء
        const insertPromises = entries.map(entry => {
            // استخراج القيم بمرونة (البحث عن مسميات مختلفة لنفس الحقل)
            const content = entry.content || entry.text || entry.body || '';
            const mediaUrl = entry.url || entry.media_url || entry.image || entry.link || '';

            return sql`
                INSERT INTO posts (content, media_url, age) 
                VALUES (${content}, ${mediaUrl}, ${age})
            `;
        });

        await Promise.all(insertPromises);

        return response.status(200).json({ 
            success: true, 
            message: 'Data processed successfully',
            processedCount: entries.length 
        });

    } catch (error) {
        console.error('Smart API Error:', error);
        return response.status(500).json({ 
            error: 'Internal Server Error', 
            details: error.message 
        });
    }
}
