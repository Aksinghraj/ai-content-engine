import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Sparkles,
  Copy,
  CheckCircle2,
  Flame,
  Zap,
  MessageSquare,
  FileText,
  Hash,
  Layers,
  Share2,
  Lightbulb,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface ContentPackage {
  viralIdeas: string[];
  bestIdea: {
    idea: string;
    rationale: string;
  };
  hooks: string[];
  script: {
    hook: string;
    mainContent: string;
    ending: string;
  };
  caption: string;
  hashtags: string[];
  carousel: {
    slide1: string;
    slides2to6: string[];
    slide7: string;
  };
  repurpose: {
    twitterThread: string[];
    linkedInPost: string;
    youtubeShorts: string;
  };
  optimizationTips: {
    bestPostingTime: string;
    suggestedVisuals: string[];
    engagementTricks: string[];
  };
}

interface HistoryItem {
  id: number;
  niche: string;
  targetAudience: string;
  platform: string;
  goal: string;
  contentStyle: string;
  generatedContent: ContentPackage;
  createdAt: Date;
}

const PLATFORMS = ["Instagram", "YouTube", "LinkedIn", "Twitter", "TikTok", "Facebook"];
const GOALS = ["Growth", "Engagement", "Sales", "Authority", "Brand Awareness"];
const STYLES = ["Educational", "Entertaining", "Storytelling", "Bold", "Inspirational", "Humorous"];
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "hinglish", name: "Hinglish" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "bn", name: "Bengali" },
  { code: "pa", name: "Punjabi" },
];

