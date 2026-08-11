import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  Image,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    color: "from-pink-500 to-rose-500",
    maxChars: 2200,
    requiresImage: true,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "👥",
    color: "from-blue-500 to-blue-600",
    maxChars: 63206,
    requiresImage: false,
  },
  {
    id: "twitter",
    name: "Twitter / X",
    icon: "𝕏",
    color: "from-slate-700 to-slate-900",
    maxChars: 280,
    requiresImage: false,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    color: "from-blue-600 to-blue-700",
    maxChars: 3000,
    requiresImage: false,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "📺",
    color: "from-red-500 to-red-600",
    maxChars: 5000,
    requiresImage: false,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    color: "from-slate-900 to-slate-800",
    maxChars: 2200,
    requiresImage: false,
  },
];

export default function SocialMediaPublishing() {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<any[]>([]);

  // Fetch connected accounts
  const { data: connectedAccounts, isLoading } =
    trpc.socialOAuthIntegration.getConnectedAccounts.useQuery();

  // Mutations
  const publishMutation = trpc.socialPosting.postToMultiplePlatforms.useMutation();

  // Get connected platform IDs
  const connectedPlatformIds = connectedAccounts?.map((c: any) => c.platform) || [];

  // Get available platforms (only those that are connected)
  const availablePlatforms = PLATFORMS.filter((p) =>
    connectedPlatformIds.includes(p.id)
  );

  // Toggle platform selection
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  // Handle file upload
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // For now, just store file names
    // In production, upload to S3 and get URLs
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setMediaUrls((prev) => [...prev, ...urls]);
  };

  // Remove media
  const removeMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Publish to platforms
  const handlePublish = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    // Validate content length for each platform
    for (const platformId of selectedPlatforms) {
      const platform = PLATFORMS.find((p) => p.id === platformId);
      if (platform && content.length > platform.maxChars) {
        toast.error(
          `Content exceeds ${platform.name} limit (${platform.maxChars} characters)`
        );
        return;
      }
    }

    setIsPublishing(true);
    try {
      const result = await publishMutation.mutateAsync({
        platforms: selectedPlatforms as any,
        text: content,
        imageUrl: mediaUrls[0],
        hashtags: [],
      });

      setPublishResults(result.successful || []);

      if (result.successful && result.successful.length === selectedPlatforms.length) {
        toast.success("Published to all platforms!");
        setContent("");
        setSelectedPlatforms([]);
        setMediaUrls([]);
      } else {
        toast.warning(
          `Published to ${result.successful?.length || 0}/${selectedPlatforms.length} platforms`
        );
      }
    } catch (error) {
      toast.error(`Failed to publish: ${(error as Error).message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (availablePlatforms.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Social Media Publishing</h1>
            <p className="text-gray-400 mt-2">
              Connect your social media accounts to start publishing
            </p>
          </div>

          <Card className="bg-yellow-500/10 border-yellow-500/30 p-6">
            <div className="flex gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-200 mb-2">
                  No Connected Accounts
                </h3>
                <p className="text-yellow-100 mb-4">
                  You need to connect at least one social media account to start publishing.
                </p>
                <Button
                  className="bg-yellow-600 hover:bg-yellow-700"
                  onClick={() => window.location.href = "/connected-accounts"}
                >
                  Connect Accounts
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Social Media Publishing</h1>
          <p className="text-gray-400 mt-2">
            Publish content to multiple social media platforms at once
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Text Input */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <label className="block text-sm font-semibold text-white mb-3">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Write your content here..."
                className="w-full h-32 bg-slate-700 text-white rounded-lg p-4 border border-slate-600 focus:border-purple-500 focus:outline-none resize-none"
              />
              <div className="mt-2 text-sm text-gray-400">
                {content.length} characters
              </div>
            </Card>

            {/* Media Upload */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <label className="block text-sm font-semibold text-white mb-3">
                Media (Optional)
              </label>

              {mediaUrls.length === 0 ? (
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-2">
                  {mediaUrls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-700 p-3 rounded-lg"
                    >
                      <span className="text-sm text-gray-300">Media {index + 1}</span>
                      <button
                        onClick={() => removeMedia(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 transition">
                    <div className="flex flex-col items-center justify-center">
                      <Image className="w-6 h-6 text-gray-400 mb-1" />
                      <p className="text-xs text-gray-400">Add more media</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </Card>
          </div>

          {/* Platform Selection */}
          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <label className="block text-sm font-semibold text-white mb-4">
                Select Platforms
              </label>

              <div className="space-y-2">
                {availablePlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                      selectedPlatforms.includes(platform.id)
                        ? "bg-purple-600/30 border border-purple-500"
                        : "bg-slate-700 border border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(platform.id)}
                      onChange={() => {}}
                      className="w-4 h-4"
                    />
                    <span className="text-lg">{platform.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">
                        {platform.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {platform.maxChars} chars
                      </p>
                    </div>
                    {selectedPlatforms.includes(platform.id) && (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Publish Button */}
            <Button
              onClick={handlePublish}
              disabled={isPublishing || selectedPlatforms.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-base"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publish to {selectedPlatforms.length} Platform
                  {selectedPlatforms.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>

            {/* Platform Warnings */}
            {selectedPlatforms.includes("twitter") && content.length > 280 && (
              <Card className="bg-red-500/10 border-red-500/30 p-3">
                <p className="text-xs text-red-200">
                  ⚠️ Content exceeds Twitter's 280 character limit
                </p>
              </Card>
            )}

            {selectedPlatforms.some((p) =>
              PLATFORMS.find((pl) => pl.id === p && pl.requiresImage)
            ) && mediaUrls.length === 0 && (
              <Card className="bg-yellow-500/10 border-yellow-500/30 p-3">
                <p className="text-xs text-yellow-200">
                  ⚠️ Instagram requires an image
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Info Section */}
        <Card className="bg-blue-500/10 border-blue-500/30 p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">Publishing Tips</p>
              <ul className="space-y-1 text-blue-100">
                <li>• Each platform has different character limits</li>
                <li>• Instagram and some platforms require images</li>
                <li>• Your content will be published immediately</li>
                <li>• Check each platform for your published content</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
