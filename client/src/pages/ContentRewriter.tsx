import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Copy, RefreshCw, Download, Sparkles, FileText, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { exportToPDF } from "@/lib/pdfExport";

const REWRITE_STYLES = [
  { id: "professional", label: "Professional", description: "Formal and business-appropriate" },
  { id: "casual", label: "Casual", description: "Friendly and conversational" },
  { id: "academic", label: "Academic", description: "Scholarly and detailed" },
  { id: "seo", label: "SEO", description: "Optimized for search engines" },
  { id: "viral", label: "Viral", description: "Engaging and shareable" },
  { id: "minimalist", label: "Minimalist", description: "Concise and impactful" },
  { id: "storytelling", label: "Storytelling", description: "Narrative-driven" },
  { id: "technical", label: "Technical", description: "Precise and detailed" },
];

export default function ContentRewriter() {
  const [inputContent, setInputContent] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("professional");
  const [rewrittenContent, setRewrittenContent] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [toneLevel, setToneLevel] = useState(50);
  const [error, setError] = useState("");
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [selectedTrending, setSelectedTrending] = useState<string | null>(null);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);

  // Fetch trending topics
  const trendingQuery = trpc.trending.getTrendingTopics.useQuery(
    { limit: 5 },
    { enabled: true }
  );

  useEffect(() => {
    if (trendingQuery.data?.data) {
      setTrendingTopics(trendingQuery.data.data);
    }
  }, [trendingQuery.data]);

  const rewriteMutation = trpc.contentRewriter.rewrite.useMutation({
    onSuccess: (data) => {
      setRewrittenContent(data.rewrittenContent);
      setError("");
      setIsRewriting(false);
    },
    onError: (err) => {
      setError(err.message || "Failed to rewrite content");
      setIsRewriting(false);
    },
  });

  const handleRewrite = async () => {
    if (!inputContent.trim() || !selectedStyle) return;

    setIsRewriting(true);
    setError("");

    try {
      let finalContent = inputContent;
      
      // If a trending topic is selected, prepend it to the content
      if (selectedTrending) {
        const topic = trendingTopics.find(t => t.id === selectedTrending);
        if (topic) {
          finalContent = `[Based on trending topic: ${topic.title}]\n\n${inputContent}`;
        }
      }

      await rewriteMutation.mutateAsync({
        content: finalContent,
        style: selectedStyle as any,
        toneLevel,
      });
    } catch (err) {
      console.error("Rewrite error:", err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenContent);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([rewrittenContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `rewritten-${selectedStyle}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPDF = () => {
    exportToPDF({
      filename: `rewritten-${selectedStyle}-${Date.now()}.pdf`,
      title: `Content Rewritten - ${selectedStyle.toUpperCase()} Style`,
      content: rewrittenContent,
      metadata: {
        author: "AI Content Engine",
        subject: `Content Rewritten in ${selectedStyle} Style`,
        keywords: "content rewriting, AI generated",
      },
    });
  };

  const handleUseTrendingTopic = (topic: any) => {
    setInputContent(`Write about: ${topic.title}\n\nThis is trending with ${topic.engagement.views.toLocaleString()} views and ${topic.engagement.likes.toLocaleString()} likes.`);
    setSelectedTrending(topic.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold">Content Rewriter</h1>
          </div>
          <p className="text-slate-400">Transform your content into different styles and tones, following trending topics</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Trending Topics Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics Card */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30 backdrop-blur-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <label className="text-sm font-medium text-slate-300">
                  Trending Topics
                </label>
              </div>
              <div className="space-y-2">
                {isLoadingTrending ? (
                  <p className="text-xs text-slate-500">Loading trending topics...</p>
                ) : trendingTopics.length > 0 ? (
                  trendingTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleUseTrendingTopic(topic)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left text-xs ${
                        selectedTrending === topic.id
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-purple-500/30 bg-purple-500/10 hover:border-purple-500/50"
                      }`}
                    >
                      <p className="font-medium text-purple-300 truncate">{topic.title}</p>
                      <p className="text-purple-200/60 text-xs mt-1">
                        👁️ {(topic.engagement.views / 1000).toFixed(0)}K views
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No trending topics available</p>
                )}
              </div>
            </Card>
          </div>

          {/* Input and Output Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <div className="space-y-6">
              {/* Content Input */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Paste Your Content
                </label>
                <Textarea
                  placeholder="Paste your blog post, email, social media caption, or any content you want to rewrite..."
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 min-h-48 resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">{inputContent.length} characters</p>
              </Card>

              {/* Style Selection */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
                <label className="block text-sm font-medium text-slate-300 mb-4">
                  Select Rewrite Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {REWRITE_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedStyle === style.id
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                      }`}
                    >
                      <p className="font-medium text-sm">{style.label}</p>
                      <p className="text-xs text-slate-400">{style.description}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Tone Adjustment */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
                <label className="block text-sm font-medium text-slate-300 mb-4">
                  Tone Intensity: {toneLevel}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={toneLevel}
                  onChange={(e) => setToneLevel(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-slate-500 mt-2">
                  {toneLevel < 33 ? "Subtle" : toneLevel < 66 ? "Moderate" : "Intense"}
                </p>
              </Card>

              {/* Rewrite Button */}
              <Button
                onClick={handleRewrite}
                disabled={isRewriting || !inputContent.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
              >
                {isRewriting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Rewriting...
                  </>
                ) : (
                  "Rewrite Content"
                )}
              </Button>

              {/* Error Message */}
              {error && (
                <Card className="bg-red-900/20 border-red-700 p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </Card>
              )}
            </div>

            {/* Output Section */}
            <div className="space-y-6">
              {rewrittenContent ? (
                <>
                  <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Rewritten Content
                    </label>
                    <div className="bg-slate-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <p className="text-white whitespace-pre-wrap text-sm leading-relaxed">
                        {rewrittenContent}
                      </p>
                    </div>
                  </Card>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="flex-1 border-slate-600 text-white hover:bg-slate-800"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="flex-1 border-slate-600 text-white hover:bg-slate-800"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      TXT
                    </Button>
                    <Button
                      onClick={handleDownloadPDF}
                      variant="outline"
                      className="flex-1 border-slate-600 text-white hover:bg-slate-800"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      onClick={() => setRewrittenContent("")}
                      variant="outline"
                      className="flex-1 border-slate-600 text-white hover:bg-slate-800"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-12 flex items-center justify-center min-h-96">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">
                      {isRewriting ? "Rewriting your content..." : "Rewritten content will appear here"}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
