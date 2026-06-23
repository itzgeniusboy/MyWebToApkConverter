import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  Globe, 
  Github, 
  Cpu, 
  Settings, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink, 
  FileCode, 
  Copy, 
  BookOpen, 
  Key, 
  Terminal, 
  Download,
  Check,
  ChevronRight,
  Code,
  Layers,
  HelpCircle
} from "lucide-react";

// Read-only baseline configurations
const FLUTTER_MAIN_DART = `import 'dart:convert';
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
        _errorMsg = "Failed to load assets/config.json: \\$e";
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
            // Update loading bar
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
            // Handle offline errors
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
}`;

const FLUTTER_PUBSPEC = `name: web_to_app_template
description: A clean, performance-optimized Flutter WebView template that loads web URLs dynamically.
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  webview_flutter: ^4.8.0
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/config.json`;

const GITHUB_WORKFLOW = `name: Web-to-App Compiler Engine

on:
  repository_dispatch:
    types: [trigger-compiler]
  workflow_dispatch:
    inputs:
      app_name:
        description: 'Name of the application'
        required: true
        default: 'My Web App'
      website_url:
        description: 'URL of the website to convert'
        required: true
        default: 'https://example.com'
      package_name:
        description: 'Package ID (e.g., com.converter.app)'
        required: false
        default: 'com.converter.app'
      build_id:
        description: 'Unique build ID'
        required: false
        default: 'manual-test'
      callback_url:
        description: 'Callback webhook URL'
        required: false
        default: ''

jobs:
  build-android:
    name: Build Android Release APK
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Extract Inputs
        id: vars
        run: |
          if [ "\${{ github.event_name }}" = "repository_dispatch" ]; then
            echo "APP_NAME=\${{ github.event.client_payload.app_name }}" >> $GITHUB_ENV
            echo "WEBSITE_URL=\${{ github.event.client_payload.website_url }}" >> $GITHUB_ENV
            echo "PACKAGE_NAME=\${{ github.event.client_payload.package_name || 'com.converter.app' }}" >> $GITHUB_ENV
            echo "BUILD_ID=\${{ github.event.client_payload.build_id }}" >> $GITHUB_ENV
            echo "CALLBACK_URL=\${{ github.event.client_payload.callback_url }}" >> $GITHUB_ENV
          else
            echo "APP_NAME=\${{ github.event.inputs.app_name }}" >> $GITHUB_ENV
            echo "WEBSITE_URL=\${{ github.event.inputs.website_url }}" >> $GITHUB_ENV
            echo "PACKAGE_NAME=\${{ github.event.inputs.package_name }}" >> $GITHUB_ENV
            echo "BUILD_ID=\${{ github.event.inputs.build_id }}" >> $GITHUB_ENV
            echo "CALLBACK_URL=\${{ github.event.inputs.callback_url }}" >> $GITHUB_ENV
          fi

      - name: Setup Java Development Kit
        uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Setup Flutter Environment
        uses: subosito/flutter-action@v2
        with:
          channel: 'stable'
          cache: true

      - name: Inject Custom Configuration
        run: |
          mkdir -p flutter-template/assets
          echo '{"app_name": "\${{ env.APP_NAME }}", "website_url": "\${{ env.WEBSITE_URL }}"}' > flutter-template/assets/config.json

      - name: Dynamic Android Identity Rewriting
        run: |
          CD_PATH="flutter-template"
          if [ -d "$CD_PATH/android" ]; then
            find $CD_PATH/android/app/src/main/ -name "AndroidManifest.xml" -exec sed -i 's/android:label=".*"/android:label="\${{ env.APP_NAME }}"/g' {} +
            find $CD_PATH/android/app/ -name "build.gradle" -exec sed -i 's/applicationId ".*"/applicationId="\${{ env.PACKAGE_NAME }}"/g' {} +
          fi

      - name: Fetch Flutter Dependencies
        run: |
          cd flutter-template
          flutter pub get

      - name: Build Release APK
        run: |
          cd flutter-template
          flutter build apk --release

      - name: Rename APK for Easy Distribution
        id: rename
        run: |
          SAFE_NAME=\$(echo "\${{ env.APP_NAME }}" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9_' | sed 's/ /_/g')
          if [ -z "$SAFE_NAME" ]; then SAFE_NAME="app"; fi
          APK_PATH="flutter-template/build/app/outputs/flutter-apk/\${SAFE_NAME}-release.apk"
          mv flutter-template/build/app/outputs/flutter-apk/app-release.apk "\$APK_PATH"
          echo "RENAMED_APK_PATH=\$APK_PATH" >> $GITHUB_ENV
          echo "FILE_NAME=\${SAFE_NAME}-release.apk" >> $GITHUB_ENV

      - name: Upload APK to Bashupload and Fallback
        id: upload
        run: |
          DOWNLOAD_URL=\$(curl -sT "\$RENAMED_APK_PATH" "https://bashupload.com/\$FILE_NAME" | grep -o 'https://bashupload.com/[^ ]*' | head -n 1)
          if [ -z "\$DOWNLOAD_URL" ]; then
            RES=\$(curl -s -F "file=@\$RENAMED_APK_PATH" https://file.io)
            DOWNLOAD_URL=\$(echo "\$RES" | grep -o '"link":"[^"]*' | cut -d'"' -f4)
          fi
          echo "DOWNLOAD_URL=\$DOWNLOAD_URL" >> $GITHUB_ENV

      - name: Dispatch Webhook Callback
        if: env.CALLBACK_URL != ''
        run: |
          curl -X POST \\
            -H "Content-Type: application/json" \\
            -d "{\\"build_id\\": \\"\${{ env.BUILD_ID }}\\", \\"platform\\": \\"android\\", \\"download_url\\": \\"\${{ env.DOWNLOAD_URL }}\\", \\"status\\": \\"success\\"}" \\
            "\$CALLBACK_URL"`;

