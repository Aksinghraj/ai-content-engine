/**
 * Topic-Based Animation System
 * Generates animations and illustrations based on search topics
 */

export type Topic = "ai" | "marketing" | "content" | "analytics" | "automation" | "design" | "social" | "general";

export interface TopicConfig {
  colors: string[];
  gradients: string[];
  animations: string[];
  emoji: string[];
  keywords: string[];
  description: string;
}

export const TOPIC_CONFIGS: Record<Topic, TopicConfig> = {
  ai: {
    colors: ["from-purple-600", "to-blue-600", "from-indigo-600", "to-purple-600"],
    gradients: [
      "from-purple-600 via-pink-600 to-blue-600",
      "from-indigo-600 via-purple-600 to-pink-600",
      "from-violet-600 via-purple-600 to-indigo-600",
    ],
    animations: ["float", "pulse", "glow", "rotate-slow"],
    emoji: ["🤖", "🧠", "⚡", "🔮", "💡", "🎯"],
    keywords: ["ai", "artificial intelligence", "machine learning", "neural", "algorithm", "model", "training"],
    description: "Artificial Intelligence",
  },
  marketing: {
    colors: ["from-orange-600", "to-red-600", "from-pink-600", "to-orange-600"],
    gradients: [
      "from-orange-600 via-pink-600 to-red-600",
      "from-pink-600 via-orange-600 to-yellow-600",
      "from-red-600 via-orange-600 to-pink-600",
    ],
    animations: ["bounce", "swing", "shake"],
    emoji: ["📱", "📊", "🎯", "💰", "📈", "🚀"],
    keywords: ["marketing", "campaign", "strategy", "promotion", "engagement", "audience", "brand"],
    description: "Marketing Strategy",
  },
  content: {
    colors: ["from-green-600", "to-teal-600", "from-cyan-600", "to-green-600"],
    gradients: [
      "from-green-600 via-cyan-600 to-blue-600",
      "from-teal-600 via-green-600 to-cyan-600",
      "from-cyan-600 via-teal-600 to-green-600",
    ],
    animations: ["slide-left", "slide-right", "fade-scale"],
    emoji: ["✍️", "📝", "🎨", "📸", "🎬", "📚"],
    keywords: ["content", "writing", "blog", "article", "post", "copy", "creation"],
    description: "Content Creation",
  },
  analytics: {
    colors: ["from-blue-600", "to-cyan-600", "from-sky-600", "to-blue-600"],
    gradients: [
      "from-blue-600 via-cyan-600 to-teal-600",
      "from-sky-600 via-blue-600 to-cyan-600",
      "from-cyan-600 via-sky-600 to-blue-600",
    ],
    animations: ["chart-rise", "data-flow", "metric-pulse"],
    emoji: ["📊", "📈", "🔍", "💹", "🎲", "⚙️"],
    keywords: ["analytics", "data", "metric", "insight", "report", "tracking", "performance"],
    description: "Analytics & Data",
  },
  automation: {
    colors: ["from-yellow-600", "to-orange-600", "from-amber-600", "to-yellow-600"],
    gradients: [
      "from-yellow-600 via-orange-600 to-red-600",
      "from-amber-600 via-yellow-600 to-orange-600",
      "from-orange-600 via-amber-600 to-yellow-600",
    ],
    animations: ["spin-slow", "orbit", "pulse-fast"],
    emoji: ["⚙️", "🔄", "🤖", "⏰", "🔗", "⚡"],
    keywords: ["automation", "workflow", "process", "schedule", "trigger", "action", "bot"],
    description: "Automation & Workflow",
  },
  design: {
    colors: ["from-pink-600", "to-purple-600", "from-fuchsia-600", "to-pink-600"],
    gradients: [
      "from-pink-600 via-purple-600 to-indigo-600",
      "from-fuchsia-600 via-pink-600 to-purple-600",
      "from-purple-600 via-fuchsia-600 to-pink-600",
    ],
    animations: ["morph", "color-shift", "scale-pulse"],
    emoji: ["🎨", "🖌️", "✨", "🌈", "💫", "🎭"],
    keywords: ["design", "ui", "ux", "visual", "creative", "style", "aesthetic"],
    description: "Design & Creative",
  },
  social: {
    colors: ["from-red-600", "to-pink-600", "from-rose-600", "to-red-600"],
    gradients: [
      "from-red-600 via-pink-600 to-purple-600",
      "from-rose-600 via-red-600 to-pink-600",
      "from-pink-600 via-rose-600 to-red-600",
    ],
    animations: ["heart-beat", "wave", "ripple"],
    emoji: ["📱", "👥", "💬", "❤️", "🌐", "📢"],
    keywords: ["social", "media", "instagram", "twitter", "facebook", "tiktok", "linkedin"],
    description: "Social Media",
  },
  general: {
    colors: ["from-slate-600", "to-gray-600", "from-gray-600", "to-slate-600"],
    gradients: [
      "from-slate-600 via-gray-600 to-stone-600",
      "from-gray-600 via-slate-600 to-gray-600",
      "from-stone-600 via-slate-600 to-gray-600",
    ],
    animations: ["fade-scale", "float", "pulse"],
    emoji: ["✨", "🎯", "💡", "🚀", "🌟", "⭐"],
    keywords: [],
    description: "General",
  },
};

/**
 * Detect topic from search query
 */
export function detectTopic(query: string): Topic {
  const lowerQuery = query.toLowerCase();

  for (const [topic, config] of Object.entries(TOPIC_CONFIGS)) {
    if (config.keywords.some((keyword) => lowerQuery.includes(keyword))) {
      return topic as Topic;
    }
  }

  return "general";
}

