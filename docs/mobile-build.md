# بناء تطبيق رقة للموبايل

المشروع يستخدم **Capacitor 6**: واجهة React/Vite الحالية تعمل داخل WebView، بينما تستضيفها طبقة Android مكتوبة بـ **Kotlin**. تمت إضافة منصة iOS أيضًا.

## أسرار GitHub المطلوبة

لا تضع أيًا من هذه القيم في المستودع:

| Secret | الاستخدام |
|---|---|
| `FIREBASE_ANDROID_JSON_BASE64` | محتوى `google-services.json` بعد تحويله إلى Base64؛ يجب أن يحتوي على الحزمة `com.raqqa.app` |
| `FIREBASE_IOS_PLIST_BASE64` | محتوى `GoogleService-Info.plist` بعد تحويله إلى Base64 |
| `ANDROID_KEYSTORE_BASE64` | ملف توقيع Android بصيغة Base64 |
| `ANDROID_KEYSTORE_PASSWORD` | كلمة مرور ملف التوقيع |
| `ANDROID_KEY_ALIAS` | اسم المفتاح داخل keystore |
| `ANDROID_KEY_PASSWORD` | كلمة مرور المفتاح |
| `CAPGO_TOKEN` | مستخدم فقط في workflow نشر Capgo الموجود أصلًا |

`GITHUB_TOKEN` يتم توفيره تلقائيًا من GitHub Actions.

## Android

```bash
npm ci --legacy-peer-deps
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

الأذونات مقيّدة بما تستخدمه الواجهة الحالية: الإنترنت، الكاميرا، الميكروفون، الإشعارات، الاهتزاز، إيقاظ الجهاز، واستعادة جدولة الإشعارات بعد إعادة التشغيل. لا يتم طلب صلاحيات التخزين العامة.

## iOS

يتطلب البناء الفعلي جهاز macOS مع Xcode وCocoaPods:

```bash
npm ci --legacy-peer-deps
npm run build
npx cap sync ios
cd ios/App
pod install
open App.xcworkspace
```

للإصدار على App Store يجب إعداد Team وBundle ID `com.raqqa.app` وشهادات Apple داخل GitHub Actions أو Xcode. الـ workflow الحالي يتحقق من بناء Simulator بدون توقيع، ولا يدّعي نشر نسخة موقعة قبل إضافة شهادات Apple.
