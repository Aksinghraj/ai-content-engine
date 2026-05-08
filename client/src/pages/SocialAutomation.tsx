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
  { id: "instagram", name: "Instagram", icon: Instagram, color: "from-pink-500 to-purple-500" },
  { id: "twitter", name: "Twitter/X", icon: Twitter, color: "from-blue-400 to-blue-600" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "from-blue-600 to-blue-800" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "from-blue-500 to-blue-700" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "from-red-500 to-red-700" },
  { id: "tiktok", name: "TikTok", icon: Zap, color: "from-black to-gray-800" },
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
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [niche, setNiche] = useState("");

  const getLoginUrlQuery = trpc.oauthFlow.getLoginUrl.useQuery(
    { platform: "" },
    { enabled: false }
  );
  const handleCallbackMutation = trpc.oauthFlow.handleCallback.useMutation();
  const chatMutation = trpc.aiAssistant.chat.useMutation();

  // Handle OAuth callback from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const platform = params.get("platform");

    if (code && state && platform) {
      handleCallbackMutation.mutate(
        { platform, code, state },
        {
          onSuccess: (data) => {
            if (data.success) {
              toast.success(`${platform} connected successfully!`);
              setConnectedAccounts(prev =>
                prev.map(acc =>
                  acc.platform === platform
                    ? {
                        ...acc,
                        connected: true,
                        username: `${platform}_user`,
                        accessToken: data.accessToken,
                      }
                    : acc
                )
              );
              // Clean up URL
              window.history.replaceState({}, document.title, window.location.pathname);
            } else {
              toast.error(`Failed to connect ${platform}`);
            }
          },
          onError: () => {
            toast.error("OAuth connection failed");
          },
        }
      );
    }
  }, [handleCallbackMutation]);

  const handleConnect = async (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    
    try {
      const loginUrlData = await fetch(`/api/trpc/oauthFlow.getLoginUrl?input=${JSON.stringify({ platform: platformId })}`)
        .then(r => r.json());

      if (loginUrlData.result?.data?.success) {
        const loginUrl = loginUrlData.result.data.loginUrl;
        // Add platform to redirect URI
        const urlWithPlatform = `${loginUrl}&state=${loginUrlData.result.data.state}&platform=${platformId}`;
        window.open(urlWithPlatform, "_blank", "width=500,height=600");
        toast.info(`Opening ${platform?.name} login...`);
      } else {
        toast.error(`Failed to get login URL for ${platform?.name}`);
      }
    } catch (error) {
      toast.error(`Error connecting to ${platform?.name}`);
      console.error(error);
    }
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
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">{connectedCount}</div>
                    <div className="text-sm text-gray-400">Connected</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{autoPostCount}</div>
                    <div className="text-sm text-gray-400">Auto-Post Active</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{autoReplyCount}</div>
                    <div className="text-sm text-gray-400">Auto-Reply Active</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400">{scheduledPosts.length}</div>
                    <div className="text-sm text-gray-400">Posts Sent</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Cards */}
            <div className="grid grid-cols-2 gap-6">
              {PLATFORMS.map(platform => {
                const account = connectedAccounts.find(a => a.platform === platform.id);
                const Icon = platform.icon;

                return (
                  <Card key={platform.id} className="bg-slate-800 border-slate-700 overflow-hidden">
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
                              <p className="text-sm text-gray-400">{account.username}</p>
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
                          className={`w-full bg-gradient-to-r ${platform.color} text-white hover:opacity-90`}
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
    </div>
  );
}
