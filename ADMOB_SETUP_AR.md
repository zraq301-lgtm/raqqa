# ربط AdMob Native بتطبيق رقة (Capacitor 6)

تم تنفيذ الربط الأولي في المشروع باستخدام الحزمة:

```bash
npm install @capacitor-community/admob@^6.2.0
npx cap sync
```

الإصدار `6.2.0` متوافق مع Capacitor 6 المستخدم حاليًا في التطبيق.

## ما تم تغييره

- إضافة `@capacitor-community/admob` إلى `package.json` و`package-lock.json`.
- ضبط `capacitor.config.json` على التهيئة اليدوية:

```json
"AdMob": {
  "initializeOnStartup": false
}
```

- إضافة App ID اختباري رسمي من Google إلى Android:
  - `android/app/src/main/AndroidManifest.xml`
  - `android/app/src/main/res/values/strings.xml`
- إضافة App ID اختباري رسمي وإعدادات الخصوصية وSKAdNetwork إلى:
  - `ios/App/App/Info.plist`
- استبدال Google Publisher Tags القديم بمكوّن AdMob Native في:
  - `src/services/admob.js`
  - `src/components/AdBanner.jsx`
- إزالة تحميل `gpt.js` من `index.html`؛ فهذا خاص بـ Google Publisher Tags/Ad Manager للويب وليس AdMob Native.

## معرفات الاختبار الحالية

هذه المعرفات آمنة للاختبار ولا تمثل حسابك الإنتاجي:

| الاستخدام | Android | iOS |
|---|---|---|
| App ID | `ca-app-pub-8025494804759906~6405154378` | `ca-app-pub-3940256099942544~1458002511` (اختباري مؤقت) |
| Banner Ad Unit | `ca-app-pub-8025494804759906/8190290599` | `ca-app-pub-3940256099942544/2934735716` (اختباري مؤقت) |

لا تُستبدل معرفات الاختبار بمعرفات حقيقية إلا بعد إنشاء التطبيق والوحدات داخل حساب AdMob.

## إنشاء معرفات الإنتاج في AdMob

1. افتح [Google AdMob](https://admob.google.com/).
2. من **Apps** اختر **Add app**.
3. أنشئ تطبيق Android بالحزمة:

   ```text
   com.raqqa.app
   ```

4. أنشئ تطبيق iOS بالـ Bundle ID الموجود في مشروع iOS.
5. انسخ **App ID** لكل منصة. هذا المعرّف يحتوي على `~`، مثل:

   ```text
   ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy
   ```

6. من كل تطبيق اختر **Ad units > Add ad unit > Banner**.
7. أنشئ Banner واحدًا على الأقل لكل منصة، ثم انسخ **Ad unit ID**. هذا المعرّف يحتوي عادةً على `/`، مثل:

   ```text
   ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz
   ```

App ID وAd Unit ID شيئان مختلفان ولا يجوز تبديلهما.

## استبدال App ID في Android

في الملف:

```text
android/app/src/main/res/values/strings.xml
```

استبدل:

```xml
<string name="admob_app_id">ca-app-pub-3940256099942544~3347511713</string>
```

بـ App ID الخاص بتطبيق Android، ثم اترك هذا السطر في `AndroidManifest.xml` كما هو:

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="@string/admob_app_id" />
```

## استبدال App ID في iOS

في:

```text
ios/App/App/Info.plist
```

استبدل قيمة:

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string>
```

بـ App ID الخاص بتطبيق iOS.

اترك `NSUserTrackingUsageDescription` موجودًا؛ لأن iOS قد يطلب إذن التتبع حسب إعدادات الخصوصية ونوع الإعلانات.

## معرفات Banner في بيئة البناء

أنشئ ملف `.env.local` للاختبار المحلي أو أضف المتغيرات إلى أسرار GitHub Actions، ولا تضع أسرارًا أو معرفات خاصة في مستودع عام دون حاجة:

```env
VITE_ADMOB_TEST_MODE=true
VITE_ADMOB_ANDROID_BANNER_ID=ca-app-pub-3940256099942544/6300978111
VITE_ADMOB_IOS_BANNER_ID=ca-app-pub-3940256099942544/2934735716
```

قبل إصدار الإنتاج، استخدم:

```env
VITE_ADMOB_TEST_MODE=false
VITE_ADMOB_ANDROID_BANNER_ID=معرف_Banner_الإنتاج_لـ_Android
VITE_ADMOB_IOS_BANNER_ID=معرف_Banner_الإنتاج_لـ_iOS
```

معرّف Android الحقيقي أُضيف إلى الكود. أما iOS فما زال يستخدم معرفًا اختباريًا مؤقتًا إلى أن يتم تزويد معرفات iOS الحقيقية.

## مزامنة Capacitor والبناء

بعد أي تغيير في الحزمة أو ملفات Android/iOS:

```bash
npm install
npx cap sync android
npx cap sync ios
npm run build
```

ثم اختبر Android:

```bash
cd android
./gradlew assembleDebug
```

ولـ iOS يجب فتح:

```text
ios/App/App.xcworkspace
```

في Xcode وتشغيل التطبيق على جهاز أو محاكي مناسب.

## ما الذي يحدث داخل التطبيق؟

- على Android وiOS، يهيئ `src/services/admob.js` SDK ويعرض Banner Native في أسفل الشاشة.
- على الويب، لا يتم استدعاء AdMob Native ولا يظهر مكوّن Native.
- إذا أعاد خادم إعداد الإعلانات إعدادًا يحتوي على `ads_enabled=false` أو عطّل موضع `banner`، يتم إخفاء الإعلان.
- إذا لم يرد الخادم بإعداد، يسمح التطبيق بالتهيئة المحلية ويستخدم معرف الاختبار الآمن.
- وجود استدعاءين لـ `AdBanner` لا يعني ظهور إعلانين؛ الخدمة تستخدم عدّادًا لمنع إنشاء Banner Native مكرر في الوقت نفسه.

## الاختبار الصحيح

1. تأكد من ظهور إعلان اختبار، وليس إعلانًا إنتاجيًا، على جهاز Android فعلي.
2. راقب Logcat وابحث عن أخطاء Google Mobile Ads أو `AdMob banner unavailable`.
3. اختبر الانتقال بين الصفحة الرئيسية وصفحة الأرجوحة للتأكد من عدم إنشاء Banner مكرر.
4. اختبر إيقاف الإنترنت؛ يجب ألا ينهار التطبيق، وقد لا يظهر الإعلان عند عدم توفر الشبكة.
5. لا تنقر إعلانات الإنتاج أثناء الاختبار.
6. لا تنتقل إلى معرفات الإنتاج قبل التأكد من أن App ID وBundle ID وPackage Name متطابقة.

## قبل النشر الفعلي

- استبدال App IDs الاختبارية في Android وiOS.
- ضبط `VITE_ADMOB_TEST_MODE=false` في بيئة الإنتاج.
- ضبط Ad Unit IDs الحقيقية لكل منصة.
- إضافة تطبيق Android وiOS داخل AdMob وربطهما بالحزمة والمعرّف الصحيحين.
- نشر ملف الخصوصية وسياسة الإعلانات والموافقة على الخصوصية عند الحاجة.
- اختبار نسخة Release، وليس Debug فقط.
- بناء Android وiOS ونجاح الاختبارات قبل نشر OTA.

لا تُضاف إعلانات Interstitial أو Rewarded تلقائيًا. يجب أن يكون لكل نوع استخدام واضح وموافقة تصميمية؛ Banner واحد ثابت في التطبيق أفضل من إعلانات كثيرة تضر بتجربة المستخدم أو بسياسات AdMob.
