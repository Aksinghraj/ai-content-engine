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
import { LumaeLightPulse, type LumaeLightPulseState } from "@/components/LumaeLightPulse";
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
  { code: "15s", name: "Ultra Short (15 seconds)" },
  { code: "30s", name: "Short (30 seconds)" },
  { code: "60s", name: "Standard (60 seconds)" },
  { code: "90s", name: "Extended (90 seconds)" },
  { code: "3min", name: "Long Form (3 minutes)" },
  { code: "5min", name: "Deep Dive (5 minutes)" },
  { code: "custom", name: "Custom duration…" },
];
const SCRIPT_LENGTHS = [
  { code: "brief", name: "Brief (~50 words)" },
  { code: "short", name: "Short (~100-150 words)" },
  { code: "medium", name: "Medium (~200-300 words)" },
  { code: "long", name: "Long (~400-600 words)" },
  { code: "extended", name: "Extended (~800-1200 words)" },
  { code: "custom", name: "Custom word target…" },
];

const PLATFORM_LENGTH_PRESETS: Record<string, { videoLength: string; scriptLength: string; label: string }> = {
  Instagram: { videoLength: "30s", scriptLength: "short", label: "Short-form Reel" },
  TikTok: { videoLength: "15s", scriptLength: "brief", label: "Fast hook" },
  YouTube: { videoLength: "3min", scriptLength: "long", label: "Explainer video" },
  LinkedIn: { videoLength: "60s", scriptLength: "medium", label: "Professional insight" },
  Twitter: { videoLength: "30s", scriptLength: "short", label: "Concise update" },
  Facebook: { videoLength: "60s", scriptLength: "medium", label: "Community post" },
};

const VIDEO_SECONDS: Record<string, number> = { "15s": 15, "30s": 30, "60s": 60, "90s": 90, "3min": 180, "5min": 300 };
const SCRIPT_WORDS: Record<string, number> = { brief: 50, short: 125, medium: 250, long: 500, extended: 1000 };

