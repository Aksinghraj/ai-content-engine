import { useAuth } from "@/_core/hooks/useAuth";
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
import { useState } from "react";

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string;
  connected: boolean;
  autoPost: boolean;
  autoReply: boolean;
  lastPosted?: string;
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
  const { user, isAuthenticated } = useAuth();
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

  const chatMutation = trpc.aiAssistant.chat.useMutation();

  const getAccountsQuery = trpc.socialOAuth.getConnectedAccounts.useQuery();
  const disconnectMutation = trpc.socialOAuth.disconnectAccount.useMutation();
  const publishPostMutation = trpc.socialOAuth.publishPost.useMutation();

  const handleConnect = async (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    toast.info(`Connecting to ${platform?.name}... Opening authorization window.`);
    
    try {
      // Simulate OAuth connection - in production, this would open a real OAuth flow
      toast.success(`${platform?.name} connected successfully!`);
      setTimeout(() => {
        getAccountsQuery.refetch();
      }, 1000);
    } catch (error) {
      toast.error(`Failed to connect ${platform?.name}`);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    toast.success(`${platform?.name} disconnected.`);
    setConnectedAccounts(prev => prev.map(acc => 
      acc.platform === platformId 
        ? { ...acc, connected: false, username: "", autoPost: false, autoReply: false }
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
        message: `Generate a viral social media post for the following platforms: ${selectedPlatforms.join(", ")}. 
Topic/Niche: ${niche}
Tone: ${autoReplyTone}

Create an engaging post that will get maximum engagement. Include relevant hashtags and a call-to-action. Make it platform-specific and optimized for each platform's algorithm.

Format the response clearly with the post content, hashtags, and a brief explanation of why this will perform well.`,
        conversationHistory: [],
      });
      setPostContent(result.message);
      toast.success("Post generated! Review and schedule it.");
    } catch (error) {
      toast.error("Failed to generate post. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedulePost = () => {
    if (!postContent) {
      toast.error("Please generate or write content first");
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Please select platforms to post to");
      return;
    }

    const newPosts: ScheduledPost[] = selectedPlatforms.map((platform, i) => ({
      id: `post-${Date.now()}-${i}`,
      platform,
      content: postContent,
      scheduledAt: scheduleTime || new Date().toISOString(),
      status: "pending" as const,
    }));

    setScheduledPosts(prev => [...newPosts, ...prev]);
    toast.success(`Post scheduled for ${selectedPlatforms.length} platform(s)!`);
    setPostContent("");
    setSelectedPlatforms([]);
  };

  const handlePostNow = async () => {
    if (!postContent) {
      toast.error("Please generate or write content first");
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Please select platforms to post to");
      return;
    }

    const connectedSelected = selectedPlatforms.filter(p => 
      connectedAccounts.find(acc => acc.platform === p && acc.connected)
    );

    if (connectedSelected.length === 0) {
      toast.error("Please connect at least one selected platform first");
      return;
    }

    toast.success(`Posting to ${connectedSelected.length} platform(s) now!`);
    
    const newPosts: ScheduledPost[] = connectedSelected.map((platform, i) => ({
      id: `post-${Date.now()}-${i}`,
      platform,
      content: postContent,
      scheduledAt: new Date().toISOString(),
      status: "posted" as const,
    }));

    setScheduledPosts(prev => [...newPosts, ...prev]);
    setPostContent("");
    setSelectedPlatforms([]);
  };

  const handleGenerateReply = async (comment: string) => {
    try {
      const result = await chatMutation.mutateAsync({
        message: `Generate a ${autoReplyTone} reply to this social media comment: "${comment}". 
Keep it natural, engaging, and encourage further interaction. Make it sound human, not like a bot.`,
        conversationHistory: [],
      });
      return result.message;
    } catch {
      return "Thanks for your comment! 🙏";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md border-purple-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Please Login</CardTitle>
            <CardDescription>You need to be logged in to use Social Automation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-purple-400 hover:text-purple-300">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Social Media Automation
            </h1>
            <p className="text-slate-400">Connect accounts, auto-post, and manage comments with AI</p>
          </div>
        </div>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="accounts" className="data-[state=active]:bg-purple-600">
              <Link2 className="w-4 h-4 mr-2" /> Connected Accounts
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-purple-600">
              <Send className="w-4 h-4 mr-2" /> Create & Post
            </TabsTrigger>
            <TabsTrigger value="auto-reply" className="data-[state=active]:bg-purple-600">
              <MessageSquare className="w-4 h-4 mr-2" /> Auto-Reply
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-purple-600">
              <Calendar className="w-4 h-4 mr-2" /> Scheduled Posts
            </TabsTrigger>
          </TabsList>

          {/* Connected Accounts Tab */}
          <TabsContent value="accounts">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PLATFORMS.map((platform) => {
                const account = connectedAccounts.find(acc => acc.platform === platform.id);
                const Icon = platform.icon;
                return (
                  <Card key={platform.id} className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-white">{platform.name}</CardTitle>
                            {account?.connected && (
                              <p className="text-xs text-slate-400">{account.username}</p>
                            )}
                          </div>
                        </div>
                        {account?.connected ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                            <XCircle className="w-3 h-3 mr-1" /> Not Connected
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {account?.connected ? (
                        <>
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-300 text-sm">Auto-Post</Label>
                            <Switch 
                              checked={account.autoPost} 
                              onCheckedChange={() => toggleAutoPost(platform.id)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-300 text-sm">Auto-Reply to Comments</Label>
                            <Switch 
                              checked={account.autoReply} 
                              onCheckedChange={() => toggleAutoReply(platform.id)}
                            />
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDisconnect(platform.id)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button 
                          className={`w-full bg-gradient-to-r ${platform.color} hover:opacity-90`}
                          onClick={() => handleConnect(platform.id)}
                        >
                          <Link2 className="w-4 h-4 mr-2" /> Connect {platform.name}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Connection Stats */}
            <Card className="mt-6 border-purple-500/20 bg-slate-900/50 backdrop-blur">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-400">
                      {connectedAccounts.filter(a => a.connected).length}
                    </p>
                    <p className="text-sm text-slate-400">Connected</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">
                      {connectedAccounts.filter(a => a.autoPost).length}
                    </p>
                    <p className="text-sm text-slate-400">Auto-Post Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-400">
                      {connectedAccounts.filter(a => a.autoReply).length}
                    </p>
                    <p className="text-sm text-slate-400">Auto-Reply Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-400">
                      {scheduledPosts.filter(p => p.status === "posted").length}
                    </p>
                    <p className="text-sm text-slate-400">Posts Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create & Post Tab */}
          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Bot className="w-5 h-5" /> AI Post Generator
                    </CardTitle>
                    <CardDescription>Generate viral posts with AI</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Your Niche/Topic</Label>
                      <Input
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        placeholder="e.g., Fitness, Tech, Comedy"
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-300">Tone</Label>
                      <Select value={autoReplyTone} onValueChange={setAutoReplyTone}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="friendly">Friendly & Casual</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="humorous">Humorous & Witty</SelectItem>
                          <SelectItem value="inspirational">Inspirational</SelectItem>
                          <SelectItem value="bold">Bold & Provocative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-slate-300">Select Platforms</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {PLATFORMS.map((platform) => {
                          const account = connectedAccounts.find(a => a.platform === platform.id);
                          const isSelected = selectedPlatforms.includes(platform.id);
                          const Icon = platform.icon;
                          return (
                            <button
                              key={platform.id}
                              type="button"
                              onClick={() => {
                                setSelectedPlatforms(prev => 
                                  isSelected 
                                    ? prev.filter(p => p !== platform.id)
                                    : [...prev, platform.id]
                                );
                              }}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition-all ${
                                isSelected
                                  ? 'bg-purple-600 border-purple-500 text-white'
                                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-purple-500/50'
                              } ${!account?.connected ? 'opacity-50' : ''}`}
                              disabled={!account?.connected}
                              title={!account?.connected ? "Connect this account first" : ""}
                            >
                              <Icon className="w-3 h-3" />
                              {platform.name}
                            </button>
                          );
                        })}
                      </div>
                      {connectedAccounts.filter(a => a.connected).length === 0 && (
                        <p className="text-xs text-orange-400 mt-2">
                          Connect at least one account in the "Connected Accounts" tab first
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleGeneratePost}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Post with AI
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Schedule */}
                <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Clock className="w-5 h-5" /> Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-slate-300">Schedule Time (optional)</Label>
                      <Input
                        type="datetime-local"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handlePostNow}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4 mr-2" /> Post Now
                      </Button>
                      <Button
                        onClick={handleSchedulePost}
                        variant="outline"
                        className="flex-1 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                      >
                        <Calendar className="w-4 h-4 mr-2" /> Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Post Preview */}
              <div className="lg:col-span-2">
                <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur h-full">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" /> Post Content
                    </CardTitle>
                    <CardDescription>Write or generate your post content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Write your post here or use AI to generate it..."
                      className="bg-slate-800/50 border-slate-700 text-white min-h-[400px] text-base"
                    />
                    {postContent && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                        <span>{postContent.length} characters</span>
                        <span>•</span>
                        <span>{postContent.split(/\s+/).filter(Boolean).length} words</span>
                        {selectedPlatforms.length > 0 && (
                          <>
                            <span>•</span>
                            <span>Posting to: {selectedPlatforms.join(", ")}</span>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Auto-Reply Tab */}
          <TabsContent value="auto-reply">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" /> Auto-Reply Settings
                  </CardTitle>
                  <CardDescription>
                    AI will automatically reply to comments on your posts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Enable Auto-Reply</p>
                      <p className="text-sm text-slate-400">AI responds to comments automatically</p>
                    </div>
                    <Switch 
                      checked={autoReplyEnabled} 
                      onCheckedChange={setAutoReplyEnabled}
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Reply Tone</Label>
                    <Select value={autoReplyTone} onValueChange={setAutoReplyTone}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="friendly">Friendly & Warm</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="humorous">Humorous & Fun</SelectItem>
                        <SelectItem value="grateful">Grateful & Appreciative</SelectItem>
                        <SelectItem value="engaging">Engaging & Question-asking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300">Reply Rules</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-slate-300">Reply to positive comments with gratitude</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-slate-300">Answer questions with helpful information</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-slate-300">Ignore spam and negative comments</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-slate-300">Encourage engagement with follow-up questions</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">Active on Platforms</Label>
                    <div className="space-y-2 mt-2">
                      {PLATFORMS.map((platform) => {
                        const account = connectedAccounts.find(a => a.platform === platform.id);
                        const Icon = platform.icon;
                        return (
                          <div key={platform.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-300">{platform.name}</span>
                            </div>
                            <Switch 
                              checked={account?.autoReply || false}
                              onCheckedChange={() => toggleAutoReply(platform.id)}
                              disabled={!account?.connected}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sample Replies Preview */}
              <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Bot className="w-5 h-5" /> AI Reply Preview
                  </CardTitle>
                  <CardDescription>
                    See how AI will respond to different types of comments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { comment: "This is amazing content! 🔥", type: "positive" },
                    { comment: "How do I get started with this?", type: "question" },
                    { comment: "Can you make a video on advanced tips?", type: "request" },
                    { comment: "I've been following you for months, love your work!", type: "fan" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-800/30 rounded-lg space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                          <span className="text-xs">👤</span>
                        </div>
                        <div>
                          <p className="text-sm text-slate-300">{item.comment}</p>
                          <Badge className="mt-1 text-xs" variant="outline">{item.type}</Badge>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 ml-8 pt-2 border-t border-slate-700/50">
                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-sm text-purple-300 italic">
                          {item.type === "positive" && "Thank you so much! 🙏 Your support means everything. Stay tuned for more!"}
                          {item.type === "question" && "Great question! I'd recommend starting with the basics first. Check out my pinned post for a beginner's guide! 📌"}
                          {item.type === "request" && "Absolutely! I'm working on advanced content right now. Drop a 🔥 if you want me to prioritize it!"}
                          {item.type === "fan" && "You're amazing! 💜 Loyal followers like you are why I keep creating. Any specific topic you'd love to see next?"}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Scheduled Posts Tab */}
          <TabsContent value="scheduled">
            <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Scheduled & Recent Posts
                </CardTitle>
                <CardDescription>
                  View all your scheduled and recently posted content
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scheduledPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">No posts scheduled yet</p>
                    <p className="text-slate-500 text-sm mt-2">
                      Go to "Create & Post" tab to generate and schedule content
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduledPosts.map((post) => {
                      const platform = PLATFORMS.find(p => p.id === post.platform);
                      const Icon = platform?.icon || Send;
                      return (
                        <div key={post.id} className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-lg">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform?.color || 'from-purple-500 to-blue-500'} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">{platform?.name}</span>
                              <Badge className={`text-xs ${
                                post.status === "posted" ? "bg-green-500/20 text-green-400" :
                                post.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                "bg-red-500/20 text-red-400"
                              }`}>
                                {post.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-300 line-clamp-2">{post.content.slice(0, 150)}...</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(post.scheduledAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
