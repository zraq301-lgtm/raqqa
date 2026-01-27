import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: RaqqaSafeWrapper(),
    ));

class RaqqaSafeWrapper extends StatefulWidget {
  const RaqqaSafeWrapper({super.key});
  @override
  State<RaqqaSafeWrapper> createState() => _RaqqaSafeWrapperState();
}

class _RaqqaSafeWrapperState extends State<RaqqaSafeWrapper> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (url) => debugPrint("Loaded: $url"),
        ),
      )
      ..loadRequest(Uri.parse('https://raqqa-v6cd.vercel.app/'));
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (await _controller.canGoBack()) {
          _controller.goBack(); // الرجوع للخلف داخل الموقع
          return false;
        }
        return true;
      },
      child: Scaffold(
        body: SafeArea(child: WebViewWidget(controller: _controller)),
      ),
    );
  }
}
