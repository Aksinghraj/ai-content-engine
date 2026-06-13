import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Copy, Check, RefreshCw, Info } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

// Platform formatting rules
const PLATFORM_RULES = [
  {
    id: "youtube",
    name: "YouTube",
    emoji: "▶️",
    color: "#FF0000",
    bgClass: "border-red-500/20 bg-red-500/5",
    rules: [
      "Long-form video metadata (100-200 words)",
      "Include timestamps if applicable",
      "Add relevant tags and keywords",
      "Use chapter markers for long videos",
      "Include call-to-action (subscribe, like)",
      "Add links to related content",
    ],
    maxChars: 5000,
    toneGuide: "Informative, engaging, SEO-optimized",
  },
  {
    id: "tiktok",
    name: "TikTok",
    emoji: "🎵",
    color: "#000000",
    bgClass: "border-slate-500/20 bg-slate-500/5",
    rules: [
      "Short-form, punchy script (30-60 seconds)",
      "Hook in first 3 seconds",
      "Use trending sounds and hashtags",
      "Conversational, energetic tone",
      "End with clear CTA",
      "Max 150 chars for caption",
    ],
    maxChars: 2200,
    toneGuide: "Energetic, trendy, conversational",
  },
  {
    id: "instagram",
    name: "Instagram",
    emoji: "📸",
    color: "#E4405F",
    bgClass: "border-pink-500/20 bg-pink-500/5",
    rules: [
      "Visual-first storytelling",
      "Captions with emojis and line breaks",
      "30 relevant hashtags max",
      "First line is the hook (visible before 'more')",
      "Include location tags when relevant",
      "Stories-friendly short version",
    ],
    maxChars: 2200,
    toneGuide: "Aspirational, visual, lifestyle-focused",
  },
  {
    id: "facebook",
    name: "Facebook",
    emoji: "👥",
    color: "#1877F2",
    bgClass: "border-blue-500/20 bg-blue-500/5",
    rules: [
      "Community engagement focus",
      "Longer captions work well (100-200 words)",
      "Ask questions to drive comments",
      "Share personal stories and insights",
      "Include relevant links",
      "Use native video for better reach",
    ],
    maxChars: 63206,
    toneGuide: "Community-driven, conversational, authentic",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    emoji: "💼",
    color: "#0A66C2",
    bgClass: "border-blue-600/20 bg-blue-600/5",
    rules: [
      "Professional thought-leadership (150-300 words)",
      "Start with a bold insight or question",
      "Use line breaks for readability",
      "Include industry insights and data",
      "End with a professional CTA",
      "3-5 relevant hashtags",
    ],
    maxChars: 3000,
    toneGuide: "Professional, insightful, thought-leadership",
  },
];

interface FormattedContent {
  [key: string]: string;
}

