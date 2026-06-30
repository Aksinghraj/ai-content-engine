import { usePageAnimation, useCardAnimations, useFloatingAnimation } from "@/hooks/useAnimation";
import { getRandomGradient } from "@/lib/animationUtils";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Sparkles, Zap, Brain, MessageSquare, TrendingUp, Rocket } from "lucide-react";
import { useEffect, useState } from "react";

export default function KimiHome() {
  const [, setLocation] = useLocation();
  const pageAnimation = usePageAnimation();
  const cardAnimations = useCardAnimations(6);
  const floatingAnimation = useFloatingAnimation();
  const [gradient, setGradient] = useState("from-purple-600 via-pink-600 to-red-600");

  useEffect(() => {
    setGradient(getRandomGradient());
  }, []);

  const features = [
    {
      icon: Brain,
      title: "Kimi AI Powered",
      description: "Advanced conversational AI that understands context and learns from interactions",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Real-time responses with streaming capabilities for instant feedback",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: MessageSquare,
      title: "Multi-Turn Conversations",
      description: "Maintain context across multiple interactions for natural dialogue",
      color: "from-green-500 to-teal-500",
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "Track engagement metrics and optimize your content strategy",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Rocket,
      title: "Auto-Posting",
      description: "Schedule and auto-post content across all social platforms",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Sparkles,
      title: "Content Magic",
      description: "Generate, repurpose, and optimize content with AI assistance",
      color: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className={`${pageAnimation.className} border-b border-white/10 backdrop-blur-md bg-black/20`}>
          <div className="container mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Lumae AI</h1>
            </div>
            <Button
              onClick={() => setLocation("/social-automation")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            >
              Get Started
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className={`${pageAnimation.className} container mx-auto px-4 py-20 text-center`}>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Meet Your <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>AI Content Companion</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Powered by Kimi AI principles. Create, schedule, and automate your content across all platforms with intelligent assistance.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => setLocation("/post-scheduling")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-6 text-lg"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Schedule Posts
            </Button>
            <Button
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10 px-8 py-6 text-lg"
              onClick={() => setLocation("/social-automation")}
            >
              <Zap className="w-5 h-5 mr-2" />
              Connect Accounts
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-20">
          <h3 className="text-3xl font-bold text-white mb-12 text-center">Powerful Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`${cardAnimations[index] || "animate-fade-scale"} group relative p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm`}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>

                  {/* Floating animation */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className={`absolute inset-0 rounded-xl border border-white/20 ${floatingAnimation.className}`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { number: "1M+", label: "Posts Scheduled", delay: "stagger-1" },
              { number: "500K+", label: "Active Users", delay: "stagger-2" },
              { number: "99.9%", label: "Uptime", delay: "stagger-3" },
              { number: "24/7", label: "AI Support", delay: "stagger-4" },
            ].map((stat, index) => (
              <div
                key={index}
                className={`animate-fade-scale ${stat.delay} p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 text-center`}
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className={`${pageAnimation.className} container mx-auto px-4 py-20 text-center`}>
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-12">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Content?</h3>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Join thousands of creators using Lumae AI to automate their social media strategy.
            </p>
            <Button
              onClick={() => setLocation("/post-scheduling")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-6 text-lg"
            >
              Start Creating Now
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-md">
          <div className="container mx-auto px-4 py-8 text-center text-gray-400 text-sm">
            <p>© 2026 Lumae AI. Powered by Kimi AI principles.</p>
          </div>
        </footer>
      </div>

      {/* Blob animation styles */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
