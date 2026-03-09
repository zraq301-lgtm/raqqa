export const notifyUser = async (userToken, message) => {
  try {
    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fcmToken: userToken,
        title: "رقة",
        body: message
      })
    });
    return await response.json();
  } catch (error) {
    console.error("خطأ في إرسال الإشعار:", error);
  }
};
