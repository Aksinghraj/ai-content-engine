import { useState } from "react";
import { ArrowRight, Sparkles, TrendingUp, Zap, Users, BarChart3, Calendar, Trophy, Flame, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-full text-left bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{question}</h3>
        <ChevronDown
          className={`w-5 h-5 text-purple-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      {isOpen && <p className="mt-4 text-slate-400">{answer}</p>}
    </button>
  );
}

export default function LandingPremium() {
  const [demoInput, setDemoInput] = useState("");
  const [demoOutput, setDemoOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDemoGenerate = async () => {
    if (!demoInput.trim()) return;
    
    setIsGenerating(true);
    setDemoOutput("");
    
    // Simulate AI streaming animation
    const sampleOutput = `🎯 Viral Hooks for "${demoInput}":

1. "This one weird trick changed EVERYTHING..."
2. "Nobody talks about this ${demoInput} hack..."
3. "If you're not using this for ${demoInput}, you're losing..."

📱 Twitter Thread:
Thread incoming on how to master ${demoInput}...

🎬 YouTube Title:
"The ${demoInput} Secret Nobody Wants You To Know"

💌 Email Subject:
"This ${demoInput} discovery made me $10k in 30 days"`;

    // Simulate streaming by typing out character by character
    let index = 0;
    const interval = setInterval(() => {
      if (index < sampleOutput.length) {
        setDemoOutput(sampleOutput.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 20);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 sm:w-8 h-6 sm:h-8 text-purple-400" />
          <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            ContentAI
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <Button variant="ghost" className="text-slate-300 hover:text-white text-sm">Features</Button>
          <Button variant="ghost" className="text-slate-300 hover:text-white text-sm">Pricing</Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm">
            Sign In
          </Button>
        </div>
        <Button className="sm:hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm">
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Create Viral Content in Seconds
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
          The AI platform that generates high-converting content, predicts virality, and automates your entire creator workflow
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm sm:text-base">
            Start Free Trial <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
          </Button>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 text-sm sm:text-base">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Live AI Demo Section */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Try It Now (No Signup Required)</h2>
          
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-8">
            <div className="space-y-6">
              {/* Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Enter your niche or topic
                </label>
                <div className="flex gap-3">
                  <Input
                    placeholder="e.g., AI marketing, fitness, crypto, productivity..."
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleDemoGenerate()}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                  <Button
                    onClick={handleDemoGenerate}
                    disabled={isGenerating || !demoInput.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8"
                  >
                    {isGenerating ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </div>

              {/* Output */}
              {demoOutput && (
                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 min-h-64">
                  <p className="text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {demoOutput}
                    {isGenerating && <span className="animate-pulse">▌</span>}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Powerful Features for Creators</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Flame className="w-8 h-8 text-orange-400" />,
                title: "Viral Score System",
                description: "Every piece of content gets scored for virality, engagement, and CTR predictions"
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-green-400" />,
                title: "Trend Intelligence",
                description: "Real-time trending topics, keywords, and hashtags across all platforms"
              },
              {
                icon: <Zap className="w-8 h-8 text-yellow-400" />,
                title: "Content Rewriter",
                description: "Transform weak content into viral-worthy posts in multiple styles"
              },
              {
                icon: <Users className="w-8 h-8 text-blue-400" />,
                title: "Multi-Platform Repurposing",
                description: "Convert one piece of content into optimized posts for every platform"
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-purple-400" />,
                title: "Analytics Dashboard",
                description: "Deep insights into your content performance and audience behavior"
              },
              {
                icon: <Calendar className="w-8 h-8 text-pink-400" />,
                title: "Content Calendar",
                description: "AI-powered scheduling with optimal posting time recommendations"
              }
            ].map((feature, idx) => (
              <Card key={idx} className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6 hover:border-slate-600 transition-colors">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-20 bg-slate-900/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Trusted by Creators Worldwide</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
            {[
              { number: "2.5M+", label: "Posts Generated" },
              { number: "50K+", label: "Active Creators" },
              { number: "4.9★", label: "User Rating" },
              { number: "95%", label: "Retention Rate" }
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text mb-2">
                  {stat.number}
                </div>
                <p className="text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">What Creators Say</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Content Creator",
                text: "ContentAI increased my engagement by 340%. The viral score system is a game-changer.",
                avatar: "SC"
              },
              {
                name: "Marcus Johnson",
                role: "Marketing Manager",
                text: "We save 20 hours per week on content creation. The multi-platform repurposing is incredible.",
                avatar: "MJ"
              },
              {
                name: "Emma Rodriguez",
                role: "Founder",
                text: "The trend intelligence helped us catch a viral moment. Best investment for our brand.",
                avatar: "ER"
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
                <p className="text-slate-300 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-20 bg-slate-900/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Simple, Transparent Pricing</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "Free",
                features: ["3 automations", "5 generations/day", "Basic analytics", "Community support"]
              },
              {
                name: "Pro",
                price: "$29",
                features: ["Unlimited automations", "Unlimited generations", "Advanced analytics", "Priority support", "Trend intelligence"],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                features: ["Everything in Pro", "API access", "Dedicated account manager", "Custom integrations"]
              }
            ].map((plan, idx) => (
              <Card
                key={idx}
                className={`backdrop-blur-md p-8 ${
                  plan.popular
                    ? "bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/50"
                    : "bg-slate-900/50 border-slate-700"
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text mb-6">
                  {plan.price}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-slate-300">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={
                    plan.popular
                      ? "w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      : "w-full border-slate-600 text-white hover:bg-slate-800"
                  }
                  variant={plan.popular ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {[
              {
                q: "Do I need to sign up to try the demo?",
                a: "No! Our interactive demo is completely free and requires no signup. You can generate content ideas instantly."
              },
              {
                q: "What's included in the free plan?",
                a: "The free plan includes 3 automations, 5 generations per day, basic analytics, and community support."
              },
              {
                q: "Can I cancel my subscription anytime?",
                a: "Yes! You can cancel your Pro subscription at any time. No long-term contracts or hidden fees."
              },
              {
                q: "Does ContentAI work with all social platforms?",
                a: "We support Instagram, TikTok, Twitter, LinkedIn, YouTube, Threads, and email. More platforms coming soon!"
              },
              {
                q: "How accurate is the viral score?",
                a: "Our viral score is based on machine learning trained on millions of posts. It's 85%+ accurate for predicting engagement."
              }
            ].map((faq, idx) => (
              <FAQItem key={idx} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Create Viral Content?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of creators who are already using ContentAI to grow their audience
          </p>
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 px-4 sm:px-6 py-8 sm:py-12 text-center text-slate-400 text-sm sm:text-base">
        <p>&copy; 2026 ContentAI. All rights reserved. | Privacy Policy | Terms of Service</p>
      </footer>
    </div>
  );
}
