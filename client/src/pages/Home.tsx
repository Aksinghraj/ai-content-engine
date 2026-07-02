import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Menu, X, Sun, LogOut, Search, Bookmark } from "lucide-react";
import ContentGenerationModal from "@/components/ContentGenerationModal";

const REGIONS = ["India", "USA", "UK", "Canada", "Australia", "Brazil"];

const PLATFORMS = [
  { id: "all", name: "All", icon: "🎯" },
  { id: "instagram", name: "Instagram", icon: "📷" },
  { id: "tiktok", name: "TikTok", icon: "🎵" },
  { id: "youtube", name: "YouTube", icon: "📺" },
  { id: "twitter", name: "X (Twitter)", icon: "𝕏" },
  { id: "linkedin", name: "LinkedIn", icon: "💼" },
];

const CATEGORIES = [
  "For You",
  "Money & AI",
  "Lifestyle",
  "Health & Fitness",
  "Viral Culture",
  "Gaming",
  "Learning",
];

const MOCK_TRENDS = [
  {
    id: 1,
    title: "AI-Powered Content Creation",
    score: 95,
    growth: 156,
    category: "Money & AI",
    reach: "4.2M",
    platforms: ["twitter", "linkedin", "youtube"],
    summary: "Creators using AI tools to generate content at scale",
    keywords: ["AI", "content", "automation", "ChatGPT"],
    hooks: [
      "I used AI to create 30 posts in 1 hour...",
      "This AI tool just changed my content game",
    ],
  },
  {
    id: 2,
    title: "Fitness Transformation Reels",
    score: 92,
    growth: 142,
    category: "Health & Fitness",
    reach: "3.8M",
    platforms: ["instagram", "tiktok", "youtube"],
    summary: "Short-form fitness transformation videos dominating social",
    keywords: ["fitness", "transformation", "gym", "health"],
    hooks: ["From 0 to fit in 90 days", "This one exercise changed everything"],
  },
  {
    id: 3,
    title: "Viral Business Ideas 2026",
    score: 88,
    growth: 128,
    category: "Money & AI",
    reach: "2.9M",
    platforms: ["twitter", "linkedin", "tiktok"],
    summary: "Entrepreneurs sharing latest side hustles",
    keywords: ["business", "entrepreneurship", "passive income"],
    hooks: ["I made $10k from this side hustle in 30 days"],
  },
  {
    id: 4,
    title: "Sustainable Fashion Movement",
    score: 85,
    growth: 115,
    category: "Lifestyle",
    reach: "2.5M",
    platforms: ["instagram", "tiktok", "youtube"],
    summary: "Eco-conscious fashion trending with Gen Z",
    keywords: ["sustainable", "fashion", "eco-friendly"],
    hooks: ["I only buy sustainable fashion now - here's why"],
  },
  {
    id: 5,
    title: "Mental Health & Wellness",
    score: 82,
    growth: 98,
    category: "Health & Fitness",
    reach: "3.2M",
    platforms: ["instagram", "tiktok", "youtube"],
    summary: "Mental health awareness content resonating strongly",
    keywords: ["mental health", "wellness", "anxiety"],
    hooks: ["I quit my job for my mental health - here's what happened"],
  },
];

