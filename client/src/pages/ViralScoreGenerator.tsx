import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import ViralScoreCard from "@/components/ViralScoreCard";
import { Sparkles, Copy, Download, RefreshCw, FileText } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { exportToPDF } from "@/lib/pdfExport";

export default function ViralScoreGenerator() {
  const [contentInput, setContentInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scoreData, setScoreData] = useState<any>(null);
  const [error, setError] = useState("");

  const analyzeMutation = trpc.viralScore.analyze.useMutation({
    onSuccess: (data) => {
      setScoreData(data.analysis);
      setError("");
      setIsAnalyzing(false);
    },
    onError: (err) => {
      setError(err.message || "Failed to analyze content");
      setIsAnalyzing(false);
    },
  });

  const handleAnalyze = async () => {
    if (!contentInput.trim()) return;

    setIsAnalyzing(true);
    setError("");

    try {
      await analyzeMutation.mutateAsync({
        content: contentInput,
        platform: "general",
      });
    } catch (err) {
      console.error("Analysis error:", err);
    }
  };

  const handleCopyScore = () => {
    if (!scoreData) return;

    const scoreText = `Viral Score: ${scoreData.viralScore}/100
Engagement Prediction: ${scoreData.engagementPrediction}/100
Hook Strength: ${scoreData.hookStrength}/100
Emotional Impact: ${scoreData.emotionalImpact}/100
CTR Prediction: ${scoreData.ctrPrediction}%

Recommendations:
${(scoreData.recommendations || []).map((rec: string) => `• ${rec}`).join("\n")}`;

    navigator.clipboard.writeText(scoreText);
  };

  const handleDownloadPDF = () => {
    if (!scoreData) return;

    const scoreText = `VIRAL SCORE ANALYSIS
${"=".repeat(40)}

Overall Viral Score: ${scoreData.viralScore}/100
Engagement Prediction: ${scoreData.engagementPrediction}/100
Hook Strength: ${scoreData.hookStrength}/100
Emotional Impact: ${scoreData.emotionalImpact}/100
CTR Prediction: ${scoreData.ctrPrediction}%

CONTENT ANALYZED:
${contentInput}

RECOMMENDATIONS:
${(scoreData.recommendations || []).map((rec: string) => `• ${rec}`).join("\n")}`;

    exportToPDF({
      filename: `viral-score-${Date.now()}.pdf`,
      title: "Viral Score Analysis Report",
      content: scoreText,
      metadata: {
        author: "AI Content Engine",
        subject: "Viral Score Analysis",
        keywords: "viral score, content analysis, AI generated",
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-950 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold">Viral Score Analyzer</h1>
          </div>
          <p className="text-slate-400">
            Get instant AI analysis of your content's viral potential across all platforms
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Paste Your Content
              </label>
              <Textarea
                placeholder="Paste your blog post, tweet, email, or any content you want to analyze..."
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 min-h-48 resize-none"
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !contentInput.trim()}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Viral Potential"
                )}
              </Button>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="bg-red-900/20 border-red-700 p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </Card>
            )}

            {/* Quick Tips */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
              <h3 className="font-semibold mb-3">💡 Quick Tips for Higher Scores</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Start with a strong hook in the first 3 words</li>
                <li>• Use emotional language that resonates</li>
                <li>• Include a clear call-to-action</li>
                <li>• Keep sentences short and punchy</li>
                <li>• Use power words that trigger engagement</li>
              </ul>
            </Card>
          </div>

          {/* Score Display Section */}
          <div>
            {scoreData ? (
              <div className="space-y-4">
                <ViralScoreCard data={scoreData} contentPreview={contentInput} />
                <div className="flex gap-3">
                  <Button
                    onClick={handleCopyScore}
                    variant="outline"
                    className="flex-1 border-slate-600 text-white hover:bg-slate-800"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Score
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="flex-1 border-slate-600 text-white hover:bg-slate-800"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-12 flex items-center justify-center min-h-96">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400">
                    {isAnalyzing ? "Analyzing your content..." : 'Paste your content and click "Analyze Viral Potential" to get started'}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Score Breakdown Info */}
        <div className="mt-12 grid md:grid-cols-5 gap-4">
          {[
            { label: "Viral Score", desc: "Overall virality potential" },
            { label: "Engagement", desc: "Predicted likes/comments" },
            { label: "Hook Strength", desc: "Opening impact" },
            { label: "Emotional Impact", desc: "Emotional resonance" },
            { label: "CTR Prediction", desc: "Click-through rate" },
          ].map((item, idx) => (
            <Card key={idx} className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-4 text-center">
              <p className="text-sm font-medium text-slate-300 mb-1">{item.label}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
