const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp(); // يعمل تلقائياً بصلاحيات مشروع raqqa-43dc8 دون الحاجة لمفتاح JSON خارجي

exports.makeReceiver = functions.https.onRequest(async (req, res) => {
    // إعدادات الأمان لـ Make.com
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    const { title, message, fcm_token } = req.body;

    if (!fcm_token) {
        return res.status(400).send("Missing fcm_token");
    }

    try {
        const payload = {
            notification: {
                title: title || "تنبيه جديد",
                body: message || "لديك رسالة من تطبيق الرقة",
            },
            token: fcm_token
        };

        await admin.messaging().send(payload);
        return res.status(200).json({ success: true, info: "تم الإرسال عبر Firebase Functions" });
    } catch (error) {
        console.error("FCM Error:", error);
        return res.status(500).json({ error: error.message });
    }
});
