import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  MessageCircle,
  Flag,
  Bell,
  User,
  BarChart3,
  Filter,
  RefreshCw,
  Eye,
  ThumbsDown,
  ThumbsUp,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

// Escalation item type
type EscalationItem = {
  id: string;
  platform: string;
  author: string;
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  intent: "question" | "praise" | "support_issue" | "spam";
  severity: "high" | "medium" | "low";
  status: "pending" | "in_review" | "resolved";
  escalatedAt: Date;
  postId: string;
  notes: string;
};

// Mock escalated items
const MOCK_ESCALATIONS: EscalationItem[] = [
  {
    id: "esc-1",
    platform: "instagram",
    author: "@angry_customer_123",
    content: "This product is absolutely terrible! I've been waiting 3 weeks and still nothing. This is fraud! I'm reporting you to consumer protection!",
    sentiment: "negative" as const,
    sentimentScore: 0.12,
    intent: "support_issue" as const,
    severity: "high" as const,
    status: "pending" as const,
    escalatedAt: new Date(Date.now() - 1000 * 60 * 15),
    postId: "post-123",
    notes: "",
  },
  {
    id: "esc-2",
    platform: "twitter",
    author: "@frustrated_user",
    content: "Your customer service is the worst I've ever experienced. Nobody responds, nobody cares. I'm going to post about this everywhere!",
    sentiment: "negative" as const,
    sentimentScore: 0.08,
    intent: "support_issue" as const,
    severity: "high" as const,
    status: "in_review" as const,
    escalatedAt: new Date(Date.now() - 1000 * 60 * 45),
    postId: "post-456",
    notes: "Assigned to support team",
  },
  {
    id: "esc-3",
    platform: "facebook",
    author: "John Smith",
    content: "I'm disappointed with the quality. Expected much better for the price. Will not be purchasing again.",
    sentiment: "negative" as const,
    sentimentScore: 0.25,
    intent: "support_issue" as const,
    severity: "medium" as const,
    status: "pending" as const,
    escalatedAt: new Date(Date.now() - 1000 * 60 * 90),
    postId: "post-789",
    notes: "",
  },
  {
    id: "esc-4",
    platform: "linkedin",
    author: "Sarah Johnson",
    content: "I have serious concerns about the data privacy practices mentioned in your latest update. This needs immediate clarification.",
    sentiment: "negative" as const,
    sentimentScore: 0.3,
    intent: "question" as const,
    severity: "medium" as const,
    status: "resolved" as const,
    escalatedAt: new Date(Date.now() - 1000 * 60 * 180),
    postId: "post-101",
    notes: "Responded with privacy policy link",
  },
];

const MOCK_SENTIMENT_STATS = {
  totalAnalyzed: 1247,
  positive: 684,
  neutral: 389,
  negative: 174,
  escalated: 23,
  resolved: 18,
  avgResponseTime: "4.2 min",
  autoReplyRate: 87,
};

const PLATFORM_EMOJIS: Record<string, string> = {
  instagram: "📸", twitter: "🐦", linkedin: "💼",
  facebook: "👥", youtube: "▶️", tiktok: "🎵",
};

const SEVERITY_COLORS: Record<string, string> = {
  high: "bg-red-500/20 text-red-300 border-red-500/50",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
  low: "bg-blue-500/20 text-blue-300 border-blue-500/50",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-500/20 text-orange-300 border-orange-500/50",
  in_review: "bg-blue-500/20 text-blue-300 border-blue-500/50",
  resolved: "bg-green-500/20 text-green-300 border-green-500/50",
};

