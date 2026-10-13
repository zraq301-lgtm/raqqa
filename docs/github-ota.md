# تحديث التطبيق هوائيًا من GitHub

يستخدم التطبيق الرئيسي وAdmin حزمة `@capawesome/capacitor-live-update` مع GitHub Releases كمخزن للحزم. لا يستخدم هذا المسار Capgo Cloud أو `CAPGO_TOKEN`.

## آلية العمل

1. عند كل تغيير في واجهة التطبيق على فرع `main`، يبني Workflow الواجهة من جديد.
2. يضغط محتوى `dist_web` في ملف ZIP ويحسب SHA-256.
3. ينشر الملف وملف Manifest في Release ثابت:
   - التطبيق الرئيسي: `ota-main`
   - Admin: `ota-admin`
4. عند تشغيل التطبيق على Android أو iOS، ينادي `LiveUpdate.ready()` ثم يقرأ Manifest من GitHub.
5. إذا كان `bundleId` مختلفًا، ينزل ZIP ويحدد الحزمة التالية ثم يعيد تحميل WebView.
6. إذا فشلت الحزمة الجديدة في الإقلاع خلال 10 ثوانٍ، يعيد plugin التطبيق إلى الحزمة الأصلية.

## روابط الأصول

```text
https://github.com/zraq301-lgtm/raqqa/releases/download/ota-main/raqqa-ota-manifest.json
https://github.com/zraq301-lgtm/raqqa/releases/download/ota-main/raqqa-ota.zip

https://github.com/zraq301-lgtm/raqqa/releases/download/ota-admin/raqqa-admin-ota-manifest.json
https://github.com/zraq301-lgtm/raqqa/releases/download/ota-admin/raqqa-admin-ota.zip
```

## حدود OTA

التحديث الهوائي يحدّث HTML وCSS وJavaScript وملفات الويب فقط. عند إضافة plugin أصلي أو تغيير Kotlin/Swift أو الأذونات أو إعدادات Firebase الأصلية، يجب بناء APK/AAB أو iOS جديد وإرساله للمتجر.

قيمة `nativeCompatibility` الحالية هي `1`. عند إجراء تغيير أصلي غير متوافق، يجب رفعها إلى `2` في خدمتي OTA وفي Workflows قبل نشر الحزمة الجديدة.

## التشغيل اليدوي

يمكن تشغيل Workflow `GitHub OTA Web Bundle - Raqqa` من تبويب Actions. ويُنشَر OTA الخاص بالأدمن مع Workflow `Roqa Admin Production Build` بعد نجاح بناء واجهة Admin.
