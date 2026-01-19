import { Novu } from '@novu/node';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // استخدام الاسم المكتوب في إعدادات Vercel الخاصة بكِ بالضبط
  const novu = new Novu(process.env.NOVU_SECRET_KEY); 

  try {
    // استخدام المعرف (Identifier) الظاهر في صورة Novu الخاصة بكِ
    await novu.trigger('riqqa-welcome-notification', {
      to: {
        subscriberId: 'riqqa_global_user', // المعرف العام الذي سنضعه في الواجهة
      },
      payload: {}, // يمكنكِ إضافة بيانات متغيرة هنا مستقبلاً
    });

    return res.status(200).json({ success: true, message: 'تم إرسال الإشعار بنجاح' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
    }
