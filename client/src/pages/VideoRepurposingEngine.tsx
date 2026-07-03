import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Zap, Clock } from "lucide-react";

export default function VideoRepurposingEngine() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Video Repurposing Engine</h1>
          <p className="text-purple-200">
            Transform your videos into multiple formats for different platforms
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-purple-500/20 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <Video className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Video Repurposing</h2>
                <p className="text-pink-300 text-sm">Convert videos for all platforms</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-slate-300">
                Automatically transform your long-form videos into optimized clips for TikTok, Instagram Reels, YouTube Shorts, and more. Save time and maximize your reach.
              </p>

              <div className="space-y-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  Coming Soon Features
                </h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>✓ Automatic video segmentation</li>
                  <li>✓ Platform-specific optimization</li>
                  <li>✓ Caption and subtitle generation</li>
                  <li>✓ Aspect ratio conversion</li>
                  <li>✓ Batch processing</li>
                  <li>✓ Trending clips detection</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-purple-500/20">
                <p className="text-pink-300 text-sm mb-4">
                  🎬 AI Video Repurposing is under development.
                </p>
                <Button disabled className="w-full bg-slate-700 text-slate-400 cursor-not-allowed">
                  Coming Soon
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Supported Platforms */}
        <Card className="bg-slate-800/30 border-purple-500/20 p-6">
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Supported Platforms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: "TikTok", emoji: "🎵" },
                { name: "Instagram Reels", emoji: "📸" },
                { name: "YouTube Shorts", emoji: "📺" },
                { name: "LinkedIn", emoji: "💼" },
                { name: "Facebook", emoji: "👥" },
                { name: "Twitter/X", emoji: "𝕏" },
              ].map((platform) => (
                <div key={platform.name} className="p-4 bg-slate-700/30 rounded-lg border border-purple-500/20 text-center">
                  <p className="text-2xl mb-2">{platform.emoji}</p>
                  <p className="text-white font-medium">{platform.name}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Info Section */}
        <Card className="bg-slate-800/30 border-purple-500/20 p-6">
          <div className="space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Why This Feature Is Coming Soon
            </h3>
            <p className="text-slate-300">
              We're building the most intelligent video repurposing engine that automatically identifies the best clips, optimizes them for each platform, and adds captions for maximum engagement. This feature is currently in development and will be available soon.
            </p>
            <p className="text-purple-300 text-sm">
              💡 In the meantime, you can manually upload and schedule videos across platforms using our Post Scheduling feature.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
