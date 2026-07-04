import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Zap, Target, Users, Globe, Mail, ExternalLink } from "lucide-react";

export default function AboutUs() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-xl font-bold text-white">About Us</h1>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 mb-6">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Lumae AI</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We are building the future of AI-powered content creation and social media automation for creators, businesses, and marketers across India and the world.
          </p>
        </div>

        {/* Owner Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Meet the Founder</h2>
          <Card className="bg-slate-800 border-slate-700 p-8 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                  AS
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-white mb-1">Ankit Singh</h3>
                <p className="text-purple-400 font-medium mb-3">Founder & Owner, Lumae AI</p>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Ankit Singh is the founder and owner of Lumae AI. Passionate about artificial intelligence and social media technology, Ankit built Lumae AI to help content creators and businesses automate their social media presence and generate viral content effortlessly using the power of AI.
                </p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <a
                    href="mailto:imankitsingh.in@gmail.com"
                    className="flex items-center gap-2 text-slate-300 hover:text-purple-400 transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    imankitsingh.in@gmail.com
                  </a>
                  <a
                    href="https://lumae.co.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-300 hover:text-purple-400 transition-colors text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    lumae.co.in
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Our Mission</h2>
          <div className="bg-gradient-to-br from-purple-900/40 to-slate-800 border border-purple-700/30 rounded-2xl p-8 text-center">
            <p className="text-xl text-slate-200 leading-relaxed max-w-3xl mx-auto">
              Our mission is to democratize AI-powered content creation, making it accessible to every creator, entrepreneur, and business — regardless of their size or technical expertise. We believe that great content should not require hours of work; it should take seconds.
            </p>
          </div>
        </div>

        {/* What We Do */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Content Generation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate viral posts, hooks, captions, scripts, and hashtags for any social media platform in seconds using advanced AI.
              </p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-pink-600/20 flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Scheduling</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Schedule and automate your social media posts across Instagram, Twitter/X, LinkedIn, Facebook, YouTube, and TikTok.
              </p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Analytics & Insights</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Track your content performance, engagement rates, and audience growth with detailed analytics and actionable insights.
              </p>
            </Card>
          </div>
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Our Story</h2>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>
              Lumae AI was founded by Ankit Singh with a simple observation: content creators and businesses spend enormous amounts of time creating social media content, yet most of it fails to reach the right audience. The process of brainstorming ideas, writing captions, researching hashtags, and scheduling posts was taking hours every day.
            </p>
            <p>
              Ankit set out to build a solution that would use the latest advances in artificial intelligence to automate this entire workflow. The result is Lumae AI — a platform that can generate platform-optimized, viral-ready content in seconds, schedule it automatically, and provide deep analytics to help creators understand what works.
            </p>
            <p>
              Today, Lumae AI serves creators and businesses across India and internationally, helping them grow their social media presence with less effort and more impact. We are continuously improving our AI models and adding new features based on user feedback.
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Get in Touch</h2>
          <p className="text-slate-300 mb-6">Have questions, feedback, or partnership inquiries? We'd love to hear from you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/contact")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("mailto:imankitsingh.in@gmail.com", "_blank")}
              className="border-slate-600 text-slate-300 hover:text-white hover:border-slate-500"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              imankitsingh.in@gmail.com
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2026 Lumae AI. All rights reserved. Founded and owned by Ankit Singh.</p>
          <div className="flex justify-center gap-4 mt-2 flex-wrap">
            <button onClick={() => navigate("/privacy-policy")} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => navigate("/terms")} className="hover:text-white transition-colors">Terms & Conditions</button>
            <button onClick={() => navigate("/contact")} className="hover:text-white transition-colors">Contact</button>
            <button onClick={() => navigate("/about")} className="hover:text-white transition-colors">About Us</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
