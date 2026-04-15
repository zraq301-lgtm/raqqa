const handleShare = async (title) => {
    // تنظيف العنوان من أي وسم HTML قد يأتي من وردبريس
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = title;
    const cleanTitle = tempDiv.textContent || tempDiv.innerText || "";

    const shareData = {
      title: cleanTitle,
      text: `إليكِ هذا الموضوع المميز من تطبيق رقة: ${cleanTitle}`,
      url: APP_LINK,
    };

    try {
      // التأكد من دعم المتصفح وإمكانية المشاركة
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // إذا لم يدعم، نفتح الواتساب ولكن بطريقة أكثر توافقاً
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text + " " + shareData.url)}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (error) {
      // في حالة إلغاء المستخدم للمشاركة لا نفعل شيئاً
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };
