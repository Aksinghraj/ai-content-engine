import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Download, Sparkles, Clock } from "lucide-react";

const PLATFORMS = [
  { id: "twitter", name: "Twitter", icon: "𝕏", maxChars: 280, color: "from-blue-400 to-blue-600" },
  { id: "linkedin", name: "LinkedIn", icon: "in", maxChars: 3000, color: "from-blue-600 to-blue-800" },
  { id: "instagram", name: "Instagram", icon: "📷", maxChars: 2200, color: "from-pink-500 to-purple-600" },
  { id: "tiktok", name: "TikTok", icon: "♪", maxChars: 150, color: "from-black to-gray-800" },
  { id: "youtube", name: "YouTube", icon: "▶", maxChars: 5000, color: "from-red-600 to-red-800" },
  { id: "email", name: "Email", icon: "✉", maxChars: 10000, color: "from-gray-600 to-gray-800" },
];

const OPTIMAL_TIMES = {
  twitter: "9 AM - 3 PM EST",
  linkedin: "7-9 AM, 12 PM, 5-6 PM EST",
  instagram: "11 AM - 1 PM, 7-9 PM EST",
  tiktok: "6-10 AM, 7-11 PM EST",
  youtube: "2-4 PM EST",
  email: "10 AM - 2 PM EST",
};

export default function RepurposingEngine() {
  const [inputContent, setInputContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [repurposedContent, setRepurposedContent] = useState<Record<string, string>>({});

  const handleTogglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId]
    );
  };

  const handleRepurpose = async () => {
    if (!inputContent.trim() || selectedPlatforms.length === 0) return;

    setIsRepurposing(true);

    // Simulate API call
    setTimeout(() => {
      const result: Record<string, string> = {};

      selectedPlatforms.forEach((platformId) => {
        const platform = PLATFORMS.find((p) => p.id === platformId);
        if (platform) {
          const baseContent = inputContent.substring(0, platform.maxChars - 50);
          result[platformId] = `[${platform.name.toUpperCase()}]\n\n${baseContent}...\n\n#ContentMarketing #AI #Growth`;
        }
      });

      setRepurposedContent(result);
      setIsRepurposing(false);
    }, 2000);
  };

  const handleCopyContent = (platformId: string) => {
    const content = repurposedContent[platformId];
    if (content) {
      navigator.clipboard.writeText(content);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold">Multi-Platform Repurposing</h1>
          </div>
          <p className="text-slate-400">Transform your content for every social platform automatically</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Content Input */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Original Content
              </label>
              <Textarea
                placeholder="Paste your blog post, article, or any content to repurpose..."
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 min-h-40 resize-none"
              />
            </Card>

            {/* Platform Selection */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
              <label className="block text-sm font-medium text-slate-300 mb-4">
                Select Platforms ({selectedPlatforms.length})
              </label>
              <div className="space-y-3">
                {PLATFORMS.map((platform) => (
                  <div key={platform.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={() => handleTogglePlatform(platform.id)}
                      className="w-4 h-4"
                    />
                    <label className="flex-1 cursor-pointer">
                      <span className="font-medium">{platform.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({platform.maxChars} chars)</span>
                    </label>
                  </div>
                ))}
              </div>
            </Card>

            {/* Repurpose Button */}
            <Button
              onClick={handleRepurpose}
              disabled={isRepurposing || !inputContent.trim() || selectedPlatforms.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
            >
              {isRepurposing ? "Repurposing..." : "Repurpose Content"}
            </Button>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-2 space-y-4">
            {Object.keys(repurposedContent).length > 0 ? (
              repurposedContent &&
              selectedPlatforms.map((platformId) => {
                const platform = PLATFORMS.find((p) => p.id === platformId);
                const content = repurposedContent[platformId];

                if (!platform || !content) return null;

                return (
                  <Card key={platformId} className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>Best time: {OPTIMAL_TIMES[platformId as keyof typeof OPTIMAL_TIMES]}</span>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400">
                        {content.length}/{platform.maxChars}
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
                      <p className="text-white text-sm whitespace-pre-wrap">{content}</p>
                    </div>

                    {content.length > platform.maxChars && (
                      <p className="text-xs text-red-400 mb-3">⚠️ Content exceeds character limit</p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCopyContent(platformId)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-600 text-white hover:bg-slate-800"
                      >
                        <Copy className="w-3 h-3 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-600 text-white hover:bg-slate-800"
                      >
                        <Download className="w-3 h-3 mr-2" />
                        Download
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-12 flex items-center justify-center min-h-96">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400">
                    Select platforms and click "Repurpose Content" to generate platform-specific versions
                  </p>
                </div>
              </Card>
            )}

            {/* Tips */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
              <h3 className="font-semibold mb-3">💡 Repurposing Tips</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Each platform has optimal posting times for maximum engagement</li>
                <li>• Content is automatically adjusted for platform-specific character limits</li>
                <li>• Hashtags are added based on platform best practices</li>
                <li>• Each repurposing costs 3 credits</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
