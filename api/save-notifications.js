export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // استلام البيانات من الواجهة (Frontend)
  const { fcmToken, title, body } = req.body;

  const serverKey = "AIzaSyAKjsgnoHnGGr3urhm6Kpu7RvxN2dp6sJQ"; // مفتاحك الذي استخرجناه
  const fcmUrl = 'https://fcm.googleapis.com/fcm/send';

  try {
    const response = await fetch(fcmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${serverKey}`,
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: {
          title: title || "رقة",
          body: body || "لديك تنبيه جديد",
          sound: "default"
        },
        priority: "high"
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
