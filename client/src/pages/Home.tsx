import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/generator");
    } else {
      navigate("/generator");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">AI Content Engine</span>
          </div>
          <Button
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-8">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Powered by Advanced AI
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Create Viral Content in{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Seconds
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Generate complete, high-engagement content packages tailored to your
              niche, audience, and platform. Ready to post. Ready to convert.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Start Generating Content
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-slate-700 border-slate-300 hover:bg-slate-50 text-lg px-8 py-6 rounded-lg font-semibold"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>100% AI-Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Instantly Ready to Post</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Optimized for Virality</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">
              What You Get
            </h2>
            <p className="text-lg text-slate-600 text-center mb-16 max-w-2xl mx-auto">
              Each content package includes everything you need for maximum engagement
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  10 Viral Ideas
                </h3>
                <p className="text-slate-600">
                  Highly engaging, curiosity-driven content concepts tailored to your
                  niche and audience
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Ready-to-Post Scripts
                </h3>
                <p className="text-slate-600">
                  Platform-optimized video scripts, captions, hooks, and hashtags—all
                  ready to copy and paste
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Repurposed Content
                </h3>
                <p className="text-slate-600">
                  Automatically adapted for Twitter, LinkedIn, YouTube, and more—
                  maximize your reach
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Stop Struggling with Content Ideas
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Let AI do the creative heavy lifting. Generate a complete content package
              in under a minute.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white hover:bg-slate-100 text-blue-600 font-semibold text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Generate Your First Package
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white">AI Content Engine</span>
            </div>
            <p className="text-sm">
              © 2026 AI Content Engine. Powered by advanced AI technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
