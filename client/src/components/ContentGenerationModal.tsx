import { useState } from "react";
import { X, Copy, Download, Share2 } from "lucide-react";

interface ContentVariation {
  id: number;
  title: string;
  content: string;
  platform: string;
  hooks: string[];
  hashtags: string[];
  engagementScore: number;
}

interface ContentGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  trendTitle: string;
  variations: ContentVariation[];
  isLoading?: boolean;
}

export default function ContentGenerationModal({
  isOpen,
  onClose,
  trendTitle,
  variations,
  isLoading = false,
}: ContentGenerationModalProps) {
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  if (!isOpen) return null;

  const current = variations[selectedVariation];

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 border-b border-purple-500/20 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">AI Content Variations</h2>
            <p className="text-sm text-gray-400">Trend: {trendTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400">Generating AI variations...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Variation Selector */}
              <div className="space-y-3">
                <h3 className="font-semibold text-purple-300">Select Variation</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {variations.map((variation, index) => (
                    <button
                      key={variation.id}
                      onClick={() => setSelectedVariation(index)}
                      className={`p-3 rounded-lg border-2 transition text-center ${
                        selectedVariation === index
                          ? "border-pink-500 bg-pink-500/10"
                          : "border-purple-500/30 bg-slate-800/50 hover:border-purple-500/50"
                      }`}
                    >
                      <div className="text-2xl font-bold text-purple-400">
                        {index + 1}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {variation.platform}
                      </div>
                      <div className="text-xs font-semibold text-pink-400 mt-1">
                        {variation.engagementScore}% score
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Variation Preview */}
              <div className="space-y-4 bg-slate-800/30 border border-purple-500/20 rounded-lg p-4">
                <div>
                  <h4 className="font-semibold text-purple-300 mb-2">Content</h4>
                  <p className="text-white whitespace-pre-wrap break-words">
                    {current.content}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-purple-300 mb-2">Hook</h4>
                  <p className="text-pink-300 italic">"{current.hooks[0]}"</p>
                </div>

                <div>
                  <h4 className="font-semibold text-purple-300 mb-2">Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {current.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Engagement Metrics */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-purple-500/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-400">
                      {current.engagementScore}%
                    </div>
                    <div className="text-xs text-gray-400">Engagement Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.floor(Math.random() * 50) + 20}K
                    </div>
                    <div className="text-xs text-gray-400">Est. Reach</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {Math.floor(Math.random() * 30) + 5}%
                    </div>
                    <div className="text-xs text-gray-400">Viral Potential</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={() => handleCopy(current.content, current.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition"
                >
                  <Copy className="w-4 h-4" />
                  {copiedId === current.id ? "Copied!" : "Copy Content"}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50 rounded-lg transition font-medium">
                  <Share2 className="w-4 h-4" />
                  Post Now
                </button>
              </div>

              {/* Footer Info */}
              <div className="text-xs text-gray-400 text-center border-t border-purple-500/20 pt-4">
                💡 Tip: Edit the content before posting to add your personal touch and brand voice
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
