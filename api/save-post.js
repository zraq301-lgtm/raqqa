import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import formidable from 'formidable';
import fs from 'fs';

// إعداد هام جداً لـ Vercel للسماح برفع الملفات الكبيرة
export const config = {
  api: {
    bodyParser: false, 
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sql = neon(process.env.DATABASE_URL);
  const form = formidable({ multiples: false });

  try {
    // 1. قراءة البيانات والملفات من الطلب
    const [fields, files] = await form.parse(req);
    
    const content = fields.content?.[0] || "";
    const section = fields.section?.[0] || "bouh-display-1";
    const type = fields.type?.[0] || "نصي";
    const file = files.file?.[0];

    let mediaUrl = "";

    // 2. إذا وجد ملف، ارفعه فوراً لـ Vercel Blob
    if (file) {
      const fileStream = fs.createReadStream(file.filepath);
      const blob = await put(file.originalFilename, fileStream, {
        access: 'public',
        contentType: file.mimetype,
      });
      mediaUrl = blob.url;
    }

    // 3. حفظ البيانات في Neon بناءً على هيكل قاعدة بياناتك
    await sql`
      INSERT INTO posts (content, media_url, section, type, created_at)
      VALUES (${content}, ${mediaUrl}, ${section}, ${type}, NOW())
    `;

    // 4. إرجاع استجابة JSON صحيحة (لتجنب خطأ Unexpected token A)
    return res.status(200).json({ success: true, url: mediaUrl });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: "حدث خطأ داخلي في السيرفر: " + error.message });
  }
  }
