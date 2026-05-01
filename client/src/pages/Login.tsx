import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Sparkles, Zap, Flame, ArrowRight } from "lucide-react";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">AI Content Engine</h1>
          </div>
          <p className="text-slate-400">Create viral content in seconds</p>
        </div>

        {/* Main Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8 mb-8">
          <div className="space-y-6">
            {/* Heading */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-400">Sign in to start creating amazing content</p>
            </div>

            {/* Features List */}
            <div className="space-y-3 py-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Instant Content Generation</p>
                  <p className="text-sm text-slate-400">Get 10 viral ideas in seconds</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Flame className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Multiple Platforms</p>
                  <p className="text-sm text-slate-400">Instagram, Twitter, LinkedIn, YouTube & more</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Pro Automation</p>
                  <p className="text-sm text-slate-400">Schedule content generation automatically</p>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <Button
              onClick={() => window.location.href = loginUrl}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-6 text-lg"
            >
              Sign In with Manus
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">New user?</span>
              </div>
            </div>

            {/* Sign Up Info */}
            <p className="text-center text-slate-400 text-sm">
              Sign in to create your account or log in to an existing one
            </p>
          </div>
        </Card>

        {/* Trust Section */}
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-4">Trusted by creators worldwide</p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-white font-bold text-lg">10K+</p>
              <p className="text-slate-400 text-xs">Active Users</p>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">1M+</p>
              <p className="text-slate-400 text-xs">Content Generated</p>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">99.9%</p>
              <p className="text-slate-400 text-xs">Uptime</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-slate-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
