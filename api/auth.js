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
        const clerkId = userId || `clerk_${Date.now()}`;

        if (actionType === 'register') {
            if (!email || !password || !fullName) {
                return res.status(400).json({ success: false, error: 'يرجى ملء جميع الحقول المطلوبة أولاً 💕' });
            }

            // 1. فحص التسجيل المكرر في الجدول العام
            const existingUser = await sql`SELECT clerk_id FROM public.global_users WHERE email = ${email}`;
            if (existingUser.length > 0) {
                return res.status(400).json({ success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل يا جميلتي 🌸' });
            }

            // توليد اسم السكيما وتنظيفه
            const schemaName = 'user_' + clerkId.replace(/[^a-zA-Z0-9]/g, '');

            // تسجيل الحساب في الجدول العام أولاً
            await sql`
                INSERT INTO public.global_users (clerk_id, schema_name, email, device_token)
                VALUES (${clerkId}, ${schemaName}, ${email}, ${fcmToken || null})
                ON CONFLICT (clerk_id) DO UPDATE SET device_token = EXCLUDED.device_token;
            `;

            // 2. الاتصال المباشر لبناء السكيما وفرش الـ 9 جداول المطلوبة برمجياً داخل نيون
            const client = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false },
            });

            try {
                await client.connect();
                
                // أ) إنشاء مساحة الحساب (Schema)
                await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);
                
                // ب) بناء الـ 9 جداول المطلوبة كاملة بداخلها:

                // [1] جدول الحيض والخصوبة (Period Tracker)
                await client.query(`
                    CREATE TABLE IF NOT EXISTS ${schemaName}.period_tracker (
                        id SERIAL PRIMARY KEY,
                        start_date DATE NOT NULL,
                        end_date DATE,
                        cycle_length INT DEFAULT 28,
                        period_length INT DEFAULT 5,
                        additional_data JSONB DEFAULT '{}'::jsonb
                    );
                `);

                // [2] جدول تتبع الحمل (Pregnancy Tracker)
                await client.query(`
                    CREATE TABLE IF NOT EXISTS ${schemaName}.pregnancy_tracker (
                        id SERIAL PRIMARY KEY,
                        last_period_date DATE,
                        expected_due_date DATE,
                        current_week INT DEFAULT 1,
                        additional_data JSONB DEFAULT '{}'::jsonb
                    );
                `);

                // [3] جدول الرضاعة (Breastfeeding Logs)
                await client.query(`
                    CREATE TABLE IF NOT EXISTS ${schemaName}.breastfeeding_tracker (
                        id SERIAL PRIMARY KEY,
                        log_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        duration_minutes INT,
                        feeding_type VARCHAR(50),
                        additional_data JSONB DEFAULT '{}'::jsonb
                    );
                `);

                // [4] جدول الأمومة وتتبع الأطفال (Motherhood Tracker)
                await client.query(`
                    CREATE TABLE IF NOT EXISTS ${schemaName}.motherhood_tracker (
                        id SERIAL PRIMARY KEY,
                        baby_name VARCHAR(100),
                        baby_birth_date DATE,
                        development_milestones JSONB DEFAULT '{}'::jsonb,
                        synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `);

                // [5] جدول الرشاقة والوزن والتمارين (Fitness & Wellness)
                await client.query(`
                    CREATE TABLE IF NOT EXISTS ${schemaName}.fitness_wellness (
                        id SERIAL PRIMARY KEY,
                        current_weight NUMERIC(5,2),
                        water_intake_ml INT DEFAULT 0,
                        calories_burned INT DEFAULT 0,
                        workout_log JSONB DEFAULT '{}'::jsonb,
                        logged_at DATE DEFAULT CURRENT_DATE
                    );
                `);

                // [6] جدول عيادة ومواعيد الطبيب (Doctor Appointments)
                await client.query(`
                    CREATE TABLE IF NOT EXISTS ${schemaName}.doctor_appointments (
                        id SERIAL PRIMARY KEY,
                        doctor_name VARCHAR(150),
                        clinic_specialty VARCHAR(100),
                        appointment_time TIMESTAMP WITH TIME ZONE,
                        prescriptions TEXT,
                        visit_notes TEXT,
                        additional_data JSONB DEFAULT '{}'::jsonb
                    );
                `);

                // [7] جدول الفقه والعلاقات الزوجية (Marital Intimacy & Feqh)
                await client.query(`
                    CREATE TABLE IF NOT EXISTS ${schemaName}.marital_intimacy (
                        id SERIAL PRIMARY KEY,
                        log_date DATE DEFAULT CURRENT_DATE,
                        intercourse_status VARCHAR(50),
                        feqh_notes TEXT,
                        additional_data JSONB DEFAULT '{}'::jsonb
                    );
                `);

                // [8] جدول النفسية والمزاج (Psychological Wellness)
                await client.query(`
                    CREATE TABLE IF NOT EXISTS ${schemaName}.psychological_wellness (
                        id SERIAL PRIMARY KEY,
                        mood_rate INT CHECK (mood_rate BETWEEN 1 AND 5),
                        stress_level VARCHAR(50),
                        feelings_notes TEXT,
                        logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `);

                // [9] جدول المزامنة والأحداث دون اتصال (Offline Events)
                await client.query(`
                    CREATE TABLE IF NOT EXISTS ${schemaName}.offline_events (
                        id SERIAL PRIMARY KEY,
                        payload TEXT NOT NULL,
                        synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                `);

                console.log(`✨ تم بنجاح إنشاء السكيما ${schemaName} وفرش الـ 9 جداول بالكامل برمجياً.`);

            } catch (schemaError) {
                console.error("❌ خطأ أثناء إنشاء الجداول برمجياً:", schemaError);
                return res.status(500).json({ success: false, error: 'فشل الخادم في بناء جداول السكيما داخلياً', details: schemaError.message });
            } finally {
                await client.end();
            }

            return res.status(200).json({ 
                success: true, 
                message: `تم إنشاء حسابكِ بنجاح وفرش مساحتكِ الخاصة كاملة 🚀`,
                schemaName: schemaName,
                user: { clerk_id: clerkId, email: email, full_name: fullName } 
            });

        } else if (actionType === 'login') {
            const userRows = await sql`SELECT clerk_id, schema_name, email FROM public.global_users WHERE email = ${email}`;
            
            if (userRows.length === 0) {
                return res.status(400).json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة ✉️' });
            }

            const userObj = userRows[0];

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
