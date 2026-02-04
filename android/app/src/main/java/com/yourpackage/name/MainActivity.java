package com.roqa.app; // تأكد من مطابقة اسم حزمتك

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.VideoView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // تعيين واجهة فيديو بسيطة كشاشة بداية
        setContentView(R.layout.activity_main); // تأكد من وجود ملف layout بسيط
        
        VideoView videoView = new VideoView(this);
        setContentView(videoView);

        // تحديد مسار الفيديو في مجلد raw
        Uri video = Uri.parse("android.resource://" + getPackageName() + "/raw/splash_video");
        videoView.setVideoURI(video);

        // عندما ينتهي الفيديو، ابدأ تشغيل تطبيق Capacitor
        videoView.setOnCompletionListener(mp -> {
            // هنا ينتقل للتطبيق بعد انتهاء الـ 3 ثواني
        });

        videoView.start();
    }
}
