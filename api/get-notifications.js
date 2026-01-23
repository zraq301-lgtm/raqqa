import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // 1. إضافة تصاريح الوصول (CORS) لحل مشكلة "خطأ الاتصال"
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // التعامل مع طلبات Pre-flight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { user_id } = req.query;

    // التأكد من وجود user_id لتجنب توقف السيرفر
    if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
    }

    try {
        const result = await sql`
            SELECT id, title, body, type, created_at 
            FROM notifications 
            WHERE user_id = ${user_id} AND is_read = FALSE
            ORDER BY created_at DESC;
        `;

        return res.status(200).json({ success: true, notifications: result.rows });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
