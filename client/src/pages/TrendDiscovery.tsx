import { useState } from 'react';
import { 
  Search, Flame, TrendingUp, Target, Zap, Wand2, Hash, BarChart3, Users, 
  ChevronDown, Bookmark, Share2, Sparkles, Bell, Settings, LogOut, Menu, X,
  Instagram, Youtube, Twitter, Linkedin, Globe, Play, Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';

interface TrendingTopic {
  id: string;
  title: string;
  score: number;
  growth: number;
  category: string;
  reach: string;
  platforms: string[];
  summary: string;
  relatedKeywords: string[];
  suggestedHooks: string[];
  bestTime: string;
}

const TRENDING_TOPICS: TrendingTopic[] = [
  {
    id: '1',
    title: 'Sarvam AI Achieves Unicorn Status with $234 Million Funding',
    score: 90,
    growth: 45,
    category: 'Money & AI',
    reach: '2.4M',
    platforms: ['twitter', 'linkedin'],
    summary: 'Indian AI startup Sarvam AI reaches unicorn valuation, signaling strong investor confidence in AI innovation.',
    relatedKeywords: ['AI funding', 'startup news', 'venture capital'],
    suggestedHooks: ['Did you know this Indian AI startup just became a unicorn?', 'Breaking: $234M funding round...'],
    bestTime: '2-4 PM IST'
  },
  {
    id: '2',
    title: 'High-Protein Indian Diet: The Wellness Diets India 2026 Leader',
    score: 88,
    growth: 38,
    category: 'Health & Fitness',
    reach: '1.8M',
    platforms: ['instagram', 'youtube', 'tiktok'],
    summary: 'Health-conscious creators are sharing high-protein Indian diet recipes and fitness transformations.',
    relatedKeywords: ['fitness', 'diet', 'wellness'],
    suggestedHooks: ['This high-protein Indian diet changed everything...', 'Fitness creators are obsessed with this...'],
    bestTime: '6-8 AM IST'
  },
  {
    id: '3',
    title: 'Instagram Reels Dominates India\'s Video Consumption',
    score: 85,
    growth: 52,
    category: 'Viral Culture',
    reach: '3.2M',
    platforms: ['instagram', 'tiktok'],
    summary: 'Short-form video content on Instagram Reels continues to dominate engagement metrics across India.',
    relatedKeywords: ['reels', 'video content', 'engagement'],
    suggestedHooks: ['Why Instagram Reels is crushing it right now...', 'The algorithm loves this format...'],
    bestTime: '7-9 PM IST'
  }
];

const FEATURE_CARDS = [
  { icon: Flame, title: 'Trend Discovery', desc: 'Find emerging viral topics', color: 'from-orange-500 to-red-500' },
  { icon: TrendingUp, title: 'Trend Score', desc: 'AI predicts performance', color: 'from-blue-500 to-cyan-500' },
  { icon: Target, title: 'Audience Finder', desc: 'Discover who is engaging', color: 'from-purple-500 to-pink-500' },
  { icon: Zap, title: 'AI Hook Generator', desc: 'Generate viral opening hooks', color: 'from-yellow-500 to-orange-500' },
  { icon: Wand2, title: 'Caption Generator', desc: 'AI captions for any trend', color: 'from-green-500 to-emerald-500' },
  { icon: BarChart3, title: 'Competitor Insights', desc: 'Analyze competitor content', color: 'from-indigo-500 to-blue-500' },
];

const CATEGORIES = ['For You', 'Money & AI', 'Lifestyle', 'Health & Fitness', 'Viral Culture', 'Gaming', 'Learning'];

const SIDEBAR_ITEMS = [
  { icon: Sparkles, label: 'Dashboard', href: '/dashboard' },
  { icon: Flame, label: 'Discover', href: '/trend-discovery', active: true },
  { icon: TrendingUp, label: 'Trend Explorer', href: '/trend-explorer' },
  { icon: Wand2, label: 'AI Generator', href: '/generator' },
  { icon: Play, label: 'Post Scheduling', href: '/post-scheduling' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function TrendDiscovery() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['all']);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900/80 to-purple-900/40 backdrop-blur-xl border-r border-purple-500/10 transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Lumae</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-purple-500/10 rounded-lg transition">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-3">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                item.active 
                  ? 'bg-gradient-to-r from-purple-500/30 to-cyan-500/20 border border-purple-500/30 text-purple-300' 
                  : 'hover:bg-purple-500/10 text-slate-400'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Profile at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-purple-500/10">
          {sidebarOpen && (
            <div className="mb-3 p-2 bg-purple-500/10 rounded-lg">
              <p className="text-xs text-slate-400">Logged in as</p>
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition text-sm"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Navigation */}
        <div className="sticky top-0 z-30 bg-gradient-to-b from-slate-900/80 to-transparent backdrop-blur-xl border-b border-purple-500/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search trends, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg pl-10 pr-4 py-2 text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-6">
              <button className="p-2 hover:bg-purple-500/10 rounded-lg transition relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="px-3 py-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition">
                {user?.tokenBalance || 0} Credits
              </button>
              <button className="p-2 hover:bg-purple-500/10 rounded-lg transition">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="px-6 py-12">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Discover Trending Content Opportunities
            </h1>
            <p className="text-slate-400 mb-8">Find scroll-stopping content ideas in seconds with AI-powered trend analysis</p>

            {/* AI Command Center */}
            <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ask AI: What's trending in fitness? Best hooks for tech content?"
                  className="flex-1 bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Search
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-slate-500">AI Suggestions:</span>
                {['Trending in fitness', 'Best posting times', 'Viral hooks'].map((tag) => (
                  <button key={tag} className="text-xs px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-full border border-purple-500/30 transition">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Filters */}
            <div className="flex gap-2 mb-8 flex-wrap">
              {[
                { id: 'all', label: 'All Platforms', icon: Globe },
                { id: 'instagram', label: 'Instagram', icon: Instagram },
                { id: 'youtube', label: 'YouTube', icon: Youtube },
                { id: 'twitter', label: 'X', icon: Twitter },
                { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
              ].map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => {
                      if (platform.id === 'all') {
                        setSelectedPlatforms(['all']);
                      } else {
                        const newPlatforms = selectedPlatforms.filter(p => p !== 'all');
                        if (isSelected) {
                          setSelectedPlatforms(newPlatforms.filter(p => p !== platform.id) || ['all']);
                        } else {
                          setSelectedPlatforms([...newPlatforms, platform.id]);
                        }
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-500/30 to-cyan-500/20 border-purple-500/50 text-purple-300'
                        : 'bg-slate-800/30 border-purple-500/10 text-slate-400 hover:border-purple-500/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {platform.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="px-6 pb-12">
          <h2 className="text-2xl font-bold mb-6">AI-Powered Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-purple-500/10 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} p-2.5 mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{card.title}</h3>
                  <p className="text-sm text-slate-400">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trending Categories */}
        <div className="px-6 pb-8">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 rounded-full bg-slate-800/30 border border-purple-500/10 hover:border-purple-500/30 text-sm transition"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Trending Topics */}
        <div className="px-6 pb-12">
          <h2 className="text-2xl font-bold mb-6">Trending Now in India</h2>
          <div className="space-y-4">
            {TRENDING_TOPICS.map((topic) => (
              <div
                key={topic.id}
                className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-purple-500/10 rounded-xl overflow-hidden hover:border-purple-500/30 transition-all"
              >
                <button
                  onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                  className="w-full p-6 flex items-start justify-between hover:bg-purple-500/5 transition"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-purple-400">#{TRENDING_TOPICS.indexOf(topic) + 1}</span>
                      <h3 className="text-lg font-semibold">{topic.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                      <span className="px-2 py-1 bg-slate-700/50 rounded">📊 {topic.category}</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        +{topic.growth}%
                      </span>
                      <span>Reach: {topic.reach}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">{topic.score}</div>
                      <div className="text-xs text-slate-500">Trend Score</div>
                    </div>
                    <button className="p-2 hover:bg-purple-500/20 rounded-lg transition">
                      <Bookmark className="w-5 h-5" />
                    </button>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${expandedTopic === topic.id ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedTopic === topic.id && (
                  <div className="px-6 pb-6 border-t border-purple-500/10 space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">AI Summary</h4>
                      <p className="text-sm text-slate-400">{topic.summary}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Related Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {topic.relatedKeywords.map((kw) => (
                          <span key={kw} className="text-xs px-2 py-1 bg-purple-500/20 rounded border border-purple-500/30">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Suggested Hooks</h4>
                      <div className="space-y-2">
                        {topic.suggestedHooks.map((hook, idx) => (
                          <p key={idx} className="text-sm text-slate-300 italic">"{hook}"</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-lg hover:shadow-purple-500/50">
                        Use This Trend
                      </Button>
                      <button className="px-4 py-2 border border-purple-500/30 rounded-lg hover:bg-purple-500/10 transition">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
