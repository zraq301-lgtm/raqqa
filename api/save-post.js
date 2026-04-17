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

        // 1. استخراج البيانات (المصفوفة الذكية)
        let entries = [];
        if (Array.isArray(body)) {
            entries = body;
        } else if (body.posts && Array.isArray(body.posts)) {
            entries = body.posts;
        } else if (body.data && Array.isArray(body.data)) {
            entries = body.data;
        } else if (typeof body === 'object' && Object.keys(body).length > 0) {
            entries = [body];
        }

        // 2. فلترة البيانات (منع حفظ صفوف فارغة تماماً)
        const validEntries = entries.filter(entry => 
            entry.content || entry.text || entry.media_url || entry.url || entry.link
        );

        if (validEntries.length === 0) {
            return response.status(200).json({ 
                success: false, 
                message: 'No valid content found to save',
                received: body 
            });
        }

        // 3. تنفيذ الحفظ في جدول "posts" مع انتظار التأكيد (Await)
        const results = [];
        for (const entry of validEntries) {
            const content = entry.content || entry.text || entry.body || '';
            const mediaUrl = entry.media_url || entry.url || entry.link || entry.image || '';
            const section = entry.section || body.section || 'bouh-display';
            const type = entry.type || (mediaUrl ? 'رابط' : 'نصي');
            const likes = parseInt(entry.likes_count || entry.likes || 0);
            const comments = parseInt(entry.comments_count || entry.comments || 0);
            const age = parseInt(entry.age || body.age || 0);
            const name = entry.name || body.name || null;

            // تنفيذ الحفظ المباشر لضمان وصول البيانات
            const res = await sql`
                INSERT INTO posts (
                    content, 
                    media_url, 
                    section, 
                    type, 
                    likes_count, 
                    comments_count, 
                    age, 
                    name
                ) 
                VALUES (
                    ${content}, 
                    ${mediaUrl}, 
                    ${section}, 
                    ${type}, 
                    ${likes}, 
                    ${comments}, 
                    ${age}, 
                    ${name}
                )
                RETURNING id;
            `;
            results.push(res);
        }

        return response.status(200).json({ 
            success: true, 
            message: `تم حفظ ${results.length} منشور بنجاح في جدول posts`,
            processedCount: results.length 
        });

    } catch (error) {
        console.error('Neon Database Error:', error);
        return response.status(500).json({ 
            error: 'خطأ في قاعدة البيانات', 
            details: error.message,
            hint: 'تأكد من مطابقة أسماء الأعمدة في الجدول'
        });
    }
}
