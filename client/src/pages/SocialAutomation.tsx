import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { OAuthLoginModal } from "@/components/OAuthLoginModal";
import { toast } from "sonner";
import {
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Youtube,
  Link2,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Send,
  MessageSquare,
  Calendar,
  Zap,
  Bot,
  Sparkles,
  Clock,
  TrendingUp,
  Users,
  Share2,
  MessageCircle,
} from "lucide-react";

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string;
  connected: boolean;
  autoPost: boolean;
  autoReply: boolean;
  lastPosted?: string;
  accessToken?: string;
}

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduledAt: string;
  status: "pending" | "posted" | "failed";
}

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "from-pink-500 to-purple-500", domain: "instagram.com" },
  { id: "twitter", name: "Twitter/X", icon: Twitter, color: "from-blue-400 to-blue-600", domain: "twitter.com" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "from-blue-600 to-blue-800", domain: "linkedin.com" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "from-blue-500 to-blue-700", domain: "facebook.com" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "from-red-500 to-red-700", domain: "youtube.com" },
  { id: "tiktok", name: "TikTok", icon: Zap, color: "from-black to-gray-800", domain: "tiktok.com" },
];

export default function SocialAutomation() {
  const [, navigate] = useLocation();
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
    { id: "1", platform: "instagram", username: "", connected: false, autoPost: false, autoReply: false },
    { id: "2", platform: "twitter", username: "", connected: false, autoPost: false, autoReply: false },
    { id: "3", platform: "linkedin", username: "", connected: false, autoPost: false, autoReply: false },
    { id: "4", platform: "facebook", username: "", connected: false, autoPost: false, autoReply: false },
    { id: "5", platform: "youtube", username: "", connected: false, autoPost: false, autoReply: false },
    { id: "6", platform: "tiktok", username: "", connected: false, autoPost: false, autoReply: false },
  ]);

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleTime, setScheduleTime] = useState("");
  const [autoReplyTone, setAutoReplyTone] = useState("friendly");
  const [niche, setNiche] = useState("");
  const [selectedPlatformForLogin, setSelectedPlatformForLogin] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const chatMutation = trpc.aiAssistant.chat.useMutation();

  const handleConnect = (platformId: string) => {
    setSelectedPlatformForLogin(platformId);
    setShowLoginModal(true);
  };

  const handleOAuthLogin = async (email: string, password: string) => {
    if (!selectedPlatformForLogin) return;

    // Simulate OAuth login
    await new Promise(resolve => setTimeout(resolve, 1500));

    const platform = PLATFORMS.find(p => p.id === selectedPlatformForLogin);
    setConnectedAccounts(prev =>
      prev.map(acc =>
        acc.platform === selectedPlatformForLogin
          ? {
              ...acc,
              connected: true,
              username: email.split("@")[0],
              accessToken: `token_${Math.random().toString(36).substr(2, 9)}`,
            }
          : acc
      )
    );

    toast.success(`${platform?.name} connected successfully!`);
    setShowLoginModal(false);
  };

  const handleDisconnect = async (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    toast.success(`${platform?.name} disconnected.`);
    setConnectedAccounts(prev => prev.map(acc => 
      acc.platform === platformId 
        ? { ...acc, connected: false, username: "", autoPost: false, autoReply: false, accessToken: undefined }
        : acc
    ));
  };

  const toggleAutoPost = (platformId: string) => {
    setConnectedAccounts(prev => prev.map(acc => 
      acc.platform === platformId 
        ? { ...acc, autoPost: !acc.autoPost }
        : acc
    ));
  };

  const toggleAutoReply = (platformId: string) => {
    setConnectedAccounts(prev => prev.map(acc => 
      acc.platform === platformId 
        ? { ...acc, autoReply: !acc.autoReply }
        : acc
    ));
  };

  const handleGeneratePost = async () => {
    if (!niche) {
      toast.error("Please enter your niche/topic");
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await chatMutation.mutateAsync({
        message: `Generate a viral ${niche} post for ${selectedPlatforms.join(", ")} with tone: ${autoReplyTone}`,
        conversationHistory: [],
      });

      if (result.success) {
        setPostContent(result.message);
        toast.success("Post generated successfully!");
      }
    } catch (error) {
      toast.error("Failed to generate post");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedulePost = () => {
    if (!postContent) {
      toast.error("Please generate or enter post content");
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }
    if (!scheduleTime) {
      toast.error("Please select a schedule time");
      return;
    }

    selectedPlatforms.forEach(platform => {
      const newPost: ScheduledPost = {
        id: Math.random().toString(36).substr(2, 9),
        platform,
        content: postContent,
        scheduledAt: scheduleTime,
        status: "pending",
      };
      setScheduledPosts(prev => [...prev, newPost]);
    });

    toast.success("Posts scheduled successfully!");
    setPostContent("");
    setScheduleTime("");
    setSelectedPlatforms([]);
  };

  const connectedCount = connectedAccounts.filter(a => a.connected).length;
  const autoPostCount = connectedAccounts.filter(a => a.autoPost).length;
  const autoReplyCount = connectedAccounts.filter(a => a.autoReply).length;
  const totalReach = connectedCount * 50000; // Mock data

  const currentPlatformForLogin = PLATFORMS.find(p => p.id === selectedPlatformForLogin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Social Media Automation</h1>
          <p className="text-gray-400">Connect accounts, auto-post, and manage comments with AI</p>
        </div>

        {/* Professional Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:border-purple-500 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Connected Accounts</p>
                  <p className="text-3xl font-bold text-white mt-2">{connectedCount}</p>
                </div>
                <Users size={32} className="text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:border-green-500 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Auto-Post Active</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{autoPostCount}</p>
                </div>
                <Share2 size={32} className="text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:border-blue-500 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Auto-Reply Active</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{autoReplyCount}</p>
                </div>
                <MessageCircle size={32} className="text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:border-orange-500 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Reach</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">{(totalReach / 1000).toFixed(0)}K</p>
                </div>
                <TrendingUp size={32} className="text-orange-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="connected" className="mb-8">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="connected" className="flex items-center gap-2">
              <Link2 size={18} />
              Connected Accounts
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Sparkles size={18} />
              Create & Post
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Calendar size={18} />
              Scheduled Posts
            </TabsTrigger>
            <TabsTrigger value="replies" className="flex items-center gap-2">
              <MessageSquare size={18} />
              Auto-Reply
            </TabsTrigger>
          </TabsList>

          {/* Connected Accounts Tab */}
          <TabsContent value="connected" className="space-y-6">
            {/* Platform Cards */}
            <div className="grid grid-cols-2 gap-6">
              {PLATFORMS.map(platform => {
                const account = connectedAccounts.find(a => a.platform === platform.id);
                const Icon = platform.icon;

                return (
                  <Card key={platform.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition">
                    <div className={`h-2 bg-gradient-to-r ${platform.color}`} />
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${platform.color}`}>
                            <Icon className="text-white" size={24} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{platform.name}</h3>
                            {account?.connected && (
                              <p className="text-sm text-gray-400">@{account.username}</p>
                            )}
                          </div>
                        </div>
                        {account?.connected ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                            <CheckCircle2 size={14} className="mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                            <XCircle size={14} className="mr-1" />
                            Not Connected
                          </Badge>
                        )}
                      </div>

                      {account?.connected ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Zap size={18} className="text-yellow-400" />
                              <span className="text-sm text-gray-300">Auto-Post</span>
                            </div>
                            <Switch
                              checked={account.autoPost}
                              onCheckedChange={() => toggleAutoPost(platform.id)}
                            />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <MessageSquare size={18} className="text-blue-400" />
                              <span className="text-sm text-gray-300">Auto-Reply</span>
                            </div>
                            <Switch
                              checked={account.autoReply}
                              onCheckedChange={() => toggleAutoReply(platform.id)}
                            />
                          </div>
                          <Button
                            onClick={() => handleDisconnect(platform.id)}
                            variant="outline"
                            className="w-full text-red-400 border-red-500/50 hover:bg-red-500/10"
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleConnect(platform.id)}
                          className={`w-full bg-gradient-to-r ${platform.color} text-white hover:opacity-90 transition`}
                        >
                          <Link2 size={18} className="mr-2" />
                          Connect {platform.name}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Create & Post Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Generate Post Content</CardTitle>
                <CardDescription>AI-powered content generation for your niche</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Your Niche/Topic</Label>
                  <Input
                    placeholder="e.g., Digital Marketing, Fitness, Tech News"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Select Platforms</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map(p => (
                      <Button
                        key={p.id}
                        onClick={() => setSelectedPlatforms(prev =>
                          prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                        )}
                        variant={selectedPlatforms.includes(p.id) ? "default" : "outline"}
                        className="text-sm"
                      >
                        {p.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Tone</Label>
                  <Select value={autoReplyTone} onValueChange={setAutoReplyTone}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="funny">Funny</SelectItem>
                      <SelectItem value="inspiring">Inspiring</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGeneratePost}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="mr-2" />
                      Generate Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {postContent && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Generated Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white min-h-[150px]"
                    placeholder="Edit your post content here..."
                  />

                  <div>
                    <Label className="text-gray-300">Schedule Time</Label>
                    <Input
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <Button
                    onClick={handleSchedulePost}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  >
                    <Calendar size={18} className="mr-2" />
                    Schedule & Post
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Scheduled Posts Tab */}
          <TabsContent value="scheduled" className="space-y-4">
            {scheduledPosts.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6 text-center">
                  <Clock size={48} className="mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No scheduled posts yet</p>
                </CardContent>
              </Card>
            ) : (
              scheduledPosts.map(post => (
                <Card key={post.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge className="mb-2 capitalize">{post.platform}</Badge>
                        <p className="text-gray-300 line-clamp-2">{post.content}</p>
                      </div>
                      <Badge className={post.status === "pending" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}>
                        {post.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">Scheduled: {new Date(post.scheduledAt).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Auto-Reply Tab */}
          <TabsContent value="replies" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Auto-Reply Configuration</CardTitle>
                <CardDescription>Set up AI-powered automatic replies to comments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Reply Tone</Label>
                  <Select value={autoReplyTone} onValueChange={setAutoReplyTone}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Active Auto-Reply on:</h4>
                  <div className="space-y-2">
                    {connectedAccounts
                      .filter(a => a.autoReply && a.connected)
                      .map(account => {
                        const platform = PLATFORMS.find(p => p.id === account.platform);
                        return (
                          <div key={account.id} className="flex items-center gap-2 text-gray-300">
                            <CheckCircle2 size={16} className="text-green-400" />
                            {platform?.name}
                          </div>
                        );
                      })}
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <Bot size={18} className="mr-2" />
                  Save Auto-Reply Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* OAuth Login Modal */}
      {currentPlatformForLogin && (
        <OAuthLoginModal
          platform={currentPlatformForLogin.domain}
          platformName={currentPlatformForLogin.name}
          isOpen={showLoginModal}
          onClose={() => {
            setShowLoginModal(false);
            setSelectedPlatformForLogin(null);
          }}
          onLogin={handleOAuthLogin}
        />
      )}
    </div>
  );
}
