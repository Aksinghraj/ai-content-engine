import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Zap,
  Settings,
  TrendingUp,
  Heart,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  Copy,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Plus,
  Filter,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface AutoReplyTemplate {
  id: number;
  name: string;
  trigger: string;
  response: string;
  platforms: string[];
  sentiment: "positive" | "neutral" | "negative" | "all";
  isActive: boolean;
  responseRate: number;
  engagementScore: number;
  createdAt: string;
  updatedAt: string;
}

interface IncomingMessage {
  id: number;
  platform: string;
  author: string;
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  timestamp: string;
  isEscalated: boolean;
  suggestedReply: string;
  status: "pending" | "replied" | "escalated";
}

export default function AutoReplyAdvanced() {
  const [templates, setTemplates] = useState<AutoReplyTemplate[]>([
    {
      id: 1,
      name: "Thank You Response",
      trigger: "thank you|thanks|appreciate",
      response: "Thank you so much for the kind words! We really appreciate your support. 🙏",
      platforms: ["instagram", "twitter", "linkedin"],
      sentiment: "positive",
      isActive: true,
      responseRate: 94,
      engagementScore: 8.5,
      createdAt: "2026-07-01",
      updatedAt: "2026-07-03",
    },
    {
      id: 2,
      name: "Question Handler",
      trigger: "how|what|when|where|why|question",
      response: "Great question! I'd be happy to help. Could you provide more details so I can give you the best answer?",
      platforms: ["all"],
      sentiment: "neutral",
      isActive: true,
      responseRate: 87,
      engagementScore: 7.8,
      createdAt: "2026-06-28",
      updatedAt: "2026-07-02",
    },
  ]);

  const [messages, setMessages] = useState<IncomingMessage[]>([
    {
      id: 1,
      platform: "instagram",
      author: "john_doe",
      content: "This is amazing! Thank you for sharing this valuable content!",
      sentiment: "positive",
      sentimentScore: 0.95,
      timestamp: "2026-07-03T10:30:00Z",
      isEscalated: false,
      suggestedReply: "Thank you so much for the kind words! We really appreciate your support. 🙏",
      status: "pending",
    },
    {
      id: 2,
      platform: "twitter",
      author: "jane_smith",
      content: "How do I get started with this?",
      sentiment: "neutral",
      sentimentScore: 0.5,
      timestamp: "2026-07-03T09:45:00Z",
      isEscalated: false,
      suggestedReply: "Great question! I'd be happy to help. Could you provide more details so I can give you the best answer?",
      status: "pending",
    },
  ]);

  const [activeTab, setActiveTab] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [editingTemplate, setEditingTemplate] = useState<AutoReplyTemplate | null>(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = filterPlatform === "all" || msg.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

  const pendingMessages = filteredMessages.filter((m) => m.status === "pending");
  const repliedMessages = filteredMessages.filter((m) => m.status === "replied");
  const escalatedMessages = filteredMessages.filter((m) => m.isEscalated);

  const handleApplyReply = (messageId: number, reply: string) => {
    setMessages(
      messages.map((m) =>
        m.id === messageId ? { ...m, status: "replied" } : m
      )
    );
    toast.success("Reply sent successfully!");
  };

  const handleEscalate = (messageId: number) => {
    setMessages(
      messages.map((m) =>
        m.id === messageId ? { ...m, isEscalated: true, status: "escalated" } : m
      )
    );
    toast.info("Message escalated to support team");
  };

  const handleDeleteTemplate = (id: number) => {
    setTemplates(templates.filter((t) => t.id !== id));
    toast.success("Template deleted");
  };

  const handleToggleTemplate = (id: number) => {
    setTemplates(
      templates.map((t) =>
        t.id === id ? { ...t, isActive: !t.isActive } : t
      )
    );
  };

  const stats = {
    totalMessages: messages.length,
    pendingReplies: pendingMessages.length,
    repliedMessages: repliedMessages.length,
    escalatedMessages: escalatedMessages.length,
    avgResponseRate: Math.round(templates.reduce((a, b) => a + b.responseRate, 0) / templates.length),
    avgEngagementScore: (templates.reduce((a, b) => a + b.engagementScore, 0) / templates.length).toFixed(1),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Auto-Reply System</h1>
          <p className="text-purple-200">
            Intelligent automated responses powered by AI sentiment analysis and engagement tracking
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/20 p-4">
            <div className="space-y-2">
              <p className="text-blue-300 text-xs font-medium">Total Messages</p>
              <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-500/20 p-4">
            <div className="space-y-2">
              <p className="text-yellow-300 text-xs font-medium">Pending Replies</p>
              <p className="text-2xl font-bold text-white">{stats.pendingReplies}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/20 p-4">
            <div className="space-y-2">
              <p className="text-green-300 text-xs font-medium">Replied</p>
              <p className="text-2xl font-bold text-white">{stats.repliedMessages}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-500/20 p-4">
            <div className="space-y-2">
              <p className="text-red-300 text-xs font-medium">Escalated</p>
              <p className="text-2xl font-bold text-white">{stats.escalatedMessages}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/20 p-4">
            <div className="space-y-2">
              <p className="text-purple-300 text-xs font-medium">Avg Response Rate</p>
              <p className="text-2xl font-bold text-white">{stats.avgResponseRate}%</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border-pink-500/20 p-4">
            <div className="space-y-2">
              <p className="text-pink-300 text-xs font-medium">Engagement Score</p>
              <p className="text-2xl font-bold text-white">{stats.avgEngagementScore}</p>
            </div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Inbox ({pendingMessages.length})
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Templates ({templates.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:border-purple-500/50 focus:outline-none"
                />
              </div>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
              >
                <option value="all">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>

            {/* Messages List */}
            <div className="space-y-3">
              {pendingMessages.length === 0 ? (
                <Card className="bg-slate-800/30 border-slate-700/50 p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400">No pending messages</p>
                </Card>
              ) : (
                pendingMessages.map((message) => (
                  <Card
                    key={message.id}
                    className="bg-slate-800/50 border-slate-700/50 p-4 hover:border-purple-500/30 transition-all"
                  >
                    <div className="space-y-4">
                      {/* Message Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {message.author.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{message.author}</p>
                            <p className="text-xs text-slate-400">
                              {message.platform.charAt(0).toUpperCase() + message.platform.slice(1)} •{" "}
                              {new Date(message.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              message.sentiment === "positive"
                                ? "bg-green-500/20 text-green-300 border-green-500/50"
                                : message.sentiment === "negative"
                                ? "bg-red-500/20 text-red-300 border-red-500/50"
                                : "bg-slate-500/20 text-slate-300 border-slate-500/50"
                            }
                          >
                            {message.sentiment} ({(message.sentimentScore * 100).toFixed(0)}%)
                          </Badge>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="bg-slate-700/30 p-3 rounded-lg">
                        <p className="text-slate-200">{message.content}</p>
                      </div>

                      {/* Suggested Reply */}
                      <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded-lg">
                        <p className="text-xs text-purple-300 mb-2 font-semibold">AI Suggested Reply:</p>
                        <p className="text-slate-200 text-sm">{message.suggestedReply}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleApplyReply(message.id, message.suggestedReply)}
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Reply
                        </Button>
                        <Button
                          onClick={() => handleEscalate(message.id)}
                          size="sm"
                          variant="outline"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Escalate
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Auto-Reply Templates</h3>
              <Button
                onClick={() => setShowNewTemplate(!showNewTemplate)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </div>

            {/* New Template Form */}
            {showNewTemplate && (
              <Card className="bg-slate-800/50 border-purple-500/30 p-6 space-y-4">
                <input
                  type="text"
                  placeholder="Template Name"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-purple-500/50 focus:outline-none"
                />
                <textarea
                  placeholder="Trigger Keywords (comma-separated)"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-purple-500/50 focus:outline-none"
                />
                <textarea
                  placeholder="Auto-Reply Response"
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-purple-500/50 focus:outline-none"
                />
                <div className="flex gap-2">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600">Create Template</Button>
                  <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* Templates List */}
            <div className="space-y-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-slate-800/50 border-slate-700/50 p-4 hover:border-purple-500/30 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-semibold">{template.name}</h4>
                          <Badge className={template.isActive ? "bg-green-500/20 text-green-300" : "bg-slate-500/20 text-slate-300"}>
                            {template.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">
                          Triggers: <span className="text-purple-300">{template.trigger}</span>
                        </p>
                        <p className="text-slate-200 text-sm">{template.response}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleTemplate(template.id)}
                        >
                          {template.isActive ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700/50">
                      <div>
                        <p className="text-xs text-slate-400">Response Rate</p>
                        <p className="text-lg font-bold text-green-400">{template.responseRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Engagement</p>
                        <p className="text-lg font-bold text-blue-400">{template.engagementScore}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Platforms</p>
                        <p className="text-xs text-slate-300">{template.platforms.join(", ")}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Response Performance */}
              <Card className="bg-slate-800/50 border-slate-700/50 p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Response Performance
                </h3>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div key={template.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">{template.name}</span>
                        <span className="text-green-400 font-semibold">{template.responseRate}%</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${template.responseRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Engagement Metrics */}
              <Card className="bg-slate-800/50 border-slate-700/50 p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Engagement Metrics
                </h3>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div key={template.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">{template.name}</span>
                        <span className="text-pink-400 font-semibold">{template.engagementScore}/10</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full"
                          style={{ width: `${(template.engagementScore / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Message Status Distribution */}
            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                Message Status Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-400">{stats.pendingReplies}</p>
                  <p className="text-slate-400 text-sm">Pending Replies</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">{stats.repliedMessages}</p>
                  <p className="text-slate-400 text-sm">Replied</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-400">{stats.escalatedMessages}</p>
                  <p className="text-slate-400 text-sm">Escalated</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
