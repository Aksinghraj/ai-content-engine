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
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Youtube,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Zap,
  Plus,
  Trash2,
  Send,
  Sparkles,
  Loader2,
  RefreshCw,
  Wand2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  mockAccounts,
  mockScheduledPosts,
  mockAnalytics,
  formatScheduleTime,
  getEngagementRate,
  getPlatformColor,
} from "@/lib/mockData";
import DashboardLayout from "@/components/DashboardLayout";

interface PostDraft {
  id: string;
  content: string;
  selectedPlatforms: string[];
  scheduledAt: string;
  scheduledTime: string;
  media: File[];
}

const PLATFORM_CHAR_LIMITS: Record<string, number> = {
  twitter: 1500,
  instagram: 2200,
  linkedin: 3000,
  facebook: 63206,
  youtube: 5000,
  tiktok: 2200,
};

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: Zap,
};

function PostSchedulingContent() {
  const [activeTab, setActiveTab] = useState("create");
  const [postDraft, setPostDraft] = useState<PostDraft>({
    id: "draft-1",
    content: "",
    selectedPlatforms: [],
    scheduledAt: new Date().toISOString().split("T")[0],
    scheduledTime: "09:00",
    media: [],
  });

  const [posts, setPosts] = useState(mockScheduledPosts);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState<"professional" | "casual" | "humorous" | "inspirational" | "educational">("casual");
  const [aiNiche, setAiNiche] = useState("");
  const [generatedPlatformPosts, setGeneratedPlatformPosts] = useState<Record<string, string>>({});
  const [selectedGeneratedPlatform, setSelectedGeneratedPlatform] = useState("twitter");
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [mediaMode, setMediaMode] = useState<"none" | "ai" | "upload">("none");
  const [uploadedMedia, setUploadedMedia] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => {
      const isValidType = f.type.startsWith("image/") || f.type.startsWith("video/");
      const isValidSize = f.size <= 100 * 1024 * 1024; // 100MB
      if (!isValidType) toast.error(`${f.name}: Invalid file type`);
      if (!isValidSize) toast.error(`${f.name}: File too large (max 100MB)`);
      return isValidType && isValidSize;
    });
    setUploadedMedia((prev) => [...prev, ...validFiles]);
    const urls = validFiles.map((f) => URL.createObjectURL(f));
    setMediaPreviewUrls((prev) => [...prev, ...urls]);
    setPostDraft((prev) => ({ ...prev, media: [...prev.media, ...validFiles] }));
  };

  const handleRemoveMedia = (idx: number) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== idx));
    setMediaPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
    setPostDraft((prev) => ({ ...prev, media: prev.media.filter((_, i) => i !== idx) }));
  };

  // AI generation mutations
  const generateAllMutation = trpc.aiPostGeneration.generateForAllPlatforms.useMutation();
  const generateSingleMutation = trpc.aiPostGeneration.generateForPlatform.useMutation();
  const improveMutation = trpc.aiPostGeneration.improvePost.useMutation();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostDraft({ ...postDraft, content: e.target.value });
  };

  const handlePlatformToggle = (platform: string) => {
    setPostDraft((prev) => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platform)
        ? prev.selectedPlatforms.filter((p) => p !== platform)
        : [...prev.selectedPlatforms, platform],
    }));
  };

  const handleSchedulePost = () => {
    if (!postDraft.content.trim()) {
      toast.error("Please write some content for your post");
      return;
    }
    if (postDraft.selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    const scheduledDateTime = new Date(`${postDraft.scheduledAt}T${postDraft.scheduledTime}`);
    const newPost = {
      id: `post-${Date.now()}`,
      content: postDraft.content,
      platforms: postDraft.selectedPlatforms,
      scheduledAt: scheduledDateTime,
      status: "scheduled" as const,
      createdAt: new Date(),
    };

    setPosts([newPost, ...posts]);
    setPostDraft({
      id: "draft-1",
      content: "",
      selectedPlatforms: [],
      scheduledAt: new Date().toISOString().split("T")[0],
      scheduledTime: "09:00",
      media: [],
    });
    toast.success("Post scheduled successfully! 🎉");
  };

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter((p) => p.id !== id));
    toast.success("Post deleted");
  };

  const handleGenerateAllPlatforms = async () => {
    if (!aiTopic.trim()) {
      toast.error("Please enter a topic for AI generation");
      return;
    }
    setIsGeneratingAll(true);
    try {
      const result = await generateAllMutation.mutateAsync({
        topic: aiTopic,
        tone: aiTone,
        niche: aiNiche || undefined,
        includeHashtags: true,
      });
      if (result.success && result.posts) {
        setGeneratedPlatformPosts(result.posts);
        toast.success("AI generated content for all 6 platforms! ✨");
      }
    } catch (error) {
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleGenerateSingle = async (platform: string) => {
    if (!aiTopic.trim()) {
      toast.error("Please enter a topic first");
      return;
    }
    try {
      const result = await generateSingleMutation.mutateAsync({
        topic: aiTopic,
        platform: platform as "twitter" | "instagram" | "linkedin" | "facebook" | "youtube" | "tiktok",
        tone: aiTone,
        niche: aiNiche || undefined,
        includeHashtags: true,
        includeEmoji: true,
      });
      if (result.success) {
        setGeneratedPlatformPosts((prev) => ({ ...prev, [platform]: result.content }));
        toast.success(`Generated ${platform} content! ✨`);
      }
    } catch (error) {
      toast.error(`Failed to generate ${platform} content`);
    }
  };

  const handleImprovePost = async () => {
    if (!postDraft.content.trim()) {
      toast.error("Please write some content first");
      return;
    }
    const platform = postDraft.selectedPlatforms[0] || "twitter";
    try {
      const result = await improveMutation.mutateAsync({
        content: postDraft.content,
        platform: platform as "twitter" | "instagram" | "linkedin" | "facebook" | "youtube" | "tiktok",
        improvementType: "more_engaging",
      });
      if (result.success) {
        setPostDraft((prev) => ({ ...prev, content: result.improvedContent }));
        toast.success("Post improved with AI! ✨");
      }
    } catch (error) {
      toast.error("Failed to improve post");
    }
  };

  const handleUseGeneratedContent = (platform: string) => {
    const content = generatedPlatformPosts[platform];
    if (content) {
      setPostDraft((prev) => ({
        ...prev,
        content,
        selectedPlatforms: prev.selectedPlatforms.includes(platform)
          ? prev.selectedPlatforms
          : [...prev.selectedPlatforms, platform],
      }));
      setActiveTab("create");
      toast.success(`Using ${platform} content in editor`);
    }
  };

  const handleCopyContent = async (platform: string) => {
    const content = generatedPlatformPosts[platform];
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
      toast.success("Copied to clipboard!");
    }
  };

  const contentLength = postDraft.content.length;
  const charLimit = postDraft.selectedPlatforms.length > 0
    ? Math.min(...postDraft.selectedPlatforms.map(p => PLATFORM_CHAR_LIMITS[p] || 1500))
    : 1500;
  const charPercentage = (contentLength / charLimit) * 100;

  const platformList = ["twitter", "instagram", "linkedin", "facebook", "youtube", "tiktok"];
  const platformLabels: Record<string, string> = {
    twitter: "Twitter/X",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    facebook: "Facebook",
    youtube: "YouTube",
    tiktok: "TikTok",
  };
  const platformEmojis: Record<string, string> = {
    twitter: "🐦",
    instagram: "📸",
    linkedin: "💼",
    facebook: "👥",
    youtube: "▶️",
    tiktok: "🎵",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Post Scheduling</h1>
          <p className="text-purple-200">
            Create, generate with AI, and schedule posts across all your social media platforms
          </p>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm">Total Posts</p>
                  <p className="text-3xl font-bold text-white">{mockAnalytics.totalPosts}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-blue-500/20 hover:border-blue-500/50 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm">Posted Today</p>
                  <p className="text-3xl font-bold text-white">{mockAnalytics.postedToday}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-300 text-sm">Scheduled This Week</p>
                  <p className="text-3xl font-bold text-white">{mockAnalytics.scheduledForWeek}</p>
                </div>
                <Calendar className="w-8 h-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-green-500/20 hover:border-green-500/50 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm">Avg Engagement</p>
                  <p className="text-3xl font-bold text-white">{mockAnalytics.averageEngagement.toLocaleString()}</p>
                </div>
                <Heart className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-purple-500/20">
            <TabsTrigger value="create" className="data-[state=active]:bg-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </TabsTrigger>
            <TabsTrigger value="ai-generate" className="data-[state=active]:bg-purple-600">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-purple-600">
              <Clock className="w-4 h-4 mr-2" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Create Post Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Post Editor */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-slate-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white">Create New Post</CardTitle>
                    <CardDescription className="text-purple-200">
                      Write your content and select platforms to post to
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Content Editor */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Post Content</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleImprovePost}
                          disabled={!postDraft.content.trim() || improveMutation.isPending}
                          className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/20 text-xs"
                        >
                          {improveMutation.isPending ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Wand2 className="w-3 h-3 mr-1" />
                          )}
                          AI Improve
                        </Button>
                      </div>
                      <Textarea
                        placeholder="What's on your mind? Share your thoughts, updates, or news... Or use the AI Generate tab to create content automatically!"
                        value={postDraft.content}
                        onChange={handleContentChange}
                        className="min-h-40 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-500"
                      />
                      <div className="flex justify-between items-center text-sm">
                        <span className={`${contentLength > charLimit ? "text-red-400" : "text-purple-300"}`}>
                          {contentLength} / {charLimit} characters
                          {postDraft.selectedPlatforms.length > 0 && (
                            <span className="text-xs ml-1 opacity-70">
                              (limit for selected platforms)
                            </span>
                          )}
                        </span>
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              charPercentage > 100 ? "bg-red-500" : charPercentage > 90 ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(charPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Media Upload Toggle */}
                    <div className="space-y-3">
                      <Label className="text-white">Media (Optional)</Label>
                      <div className="flex gap-2">
                        {(["none", "upload", "ai"] as const).map((mode) => (
                          <Button
                            key={mode}
                            size="sm"
                            variant={mediaMode === mode ? "default" : "outline"}
                            onClick={() => setMediaMode(mode)}
                            className={mediaMode === mode ? "bg-purple-600 text-white" : "border-purple-500/30 text-purple-200 hover:bg-purple-500/10"}
                          >
                            {mode === "none" ? "No Media" : mode === "upload" ? "📁 Upload from Gallery" : "🤖 AI Generate"}
                          </Button>
                        ))}
                      </div>
                      {mediaMode === "upload" && (
                        <div className="space-y-3">
                          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-purple-500/40 rounded-lg cursor-pointer bg-slate-700/30 hover:bg-slate-700/50 transition-all">
                            <div className="flex flex-col items-center">
                              <span className="text-2xl mb-1">📎</span>
                              <span className="text-purple-200 text-sm">Click to upload images or videos</span>
                              <span className="text-purple-400 text-xs">JPG, PNG, MP4, MOV, WEBM (max 100MB)</span>
                            </div>
                            <input
                              type="file"
                              multiple
                              accept="image/*,video/*"
                              className="hidden"
                              onChange={handleMediaUpload}
                            />
                          </label>
                          {mediaPreviewUrls.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {mediaPreviewUrls.map((url, idx) => (
                                <div key={idx} className="relative group">
                                  {uploadedMedia[idx]?.type.startsWith("video/") ? (
                                    <video src={url} className="w-20 h-20 object-cover rounded-lg border border-purple-500/30" />
                                  ) : (
                                    <img src={url} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-purple-500/30" />
                                  )}
                                  <button
                                    onClick={() => handleRemoveMedia(idx)}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {mediaMode === "ai" && (
                        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                          <p className="text-purple-200 text-sm">🤖 AI will generate an image based on your post content when you schedule.</p>
                          <p className="text-purple-400 text-xs mt-1">Image generation happens automatically using your post text as the prompt.</p>
                        </div>
                      )}
                    </div>

                    {/* Platform Selection */}
                    <div className="space-y-3">
                      <Label className="text-white">Select Platforms</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {mockAccounts.map((account) => (
                          <button
                            key={account.id}
                            onClick={() => handlePlatformToggle(account.platform)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              postDraft.selectedPlatforms.includes(account.platform)
                                ? `border-purple-500 bg-purple-500/20`
                                : `border-slate-600 bg-slate-700/30 hover:border-purple-500/50`
                            }`}
                          >
                            <div className="flex items-center gap-2 justify-center">
                              <span className="text-2xl">{account.avatar}</span>
                              <span className="text-sm font-medium text-white">{account.displayName}</span>
                            </div>
                            {postDraft.selectedPlatforms.includes(account.platform) && (
                              <CheckCircle2 className="w-4 h-4 text-purple-400 mx-auto mt-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Schedule Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Date</Label>
                        <Input
                          type="date"
                          value={postDraft.scheduledAt}
                          onChange={(e) => setPostDraft({ ...postDraft, scheduledAt: e.target.value })}
                          className="bg-slate-700/50 border-purple-500/30 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Time</Label>
                        <Input
                          type="time"
                          value={postDraft.scheduledTime}
                          onChange={(e) => setPostDraft({ ...postDraft, scheduledTime: e.target.value })}
                          className="bg-slate-700/50 border-purple-500/30 text-white"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleSchedulePost}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Schedule Post
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPostDraft({
                          id: "draft-1",
                          content: "",
                          selectedPlatforms: [],
                          scheduledAt: new Date().toISOString().split("T")[0],
                          scheduledTime: "09:00",
                          media: [],
                        })}
                        className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
                      >
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <Card className="bg-slate-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {postDraft.content ? (
                      <div className="space-y-4">
                        {postDraft.selectedPlatforms.length > 0 ? (
                          postDraft.selectedPlatforms.map((platform) => {
                            const account = mockAccounts.find((a) => a.platform === platform);
                            const limit = PLATFORM_CHAR_LIMITS[platform] || 280;
                            const isOverLimit = postDraft.content.length > limit;
                            return (
                              <div key={platform} className={`p-4 bg-slate-700/50 rounded-lg border ${isOverLimit ? "border-red-500/50" : "border-purple-500/20"}`}>
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-2xl">{account?.avatar}</span>
                                  <div>
                                    <p className="text-sm font-medium text-white">{account?.displayName}</p>
                                    <p className="text-xs text-purple-300">{account?.username}</p>
                                  </div>
                                  {isOverLimit && (
                                    <Badge className="ml-auto bg-red-500/20 text-red-300 border-red-500/50 text-xs">
                                      Over limit
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-purple-100 line-clamp-4">{postDraft.content}</p>
                                <p className="text-xs text-purple-400 mt-2">{postDraft.content.length}/{limit} chars</p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-purple-300">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Select platforms to see preview</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-purple-300">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Start typing to see preview</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Best Time to Post */}
                <Card className="bg-slate-800/50 border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      Best Time to Post
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-300">{mockAnalytics.bestTimeToPost}</p>
                    <p className="text-xs text-purple-300 mt-2">Based on your audience activity</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI Generate Tab */}
          <TabsContent value="ai-generate" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Content Generator
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Generate platform-optimized content for all 6 social media platforms at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 space-y-2">
                    <Label className="text-white">Topic / Idea *</Label>
                    <Input
                      placeholder="e.g. New product launch, tips for productivity..."
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Tone</Label>
                    <Select value={aiTone} onValueChange={(v) => setAiTone(v as typeof aiTone)}>
                      <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casual">Casual & Friendly</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="humorous">Humorous & Fun</SelectItem>
                        <SelectItem value="inspirational">Inspirational</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Niche (optional)</Label>
                    <Input
                      placeholder="e.g. fitness, tech, fashion..."
                      value={aiNiche}
                      onChange={(e) => setAiNiche(e.target.value)}
                      className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateAllPlatforms}
                  disabled={isGeneratingAll || !aiTopic.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                >
                  {isGeneratingAll ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating content for all platforms...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate for All 6 Platforms at Once
                    </>
                  )}
                </Button>

                {/* Generated Content Display */}
                {Object.keys(generatedPlatformPosts).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      Generated Content — Ready to Use!
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {platformList.map((platform) => {
                        const content = generatedPlatformPosts[platform];
                        const limit = PLATFORM_CHAR_LIMITS[platform];
                        const isCopied = copiedPlatform === platform;
                        return (
                          <Card key={platform} className="bg-slate-700/50 border-purple-500/20">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{platformEmojis[platform]}</span>
                                  <span className="text-white font-medium">{platformLabels[platform]}</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleGenerateSingle(platform)}
                                    disabled={generateSingleMutation.isPending}
                                    className="text-purple-300 hover:text-white hover:bg-purple-500/20 h-7 w-7 p-0"
                                    title="Regenerate"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopyContent(platform)}
                                    className="text-purple-300 hover:text-white hover:bg-purple-500/20 h-7 w-7 p-0"
                                    title="Copy"
                                  >
                                    {isCopied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {content ? (
                                <>
                                  <p className="text-purple-100 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs ${content.length > limit ? "text-red-400" : "text-purple-400"}`}>
                                      {content.length}/{limit} chars
                                    </span>
                                    <Button
                                      size="sm"
                                      onClick={() => handleUseGeneratedContent(platform)}
                                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7"
                                    >
                                      Use This →
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div className="text-center py-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleGenerateSingle(platform)}
                                    disabled={generateSingleMutation.isPending || !aiTopic.trim()}
                                    className="text-purple-300 hover:text-white"
                                  >
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    Generate for {platformLabels[platform]}
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty state - show platform cards for individual generation */}
                {Object.keys(generatedPlatformPosts).length === 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {platformList.map((platform) => (
                      <Card key={platform} className="bg-slate-700/30 border-purple-500/10 hover:border-purple-500/30 transition cursor-pointer"
                        onClick={() => aiTopic.trim() && handleGenerateSingle(platform)}>
                        <CardContent className="pt-4 pb-4 text-center">
                          <span className="text-3xl">{platformEmojis[platform]}</span>
                          <p className="text-white text-sm font-medium mt-2">{platformLabels[platform]}</p>
                          <p className="text-purple-400 text-xs mt-1">Max {PLATFORM_CHAR_LIMITS[platform]} chars</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Posts Tab */}
          <TabsContent value="scheduled" className="space-y-4">
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {post.platforms.map((platform) => {
                              const account = mockAccounts.find((a) => a.platform === platform);
                              return (
                                <Badge key={platform} className={`bg-gradient-to-r ${getPlatformColor(platform)} text-white`}>
                                  {account?.avatar} {account?.displayName}
                                </Badge>
                              );
                            })}
                          </div>
                          <p className="text-white line-clamp-2">{post.content}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-purple-300">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {post.status === "posted"
                              ? `Posted ${formatScheduleTime(new Date(post.postedAt || post.scheduledAt))}`
                              : `Scheduled ${formatScheduleTime(new Date(post.scheduledAt))}`}
                          </span>
                        </div>
                        {post.status === "posted" && post.engagement && (
                          <>
                            <div className="flex items-center gap-2">
                              <Heart className="w-4 h-4" />
                              <span>{post.engagement.likes.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.engagement.comments}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Share2 className="w-4 h-4" />
                              <span>{post.engagement.shares}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              <span>{post.engagement.views.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {post.status === "scheduled" && (
                          <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/50">
                            <Clock className="w-3 h-3 mr-1" />Scheduled
                          </Badge>
                        )}
                        {post.status === "posted" && (
                          <Badge className="bg-green-500/20 text-green-300 border border-green-500/50">
                            <CheckCircle2 className="w-3 h-3 mr-1" />Posted
                          </Badge>
                        )}
                        {post.status === "failed" && (
                          <Badge className="bg-red-500/20 text-red-300 border border-red-500/50">
                            <AlertCircle className="w-3 h-3 mr-1" />Failed
                          </Badge>
                        )}
                        {post.status === "posted" && post.engagement && (
                          <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/50 ml-auto">
                            {getEngagementRate(post)}% engagement
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Top Performing Post</CardTitle>
                  <CardDescription className="text-purple-200">Your most engaged post</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white line-clamp-3">{mockAnalytics.topPerformingPost.content}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-purple-300 mb-1">Engagement Rate</p>
                      <p className="text-2xl font-bold text-white">{getEngagementRate(mockAnalytics.topPerformingPost)}%</p>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-purple-300 mb-1">Total Reach</p>
                      <p className="text-2xl font-bold text-white">{mockAnalytics.topPerformingPost.engagement?.views.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Platform Performance</CardTitle>
                  <CardDescription className="text-purple-200">Average engagement by platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{account.avatar}</span>
                        <span className="text-sm text-white">{account.displayName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-300" />
                        <span className="text-sm text-purple-300">{account.followers.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Recommended Posting Schedule</CardTitle>
                <CardDescription className="text-purple-200">Optimal times to post for maximum engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                    <div key={day} className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/20 text-center">
                      <p className="text-sm font-medium text-white mb-2">{day}</p>
                      <p className="text-xs text-purple-300">{["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM"][idx]}</p>
                      <div className="mt-2 h-12 bg-purple-500/20 rounded flex items-center justify-center">
                        <span className="text-xs text-purple-300">{[72, 85, 68, 91, 78, 55, 62][idx]}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function PostScheduling() {
  return (
    <DashboardLayout>
      <PostSchedulingContent />
    </DashboardLayout>
  );
}
