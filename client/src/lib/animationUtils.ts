/**
 * Kimi AI Animation Utilities
 * Provides dynamic animation selection and management
 */

export type AnimationType =
  | "slide-left"
  | "slide-right"
  | "slide-top"
  | "slide-bottom"
  | "fade-scale"
  | "fade-rotate"
  | "fade-blur";

export type FloatingAnimation = "float" | "float-slow" | "pulse" | "glow";

export type TextAnimation = "typewriter" | "text-fade" | "text-slide";

/**
 * Get random animation from available options
 */
export function getRandomAnimation(): AnimationType {
  const animations: AnimationType[] = [
    "slide-left",
    "slide-right",
    "slide-top",
    "slide-bottom",
    "fade-scale",
    "fade-rotate",
    "fade-blur",
  ];
  return animations[Math.floor(Math.random() * animations.length)];
}

/**
 * Get random floating animation
 */
export function getRandomFloatingAnimation(): FloatingAnimation {
  const animations: FloatingAnimation[] = ["float", "float-slow", "pulse", "glow"];
  return animations[Math.floor(Math.random() * animations.length)];
}

/**
 * Get random text animation
 */
export function getRandomTextAnimation(): TextAnimation {
  const animations: TextAnimation[] = ["typewriter", "text-fade", "text-slide"];
  return animations[Math.floor(Math.random() * animations.length)];
}

/**
 * Get CSS class name for animation
 */
export function getAnimationClass(animation: AnimationType): string {
  return `animate-${animation}`;
}

/**
 * Get CSS class name for floating animation
 */
export function getFloatingAnimationClass(animation: FloatingAnimation): string {
  return `animate-${animation}`;
}

/**
 * Get CSS class name for text animation
 */
export function getTextAnimationClass(animation: TextAnimation): string {
  return `animate-${animation}`;
}

/**
 * Get random stagger delay class (0.1s to 0.6s)
 */
export function getRandomStaggerDelay(): string {
  const delays = ["stagger-1", "stagger-2", "stagger-3", "stagger-4", "stagger-5", "stagger-6"];
  return delays[Math.floor(Math.random() * delays.length)];
}

/**
 * Get multiple random animations for staggered effect
 */
export function getStaggeredAnimations(count: number): string[] {
  const animations: string[] = [];
  for (let i = 0; i < count; i++) {
    const animation = getRandomAnimation();
    const stagger = `stagger-${Math.min(i + 1, 6)}`;
    animations.push(`${getAnimationClass(animation)} ${stagger}`);
  }
  return animations;
}

/**
 * Animation configuration for different page types
 */
export const pageAnimationConfig = {
  dashboard: {
    header: "slide-top",
    cards: ["fade-scale", "fade-scale", "fade-scale", "fade-scale"],
    content: "slide-left",
  },
  socialAutomation: {
    header: "slide-left",
    cards: ["fade-rotate", "fade-rotate", "fade-rotate"],
    content: "slide-right",
  },
  postScheduling: {
    header: "fade-blur",
    cards: ["fade-scale", "fade-scale"],
    content: "slide-bottom",
  },
  contentRewriter: {
    header: "slide-right",
    cards: ["fade-rotate"],
    content: "slide-left",
  },
  repurposing: {
    header: "slide-top",
    cards: ["fade-scale", "fade-scale"],
    content: "fade-blur",
  },
  analytics: {
    header: "slide-left",
    cards: ["fade-scale", "fade-scale", "fade-scale"],
    content: "slide-right",
  },
};

/**
 * Get animation config for a specific page
 */
export function getPageAnimationConfig(
  pageName: string
): (typeof pageAnimationConfig)[keyof typeof pageAnimationConfig] {
  return (
    pageAnimationConfig[pageName as keyof typeof pageAnimationConfig] ||
    pageAnimationConfig.dashboard
  );
}

/**
 * Generate random gradient colors for animated backgrounds
 */
export function getRandomGradient(): string {
  const gradients = [
    "from-purple-600 via-pink-600 to-red-600",
    "from-blue-600 via-purple-600 to-pink-600",
    "from-cyan-600 via-blue-600 to-purple-600",
    "from-green-600 via-cyan-600 to-blue-600",
    "from-pink-600 via-purple-600 to-indigo-600",
    "from-orange-600 via-pink-600 to-purple-600",
    "from-indigo-600 via-purple-600 to-pink-600",
    "from-violet-600 via-purple-600 to-pink-600",
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}

/**
 * Generate random color for elements
 */
export function getRandomColor(): string {
  const colors = [
    "text-purple-400",
    "text-pink-400",
    "text-blue-400",
    "text-cyan-400",
    "text-green-400",
    "text-indigo-400",
    "text-violet-400",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Combine multiple animation classes
 */
export function combineAnimations(...animations: string[]): string {
  return animations.filter(Boolean).join(" ");
}

/**
 * Get animation duration in milliseconds
 */
export function getAnimationDuration(animation: AnimationType): number {
  const durations: Record<AnimationType, number> = {
    "slide-left": 600,
    "slide-right": 600,
    "slide-top": 600,
    "slide-bottom": 600,
    "fade-scale": 600,
    "fade-rotate": 600,
    "fade-blur": 600,
  };
  return durations[animation];
}

/**
 * Create a sequence of animations
 */
export function createAnimationSequence(animations: AnimationType[]): {
  animation: AnimationType;
  delay: number;
}[] {
  return animations.map((animation, index) => ({
    animation,
    delay: index * 150,
  }));
}

/**
 * Get random animation with custom seed for consistency
 */
export function getSeededRandomAnimation(seed: string): AnimationType {
  const animations: AnimationType[] = [
    "slide-left",
    "slide-right",
    "slide-top",
    "slide-bottom",
    "fade-scale",
    "fade-rotate",
    "fade-blur",
  ];

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return animations[Math.abs(hash) % animations.length];
}

/**
 * Animation presets for common use cases
 */
export const animationPresets = {
  pageEnter: {
    duration: "0.6s",
    timingFunction: "ease-out",
  },
  cardEnter: {
    duration: "0.5s",
    timingFunction: "ease-out",
    stagger: 0.1,
  },
  buttonHover: {
    duration: "0.3s",
    timingFunction: "ease-out",
  },
  textEnter: {
    duration: "0.8s",
    timingFunction: "ease-out",
  },
  floating: {
    duration: "3s",
    timingFunction: "ease-in-out",
    infinite: true,
  },
};
