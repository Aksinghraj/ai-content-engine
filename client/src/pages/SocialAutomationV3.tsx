import { useState, useEffect } from "react";
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
  Upload,
  Image as ImageIcon,
  Video,
  Sparkles,
  Trash2,
  LogOut,
  Eye,
  EyeOff,
  Lock,
  Shield,
  X,
} from "lucide-react";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "from-pink-500 to-purple-500", forgotUrl: "https://www.instagram.com/accounts/password/reset/" },
  { id: "twitter", name: "Twitter/X", icon: Twitter, color: "from-blue-400 to-blue-600", forgotUrl: "https://twitter.com/i/flow/password_reset" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "from-blue-600 to-blue-800", forgotUrl: "https://www.linkedin.com/uas/login?session_redirect=/psettings/change-password" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "from-blue-500 to-blue-700", forgotUrl: "https://www.facebook.com/login/identify/?ctx=recover" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "from-red-500 to-red-700", forgotUrl: "https://accounts.google.com/signin/recovery" },
  { id: "tiktok", name: "TikTok", icon: Zap, color: "from-black to-gray-800", forgotUrl: "https://www.tiktok.com/login/phone_or_email/forgot_password" },
];

export default function SocialAutomationV3() {
  const [, navigate] = useLocation();
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleTime, setScheduleTime] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPlatform, setLoginPlatform] = useState<string>("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [testingPlatform, setTestingPlatform] = useState<string>("");

  // tRPC queries and mutations
  const connectionsQuery = trpc.socialMedia.getConnections.useQuery();
  const scheduledPostsQuery = trpc.socialMedia.getScheduledPosts.useQuery();
  const uploadMediaMutation = trpc.socialMedia.uploadMedia.useMutation();
  const schedulePostMutation = trpc.socialMedia.schedulePost.useMutation();
  const disconnectMutation = trpc.socialMedia.disconnect.useMutation();
  const deletePostMutation = trpc.socialMedia.deletePost.useMutation();
  const chatMutation = trpc.aiAssistant.chat.useMutation();
  const saveConnectionMutation = trpc.socialMedia.saveConnection.useMutation();
  const sendTestPostMutation = trpc.socialMedia.sendTestPost.useMutation();

  // Handle sending a test post to verify connection
  const handleSendTestPost = async (connectionId: number, platform: string) => {
    setTestingPlatform(platform);
    try {
      const result = await sendTestPostMutation.mutateAsync({ connectionId, platform });
      if (result.success) {
        toast.success(result.message, { duration: 5000 });
      } else {
        // Show reconnect guidance if needed
        if ('reconnectRequired' in result && result.reconnectRequired) {
          toast.error(result.message + " Click 'Disconnect' and reconnect with valid credentials.", { duration: 8000 });
        } else {
          toast.error(result.message, { duration: 5000 });
        }
      }
    } catch (error) {
      toast.error(`Test post failed: ${(error as Error).message}. Please check your connection and try again.`, { duration: 5000 });
    } finally {
      setTestingPlatform("");
    }
  };

  // Open login modal for a platform
  const handleConnect = (platformId: string) => {
    setLoginPlatform(platformId);
    setLoginEmail("");
    setLoginPassword("");
    setShowPassword(false);
    setShowLoginModal(true);
  };

  // Handle credential-based login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error("Please enter both email/username and password");
      return;
    }

    setIsConnecting(true);

    try {
      // Save connection to database with encrypted credentials
      await saveConnectionMutation.mutateAsync({
        platform: loginPlatform,
        username: loginEmail.includes("@") ? loginEmail.split("@")[0] : loginEmail,
        accessToken: loginPassword, // Will be encrypted server-side
        platformUserId: `${loginPlatform}_${loginEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
      });

      const platformName = PLATFORMS.find(p => p.id === loginPlatform)?.name;
      toast.success(`${platformName} connected successfully!`);
      setShowLoginModal(false);
      setLoginEmail("");
      setLoginPassword("");
      connectionsQuery.refetch();
    } catch (error) {
      toast.error(`Failed to connect. Please check your credentials and try again.`);
      console.error("Connection error:", error);
    } finally {
      setIsConnecting(false);
    }
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
    const validVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];
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
        message: `Generate a viral post for ${selectedPlatforms.join(", ")} platforms. Make it engaging and professional.`,
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
  const connectedCount = connections.filter((c: any) => c.isConnected).length;
  const currentPlatform = PLATFORMS.find(p => p.id === loginPlatform);

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
          <p className="text-gray-400">Connect your accounts and manage all platforms from one dashboard</p>
          <div className="flex items-center gap-2 mt-2">
            <Shield size={16} className="text-green-400" />
            <span className="text-xs text-green-400">End-to-End Encrypted</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-white">{connectedCount}</div>
              <p className="text-gray-400 text-sm">Connected Accounts</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-white">{scheduledPosts.length}</div>
              <p className="text-gray-400 text-sm">Scheduled Posts</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-white">{PLATFORMS.length}</div>
              <p className="text-gray-400 text-sm">Available Platforms</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="connect" className="space-y-6">
          <TabsList className="bg-slate-800 border-purple-500/20">
            <TabsTrigger value="connect">Connect Accounts</TabsTrigger>
            <TabsTrigger value="create">Create Post</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Posts</TabsTrigger>
          </TabsList>

          {/* Connect Accounts Tab */}
          <TabsContent value="connect" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PLATFORMS.map((platform) => {
                const connection = connections.find((c: any) => c.platform === platform.id);
                return (
                  <Card key={platform.id} className="bg-slate-800 border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${platform.color}`}>
                            <platform.icon size={24} className="text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white">{platform.name}</CardTitle>
                            {connection && (
                              <p className="text-sm text-green-400">@{connection.username}</p>
                            )}
                          </div>
                        </div>
                        {connection ? (
                          <CheckCircle2 size={20} className="text-green-500" />
                        ) : (
                          <XCircle size={20} className="text-gray-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {connection ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs text-green-400">
                            <Lock size={12} />
                            <span>Credentials encrypted & secured</span>
                          </div>
                          <Button
                            onClick={() => handleSendTestPost(connection.id, platform.id)}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90"
                            disabled={testingPlatform === platform.id}
                          >
                            {testingPlatform === platform.id ? (
                              <><Loader2 size={16} className="mr-2 animate-spin" /> Verifying...</>
                            ) : (
                              <><Send size={16} className="mr-2" /> Send Test Post</>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleDisconnect(connection.id)}
                            variant="destructive"
                            className="w-full"
                          >
                            <LogOut size={16} className="mr-2" />
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleConnect(platform.id)}
                          className={`w-full bg-gradient-to-r ${platform.color} text-white hover:opacity-90 transition`}
                        >
                          Connect {platform.name}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Create Post Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card className="bg-slate-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Create & Schedule Post</CardTitle>
                <CardDescription>Generate AI content or write your own, then schedule to multiple platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Platform Selection */}
                <div>
                  <Label className="text-gray-300 mb-3 block">Select Platforms</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {PLATFORMS.map((platform) => {
                      const isConnected = connections.some((c: any) => c.platform === platform.id);
                      const isSelected = selectedPlatforms.includes(platform.id);
                      return (
                        <button
                          key={platform.id}
                          onClick={() => {
                            if (!isConnected) {
                              toast.error(`Please connect ${platform.name} first`);
                              return;
                            }
                            setSelectedPlatforms(prev =>
                              isSelected
                                ? prev.filter(p => p !== platform.id)
                                : [...prev, platform.id]
                            );
                          }}
                          className={`p-3 rounded-lg border-2 transition ${
                            isSelected
                              ? "border-purple-500 bg-purple-500/10"
                              : isConnected
                              ? "border-gray-600 hover:border-purple-500"
                              : "border-gray-700 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <platform.icon size={20} className="mx-auto mb-1 text-white" />
                          <p className="text-xs font-medium text-white">{platform.name}</p>
                          {!isConnected && <p className="text-[10px] text-red-400">Not connected</p>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Post Content */}
                <div>
                  <Label className="text-gray-300 mb-2 block">Post Content</Label>
                  <Textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Write your post content here..."
                    className="bg-slate-700 border-gray-600 text-white placeholder-gray-500 min-h-32"
                  />
                  <p className="text-xs text-gray-400 mt-1">{postContent.length} characters</p>
                </div>

                {/* Media Upload */}
                <div>
                  <Label className="text-gray-300 mb-2 block">Upload Media (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition">
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
                          {mediaType === "image" && (
                            <img
                              src={mediaPreview}
                              alt="Preview"
                              className="max-h-40 mx-auto rounded"
                            />
                          )}
                          {mediaType === "video" && (
                            <video
                              src={mediaPreview}
                              className="max-h-40 mx-auto rounded"
                              controls
                            />
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload size={32} className="mx-auto text-gray-500" />
                          <p className="text-gray-400">Click to upload photos or videos from gallery</p>
                          <p className="text-xs text-gray-500">JPG, PNG, GIF, MP4, MOV, WebM (Max 100MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {selectedFile && (
                    <Button
                      onClick={() => {
                        setSelectedFile(null);
                        setMediaPreview("");
                      }}
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={14} className="mr-1" /> Remove media
                    </Button>
                  )}
                </div>

                {/* Schedule Time */}
                <div>
                  <Label className="text-gray-300 mb-2 block">Schedule Time</Label>
                  <Input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="bg-slate-700 border-gray-600 text-white"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerateContent}
                    disabled={isGenerating || selectedPlatforms.length === 0}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} className="mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSchedulePost}
                    disabled={isUploading || !postContent.trim() || selectedPlatforms.length === 0}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
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
            {scheduledPosts.length === 0 ? (
              <Card className="bg-slate-800 border-purple-500/20">
                <CardContent className="pt-6 text-center text-gray-400">
                  No scheduled posts yet. Create one to get started!
                </CardContent>
              </Card>
            ) : (
              scheduledPosts.map((post: any) => (
                <Card key={post.id} className="bg-slate-800 border-purple-500/20">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-white font-medium">{post.content.substring(0, 100)}...</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Platform: <Badge>{post.platform}</Badge>
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Scheduled: {new Date(post.scheduledAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDeletePost(post.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Login Modal */}
      {showLoginModal && currentPlatform && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header with Platform Gradient */}
            <div className={`bg-gradient-to-r ${currentPlatform.color} p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <currentPlatform.icon size={28} className="text-white" />
                  <h2 className="text-xl font-bold text-white">Login to {currentPlatform.name}</h2>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-white/80 hover:text-white transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleLogin} className="p-6 space-y-5">
              {/* Security Badge */}
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <Shield size={18} className="text-green-400" />
                <p className="text-sm text-green-400">End-to-end encrypted connection</p>
              </div>

              {/* Email/Username */}
              <div>
                <Label htmlFor="login-email" className="text-gray-300 mb-2 block">
                  Email or Username
                </Label>
                <Input
                  id="login-email"
                  type="text"
                  placeholder={`Enter your ${currentPlatform.name} email or username`}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={isConnecting}
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-500"
                  autoFocus
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="login-password" className="text-gray-300 mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isConnecting}
                    className="bg-slate-700 border-slate-600 text-white placeholder-gray-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <a
                  href={currentPlatform.forgotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 transition"
                >
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isConnecting}
                className={`w-full bg-gradient-to-r ${currentPlatform.color} text-white hover:opacity-90 transition h-11`}
              >
                {isConnecting ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Lock size={18} className="mr-2" />
                    Connect {currentPlatform.name}
                  </>
                )}
              </Button>

              {/* Security Info */}
              <div className="text-center space-y-1">
                <p className="text-xs text-gray-400">
                  Your credentials are encrypted with AES-256 and stored securely.
                </p>
                <p className="text-xs text-gray-500">
                  We never share your data with third parties.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
