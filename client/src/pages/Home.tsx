import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Sparkles, Zap, Target, TrendingUp, ArrowRight, Rocket } from "lucide-react";
import * as THREE from "three";

export default function Home() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      // Three.js setup
      const canvas = canvasRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });

      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setClearColor(0x0f0a1a, 0);
      camera.position.z = 5;

      // Create rotating cubes
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const materials = [
        new THREE.MeshPhongMaterial({ color: 0xa855f7 }),
        new THREE.MeshPhongMaterial({ color: 0x7c3aed }),
        new THREE.MeshPhongMaterial({ color: 0x6d28d9 }),
        new THREE.MeshPhongMaterial({ color: 0x5b21b6 }),
        new THREE.MeshPhongMaterial({ color: 0x4c1d95 }),
        new THREE.MeshPhongMaterial({ color: 0x3730a3 }),
      ];

      const cubes: any[] = [];
      for (let i = 0; i < 5; i++) {
        const mesh = new THREE.Mesh(geometry, materials);
        mesh.position.x = (Math.random() - 0.5) * 10;
        mesh.position.y = (Math.random() - 0.5) * 10;
        mesh.position.z = (Math.random() - 0.5) * 10;
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        scene.add(mesh);
        cubes.push({
          mesh,
          rotationSpeed: {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01,
          },
        });
      }

      // Lighting
      const light = new THREE.PointLight(0xffffff, 1);
      light.position.set(5, 5, 5);
      scene.add(light);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);

        cubes.forEach((cube) => {
          cube.mesh.rotation.x += cube.rotationSpeed.x;
          cube.mesh.rotation.y += cube.rotationSpeed.y;
          cube.mesh.rotation.z += cube.rotationSpeed.z;
        });

        renderer.render(scene, camera);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
      };
    } catch (error) {
      console.error("Error initializing Three.js:", error);
    }
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden">
      {/* 3D Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full opacity-40"
        style={{ pointerEvents: "none" }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-20 p-4 md:p-8 backdrop-blur-sm bg-transparent">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/manus-storage/lumae-ai-logo_f4bebb9d.png" alt="Lumae AI" className="w-12 h-12" />
              <span className="text-2xl font-bold text-white">Lumae AI</span>
            </div>
            <nav>
              <Button
                onClick={handleGetStarted}
                className="px-6 py-3 text-md font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg shadow-lg transition-all duration-300"
              >
                {user ? "Go to Dashboard" : "Sign In / Sign Up"}
              </Button>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-32 pb-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-8 hover:border-purple-500/50 transition-colors">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Powered by Advanced AI</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight">
              Create Viral Content with
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                Lumae AI
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The AI-powered platform that generates, schedules, and automates social media content across all platforms. Transform your content strategy in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                onClick={handleGetStarted}
                className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Generating Now
              </Button>
              <Button
                variant="outline"
                className="px-8 py-6 text-lg font-bold border-2 border-purple-400/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 rounded-xl transition-all duration-300"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-20">
              <div className="text-center p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
                <div className="text-3xl font-bold text-purple-400 mb-1">10K+</div>
                <div className="text-sm text-slate-400">Content Packages</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
                <div className="text-3xl font-bold text-purple-400 mb-1">98%</div>
                <div className="text-sm text-slate-400">Engagement Rate</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
                <div className="text-3xl font-bold text-purple-400 mb-1">24/7</div>
                <div className="text-sm text-slate-400">AI Generation</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-4">
              Lumae AI Features
              <span className="block text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                Everything You Need
              </span>
            </h2>
            <p className="text-center text-slate-300 mb-16 max-w-2xl mx-auto">
              All the tools creators and businesses need to generate, schedule, and automate content across every platform.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "AI Content Generation",
                  description: "Generate high-quality, platform-optimized content in seconds using advanced AI",
                },
                {
                  icon: Zap,
                  title: "Smart Scheduling",
                  description: "Schedule posts across Instagram, YouTube, LinkedIn, Twitter, and more automatically",
                },
                {
                  icon: Target,
                  title: "Content Repurposing",
                  description: "Turn one piece of content into multiple formats for different platforms",
                },
                {
                  icon: TrendingUp,
                  title: "Analytics & Insights",
                  description: "Track engagement, reach, and performance across all your social channels",
                },
                {
                  icon: Rocket,
                  title: "Auto-Reply System",
                  description: "Automate responses to comments and messages with AI-powered replies",
                },
                {
                  icon: Zap,
                  title: "Video Generation",
                  description: "Create engaging videos and media content with AI assistance",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <feature.icon className="w-12 h-12 text-purple-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Sharing Disclosure */}
        <section className="py-20 px-4 bg-slate-900/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Data Privacy & Sharing</h2>
            <div className="space-y-6 text-slate-300">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Google OAuth Integration</h3>
                <p>
                  We use Google OAuth to authenticate users securely. Your Google account information (name, email, profile picture) is used only for account creation and authentication.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Social Platform Data Sharing</h3>
                <p>
                  To provide content scheduling and automation services, we securely connect to your social media accounts:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
                  <li><strong>Instagram:</strong> We access your account to schedule posts and track engagement metrics</li>
                  <li><strong>YouTube:</strong> We access your channel to upload and schedule videos</li>
                  <li><strong>LinkedIn:</strong> We access your profile to schedule professional content</li>
                  <li><strong>Twitter/X:</strong> We access your account to schedule tweets and monitor interactions</li>
                  <li><strong>TikTok:</strong> We access your account for content scheduling (where available)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Data Retention & Deletion</h3>
                <p>
                  We retain your data only as long as your account is active. You can request data deletion at any time by contacting support@aicontent-engine.com. Upon deletion, all your content, scheduling history, and personal information will be permanently removed from our servers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Content?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of creators and businesses automating their social media presence with AI.
            </p>
            <Button
              onClick={handleGetStarted}
              className="px-10 py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start Free Today
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-purple-500/10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="#" className="hover:text-purple-400 transition">Features</a></li>
                  <li><a href="#" className="hover:text-purple-400 transition">Pricing</a></li>
                  <li><a href="#" className="hover:text-purple-400 transition">Security</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="#" className="hover:text-purple-400 transition">About</a></li>
                  <li><a href="#" className="hover:text-purple-400 transition">Blog</a></li>
                  <li><a href="#" className="hover:text-purple-400 transition">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="/privacy" className="hover:text-purple-400 transition">Privacy Policy</a></li>
                  <li><a href="/terms" className="hover:text-purple-400 transition">Terms of Service</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Follow</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="#" className="hover:text-purple-400 transition">Twitter</a></li>
                  <li><a href="#" className="hover:text-purple-400 transition">LinkedIn</a></li>
                  <li><a href="#" className="hover:text-purple-400 transition">Instagram</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-purple-500/10 pt-8 text-center text-slate-400">
              <p>&copy; 2026 Lumae AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