function ContentFormattingAgentContent() {
  const [rawContent, setRawContent] = useState("");
  const [topic, setTopic] = useState("");
  const [formattedContent, setFormattedContent] = useState<FormattedContent>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("input");

  const generateMutation = trpc.enterprise.generateCrossPlatformContent.useMutation();

  const handleGenerate = async () => {
    if (!rawContent.trim() && !topic.trim()) {
      toast.error("Please provide content or a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const contentToProcess = rawContent.trim() || `Create content about: ${topic}`;
      const result = await generateMutation.mutateAsync({
        sourceUrl: "https://example.com/content",
        sourceType: "article",
        originalContent: contentToProcess,
      });

      if (result.success && result.content) {
        setFormattedContent({
          youtube: result.content.youtubeDescription || "",
          tiktok: result.content.tiktokScript || "",
          instagram: result.content.instagramCaption || "",
          facebook: result.content.facebookPost || "",
          linkedin: result.content.linkedinPost || "",
        });
        toast.success("Content formatted for all platforms! ✨");
        setActiveTab("results");
      }
    } catch (error) {
      toast.error("Failed to format content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (key: string) => {
    const content = formattedContent[key];
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-blue-400" />
            Platform Formatting Agent
          </h1>
          <p className="text-blue-200">
            Automatically adapt your content to each platform's unique style, tone, and requirements
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-blue-500/20">
            <TabsTrigger value="input" className="data-[state=active]:bg-blue-600">
              Content Input
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-blue-600" disabled={Object.keys(formattedContent).length === 0}>
              Formatted Results
              {Object.keys(formattedContent).length > 0 && (
                <Badge className="ml-2 bg-green-500/20 text-green-300 border-green-500/50 text-xs">
                  {Object.keys(formattedContent).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rules" className="data-[state=active]:bg-blue-600">
              Platform Rules
            </TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-800/50 border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-white">Raw Content</CardTitle>
                    <CardDescription className="text-blue-200">
                      Paste your raw content or enter a topic — the agent will adapt it for each platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Topic / Title (optional)</Label>
                      <Input
                        placeholder="e.g., 'AI tools for content creators in 2025'"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-blue-300/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Raw Content (optional if topic provided)</Label>
                      <Textarea
                        placeholder="Paste your blog post, article, notes, or any raw content here..."
                        value={rawContent}
                        onChange={(e) => setRawContent(e.target.value)}
                        className="min-h-48 bg-slate-700/50 border-blue-500/30 text-white placeholder:text-blue-300/50"
                      />
                      <p className="text-blue-400 text-xs">{rawContent.length} characters</p>
                    </div>
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || (!rawContent.trim() && !topic.trim())}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Formatting for all platforms...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Format for All 5 Platforms
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Overview */}
              <div className="space-y-3">
                <h3 className="text-white font-semibold">Platforms Supported</h3>
                {PLATFORM_RULES.map((platform) => (
                  <div key={platform.id} className={`p-3 rounded-lg border ${platform.bgClass}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{platform.emoji}</span>
                      <span className="text-white font-medium">{platform.name}</span>
                      <span className="text-slate-400 text-xs ml-auto">{platform.maxChars.toLocaleString()} chars</span>
                    </div>
                    <p className="text-slate-300 text-xs">{platform.toneGuide}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            {Object.keys(formattedContent).length > 0 ? (
              <>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-xl font-semibold text-white">Platform-Formatted Content</h2>
                  <Button
                    onClick={() => setActiveTab("input")}
                    variant="outline"
                    className="border-blue-500/30 text-blue-200 hover:bg-blue-500/10"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Format New Content
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PLATFORM_RULES.map((platform) => {
                    const content = formattedContent[platform.id];
                    if (!content) return null;
                    const isCopied = copiedKey === platform.id;
                    const isOverLimit = content.length > platform.maxChars;

                    return (
                      <Card key={platform.id} className={`bg-slate-800/50 ${platform.bgClass}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{platform.emoji}</span>
                              <CardTitle className="text-white text-base">{platform.name}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs ${isOverLimit ? "text-red-400" : "text-blue-400"}`}>
                                {content.length}/{platform.maxChars.toLocaleString()}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(platform.id)}
                                className="text-blue-300 hover:text-white hover:bg-blue-500/20 h-7 w-7 p-0"
                              >
                                {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          <CardDescription className="text-slate-400 text-xs">{platform.toneGuide}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-slate-700/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                            <p className="text-blue-100 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <Sparkles className="w-16 h-16 text-blue-400/30 mx-auto mb-4" />
                <p className="text-blue-300 text-lg">No formatted content yet</p>
                <Button onClick={() => setActiveTab("input")} className="mt-4 bg-blue-600 hover:bg-blue-700">
                  Start Formatting
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Platform Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Platform Formatting Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PLATFORM_RULES.map((platform) => (
                <Card key={platform.id} className={`bg-slate-800/50 ${platform.bgClass}`}>
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <span className="text-2xl">{platform.emoji}</span>
                      {platform.name}
                    </CardTitle>
                    <CardDescription className="text-slate-300">{platform.toneGuide}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {platform.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-200">
                          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 p-2 bg-slate-700/50 rounded text-xs text-slate-400">
                      Max characters: <span className="text-white">{platform.maxChars.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ContentFormattingAgent() {
  return (
    <DashboardLayout>
      <ContentFormattingAgentContent />
    </DashboardLayout>
  );
}
