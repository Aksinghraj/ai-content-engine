import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import {
  Brain,
  ArrowLeft,
  Sparkles,
  Mic,
  Send,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

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

  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Filter out system messages for display
  const displayMessages = messages.filter((msg) => msg.role !== "system");

  // Initialize Web Speech API for voice typing
  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInput((prev) => prev + transcript);
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        toast.error(`Voice typing error: ${event.error}`);
        setIsListening(false);
      };
    } else {
      console.warn("Web Speech API not supported in this browser");
    }
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [displayMessages]);

  const startVoiceTyping = () => {
    if (!recognitionRef.current) {
      toast.error("Voice typing not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) {
      toast.error("Please enter a message");
      return;
    }

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);
    setInput("");

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
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

      {/* Main Chat Container - Centered */}
      <main className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-4xl">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-2xl h-[calc(100vh-200px)] flex flex-col">
            {/* Messages Area */}
            <CardContent className="flex-1 p-4 overflow-hidden">
              <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {displayMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Welcome, {user.name}!</h3>
                          <p className="text-slate-400 max-w-sm mx-auto">
                            I'm your Personal AI. Ask me anything about content creation, marketing, coding, or any topic. I'm here to help!
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    displayMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                            message.role === "user"
                              ? "bg-violet-600 text-white rounded-br-none"
                              : "bg-slate-700 text-slate-100 rounded-bl-none"
                          }`}
                        >
                          {message.role === "assistant" ? (
                            <Streamdown>{message.content}</Streamdown>
                          ) : (
                            <p className="text-sm">{message.content}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {chatMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-700 text-slate-100 px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            {/* Input Area */}
            <div className="border-t border-slate-700 p-4 space-y-3">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(input);
                    }
                  }}
                  placeholder="Ask me anything... (Shift+Enter for new line)"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
                  rows={3}
                  disabled={chatMutation.isPending}
                />
              </div>

              <div className="flex gap-2 justify-between">
                <Button
                  onClick={startVoiceTyping}
                  variant={isListening ? "default" : "outline"}
                  size="sm"
                  className={isListening ? "bg-red-600 hover:bg-red-700" : ""}
                  disabled={chatMutation.isPending}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  {isListening ? "Listening..." : "Voice"}
                </Button>

                <Button
                  onClick={() => handleSendMessage(input)}
                  disabled={!input.trim() || chatMutation.isPending}
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
