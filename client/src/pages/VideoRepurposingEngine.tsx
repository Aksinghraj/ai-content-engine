import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Clock, Video, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function VideoRepurposingEngine() {
  const [, navigate] = useLocation();

  return (
    <DashboardLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-8 max-w-2xl mx-auto px-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-full flex items-center justify-center border border-blue-500/30">
              <Clock className="w-12 h-12 text-blue-400" />
            </div>
          </div>

          {/* Content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Coming Soon
            </h1>
            <p className="text-xl text-slate-400 mb-2">
              Video Repurposing Engine is on its way!
            </p>
            <p className="text-slate-500">
              We're building advanced video repurposing tools to help you transform content across multiple formats. Stay tuned!
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 text-left">
              <Video className="w-6 h-6 text-blue-400 mb-3" />
              <h3 className="font-semibold mb-2">Multi-Format Repurposing</h3>
              <p className="text-sm text-slate-400">
                Convert videos to shorts, reels, and clips automatically
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 text-left">
              <Video className="w-6 h-6 text-cyan-400 mb-3" />
              <h3 className="font-semibold mb-2">Intelligent Editing</h3>
              <p className="text-sm text-slate-400">
                AI-powered editing for optimal platform performance
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/generator")}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to AI Generator
            </Button>
          </div>

          {/* Notification */}
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              📧 We'll notify you when this feature launches!
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
