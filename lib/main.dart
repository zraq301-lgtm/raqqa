import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  // التأكد من تهيئة جميع الخدمات قبل تشغيل التطبيق
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const RaqqaApp());
}

class RaqqaApp extends StatelessWidget {
  const RaqqaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Raqqa App',
      debugShowCheckedModeBanner: false, // إخفاء علامة الـ Debug
      theme: ThemeData(
        useMaterial3: true,
        primarySwatch: Colors.blue,
      ),
      home: const MyWebView(),
    );
  }
}

class MyWebView extends StatefulWidget {
  const MyWebView({super.key});

  @override
  State<MyWebView> createState() => _MyWebViewState();
}

class _MyWebViewState extends State<MyWebView> {
  late final WebViewController controller;
  bool isLoading = true; // متغير لتتبع حالة التحميل

  @override
  void initState() {
    super.initState();
    
    // إعداد الـ Controller بشكل احترافي
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() { isLoading = true; }); // إظهار مؤشر التحميل
          },
          onPageFinished: (String url) {
            setState(() { isLoading = false; }); // إخفاء مؤشر التحميل عند الانتهاء
          },
        ),
      )
      ..loadRequest(Uri.parse('https://raqqa-v6cd.vercel.app/'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // SafeArea تضمن عدم تداخل التطبيق مع ساعة الموبايل أو الكاميرا الأمامية
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: controller),
            // إظهار دائرة تحميل فوق الموقع حتى يفتح بالكامل
            if (isLoading)
              const Center(
                child: CircularProgressIndicator(color: Colors.blue),
              ),
          ],
        ),
      ),
      
      // زر الفيديوهات بتصميم عصري
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => controller.loadRequest(
          Uri.parse('https://raqqa-v6cd-haq5y46jg-raqqs-projects.vercel.app/vid.html'),
        ),
        label: const Text('الفيديوهات'),
        icon: const Icon(Icons.video_library),
        backgroundColor: Colors.blueAccent,
      ),
    );
  }
}
