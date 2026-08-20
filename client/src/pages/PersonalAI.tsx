import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Brain,
  Send,
  Loader2,
  Sparkles,
  Plus,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { LumaeLightPulse } from "@/components/LumaeLightPulse";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function PersonalAI() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.aiAssistant.chat.useMutation({
    onSuccess: (response: { success: boolean; message: string }) => {
      if (response.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: response.message,
            timestamp: new Date(),
          },
        ]);
      }
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Failed to get response. Please try again.");
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    chatMutation.mutate({
      message: input,
      conversationHistory: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-slate-400 mb-4">Please sign in to use the AI Assistant.</p>
            <a href={getLoginUrl()} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg inline-block">Sign In</a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[min(680px,calc(100dvh-10rem))] min-h-[560px] flex flex-col rounded-2xl border border-[#26262b] bg-[#09090b] overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#26262b] bg-[#141417] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg lumae-gradient-cta flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Assistant</h2>
              <p className="text-xs text-[#9a9aa2]">Powered by Advanced AI</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNewChat}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 min-h-0 p-6" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6366f1]/35 bg-[#141417]">
                  <Sparkles className="h-7 w-7 text-[#8b5cf6]" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Start a Conversation</h3>
                <p className="max-w-sm text-[#9a9aa2]">
                  Ask me anything about content creation, marketing, business, coding, or any other topic. I'm here to help!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-md lg:max-w-2xl rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-[#141417] border border-[#26262b] text-[#f5f5f7]"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#26262b]">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleCopy(msg.content)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#141417] border border-[#26262b] rounded-2xl px-4 py-3 flex items-center gap-2">
                  <LumaeLightPulse state="thinking" size={18} label="Lumae is thinking" />
                  <span className="text-sm text-[#9a9aa2]">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-[#26262b] bg-[#141417] p-4">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything... (Shift+Enter for new line)"
              className="resize-none max-h-24"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-auto"
            >
              {isLoading ? (
                <LumaeLightPulse state="working" size={18} label="Lumae is preparing a response" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
