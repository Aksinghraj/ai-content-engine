import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useEffect } from "react";
import {
  Zap,
  Flame,
  BookOpen,
  MessageSquare,
  Share2,
  TrendingUp,
  Clock,
  ArrowRight,
  Lock,
  CheckCircle,
} from "lucide-react";

export default function Features() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const features = [
    {
      icon: Flame,
      title: "Viral Content Ideas",
      description: "Get 10 highly engaging content ideas tailored to your niche",
      isPro: false,
      color: "text-orange-400",
      bgColor: "bg-orange-900/20",
    },
    {
      icon: Zap,
      title: "Scroll-Stopping Hooks",
      description: "5 attention-grabbing hooks optimized for your platform",
      isPro: false,
      color: "text-blue-400",
      bgColor: "bg-blue-900/20",
    },
    {
      icon: BookOpen,
      title: "Video Scripts",
      description: "Platform-optimized scripts for short-form videos (30-45s)",
      isPro: false,
      color: "text-purple-400",
      bgColor: "bg-purple-900/20",
    },
    {
      icon: MessageSquare,
      title: "Captions & CTAs",
      description: "Compelling captions with clear calls-to-action",
      isPro: false,
      color: "text-pink-400",
      bgColor: "bg-pink-900/20",
    },
    {
      icon: Share2,
      title: "Repurposed Content",
      description: "Convert content for Twitter, LinkedIn, YouTube & more",
      isPro: false,
      color: "text-green-400",
      bgColor: "bg-green-900/20",
    },
    {
      icon: TrendingUp,
      title: "Optimization Tips",
      description: "Best posting times, visuals, and engagement strategies",
      isPro: false,
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
    },
    {
      icon: Clock,
      title: "Content Automation",
      description: "Schedule automatic content generation (Pro only)",
      isPro: true,
      color: "text-indigo-400",
      bgColor: "bg-indigo-900/20",
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Track performance and trends (Pro only)",
      isPro: true,
      color: "text-cyan-400",
      bgColor: "bg-cyan-900/20",
    },
  ];

  const freeFeatures = features.filter((f) => !f.isPro);
  const proFeatures = features.filter((f) => f.isPro);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-white">All Features</h1>
          <p className="text-slate-400 mt-1">Explore what you can create</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Free Features Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              Available for All Users
            </Badge>
            <h2 className="text-2xl font-bold text-white">Free Features</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-slate-700 bg-slate-800/50 backdrop-blur-sm hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-slate-900/50"
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">Included</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Pro Features Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              Pro Only
            </Badge>
            <h2 className="text-2xl font-bold text-white">Premium Features</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {proFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className={`border-slate-700 bg-gradient-to-br from-purple-900/20 to-slate-800/50 backdrop-blur-sm hover:border-purple-500/50 transition-all ${
                    user?.subscriptionTier === "pro" ? "" : "opacity-75"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      {user?.subscriptionTier === "pro" ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <CardTitle className="text-white mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                    {user?.subscriptionTier !== "pro" && (
                      <Button
                        onClick={() => navigate("/payments")}
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full border-purple-500/50 text-purple-300 hover:text-purple-200 hover:bg-purple-900/20"
                      >
                        Upgrade to Pro
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        {user?.subscriptionTier === "free" && (
          <Card className="border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm">
            <CardContent className="pt-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Ready to Unlock Pro?</h3>
                <p className="text-slate-400 mb-6">Get unlimited content generation, automation, and advanced analytics</p>
                <Button
                  onClick={() => navigate("/payments")}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-8"
                >
                  Upgrade Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
