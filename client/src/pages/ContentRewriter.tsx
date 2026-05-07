import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Copy, RefreshCw, Download, Sparkles } from "lucide-react";

const REWRITE_STYLES = [
  { id: "professional", label: "Professional", description: "Formal and business-appropriate" },
  { id: "casual", label: "Casual", description: "Friendly and conversational" },
  { id: "academic", label: "Academic", description: "Research-focused and detailed" },
  { id: "seo", label: "SEO-Optimized", description: "Search engine friendly" },
  { id: "viral", label: "Viral", description: "Engaging and shareable" },
  { id: "minimalist", label: "Minimalist", description: "Concise and direct" },
  { id: "storytelling", label: "Storytelling", description: "Narrative-driven" },
  { id: "technical", label: "Technical", description: "Detailed and precise" },
];

export default function ContentRewriter() {
  const [inputContent, setInputContent] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("professional");
  const [rewrittenContent, setRewrittenContent] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [toneLevel, setToneLevel] = useState(50);

  const handleRewrite = async () => {
    if (!inputContent.trim() || !selectedStyle) return;

    setIsRewriting(true);
    // Simulate API call - in production, this would call a real tRPC procedure
    setTimeout(() => {
      const styleDescriptions: Record<string, string> = {
        professional: "This content has been rewritten in a professional and formal tone, suitable for business communications and corporate settings.",
        casual: "This content has been rewritten in a casual and friendly tone, perfect for social media and informal conversations.",
        academic: "This content has been rewritten in an academic style with proper citations and detailed explanations.",
        seo: "This content has been optimized for search engines with relevant keywords and meta descriptions.",
        viral: "This content has been rewritten to be more engaging and shareable on social media platforms.",
        minimalist: "This content has been condensed to its essential points while maintaining clarity.",
        storytelling: "This content has been rewritten as a narrative with a compelling story arc.",
        technical: "This content has been written with technical precision and detailed specifications.",
      };

      const rewritten = `[${selectedStyle.toUpperCase()} VERSION]\n\n${inputContent}\n\n---\n\n${styleDescriptions[selectedStyle] || "Content rewritten successfully."}`;
      setRewrittenContent(rewritten);
      setIsRewriting(false);
    }, 1500);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold">Content Rewriter</h1>
          </div>
          <p className="text-slate-400">Transform your content into different styles and tones</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
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
              {isRewriting ? "Rewriting..." : "Rewrite Content"}
            </Button>
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

                <div className="flex gap-3">
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
                    Download
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
                  <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400">
                    Paste content and select a style to see the rewritten version here
                  </p>
                </div>
              </Card>
            )}

            {/* Info Card */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
              <h3 className="font-semibold mb-3">💡 Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Paste content between 50-5000 characters for optimal results</li>
                <li>• Use the tone slider to adjust intensity</li>
                <li>• Try different styles to find the best fit</li>
                <li>• Each rewrite costs 5 credits</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
