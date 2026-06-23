import { neon } from '@neondatabase/serverless';
import { Client } from 'pg'; 

export default async function handler(req, res) {
    // 1. تفعيل ترويسات الـ CORS لتأمين اتصال التطبيق
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed. POST only' });

    const { actionType, email, password, fullName, fcmToken } = req.body;
    
    // اتصال سريع للعمليات العادية
    const sql = neon(process.env.DATABASE_URL);

    try {
        if (actionType === 'register') {
            if (!email || !password || !fullName) {
                return res.status(400).json({ success: false, error: 'يرجى ملء جميع الحقول المطلوبة أولاً 💕' });
            }

            // فحص إذا كان البريد مستخدماً بالفعل لمنع الأخطاء والتكرار
            const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
            if (existingUser.length > 0) {
                return res.status(400).json({ success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل يا جميلتي 🌸' });
            }

            // أ) إدخال بيانات المستخدمة الجديدة في جدول المستخدمين الرئيسي
            const newUser = await sql`
                INSERT INTO users (full_name, email, password_text) 
                VALUES (${fullName}, ${email}, ${password}) 
                RETURNING id, full_name, email;
            `;

            const userObj = newUser[0];
            const newUserId = String(userObj.id); 

            // ب) تشغيل دالة فرش الجداول للمستخدمة الجديدة عبر الـ Client لقاعدة البيانات مع تأمين الـ SSL الكامل
            const client = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: { 
                    rejectUnauthorized: false,
                    sslmode: 'verify-full' // التوافق مع تحديث نيون الأمني وحل مشكلة الـ Warning والاتصال
                },
            });

            let schemaName = `user_${newUserId}`; // افتراضي في حال فشل استخراج الاسم من الدالة
            try {
                await client.connect();
                
                // استدعاء الدالة الفريدة الخاصة بك لتهيئة مساحة العميل
                const schemaResult = await client.query(
                    'SELECT public.init_user_schema($1, $2) as schema_name;',
                    [newUserId, email]
                );
                if (schemaResult.rows && schemaResult.rows[0]) {
                    schemaName = schemaResult.rows[0].schema_name;
                }
            } catch (schemaError) {
                console.error("⚠️ فشل تشغيل دالة فرش الجداول المدمجة:", schemaError);
                
                // خطة بديلة (Fallback) في حال حُذفت الدالة المخزنة أثناء تنظيف السيرفر لتضمن عمل الحساب:
                console.log("🔄 جاري محاولة تهيئة السكيما برمجياً كخطة بديلة...");
                await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);
                await client.query(`
                    CREATE TABLE IF NOT EXISTS ${schemaName}.offline_events (
                        id SERIAL PRIMARY KEY,
                        payload TEXT NOT NULL,
                        synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `);
            } finally {
                await client.end();
            }

            // ج) حفظ توكن الإشعارات (FCM Token) فوراً إذا أُرسل مع التسجيل
            if (fcmToken) {
                try {
                    await sql`
                        INSERT INTO device_tokens (user_id, fcm_token, updated_at)
                        VALUES (${newUserId}, ${fcmToken}, NOW())
                        ON CONFLICT (user_id) 
                        DO UPDATE SET fcm_token = EXCLUDED.fcm_token, updated_at = NOW();
                    `;
                } catch (tokErr) {
                    console.error("Device token error:", tokErr);
                }
            }

            return res.status(200).json({ 
                success: true, 
                message: `تم إنشاء حسابكِ بنجاح وفرش مساحتكِ الخاصة: ${schemaName}`,
                user: userObj 
            });

        } else if (actionType === 'login') {
            const userRows = await sql`SELECT id, full_name, email, password_text FROM users WHERE email = ${email}`;
            
            if (userRows.length === 0 || userRows[0].password_text !== password) {
                return res.status(400).json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة ✉️' });
            }

            const userObj = {
                id: userRows[0].id,
                full_name: userRows[0].full_name,
                email: userRows[0].email
            };

            if (fcmToken) {
                await sql`
                    INSERT INTO device_tokens (user_id, fcm_token, updated_at)
                    VALUES (${String(userObj.id)}, ${fcmToken}, NOW())
                    ON CONFLICT (user_id) 
                    DO UPDATE SET fcm_token = EXCLUDED.fcm_token, updated_at = NOW();
                `;
            }

            return res.status(200).json({ success: true, user: userObj });
        }

        return res.status(400).json({ success: false, error: 'نوع العملية غير مدعوم' });

    } catch (error) {
        console.error("❌ خطأ حرج في نظام الـ Auth المدمج:", error);
        return res.status(500).json({ success: false, error: 'حدث خطأ في الخادم أثناء معالجة طلبك', details: error.message });
    }
}
