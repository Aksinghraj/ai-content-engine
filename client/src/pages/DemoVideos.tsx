import { useLocation } from "wouter";
import { ArrowLeft, Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import VideoPlayer from "@/components/VideoPlayer";

export default function DemoVideos() {
  const [, navigate] = useLocation();

  const demos = [
    {
      id: "full",
      title: "Complete App Walkthrough",
      description: "See all features of AI Content Engine in one comprehensive demo",
      video: "/manus-storage/demo-tutorial-1_009e6e90.mp4",
      duration: "8 seconds (Professional Tutorial)",
      features: ["Dashboard", "Content Generation", "Personal AI", "Social Automation", "Scheduling", "Analytics"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Demo Videos</h1>
          <p className="text-gray-400">Watch how to use AI Content Engine - Available in 10+ languages</p>
        </div>

        {/* Main Demo */}
        <div className="mb-12">
          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap size={24} className="text-purple-400" />
                Complete Walkthrough
              </CardTitle>
              <CardDescription>Professional tutorial showing how to navigate and use every feature</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video Player */}
              <VideoPlayer
                src="/manus-storage/demo-tutorial-1_009e6e90.mp4"
                title="AI Content Engine - Complete Demo"
                defaultLanguage="en"
                autoPlay={false}
              />

              {/* Features Covered */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {demos[0].features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-gray-300">
                    <Play size={16} className="text-purple-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">💡 Quick Start</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>✓ Select your preferred language from the video player</li>
                  <li>✓ Use the subtitle toggle to enable/disable captions</li>
                  <li>✓ Click fullscreen for immersive viewing</li>
                  <li>✓ Available in English, Hindi, Spanish, French, German, Portuguese, Japanese, Chinese, Arabic, and Russian</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">🎨 Content Generation</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400">
              Create viral, engaging content instantly with AI. Customize by niche, audience, platform, and style.
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">🤖 Personal AI Chat</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400">
              Chat with your AI assistant that learns your unique style. Includes voice typing for hands-free creation.
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">📱 Social Automation</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400">
              Connect Instagram, Twitter, LinkedIn, Facebook, YouTube, and TikTok. Manage all platforms from one dashboard.
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">📅 Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400">
              Schedule posts to multiple platforms simultaneously. Upload your photos/videos or use AI-generated content.
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">📊 Analytics</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400">
              Track automation performance with real-time analytics. Monitor connected accounts and scheduled posts.
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">🌍 Multi-Language</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400">
              Watch demos in 10+ languages with auto-generated subtitles. Perfect for global audiences.
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Automate Your Social Media?</h2>
          <p className="text-purple-100 mb-6">Start creating and scheduling content with AI today</p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/social-automation")}
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
            >
              Go to Social Automation
            </Button>
            <Button
              onClick={() => navigate("/generate-content")}
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Generate Content
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
