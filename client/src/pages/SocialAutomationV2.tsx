import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Send,
  MessageSquare,
  Calendar,
  Upload,
  Image as ImageIcon,
  Video,
  Sparkles,
  Users,
  Share2,
  MessageCircle,
  Clock,
  TrendingUp,
  Trash2,
} from "lucide-react";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "from-pink-500 to-purple-500" },
  { id: "twitter", name: "Twitter/X", icon: Twitter, color: "from-blue-400 to-blue-600" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "from-blue-600 to-blue-800" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "from-blue-500 to-blue-700" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "from-red-500 to-red-700" },
  { id: "tiktok", name: "TikTok", icon: Zap, color: "from-black to-gray-800" },
];

export default function SocialAutomationV2() {
  const [, navigate] = useLocation();
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleTime, setScheduleTime] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // tRPC queries and mutations
  const connectionsQuery = trpc.socialMedia.getConnections.useQuery();
  const scheduledPostsQuery = trpc.socialMedia.getScheduledPosts.useQuery();
  const uploadMediaMutation = trpc.socialMedia.uploadMedia.useMutation();
  const schedulePostMutation = trpc.socialMedia.schedulePost.useMutation();
  const disconnectMutation = trpc.socialMedia.disconnect.useMutation();
  const deletePostMutation = trpc.socialMedia.deletePost.useMutation();
  const chatMutation = trpc.aiAssistant.chat.useMutation();
  const saveConnectionMutation = trpc.socialMedia.saveConnection.useMutation();

  // Check for OAuth callback params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const platform = params.get("platform");
    const success = params.get("success");
    const username = params.get("username");
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      toast.error(`OAuth Error: ${error}`);
      window.history.replaceState({}, document.title, "/social-automation");
      return;
    }

    if (success && platform && username && token) {
      // Save connection to database
      saveConnectionMutation.mutate(
        {
          platform,
          username,
          accessToken: token,
          platformUserId: `${platform}_${Math.random().toString(36).substr(2, 9)}`,
        },
        {
          onSuccess: () => {
            const platformName = PLATFORMS.find(p => p.id === platform)?.name;
            toast.success(`${platformName} connected successfully!`);
            window.history.replaceState({}, document.title, "/social-automation");
            setTimeout(() => connectionsQuery.refetch(), 500);
          },
          onError: (error) => {
            toast.error("Failed to save connection");
            console.error(error);
          },
        }
      );
    }
  }, []);

  const handleConnect = (platformId: string) => {
    const redirectUri = `${window.location.origin}/auth/${platformId}/callback`;
    const state = Math.random().toString(36).substring(2, 15);

    sessionStorage.setItem(`oauth_state_${platformId}`, state);

    // Generate mock credentials for development
    const mockUsername = `${platformId}_user_${Math.random().toString(36).substr(2, 5)}`;
    const mockToken = `${platformId}_token_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create callback URL with mock data
    const callbackUrl = `${redirectUri}?platform=${platformId}&success=true&username=${encodeURIComponent(mockUsername)}&token=${encodeURIComponent(mockToken)}&state=${state}`;

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      callbackUrl,
      "oauth_login",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const handleDisconnect = async (connectionId: number) => {
    try {
      await disconnectMutation.mutateAsync({ connectionId });
      toast.success("Account disconnected");
      connectionsQuery.refetch();
    } catch (error) {
      toast.error("Failed to disconnect account");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size must be less than 100MB");
      return;
    }

    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const validVideoTypes = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"];
    const allValidTypes = [...validImageTypes, ...validVideoTypes];

    if (!allValidTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload an image or video.");
      return;
    }

    setSelectedFile(file);
    setMediaType(validImageTypes.includes(file.type) ? "image" : "video");

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateContent = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await chatMutation.mutateAsync({
        message: `Generate a viral post for ${selectedPlatforms.join(", ")} platforms`,
        conversationHistory: [],
      });

      if (result.success) {
        setPostContent(result.message);
        toast.success("Content generated!");
      }
    } catch (error) {
      toast.error("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!postContent.trim()) {
      toast.error("Please enter post content");
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

    try {
      setIsUploading(true);

      // Upload media if selected
      let mediaUrl = "";
      let mediaKey = "";

      if (selectedFile && mediaPreview) {
        const base64Data = mediaPreview.split(",")[1];
        const uploadResult = await uploadMediaMutation.mutateAsync({
          filename: selectedFile.name,
          fileData: base64Data,
          mediaType,
        });

        mediaUrl = uploadResult.url;
        mediaKey = uploadResult.key;
      }

      // Schedule posts for each selected platform
      for (const platform of selectedPlatforms) {
        const connection = connectionsQuery.data?.find(c => c.platform === platform);
        if (!connection) {
          toast.error(`${platform} account not connected`);
          continue;
        }

        await schedulePostMutation.mutateAsync({
          socialConnectionId: connection.id,
          platform,
          content: postContent,
          scheduledAt: new Date(scheduleTime),
          mediaUrl,
          mediaType: mediaType as "image" | "video",
          mediaKey,
        });
      }

      toast.success("Posts scheduled successfully!");
      setPostContent("");
      setScheduleTime("");
      setSelectedPlatforms([]);
      setSelectedFile(null);
      setMediaPreview("");
      scheduledPostsQuery.refetch();
    } catch (error) {
      toast.error("Failed to schedule post");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePostMutation.mutateAsync({ postId });
      toast.success("Post deleted");
      scheduledPostsQuery.refetch();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const connections = connectionsQuery.data || [];
  const scheduledPosts = scheduledPostsQuery.data || [];
  const connectedCount = connections.filter(c => c.isConnected).length;
  const autoPostCount = connections.filter(c => c.autoPost).length;
  const autoReplyCount = connections.filter(c => c.autoReply).length;

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
          <p className="text-gray-400">Connect accounts, schedule posts, and manage all platforms from one dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Connected</p>
                  <p className="text-3xl font-bold text-white mt-2">{connectedCount}</p>
                </div>
                <Users size={32} className="text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Auto-Post</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{autoPostCount}</p>
                </div>
                <Share2 size={32} className="text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Auto-Reply</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{autoReplyCount}</p>
                </div>
                <MessageCircle size={32} className="text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Scheduled</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">{scheduledPosts.length}</p>
                </div>
                <Calendar size={32} className="text-orange-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="accounts" className="mb-8">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Users size={18} />
              Connected Accounts
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Sparkles size={18} />
              Create Post
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Calendar size={18} />
              Scheduled ({scheduledPosts.length})
            </TabsTrigger>
          </TabsList>

          {/* Connected Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            {connectionsQuery.isLoading ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-12 pb-12 text-center">
                  <Loader2 size={32} className="mx-auto text-gray-600 mb-4 animate-spin" />
                  <p className="text-gray-400">Loading accounts...</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PLATFORMS.map(platform => {
                  const connection = connections.find(c => c.platform === platform.id);
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
                              {connection?.isConnected && (
                                <p className="text-sm text-gray-400">@{connection.username}</p>
                              )}
                            </div>
                          </div>
                          {connection?.isConnected ? (
                            <Badge className="bg-green-500/20 text-green-400">
                              <CheckCircle2 size={14} className="mr-1" />
                              Connected
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400">
                              <XCircle size={14} className="mr-1" />
                              Not Connected
                            </Badge>
                          )}
                        </div>

                        {connection?.isConnected ? (
                          <Button
                            onClick={() => handleDisconnect(connection.id)}
                            variant="outline"
                            className="w-full text-red-400 border-red-500/50 hover:bg-red-500/10"
                            disabled={disconnectMutation.isPending}
                          >
                            {disconnectMutation.isPending ? (
                              <>
                                <Loader2 size={18} className="mr-2 animate-spin" />
                                Disconnecting...
                              </>
                            ) : (
                              "Disconnect"
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleConnect(platform.id)}
                            className={`w-full bg-gradient-to-r ${platform.color} text-white hover:opacity-90`}
                          >
                            Connect {platform.name}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Create Post Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Create & Schedule Post</CardTitle>
                <CardDescription>Write content, upload media, and schedule to multiple platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Platform Selection */}
                <div>
                  <Label className="text-gray-300 mb-3 block">Select Platforms</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {PLATFORMS.map(platform => (
                      <button
                        key={platform.id}
                        onClick={() =>
                          setSelectedPlatforms(prev =>
                            prev.includes(platform.id)
                              ? prev.filter(p => p !== platform.id)
                              : [...prev, platform.id]
                          )
                        }
                        className={`p-3 rounded-lg border-2 transition ${
                          selectedPlatforms.includes(platform.id)
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <platform.icon size={20} className="mx-auto mb-1" />
                        <p className="text-sm font-medium">{platform.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Post Content */}
                <div>
                  <Label className="text-gray-300 mb-2 block">Post Content</Label>
                  <Textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Write your post content here..."
                    className="bg-slate-700 border-slate-600 text-white min-h-32"
                  />
                  <p className="text-xs text-gray-400 mt-2">{postContent.length} characters</p>
                </div>

                {/* Media Upload */}
                <div>
                  <Label className="text-gray-300 mb-2 block">Upload Media (Optional)</Label>
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-purple-500 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="media-upload"
                    />
                    <label htmlFor="media-upload" className="cursor-pointer">
                      {mediaPreview ? (
                        <div className="space-y-2">
                          {mediaType === "image" ? (
                            <ImageIcon size={32} className="mx-auto text-purple-400" />
                          ) : (
                            <Video size={32} className="mx-auto text-purple-400" />
                          )}
                          <p className="text-sm text-gray-300">{selectedFile?.name}</p>
                          <p className="text-xs text-gray-400">
                            {(selectedFile?.size || 0) / 1024 / 1024 < 1
                              ? `${((selectedFile?.size || 0) / 1024).toFixed(2)} KB`
                              : `${((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB`}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload size={32} className="mx-auto text-gray-400" />
                          <p className="text-sm text-gray-300">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500">PNG, JPG, MP4, MOV up to 100MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Media Preview */}
                {mediaPreview && (
                  <div>
                    <Label className="text-gray-300 mb-2 block">Preview</Label>
                    {mediaType === "image" ? (
                      <img src={mediaPreview} alt="Preview" className="max-h-64 rounded-lg" />
                    ) : (
                      <video src={mediaPreview} controls className="max-h-64 rounded-lg" />
                    )}
                  </div>
                )}

                {/* Schedule Time */}
                <div>
                  <Label className="text-gray-300 mb-2 block">Schedule Time</Label>
                  <Input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerateContent}
                    disabled={isGenerating || selectedPlatforms.length === 0}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSchedulePost}
                    disabled={!postContent.trim() || selectedPlatforms.length === 0 || !scheduleTime || isUploading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Calendar size={18} className="mr-2" />
                        Schedule Post
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Posts Tab */}
          <TabsContent value="scheduled" className="space-y-4">
            {scheduledPostsQuery.isLoading ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-12 pb-12 text-center">
                  <Loader2 size={32} className="mx-auto text-gray-600 mb-4 animate-spin" />
                  <p className="text-gray-400">Loading posts...</p>
                </CardContent>
              </Card>
            ) : scheduledPosts.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-12 pb-12 text-center">
                  <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No scheduled posts yet</p>
                </CardContent>
              </Card>
            ) : (
              scheduledPosts.map(post => {
                const platform = PLATFORMS.find(p => p.id === post.platform);
                const Icon = platform?.icon;

                return (
                  <Card key={post.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {Icon && (
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${platform?.color}`}>
                            <Icon className="text-white" size={24} />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-white">{platform?.name}</p>
                          <p className="text-sm text-gray-400 mt-2">{post.content}</p>
                          {post.mediaUrl && (
                            <div className="mt-3">
                              {post.mediaType === "image" ? (
                                <img src={post.mediaUrl} alt="Post media" className="max-h-32 rounded" />
                              ) : (
                                <video src={post.mediaUrl} className="max-h-32 rounded" />
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                            <Clock size={14} />
                            {new Date(post.scheduledAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            className={
                              post.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : post.status === "published"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                            }
                          >
                            {post.status}
                          </Badge>
                          <Button
                            onClick={() => handleDeletePost(post.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                            disabled={deletePostMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
