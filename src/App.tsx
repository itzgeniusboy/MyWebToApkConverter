import React, { useEffect, useRef, useState } from "react";
import { 
  ChevronDown, 
  Sparkles, 
  ArrowRight, 
  X, 
  Cpu, 
  Globe, 
  Terminal, 
  CheckCircle,
  HelpCircle,
  Trash2,
  Download,
  History,
  RefreshCw,
  Smartphone,
  Settings,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Maximize2,
  Lock,
  ArrowUpRight,
  Wifi,
  Battery
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "react-hot-toast";

// Interface for brand logos in the bottom marquee
interface BrandLogo {
  char: string;
  name: string;
  color: string;
}

// Interface for system archives saved in offline local cache
interface BuildArchive {
  id: string;
  appName: string;
  websiteUrl: string;
  packageName: string;
  appColor: string;
  orientation: string;
  timestamp: string;
  android_url: string | null;
  ios_url: string | null;
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Interactive Navigation States
  const [activeMenu, setActiveMenu] = useState<"features" | "solutions" | "learning" | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Compiler Configuration States
  const [websiteUrl, setWebsiteUrl] = useState("https://react.dev");
  const [appName, setAppName] = useState("Nexus React App");
  const [packageName, setPackageName] = useState("com.nexus.reactapp");
  const [appColor, setAppColor] = useState("#6366f1");
  const [orientation, setOrientation] = useState<"portrait" | "landscape" | "auto">("portrait");
  
  // Feature Toggles
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [pullToRefresh, setPullToRefresh] = useState(true);
  const [zoomControls, setZoomControls] = useState(false);
  
  // Advanced GitHub Pipeline Override Collapsible
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [githubRepo, setGithubRepo] = useState("itzraviking/web-to-apk-runner"); // default or client preset
  
  // Active Compiler / Build States
  const [activeBuildId, setActiveBuildId] = useState<string | null>(null);
  const [buildStatus, setBuildStatus] = useState<"idle" | "queued" | "in_progress" | "completed" | "failed">("idle");
  const [progress, setProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [androidDownloadUrl, setAndroidDownloadUrl] = useState<string | null>(null);
  const [iosDownloadUrl, setIosDownloadUrl] = useState<string | null>(null);

  // System Build Archives from LocalStorage
  const [buildArchives, setBuildArchives] = useState<BuildArchive[]>([]);

  // Simulation step milestones
  const steps = [
    { title: "Sovereign Setup", desc: "Verifying target URL, package manifest, and token structures" },
    { title: "Asset Compiler", desc: "Injecting app icon, launching splash assets, and packaging web views" },
    { title: "Android Runner", desc: "Running Gradle compilation via dedicated GHA runner nodes" },
    { title: "iOS Xcode Flow", desc: "Signing bundle certificates and creating Swift release payload" },
    { title: "CDN Distribution", desc: "Securing compiled binary pipelines onto low-latency CDN links" }
  ];

  // Load and sync local archives
  useEffect(() => {
    if (typeof window !== "undefined" && window.location && window.location.origin) {
      setWebsiteUrl(window.location.origin);
    }
    const cached = localStorage.getItem("nexus_apk_archives_v2");
    if (cached) {
      try {
        setBuildArchives(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse archives from localStorage", e);
      }
    }
  }, []);

  // Save archives helper
  const saveArchives = (updated: BuildArchive[]) => {
    setBuildArchives(updated);
    localStorage.setItem("nexus_apk_archives_v2", JSON.stringify(updated));
  };

  // Auto-generate package name from app name
  useEffect(() => {
    if (appName) {
      const formattedName = appName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 20);
      setPackageName(`com.nexus.${formattedName || "app"}`);
    }
  }, [appName]);

  // Background Video custom JS loop (Fade-in start, Fade-out end)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    let animFrameId: number;
    let isWaiting = false;

    const updateOpacity = () => {
      if (!video || isWaiting) return;

      const duration = video.duration;
      const currentTime = video.currentTime;

      if (!isNaN(duration) && duration > 0) {
        let opacity = 1;

        // 0.5s fade-in at the beginning
        if (currentTime < 0.5) {
          opacity = currentTime / 0.5;
        }
        // 0.5s fade-out at the end
        else if (currentTime > duration - 0.5) {
          opacity = Math.max(0, (duration - currentTime) / 0.5);
        }

        video.style.opacity = opacity.toString();
      }

      animFrameId = requestAnimationFrame(updateOpacity);
    };

    const handleEnded = () => {
      isWaiting = true;
      if (video) {
        video.style.opacity = "0";
      }

      // 100ms reset delay before replay
      setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          isWaiting = false;
          video.play()
            .then(() => {
              animFrameId = requestAnimationFrame(updateOpacity);
            })
            .catch(err => console.log("Background video play interrupted:", err));
        }
      }, 100);
    };

    video.addEventListener("ended", handleEnded);

    // Initial play trigger
    video.play()
      .then(() => {
        animFrameId = requestAnimationFrame(updateOpacity);
      })
      .catch(err => console.log("Background video auto-play blocked or interrupted:", err));

    return () => {
      cancelAnimationFrame(animFrameId);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Polling backend for build updates
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    
    if (activeBuildId && (buildStatus === "queued" || buildStatus === "in_progress")) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/status/${activeBuildId}`);
          if (!res.ok) throw new Error("Status endpoint failed");
          const data = await res.json();

          // If finished or status is completed
          if (data.status === "completed" || data.android_url || data.ios_url) {
            setBuildStatus("completed");
            setProgress(100);
            setActiveStepIndex(4);
            setAndroidDownloadUrl(data.android_url || `https://github.com/${githubRepo}/releases`);
            setIosDownloadUrl(data.ios_url);
            clearInterval(pollInterval);
            toast.success("Binary compilation succeeded!");

            // Append to system archives list
            const newArchive: BuildArchive = {
              id: activeBuildId,
              appName,
              websiteUrl,
              packageName,
              appColor,
              orientation,
              timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              android_url: data.android_url || `https://github.com/${githubRepo}/releases`,
              ios_url: data.ios_url
            };
            const updated = [newArchive, ...buildArchives.filter(a => a.id !== activeBuildId)];
            saveArchives(updated);
          } else if (data.status === "failed") {
            setBuildStatus("failed");
            clearInterval(pollInterval);
            toast.error("Compilation pipeline failed on GitHub Action.");
          }
        } catch (err) {
          console.warn("Polling error:", err);
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [activeBuildId, buildStatus]);

  // Handle compilation submission
  const triggerCompilation = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalUrl = websiteUrl.trim();
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
      setWebsiteUrl(finalUrl);
    }

    if (!finalUrl || !finalUrl.startsWith("http")) {
      toast.error("Please enter a valid website URL starting with http:// or https://");
      return;
    }
    if (!appName.trim()) {
      toast.error("Please enter an App Display Name.");
      return;
    }

    setBuildStatus("queued");
    setProgress(5);
    setActiveStepIndex(0);
    setAndroidDownloadUrl(null);
    setIosDownloadUrl(null);
    setConsoleLogs([
      `[NEXUS SYSTEM] Initializing compiler payload...`,
      `[CONFIG] Package Target URL: ${finalUrl}`,
      `[CONFIG] Display Name: ${appName}`,
      `[CONFIG] Package ID: ${packageName}`,
      `[CONFIG] Device Orientation: ${orientation.toUpperCase()}`,
      `[CONFIG] Fullscreen Mode: ${isFullscreen ? "ENABLED" : "DISABLED"}`,
      `[GHA QUEUE] Authenticating with GitHub sovereign app token...`
    ]);

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName,
          websiteUrl: finalUrl,
          packageName,
          githubRepo
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger compilation request.");
      }

      setActiveBuildId(data.build_id);
      setBuildStatus("in_progress");
      toast.success("GitHub pipeline triggered successfully!");

      // Simulate step progress and logs alongside GHA polling for an immersive, gorgeous developer experience
      simulateLogProgress();

    } catch (err: any) {
      setBuildStatus("failed");
      setConsoleLogs(prev => [
        ...prev,
        `[CRITICAL ERROR] Failed to dispatch action pipeline.`,
        `[SYSTEM DETAIL] ${err.message || err}`
      ]);
      toast.error(err.message || "Pipeline dispatch failed. Verify server settings.");
    }
  };

  // Simulate progress steps and dynamic outputs to enrich compiling user wait-time
  const simulateLogProgress = () => {
    let step = 0;
    const progressInterval = setInterval(() => {
      setBuildStatus(current => {
        if (current === "completed" || current === "failed") {
          clearInterval(progressInterval);
          return current;
        }

        step += 1;
        if (step <= 4) {
          setActiveStepIndex(step);
          setProgress(step * 22);

          // Append highly specialized technical logs
          const logTemplates = [
            `[ENGINE] Scanning source DOM elements and validating SSL certificates...`,
            `[COMPILER] Injecting splashscreen with theme color ${appColor}...`,
            `[ANDROID] Compiling Android Gradle toolchains (SDK 34)...`,
            `[IOS] Launching Xcode certificate validation pipeline...`,
            `[CDN] Uploading signed release binaries to cloud storage...`
          ];
          setConsoleLogs(prev => [...prev, logTemplates[step - 1] || `[SYSTEM] Processing...`]);
        }

        return current;
      });
    }, 8000);
  };

  // Restore preset inputs from an archive item
  const restoreArchivePreset = (archive: BuildArchive) => {
    setAppName(archive.appName);
    setWebsiteUrl(archive.websiteUrl);
    setPackageName(archive.packageName);
    setAppColor(archive.appColor);
    setOrientation(archive.orientation as any);
    toast.success(`Presets restored for "${archive.appName}"`);
  };

  // Delete an archive item from LocalStorage
  const deleteArchiveItem = (id: string) => {
    const updated = buildArchives.filter(a => a.id !== id);
    saveArchives(updated);
    toast.success("Archive entry cleared.");
  };

  // Clear all archives
  const clearAllArchives = () => {
    if (window.confirm("Are you sure you want to delete all local build history?")) {
      saveArchives([]);
      toast.success("Archives purged successfully.");
    }
  };

  // Brand logos for the infinite marquee
  const brandLogos: BrandLogo[] = [
    { char: "V", name: "Vortex", color: "text-indigo-400" },
    { char: "N", name: "Nimbus", color: "text-emerald-400" },
    { char: "P", name: "Prysma", color: "text-purple-400" },
    { char: "C", name: "Cirrus", color: "text-cyan-400" },
    { char: "K", name: "Kynder", color: "text-amber-400" },
    { char: "H", name: "Halcyn", color: "text-rose-400" }
  ];

  return (
    <div id="landing-root" className="relative min-h-screen flex flex-col justify-between bg-background text-foreground font-sans overflow-x-hidden select-none">
      <Toaster position="top-right" toastOptions={{ style: { background: "#11121d", color: "#f3f3f3", border: "1px solid rgba(255,255,255,0.08)" } }} />

      {/* BACKGROUND VIDEO ENGINE */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{ opacity: 0 }}
        muted
        playsInline
        loop={false}
      />

      {/* BLURRED OVERLAY SHAPE */}
      <div 
        id="blurred-backdrop"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-90 bg-gray-950 blur-[82px] pointer-events-none z-10"
      />

      {/* NAVBAR */}
      <header className="relative w-full z-30">
        <div className="w-full py-5 px-8 flex items-center justify-between">
          
          {/* Left Side Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/src/assets/logo.png" 
              alt="Nexus Logo" 
              className="h-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="font-headline text-lg font-bold tracking-widest text-white flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-gradient-to-tr from-indigo-500 to-amber-400 block md:hidden" />
              <span className="hidden sm:inline">NEXUS</span>
            </span>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <button
                id="btn-features"
                onClick={() => setActiveMenu(activeMenu === "features" ? null : "features")}
                className="flex items-center space-x-1 text-sm font-medium text-foreground/95 hover:text-white transition duration-200 cursor-pointer"
              >
                <span>Sovereign Tech</span>
                <ChevronDown className={`h-4 w-4 opacity-70 transition-transform duration-300 ${activeMenu === "features" ? "rotate-180 text-indigo-400" : ""}`} />
              </button>
            </div>

            <button
              id="btn-solutions"
              onClick={() => setActiveMenu(activeMenu === "solutions" ? null : "solutions")}
              className="flex items-center space-x-1 text-sm font-medium text-foreground/95 hover:text-white transition duration-200 cursor-pointer"
            >
              <span>Enterprise SDK</span>
            </button>

            <button
              id="btn-plans"
              onClick={() => {
                setActiveMenu(null);
                toast.success("Premium compilations are fully free for early beta innovators.");
              }}
              className="text-sm font-medium text-foreground/95 hover:text-white transition duration-200 cursor-pointer"
            >
              Global Network
            </button>
          </nav>

          {/* Right: Reset Compiler & Status pill */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-mono text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>GHA Active</span>
            </div>

            <button
              id="btn-reset"
              onClick={() => {
                setBuildStatus("idle");
                setActiveBuildId(null);
                setConsoleLogs([]);
                setProgress(0);
                toast.success("Compiler environment flushed and reset.");
              }}
              className="btn-hero-secondary rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase cursor-pointer"
            >
              Reset Session
            </button>
          </div>
        </div>

        {/* 1px Gradient Divider Line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent mt-[3px]" />

        {/* Floating Dropdown Panels */}
        <AnimatePresence>
          {activeMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[520px] rounded-2xl liquid-glass border border-white/5 p-6 shadow-2xl z-40 text-left"
            >
              {activeMenu === "features" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl hover:bg-white/5 transition duration-200">
                    <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                      <Cpu className="h-4 w-4" />
                      <span className="font-semibold text-xs tracking-wider uppercase">Native Engine</span>
                    </div>
                    <p className="text-[11px] text-hero-sub opacity-80 leading-normal">
                      Deeply compiled Android Gradle packages using high-speed cloud workflow runners.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl hover:bg-white/5 transition duration-200">
                    <div className="flex items-center space-x-2 text-amber-400 mb-1">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-semibold text-xs tracking-wider uppercase">Splash Injector</span>
                    </div>
                    <p className="text-[11px] text-hero-sub opacity-80 leading-normal">
                      Dynamically bundle custom application color schemes, display names, and immersive web wrappers.
                    </p>
                  </div>
                </div>
              )}

              {activeMenu === "solutions" && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl hover:bg-white/5 transition duration-200 cursor-pointer">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Signed Release Binaries</h4>
                    <p className="text-[11px] text-hero-sub opacity-80">
                      Deliver complete Android keystore signed APK artifacts optimized for direct play store submission.
                    </p>
                  </div>
                </div>
              )}

              <div className="w-full flex justify-end mt-4 pt-3 border-t border-white/5">
                <button 
                  onClick={() => setActiveMenu(null)}
                  className="text-[9px] font-mono tracking-widest uppercase text-foreground/40 hover:text-white transition cursor-pointer"
                >
                  [ Close menu ]
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* CORE HERO COMPILER HUB */}
      <main className="relative flex-1 flex flex-col justify-center items-center px-4 md:px-8 py-12 z-10 overflow-visible w-full max-w-7xl mx-auto">
        
        {/* Dynamic Micro-Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 shadow-lg mb-8 cursor-pointer hover:bg-white/[0.06] transition"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-slate-200">
            Sovereign Compiler Node Active
          </span>
          <ArrowRight className="h-3 w-3 text-slate-400" />
        </motion.div>

        {/* Dynamic Title */}
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-headline font-normal tracking-[-0.024em] leading-[1.02] text-[48px] sm:text-[70px] md:text-[90px] lg:text-[110px]"
          >
            <span>Web </span>
            <span 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(to left, #6366f1, #a855f7, #fcd34d)" }}
            >
              APK
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-sans text-hero-sub text-sm sm:text-base leading-relaxed max-w-xl mt-3 mx-auto opacity-80"
          >
            Convert any responsive web experience into sovereign, high-fidelity Android packages with live GHA build status pipelines.
          </motion.p>
        </div>

        {/* TWO-COLUMN COMPILER WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mt-2 items-start text-left">
          
          {/* LEFT: Compiler Configurations (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <h2 className="font-headline text-lg font-bold text-white mb-6 flex items-center space-x-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                <span>Compiler Configuration</span>
              </h2>

              <form onSubmit={triggerCompilation} className="space-y-5">
                
                {/* Website URL Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center space-x-1.5">
                    <Globe className="h-3 w-3 text-indigo-400" />
                    <span>Target Website URL</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="your-app.vercel.app or https://your-responsive-app.com"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 transition duration-300"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    Supports Vercel, Netlify, custom domains, etc. (auto-adds https:// protocol prefix)
                  </span>
                </div>

                {/* Grid for App Name and Package ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* App Name */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center space-x-1.5">
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      <span>App Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="My Premium App"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition duration-300"
                    />
                  </div>

                  {/* Package ID */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center space-x-1.5">
                      <Cpu className="h-3 w-3 text-amber-400" />
                      <span>Package ID</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      placeholder="com.nexus.app"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 transition duration-300"
                    />
                  </div>
                </div>

                {/* App Theme and Device Orientation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Accent Color picker */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      Primary Theme Color
                    </label>
                    <div className="flex items-center space-x-3 bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2">
                      <input
                        type="color"
                        value={appColor}
                        onChange={(e) => setAppColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-300 uppercase">{appColor}</span>
                    </div>
                  </div>

                  {/* Target Orientation */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      Screen Orientation
                    </label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as any)}
                      className="w-full bg-black/85 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition duration-300 cursor-pointer"
                    >
                      <option value="portrait">Portrait Only</option>
                      <option value="landscape">Landscape Only</option>
                      <option value="auto">Auto / Sensor Rotate</option>
                    </select>
                  </div>
                </div>

                {/* Experience Toggles */}
                <div className="py-2 space-y-3">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">
                    Container Level Capabilities
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center space-x-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl p-3 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={isFullscreen}
                        onChange={(e) => setIsFullscreen(e.target.checked)}
                        className="rounded border-white/10 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300">Fullscreen</span>
                    </label>

                    <label className="flex items-center space-x-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl p-3 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={pullToRefresh}
                        onChange={(e) => setPullToRefresh(e.target.checked)}
                        className="rounded border-white/10 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300">Pull to Refresh</span>
                    </label>

                    <label className="flex items-center space-x-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl p-3 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={zoomControls}
                        onChange={(e) => setZoomControls(e.target.checked)}
                        className="rounded border-white/10 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300">Pinch to Zoom</span>
                    </label>
                  </div>
                </div>

                {/* Collapsible Advanced Settings (GitHub Secrets & Targets) */}
                <div className="border-t border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>{showAdvanced ? "Hide Advanced Core Parameters" : "Show Advanced Core Parameters"}</span>
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3 space-y-3 pt-1"
                      >
                        <div className="space-y-1">
                          <label className="block text-[9px] font-mono uppercase text-slate-500">
                            GitHub Repository (dispatch target)
                          </label>
                          <input
                            type="text"
                            value={githubRepo}
                            onChange={(e) => setGithubRepo(e.target.value)}
                            placeholder="owner/repo"
                            className="w-full bg-white/[0.01] border border-white/5 rounded-xl px-3 py-2 text-xs text-white font-mono"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Build Activation Button */}
                <button
                  type="submit"
                  disabled={buildStatus === "queued" || buildStatus === "in_progress"}
                  className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-widest transition duration-300 flex items-center justify-center space-x-2 shadow-[0_8px_24px_rgba(99,102,241,0.2)] disabled:opacity-50 cursor-pointer"
                >
                  {buildStatus === "queued" || buildStatus === "in_progress" ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-indigo-300" />
                      <span>Packaging Source Web Assets ({progress}%)</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="h-4 w-4 text-amber-300" />
                      <span>Compile Native App</span>
                    </>
                  )}
                </button>

              </form>
            </motion.div>
          </div>

          {/* RIGHT: SMARTPHONE SIMULATOR & COMPILE MONITOR (5 Columns) */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="relative w-full max-w-[340px] aspect-[9/18.5] bg-[#0c0d16] rounded-[48px] p-3.5 border-[7px] border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10 overflow-hidden flex flex-col justify-between"
              style={{ borderColor: appColor }}
            >
              {/* Phone Speaker & Camera Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-800 rounded-b-2xl z-40 flex items-center justify-center space-x-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                <div className="w-8 h-1 rounded-full bg-slate-900" />
              </div>

              {/* Status bar */}
              <div className="flex justify-between px-5 pt-4 text-[9px] font-mono text-slate-400 z-30">
                <span>09:41</span>
                <div className="flex items-center space-x-1">
                  <Wifi className="h-2.5 w-2.5" />
                  <Battery className="h-2.5 w-2.5" />
                </div>
              </div>

              {/* INNER SCREEN */}
              <div className="relative flex-1 rounded-[32px] overflow-hidden bg-slate-950 mt-2 p-1 z-20 flex flex-col justify-between border border-white/5">
                
                <AnimatePresence mode="wait">
                  {buildStatus === "idle" ? (
                    /* IFRAME WEBSITE SIMULATION PREVIEW */
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col justify-between"
                    >
                      {/* Interactive address overlay inside simulator */}
                      <div className="p-2.5 bg-slate-900/90 border-b border-white/5 flex items-center justify-between z-10">
                        <div className="flex items-center space-x-1 text-[9px] font-mono text-slate-400 max-w-[150px] truncate">
                          <Lock className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{websiteUrl}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: appColor }} />
                          <span className="text-[8px] font-bold tracking-widest text-slate-500 uppercase">{orientation}</span>
                        </div>
                      </div>

                      {/* Web View Simulator Iframe */}
                      <div className="flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
                        {websiteUrl && websiteUrl.startsWith("http") ? (
                          <iframe
                            src={websiteUrl}
                            className="w-full h-full border-none"
                            title="Interactive Container Preview"
                            referrerPolicy="no-referrer"
                            sandbox="allow-scripts allow-same-origin allow-forms"
                            onError={() => toast.error("Live preview cannot be nested in a frame, but compilation will succeed.")}
                          />
                        ) : (
                          <div className="text-center p-4 space-y-2">
                            <Smartphone className="h-8 w-8 mx-auto text-slate-600 animate-bounce" />
                            <p className="text-[10px] text-slate-500">Awaiting configuration target</p>
                          </div>
                        )}
                      </div>

                      {/* Device Action Bar */}
                      <div className="p-3 bg-slate-900/90 border-t border-white/5 text-center text-[9px] font-mono text-slate-400">
                        <span>Container OS v1.0.4</span>
                      </div>
                    </motion.div>
                  ) : (
                    /* ACTIVE HIGH-TECH BUILD MONITOR */
                    <motion.div
                      key="monitor"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 p-4 flex flex-col justify-between bg-slate-950 overflow-y-auto"
                    >
                      {/* Active Status Header */}
                      <div className="space-y-1 pt-4 text-center">
                        <div className="inline-block px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-mono uppercase tracking-widest text-indigo-300">
                          {buildStatus}
                        </div>
                        <h4 className="font-headline text-sm font-bold text-white truncate px-2">{appName}</h4>
                        <p className="text-[9px] text-slate-500 font-mono truncate">{packageName}</p>
                      </div>

                      {/* STEPS PIPELINE */}
                      <div className="my-4 space-y-2.5 text-left">
                        {steps.map((st, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <div className="mt-1 shrink-0">
                              {activeStepIndex > i ? (
                                <div className="h-3 w-3 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[7px] font-bold">✓</div>
                              ) : activeStepIndex === i ? (
                                <div className="h-3 w-3 rounded-full bg-indigo-500 animate-ping" />
                              ) : (
                                <div className="h-3 w-3 rounded-full bg-slate-800" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-[10px] font-semibold tracking-tight ${activeStepIndex === i ? "text-indigo-400" : activeStepIndex > i ? "text-emerald-400" : "text-slate-500"}`}>{st.title}</p>
                              <p className="text-[8px] text-slate-500 leading-tight truncate">{st.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Dynamic Terminal Logs Console */}
                      <div className="bg-black/90 rounded-xl p-2.5 border border-white/5 font-mono text-[8px] text-emerald-400 h-24 overflow-y-auto space-y-1 text-left">
                        {consoleLogs.map((log, i) => (
                          <p key={i} className="leading-normal break-all">{log}</p>
                        ))}
                      </div>

                      {/* PROGRESS BAR & DOWNLOAD CTAS */}
                      <div className="space-y-3 pb-2">
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        {/* Interactive download buttons when completed */}
                        {buildStatus === "completed" && (
                          <div className="space-y-1.5 pt-1">
                            {androidDownloadUrl && (
                              <a
                                href={androidDownloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-[10px] font-mono text-slate-950 font-bold flex items-center justify-center space-x-1 transition"
                              >
                                <Download className="h-3 w-3" />
                                <span>Download APK package</span>
                              </a>
                            )}
                            {iosDownloadUrl && (
                              <a
                                href={iosDownloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-[10px] font-mono text-white font-bold flex items-center justify-center space-x-1 transition"
                              >
                                <Download className="h-3 w-3" />
                                <span>Download iOS App</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          </div>

        </div>

        {/* SYSTEM BUILD ARCHIVES PANEL */}
        {buildArchives.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mt-12 text-left liquid-glass rounded-3xl p-6 sm:p-8 space-y-5 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white tracking-tight">System Build Archives</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Offline Client Cache Logs</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={clearAllArchives}
                className="px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/10 rounded-xl text-[10px] font-mono text-rose-400 hover:text-rose-300 transition"
              >
                Clear Archive
              </button>
            </div>

            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              {buildArchives.map((archive) => (
                <div key={archive.id} className="liquid-glass rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5 hover:border-indigo-500/10 transition duration-300">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-white truncate block max-w-[200px]">{archive.appName}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400 truncate">{archive.packageName}</span>
                      {archive.appColor && (
                        <span 
                          className="h-2 w-2 rounded-full shrink-0" 
                          style={{ backgroundColor: archive.appColor }}
                          title={`Accent: ${archive.appColor}`}
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-mono text-slate-500">
                      <span className="text-indigo-400/80 truncate block max-w-[220px]">{archive.websiteUrl}</span>
                      <span>•</span>
                      <span>{archive.timestamp}</span>
                      {archive.orientation && (
                        <>
                          <span>•</span>
                          <span className="capitalize text-pink-400/80">{archive.orientation}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => restoreArchivePreset(archive)}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-lg text-[10px] font-mono text-slate-300 hover:text-white transition active:translate-y-0.5"
                      title="Prefill configuration settings with this archive"
                    >
                      Restore Presets
                    </button>

                    {archive.android_url && (
                      <a
                        href={archive.android_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-[10px] font-mono text-emerald-400 hover:text-emerald-300 transition flex items-center space-x-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>APK</span>
                      </a>
                    )}

                    {archive.ios_url && (
                      <a
                        href={archive.ios_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-[10px] font-mono text-purple-400 hover:text-purple-300 transition flex items-center space-x-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>iOS</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteArchiveItem(archive.id)}
                      className="p-1.5 bg-slate-950 hover:bg-rose-950/20 border border-white/5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                      title="Delete entry from local archives"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </main>

      {/* LOGO MARQUEE (Pinned to bottom of hero, pb-10) */}
      <footer className="relative w-full pb-10 z-20">
        <div className="w-full max-w-5xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            
            {/* Left side: Static Text */}
            <div className="shrink-0 text-foreground/50 text-sm font-medium tracking-tight text-center md:text-left leading-tight whitespace-nowrap">
              Relied on by brands <br className="hidden sm:block" /> across the globe
            </div>

            {/* Right side: Infinite Scrolling Marquee */}
            <div className="relative flex-1 overflow-hidden w-full py-4 [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
              <div className="flex gap-16 animate-marquee whitespace-nowrap shrink-0">
                {/* First Logo Set */}
                {brandLogos.map((logo, idx) => (
                  <div key={`brand-set-1-${idx}`} className="flex items-center space-x-3 shrink-0">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center liquid-glass text-[10px] font-bold font-mono text-indigo-400">
                      {logo.char}
                    </div>
                    <span className="text-base font-semibold text-foreground tracking-tight">{logo.name}</span>
                  </div>
                ))}
                {/* Duplicated set for seamless loop */}
                {brandLogos.map((logo, idx) => (
                  <div key={`brand-set-2-${idx}`} className="flex items-center space-x-3 shrink-0" aria-hidden="true">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center liquid-glass text-[10px] font-bold font-mono text-indigo-400">
                      {logo.char}
                    </div>
                    <span className="text-base font-semibold text-foreground tracking-tight">{logo.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}
