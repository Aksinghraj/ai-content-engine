import { Card } from "@/components/ui/card";
import { Flame, TrendingUp, Heart, Eye } from "lucide-react";
import { useEffect, useState } from "react";

interface ViralScoreData {
  viralScore: number;
  engagementPrediction: number;
  hookStrength: number;
  emotionalImpact: number;
  ctrPrediction: number;
}

interface ViralScoreCardProps {
  data: ViralScoreData;
  contentPreview?: string;
}

function ScoreGauge({ score, label, icon: Icon, color }: { score: number; label: string; icon: any; color: string }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < score) {
        current += Math.ceil(score / 20);
        setDisplayScore(Math.min(current, score));
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [score]);

  const getColorClass = (value: number) => {
    if (value >= 80) return "text-green-400";
    if (value >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getBackgroundColor = (value: number) => {
    if (value >= 80) return "from-green-600/20 to-green-600/10";
    if (value >= 60) return "from-yellow-600/20 to-yellow-600/10";
    return "from-red-600/20 to-red-600/10";
  };

  return (
    <div className={`bg-gradient-to-br ${getBackgroundColor(displayScore)} border border-slate-700 rounded-lg p-4 backdrop-blur-md`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${getColorClass(displayScore)}`} />
          <span className="text-sm font-medium text-slate-300">{label}</span>
        </div>
        <span className={`text-2xl font-bold ${getColorClass(displayScore)}`}>{displayScore}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${
            displayScore >= 80
              ? "from-green-500 to-green-400"
              : displayScore >= 60
              ? "from-yellow-500 to-yellow-400"
              : "from-red-500 to-red-400"
          } transition-all duration-500`}
          style={{ width: `${displayScore}%` }}
        />
      </div>
    </div>
  );
}

export default function ViralScoreCard({ data, contentPreview }: ViralScoreCardProps) {
  const overallScore = Math.round(
    (data.viralScore +
      data.engagementPrediction +
      data.hookStrength +
      data.emotionalImpact +
      data.ctrPrediction) /
      5
  );

  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { label: "Viral Potential", color: "text-green-400" };
    if (score >= 60) return { label: "Good Potential", color: "text-yellow-400" };
    return { label: "Needs Improvement", color: "text-red-400" };
  };

  const performance = getPerformanceLevel(overallScore);

  return (
    <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-8 space-y-6">
      {/* Overall Score */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-2 border-purple-500/50 mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">
              {overallScore}
            </div>
            <div className="text-xs text-slate-400 mt-1">/100</div>
          </div>
        </div>
        <h3 className={`text-xl font-bold ${performance.color} mb-2`}>{performance.label}</h3>
        <p className="text-slate-400 text-sm">
          This content has strong potential to perform well across platforms
        </p>
      </div>

      {/* Content Preview */}
      {contentPreview && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-xs font-medium text-slate-400 mb-2">CONTENT PREVIEW</p>
          <p className="text-slate-300 text-sm line-clamp-3">{contentPreview}</p>
        </div>
      )}

      {/* Score Gauges */}
      <div className="grid md:grid-cols-2 gap-4">
        <ScoreGauge
          score={data.viralScore}
          label="Viral Score"
          icon={Flame}
          color="text-orange-400"
        />
        <ScoreGauge
          score={data.engagementPrediction}
          label="Engagement"
          icon={Heart}
          color="text-pink-400"
        />
        <ScoreGauge
          score={data.hookStrength}
          label="Hook Strength"
          icon={TrendingUp}
          color="text-green-400"
        />
        <ScoreGauge
          score={data.emotionalImpact}
          label="Emotional Impact"
          icon={Eye}
          color="text-blue-400"
        />
      </div>

      {/* CTR Prediction */}
      <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300 mb-1">Predicted Click-Through Rate</p>
            <p className="text-xs text-slate-400">Based on similar high-performing content</p>
          </div>
          <div className="text-3xl font-bold text-blue-400">{data.ctrPrediction}%</div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <p className="text-xs font-medium text-slate-400 mb-3">RECOMMENDATIONS</p>
        <ul className="space-y-2">
          {overallScore >= 80 && (
            <li className="text-sm text-slate-300 flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>This content is ready to post. Consider posting during peak hours.</span>
            </li>
          )}
          {data.hookStrength < 70 && (
            <li className="text-sm text-slate-300 flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5">!</span>
              <span>Strengthen your hook to increase initial engagement.</span>
            </li>
          )}
          {data.emotionalImpact < 70 && (
            <li className="text-sm text-slate-300 flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5">!</span>
              <span>Add more emotional elements to resonate with your audience.</span>
            </li>
          )}
          {overallScore < 60 && (
            <li className="text-sm text-slate-300 flex items-start gap-2">
              <span className="text-red-400 mt-0.5">✕</span>
              <span>Consider rewriting this content with our AI Rewriter tool.</span>
            </li>
          )}
        </ul>
      </div>
    </Card>
  );
}
