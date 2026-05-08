import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Brain,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Lightbulb,
  Wand2,
  Zap,
} from "lucide-react";

export default function PersonalAI() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: `You are a powerful Personal AI assistant. You can answer ANY question on ANY topic. You are knowledgeable about everything - content creation, marketing, business, coding, science, history, math, health, relationships, career, technology, and more.

Your key abilities:
1. Answer ALL questions accurately and thoroughly - no topic is off limits
2. Generate content ideas and write in any style
3. Provide strategic advice for business and content growth
4. Help with coding, debugging, and technical problems
5. Explain complex topics simply
6. Brainstorm creative solutions
7. Provide career, relationship, and life advice
8. Help with research, analysis, and planning
9. Create social media strategies and viral content
10. Assist with SEO, marketing, and branding

Be conversational, helpful, and thorough. Provide detailed, actionable answers. Use markdown formatting for clarity. Remember context from the conversation.`,
    },
  ]);

  const chatMutation = trpc.aiAssistant.chat.useMutation({
    onSuccess: (response: { success: boolean; message: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.message,
        },
      ]);
    },
    onError: (_error: unknown) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    },
  });

  const handleSendMessage = (content: string) => {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);

    const conversationHistory = newMessages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    chatMutation.mutate({
      message: content,
      conversationHistory: conversationHistory.slice(0, -1),
    });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Your Personal AI</h1>
              <p className="text-xs text-slate-400">Learns your style, creates your content</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border-violet-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - AI Capabilities */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  What I Can Do
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Wand2 className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">Generate content in your unique voice</span>
                </div>
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">Brainstorm viral content ideas</span>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">Optimize for engagement & SEO</span>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">Learn your brand voice over time</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 backdrop-blur-sm border-violet-500/30">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Brain className="w-8 h-8 text-violet-400 mx-auto" />
                  <p className="text-sm font-semibold text-white">Personal Memory</p>
                  <p className="text-xs text-slate-400">
                    The more you chat, the better I understand your style and preferences.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => navigate("/generator")}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Content
            </Button>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3 flex flex-col h-full">
            <div className="flex-1 min-h-0">
              <AIChatBox
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={chatMutation.isPending}
                placeholder="Ask me anything about content creation, marketing, coding, or anything else..."
                height="calc(100vh - 200px)"
                emptyStateMessage={`Hi ${user.name}! I'm your Personal AI. Ask me to help with content ideas, writing, strategy, or anything else.`}
                suggestedPrompts={[
                  "Generate 5 viral content ideas for my niche",
                  "Help me write a LinkedIn post about AI tools",
                  "Create a content strategy for this week",
                  "Rewrite this in a more engaging tone",
                  "What's trending in content creation right now?",
                  "Help me brainstorm hooks for my next video",
                ]}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
