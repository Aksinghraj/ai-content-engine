import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Send, Copy, Trash2, Loader } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI Assistant. I can help you with content creation, answer questions, and assist with your creative projects. You can type or use voice typing to interact with me.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.aiAssistant.chat.useMutation({
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    },
    onError: (err) => {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${err.message || "Failed to process your message"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    },
  });

  // Initialize Web Speech API
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
        setIsListening(false);
      };
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startVoiceTyping = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Get conversation history for context
    const conversationHistory = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      await chatMutation.mutateAsync({
        message: userMessage.content,
        conversationHistory,
      });
    } catch (err) {
      console.error("Chat error:", err);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Chat cleared. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Assistant</h1>
                <p className="text-slate-400 text-sm">Chat with AI • Voice Typing • Content Help</p>
              </div>
            </div>
            <Button onClick={clearChat} variant="outline" className="border-slate-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 bg-slate-900/50 border-slate-700 backdrop-blur-md p-6 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {message.role === "assistant" && (
                      <button
                        onClick={() => copyMessage(message.content)}
                        className="opacity-50 hover:opacity-100 transition-opacity"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-100 rounded-lg rounded-bl-none border border-slate-700 px-4 py-3">
                  <Loader className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message or use voice typing..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <Button
              onClick={startVoiceTyping}
              variant="outline"
              className={`border-slate-600 ${isListening ? "bg-red-600 border-red-600" : ""}`}
            >
              <Mic className={`w-4 h-4 ${isListening ? "text-white" : ""}`} />
            </Button>
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