export default function Home() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("India");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("For You");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTrend, setExpandedTrend] = useState<number | null>(null);
  const [savedTrends, setSavedTrends] = useState<number[]>([]);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedTrendForGeneration, setSelectedTrendForGeneration] = useState<typeof MOCK_TRENDS[0] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredTrends = useMemo(() => {
    return MOCK_TRENDS.filter((trend) => {
      const matchesPlatform =
        selectedPlatform === "all" || trend.platforms.includes(selectedPlatform);
      const matchesCategory =
        selectedCategory === "For You" || trend.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        trend.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trend.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesPlatform && matchesCategory && matchesSearch;
    });
  }, [selectedPlatform, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900/80 backdrop-blur-xl border-r border-purple-500/20 transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">✨</span>
            </div>
            <span className="font-bold text-xl">Lumae AI</span>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
              <input
                type="text"
                placeholder="Search trends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-3 flex-1">
            <NavItem icon="🔍" label="Keyword Search" active />
            <NavItem icon="📊" label="Analyze Competitors" />
            <NavItem icon="🎬" label="Analyze Video" />
            <NavItem icon="💡" label="Viral Ideas" />
            <NavItem icon="📌" label="Saved Posts" />
          </nav>

          {/* User Section */}
          <div className="border-t border-purple-500/20 pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="px-3 py-2 bg-purple-500/10 rounded-lg">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-purple-300 truncate">{user.email}</p>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-purple-500/10 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <a
                href={getLoginUrl()}
                className="w-full block px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-center text-sm font-medium hover:shadow-lg hover:shadow-purple-500/50 transition"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "ml-0"}`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-purple-500/10 rounded-lg transition md:hidden"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <h1 className="text-xl md:text-2xl font-bold">Keyword Search</h1>
            </div>

            <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
              <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-800/50 rounded-lg border border-purple-500/30 text-xs md:text-sm">
                <Sun className="w-4 h-4 text-yellow-400 shrink-0" />
                <span className="hidden sm:inline">Free Plan | 95 searches left</span>
                <span className="sm:hidden">95 left</span>
              </div>
              <button className="px-3 md:px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-medium text-xs md:text-sm hover:shadow-lg hover:shadow-purple-500/50 transition whitespace-nowrap">
                Upgrade
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="px-4 md:px-6 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Discover <span className="text-pink-400">Viral</span> Content Ideas
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Find scroll-stopping content ideas in seconds
            </p>

            {/* Platform Tabs */}
            <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`px-3 md:px-4 py-2 rounded-full font-medium transition flex items-center gap-2 text-sm md:text-base ${
                    selectedPlatform === platform.id
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                      : "bg-slate-800/50 border border-purple-500/30 hover:border-purple-500/50"
                  }`}
                >
                  <span>{platform.icon}</span>
                  <span className="hidden sm:inline">{platform.name}</span>
                </button>
              ))}
            </div>

            {/* Search & Region */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    placeholder="Search viral content ideas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-400 text-sm md:text-base"
                  />
                </div>
                <button className="px-6 md:px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition whitespace-nowrap text-sm md:text-base">
                  Search
                </button>
              </div>

              {/* Region Selector */}
              <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <span className="text-xs md:text-sm text-gray-400">TRENDING NOW IN</span>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-3 md:px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white text-sm md:text-base"
                >
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                <span className="text-xs md:text-sm text-gray-400">Refreshes in 10:36:28</span>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 md:gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 md:px-4 py-2 rounded-full font-medium transition text-xs md:text-sm ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                      : "bg-slate-800/50 border border-purple-500/30 hover:border-purple-500/50 text-gray-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trending Topics */}
        <div className="px-4 md:px-6 pb-12">
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredTrends.map((trend, index) => (
              <div
                key={trend.id}
                className="bg-slate-800/30 border border-purple-500/20 rounded-lg overflow-hidden hover:border-purple-500/50 transition"
              >
                <div
                  onClick={() =>
                    setExpandedTrend(expandedTrend === trend.id ? null : trend.id)
                  }
                  className="p-4 md:p-6 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-2xl font-bold text-purple-400">
                          #{index + 1}
                        </span>
                        <h3 className="text-lg md:text-xl font-bold break-words">
                          {trend.title}
                        </h3>
                      </div>
                      <p className="text-gray-400 text-sm">{trend.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 ml-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xs md:text-sm text-gray-400">Score</div>
                        <div className="text-xl md:text-2xl font-bold text-red-400">
                          {trend.score}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSavedTrends(
                            savedTrends.includes(trend.id)
                              ? savedTrends.filter((id) => id !== trend.id)
                              : [...savedTrends, trend.id]
                          );
                        }}
                        className={`p-2 rounded-lg transition shrink-0 ${
                          savedTrends.includes(trend.id)
                            ? "bg-pink-500/20 text-pink-400"
                            : "bg-slate-700/50 text-gray-400 hover:text-pink-400"
                        }`}
                      >
                        <Bookmark
                          className="w-5 h-5"
                          fill={savedTrends.includes(trend.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedTrend === trend.id && (
                  <div className="border-t border-purple-500/20 p-4 md:p-6 bg-purple-950/20 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-purple-300 text-sm md:text-base">
                        Related Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {trend.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="px-3 py-1 bg-slate-700/50 rounded-full text-xs md:text-sm"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-purple-300 text-sm md:text-base">
                        Suggested Hooks
                      </h4>
                      <ul className="space-y-2">
                        {trend.hooks.map((hook, i) => (
                          <li key={i} className="text-xs md:text-sm text-gray-300">
                            • {hook}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 pt-4">
                      {user ? (
                        <>
                          <button className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition text-sm md:text-base">
                            Generate Content
                          </button>
                          <button className="px-4 py-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition text-sm md:text-base">
                            Share
                          </button>
                        </>
                      ) : (
                        <a
                          href={getLoginUrl()}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition text-center text-sm md:text-base"
                        >
                          Sign In to Generate Content
                        </a>
                      )}
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

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        active
          ? "bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-purple-500/50 text-white"
          : "text-gray-400 hover:text-white hover:bg-slate-800/50"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}
