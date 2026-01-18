import { Novu } from '@novu/node';

export default async function handler(req, res) {
  const novu = new Novu(process.env.NOVU_SECRET_KEY); // الربط بمتغير فيرسل

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // الآن نأخذ "المعرف" و "البيانات" من الطلب نفسه
  const { userId, workflowId, payload } = req.body;

  try {
    await novu.trigger(workflowId, { // سيستخدم أي معرف ترسلينه (ترحيب، عرض، إلخ)
      to: { subscriberId: userId },
      payload: payload, // محتوى متغير (مثل اسم العرض أو تاريخ الموعد)
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
