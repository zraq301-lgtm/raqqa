// أضف مكتبة webview_flutter في ملف pubspec.yaml
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(MaterialApp(home: MyWebView()));

class MyWebView extends StatefulWidget {
  @override
  _MyWebViewState createState() => _MyWebViewState();
}

class _MyWebViewState extends State<MyWebView> {
  late final WebViewController controller;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse('https://raqqa-v6cd.vercel.app/')); // الرابط الأساسي
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: WebViewWidget(controller: controller)),
      // يمكنك إضافة زر سفلي للانتقال لصفحة الفيديوهات مباشرة
      floatingActionButton: FloatingActionButton(
        onPressed: () => controller.loadRequest(Uri.parse('https://raqqa-v6cd-haq5y46jg-raqqs-projects.vercel.app/vid.html')),
        child: Icon(Icons.video_library),
      ),
    );
  }
}
