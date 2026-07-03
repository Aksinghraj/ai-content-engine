import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bold,
  Italic,
  Underline,
  Link2,
  Image,
  Smile,
  Hash,
  AtSign,
  Send,
  Eye,
  Settings,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Sparkles,
  BarChart3,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Plus,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";

interface Platform {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
  maxLength: number;
  characterCount: number;
  optimizationTips: string[];
}

interface PostDraft {
  id: number;
  title: string;
  content: string;
  platforms: string[];
  scheduledTime?: string;
  hashtags: string[];
  mentions: string[];
  mediaCount: number;
  estimatedReach: number;
  estimatedEngagement: number;
  viralScore: number;
  createdAt: string;
}

export default function CreatePostAdvanced() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [newMention, setNewMention] = useState("");
  const [activeTab, setActiveTab] = useState("editor");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: "instagram",
      name: "Instagram",
      icon: "📸",
      selected: true,
      maxLength: 2200,
      characterCount: 0,
      optimizationTips: [
        "Use 20-30 hashtags for maximum reach",
        "Post between 11am-3pm for best engagement",
        "Include call-to-action in caption",
      ],
    },
    {
      id: "twitter",
      name: "Twitter/X",
      icon: "𝕏",
      selected: true,
      maxLength: 280,
      characterCount: 0,
      optimizationTips: [
        "Keep it concise and punchy",
        "Use 1-2 hashtags maximum",
        "Include link for traffic",
      ],
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: "💼",
      selected: false,
      maxLength: 3000,
      characterCount: 0,
      optimizationTips: [
        "Share professional insights",
        "Use industry-specific hashtags",
        "Encourage meaningful comments",
      ],
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: "👥",
      selected: false,
      maxLength: 63206,
      characterCount: 0,
      optimizationTips: [
        "Post with images for 2x engagement",
        "Ask questions to boost comments",
        "Post on weekdays 1-3pm",
      ],
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: "🎵",
      selected: false,
      maxLength: 2200,
      characterCount: 0,
      optimizationTips: [
        "Hook viewers in first 3 seconds",
        "Use trending sounds",
        "Post 3-5 times per week",
      ],
    },
  ]);

  const [drafts, setDrafts] = useState<PostDraft[]>([
    {
      id: 1,
      title: "Summer Campaign Launch",
      content: "Excited to announce our summer campaign! 🌞 Join us for exclusive deals and amazing content.",
      platforms: ["instagram", "twitter"],
      scheduledTime: "2026-07-05T14:00:00Z",
      hashtags: ["#summer", "#campaign", "#exclusive"],
      mentions: ["@partner1", "@partner2"],
      mediaCount: 2,
      estimatedReach: 15000,
      estimatedEngagement: 2400,
      viralScore: 7.8,
      createdAt: "2026-07-03T10:30:00Z",
    },
  ]);

  const selectedPlatforms = platforms.filter((p) => p.selected);
  const totalCharacters = content.length;
  const estimatedReach = selectedPlatforms.length * 5000;
  const estimatedEngagement = Math.round(estimatedReach * 0.16);
  const viralScore = Math.min(10, (totalCharacters / 100) * 0.5 + selectedPlatforms.length * 1.5);

  const handleAddHashtag = () => {
    if (newHashtag.trim()) {
      setHashtags([...hashtags, newHashtag.trim()]);
      setNewHashtag("");
    }
  };

  const handleAddMention = () => {
    if (newMention.trim()) {
      setMentions([...mentions, newMention.trim()]);
      setNewMention("");
    }
  };

  const handleRemoveHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index));
  };

  const handleRemoveMention = (index: number) => {
    setMentions(mentions.filter((_, i) => i !== index));
  };

  const handleTogglePlatform = (platformId: string) => {
    setPlatforms(
      platforms.map((p) =>
        p.id === platformId ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const handleSaveDraft = () => {
    const newDraft: PostDraft = {
      id: drafts.length + 1,
      title: title || "Untitled Post",
      content,
      platforms: selectedPlatforms.map((p) => p.id),
      hashtags,
      mentions,
      mediaCount: 0,
      estimatedReach,
      estimatedEngagement,
      viralScore,
      createdAt: new Date().toISOString(),
    };
    setDrafts([...drafts, newDraft]);
    toast.success("Draft saved successfully!");
  };

  const handlePublish = () => {
    toast.success("Post published to " + selectedPlatforms.map((p) => p.name).join(", "));
  };

  const handleSchedule = () => {
    toast.success("Post scheduled successfully!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Create Post</h1>
          <p className="text-purple-200">
            Advanced content creation with AI optimization and multi-platform publishing
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Drafts ({drafts.length})
            </TabsTrigger>
          </TabsList>

          {/* Editor Tab */}
          <TabsContent value="editor" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Editor */}
              <div className="lg:col-span-2 space-y-4">
                {/* Title */}
                <Card className="bg-slate-800/50 border-slate-700/50 p-4">
                  <input
                    type="text"
                    placeholder="Post Title (Optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xl font-semibold bg-transparent text-white placeholder-slate-400 focus:outline-none"
                  />
                </Card>

                {/* Rich Text Editor */}
                <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
                  {/* Toolbar */}
                  <div className="border-b border-slate-700/50 p-3 flex flex-wrap gap-2 bg-slate-700/20">
                    <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white">
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white">
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white">
                      <Underline className="w-4 h-4" />
                    </Button>
                    <div className="w-px bg-slate-700/50" />
                    <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white">
                      <Link2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white">
                      <Image className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-300 hover:text-white"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white">
                      <Hash className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white">
                      <AtSign className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Editor Area */}
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your post content here... Use @mentions and #hashtags"
                    className="w-full p-4 bg-transparent text-white placeholder-slate-400 focus:outline-none resize-none min-h-[300px]"
                  />

                  {/* Character Count */}
                  <div className="border-t border-slate-700/50 p-3 bg-slate-700/20 flex justify-between items-center text-sm">
                    <span className="text-slate-400">
                      {totalCharacters} characters
                    </span>
                    <div className="flex gap-2">
                      {selectedPlatforms.map((p) => (
                        <span key={p.id} className="text-xs text-slate-400">
                          {p.name}: {totalCharacters}/{p.maxLength}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Hashtags and Mentions */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Hashtags */}
                  <Card className="bg-slate-800/50 border-slate-700/50 p-4 space-y-3">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <Hash className="w-4 h-4 text-purple-400" />
                      Hashtags
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add hashtag"
                        value={newHashtag}
                        onChange={(e) => setNewHashtag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddHashtag()}
                        className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:border-purple-500/50 focus:outline-none text-sm"
                      />
                      <Button size="sm" onClick={handleAddHashtag}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag, idx) => (
                        <Badge
                          key={idx}
                          className="bg-purple-500/20 text-purple-300 border-purple-500/50 cursor-pointer hover:bg-purple-500/30"
                          onClick={() => handleRemoveHashtag(idx)}
                        >
                          {tag} ✕
                        </Badge>
                      ))}
                    </div>
                  </Card>

                  {/* Mentions */}
                  <Card className="bg-slate-800/50 border-slate-700/50 p-4 space-y-3">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <AtSign className="w-4 h-4 text-blue-400" />
                      Mentions
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add mention"
                        value={newMention}
                        onChange={(e) => setNewMention(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddMention()}
                        className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:border-purple-500/50 focus:outline-none text-sm"
                      />
                      <Button size="sm" onClick={handleAddMention}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mentions.map((mention, idx) => (
                        <Badge
                          key={idx}
                          className="bg-blue-500/20 text-blue-300 border-blue-500/50 cursor-pointer hover:bg-blue-500/30"
                          onClick={() => handleRemoveMention(idx)}
                        >
                          {mention} ✕
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Platform Selection */}
                <Card className="bg-slate-800/50 border-slate-700/50 p-4 space-y-3">
                  <h4 className="text-white font-semibold">Select Platforms</h4>
                  <div className="space-y-2">
                    {platforms.map((platform) => (
                      <label
                        key={platform.id}
                        className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-slate-700/30 transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={platform.selected}
                          onChange={() => handleTogglePlatform(platform.id)}
                          className="w-4 h-4 rounded accent-purple-500"
                        />
                        <span className="text-2xl">{platform.icon}</span>
                        <span className="text-white flex-1">{platform.name}</span>
                        {totalCharacters > platform.maxLength && (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                      </label>
                    ))}
                  </div>
                </Card>

                {/* AI Optimization */}
                <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/20 p-4 space-y-3">
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    AI Optimization
                  </h4>
                  <div className="space-y-2 text-sm">
                    {selectedPlatforms.length > 0 &&
                      selectedPlatforms[0].optimizationTips.map((tip, idx) => (
                        <div key={idx} className="flex gap-2 text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                  </div>
                </Card>

                {/* Performance Metrics */}
                <Card className="bg-slate-800/50 border-slate-700/50 p-4 space-y-3">
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    Performance Metrics
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Reach</span>
                      <span className="text-blue-400 font-semibold">{estimatedReach.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Est. Engagement</span>
                      <span className="text-green-400 font-semibold">{estimatedEngagement.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Viral Score</span>
                      <span className="text-purple-400 font-semibold">{viralScore.toFixed(1)}/10</span>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handlePublish}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Publish Now
                  </Button>
                  <Button
                    onClick={handleSchedule}
                    variant="outline"
                    className="w-full"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Post
                  </Button>
                  <Button
                    onClick={handleSaveDraft}
                    variant="outline"
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedPlatforms.map((platform) => (
                <Card key={platform.id} className="bg-slate-800/50 border-slate-700/50 p-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <span className="text-2xl">{platform.icon}</span>
                      {platform.name} Preview
                    </h4>
                    <div className="bg-slate-700/30 p-4 rounded-lg space-y-3 min-h-[300px]">
                      <p className="text-slate-200">{content}</p>
                      {hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {hashtags.map((tag, idx) => (
                            <span key={idx} className="text-purple-400 text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4 text-slate-400 text-sm">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        <span>0</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Drafts Tab */}
          <TabsContent value="drafts" className="space-y-4">
            {drafts.length === 0 ? (
              <Card className="bg-slate-800/30 border-slate-700/50 p-8 text-center">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400">No drafts yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {drafts.map((draft) => (
                  <Card
                    key={draft.id}
                    className="bg-slate-800/50 border-slate-700/50 p-4 hover:border-purple-500/30 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{draft.title}</h4>
                          <p className="text-slate-400 text-sm line-clamp-2">{draft.content}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {draft.platforms.map((p) => (
                          <Badge key={p} className="bg-purple-500/20 text-purple-300">
                            {p}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <p className="text-slate-400">Reach</p>
                          <p className="text-blue-400 font-semibold">{draft.estimatedReach.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Engagement</p>
                          <p className="text-green-400 font-semibold">{draft.estimatedEngagement.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Viral Score</p>
                          <p className="text-purple-400 font-semibold">{draft.viralScore.toFixed(1)}/10</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Created</p>
                          <p className="text-slate-300 font-semibold">{new Date(draft.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
