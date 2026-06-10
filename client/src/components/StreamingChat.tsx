import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { streamText, StreamingTextEffect } from "@/lib/streamingText";
import { detectTopic, getTopicGradient, getTopicEmoji } from "@/lib/topicAnimations";
import { SpeechToTextMicrophone } from "@/components/SpeechToTextMicrophone";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  topic?: string;
}

interface StreamingChatProps {
  onSearch?: (query: string, topic: string) => void;
  placeholder?: string;
  showTopicIndicator?: boolean;
}

export default function StreamingChat({ onSearch, placeholder = "Ask me anything...", showTopicIndicator = true }: StreamingChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. Ask me anything about content creation, marketing, analytics, or automation. What would you like to explore?",
      topic: "general",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMicrophone, setShowMicrophone] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingEffectRef = useRef<StreamingTextEffect | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleTranscript = (transcript: string) => {
    setInput(transcript);
    setShowMicrophone(false);
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Detect topic from user input
    const detectedTopic = detectTopic(input);
    setCurrentTopic(detectedTopic);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      topic: detectedTopic,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Call onSearch callback if provided
    onSearch?.(input, detectedTopic);

    // Simulate AI response with streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const mockResponses: Record<string, string> = {
      ai: "AI is revolutionizing how we work. It can analyze patterns, predict outcomes, and automate complex tasks. Whether you're interested in machine learning, neural networks, or practical AI applications, I can help you explore these fascinating topics!",
      marketing: "Marketing is about connecting with your audience. From social media strategies to email campaigns, content marketing to paid advertising - there are many ways to reach and engage your target customers. What specific marketing challenge can I help you with?",
      content: "Content creation is an art and science. Whether you're writing blog posts, creating videos, or designing graphics, the key is to understand your audience and deliver value. I can help with ideation, writing, optimization, and distribution strategies.",
      analytics: "Analytics helps you understand what's working. By tracking metrics like engagement, conversion rates, and user behavior, you can make data-driven decisions. Let's dive into what metrics matter most for your goals.",
      automation: "Automation saves time and reduces errors. From scheduling posts to managing workflows, automation tools can handle repetitive tasks so you can focus on strategy. What processes would you like to automate?",
      design: "Design is about creating beautiful and functional experiences. From UI/UX to branding, good design communicates your message effectively. I can help with design principles, tools, and best practices.",
      social: "Social media is where your audience hangs out. Each platform has its own culture and best practices. Whether it's Instagram, TikTok, LinkedIn, or Twitter, I can help you create engaging content and grow your presence.",
      general: "I'm here to help with all your content and marketing needs. Feel free to ask about AI, marketing strategies, content creation, analytics, automation, design, or social media. What interests you most?",
    };

    const response = mockResponses[detectedTopic as keyof typeof mockResponses] || mockResponses.general;

    // Add assistant message with streaming
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      isStreaming: true,
      topic: detectedTopic,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Stream the response
    streamingEffectRef.current = new StreamingTextEffect(20);
    await streamingEffectRef.current.stream(
      response,
      (displayText) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: displayText }
              : msg
          )
        );
      },
      () => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTopicGradient(currentTopic as any)} flex items-center justify-center text-xl`}>
              {getTopicEmoji(currentTopic as any)}
            </div>
            <div>
              <h3 className="text-white font-semibold">AI Assistant</h3>
              {showTopicIndicator && (
                <p className="text-xs text-gray-400">Discussing: {currentTopic}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-scale`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                message.role === "user"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none"
                  : "bg-white/10 text-gray-100 rounded-bl-none border border-white/20"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              {message.isStreaming && (
                <span className="inline-block ml-2 animate-pulse">|</span>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-gray-100 px-4 py-3 rounded-lg border border-white/20 rounded-bl-none">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm p-4 space-y-3">
        {/* Microphone Component */}
        {showMicrophone && (
          <SpeechToTextMicrophone
            onTranscript={handleTranscript}
            onError={(error) => console.error("Speech error:", error)}
            placeholder={placeholder}
            disabled={isLoading}
          />
        )}

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-500"
          />
          <Button
            type="button"
            onClick={() => setShowMicrophone(!showMicrophone)}
            variant="outline"
            disabled={isLoading}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            title="Toggle speech-to-text"
          >
            🎤
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