const formatDuration = (seconds: number) => seconds >= 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60 ? `${seconds % 60}s` : ""}`.trim() : `${seconds}s`;
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "hinglish", name: "Hinglish" },
  { code: "bho", name: "Bhojpuri" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "bn", name: "Bengali" },
  { code: "pa", name: "Punjabi" },
] as const;

type SupportedLanguage = (typeof LANGUAGES)[number]["code"];

type UnifiedTrendTopic = {
  id: string;
  title: string;
  source: "youtube" | "instagram" | "facebook" | "tiktok" | "twitter";
  dataKind: "live" | "ai_estimated";
  suggestedStyle: string;
  suggestedGoal: string;
};

const sourceLabel = (topic: UnifiedTrendTopic) => `${topic.dataKind === "live" ? "Live" : "AI-estimated"} ${topic.source === "twitter" ? "X" : topic.source[0].toUpperCase() + topic.source.slice(1)}`;

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
    videoLength: "60s",
    scriptLength: "medium",
    customVideoSeconds: "",
    customScriptWordTarget: "",
  });
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const trendingQuery = trpc.trending.getTrendingTopics.useQuery({ limit: 8 }, {
    enabled: isAuthenticated,
  });

  const [generatedContent, setGeneratedContent] = useState<ContentPackage | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationPulse, setGenerationPulse] = useState<LumaeLightPulseState>("idle");
  const [selectedLanguage, setSelectedLanguage] = useState("hinglish");

  const generateMutation = trpc.content.generate.useMutation();
  const getHistoryQuery = trpc.content.history.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const lengthPreferencesQuery = trpc.content.lengthPreferences.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const saveLengthPreferences = trpc.content.saveLengthPreferences.useMutation({
    onSuccess: () => toast.success("Length defaults saved for your next generation."),
    onError: (error) => toast.error(error.message || "Unable to save length defaults."),
  });
  const accountLanguageQuery = trpc.accountPreferences.getLanguage.useQuery(undefined, { enabled: isAuthenticated });
  const saveAccountLanguage = trpc.accountPreferences.setLanguage.useMutation({
    onError: (error) => toast.error(error.message || "Unable to save your language preference."),
  });
  const [hasRestoredLengthPreferences, setHasRestoredLengthPreferences] = useState(false);
  const [hasRestoredLanguage, setHasRestoredLanguage] = useState(false);

  const platformPreset = PLATFORM_LENGTH_PRESETS[formData.platform];
  const requestedVideoSeconds = formData.videoLength === "custom" ? Number(formData.customVideoSeconds) : VIDEO_SECONDS[formData.videoLength];
  const requestedScriptWords = formData.scriptLength === "custom" ? Number(formData.customScriptWordTarget) : SCRIPT_WORDS[formData.scriptLength];
  const applyPlatformPreset = () => {
    if (!platformPreset) return;
    setFormData((current) => ({
      ...current,
      videoLength: platformPreset.videoLength,
      scriptLength: platformPreset.scriptLength,
      customVideoSeconds: "",
      customScriptWordTarget: "",
    }));
  };

  const saveCurrentLengthPreferences = () => {
    const customVideoSeconds = Number(formData.customVideoSeconds);
    const customScriptWordTarget = Number(formData.customScriptWordTarget);
    if (formData.videoLength === "custom" && (!Number.isInteger(customVideoSeconds) || customVideoSeconds < 5 || customVideoSeconds > 3600)) {
      toast.error("Choose a custom video duration between 5 seconds and 60 minutes before saving.");
      return;
    }
    if (formData.scriptLength === "custom" && (!Number.isInteger(customScriptWordTarget) || customScriptWordTarget < 25 || customScriptWordTarget > 3000)) {
      toast.error("Choose a custom script target between 25 and 3,000 words before saving.");
      return;
    }
    saveLengthPreferences.mutate({
      videoLength: formData.videoLength,
      scriptLength: formData.scriptLength,
      customVideoSeconds: formData.videoLength === "custom" ? customVideoSeconds : undefined,
      customScriptWordTarget: formData.scriptLength === "custom" ? customScriptWordTarget : undefined,
    });
  };

  useEffect(() => {
    if (getHistoryQuery.data && history.length === 0 && !getHistoryQuery.isLoading) {
      const historyData = getHistoryQuery.data as HistoryItem[];
      setHistory(historyData);
    }
  }, [getHistoryQuery.data, getHistoryQuery.isLoading, history.length]);

  useEffect(() => {
    const saved = lengthPreferencesQuery.data;
    if (!saved || hasRestoredLengthPreferences) return;
    setFormData((current) => ({
      ...current,
      videoLength: saved.videoLength,
      scriptLength: saved.scriptLength,
      customVideoSeconds: saved.customVideoSeconds?.toString() ?? "",
      customScriptWordTarget: saved.customScriptWordTarget?.toString() ?? "",
    }));
    setHasRestoredLengthPreferences(true);
  }, [hasRestoredLengthPreferences, lengthPreferencesQuery.data]);

  useEffect(() => {
    const savedLanguage = accountLanguageQuery.data;
    if (!savedLanguage || hasRestoredLanguage || !LANGUAGES.some((language) => language.code === savedLanguage)) return;
    setFormData((current) => ({ ...current, language: savedLanguage }));
    setSelectedLanguage(savedLanguage);
    setHasRestoredLanguage(true);
  }, [accountLanguageQuery.data, hasRestoredLanguage]);

  const selectLanguage = (language: string) => {
    setFormData((current) => ({ ...current, language }));
    setSelectedLanguage(language);
    if (isAuthenticated) saveAccountLanguage.mutate({ language: language as SupportedLanguage });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.niche || !formData.targetAudience || !formData.platform || !formData.goal || !formData.contentStyle || !formData.videoLength) {
      toast.error("Please fill in all fields");
      return;
    }
    const customVideoSeconds = Number(formData.customVideoSeconds);
    const customScriptWordTarget = Number(formData.customScriptWordTarget);
    if (formData.videoLength === "custom" && (!Number.isInteger(customVideoSeconds) || customVideoSeconds < 5 || customVideoSeconds > 3600)) {
      toast.error("Choose a custom video duration between 5 seconds and 60 minutes.");
      return;
    }
    if (formData.scriptLength === "custom" && (!Number.isInteger(customScriptWordTarget) || customScriptWordTarget < 25 || customScriptWordTarget > 3000)) {
      toast.error("Choose a custom script target between 25 and 3,000 words.");
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setGenerationPulse("working");

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 300);

    try {
      const result = await generateMutation.mutateAsync({
            ...formData,
            customVideoSeconds: formData.videoLength === "custom" ? customVideoSeconds : undefined,
            customScriptWordTarget: formData.scriptLength === "custom" ? customScriptWordTarget : undefined,
            trendingTopics: trendingTopics.length > 0 ? trendingTopics : undefined,
          });
      setGeneratedContent(result);
      setProgress(100);
      setGenerationPulse("complete");
      window.setTimeout(() => setGenerationPulse("idle"), 1500);
      toast.success("Content generated successfully!");

      await getHistoryQuery.refetch();
    } catch (error) {
      setGenerationPulse("error");
      window.setTimeout(() => setGenerationPulse("idle"), 1500);
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

  const applyTrendToBrief = (topic: UnifiedTrendTopic) => {
    setTrendingTopics([topic.title]);
    setFormData((current) => ({
      ...current,
      niche: topic.title,
      contentStyle: topic.suggestedStyle,
      goal: topic.suggestedGoal,
    }));
    toast.success(`Applied “${topic.title}” to your brief`);
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
      videoLength: "60s",
      scriptLength: "medium",
      customVideoSeconds: "",
      customScriptWordTarget: "",
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
            <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur lg:sticky lg:top-6">
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
                    {formData.videoLength === "custom" && (
                      <div className="mt-2">
                        <Label className="text-xs text-[#9a9aa2]">Custom duration in seconds</Label>
                        <Input type="number" min={5} max={3600} inputMode="numeric" value={formData.customVideoSeconds} onChange={(event) => setFormData({ ...formData, customVideoSeconds: event.target.value })} placeholder="e.g., 75" className="mt-1 border-[#26262b] bg-[#09090b] text-[#f5f5f7]" />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-slate-300">Script Length</Label>
                    <Select value={formData.scriptLength} onValueChange={(value) => setFormData({ ...formData, scriptLength: value })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="Select script length" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {SCRIPT_LENGTHS.map((s) => (
                          <SelectItem key={s.code} value={s.code}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.scriptLength === "custom" && (
                      <div className="mt-2">
                        <Label className="text-xs text-[#9a9aa2]">Custom word target</Label>
                        <Input type="number" min={25} max={3000} inputMode="numeric" value={formData.customScriptWordTarget} onChange={(event) => setFormData({ ...formData, customScriptWordTarget: event.target.value })} placeholder="e.g., 425" className="mt-1 border-[#26262b] bg-[#09090b] text-[#f5f5f7]" />
                      </div>
                    )}
                  </div>

                  {platformPreset && (
                    <div className="rounded-xl border border-[#26262b] bg-[#09090b] p-3 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-[#f5f5f7]">Recommended for {formData.platform}</p>
                          <p className="mt-0.5 text-[#9a9aa2]">{platformPreset.label}: {VIDEO_LENGTHS.find((item) => item.code === platformPreset.videoLength)?.name} · {SCRIPT_LENGTHS.find((item) => item.code === platformPreset.scriptLength)?.name}</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={applyPlatformPreset} className="shrink-0 border-[#6366f1]/50 bg-transparent text-[#f5f5f7] hover:bg-[#141417]">Apply</Button>
                      </div>
                    </div>
                  )}

                  {(requestedVideoSeconds > 0 || requestedScriptWords > 0) && (
                    <div className="rounded-xl border border-[#26262b] bg-[#141417] px-3 py-2 text-xs text-[#9a9aa2]">
                      <div className="flex items-center justify-between gap-3">
                        <p><span className="font-medium text-[#f5f5f7]">Length guide:</span>{" "}
                          {requestedVideoSeconds > 0 && <>~{formatDuration(requestedVideoSeconds)} spoken video · ~{Math.round(requestedVideoSeconds * 2.5)} spoken words</>}
                          {requestedVideoSeconds > 0 && requestedScriptWords > 0 && " · "}
                          {requestedScriptWords > 0 && <>target ~{requestedScriptWords.toLocaleString()} script words</>}
                        </p>
                        <Button type="button" variant="ghost" size="sm" onClick={saveCurrentLengthPreferences} disabled={saveLengthPreferences.isPending} className="h-7 shrink-0 px-2 text-[#8b5cf6] hover:bg-[#09090b] hover:text-[#f5f5f7]">{saveLengthPreferences.isPending ? "Saving…" : "Save defaults"}</Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-slate-300">Language</Label>
                    <Select value={formData.language} onValueChange={selectLanguage}>
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
                    {isLoading || generationPulse !== "idle" ? (
                      <>
                        <LumaeLightPulse state={generationPulse} size={18} className="mr-2" label={generationPulse === "error" ? "Content generation needs attention" : "Lumae is generating content"} />
                        {isLoading ? "Generating..." : "Generate Content"}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>

                  {/* Unified cached trends: Live YouTube + clearly labelled AI estimates. */}
                  {trendingQuery.data?.data && trendingQuery.data.data.length > 0 && (
                    <div>
                      <Label className="flex items-center gap-2 text-[#f5f5f7]">
                        <Flame className="h-3 w-3 text-[#f59e0b]" />
                        Trending Topics
                      </Label>
                      <p className="mt-1 text-xs leading-relaxed text-[#9a9aa2]">
                        Live YouTube topics and clearly labelled AI-estimated social signals. Choose one to fill Niche, Style, and Goal.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(trendingQuery.data.data as UnifiedTrendTopic[]).slice(0, 10).map((topic) => (
                          <button
                            key={topic.id}
                            type="button"
                            onClick={() => applyTrendToBrief(topic)}
                            className={`rounded-full border px-2.5 py-1.5 text-left text-xs transition-colors ${
                              trendingTopics.includes(topic.title)
                                ? "border-[#6366f1] bg-[#6366f1]/20 text-[#f5f5f7]"
                                : "border-[#26262b] bg-[#141417] text-[#f5f5f7] hover:border-[#8b5cf6]"
                            }`}
                          >
                            <span className="font-medium">{topic.title}</span>
                            <span className={`ml-1.5 text-[10px] ${topic.dataKind === "live" ? "text-[#06b6d4]" : "text-[#9a9aa2]"}`}>
                              {sourceLabel(topic)}
                            </span>
                          </button>
                        ))}
                      </div>
                      {trendingTopics.length > 0 && (
                        <p className="mt-2 text-xs text-[#8b5cf6]">
                          Selected topic will guide generation; you can still edit the suggested fields.
                        </p>
                      )}
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex items-center gap-3">
                      <LumaeLightPulse state="working" size={18} label="Lumae is preparing your content package" />
                      <Progress value={progress} className="h-2 flex-1" />
                    </div>
                  )}
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
