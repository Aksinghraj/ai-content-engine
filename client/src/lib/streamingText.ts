/**
 * Streaming Text Effect Utilities
 * Creates real-time typing and streaming effects for AI responses
 */

export interface StreamingOptions {
  speed?: number; // milliseconds per character
  onCharacter?: (char: string, index: number) => void;
  onComplete?: () => void;
}

/**
 * Stream text character by character
 */
export async function streamText(
  text: string,
  callback: (displayText: string) => void,
  options: StreamingOptions = {}
): Promise<void> {
  const { speed = 30, onCharacter, onComplete } = options;

  let displayText = "";

  for (let i = 0; i < text.length; i++) {
    displayText += text[i];
    callback(displayText);
    onCharacter?.(text[i], i);

    // Add slight variation to speed for natural feel
    const variation = Math.random() * 10 - 5;
    await new Promise((resolve) => setTimeout(resolve, speed + variation));
  }

  onComplete?.();
}

/**
 * Stream text with word-by-word effect
 */
export async function streamTextByWord(
  text: string,
  callback: (displayText: string) => void,
  options: StreamingOptions = {}
): Promise<void> {
  const { speed = 100, onComplete } = options;
  const words = text.split(" ");
  let displayText = "";

  for (let i = 0; i < words.length; i++) {
    displayText += (i > 0 ? " " : "") + words[i];
    callback(displayText);

    await new Promise((resolve) => setTimeout(resolve, speed));
  }

  onComplete?.();
}

/**
 * Stream text with sentence-by-sentence effect
 */
export async function streamTextBySentence(
  text: string,
  callback: (displayText: string) => void,
  options: StreamingOptions = {}
): Promise<void> {
  const { speed = 500, onComplete } = options;
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let displayText = "";

  for (const sentence of sentences) {
    displayText += sentence;
    callback(displayText);

    await new Promise((resolve) => setTimeout(resolve, speed));
  }

  onComplete?.();
}

/**
 * Create a cursor blink effect
 */
export function createCursorBlink(element: HTMLElement, duration: number = 500): () => void {
  let isBlinking = true;
  const interval = setInterval(() => {
    if (isBlinking) {
      element.style.opacity = "0.5";
    } else {
      element.style.opacity = "1";
    }
    isBlinking = !isBlinking;
  }, duration);

  return () => clearInterval(interval);
}

/**
 * Animate text color change
 */
export function animateTextColor(
  element: HTMLElement,
  fromColor: string,
  toColor: string,
  duration: number = 1000
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Simple color interpolation (works for hex colors)
      element.style.opacity = String(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.color = toColor;
        resolve();
      }
    };

    animate();
  });
}

/**
 * Create typing cursor animation
 */
export function createTypingCursor(): string {
  return '<span class="animate-cursor-blink">|</span>';
}

/**
 * Parse markdown-like formatting in streaming text
 */
export function parseStreamingMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
    .replace(/`(.*?)`/g, "<code>$1</code>") // Code
    .replace(/\n/g, "<br/>"); // Line breaks
}

/**
 * Debounce streaming to prevent too many updates
 */
export function debounceStream(
  callback: (text: string) => void,
  delay: number = 50
): (text: string) => void {
  let timeoutId: NodeJS.Timeout;

  return (text: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(text);
    }, delay);
  };
}

/**
 * Create a streaming effect with character-by-character animation
 */
export class StreamingTextEffect {
  private text: string = "";
  private displayText: string = "";
  private isStreaming: boolean = false;
  private speed: number;

  constructor(speed: number = 30) {
    this.speed = speed;
  }

  async stream(
    text: string,
    onUpdate: (displayText: string) => void,
    onComplete?: () => void
  ): Promise<void> {
    if (this.isStreaming) return;

    this.isStreaming = true;
    this.text = text;
    this.displayText = "";

    for (let i = 0; i < this.text.length; i++) {
      this.displayText += this.text[i];
      onUpdate(this.displayText);

      // Natural typing speed variation
      const variation = Math.random() * 10 - 5;
      await new Promise((resolve) => setTimeout(resolve, this.speed + variation));
    }

    this.isStreaming = false;
    onComplete?.();
  }

  stop(): void {
    this.isStreaming = false;
  }

  getText(): string {
    return this.displayText;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }
}

/**
 * Create animated text with wave effect
 */
export function createWaveEffect(text: string): string {
  return text
    .split("")
    .map(
      (char, index) =>
        `<span style="animation: wave 0.6s ease-in-out ${index * 0.05}s infinite; display: inline-block;">${char}</span>`
    )
    .join("");
}

/**
 * Create animated text with fade effect
 */
export function createFadeEffect(text: string): string {
  return text
    .split("")
    .map(
      (char, index) =>
        `<span style="animation: fade-in 0.3s ease-in ${index * 0.05}s forwards; opacity: 0;">${char}</span>`
    )
    .join("");
}

/**
 * Create animated text with scale effect
 */
export function createScaleEffect(text: string): string {
  return text
    .split("")
    .map(
      (char, index) =>
        `<span style="animation: scale-in 0.3s ease-out ${index * 0.05}s forwards; transform: scale(0);">${char}</span>`
    )
    .join("");
}
