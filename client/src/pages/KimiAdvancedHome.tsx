import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import StreamingChat from "@/components/StreamingChat";
import DynamicPrompts from "@/components/DynamicPrompts";
import { detectTopic, getTopicGradient, getTopicEmoji, createTopicSVGBackground } from "@/lib/topicAnimations";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Brain, ArrowRight } from "lucide-react";

export default function KimiAdvancedHome() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTopic, setCurrentTopic] = useState("general");
  const [svgBackground, setSvgBackground] = useState("");

  useEffect(() => {
    if (searchQuery) {
      const topic = detectTopic(searchQuery);
      setCurrentTopic(topic);
      setSvgBackground(createTopicSVGBackground(topic as any));
    }
  }, [searchQuery]);

  const handleSearch = (query: string, topic: string) => {
    setSearchQuery(query);
    setCurrentTopic(topic);
  };

  const handlePromptSelect = (prompt: string) => {
    setSearchQuery(prompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Topic-based SVG background */}
        {svgBackground && (
          <svg
            className="absolute inset-0 w-full h-full opacity-40"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            dangerouslySetInnerHTML={{ __html: svgBackground }}
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-md bg-black/20">
          <div className="container mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTopicGradient(currentTopic as any)} flex items-center justify-center`}>
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">AI Content Engine</h1>
            </div>
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            >
              Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          {/* Hero Section with Chat */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Chat Section - 2 columns */}
            <div className="lg:col-span-2 animate-fade-scale">
              <div className="mb-4">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Meet Your <span className={`bg-gradient-to-r ${getTopicGradient(currentTopic as any)} bg-clip-text text-transparent`}>AI Companion</span>
                </h2>
                <p className="text-gray-400">Chat with AI, get instant suggestions, and explore content creation possibilities</p>
              </div>
              <div className="h-[600px]">
                <StreamingChat
                  onSearch={handleSearch}
                  placeholder="Ask about AI, marketing, content, analytics, automation..."
                  showTopicIndicator={true}
                />
              </div>
            </div>

            {/* Prompts Section - 1 column */}
            <div className="animate-fade-scale" style={{ animationDelay: "100ms" }}>
              <DynamicPrompts
                onPromptSelect={handlePromptSelect}
                searchQuery={searchQuery}
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Brain,
                title: "Smart AI",
                description: "Powered by advanced AI that understands your needs",
                gradient: "from-purple-600 to-pink-600",
              },
              {
                icon: Zap,
                title: "Real-time Streaming",
                description: "Get instant responses with streaming text effects",
                gradient: "from-blue-600 to-cyan-600",
              },
              {
                icon: Sparkles,
                title: "Dynamic Content",
                description: "Suggestions that adapt to your search topics",
                gradient: "from-green-600 to-teal-600",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="animate-fade-scale group p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="animate-fade-scale bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Content?</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Start creating, scheduling, and automating your content with AI-powered assistance. Join thousands of creators using our platform.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={() => setLocation("/dashboard")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-6 text-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10 px-8 py-6 text-lg"
                onClick={() => setLocation("/post-scheduling")}
              >
                <Zap className="w-5 h-5 mr-2" />
                Schedule Posts
              </Button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-md mt-12">
          <div className="container mx-auto px-4 py-8 text-center text-gray-400 text-sm">
            <p>© 2026 AI Content Engine. Powered by Kimi AI principles.</p>
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

        @keyframes wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes morph {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          50% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
        }

        @keyframes color-shift {
          0%, 100% {
            filter: hue-rotate(0deg);
          }
          50% {
            filter: hue-rotate(90deg);
          }
        }

        @keyframes chart-rise {
          0% {
            transform: scaleY(0);
            transform-origin: bottom;
          }
          100% {
            transform: scaleY(1);
            transform-origin: bottom;
          }
        }

        @keyframes heart-beat {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.1);
          }
          50% {
            transform: scale(1);
          }
        }

        @keyframes ripple {
          0% {
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(168, 85, 247, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0);
          }
        }
      `}</style>
    </div>
  );
}
