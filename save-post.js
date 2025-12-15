// نقوم باستيراد دالة 'sql' من حزمة @vercel/postgres
import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
    
    // ==========================================================
    // **1. حل مشكلة OPTIONS 405 (إصلاح CORS)**
    // هذا الشرط ضروري للسماح لطلبات المتصفح المُرسلة من الواجهة الأمامية بالمرور.
    // ==========================================================
    if (request.method === 'OPTIONS') {
        // تعيين رؤوس CORS للسماح بالوصول من أي مصدر ولطرق POST و OPTIONS
        response.setHeader('Access-Control-Allow-Origin', '*'); // للسماح بالوصول من أي نطاق
        response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // السماح بطرق POST و OPTIONS
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // السماح بنوع المحتوى JSON
        response.status(200).end(); // إرجاع استجابة نجاح (200) لإنهاء طلب OPTIONS
        return;
    }
    
    // تعيين رأس CORS لطلب POST الفعلي أيضاً (يضمن عدم ظهور مشاكل لاحقاً)
    response.setHeader('Access-Control-Allow-Origin', '*'); 

    // ==========================================================
    // 2. معالجة طلب POST (الحفظ)
    // ==========================================================
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed, use POST' });
    }

    try {
        // قراءة البيانات المرسلة من الواجهة الأمامية (ملف admin.html)
        const { content, section, type, created_at } = request.body;

        // التحقق من وجود البيانات المطلوبة
        if (!content || !section || !type) {
            return response.status(400).json({ error: 'Missing required fields (content, section, type)' });
        }
        
        // تنفيذ استعلام الإدخال (INSERT) إلى قاعدة بيانات Neon
        // ملاحظة: قمنا بإضافة قيمة افتراضية للتاريخ في حال لم يتم إرساله
        const result = await sql`
            INSERT INTO posts (content, section, type, created_at)
            VALUES (${content}, ${section}, ${type}, ${created_at || new Date().toISOString()});
        `;

        // إرسال استجابة نجاح (201 Created)
        return response.status(201).json({ 
            message: 'Post successfully saved to Neon!', 
            postData: { content, section, type } 
        });

    } catch (error) {
        // التعامل مع أي خطأ يحدث أثناء الاتصال أو التنفيذ
        console.error('Database Save Error:', error);
        return response.status(500).json({ error: 'Failed to save post to database.', details: error.message });
    }
}
