import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    const { user_id } = req.query;

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
