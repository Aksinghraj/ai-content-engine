import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Image, Zap, Clock } from "lucide-react";

export default function MediaGeneration() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Media Generation</h1>
          <p className="text-purple-200">
            Create stunning images and videos powered by AI
          </p>
        </div>

        {/* Coming Soon Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Generation Card */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-purple-500/20 overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Image className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Image Generation</h2>
                  <p className="text-purple-300 text-sm">Create custom images with AI</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-slate-300">
                  Transform your ideas into stunning visuals. Generate unique, high-quality images tailored to your content strategy.
                </p>

                <div className="space-y-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    Coming Soon Features
                  </h3>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li>✓ Text-to-Image generation</li>
                    <li>✓ Image editing and enhancement</li>
                    <li>✓ Style customization</li>
                    <li>✓ Batch generation</li>
                    <li>✓ Platform-optimized sizing</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-purple-500/20">
                  <p className="text-purple-300 text-sm mb-4">
                    🎨 AI Image Generation will be available in the next update.
                  </p>
                  <Button disabled className="w-full bg-slate-700 text-slate-400 cursor-not-allowed">
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Video Generation Card */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-purple-500/20 overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Video Generation</h2>
                  <p className="text-pink-300 text-sm">Create videos from text and images</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-slate-300">
                  Generate engaging video content from text descriptions or images. Perfect for social media and marketing campaigns.
                </p>

                <div className="space-y-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    Coming Soon Features
                  </h3>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li>✓ Text-to-Video generation</li>
                    <li>✓ Image-to-Video conversion</li>
                    <li>✓ Video editing tools</li>
                    <li>✓ Music and voiceover integration</li>
                    <li>✓ Multiple format export</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-purple-500/20">
                  <p className="text-pink-300 text-sm mb-4">
                    🎬 AI Video Generation is under development.
                  </p>
                  <Button disabled className="w-full bg-slate-700 text-slate-400 cursor-not-allowed">
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="bg-slate-800/30 border-purple-500/20 p-6">
          <div className="space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Why These Features Are Coming Soon
            </h3>
            <p className="text-slate-300">
              We're working hard to bring you the most advanced AI media generation capabilities. These features are currently in development and will be available in the next update. We're ensuring they meet the highest quality standards and integrate seamlessly with your content workflow.
            </p>
            <p className="text-purple-300 text-sm">
              💡 In the meantime, you can use our AI Generator to create text content for your posts, and schedule them across all platforms.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
