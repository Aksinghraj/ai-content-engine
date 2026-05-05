'use client';

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
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";

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
const VIDEO_LENGTHS = [
  { code: "short", name: "Short Form (30-45s)" },
  { code: "long", name: "Long Form (2-5 min)" },
];
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
    videoLength: "short",
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

  useEffect(() => {
    if (getHistoryQuery.data && history.length === 0 && !getHistoryQuery.isLoading) {
      const historyData = getHistoryQuery.data as HistoryItem[];
      setHistory(historyData);
    }
  }, [getHistoryQuery.data, getHistoryQuery.isLoading, history.length]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.niche || !formData.targetAudience || !formData.platform || !formData.goal || !formData.contentStyle || !formData.videoLength) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 300);

    try {
      const result = await generateMutation.mutateAsync(formData);
      setGeneratedContent(result);
      setProgress(100);
      toast.success("Content generated successfully!");

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

  const exportContent = (format: "pdf" | "csv" | "txt" | "json") => {
    if (!generatedContent) return;

    let content = "";
    const filename = `content-${Date.now()}`;

    if (format === "json") {
      content = JSON.stringify(generatedContent, null, 2);
    } else if (format === "txt") {
      content = `
VIRAL CONTENT IDEAS
${generatedContent.viralIdeas.map((idea, i) => `${i + 1}. ${idea}`).join("\n")}

BEST IDEA
${generatedContent.bestIdea.idea}
Rationale: ${generatedContent.bestIdea.rationale}

HOOKS
${generatedContent.hooks.map((hook, i) => `${i + 1}. ${hook}`).join("\n")}

SCRIPT
Hook: ${generatedContent.script.hook}
Main Content: ${generatedContent.script.mainContent}
Ending: ${generatedContent.script.ending}

CAPTION
${generatedContent.caption}

HASHTAGS
${generatedContent.hashtags.join(" ")}

CAROUSEL
Slide 1: ${generatedContent.carousel.slide1}
${generatedContent.carousel.slides2to6.map((slide, i) => `Slide ${i + 2}: ${slide}`).join("\n")}
Slide 7: ${generatedContent.carousel.slide7}

REPURPOSE CONTENT
Twitter Thread:
${generatedContent.repurpose.twitterThread.map((tweet, i) => `${i + 1}. ${tweet}`).join("\n")}

LinkedIn Post:
${generatedContent.repurpose.linkedInPost}

YouTube Shorts:
${generatedContent.repurpose.youtubeShorts}

OPTIMIZATION TIPS
Best Posting Time: ${generatedContent.optimizationTips.bestPostingTime}
Suggested Visuals: ${generatedContent.optimizationTips.suggestedVisuals.join(", ")}
Engagement Tricks: ${generatedContent.optimizationTips.engagementTricks.join(", ")}
      `.trim();
    } else if (format === "csv") {
      const rows = [
        ["Type", "Content"],
        ["Niche", formData.niche],
        ["Platform", formData.platform],
        ["Goal", formData.goal],
        ...generatedContent.viralIdeas.map((idea, i) => [`Viral Idea ${i + 1}`, idea]),
        ["Best Idea", generatedContent.bestIdea.idea],
        ...generatedContent.hooks.map((hook, i) => [`Hook ${i + 1}`, hook]),
        ["Script Hook", generatedContent.script.hook],
        ["Script Main", generatedContent.script.mainContent],
        ["Script Ending", generatedContent.script.ending],
        ["Caption", generatedContent.caption],
        ...generatedContent.hashtags.map((tag) => ["Hashtag", tag]),
      ];
      content = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Content exported as ${format.toUpperCase()}!`);
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
      videoLength: "short",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md border-purple-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Please Login</CardTitle>
            <CardDescription>You need to be logged in to generate content</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-purple-400 hover:text-purple-300">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Content Generator
            </h1>
            <p className="text-slate-400">Welcome, {user?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur sticky top-6">
              <CardHeader>
                <CardTitle className="text-purple-400">Content Brief</CardTitle>
                <CardDescription>Fill in your content details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Niche</Label>
                    <Input
                      value={formData.niche}
                      onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                      placeholder="e.g., Comedy"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Target Audience</Label>
                    <Input
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      placeholder="e.g., Public"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Platform</Label>
                    <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {PLATFORMS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300">Goal</Label>
                    <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {GOALS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300">Content Style</Label>
                    <Select value={formData.contentStyle} onValueChange={(value) => setFormData({ ...formData, contentStyle: value })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {STYLES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300">Video Length</Label>
                    <Select value={formData.videoLength} onValueChange={(value) => setFormData({ ...formData, videoLength: value })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="Select video length" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {VIDEO_LENGTHS.map((v) => (
                          <SelectItem key={v.code} value={v.code}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300">Language</Label>
                    <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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

                  {isLoading && <Progress value={progress} className="h-2" />}
                </form>

                {history.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-700">
                    <h3 className="text-slate-300 font-semibold mb-4">Recent Packages</h3>
                    <div className="space-y-2">
                      {history.slice(0, 3).map((item) => (
                        <Button
                          key={item.id}
                          variant="outline"
                          className="w-full justify-start text-left border-slate-700 hover:bg-slate-800/50"
                          onClick={() => handleLoadFromHistory(item)}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-300">{item.niche}</p>
                            <p className="text-xs text-slate-500">{item.platform} • {item.goal}</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Output */}
          <div className="lg:col-span-2">
            {generatedContent ? (
              <div className="space-y-6">
                {/* Export Buttons */}
                <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Export Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2 flex-wrap">
                    <Button onClick={() => exportContent("pdf")} variant="outline" className="border-slate-700 hover:bg-slate-800/50">
                      PDF
                    </Button>
                    <Button onClick={() => exportContent("csv")} variant="outline" className="border-slate-700 hover:bg-slate-800/50">
                      CSV
                    </Button>
                    <Button onClick={() => exportContent("txt")} variant="outline" className="border-slate-700 hover:bg-slate-800/50">
                      TXT
                    </Button>
                    <Button onClick={() => exportContent("json")} variant="outline" className="border-slate-700 hover:bg-slate-800/50">
                      JSON
                    </Button>
                  </CardContent>
                </Card>

                {/* Viral Ideas */}
                <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Flame className="w-5 h-5" />
                      Viral Content Ideas
                    </CardTitle>
                    <CardDescription>10 highly engaging, curiosity-driven concepts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedContent.viralIdeas.map((idea, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                          <span className="text-purple-400 font-bold">#{i + 1}</span>
                          <p className="text-slate-300 flex-1">{idea}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(idea, `Idea #${i + 1}`)}
                            className="text-slate-400 hover:text-slate-200"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Best Idea */}
                <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Best Idea Selection
                    </CardTitle>
                    <CardDescription>The #1 most viral idea with rationale</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-slate-300 font-semibold mb-2">{generatedContent.bestIdea.idea}</p>
                      <p className="text-slate-400 text-sm">{generatedContent.bestIdea.rationale}</p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(`${generatedContent.bestIdea.idea}\n\n${generatedContent.bestIdea.rationale}`, "Best Idea")}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </CardContent>
                </Card>

                {/* Hooks */}
                <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Hooks
                    </CardTitle>
                    <CardDescription>5 scroll-stopping hooks (max 12 words each)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {generatedContent.hooks.map((hook, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                        <span className="text-blue-400 font-bold">{i + 1}</span>
                        <p className="text-slate-300 flex-1">{hook}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(hook, `Hook ${i + 1}`)}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Script */}
                <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Script
                    </CardTitle>
                    <CardDescription>Short-form video script ({formData.videoLength === "short" ? "30-45 seconds" : "2-5 minutes"})</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-slate-300 font-semibold mb-2">Hook (0-3s)</h4>
                      <p className="text-slate-400 text-sm">{generatedContent.script.hook}</p>
                    </div>
                    <div>
                      <h4 className="text-slate-300 font-semibold mb-2">Main Content</h4>
                      <p className="text-slate-400 text-sm">{generatedContent.script.mainContent}</p>
                    </div>
                    <div>
                      <h4 className="text-slate-300 font-semibold mb-2">Ending (CTA)</h4>
                      <p className="text-slate-400 text-sm">{generatedContent.script.ending}</p>
                    </div>
                    <Button
                      onClick={() =>
                        copyToClipboard(
                          `Hook: ${generatedContent.script.hook}\n\nMain Content: ${generatedContent.script.mainContent}\n\nEnding: ${generatedContent.script.ending}`,
                          "Script"
                        )
                      }
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </CardContent>
                </Card>

                {/* Caption */}
                <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Caption
                    </CardTitle>
                    <CardDescription>Strong opening line with value and CTA</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-300">{generatedContent.caption}</p>
                    <Button
                      onClick={() => copyToClipboard(generatedContent.caption, "Caption")}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </CardContent>
                </Card>

                {/* Hashtags */}
                <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Hash className="w-5 h-5" />
                      Hashtags
                    </CardTitle>
                    <CardDescription>20 hashtags (mix of high, medium, low competition)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.hashtags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-800/50 text-slate-300 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button
                      onClick={() => copyToClipboard(generatedContent.hashtags.join(" "), "Hashtags")}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All
                    </Button>
                  </CardContent>
                </Card>

                {/* Carousel */}
                <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Carousel Version
                    </CardTitle>
                    <CardDescription>7-slide carousel outline</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-slate-400 text-xs font-semibold mb-1">Slide 1 (Hook)</p>
                      <p className="text-slate-300">{generatedContent.carousel.slide1}</p>
                    </div>
                    {generatedContent.carousel.slides2to6.map((slide, i) => (
                      <div key={i} className="p-3 bg-slate-800/30 rounded-lg">
                        <p className="text-slate-400 text-xs font-semibold mb-1">Slide {i + 2}</p>
                        <p className="text-slate-300">{slide}</p>
                      </div>
                    ))}
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-slate-400 text-xs font-semibold mb-1">Slide 7 (CTA)</p>
                      <p className="text-slate-300">{generatedContent.carousel.slide7}</p>
                    </div>
                    <Button
                      onClick={() =>
                        copyToClipboard(
                          `Slide 1: ${generatedContent.carousel.slide1}\n${generatedContent.carousel.slides2to6
                            .map((s, i) => `Slide ${i + 2}: ${s}`)
                            .join("\n")}\nSlide 7: ${generatedContent.carousel.slide7}`,
                          "Carousel"
                        )
                      }
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All
                    </Button>
                  </CardContent>
                </Card>

                {/* Repurpose */}
                <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Repurpose Content
                    </CardTitle>
                    <CardDescription>Adapted for Twitter, LinkedIn, YouTube Shorts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="twitter" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
                        <TabsTrigger value="twitter">Twitter</TabsTrigger>
                        <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                        <TabsTrigger value="youtube">YouTube</TabsTrigger>
                      </TabsList>
                      <TabsContent value="twitter" className="space-y-3 mt-4">
                        {generatedContent.repurpose.twitterThread.map((tweet, i) => (
                          <div key={i} className="p-3 bg-slate-800/30 rounded-lg">
                            <p className="text-slate-400 text-xs font-semibold mb-2">{i + 1}/5</p>
                            <p className="text-slate-300 text-sm">{tweet}</p>
                          </div>
                        ))}
                        <Button
                          onClick={() => copyToClipboard(generatedContent.repurpose.twitterThread.join("\n\n"), "Twitter Thread")}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Thread
                        </Button>
                      </TabsContent>
                      <TabsContent value="linkedin" className="mt-4">
                        <p className="text-slate-300 mb-4">{generatedContent.repurpose.linkedInPost}</p>
                        <Button
                          onClick={() => copyToClipboard(generatedContent.repurpose.linkedInPost, "LinkedIn Post")}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </TabsContent>
                      <TabsContent value="youtube" className="mt-4">
                        <p className="text-slate-300 mb-4">{generatedContent.repurpose.youtubeShorts}</p>
                        <Button
                          onClick={() => copyToClipboard(generatedContent.repurpose.youtubeShorts, "YouTube Shorts")}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Optimization Tips */}
                <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Optimization Tips
                    </CardTitle>
                    <CardDescription>Best posting time, visuals, and engagement tricks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-slate-300 font-semibold mb-2">Best Posting Time</h4>
                      <p className="text-slate-400 text-sm">{generatedContent.optimizationTips.bestPostingTime}</p>
                    </div>
                    <div>
                      <h4 className="text-slate-300 font-semibold mb-2">Suggested Visuals</h4>
                      <ul className="space-y-1">
                        {generatedContent.optimizationTips.suggestedVisuals.map((visual, i) => (
                          <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                            <span className="text-purple-400">•</span>
                            {visual}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-slate-300 font-semibold mb-2">Engagement Tricks</h4>
                      <ul className="space-y-1">
                        {generatedContent.optimizationTips.engagementTricks.map((trick, i) => (
                          <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                            <span className="text-purple-400">•</span>
                            {trick}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      onClick={() =>
                        copyToClipboard(
                          `Best Posting Time: ${generatedContent.optimizationTips.bestPostingTime}\n\nSuggested Visuals:\n${generatedContent.optimizationTips.suggestedVisuals.join(
                            "\n"
                          )}\n\nEngagement Tricks:\n${generatedContent.optimizationTips.engagementTricks.join("\n")}`,
                          "Optimization Tips"
                        )
                      }
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400">Fill in the form and generate content to see results here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
