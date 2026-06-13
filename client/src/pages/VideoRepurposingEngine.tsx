import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Youtube,
  FileText,
  Mic,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Download,
  ArrowRight,
  RefreshCw,
  Zap,
  Play,
  Globe,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

interface RepurposedContent {
  linkedinPost?: string;
  facebookPost?: string;
  tiktokScript?: string;
  instagramCaption?: string;
  youtubeDescription?: string;
  twitterThread?: string;
}

const PLATFORM_CONFIG = [
  { key: "linkedinPost", label: "LinkedIn Post", emoji: "💼", maxChars: 3000, color: "#0A66C2" },
  { key: "facebookPost", label: "Facebook Post", emoji: "👥", maxChars: 63206, color: "#1877F2" },
  { key: "tiktokScript", label: "TikTok Script", emoji: "🎵", maxChars: 2200, color: "#000000" },
  { key: "instagramCaption", label: "Instagram Caption", emoji: "📸", maxChars: 2200, color: "#E4405F" },
  { key: "youtubeDescription", label: "YouTube Description", emoji: "▶️", maxChars: 5000, color: "#FF0000" },
  { key: "twitterThread", label: "Twitter/X Thread", emoji: "🐦", maxChars: 1400, color: "#1DA1F2" },
];

const SOURCE_TYPES = [
  { value: "youtube_video", label: "YouTube Video URL", icon: Youtube, placeholder: "https://www.youtube.com/watch?v=..." },
  { value: "article", label: "Article / Blog Post", icon: FileText, placeholder: "Paste your article content here..." },
  { value: "podcast", label: "Podcast / Audio", icon: Mic, placeholder: "Paste transcript or description..." },
];

