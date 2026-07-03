import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function MediaGeneration() {
  const [imagePrompt, setImagePrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoDuration, setVideoDuration] = useState(15);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const generateImageMutation = trpc.aiMediaGeneration.generateImage.useMutation();
  const generateVideoMutation = trpc.aiMediaGeneration.generateVideo.useMutation();

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Enter an image description");
      return;
    }
    setIsGeneratingImage(true);
    try {
      const result = await generateImageMutation.mutateAsync({
        prompt: imagePrompt,
        platform: "instagram",
      });
      if (result.success && result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
        toast.success("Image generated! 🎨");
      } else {
        toast.error(result.error || "Failed to generate image");
      }
    } catch (error) {
      toast.error("Failed to generate image");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      toast.error("Enter a video description");
      return;
    }
    setIsGeneratingVideo(true);
    try {
      const result = await generateVideoMutation.mutateAsync({
        prompt: videoPrompt,
        duration: videoDuration,
        quality: "highest",
        platform: "youtube",
      });
      if (result.success && result.videoUrl) {
        setGeneratedVideoUrl(result.videoUrl);
        toast.success(`Video generating (${videoDuration}s)! 🎬`);
      } else {
        toast.error(result.error || "Failed to generate video");
      }
    } catch (error) {
      toast.error("Failed to generate video");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement("a");
    link.href = generatedImageUrl;
    link.download = `image-${Date.now()}.png`;
    link.click();
  };

  const handleDownloadVideo = () => {
    if (!generatedVideoUrl) return;
    const link = document.createElement("a");
    link.href = generatedVideoUrl;
    link.download = `video-${Date.now()}.mp4`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            Media Generation Studio
          </h1>
          <p className="text-purple-200">Create stunning images and videos with AI</p>
        </div>

        <Tabs defaultValue="image" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-purple-500/20">
            <TabsTrigger value="image">Generate Image</TabsTrigger>
            <TabsTrigger value="video">Generate Video</TabsTrigger>
          </TabsList>

          {/* Image Generation Tab */}
          <TabsContent value="image" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Image Generator
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Describe the image you want to create, and AI will generate it for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Image Description</Label>
                  <Textarea
                    placeholder="E.g., A serene mountain landscape at sunset with golden clouds..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="min-h-24 bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-300"
                  />
                  <p className="text-xs text-purple-300">Be descriptive for better results</p>
                </div>

                <Button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-lg"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Image...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>

                {generatedImageUrl && (
                  <div className="space-y-4 mt-6">
                    <div className="border-2 border-purple-500/30 rounded-lg overflow-hidden">
                      <img src={generatedImageUrl} alt="Generated" className="w-full h-auto" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={handleDownloadImage}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Generation Tab */}
          <TabsContent value="video" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Video Generator
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Create high-quality videos (15-90 seconds) from your description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Video Description</Label>
                  <Textarea
                    placeholder="E.g., A drone flying over a beautiful coastal city at sunset with waves crashing on the beach..."
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    className="min-h-24 bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-300"
                  />
                  <p className="text-xs text-purple-300">Be detailed for better video quality</p>
                </div>

                <div className="space-y-3 bg-slate-700/30 p-4 rounded-lg border border-purple-500/20">
                  <Label className="text-white font-semibold">Duration: {videoDuration} seconds</Label>
                  <input
                    type="range"
                    min="15"
                    max="90"
                    step="5"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-purple-400">
                    <span>15s (Short)</span>
                    <span>90s (Long)</span>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-sm text-blue-200">
                    ✨ <strong>Highest Quality:</strong> Videos are generated in the highest quality available
                  </p>
                </div>

                <Button
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo || !videoPrompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-lg"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Video
                    </>
                  )}
                </Button>

                {generatedVideoUrl && (
                  <div className="space-y-4 mt-6">
                    <div className="border-2 border-purple-500/30 rounded-lg overflow-hidden bg-black">
                      <video src={generatedVideoUrl} controls className="w-full h-auto" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleGenerateVideo}
                        disabled={isGeneratingVideo}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={handleDownloadVideo}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <Card className="bg-slate-800/50 border-purple-500/20 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-purple-200 text-sm">
            <div>
              <strong>📸 Image Generation:</strong> Use descriptive prompts with colors, styles, and mood. Example: "A vibrant sunset over mountains, oil painting style, warm colors"
            </div>
            <div>
              <strong>🎬 Video Generation:</strong> Describe the scene, camera movement, and atmosphere. Example: "Cinematic drone shot flying over a tropical beach with crystal clear water"
            </div>
            <div>
              <strong>⏱️ Duration:</strong> Shorter videos (15-30s) are ideal for social media, longer videos (60-90s) for storytelling
            </div>
            <div>
              <strong>💾 Download:</strong> Both images and videos can be downloaded and used across your social media platforms
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