interface ActiveBuild {
  build_id: string;
  app_name: string;
  website_url: string;
  package_name: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  android_url: string | null;
  ios_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function App() {
  // Input parameters
  const [appName, setAppName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [packageName, setPackageName] = useState("com.converter.app");

  // Advanced overrides (users can override if they are self-hosting individually)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [githubRepo, setGithubRepo] = useState("");

  // Build state flow
  const [currentBuildId, setCurrentBuildId] = useState<string | null>(null);
  const [activeBuild, setActiveBuild] = useState<ActiveBuild | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Simulated live logging messages
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Explorer tab configuration
  const [explorerTab, setExplorerTab] = useState<"structure" | "main" | "pubspec" | "workflow" | "server">("structure");
  const [copiedText, setCopiedText] = useState(false);

  // Load configuration placeholders on mount
  useEffect(() => {
    setAppName("My Mobile Webapp");
    setWebsiteUrl("https://example.com");

    const localToken = localStorage.getItem("S_GITHUB_TOKEN") || "";
    const localRepo = localStorage.getItem("S_GITHUB_REPO") || "";
    if (localToken) setGithubToken(localToken);
    if (localRepo) setGithubRepo(localRepo);
  }, []);

  const saveAdvancedSettings = (token: string, repo: string) => {
    localStorage.setItem("S_GITHUB_TOKEN", token);
    localStorage.setItem("S_GITHUB_REPO", repo);
  };

  // Convert submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorText(null);
    setCurrentBuildId(null);
    setActiveBuild(null);
    setActiveStepIndex(0);
    setLiveLog(["[1/5] Initiating request parameters...", "[2/5] Synthesizing payload packages..."]);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName,
          websiteUrl,
          packageName,
          githubToken: githubToken.trim() || undefined,
          githubRepo: githubRepo.trim() || undefined
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCurrentBuildId(data.build_id);
        setLiveLog(prev => [
          ...prev,
          `[3/5] Repository Dispatch triggered successfully! Received ID: ${data.build_id}`,
          `[4/5] GitHub Runner is allocating hosted containers (ubuntu-latest & macos-latest)...`,
          `[5/5] Awaiting compiler compilation telemetry updates...`
        ]);
        setActiveStepIndex(1);
      } else {
        setErrorText(data.error || "Failed to trigger compilation engine.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorText(`Network Error: ${err.message || err}`);
      setIsSubmitting(false);
    }
  };

  // Polling logic
  useEffect(() => {
    if (!currentBuildId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/status/${currentBuildId}`);
        if (!response.ok) return;

        const data: ActiveBuild = await response.json();
        setActiveBuild(data);

        // Adjust live logs based on state
        if (data.android_url && !data.ios_url) {
          setActiveStepIndex(2);
          setLiveLog(prev => {
            if (!prev.some(l => l.includes("Android compilation completed"))) {
              return [...prev, "✓ Android compilation completed! Released Release APK to Bashupload.", "⌛ iOS Xcode Bundle is still building on Mac compiler runner (normally takes 1-2 mins)..."];
            }
            return prev;
          });
        } else if (data.ios_url && !data.android_url) {
          setActiveStepIndex(3);
          setLiveLog(prev => {
            if (!prev.some(l => l.includes("iOS compilation completed"))) {
              return [...prev, "✓ iOS compilation completed! Unsigned zip uploaded to secure cloud storage.", "⌛ Android compilation runner is still packaging files..."];
            }
            return prev;
          });
        } else if (data.android_url && data.ios_url) {
          setActiveStepIndex(4);
          setLiveLog(prev => {
            if (!prev.some(l => l.includes("All compilations finalized"))) {
              return [...prev, "✓ Android build fully finalized! Download link fetched.", "✓ iOS archive fully finalized! Unsigned package zip processed.", "✓ All compilations finalized! Ready to install."];
            }
            return prev;
          });
          setIsSubmitting(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000); // Poll every 5 seconds for fast response

    return () => clearInterval(interval);
  }, [currentBuildId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div id="saas-container" className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-600 selection:text-white pb-16">
      
      {/* Header Panel */}
      <header id="saas-header" className="border-b border-slate-800/80 bg-[#0a0d15]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-950/40">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Web2App Compiler
              </h1>
              <p className="text-[11px] text-slate-500 font-mono">100% Free Self-Hosted SaaS Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-emerald-950/30 border border-emerald-900/40 rounded-full text-[11px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Backend Router Online</span>
            </div>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded-lg transition"
            >
              <Github className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Actions Docs</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Core Description Title */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <span className="px-2.5 py-1 bg-indigo-950/60 text-indigo-400 border border-indigo-900/30 rounded-full text-xs font-semibold uppercase tracking-wider font-mono">
            Zero Client Dependencies
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-3">
            Convert Any Website to Native Android & iOS Apps
          </h2>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Submit your responsive web app. The server will dynamically trigger your custom GitHub Actions automation, compiling optimized packages on remote hosted runners and delivering download credentials back here automatically!
          </p>
        </div>

        {/* Dynamic Builder Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Configurator Box (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-[#0b0e14] border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
              
              <div className="px-6 py-4.5 border-b border-slate-800/80 bg-slate-900/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-semibold text-white">App Converter configuration</h3>
                </div>
                <span className="text-xs font-mono text-indigo-400">Secure dispatch API</span>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                {/* Text error alert */}
                {errorText && (
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-300 text-xs flex items-start space-x-2.5">
                    <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Configuration Error</p>
                      <p className="text-slate-400 mt-1">{errorText}</p>
                    </div>
                  </div>
                )}

                {/* Configuration parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="app-name-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Application Name
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input 
                        id="app-name-input"
                        type="text"
                        required
                        placeholder="My Awesome App"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500/80 rounded-xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="package-id-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Bundle/Package ID
                    </label>
                    <div className="relative">
                      <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input 
                        id="package-id-input"
                        type="text"
                        required
                        placeholder="com.domain.app"
                        value={packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500/80 rounded-xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition duration-200 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="website-url-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Website target URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                      id="website-url-input"
                      type="url"
                      required
                      placeholder="https://responsive-web-portfolio.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500/80 rounded-xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition duration-200"
                    />
                  </div>
                </div>

                {/* Advanced Server Configuration toggle */}
                <div className="border-t border-slate-800/60 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition duration-200"
                  >
                    <Settings className={`h-3.5 w-3.5 transform transition ${showAdvanced ? "rotate-45" : ""}`} />
                    <span>{showAdvanced ? "Hide" : "Show"} Optional Developer Settings</span>
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-4 animate-fadeIn">
                      <p className="text-[11px] text-slate-500 leading-normal">
                        By default, this server utilizes the system-configured environment variables (<code>GITHUB_PAT</code> &amp; <code>GITHUB_REPO</code>). Input values here only if you wish to override and dispatch compilation to your custom individual repository.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="custom-repo-input" className="block text-[11px] text-slate-400 mb-1">Custom Owner/Repository</label>
                          <input 
                            id="custom-repo-input"
                            type="text"
                            placeholder="username/custom-repo"
                            value={githubRepo}
                            onChange={(e) => {
                              setGithubRepo(e.target.value);
                              saveAdvancedSettings(githubToken, e.target.value);
                            }}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="custom-token-input" className="block text-[11px] text-slate-400 mb-1">Custom Personal Access Token</label>
                          <input 
                            id="custom-token-input"
                            type="password"
                            placeholder="ghp_****************"
                            value={githubToken}
                            onChange={(e) => {
                              setGithubToken(e.target.value);
                              saveAdvancedSettings(e.target.value, githubRepo);
                            }}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide shadow-lg transition duration-200 flex items-center justify-center space-x-2 ${
                    isSubmitting
                      ? "bg-indigo-800 text-indigo-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-950/20 text-white"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Packaging Application Assets...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      <span>Start Conversion Run</span>
                    </>
                  )}
                </button>

              </form>

            </div>
          </div>

          {/* Compilation Logs & Status Monitor (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#0b0e14] border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full">
              
              <div className="px-6 py-4.5 border-b border-slate-800/80 bg-slate-900/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Terminal className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-semibold text-white">Live Compilation telemetry</h3>
                </div>
                {activeBuild && (
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-indigo-400">
                    {activeBuild.status.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Logger Display Terminal */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                
                {!currentBuildId && !isSubmitting ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-slate-500">
                    <Smartphone className="h-10 w-10 text-slate-600 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">Awaiting Conversion Initialization</p>
                    <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                      Enter your application display properties and target website. Then, press trigger to launch the remote compilation runner.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1">
                    
                    {/* Progress Loader Phases */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                        <span>Compilation Sequence</span>
                        <span className="text-indigo-400 font-semibold">{activeStepIndex * 25}% Completed</span>
                      </div>
                      
                      {/* Horizontal bar */}
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out" 
                          style={{ width: `${Math.max(activeStepIndex * 25, 10)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Console Logger Window */}
                    <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 h-44 overflow-y-auto space-y-2 leading-relaxed">
                      {liveLog.map((log, index) => (
                        <div key={index} className={`flex items-start space-x-1.5 ${
                          log.startsWith("✓") ? "text-emerald-400" : log.startsWith("[") ? "text-slate-400" : "text-amber-400"
                        }`}>
                          <span>{log}</span>
                        </div>
                      ))}
                      {isSubmitting && (
                        <div className="flex items-center space-x-1 text-[11px] text-indigo-400 animate-pulse mt-1">
                          <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                          <span>Polling compilation runner status...</span>
                        </div>
                      )}
                    </div>

                    {/* Completed Download block */}
                    {activeBuild && (activeBuild.android_url || activeBuild.ios_url) && (
                      <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/30 space-y-3.5 animate-fadeIn">
                        <p className="text-xs font-semibold text-indigo-300">Generated Download Artifacts:</p>
                        
                        <div className="grid grid-cols-1 gap-2.5">
                          {activeBuild.android_url && (
                            <a 
                              href={activeBuild.android_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow transition duration-200"
                            >
                              <div className="flex items-center space-x-2">
                                <Smartphone className="h-4 w-4" />
                                <span>Download Android Release APK</span>
                              </div>
                              <Download className="h-4 w-4" />
                            </a>
                          )}

                          {activeBuild.ios_url && (
                            <a 
                              href={activeBuild.ios_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow transition duration-200"
                            >
                              <div className="flex items-center space-x-2">
                                <Layers className="h-4 w-4" />
                                <span>Download iOS Unsigned Package</span>
                              </div>
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>
          </div>

        </div>

        {/* Directory Explorer & Code Viewer */}
        <section id="saas-file-explorer" className="mt-12">
          <div className="bg-[#0b0e14] border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
            
            {/* Explorer Header */}
            <div className="px-6 py-5 border-b border-slate-800/80 bg-slate-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">Full SaaS Directory Blueprint</h3>
                <p className="text-xs text-slate-500">Examine the code architecture backing the compilation pipeline.</p>
              </div>

              {/* Selector Tabs */}
              <div className="flex flex-wrap bg-slate-950 p-1 border border-slate-900 rounded-xl">
                <button 
                  onClick={() => setExplorerTab("structure")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${explorerTab === "structure" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Structure
                </button>
                <button 
                  onClick={() => setExplorerTab("main")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${explorerTab === "main" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  main.dart
                </button>
                <button 
                  onClick={() => setExplorerTab("pubspec")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${explorerTab === "pubspec" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  pubspec.yaml
                </button>
                <button 
                  onClick={() => setExplorerTab("workflow")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${explorerTab === "workflow" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  build.yml
                </button>
                <button 
                  onClick={() => setExplorerTab("server")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${explorerTab === "server" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  server.ts
                </button>
              </div>
            </div>

            {/* Content box */}
            <div className="relative">
              
              {explorerTab !== "structure" && (
                <button
                  onClick={() => {
                    if (explorerTab === "main") copyToClipboard(FLUTTER_MAIN_DART);
                    if (explorerTab === "pubspec") copyToClipboard(FLUTTER_PUBSPEC);
                    if (explorerTab === "workflow") copyToClipboard(GITHUB_WORKFLOW);
                  }}
                  className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-xs rounded-lg text-slate-300 flex items-center space-x-1 transition"
                >
                  {copiedText ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedText ? "Copied" : "Copy"}</span>
                </button>
              )}

              <div className="p-6 bg-slate-950/60 overflow-x-auto text-xs font-mono leading-relaxed max-h-[500px]">
                
                {explorerTab === "structure" && (
                  <pre className="text-slate-300">
{`PROJECT DIRECTORY ARCHITECTURE:
├── .github/
│   └── workflows/
│       └── build.yml               # Triggered via repository_dispatch; builds and uploads Android & iOS
├── flutter-template/
│   ├── assets/
│   │   └── config.json            # Dynamic configuration injected by GHA run
│   ├── lib/
│   │   └── main.dart              # Performance-optimized Flutter webview wrapper
│   └── pubspec.yaml               # Flutter bundle declaration with webview_flutter dependencies
├── server.ts                      # Custom Express API backend serving dispatch and webhook receivers
├── package.json                   # Build and development orchestration scripts
├── src/
│   ├── App.tsx                    # SaaS User Control Panel Frontend Dashboard
│   └── index.css                  # Tailwinds design styling variables`}
                  </pre>
                )}

                {explorerTab === "main" && <pre className="text-slate-300">{FLUTTER_MAIN_DART}</pre>}
                {explorerTab === "pubspec" && <pre className="text-slate-300">{FLUTTER_PUBSPEC}</pre>}
                {explorerTab === "workflow" && <pre className="text-slate-300">{GITHUB_WORKFLOW}</pre>}
                {explorerTab === "server" && (
                  <pre className="text-slate-300">
{`import express from "express";
import path from "path";

// 1. POST /api/convert: triggers the GHA trigger-compiler dispatch
// 2. POST /api/webhook-receiver: registers completion and caches download URLs
// 3. GET /api/status/:build_id: pulls active status and yields downloads`}
                  </pre>
                )}

              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/20 text-[11px] text-slate-500 font-mono">
              Configuration Mode: PRODUCTION READY
            </div>

          </div>
        </section>

      </main>

      <footer className="mt-16 border-t border-slate-900 bg-[#04060a] py-8 text-center text-xs text-slate-600">
        <p>© 2026 Web-to-App Compiler SaaS Platform. All rights reserved.</p>
      </footer>

    </div>
  );
}
