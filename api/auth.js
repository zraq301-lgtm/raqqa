import { neon } from '@neondatabase/serverless';
import { Client } from 'pg'; 

export default async function handler(req, res) {
    // تفعيل ترويسات الـ CORS لتأمين اتصال التطبيق
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed. POST only' });

    const { actionType, email, password, fullName, fcmToken, userId } = req.body;
    const sql = neon(process.env.DATABASE_URL);

    try {
        // نستخدم الـ userId القادم من التطبيق أو ننشئ معرّف فريد إذا لم يرسل
        const clerkId = userId || `clerk_${Date.now()}`;

        if (actionType === 'register') {
            if (!email || !password || !fullName) {
                return res.status(400).json({ success: false, error: 'يرجى ملء جميع الحقول المطلوبة أولاً 💕' });
            }

            // 1. فحص إذا كان البريد مستخدماً بالفعل في جدول global_users لمنع التكرار
            const existingUser = await sql`SELECT clerk_id FROM public.global_users WHERE email = ${email}`;
            if (existingUser.length > 0) {
                return res.status(400).json({ success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل يا جميلتي 🌸' });
            }

            // 2. الاتصال عبر الـ Client لتشغيل الدالة المخزنة (Stored Function) الأصلية
            const client = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false },
            });

            let schemaName = '';
            try {
                await client.connect();
                
                // استدعاء الدالة الفريدة الخاصة بك لتهيئة مساحة العميل وفرش الـ 9 جداول
                const schemaResult = await client.query(
                    'SELECT public.init_user_schema($1, $2, $3) as schema_name;',
                    [clerkId, email, fcmToken || null]
                );
                
                if (schemaResult.rows && schemaResult.rows[0]) {
                    schemaName = schemaResult.rows[0].schema_name;
                }
            } catch (schemaError) {
                console.error("❌ فشل تشغيل وظيفة init_user_schema الحقيقية:", schemaError);
                return res.status(500).json({ success: false, error: 'فشلت قاعدة البيانات في تشغيل دالة بناء السكيما وجداولها', details: schemaError.message });
            } finally {
                await client.end();
            }

            return res.status(200).json({ 
                success: true, 
                message: `تم إنشاء حسابكِ بنجاح وفرش مساحتكِ الخاصة: ${schemaName}`,
                schemaName: schemaName,
                user: { clerk_id: clerkId, email: email, full_name: fullName } 
            });

        } else if (actionType === 'login') {
            // تسجيل الدخول بالاعتماد على جدول global_users الصحيح
            const userRows = await sql`SELECT clerk_id, schema_name, email FROM public.global_users WHERE email = ${email}`;
            
            if (userRows.length === 0) {
                return res.status(400).json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة ✉️' });
            }

            const userObj = userRows[0];

            // تحديث التوكن في حال تغير جهاز المستخدم أثناء تسجيل الدخول
            if (fcmToken) {
                await sql`
                    UPDATE public.global_users 
                    SET device_token = ${fcmToken} 
                    WHERE clerk_id = ${userObj.clerk_id}
                `;
            }

            return res.status(200).json({ 
                success: true, 
                schemaName: userObj.schema_name,
                user: userObj 
            });
        }

        return res.status(400).json({ success: false, error: 'نوع العملية غير مدعوم' });

    } catch (error) {
        console.error("❌ خطأ حرج في نظام الـ Auth:", error);
        return res.status(500).json({ success: false, error: 'حدث خطأ في الخادم أثناء معالجة طلبك', details: error.message });
    }
}
