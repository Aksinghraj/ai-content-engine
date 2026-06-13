import DashboardLayout from "@/components/DashboardLayout";
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
  Edit2,
  Trash2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  mockAccounts,
  mockScheduledPosts,
  mockAnalytics,
  formatScheduleTime,
  getEngagementRate,
  getPlatformColor,
  getPlatformEmoji,
} from "@/lib/mockData";

interface PostDraft {
  id: string;
  content: string;
  selectedPlatforms: string[];
  scheduledAt: string;
  scheduledTime: string;
  media: File[];
}

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
  const [editingId, setEditingId] = useState<string | null>(null);

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

    const scheduledDateTime = new Date(
      `${postDraft.scheduledAt}T${postDraft.scheduledTime}`
    );

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

  const contentLength = postDraft.content.length;
  const charLimit = 280;
  const charPercentage = (contentLength / charLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Post Scheduling</h1>
          <p className="text-purple-200">
            Create and schedule posts across all your social media platforms
          </p>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm">Total Posts</p>
                  <p className="text-3xl font-bold text-white">
                    {mockAnalytics.totalPosts}
                  </p>
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
                  <p className="text-3xl font-bold text-white">
                    {mockAnalytics.postedToday}
                  </p>
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
                  <p className="text-3xl font-bold text-white">
                    {mockAnalytics.scheduledForWeek}
                  </p>
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
                  <p className="text-3xl font-bold text-white">
                    {mockAnalytics.averageEngagement.toLocaleString()}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-purple-500/20">
            <TabsTrigger value="create" className="data-[state=active]:bg-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
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
                      <Label className="text-white">Post Content</Label>
                      <Textarea
                        placeholder="What's on your mind? Share your thoughts, updates, or news..."
                        value={postDraft.content}
                        onChange={handleContentChange}
                        className="min-h-32 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-500"
                      />
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-purple-300">
                          {contentLength} / {charLimit} characters
                        </span>
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              charPercentage > 90
                                ? "bg-red-500"
                                : charPercentage > 70
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(charPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
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
                              <span className="text-sm font-medium text-white">
                                {account.displayName}
                              </span>
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
                          onChange={(e) =>
                            setPostDraft({
                              ...postDraft,
                              scheduledAt: e.target.value,
                            })
                          }
                          className="bg-slate-700/50 border-purple-500/30 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Time</Label>
                        <Input
                          type="time"
                          value={postDraft.scheduledTime}
                          onChange={(e) =>
                            setPostDraft({
                              ...postDraft,
                              scheduledTime: e.target.value,
                            })
                          }
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
                        onClick={() =>
                          setPostDraft({
                            id: "draft-1",
                            content: "",
                            selectedPlatforms: [],
                            scheduledAt: new Date().toISOString().split("T")[0],
                            scheduledTime: "09:00",
                            media: [],
                          })
                        }
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
                            const account = mockAccounts.find(
                              (a) => a.platform === platform
                            );
                            return (
                              <div
                                key={platform}
                                className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/20"
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-2xl">{account?.avatar}</span>
                                  <div>
                                    <p className="text-sm font-medium text-white">
                                      {account?.displayName}
                                    </p>
                                    <p className="text-xs text-purple-300">
                                      {account?.username}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-purple-100 line-clamp-4">
                                  {postDraft.content}
                                </p>
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
                    <p className="text-sm text-green-300">
                      {mockAnalytics.bestTimeToPost}
                    </p>
                    <p className="text-xs text-purple-300 mt-2">
                      Based on your audience activity
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Scheduled Posts Tab */}
          <TabsContent value="scheduled" className="space-y-4">
            <div className="space-y-4">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition"
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Post Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {post.platforms.map((platform) => {
                              const account = mockAccounts.find(
                                (a) => a.platform === platform
                              );
                              return (
                                <Badge
                                  key={platform}
                                  className={`bg-gradient-to-r ${getPlatformColor(
                                    platform
                                  )} text-white`}
                                >
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

                      {/* Post Meta */}
                      <div className="flex flex-wrap gap-4 text-sm text-purple-300">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {post.status === "posted"
                              ? `Posted ${formatScheduleTime(
                                  new Date(post.postedAt || post.scheduledAt)
                                )}`
                              : `Scheduled ${formatScheduleTime(
                                  new Date(post.scheduledAt)
                                )}`}
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

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        {post.status === "scheduled" && (
                          <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/50">
                            <Clock className="w-3 h-3 mr-1" />
                            Scheduled
                          </Badge>
                        )}
                        {post.status === "posted" && (
                          <Badge className="bg-green-500/20 text-green-300 border border-green-500/50">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Posted
                          </Badge>
                        )}
                        {post.status === "failed" && (
                          <Badge className="bg-red-500/20 text-red-300 border border-red-500/50">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Failed
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
              {/* Top Performing Post */}
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Top Performing Post</CardTitle>
                  <CardDescription className="text-purple-200">
                    Your most engaged post
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white line-clamp-3">
                    {mockAnalytics.topPerformingPost.content}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-purple-300 mb-1">Engagement Rate</p>
                      <p className="text-2xl font-bold text-white">
                        {getEngagementRate(mockAnalytics.topPerformingPost)}%
                      </p>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-purple-300 mb-1">Total Reach</p>
                      <p className="text-2xl font-bold text-white">
                        {mockAnalytics.topPerformingPost.engagement?.views.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Performance */}
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Platform Performance</CardTitle>
                  <CardDescription className="text-purple-200">
                    Average engagement by platform
                  </CardDescription>
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
                        <span className="text-sm text-purple-300">
                          {account.followers.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Posting Schedule */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Recommended Posting Schedule</CardTitle>
                <CardDescription className="text-purple-200">
                  Optimal times to post for maximum engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                    <div
                      key={day}
                      className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/20 text-center"
                    >
                      <p className="text-sm font-medium text-white mb-2">{day}</p>
                      <p className="text-xs text-purple-300">
                        {["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM"][idx]}
                      </p>
                      <div className="mt-2 h-12 bg-purple-500/20 rounded flex items-center justify-center">
                        <span className="text-xs text-purple-300">
                          {Math.floor(Math.random() * 50) + 50}%
                        </span>
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
