import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
  // إضافة حماية لضمان أن الطلبات تأتي فقط عبر طريقة POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // تحديد أنواع الملفات المسموح بها بدقة لضمان الأمان
        return {
          allowedContentTypes: [
            'image/jpeg', 
            'image/png', 
            'audio/mpeg', 
            'audio/wav', 
            'audio/aac'
          ],
          tokenPayload: JSON.stringify({
            // يمكنك إضافة معرف المستخدم هنا مستقبلاً
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // يتم استدعاؤه بعد اكتمال الرفع في السحاب بنجاح
        console.log('تم الرفع بنجاح إلى الرابط:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("خطأ في معالجة الرفع:", error.message);
    return res.status(400).json({ error: error.message });
  }
}
