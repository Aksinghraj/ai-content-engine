import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Bot,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Heart,
  ThumbsDown,
  Minus,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  BookOpen,
  Settings,
  BarChart3,
  Zap,
  Shield,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
}

interface AutoReplyRule {
  id: string;
  platform: string;
  intent: string;
  isActive: boolean;
  replyTemplate: string;
}

interface SimulatedComment {
  id: string;
  platform: string;
  author: string;
  content: string;
  sentiment?: "positive" | "neutral" | "negative";
  sentimentScore?: number;
  intent?: string;
  suggestedReply?: string;
  isAnalyzing?: boolean;
}

const DEMO_COMMENTS: SimulatedComment[] = [
  { id: "1", platform: "instagram", author: "@sarah_fitness", content: "Love this product! It completely changed my morning routine 🔥", sentiment: "positive", sentimentScore: 0.95, intent: "praise" },
  { id: "2", platform: "twitter", author: "@techguy42", content: "How does this compare to the competitor? Does it work on mobile?", sentiment: "neutral", sentimentScore: 0.5, intent: "question" },
  { id: "3", platform: "facebook", author: "Mike Johnson", content: "I've been waiting 2 weeks for my order and no update. Very frustrated!", sentiment: "negative", sentimentScore: 0.1, intent: "support_issue" },
  { id: "4", platform: "linkedin", author: "Jennifer Lee", content: "This is exactly what our team needs. Can you share pricing for enterprise?", sentiment: "positive", sentimentScore: 0.8, intent: "question" },
  { id: "5", platform: "tiktok", author: "@viral_creator", content: "Buy followers here!! 💰💰 DM me", sentiment: "negative", sentimentScore: 0.05, intent: "spam" },
];

const PLATFORMS = ["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"];
const PLATFORM_EMOJIS: Record<string, string> = {
  instagram: "📸", twitter: "🐦", linkedin: "💼",
  facebook: "👥", youtube: "▶️", tiktok: "🎵",
};

const INTENT_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  question: { label: "Question", color: "bg-blue-500/20 text-blue-300 border-blue-500/50", icon: MessageSquare },
  praise: { label: "Praise", color: "bg-green-500/20 text-green-300 border-green-500/50", icon: Heart },
  support_issue: { label: "Support Issue", color: "bg-red-500/20 text-red-300 border-red-500/50", icon: AlertTriangle },
  spam: { label: "Spam", color: "bg-gray-500/20 text-gray-300 border-gray-500/50", icon: Shield },
  other: { label: "Other", color: "bg-purple-500/20 text-purple-300 border-purple-500/50", icon: MessageSquare },
};

function AutoReplyContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [comments, setComments] = useState<SimulatedComment[]>(DEMO_COMMENTS);
  const [testComment, setTestComment] = useState("");
  const [testPlatform, setTestPlatform] = useState("instagram");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseEntry[]>([
    { id: "1", title: "Product FAQ", content: "Our product is available in 3 sizes. Shipping takes 3-5 business days. Returns accepted within 30 days." },
    { id: "2", title: "Pricing Info", content: "Basic plan: $29/month. Pro plan: $79/month. Enterprise: Contact us for custom pricing." },
  ]);
  const [newKbTitle, setNewKbTitle] = useState("");
  const [newKbContent, setNewKbContent] = useState("");
  const [autoReplyRules, setAutoReplyRules] = useState<AutoReplyRule[]>([
    { id: "1", platform: "instagram", intent: "praise", isActive: true, replyTemplate: "Thank you so much! 🙏 We're thrilled you love it!" },
    { id: "2", platform: "twitter", intent: "question", isActive: true, replyTemplate: "Great question! Our team will get back to you shortly. Feel free to DM us for faster support." },
    { id: "3", platform: "facebook", intent: "support_issue", isActive: false, replyTemplate: "We're so sorry to hear this! Please DM us your order number and we'll resolve this immediately." },
  ]);

  // tRPC mutations
  const analyzeSentimentMutation = trpc.enterprise.analyzeSentiment.useMutation();
  const generateReplyMutation = trpc.enterprise.generateAutoReply.useMutation();

  const handleAnalyzeComment = async (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, isAnalyzing: true } : c));

    try {
      const sentimentResult = await analyzeSentimentMutation.mutateAsync({ text: comment.content });

      if (sentimentResult.success) {
        const replyResult = await generateReplyMutation.mutateAsync({
          commentContent: comment.content,
          intent: sentimentResult.intent as "question" | "praise" | "support_issue" | "spam" | "other",
          platform: comment.platform,
        });

        setComments((prev) => prev.map((c) =>
          c.id === commentId ? {
            ...c,
            sentiment: sentimentResult.sentiment as "positive" | "neutral" | "negative",
            sentimentScore: sentimentResult.score,
            intent: sentimentResult.intent,
              suggestedReply: replyResult.success ? String(replyResult.reply || "") : undefined,
                isAnalyzing: false,
          } : c
        ));
        toast.success("Comment analyzed with AI!");
      }
    } catch (error) {
      setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, isAnalyzing: false } : c));
      toast.error("Failed to analyze comment");
    }
  };

  const handleTestAnalysis = async () => {
    if (!testComment.trim()) {
      toast.error("Please enter a comment to analyze");
      return;
    }

    setIsAnalyzing(true);
    try {
      const sentimentResult = await analyzeSentimentMutation.mutateAsync({ text: testComment });

      if (sentimentResult.success) {
        const replyResult = await generateReplyMutation.mutateAsync({
          commentContent: testComment,
          intent: sentimentResult.intent as "question" | "praise" | "support_issue" | "spam" | "other",
          platform: testPlatform,
        });

        const newComment: SimulatedComment = {
          id: `test-${Date.now()}`,
          platform: testPlatform,
          author: "@test_user",
          content: testComment,
          sentiment: sentimentResult.sentiment as "positive" | "neutral" | "negative",
          sentimentScore: sentimentResult.score,
          intent: sentimentResult.intent,
          suggestedReply: replyResult.success ? String(replyResult.reply || "") : undefined,
        };

        setComments((prev) => [newComment, ...prev]);
        setTestComment("");
        toast.success("Comment analyzed and reply generated! ✨");
      }
    } catch (error) {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddKnowledge = () => {
    if (!newKbTitle.trim() || !newKbContent.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }
    setKnowledgeBase((prev) => [...prev, {
      id: `kb-${Date.now()}`,
      title: newKbTitle,
      content: newKbContent,
    }]);
    setNewKbTitle("");
    setNewKbContent("");
    toast.success("Knowledge base entry added!");
  };

  const handleDeleteKnowledge = (id: string) => {
    setKnowledgeBase((prev) => prev.filter((k) => k.id !== id));
    toast.success("Entry removed");
  };

  const handleToggleRule = (id: string) => {
    setAutoReplyRules((prev) => prev.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const getSentimentIcon = (sentiment?: string) => {
    if (sentiment === "positive") return <Heart className="w-4 h-4 text-green-400" />;
    if (sentiment === "negative") return <ThumbsDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-yellow-400" />;
  };

  const getSentimentColor = (sentiment?: string) => {
    if (sentiment === "positive") return "text-green-400";
    if (sentiment === "negative") return "text-red-400";
    return "text-yellow-400";
  };

  const positiveCount = comments.filter((c) => c.sentiment === "positive").length;
  const negativeCount = comments.filter((c) => c.sentiment === "negative").length;
  const neutralCount = comments.filter((c) => c.sentiment === "neutral").length;
  const escalatedCount = comments.filter((c) => c.intent === "support_issue" && c.sentiment === "negative").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Bot className="w-10 h-10 text-blue-400" />
            Auto-Reply System
          </h1>
          <p className="text-blue-200">
            AI-powered sentiment analysis and automated replies for all your social media comments
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm">Positive</p>
                  <p className="text-3xl font-bold text-white">{positiveCount}</p>
                </div>
                <Heart className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-300 text-sm">Neutral</p>
                  <p className="text-3xl font-bold text-white">{neutralCount}</p>
                </div>
                <Minus className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300 text-sm">Negative</p>
                  <p className="text-3xl font-bold text-white">{negativeCount}</p>
                </div>
                <ThumbsDown className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-300 text-sm">Escalated</p>
                  <p className="text-3xl font-bold text-white">{escalatedCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-blue-500/20">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="test" className="data-[state=active]:bg-blue-600">
              <Brain className="w-4 h-4 mr-2" />
              Test AI
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="data-[state=active]:bg-blue-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="rules" className="data-[state=active]:bg-blue-600">
              <Settings className="w-4 h-4 mr-2" />
              Rules
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Comments & Sentiment</h2>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                <Zap className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </div>

            <div className="space-y-4">
              {comments.map((comment) => {
                const intentInfo = comment.intent ? INTENT_LABELS[comment.intent] : null;
                const IntentIcon = intentInfo?.icon;
                return (
                  <Card key={comment.id} className="bg-slate-800/50 border-blue-500/20 hover:border-blue-500/40 transition">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Comment Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-xl">{PLATFORM_EMOJIS[comment.platform]}</span>
                              <span className="text-blue-300 font-medium text-sm">{comment.author}</span>
                              {comment.sentiment && (
                                <div className={`flex items-center gap-1 ${getSentimentColor(comment.sentiment)}`}>
                                  {getSentimentIcon(comment.sentiment)}
                                  <span className="text-xs capitalize">{comment.sentiment}</span>
                                  {comment.sentimentScore !== undefined && (
                                    <span className="text-xs opacity-70">({Math.round(comment.sentimentScore * 100)}%)</span>
                                  )}
                                </div>
                              )}
                              {intentInfo && IntentIcon && (
                                <Badge className={`border ${intentInfo.color} text-xs`}>
                                  <IntentIcon className="w-3 h-3 mr-1" />
                                  {intentInfo.label}
                                </Badge>
                              )}
                              {comment.intent === "support_issue" && comment.sentiment === "negative" && (
                                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50 text-xs">
                                  ⚠️ Needs Attention
                                </Badge>
                              )}
                            </div>
                            <p className="text-white">{comment.content}</p>
                          </div>

                          {!comment.sentiment && (
                            <Button
                              size="sm"
                              onClick={() => handleAnalyzeComment(comment.id)}
                              disabled={comment.isAnalyzing}
                              className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                            >
                              {comment.isAnalyzing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Brain className="w-4 h-4 mr-1" />
                                  Analyze
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Suggested Reply */}
                        {comment.suggestedReply && (
                          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-300 text-sm font-medium">AI Suggested Reply</span>
                            </div>
                            <p className="text-blue-100 text-sm">{comment.suggestedReply}</p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  navigator.clipboard.writeText(comment.suggestedReply!);
                                  toast.success("Reply copied!");
                                }}
                                className="text-blue-300 hover:text-white hover:bg-blue-500/20 text-xs h-7"
                              >
                                Copy Reply
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAnalyzeComment(comment.id)}
                                className="text-blue-300 hover:text-white hover:bg-blue-500/20 text-xs h-7"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Regenerate
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Test AI Tab */}
          <TabsContent value="test" className="space-y-6">
            <Card className="bg-slate-800/50 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  Test Sentiment Analysis & Auto-Reply
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Enter any comment to see how the AI analyzes sentiment and generates a reply
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3 space-y-2">
                    <Label className="text-white">Comment Text</Label>
                    <Textarea
                      placeholder="Enter a comment to analyze... e.g. 'Your product is amazing! I love it!' or 'My order hasn't arrived yet, very disappointed'"
                      value={testComment}
                      onChange={(e) => setTestComment(e.target.value)}
                      className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-blue-300/50 min-h-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Platform</Label>
                    <Select value={testPlatform} onValueChange={setTestPlatform}>
                      <SelectTrigger className="bg-slate-700/50 border-blue-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {PLATFORM_EMOJIS[p]} {p.charAt(0).toUpperCase() + p.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleTestAnalysis}
                  disabled={isAnalyzing || !testComment.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze & Generate Reply
                    </>
                  )}
                </Button>

                {/* Example Comments */}
                <div className="space-y-2">
                  <p className="text-blue-300 text-sm font-medium">Try these examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Love your content! Keep it up! 🔥",
                      "How much does the premium plan cost?",
                      "My account has been charged twice, please fix this!",
                      "Buy cheap followers here!! DM me",
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => setTestComment(example)}
                        className="text-xs px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 hover:bg-blue-500/20 transition"
                      >
                        {example.substring(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <Card className="bg-slate-800/50 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Knowledge Base
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Add information the AI uses to generate contextual replies (FAQs, pricing, policies)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Title</Label>
                    <Input
                      placeholder="e.g. Product FAQ, Shipping Policy..."
                      value={newKbTitle}
                      onChange={(e) => setNewKbTitle(e.target.value)}
                      className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-blue-300/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Content</Label>
                    <Input
                      placeholder="Enter the information..."
                      value={newKbContent}
                      onChange={(e) => setNewKbContent(e.target.value)}
                      className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-blue-300/50"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddKnowledge}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Knowledge Base
                </Button>

                <div className="space-y-3 mt-4">
                  {knowledgeBase.map((entry) => (
                    <Card key={entry.id} className="bg-slate-700/50 border-blue-500/10">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">{entry.title}</p>
                            <p className="text-blue-200 text-sm mt-1 line-clamp-2">{entry.content}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteKnowledge(entry.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <Card className="bg-slate-800/50 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  Auto-Reply Rules
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Configure when and how the AI automatically replies to comments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {autoReplyRules.map((rule) => {
                  const intentInfo = INTENT_LABELS[rule.intent];
                  const IntentIcon = intentInfo?.icon;
                  return (
                    <Card key={rule.id} className={`bg-slate-700/50 border ${rule.isActive ? "border-blue-500/30" : "border-slate-600/30"} transition`}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xl">{PLATFORM_EMOJIS[rule.platform]}</span>
                              <span className="text-white font-medium capitalize">{rule.platform}</span>
                              {intentInfo && IntentIcon && (
                                <Badge className={`border ${intentInfo.color} text-xs`}>
                                  <IntentIcon className="w-3 h-3 mr-1" />
                                  {intentInfo.label}
                                </Badge>
                              )}
                              {rule.isActive ? (
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/50 text-xs">Active</Badge>
                              ) : (
                                <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/50 text-xs">Inactive</Badge>
                              )}
                            </div>
                            <p className="text-blue-200 text-sm italic">"{rule.replyTemplate}"</p>
                          </div>
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => handleToggleRule(rule.id)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm font-medium">How Auto-Reply Works</span>
                  </div>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• AI analyzes incoming comments for sentiment and intent</li>
                    <li>• Matches the comment to the appropriate rule</li>
                    <li>• Generates a contextual reply using your knowledge base</li>
                    <li>• Negative/support issues are flagged for human review</li>
                    <li>• Spam is automatically filtered and not replied to</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AutoReplySystem() {
  return (
    <DashboardLayout>
      <AutoReplyContent />
    </DashboardLayout>
  );
}
