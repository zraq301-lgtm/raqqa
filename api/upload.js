import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
  // 1. إضافة إعدادات CORS للسماح للمتصفح بالاتصال
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // التعامل مع طلبات Preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'audio/aac', 'audio/wav'],
        tokenPayload: JSON.stringify({}),
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('تم الرفع بنجاح:', blob.url);
      },
    });
    return res.status(200).json(jsonResponse);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
