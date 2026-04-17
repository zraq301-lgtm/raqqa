import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    // 1. إعدادات الوصول CORS (مهمة جداً للاتصال من الموبايل أو المتصفح)
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // التعامل مع طلب preflight
    if (request.method === 'OPTIONS') return response.status(200).end();

    // 2. السماح فقط بطريقة POST للحفظ
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'يرجى استخدام POST بدلاً من GET للحفظ' });
    }

    try {
        // الاتصال باستخدام نفس المتغير الذي يعمل في كود الجلب
        const sql = neon(process.env.DATABASE_URL);
        
        // استلام البيانات من الواجهة
        const { posts, age } = request.body;

        // التحقق من أن البيانات ليست فارغة
        if (!posts || !Array.isArray(posts)) {
            return response.status(400).json({ error: 'بيانات posts غير موجودة أو ليست مصفوفة' });
        }

        // 3. تنفيذ الحفظ في قاعدة البيانات
        // ملاحظة: تأكد أن جدولك يحتوي على عمود اسمه age، وإذا لم يكن موجوداً قم بحذفه من الكود أدناه
        for (const post of posts) {
            await sql`
                INSERT INTO posts (content, media_url, age) 
                VALUES (
                    ${post.content || ''}, 
                    ${post.url || post.media_url || ''}, 
                    ${age || 0}
                )
            `;
        }

        // 4. رد النجاح
        return response.status(200).json({ 
            success: true, 
            message: `تم حفظ ${posts.length} منشورات بنجاح` 
        });

    } catch (error) {
        // في حال حدوث أي خطأ سيظهر لك هنا بالتفصيل
        console.error('Database Save Error:', error);
        return response.status(500).json({ 
            error: 'Database Error', 
            details: error.message 
        });
    }
}
