import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Copy, Download, Zap, BookOpen, Twitter, Mail, Instagram, Facebook } from "lucide-react";
import { toast } from "sonner";

type AutomationType = "blog" | "tweet" | "email" | "instagram" | "facebook";

const automationTypes = [
  { id: "blog", label: "Blog Writer", icon: BookOpen, description: "Generate full blog posts" },
  { id: "tweet", label: "Tweet Writer", icon: Twitter, description: "Create engaging tweets" },
  { id: "email", label: "Email Campaign", icon: Mail, description: "Write email campaigns" },
  { id: "instagram", label: "Instagram Post", icon: Instagram, description: "Create Instagram content" },
  { id: "facebook", label: "Facebook Post", icon: Facebook, description: "Generate Facebook posts" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "hinglish", label: "Hinglish" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "mr", label: "Marathi" },
  { value: "gu", label: "Gujarati" },
  { value: "bn", label: "Bengali" },
  { value: "pa", label: "Punjabi" },
];

export default function AdvancedAutomation() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<AutomationType>("blog");
  const [formData, setFormData] = useState({
    niche: "",
    topic: "",
    tone: "",
    language: "en",
  });
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const blogMutation = trpc.automationGenerators.generateBlog.useMutation();
  const tweetMutation = trpc.automationGenerators.generateTweets.useMutation();
  const emailMutation = trpc.automationGenerators.generateEmail.useMutation();
  const instagramMutation = trpc.automationGenerators.generateInstagram.useMutation();
  const facebookMutation = trpc.automationGenerators.generateFacebook.useMutation();

  const handleGenerate = async () => {
    if (!formData.niche || !formData.topic || !formData.tone) {
      toast.error("Please fill in all fields");
      return;
    }

    if (user?.subscriptionTier !== "pro") {
      toast.error("Advanced automation is only available for Pro users");
      return;
    }

    setLoading(true);
    try {
      let result;
      const input = {
        niche: formData.niche,
        topic: formData.topic,
        tone: formData.tone,
        language: formData.language,
      };

      switch (selectedType) {
        case "blog":
          result = await blogMutation.mutateAsync(input);
          break;
        case "tweet":
          result = await tweetMutation.mutateAsync(input);
          break;
        case "email":
          result = await emailMutation.mutateAsync(input);
          break;
        case "instagram":
          result = await instagramMutation.mutateAsync(input);
          break;
        case "facebook":
          result = await facebookMutation.mutateAsync(input);
          break;
      }

      setGeneratedContent(result);
      toast.success("Content generated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = (format: "pdf" | "csv" | "txt" | "json") => {
    const content = JSON.stringify(generatedContent, null, 2);
    const element = document.createElement("a");
    element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute("download", `automation-content.${format}`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded as ${format.toUpperCase()}`);
  };

  if (user?.subscriptionTier !== "pro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-purple-500/20 p-8 text-center">
            <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Pro Feature</h2>
            <p className="text-slate-300 mb-6">Advanced automation is only available for Pro users. Upgrade now to unlock unlimited content generation!</p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Upgrade to Pro
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Advanced Automation</h1>
          <p className="text-slate-300">Generate content for multiple platforms automatically</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Automation Type Selection */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-purple-500/20 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">Select Type</h3>
              <div className="space-y-2">
                {automationTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id as AutomationType)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedType === type.id
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <div>
                          <div className="font-semibold">{type.label}</div>
                          <div className="text-xs opacity-75">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Form and Output */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Form */}
            <Card className="bg-slate-800/50 border-purple-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Content Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Niche</label>
                  <Input
                    placeholder="e.g., Tech, Fashion, Health"
                    value={formData.niche}
                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
                  <Input
                    placeholder="What should the content be about?"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tone</label>
                  <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                  <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Generated Content */}
            {generatedContent && (
              <Card className="bg-slate-800/50 border-purple-500/20 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Generated Content</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload("json")}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      JSON
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload("txt")}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      TXT
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedType === "blog" && (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-white">{generatedContent.title}</h4>
                        <button
                          onClick={() => handleCopy(generatedContent.title)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-slate-300 mb-4">{generatedContent.introduction}</p>
                      {generatedContent.sections?.map((section: any, idx: number) => (
                        <div key={idx} className="mb-4">
                          <h5 className="font-semibold text-white mb-2">{section.heading}</h5>
                          <p className="text-slate-300 text-sm">{section.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedType === "tweet" && (
                    <div>
                      {generatedContent.tweets?.map((tweet: string, idx: number) => (
                        <div key={idx} className="mb-3 p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <p className="text-slate-200 text-sm flex-1">{tweet}</p>
                            <button
                              onClick={() => handleCopy(tweet)}
                              className="text-slate-400 hover:text-white ml-2"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedType === "email" && (
                    <div>
                      <div className="mb-3">
                        <p className="text-slate-400 text-sm">Subject:</p>
                        <p className="text-white font-semibold">{generatedContent.subject}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-slate-400 text-sm">Body:</p>
                        {generatedContent.body?.map((para: string, idx: number) => (
                          <p key={idx} className="text-slate-300 text-sm mb-2">
                            {para}
                          </p>
                        ))}
                      </div>
                      <div className="mb-3">
                        <p className="text-slate-400 text-sm">CTA:</p>
                        <p className="text-white">{generatedContent.callToAction}</p>
                      </div>
                    </div>
                  )}

                  {(selectedType === "instagram" || selectedType === "facebook") && (
                    <div>
                      <div className="mb-3">
                        <p className="text-slate-300">{generatedContent.caption}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-slate-400 text-sm">Hashtags:</p>
                        <p className="text-slate-300">{generatedContent.hashtags?.join(" ")}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-slate-400 text-sm">Best Time to Post:</p>
                        <p className="text-white">{generatedContent.bestTime}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
