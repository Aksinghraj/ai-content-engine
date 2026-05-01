import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import {
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Layers,
  Clock,
} from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/generator");
    } else {
      window.location.href = getLoginUrl();
      // After login, user will be redirected to /generator via callback
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-20 pb-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-8 hover:border-purple-500/50 transition-colors">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Powered by Advanced AI</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight">
              Create Viral Content in
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                Seconds
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Generate complete, high-engagement content packages tailored to your niche, audience, and platform. Ready to post. Ready to convert.
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
              Everything You Need to
              <span className="block text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                Dominate Social Media
              </span>
            </h2>
            <p className="text-center text-slate-400 text-lg mb-16 max-w-2xl mx-auto">
              Complete content packages with viral ideas, scripts, hooks, captions, hashtags, and more
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">10 Viral Ideas</h3>
                <p className="text-slate-300 leading-relaxed">Get 10 highly engaging, curiosity-driven content ideas specifically tailored to your niche and audience</p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Complete Scripts</h3>
                <p className="text-slate-300 leading-relaxed">Platform-optimized video scripts, captions, hooks, and hashtags ready to post immediately</p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Repurposed Content</h3>
                <p className="text-slate-300 leading-relaxed">Convert to Twitter threads, LinkedIn posts, and YouTube descriptions with one click</p>
              </div>

              {/* Feature 4 */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant Generation</h3>
                <p className="text-slate-300 leading-relaxed">Get complete content packages in seconds, not hours. No waiting, no delays</p>
              </div>

              {/* Feature 5 */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Pro Automation</h3>
                <p className="text-slate-300 leading-relaxed">Schedule content generation on any platform, any time. Full automation for Pro users</p>
              </div>

              {/* Feature 6 */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Rocket className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Optimization Tips</h3>
                <p className="text-slate-300 leading-relaxed">Get posting times, engagement strategies, and proven tactics for maximum reach</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/50 p-12 md:p-16 backdrop-blur-sm">
              <h2 className="text-4xl md:text-5xl font-black text-center mb-6">
                Ready to Transform Your Content Strategy?
              </h2>
              <p className="text-xl text-slate-300 text-center mb-8 leading-relaxed">
                Join thousands of creators and businesses generating viral content every day. No credit card required.
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={handleGetStarted}
                  className="px-10 py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Free Today
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-purple-500/20 py-12 px-4 mt-20">
          <div className="max-w-6xl mx-auto text-center text-slate-400 text-sm">
            <p>© 2026 AI Content Engine. All rights reserved. | Powered by Advanced AI</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
