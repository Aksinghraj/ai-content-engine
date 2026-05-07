import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Save, RefreshCw } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const TONE_OPTIONS = [
  { value: "formal", label: "Formal", description: "Professional and structured" },
  { value: "casual", label: "Casual", description: "Friendly and conversational" },
  { value: "humorous", label: "Humorous", description: "Witty and entertaining" },
  { value: "inspirational", label: "Inspirational", description: "Motivating and uplifting" },
  { value: "educational", label: "Educational", description: "Informative and detailed" },
];

export default function BrandVoice() {
  const [formData, setFormData] = useState({
    brandName: "",
    tagline: "",
    mission: "",
    targetAudience: "",
    keyValues: "",
    keywords: "",
    tone: "casual",
    energyLevel: 50,
    uniqueVoiceTraits: "",
    exampleContent: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");
  const [generatedGuidelines, setGeneratedGuidelines] = useState<any>(null);

  const generateMutation = trpc.brandVoice.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedGuidelines(data.guidelines);
      setSavedMessage("Brand voice guidelines generated successfully!");
      setError("");
      setIsSaving(false);
      setTimeout(() => setSavedMessage(""), 3000);
    },
    onError: (err) => {
      setError(err.message || "Failed to generate brand voice guidelines");
      setIsSaving(false);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToneChange = (tone: string) => {
    setFormData((prev) => ({ ...prev, tone }));
  };

  const handleEnergyChange = (value: number[]) => {
    setFormData((prev) => ({ ...prev, energyLevel: value[0] }));
  };

  const handleSave = async () => {
    if (!formData.brandName.trim() || !formData.mission.trim() || !formData.targetAudience.trim()) {
      setError("Please fill in Brand Name, Mission, and Target Audience");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const keywordsList = formData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);

      const valuesList = formData.keyValues
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);

      await generateMutation.mutateAsync({
        brandName: formData.brandName,
        mission: formData.mission,
        targetAudience: formData.targetAudience,
        tone: formData.tone,
        values: valuesList,
        keywords: keywordsList,
      });
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleReset = () => {
    setFormData({
      brandName: "",
      tagline: "",
      mission: "",
      targetAudience: "",
      keyValues: "",
      keywords: "",
      tone: "casual",
      energyLevel: 50,
      uniqueVoiceTraits: "",
      exampleContent: "",
    });
    setSavedMessage("");
    setError("");
    setGeneratedGuidelines(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-950 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold">Brand Voice & Creator Memory</h1>
          </div>
          <p className="text-slate-400">Train the AI to understand your unique brand voice and personality</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Brand Basics */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
              <h2 className="text-xl font-semibold mb-4">Brand Basics</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Brand Name *</label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    placeholder="e.g., TechVision Studios"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tagline</label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleInputChange}
                    placeholder="e.g., Empowering creators with AI"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mission Statement *</label>
                  <Textarea
                    name="mission"
                    value={formData.mission}
                    onChange={handleInputChange}
                    placeholder="Describe your brand's mission and purpose..."
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 min-h-24 resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Audience & Values */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
              <h2 className="text-xl font-semibold mb-4">Audience & Values</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience *</label>
                  <Textarea
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    placeholder="Describe your ideal audience (age, interests, pain points)..."
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 min-h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Core Values</label>
                  <Textarea
                    name="keyValues"
                    value={formData.keyValues}
                    onChange={handleInputChange}
                    placeholder="e.g., Innovation, Authenticity, Empowerment (comma-separated)"
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 min-h-20 resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Voice Characteristics */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
              <h2 className="text-xl font-semibold mb-4">Voice Characteristics</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Tone</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TONE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleToneChange(option.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          formData.tone === option.value
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-slate-700 bg-slate-800 hover:border-slate-600"
                        }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-slate-400">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Energy Level: {formData.energyLevel}%
                  </label>
                  <Slider
                    value={[formData.energyLevel]}
                    onValueChange={handleEnergyChange}
                    min={0}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>Calm</span>
                    <span>Energetic</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Unique Voice Traits</label>
                  <Textarea
                    name="uniqueVoiceTraits"
                    value={formData.uniqueVoiceTraits}
                    onChange={handleInputChange}
                    placeholder="e.g., Uses analogies, storytelling, data-driven, conversational..."
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 min-h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Keywords & Phrases</label>
                  <Textarea
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleInputChange}
                    placeholder="e.g., 'game-changing', 'cutting-edge', 'next-level' (comma-separated)"
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 min-h-20 resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Example Content */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6">
              <h2 className="text-xl font-semibold mb-4">Example Content</h2>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Paste examples of your best content
                </label>
                <Textarea
                  name="exampleContent"
                  value={formData.exampleContent}
                  onChange={handleInputChange}
                  placeholder="Paste 2-3 examples of your best tweets, posts, or content pieces..."
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 min-h-32 resize-none"
                />
                <p className="text-xs text-slate-400 mt-2">This helps the AI learn your unique style</p>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Generate Brand Voice
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 border-slate-600 text-white hover:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            {error && (
              <Card className="bg-red-900/20 border-red-700 p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </Card>
            )}

            {savedMessage && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-green-400 text-sm">
                ✓ {savedMessage}
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Brand Profile Preview</h2>

              <div className="space-y-4 text-sm">
                {formData.brandName && (
                  <div>
                    <div className="text-slate-400">Brand Name</div>
                    <div className="font-semibold text-white">{formData.brandName}</div>
                  </div>
                )}

                {formData.tagline && (
                  <div>
                    <div className="text-slate-400">Tagline</div>
                    <div className="font-semibold text-white">{formData.tagline}</div>
                  </div>
                )}

                <div>
                  <div className="text-slate-400">Tone</div>
                  <div className="font-semibold text-white capitalize">{formData.tone}</div>
                </div>

                <div>
                  <div className="text-slate-400">Energy Level</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                        style={{ width: `${formData.energyLevel}%` }}
                      />
                    </div>
                    <span className="font-semibold text-white">{formData.energyLevel}%</span>
                  </div>
                </div>

                {generatedGuidelines && (
                  <div className="pt-4 border-t border-slate-700">
                    <div className="mb-3">
                      <div className="text-slate-400 text-xs mb-1">Summary</div>
                      <p className="text-white text-xs leading-relaxed">{generatedGuidelines.summary}</p>
                    </div>
                    {generatedGuidelines.messagingPillars && generatedGuidelines.messagingPillars.length > 0 && (
                      <div>
                        <div className="text-slate-400 text-xs mb-1">Messaging Pillars</div>
                        <ul className="text-white text-xs space-y-1">
                          {generatedGuidelines.messagingPillars.slice(0, 3).map((pillar: string, idx: number) => (
                            <li key={idx}>• {pillar}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {!generatedGuidelines && (
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-slate-400 text-xs">
                      This profile will be used to generate content that matches your unique brand voice across all platforms.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
