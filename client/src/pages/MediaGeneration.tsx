import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Clock, Sparkles, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function MediaGeneration() {
  const [, navigate] = useLocation();

  return (
    <DashboardLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-8 max-w-2xl mx-auto px-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full flex items-center justify-center border border-purple-500/30">
              <Clock className="w-12 h-12 text-purple-400" />
            </div>
          </div>

          {/* Content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Coming Soon
            </h1>
            <p className="text-xl text-slate-400 mb-2">
              Media Generation is on its way!
            </p>
            <p className="text-slate-500">
              We're working hard to bring you powerful image and video generation capabilities. Stay tuned for updates!
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 text-left">
              <Sparkles className="w-6 h-6 text-purple-400 mb-3" />
              <h3 className="font-semibold mb-2">AI Image Generation</h3>
              <p className="text-sm text-slate-400">
                Create stunning visuals from text descriptions
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 text-left">
              <Sparkles className="w-6 h-6 text-pink-400 mb-3" />
              <h3 className="font-semibold mb-2">AI Video Generation</h3>
              <p className="text-sm text-slate-400">
                Generate engaging videos automatically
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/generator")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to AI Generator
            </Button>
          </div>

          {/* Notification */}
          <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4">
            <p className="text-sm text-purple-300">
              📧 We'll notify you when this feature launches!
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