function SentimentEscalationContent() {
  const [escalations, setEscalations] = useState<typeof MOCK_ESCALATIONS>(MOCK_ESCALATIONS);
  const [selectedItem, setSelectedItem] = useState<typeof MOCK_ESCALATIONS[0] | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "in_review" | "resolved">("all");
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  const generateReplyMutation = trpc.enterprise.generateAutoReply.useMutation();

  const filteredEscalations = escalations.filter((e) =>
    filterStatus === "all" ? true : e.status === filterStatus
  );

  const handleGenerateReply = async () => {
    if (!selectedItem) return;
    setIsGeneratingReply(true);
    try {
      const result = await generateReplyMutation.mutateAsync({
        commentContent: selectedItem.content,
        platform: selectedItem.platform,
        intent: selectedItem.intent === "support_issue" ? "support_issue" : selectedItem.intent === "question" ? "question" : selectedItem.intent === "praise" ? "praise" : "other",
      });
      if (result.success) {
        setReplyText(String(result.reply || ""));
        toast.success("Reply generated!");
      }
    } catch {
      toast.error("Failed to generate reply");
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleUpdateStatus = (id: string, status: "pending" | "in_review" | "resolved") => {
    setEscalations((prev) =>
      prev.map((e) => e.id === id ? { ...e, status } : e)
    );
    if (selectedItem?.id === id) {
      setSelectedItem((prev) => prev ? { ...prev, status } : null);
    }
    toast.success(`Status updated to ${status.replace("_", " ")}`);
  };

  const pendingCount = escalations.filter((e) => e.status === "pending").length;
  const highSeverityCount = escalations.filter((e) => e.severity === "high" && e.status !== "resolved").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950/30 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <AlertTriangle className="w-10 h-10 text-red-400" />
              Sentiment Escalation
            </h1>
            <p className="text-red-200">Monitor negative sentiment and manage escalated comments requiring human review</p>
          </div>
          <div className="flex items-center gap-2">
            {highSeverityCount > 0 && (
              <Badge className="bg-red-500/20 text-red-300 border-red-500/50 animate-pulse">
                <Bell className="w-3 h-3 mr-1" />
                {highSeverityCount} High Priority
              </Badge>
            )}
            {pendingCount > 0 && (
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50">
                <Clock className="w-3 h-3 mr-1" />
                {pendingCount} Pending
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Analyzed", value: MOCK_SENTIMENT_STATS.totalAnalyzed.toLocaleString(), icon: BarChart3, color: "text-blue-400", border: "border-blue-500/20" },
            { label: "Positive", value: MOCK_SENTIMENT_STATS.positive.toLocaleString(), icon: ThumbsUp, color: "text-green-400", border: "border-green-500/20" },
            { label: "Negative", value: MOCK_SENTIMENT_STATS.negative.toLocaleString(), icon: ThumbsDown, color: "text-red-400", border: "border-red-500/20" },
            { label: "Auto-Reply Rate", value: `${MOCK_SENTIMENT_STATS.autoReplyRate}%`, icon: MessageCircle, color: "text-purple-400", border: "border-purple-500/20" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className={`bg-slate-800/50 ${stat.border}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color} opacity-80`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sentiment Distribution */}
        <Card className="bg-slate-800/50 border-slate-600/20">
          <CardHeader>
            <CardTitle className="text-white">Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-center">
              <div
                className="h-4 rounded-l-full bg-green-500 transition-all"
                style={{ width: `${(MOCK_SENTIMENT_STATS.positive / MOCK_SENTIMENT_STATS.totalAnalyzed) * 100}%` }}
              />
              <div
                className="h-4 bg-slate-500 transition-all"
                style={{ width: `${(MOCK_SENTIMENT_STATS.neutral / MOCK_SENTIMENT_STATS.totalAnalyzed) * 100}%` }}
              />
              <div
                className="h-4 rounded-r-full bg-red-500 transition-all"
                style={{ width: `${(MOCK_SENTIMENT_STATS.negative / MOCK_SENTIMENT_STATS.totalAnalyzed) * 100}%` }}
              />
            </div>
            <div className="flex gap-6 mt-3 text-sm">
              <span className="text-green-400">✓ Positive: {Math.round((MOCK_SENTIMENT_STATS.positive / MOCK_SENTIMENT_STATS.totalAnalyzed) * 100)}%</span>
              <span className="text-slate-400">— Neutral: {Math.round((MOCK_SENTIMENT_STATS.neutral / MOCK_SENTIMENT_STATS.totalAnalyzed) * 100)}%</span>
              <span className="text-red-400">✗ Negative: {Math.round((MOCK_SENTIMENT_STATS.negative / MOCK_SENTIMENT_STATS.totalAnalyzed) * 100)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Escalation Queue */}
          <Card className="bg-slate-800/50 border-red-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-400" />
                  Escalation Queue
                </CardTitle>
                <div className="flex gap-2">
                  {(["all", "pending", "in_review", "resolved"] as const).map((s) => (
                    <Button
                      key={s}
                      variant={filterStatus === s ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilterStatus(s)}
                      className={filterStatus === s ? "bg-red-600 text-white h-7 text-xs" : "text-slate-400 h-7 text-xs"}
                    >
                      {s === "all" ? "All" : s === "in_review" ? "Review" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredEscalations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-400/30 mx-auto mb-2" />
                  <p className="text-slate-400">No escalations in this category</p>
                </div>
              ) : (
                filteredEscalations.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedItem?.id === item.id
                        ? "border-red-500/50 bg-red-500/10"
                        : "border-slate-600/30 bg-slate-700/30 hover:border-red-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{PLATFORM_EMOJIS[item.platform]}</span>
                        <span className="text-white text-sm font-medium">{item.author}</span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <Badge className={`${SEVERITY_COLORS[item.severity]} border text-xs`}>
                          {item.severity}
                        </Badge>
                        <Badge className={`${STATUS_COLORS[item.status]} border text-xs`}>
                          {item.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-slate-300 text-xs line-clamp-2">{item.content}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {Math.round((Date.now() - item.escalatedAt.getTime()) / 60000)} min ago
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Review Panel */}
          <Card className="bg-slate-800/50 border-slate-600/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                Review & Respond
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedItem ? (
                <div className="space-y-4">
                  {/* Comment Details */}
                  <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{PLATFORM_EMOJIS[selectedItem.platform]}</span>
                      <span className="text-white font-medium">{selectedItem.author}</span>
                      <Badge className={`${SEVERITY_COLORS[selectedItem.severity]} border text-xs ml-auto`}>
                        {selectedItem.severity} severity
                      </Badge>
                    </div>
                    <p className="text-slate-200 text-sm">{selectedItem.content}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/50 border text-xs">
                        Sentiment: {Math.round(selectedItem.sentimentScore * 100)}% negative
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50 border text-xs capitalize">
                        Intent: {selectedItem.intent.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={selectedItem.status === "in_review" ? "default" : "outline"}
                      onClick={() => handleUpdateStatus(selectedItem.id, "in_review")}
                      className={selectedItem.status === "in_review" ? "bg-blue-600" : "border-blue-500/30 text-blue-300"}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Mark In Review
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedItem.status === "resolved" ? "default" : "outline"}
                      onClick={() => handleUpdateStatus(selectedItem.id, "resolved")}
                      className={selectedItem.status === "resolved" ? "bg-green-600" : "border-green-500/30 text-green-300"}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Mark Resolved
                    </Button>
                  </div>

                  {/* Reply Generator */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-white text-sm font-medium">Response</label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleGenerateReply}
                        disabled={isGeneratingReply}
                        className="text-purple-300 hover:text-white h-7 text-xs"
                      >
                        {isGeneratingReply ? (
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3 mr-1" />
                        )}
                        AI Generate
                      </Button>
                    </div>
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response or click 'AI Generate' for a suggested reply..."
                      className="min-h-24 bg-slate-700/50 border-slate-600/30 text-white placeholder:text-slate-500 text-sm"
                    />
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!replyText.trim()}
                      onClick={() => {
                        toast.success("Response sent!");
                        setReplyText("");
                        handleUpdateStatus(selectedItem.id, "resolved");
                      }}
                    >
                      Send Response & Resolve
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Select an escalation to review</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SentimentEscalation() {
  return (
    <DashboardLayout>
      <SentimentEscalationContent />
    </DashboardLayout>
  );
}