export default function Generator() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const [formData, setFormData] = useState({
    niche: "",
    targetAudience: "",
    platform: "",
    goal: "",
    contentStyle: "",
    language: "hinglish",
  });

  const [generatedContent, setGeneratedContent] = useState<ContentPackage | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("hinglish");

  const generateMutation = trpc.content.generate.useMutation();
  const getHistoryQuery = trpc.content.history.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Load history on mount - moved to useEffect to avoid render-phase setState
  useEffect(() => {
    if (getHistoryQuery.data && history.length === 0 && !getHistoryQuery.isLoading) {
      const historyData = getHistoryQuery.data as HistoryItem[];
      setHistory(historyData);
    }
  }, [getHistoryQuery.data, getHistoryQuery.isLoading, history.length])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.niche || !formData.targetAudience || !formData.platform || !formData.goal || !formData.contentStyle) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 300);

    try {
      const result = await generateMutation.mutateAsync(formData);
      setGeneratedContent(result);
      setProgress(100);
      toast.success("Content generated successfully!");

      // Refresh history from server
      await getHistoryQuery.refetch();
    } catch (error) {
      toast.error("Failed to generate content. Please try again.");
      console.error(error);
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setProgress(0);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      console.error("Clipboard error:", error);
      toast.error(`Failed to copy ${label}. Please try again.`);
    }
  };

  const handleLoadFromHistory = (item: HistoryItem) => {
    setGeneratedContent(item.generatedContent);
    setFormData({
      niche: item.niche,
      targetAudience: item.targetAudience,
      platform: item.platform,
      goal: item.goal,
      contentStyle: item.contentStyle,
      language: "hinglish",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to generate content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate("/")}
              className="w-full"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">Content Generator</h1>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Welcome, <span className="font-semibold">{user?.name}</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Content Brief
                </CardTitle>
                <CardDescription>Fill in your content details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="niche">Niche</Label>
                    <Input
                      id="niche"
                      placeholder="e.g., Digital Marketing"
                      value={formData.niche}
                      onChange={(e) =>
                        setFormData({ ...formData, niche: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience</Label>
                    <Input
                      id="audience"
                      placeholder="e.g., Entrepreneurs"
                      value={formData.targetAudience}
                      onChange={(e) =>
                        setFormData({ ...formData, targetAudience: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      value={formData.platform}
                      onValueChange={(value) =>
                        setFormData({ ...formData, platform: value })
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger id="platform">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal</Label>
                    <Select
                      value={formData.goal}
                      onValueChange={(value) =>
                        setFormData({ ...formData, goal: value })
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger id="goal">
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOALS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style">Content Style</Label>
                    <Select
                      value={formData.contentStyle}
                      onValueChange={(value) =>
                        setFormData({ ...formData, contentStyle: value })
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger id="style">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {STYLES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={selectedLanguage}
                      onValueChange={(value) => {
                        setSelectedLanguage(value);
                        setFormData({ ...formData, language: value });
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isLoading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Generating content...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* History Section */}
            {history.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Packages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleLoadFromHistory(item)}
                      className="w-full text-left p-3 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                    >
                      <div className="font-medium text-sm text-slate-900">{item.niche}</div>
                      <div className="text-xs text-slate-500">{item.platform} • {item.goal}</div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Output Section */}
          <div className="lg:col-span-2">
            {generatedContent ? (
              <div className="space-y-6">
                {/* Viral Ideas */}
                <ContentBlock
                  icon={<Flame className="w-5 h-5 text-orange-500" />}
                  title="🔥 Viral Content Ideas"
                  description="10 highly engaging, curiosity-driven concepts"
                >
                  <div className="space-y-2">
                    {generatedContent.viralIdeas.map((idea, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm"
                      >
                        <span className="font-semibold text-orange-600">#{idx + 1}</span> {idea}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        generatedContent.viralIdeas.map((i, idx) => `${idx + 1}. ${i}`).join("\n"),
                        "Viral Ideas"
                      )
                    }
                    className="mt-4"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                </ContentBlock>

                {/* Best Idea */}
                <ContentBlock
                  icon={<Lightbulb className="w-5 h-5 text-yellow-500" />}
                  title="⚡ Best Idea Selection"
                  description="The #1 most viral idea with rationale"
                >
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">
                        {generatedContent.bestIdea.idea}
                      </h4>
                      <p className="text-slate-600 text-sm">{generatedContent.bestIdea.rationale}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `${generatedContent.bestIdea.idea}\n\n${generatedContent.bestIdea.rationale}`,
                        "Best Idea"
                      )
                    }
                    className="mt-4"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </ContentBlock>

                {/* Hooks */}
                <ContentBlock
                  icon={<Zap className="w-5 h-5 text-blue-500" />}
                  title="🎯 Hooks"
                  description="5 scroll-stopping hooks (max 12 words each)"
                >
                  <div className="space-y-2">
                    {generatedContent.hooks.map((hook, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm"
                      >
                        "{hook}"
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        generatedContent.hooks.map((h) => `"${h}"`).join("\n"),
                        "Hooks"
                      )
                    }
                    className="mt-4"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                </ContentBlock>

                {/* Script */}
                <ContentBlock
                  icon={<FileText className="w-5 h-5 text-purple-500" />}
                  title="🎬 Script"
                  description="Short-form video script (30-45 seconds)"
                >
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">Hook (0-3s)</h4>
                      <p className="text-slate-600 text-sm">{generatedContent.script.hook}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">
                        Main Content
                      </h4>
                      <p className="text-slate-600 text-sm">
                        {generatedContent.script.mainContent}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">Ending (CTA)</h4>
                      <p className="text-slate-600 text-sm">{generatedContent.script.ending}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `HOOK:\n${generatedContent.script.hook}\n\nMAIN CONTENT:\n${generatedContent.script.mainContent}\n\nENDING:\n${generatedContent.script.ending}`,
                        "Script"
                      )
                    }
                    className="mt-4"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </ContentBlock>

                {/* Caption */}
                <ContentBlock
                  icon={<MessageSquare className="w-5 h-5 text-green-500" />}
                  title="📝 Caption"
                  description="Strong opening line with value and CTA"
                >
                  <p className="text-slate-600 whitespace-pre-wrap">
                    {generatedContent.caption}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent.caption, "Caption")}
                    className="mt-4"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </ContentBlock>

                {/* Hashtags */}
                <ContentBlock
                  icon={<Hash className="w-5 h-5 text-pink-500" />}
                  title="🔎 Hashtags"
                  description="20 hashtags (mix of high, medium, low competition)"
                >
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(generatedContent.hashtags.join(" "), "Hashtags")
                    }
                    className="mt-4"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                </ContentBlock>

                {/* Carousel */}
                <ContentBlock
                  icon={<Layers className="w-5 h-5 text-indigo-500" />}
                  title="🎠 Carousel Version"
                  description="7-slide carousel outline"
                >
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                      <span className="font-semibold text-indigo-600">Slide 1 (Hook)</span>
                      <p className="text-slate-600 mt-1">{generatedContent.carousel.slide1}</p>
                    </div>
                    {generatedContent.carousel.slides2to6.map((slide, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm"
                      >
                        <span className="font-semibold text-indigo-600">Slide {idx + 2}</span>
                        <p className="text-slate-600 mt-1">{slide}</p>
                      </div>
                    ))}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                      <span className="font-semibold text-indigo-600">Slide 7 (CTA)</span>
                      <p className="text-slate-600 mt-1">{generatedContent.carousel.slide7}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const carouselText = `Slide 1: ${generatedContent.carousel.slide1}\n\n${generatedContent.carousel.slides2to6
                        .map((s, i) => `Slide ${i + 2}: ${s}`)
                        .join("\n\n")}\n\nSlide 7: ${generatedContent.carousel.slide7}`;
                      copyToClipboard(carouselText, "Carousel");
                    }}
                    className="mt-4"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                </ContentBlock>

                {/* Repurpose */}
                <ContentBlock
                  icon={<Share2 className="w-5 h-5 text-red-500" />}
                  title="🔁 Repurpose Content"
                  description="Adapted for Twitter, LinkedIn, YouTube Shorts"
                >
                  <Tabs defaultValue="twitter" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="twitter">Twitter</TabsTrigger>
                      <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                      <TabsTrigger value="youtube">YouTube</TabsTrigger>
                    </TabsList>

                    <TabsContent value="twitter" className="space-y-2 mt-4">
                      {generatedContent.repurpose.twitterThread.map((tweet, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm"
                        >
                          <span className="font-semibold text-blue-600">{idx + 1}/5</span>
                          <p className="text-slate-600 mt-1">{tweet}</p>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            generatedContent.repurpose.twitterThread
                              .map((t, i) => `${i + 1}. ${t}`)
                              .join("\n\n"),
                            "Twitter Thread"
                          )
                        }
                        className="mt-4"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Thread
                      </Button>
                    </TabsContent>

                    <TabsContent value="linkedin" className="mt-4">
                      <p className="text-slate-600 whitespace-pre-wrap mb-4">
                        {generatedContent.repurpose.linkedInPost}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            generatedContent.repurpose.linkedInPost,
                            "LinkedIn Post"
                          )
                        }
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Post
                      </Button>
                    </TabsContent>

                    <TabsContent value="youtube" className="mt-4">
                      <p className="text-slate-600 whitespace-pre-wrap mb-4">
                        {generatedContent.repurpose.youtubeShorts}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            generatedContent.repurpose.youtubeShorts,
                            "YouTube Description"
                          )
                        }
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Description
                      </Button>
                    </TabsContent>
                  </Tabs>
                </ContentBlock>

                {/* Optimization Tips */}
                <ContentBlock
                  icon={<Lightbulb className="w-5 h-5 text-amber-500" />}
                  title="🚀 Optimization Tips"
                  description="Best posting time, visuals, and engagement tricks"
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Best Posting Time</h4>
                      <p className="text-slate-600 text-sm">
                        {generatedContent.optimizationTips.bestPostingTime}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Suggested Visuals</h4>
                      <ul className="space-y-1">
                        {generatedContent.optimizationTips.suggestedVisuals.map((visual, idx) => (
                          <li key={idx} className="text-slate-600 text-sm flex items-start">
                            <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                            {visual}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Engagement Tricks</h4>
                      <ul className="space-y-1">
                        {generatedContent.optimizationTips.engagementTricks.map((trick, idx) => (
                          <li key={idx} className="text-slate-600 text-sm flex items-start">
                            <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                            {trick}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tipsText = `BEST POSTING TIME:\n${generatedContent.optimizationTips.bestPostingTime}\n\nSUGGESTED VISUALS:\n${generatedContent.optimizationTips.suggestedVisuals.join("\n")}\n\nENGAGEMENT TRICKS:\n${generatedContent.optimizationTips.engagementTricks.join("\n")}`;
                      copyToClipboard(tipsText, "Optimization Tips");
                    }}
                    className="mt-4"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                </ContentBlock>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Ready to Generate?
                  </h3>
                  <p className="text-slate-600">
                    Fill in your content details and click "Generate Content" to get started
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Content Block Component
function ContentBlock({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">{icon}</div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
