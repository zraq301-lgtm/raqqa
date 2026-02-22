import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: { bodyParser: false }, // ضروري لاستخدام formidable
};

export default async function handler(req, res) {
  // إعدادات الوصول CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sql = neon(process.env.DATABASE_URL);
  const form = formidable({});

  try {
    const [fields, files] = await form.parse(req);
    
    const content = fields.content?.[0] || "";
    const section = fields.section?.[0] || "bouh-display-1";
    const type = fields.type?.[0] || "نصي";
    let mediaUrl = "";

    // 1. معالجة الرابط الخارجي (إذا كان المستخدم وضع رابط صورة/فيديو من الإنترنت)
    if (type === "رابط") {
      mediaUrl = fields.external_link?.[0] || fields.file?.[0] || "";
    } 
    // 2. معالجة الملف المرفوع (إذا قام المستخدم برفع صورة من جهازه)
    else if (files.file && files.file[0]) {
      const file = files.file[0];
      const blob = await put(file.originalFilename, fs.createReadStream(file.filepath), {
        access: 'public',
        contentType: file.mimetype,
        token: process.env.BLOB_READ_WRITE_TOKEN 
      });
      mediaUrl = blob.url;
    }

    // 3. الحفظ في قاعدة بيانات Neon
    const result = await sql`
      INSERT INTO posts (content, media_url, section, type, created_at)
      VALUES (${content}, ${mediaUrl}, ${section}, ${type}, NOW())
      RETURNING id;
    `;

    return res.status(200).json({ success: true, postId: result[0].id });

  } catch (error) {
    console.error('Save Post Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