/**
 * Get random animation for topic
 */
export function getTopicAnimation(topic: Topic): string {
  const config = TOPIC_CONFIGS[topic];
  return config.animations[Math.floor(Math.random() * config.animations.length)];
}

/**
 * Get random gradient for topic
 */
export function getTopicGradient(topic: Topic): string {
  const config = TOPIC_CONFIGS[topic];
  return config.gradients[Math.floor(Math.random() * config.gradients.length)];
}

/**
 * Get random emoji for topic
 */
export function getTopicEmoji(topic: Topic): string {
  const config = TOPIC_CONFIGS[topic];
  return config.emoji[Math.floor(Math.random() * config.emoji.length)];
}

/**
 * Get topic color palette
 */
export function getTopicColors(topic: Topic): string[] {
  return TOPIC_CONFIGS[topic].colors;
}

/**
 * Create SVG background based on topic
 */
export function createTopicSVGBackground(topic: Topic): string {
  const config = TOPIC_CONFIGS[topic];
  const colors = config.colors;

  const svgShapes: Record<Topic, string> = {
    ai: `
      <circle cx="20%" cy="30%" r="80" fill="${colors[0]}" opacity="0.3" class="animate-float"/>
      <rect x="70%" y="60%" width="100" height="100" fill="${colors[1]}" opacity="0.2" class="animate-rotate-slow" rx="20"/>
      <polygon points="50%,10% 90%,90% 10%,90%" fill="${colors[0]}" opacity="0.15" class="animate-pulse"/>
    `,
    marketing: `
      <circle cx="80%" cy="20%" r="100" fill="${colors[0]}" opacity="0.25" class="animate-bounce"/>
      <rect x="10%" y="70%" width="120" height="80" fill="${colors[1]}" opacity="0.2" class="animate-swing" rx="15"/>
      <path d="M 30% 50% Q 50% 20% 70% 50" stroke="${colors[0]}" stroke-width="3" fill="none" opacity="0.3"/>
    `,
    content: `
      <circle cx="30%" cy="70%" r="90" fill="${colors[0]}" opacity="0.25" class="animate-float"/>
      <rect x="60%" y="20%" width="110" height="90" fill="${colors[1]}" opacity="0.2" class="animate-slide-left" rx="18"/>
      <ellipse cx="50%" cy="40%" rx="70" ry="50" fill="${colors[0]}" opacity="0.15" class="animate-pulse"/>
    `,
    analytics: `
      <rect x="15%" y="30%" width="80" height="120" fill="${colors[0]}" opacity="0.25" class="animate-chart-rise" rx="10"/>
      <rect x="35%" y="50%" width="80" height="100" fill="${colors[1]}" opacity="0.2" class="animate-chart-rise" rx="10"/>
      <rect x="55%" y="40%" width="80" height="110" fill="${colors[0]}" opacity="0.25" class="animate-chart-rise" rx="10"/>
    `,
    automation: `
      <circle cx="50%" cy="50%" r="60" fill="none" stroke="${colors[0]}" stroke-width="3" opacity="0.3" class="animate-spin-slow"/>
      <circle cx="50%" cy="50%" r="40" fill="none" stroke="${colors[1]}" stroke-width="2" opacity="0.2" class="animate-spin-slow" style="animation-direction: reverse;"/>
      <circle cx="50%" cy="50%" r="20" fill="${colors[0]}" opacity="0.4" class="animate-pulse"/>
    `,
    design: `
      <circle cx="25%" cy="25%" r="70" fill="${colors[0]}" opacity="0.3" class="animate-morph"/>
      <rect x="65%" y="60%" width="100" height="100" fill="${colors[1]}" opacity="0.2" class="animate-morph" rx="20"/>
      <polygon points="50%,15% 85%,70% 15%,70%" fill="${colors[0]}" opacity="0.15" class="animate-color-shift"/>
    `,
    social: `
      <circle cx="50%" cy="50%" r="80" fill="${colors[0]}" opacity="0.2" class="animate-heart-beat"/>
      <circle cx="30%" cy="30%" r="50" fill="${colors[1]}" opacity="0.25" class="animate-ripple"/>
      <circle cx="70%" cy="70%" r="60" fill="${colors[0]}" opacity="0.2" class="animate-ripple"/>
    `,
    general: `
      <circle cx="20%" cy="20%" r="70" fill="${colors[0]}" opacity="0.2" class="animate-float"/>
      <rect x="70%" y="70%" width="100" height="100" fill="${colors[1]}" opacity="0.15" class="animate-pulse" rx="20"/>
      <circle cx="50%" cy="80%" r="60" fill="${colors[0]}" opacity="0.1" class="animate-float"/>
    `,
  };

  return svgShapes[topic] || svgShapes.general;
}

/**
 * Create particle effect based on topic
 */
export function createTopicParticles(topic: Topic, count: number = 20): Array<{
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}> {
  const colors = getTopicColors(topic);
  const particles = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 3 + 2,
    });
  }

  return particles;
}

/**
 * Get topic description
 */
export function getTopicDescription(topic: Topic): string {
  return TOPIC_CONFIGS[topic].description;
}

/**
 * Create smooth transition between topics
 */
export function createTopicTransition(fromTopic: Topic, toTopic: Topic): {
  fromGradient: string;
  toGradient: string;
  duration: number;
} {
  return {
    fromGradient: getTopicGradient(fromTopic),
    toGradient: getTopicGradient(toTopic),
    duration: 800,
  };
}