function VideoRepurposingContent() {
  const [activeTab, setActiveTab] = useState("repurpose");
  const [sourceType, setSourceType] = useState("youtube_video");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [repurposedContent, setRepurposedContent] = useState<RepurposedContent>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{
    id: string;
    sourceType: string;
    sourcePreview: string;
    content: RepurposedContent;
    createdAt: Date;
  }>>([]);

  const generateMutation = trpc.enterprise.generateCrossPlatformContent.useMutation();

  const handleGenerate = async () => {
    const content = sourceType === "youtube_video" ? sourceUrl : sourceContent;
    if (!content.trim()) {
      toast.error("Please provide source content");
      return;
    }

    if (sourceType === "youtube_video" && !content.includes("youtube.com") && !content.includes("youtu.be")) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        sourceUrl: sourceType === "youtube_video" ? sourceUrl : "https://example.com/content",
        sourceType: sourceType as "youtube_video" | "article" | "podcast",
        originalContent: sourceType === "youtube_video"
          ? `YouTube video: ${sourceUrl}\n\nGenerate engaging cross-platform content based on this YouTube video URL. Create compelling content that captures the essence of what would typically be in such a video.`
          : sourceContent,
      });

      if (result.success && result.content) {
        const generated: RepurposedContent = {
          linkedinPost: result.content.linkedinPost,
          facebookPost: result.content.facebookPost,
          tiktokScript: result.content.tiktokScript,
          instagramCaption: result.content.instagramCaption,
          youtubeDescription: result.content.youtubeDescription,
          twitterThread: result.content.linkedinPost
            ? `Thread 🧵\n\n${result.content.linkedinPost.split(". ").slice(0, 3).join(".\n\n")}...`
            : undefined,
        };
        setRepurposedContent(generated);

        // Add to history
        setHistory((prev) => [{
          id: `hist-${Date.now()}`,
          sourceType,
          sourcePreview: content.substring(0, 80),
          content: generated,
          createdAt: new Date(),
        }, ...prev.slice(0, 9)]);

        toast.success("Content repurposed for all platforms! ✨");
        setActiveTab("results");
      }
    } catch (error) {
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (key: string) => {
    const content = repurposedContent[key as keyof RepurposedContent];
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      toast.success("Copied to clipboard!");
    }
  };

  const handleDownloadAll = () => {
    const allContent = PLATFORM_CONFIG
      .filter((p) => repurposedContent[p.key as keyof RepurposedContent])
      .map((p) => `=== ${p.label} ===\n\n${repurposedContent[p.key as keyof RepurposedContent]}\n\n`)
      .join("\n");

    const blob = new Blob([allContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "repurposed-content.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Content downloaded!");
  };

  const selectedSourceType = SOURCE_TYPES.find((s) => s.value === sourceType);
  const SourceIcon = selectedSourceType?.icon || Youtube;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <RefreshCw className="w-10 h-10 text-purple-400" />
            Video Repurposing Engine
          </h1>
          <p className="text-purple-200">
            Transform any video, article, or podcast into platform-optimized content for all 6 social media channels
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Youtube, label: "YouTube → All Platforms", color: "text-red-400", bg: "border-red-500/20" },
            { icon: Zap, label: "AI-Powered Adaptation", color: "text-yellow-400", bg: "border-yellow-500/20" },
            { icon: Globe, label: "6 Platforms at Once", color: "text-blue-400", bg: "border-blue-500/20" },
            { icon: Play, label: "Instant Generation", color: "text-green-400", bg: "border-green-500/20" },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <Card key={feat.label} className={`bg-slate-800/50 ${feat.bg}`}>
                <CardContent className="pt-4 pb-4 flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${feat.color} shrink-0`} />
                  <span className="text-white text-sm font-medium">{feat.label}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-purple-500/20">
            <TabsTrigger value="repurpose" className="data-[state=active]:bg-purple-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Repurpose Content
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-purple-600" disabled={Object.keys(repurposedContent).length === 0}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Results
              {Object.keys(repurposedContent).length > 0 && (
                <Badge className="ml-2 bg-green-500/20 text-green-300 border-green-500/50 text-xs">
                  {Object.keys(repurposedContent).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
              <FileText className="w-4 h-4 mr-2" />
              History ({history.length})
            </TabsTrigger>
          </TabsList>

          {/* Repurpose Tab */}
          <TabsContent value="repurpose" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input Form */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white">Source Content</CardTitle>
                    <CardDescription className="text-purple-200">
                      Choose your content source and let AI adapt it for every platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Source Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-white">Content Source Type</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {SOURCE_TYPES.map((st) => {
                          const Icon = st.icon;
                          return (
                            <button
                              key={st.value}
                              onClick={() => setSourceType(st.value)}
                              className={`p-4 rounded-lg border-2 transition-all text-center ${
                                sourceType === st.value
                                  ? "border-purple-500 bg-purple-500/20"
                                  : "border-slate-600 bg-slate-700/30 hover:border-purple-500/50"
                              }`}
                            >
                              <Icon className={`w-6 h-6 mx-auto mb-2 ${sourceType === st.value ? "text-purple-400" : "text-slate-400"}`} />
                              <span className={`text-xs font-medium ${sourceType === st.value ? "text-white" : "text-slate-300"}`}>
                                {st.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Source Input */}
                    {sourceType === "youtube_video" ? (
                      <div className="space-y-2">
                        <Label className="text-white">YouTube Video URL</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={sourceUrl}
                            onChange={(e) => setSourceUrl(e.target.value)}
                            className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 flex-1"
                          />
                        </div>
                        <p className="text-purple-400 text-xs">
                          Paste any YouTube URL — the AI will generate platform-specific content based on the video topic
                        </p>
                        {/* Example URLs */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <p className="text-purple-400 text-xs w-full">Try an example:</p>
                          {[
                            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                            "https://www.youtube.com/watch?v=jNQXAC9IVRw",
                          ].map((url) => (
                            <button
                              key={url}
                              onClick={() => setSourceUrl(url)}
                              className="text-xs px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-purple-300 hover:bg-purple-500/20 transition"
                            >
                              {url.substring(0, 40)}...
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-white">
                          {sourceType === "article" ? "Article / Blog Content" : "Podcast Transcript / Description"}
                        </Label>
                        <Textarea
                          placeholder={selectedSourceType?.placeholder}
                          value={sourceContent}
                          onChange={(e) => setSourceContent(e.target.value)}
                          className="min-h-48 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50"
                        />
                        <p className="text-purple-400 text-xs">
                          {sourceContent.length} characters — minimum 100 characters recommended for best results
                        </p>
                      </div>
                    )}

                    {/* Generate Button */}
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || (!sourceUrl.trim() && !sourceContent.trim())}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-base"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating content for all 6 platforms...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Repurpose for All Platforms
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* How It Works */}
              <div className="space-y-4">
                <Card className="bg-slate-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">How It Works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { step: "1", title: "Paste Your Source", desc: "Add a YouTube URL, article, or podcast transcript" },
                      { step: "2", title: "AI Analyzes Content", desc: "Our AI extracts key topics, insights, and value points" },
                      { step: "3", title: "Platform Adaptation", desc: "Content is reformatted for each platform's style and limits" },
                      { step: "4", title: "Copy & Schedule", desc: "Use the generated content directly in your scheduler" },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-sm font-bold shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{item.title}</p>
                          <p className="text-purple-300 text-xs mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      Platform Outputs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {PLATFORM_CONFIG.map((p) => (
                        <div key={p.key} className="flex items-center gap-2">
                          <span className="text-lg">{p.emoji}</span>
                          <span className="text-green-200 text-sm">{p.label}</span>
                          <span className="text-green-400 text-xs ml-auto">{p.maxChars.toLocaleString()} chars</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {Object.keys(repurposedContent).length > 0 ? (
              <>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <h2 className="text-xl font-semibold text-white">Generated Content</h2>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
                      {PLATFORM_CONFIG.filter((p) => repurposedContent[p.key as keyof RepurposedContent]).length} platforms
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleDownloadAll}
                      className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All
                    </Button>
                    <Button
                      onClick={() => setActiveTab("repurpose")}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      New Content
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PLATFORM_CONFIG.map((platform) => {
                    const content = repurposedContent[platform.key as keyof RepurposedContent];
                    if (!content) return null;
                    const isCopied = copiedKey === platform.key;
                    const isOverLimit = content.length > platform.maxChars;

                    return (
                      <Card key={platform.key} className="bg-slate-800/50 border-purple-500/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{platform.emoji}</span>
                              <CardTitle className="text-white text-base">{platform.label}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs ${isOverLimit ? "text-red-400" : "text-purple-400"}`}>
                                {content.length}/{platform.maxChars}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(platform.key)}
                                className="text-purple-300 hover:text-white hover:bg-purple-500/20 h-7 w-7 p-0"
                              >
                                {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-slate-700/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                            <p className="text-purple-100 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                          </div>
                          {isOverLimit && (
                            <div className="flex items-center gap-1 mt-2 text-red-400 text-xs">
                              <AlertCircle className="w-3 h-3" />
                              Content exceeds platform limit — consider editing
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <RefreshCw className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
                <p className="text-purple-300 text-lg">No content generated yet</p>
                <p className="text-purple-400 text-sm mt-2">Go to the Repurpose tab and add your source content</p>
                <Button
                  onClick={() => setActiveTab("repurpose")}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Start Repurposing
                </Button>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {history.length > 0 ? (
              history.map((item) => (
                <Card key={item.id} className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition cursor-pointer"
                  onClick={() => {
                    setRepurposedContent(item.content);
                    setActiveTab("results");
                  }}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 text-xs capitalize">
                            {item.sourceType.replace("_", " ")}
                          </Badge>
                          <span className="text-slate-400 text-xs">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-white text-sm line-clamp-1">{item.sourcePreview}...</p>
                        <div className="flex gap-1 mt-2">
                          {PLATFORM_CONFIG.filter((p) => item.content[p.key as keyof RepurposedContent]).map((p) => (
                            <span key={p.key} className="text-base" title={p.label}>{p.emoji}</span>
                          ))}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white shrink-0">
                        View →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20">
                <FileText className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
                <p className="text-purple-300 text-lg">No history yet</p>
                <p className="text-purple-400 text-sm mt-2">Your repurposed content will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function VideoRepurposingEngine() {
  return (
    <DashboardLayout>
      <VideoRepurposingContent />
    </DashboardLayout>
  );
}
