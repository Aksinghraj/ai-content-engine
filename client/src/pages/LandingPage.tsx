import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  Zap,
  Brain,
  Sparkles,
  BarChart3,
  Users,
  Shield,
  Rocket,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";

export default function LandingPage() {
  const { data: user } = trpc.auth.me.useQuery();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      title: "Multi-Model AI",
      description: "GPT-4o, Claude, Gemini, LLaMA, Mistral - choose your AI",
    },
    {
      icon: <Sparkles className="w-8 h-8 text-blue-500" />,
      title: "AI Humanizer",
      description: "Bypass AI detectors with 3 humanization levels",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-green-500" />,
      title: "SEO Powerhouse",
      description: "Keyword research, SERP analysis, schema markup",
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "AI Agents",
      description: "Blog, SEO, Social, Newsletter agents - fully automated",
    },
    {
      icon: <Users className="w-8 h-8 text-pink-500" />,
      title: "Team Collaboration",
      description: "Real-time editing, approval workflows, comments",
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-500" />,
      title: "Enterprise Security",
      description: "SOC 2, GDPR, HIPAA, 2FA, SSO compliance",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Manager",
      company: "TechCorp",
      text: "Increased content output by 10x while maintaining quality. Game changer!",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "SEO Specialist",
      company: "Digital Agency",
      text: "The SEO tools alone are worth the subscription. Ranking improvements in weeks.",
      rating: 5,
    },
    {
      name: "Elena Rodriguez",
      role: "Founder",
      company: "SaaS Startup",
      text: "AI agents handle our content calendar automatically. We save 20 hours/week.",
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Get started with AI content",
      features: [
        "5 generations/day",
        "Basic AI features",
        "3 automations",
        "Community access",
      ],
      cta: "Get Started",
    },
    {
      name: "Pro",
      price: "$99",
      period: "/month",
      description: "For serious content creators",
      features: [
        "Unlimited generations",
        "All AI features",
        "Unlimited automations",
        "Team collaboration",
        "Advanced analytics",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
        "White-label options",
        "Advanced security",
      ],
      cta: "Contact Sales",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            AI Content Engine
          </div>
          <div className="flex gap-4">
            {user ? (
              <Button variant="outline" asChild>
                <a href="/dashboard">Dashboard</a>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <a href={getLoginUrl()}>Sign In</a>
                </Button>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" asChild>
                  <a href={getLoginUrl()}>Get Started Free</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/50 bg-purple-500/10 mb-8">
            <Rocket className="w-4 h-4" />
            <span className="text-sm font-medium">The Future of Content Creation</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
            Create Content{" "}
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
              10x Faster
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade AI content generation platform with multi-model AI switching,
            SEO optimization, AI agents, team collaboration, and more. Used by 50,000+ creators.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user && user.id ? (
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" asChild>
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
            ) : (
              <>
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" asChild>
                  <a href={getLoginUrl()}>Start Free Trial</a>
                </Button>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-300">Everything you need to dominate content creation</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all p-6">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 sm:py-32 bg-slate-800/50 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">50K+</div>
              <p className="text-gray-400">Active Users</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">500M+</div>
              <p className="text-gray-400">Content Generated</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-400 mb-2">99.9%</div>
              <p className="text-gray-400">Uptime</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">4.9/5</div>
              <p className="text-gray-400">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-32 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Loved by Creators</h2>
            <p className="text-xl text-gray-300">Join thousands of satisfied users</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="bg-slate-800/50 border-purple-500/20 p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role} at {testimonial.company}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 sm:py-32 bg-slate-800/50 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-xl text-gray-300">Choose the plan that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <Card
                key={idx}
                className={`border-purple-500/20 p-8 transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50 ring-2 ring-purple-500/50 scale-105"
                    : "bg-slate-800/50"
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-gray-400">{plan.period}</span>}
                </div>
                <p className="text-gray-400 mb-6">{plan.description}</p>

                <Button
                  className={`w-full mb-8 ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild
                >
                  <a href={getLoginUrl()}>{plan.cta}</a>
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 border-t border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Transform Your Content?</h2>
          <p className="text-xl text-gray-300 mb-8">Join 50,000+ creators using AI Content Engine</p>

          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto mb-8">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-purple-500/20 focus:border-purple-500 focus:outline-none text-white placeholder-gray-500"
              required
            />
            <Button type="submit" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              Subscribe
            </Button>
          </form>

          {subscribed && <p className="text-green-400 mb-8">✓ Thanks for subscribing!</p>}

          <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" asChild>
            <a href={getLoginUrl()}>
              Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Content Engine. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
