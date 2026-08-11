import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Sparkles, Zap, Target, TrendingUp, ArrowRight, Rocket,
  CheckCircle, Star, Shield, Clock, BarChart3, Bot, Calendar
} from "lucide-react";

// Animated section wrapper component
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [user, setUser] = useState<any>(null);

  // Strip OAuth callback params from URL without reloading
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("code") || url.searchParams.has("state") || url.searchParams.has("error")) {
      url.searchParams.delete("code");
      url.searchParams.delete("state");
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  const handleLogout = async () => {
    // Simple logout - just redirect
    window.location.href = getLoginUrl();
  };

  // Check user status on mount (optional - for showing dashboard button if logged in)
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/trpc/auth.me?batch=1", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data[0]?.result?.data) {
            setUser(data[0].result.data);
          }
        }
      } catch (err) {
        // Silently fail - user is not logged in
      }
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10">
        {/* ── HEADER ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-purple-500/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <img
                src="/manus-storage/lumae-logo-icon_ccacaad9.jpg"
                alt="Lumae AI"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg object-cover"
              />
              <span className="text-lg sm:text-xl font-bold text-white">Lumae AI</span>
            </div>

            {/* Nav */}
            <nav className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  <Button
                    onClick={handleGetStarted}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs sm:text-sm px-3 sm:px-5 h-9"
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="border-red-500/40 text-red-300 hover:bg-red-500/10 hover:border-red-500 text-xs sm:text-sm px-3 sm:px-5 h-9"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleGetStarted}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs sm:text-sm px-4 sm:px-6 h-9"
                >
                  Sign In / Sign Up
                </Button>
              )}
            </nav>
          </div>
        </header>

        {/* ── HERO ───────────────────────────────────────────── */}
        <AnimatedSection>
        <section className="px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6 text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-purple-300">Powered by Advanced AI · Free to Start</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-5 leading-tight tracking-tight">
              Create Viral Content with
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Lumae AI
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              The AI-powered platform that generates, schedules, and automates social media content across all platforms. Transform your strategy in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-2xl hover:shadow-purple-500/40 transition-all duration-300"
              >
                <Rocket className="w-5 h-5 mr-2 shrink-0" />
                {user ? "Start Generating Now" : "Start Free — No Credit Card"}
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-bold border-2 border-purple-400/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 rounded-xl transition-all duration-300"
                onClick={() => navigate("/pricing")}
              >
                <ArrowRight className="w-5 h-5 mr-2 shrink-0" />
                View Pricing
              </Button>
            </div>

            {/* Free tier signal */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400 mb-12">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> 3 free AI generations</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> Cancel anytime</span>
            </div>

            {/* Social proof stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-xl mx-auto">
              {[
                { value: "10K+", label: "Content Pieces" },
                { value: "98%", label: "Satisfaction Rate" },
                { value: "24/7", label: "AI Available" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center p-3 sm:p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-0.5">{value}</div>
                  <div className="text-xs sm:text-sm text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        </AnimatedSection>

        {/* ── HOW IT WORKS ───────────────────────────────────── */}
        <AnimatedSection>
          <section className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-900/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">
              How It Works
            </h2>
            <p className="text-center text-slate-400 mb-12 max-w-xl mx-auto text-sm sm:text-base">
              From idea to published post in under 60 seconds
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative">
              {/* Connector line on desktop */}
              <div className="hidden sm:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-purple-500/30 to-blue-500/30" />

              {[
                {
                  step: "1",
                  icon: Target,
                  title: "Tell us your niche",
                  desc: "Enter your niche, target audience, and content goal. Lumae AI understands your brand voice.",
                },
                {
                  step: "2",
                  icon: Sparkles,
                  title: "AI generates content",
                  desc: "Our AI creates platform-optimized posts, captions, hashtags, and scripts in seconds.",
                },
                {
                  step: "3",
                  icon: Calendar,
                  title: "Schedule & publish",
                  desc: "Review, edit, and schedule posts to go live at the perfect time across all platforms.",
                },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4 text-white font-bold text-lg">
                    {step}
                  </div>
                  <Icon className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="font-bold text-lg mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        </AnimatedSection>

        <AnimatedSection>
          {/* ── FEATURES ───────────────────────────────────────── */}
          <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-3">
              Everything You Need
              <span className="block text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                to Grow Online
              </span>
            </h2>
            <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto text-sm sm:text-base">
              All the tools creators and businesses need to generate, schedule, and automate content across every platform.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {[
                {
                  icon: Sparkles,
                  title: "AI Content Generation",
                  description: "Generate high-quality, platform-optimized content in seconds using advanced AI",
                },
                {
                  icon: Calendar,
                  title: "Smart Scheduling",
                  description: "Schedule posts across Instagram, YouTube, LinkedIn, Twitter, and more automatically",
                },
                {
                  icon: Target,
                  title: "Content Repurposing",
                  description: "Turn one piece of content into multiple formats for different platforms",
                },
                {
                  icon: BarChart3,
                  title: "Analytics & Insights",
                  description: "Track engagement, reach, and performance across all your social channels",
                },
                {
                  icon: Bot,
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
                  className="p-5 sm:p-6 rounded-xl bg-purple-500/5 border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <feature.icon className="w-10 h-10 text-purple-400 mb-3" />
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        </AnimatedSection>

        {/* ── PRICING SIGNAL ─────────────────────────────────── */}
        <AnimatedSection>
          <section className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-900/30">
            <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black mb-3">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 mb-10 text-sm sm:text-base">Start free, upgrade when you're ready</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-2xl mx-auto">
              {/* Free tier */}
              <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20 text-left">
                <div className="text-sm text-purple-400 font-semibold mb-1">FREE</div>
                <div className="text-3xl font-black mb-1">$0</div>
                <div className="text-slate-400 text-sm mb-5">Forever free</div>
                <ul className="space-y-2.5 text-sm text-slate-300">
                  {["3 AI content generations", "Basic scheduling", "1 social account", "Community support"].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button onClick={handleGetStarted} className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
                  Get Started Free
                </Button>
              </div>

              {/* Pro tier */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/40 text-left relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">POPULAR</div>
                <div className="text-sm text-purple-400 font-semibold mb-1">PRO</div>
                <div className="text-3xl font-black mb-1">$19<span className="text-lg font-normal text-slate-400">/mo</span></div>
                <div className="text-slate-400 text-sm mb-5">Billed monthly</div>
                <ul className="space-y-2.5 text-sm text-slate-300">
                  {["Unlimited AI generations", "Advanced scheduling", "All social platforms", "Priority support", "Analytics & insights", "Team collaboration"].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => navigate("/pricing")} className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Start Pro Trial
                </Button>
              </div>
            </div>
          </div>
          </section>
        </AnimatedSection>

        {/* ── TESTIMONIALS / SOCIAL PROOF ────────────────────── */}
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-3">What Creators Say</h2>
            <p className="text-center text-slate-400 mb-10 text-sm sm:text-base">Join thousands of creators growing with Lumae AI</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  name: "Priya S.",
                  handle: "@priyacreates",
                  text: "Lumae AI saved me 10+ hours a week. My Instagram engagement went up 3x in just one month!",
                  stars: 5,
                },
                {
                  name: "Rahul M.",
                  handle: "@rahulmarketing",
                  text: "The content repurposing feature is insane. One blog post becomes 20 social posts automatically.",
                  stars: 5,
                },
                {
                  name: "Anjali K.",
                  handle: "@anjalilifestyle",
                  text: "Finally an AI tool that understands my brand voice. The content feels authentic, not robotic.",
                  stars: 5,
                },
              ].map(({ name, handle, text, stars }) => (
                <div key={name} className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">"{text}"</p>
                  <div>
                    <div className="font-semibold text-sm">{name}</div>
                    <div className="text-slate-500 text-xs">{handle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DATA PRIVACY ───────────────────────────────────── */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-900/30">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-purple-400 shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-bold">Data Privacy & Security</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-slate-300 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">Google OAuth Integration</h3>
                <p>We use Google OAuth to authenticate users securely. Your Google account information is used only for account creation and authentication — never sold or shared.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Data Retention & Deletion</h3>
                <p>We retain your data only as long as your account is active. You can request data deletion at any time by contacting support@lumae.co.in.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ──────────────────────────────────────── */}
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Transform Your Content?
            </h2>
            <p className="text-slate-300 mb-8 text-base sm:text-lg">
              Join thousands of creators automating their social media presence with AI.
            </p>
            <Button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-2xl hover:shadow-purple-500/40 transition-all duration-300"
            >
              <Rocket className="w-5 h-5 mr-2 shrink-0" />
              {user ? "Go to Dashboard" : "Start Free Today"}
            </Button>
            <p className="text-slate-500 text-sm mt-4 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              Takes less than 60 seconds to set up
            </p>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <footer className="py-10 sm:py-12 px-4 sm:px-6 border-t border-purple-500/10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-blue-600 rounded-md flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-white">Lumae AI</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">AI-powered social media content generation and automation platform.</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Product</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><button onClick={() => navigate("/pricing")} className="hover:text-purple-400 transition text-left">Pricing</button></li>
                  <li><button onClick={handleGetStarted} className="hover:text-purple-400 transition text-left">Features</button></li>
                  <li><button onClick={handleGetStarted} className="hover:text-purple-400 transition text-left">Security</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Company</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><button onClick={() => navigate("/about")} className="hover:text-purple-400 transition text-left">About Us</button></li>
                  <li><button onClick={() => navigate("/contact")} className="hover:text-purple-400 transition text-left">Contact</button></li>
                  <li><a href="mailto:imankitsingh.in@gmail.com" className="hover:text-purple-400 transition">Support</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Legal</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><button onClick={() => navigate("/privacy-policy")} className="hover:text-purple-400 transition text-left">Privacy Policy</button></li>
                  <li><button onClick={() => navigate("/terms")} className="hover:text-purple-400 transition text-left">Terms & Conditions</button></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-purple-500/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-xs">
              <p>© 2026 Lumae AI. All rights reserved. Owned by <a href="/about" className="hover:text-purple-400 transition">Ankit Singh</a>.</p>
              <p><a href="mailto:imankitsingh.in@gmail.com" className="hover:text-purple-400 transition">imankitsingh.in@gmail.com</a></p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
