import { fetchImage, uploadToVercel } from './MediaService';

function ChatInput() {
  const handleMediaUpload = async () => {
    // 1. التقاط الصورة
    const photo = await fetchImage();
    
    if (photo) {
      try {
        // 2. رفع الصورة والحصول على الرابط
        const imageUrl = await uploadToVercel(photo.webPath);
        
        // 3. إرسال الرابط في الشات
        console.log("رابط الصورة المرفوعة:", imageUrl);
        // sendToChat(imageUrl); 
        
      } catch (err) {
        alert("حدث خطأ أثناء الرفع");
      }
    }
  };

  return (
    <button onClick={handleMediaUpload} className="p-2 bg-blue-500 text-white rounded">
      📷 إضافة صورة
    </button>
  );
}
