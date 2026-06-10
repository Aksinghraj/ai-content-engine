import { useEffect, useState } from "react";
import { getTopicGradient, getTopicEmoji, detectTopic, Topic } from "@/lib/topicAnimations";
import { Sparkles } from "lucide-react";

interface Prompt {
  id: string;
  text: string;
  topic: Topic;
  icon: string;
}

interface DynamicPromptsProps {
  onPromptSelect?: (prompt: string, topic: string) => void;
  searchQuery?: string;
  animationDelay?: number;
}

const PROMPTS_BY_TOPIC: Record<Topic, string[]> = {
  ai: [
    "How can I use AI to improve my content?",
    "What are the latest AI trends in marketing?",
    "How do I implement machine learning in my workflow?",
    "What AI tools should I use for content creation?",
    "Explain neural networks in simple terms",
  ],
  marketing: [
    "How do I create a viral marketing campaign?",
    "What's the best social media strategy?",
    "How do I increase my conversion rate?",
    "What are the top marketing metrics to track?",
    "How do I build an effective email campaign?",
  ],
  content: [
    "How do I write engaging blog posts?",
    "What makes content go viral?",
    "How do I repurpose my content across platforms?",
    "What's the best content calendar strategy?",
    "How do I improve my writing skills?",
  ],
  analytics: [
    "How do I track my content performance?",
    "What metrics matter most for my business?",
    "How do I analyze user behavior?",
    "What tools should I use for analytics?",
    "How do I create meaningful reports?",
  ],
  automation: [
    "How do I automate my social media posting?",
    "What workflows should I automate?",
    "How do I set up automated email campaigns?",
    "What are the best automation tools?",
    "How do I save time with automation?",
  ],
  design: [
    "What are the latest design trends?",
    "How do I create eye-catching visuals?",
    "What design tools should I use?",
    "How do I improve my brand identity?",
    "What makes good UI/UX design?",
  ],
  social: [
    "How do I grow my Instagram followers?",
    "What's the best time to post on social media?",
    "How do I create viral TikTok content?",
    "What's the LinkedIn strategy for B2B?",
    "How do I manage multiple social accounts?",
  ],
  general: [
    "How do I get started with content creation?",
    "What's the best way to grow my audience?",
    "How do I create a content strategy?",
    "What tools do I need to succeed?",
    "How do I measure success?",
  ],
};

export default function DynamicPrompts({
  onPromptSelect,
  searchQuery = "",
  animationDelay = 0,
}: DynamicPromptsProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentTopic, setCurrentTopic] = useState<Topic>("general");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Detect topic from search query
    const topic = searchQuery ? detectTopic(searchQuery) : "general";
    setCurrentTopic(topic);

    // Trigger animation
    setIsAnimating(true);

    // Get prompts for the topic
    const topicPrompts = PROMPTS_BY_TOPIC[topic];
    const newPrompts: Prompt[] = topicPrompts.map((text, index) => ({
      id: `${topic}-${index}`,
      text,
      topic,
      icon: getTopicEmoji(topic),
    }));

    setPrompts(newPrompts);

    // Reset animation
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Suggested Prompts</h3>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {prompts.map((prompt, index) => (
          <button
            key={prompt.id}
            onClick={() => onPromptSelect?.(prompt.text, prompt.topic)}
            className={`group relative p-4 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/20 hover:border-white/40 transition-all duration-300 text-left ${
              isAnimating ? "animate-fade-scale" : ""
            }`}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            {/* Gradient overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${getTopicGradient(
                currentTopic
              )} opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300`}
            ></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1">{prompt.icon}</span>
                <p className="text-sm text-gray-200 group-hover:text-white transition-colors duration-300">
                  {prompt.text}
                </p>
              </div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-lg border border-white/0 group-hover:border-white/20 transition-all duration-300"></div>
          </button>
        ))}
      </div>

      {/* Topic Indicator */}
      <div className="mt-6 p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full bg-gradient-to-r ${getTopicGradient(
              currentTopic
            )}`}
          ></div>
          <span className="text-xs text-gray-400">
            Showing prompts for: <span className="text-gray-300 font-semibold">{currentTopic}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
