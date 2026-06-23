import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));
  runApp(const WebToApp());
}

class WebToApp extends StatelessWidget {
  const WebToApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Web to App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: Colors.black,
      ),
      home: const WebViewScreen(),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;
  bool _isLoadingConfig = true;
  bool _isLoadingPage = true;
  String _appName = "Loading...";
  String _targetUrl = "";
  String _errorMsg = "";

  @override
  void initState() {
    super.initState();
    _loadConfig();
  }

  Future<void> _loadConfig() async {
    try {
      final configString = await rootBundle.loadString('assets/config.json');
      final Map<String, dynamic> config = jsonDecode(configString);
      
      setState(() {
        _appName = config['app_name'] ?? 'Web App';
        _targetUrl = config['website_url'] ?? 'https://example.com';
        _isLoadingConfig = false;
      });

      _initWebViewController();
    } catch (e) {
      setState(() {
        _errorMsg = "Failed to load assets/config.json: $e";
        _isLoadingConfig = false;
      });
    }
  }

  void _initWebViewController() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.black)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // Update loading bar state or progress
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoadingPage = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoadingPage = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            // Handle offline or certificate error states here
          },
        ),
      )
      ..loadRequest(Uri.parse(_targetUrl));
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingConfig) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: Colors.white),
        ),
      );
    }

    if (_errorMsg.isNotEmpty) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Text(
              _errorMsg,
              style: const TextStyle(color: Colors.redAccent, fontSize: 16),
              textAlign: Center,
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        top: true,
        bottom: false,
        child: PopScope(
          canPop: false,
          onPopInvokedWithResult: (bool didPop, dynamic result) async {
            if (didPop) return;
            if (await _controller.canGoBack()) {
              await _controller.goBack();
            } else {
              SystemNavigator.pop();
            }
          },
          child: Stack(
            children: [
              WebViewWidget(controller: _controller),
              if (_isLoadingPage)
                const Positioned.fill(
                  child: ColoredBox(
                    color: Colors.black,
                    child: Center(
                      child: CircularProgressIndicator(color: Colors.white),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
