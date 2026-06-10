/**
 * Voice Welcome Utility
 * Provides personalized voice greetings for users
 */

export interface VoiceSettings {
  enabled: boolean;
  speed: number; // 0.5 - 2.0
  pitch: number; // 0.5 - 2.0
  volume: number; // 0 - 1
  language: string; // en-US, en-GB, es-ES, etc.
  voiceType: "male" | "female" | "neutral";
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: true,
  speed: 1,
  pitch: 1,
  volume: 0.8,
  language: "en-US",
  voiceType: "female",
};

/**
 * Get time-based greeting
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

/**
 * Generate welcome message
 */
export function generateWelcomeMessage(userName: string): string {
  const greeting = getTimeBasedGreeting();
  return `${greeting}, ${userName}! Welcome back to AI Content Engine.`;
}

/**
 * Speak text using Web Speech API
 */
export async function speakText(
  text: string,
  settings: VoiceSettings = DEFAULT_VOICE_SETTINGS
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech Synthesis not supported");
      reject(new Error("Speech Synthesis not supported"));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice properties
    utterance.rate = settings.speed;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang = settings.language;

    // Get available voices and select based on type
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const selectedVoice = voices.find((voice) => {
        const voiceName = voice.name.toLowerCase();
        if (settings.voiceType === "male") {
          return voiceName.includes("male") || voiceName.includes("man");
        } else if (settings.voiceType === "female") {
          return voiceName.includes("female") || voiceName.includes("woman");
        }
        return true;
      }) || voices[0];

      utterance.voice = selectedVoice;
    }

    // Handle completion
    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    // Speak
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Play welcome message for user
 */
export async function playWelcomeMessage(
  userName: string,
  settings: VoiceSettings = DEFAULT_VOICE_SETTINGS
): Promise<void> {
  if (!settings.enabled) {
    return;
  }

  try {
    const message = generateWelcomeMessage(userName);
    await speakText(message, settings);
  } catch (error) {
    console.error("Failed to play welcome message:", error);
  }
}

/**
 * Stop current speech
 */
export function stopSpeech(): void {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if speech synthesis is supported
 */
export function isSpeechSynthesisSupported(): boolean {
  return "speechSynthesis" in window;
}

/**
 * Get available voices
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!("speechSynthesis" in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

/**
 * Get available languages
 */
export function getAvailableLanguages(): string[] {
  const voices = getAvailableVoices();
  const languages = new Set(voices.map((v) => v.lang));
  return Array.from(languages).sort();
}

/**
 * Test voice with sample text
 */
export async function testVoice(
  text: string = "Hello, this is a test message.",
  settings: VoiceSettings = DEFAULT_VOICE_SETTINGS
): Promise<void> {
  try {
    await speakText(text, settings);
  } catch (error) {
    console.error("Failed to test voice:", error);
  }
}

/**
 * Create voice settings from user preferences
 */
export function createVoiceSettings(
  preferences: Partial<VoiceSettings>
): VoiceSettings {
  return {
    ...DEFAULT_VOICE_SETTINGS,
    ...preferences,
  };
}

/**
 * Validate voice settings
 */
export function validateVoiceSettings(settings: VoiceSettings): boolean {
  return (
    settings.speed >= 0.5 &&
    settings.speed <= 2.0 &&
    settings.pitch >= 0.5 &&
    settings.pitch <= 2.0 &&
    settings.volume >= 0 &&
    settings.volume <= 1 &&
    ["male", "female", "neutral"].includes(settings.voiceType)
  );
}

/**
 * Get voice settings from localStorage
 */
export function getVoiceSettingsFromStorage(): VoiceSettings | null {
  try {
    const stored = localStorage.getItem("voiceSettings");
    if (stored) {
      const settings = JSON.parse(stored);
      if (validateVoiceSettings(settings)) {
        return settings;
      }
    }
  } catch (error) {
    console.error("Failed to get voice settings from storage:", error);
  }
  return null;
}

/**
 * Save voice settings to localStorage
 */
export function saveVoiceSettingsToStorage(settings: VoiceSettings): void {
  try {
    if (validateVoiceSettings(settings)) {
      localStorage.setItem("voiceSettings", JSON.stringify(settings));
    }
  } catch (error) {
    console.error("Failed to save voice settings to storage:", error);
  }
}

/**
 * Get greeting variations
 */
export function getGreetingVariations(userName: string): string[] {
  const hour = new Date().getHours();
  const greetings: Record<string, string[]> = {
    morning: [
      `Good morning, ${userName}! Ready to create amazing content?`,
      `Rise and shine, ${userName}! Let's make today productive.`,
      `Hello ${userName}! Time to get creative!`,
    ],
    afternoon: [
      `Good afternoon, ${userName}! How's your day going?`,
      `Welcome back, ${userName}! Let's continue the momentum.`,
      `Hey ${userName}! Time for some afternoon creativity!`,
    ],
    evening: [
      `Good evening, ${userName}! Let's wrap up strong.`,
      `Welcome back, ${userName}! Evening inspiration incoming.`,
      `Hi ${userName}! Ready for some evening productivity?`,
    ],
  };

  let timeOfDay = "afternoon";
  if (hour < 12) {
    timeOfDay = "morning";
  } else if (hour >= 18) {
    timeOfDay = "evening";
  }

  return greetings[timeOfDay] || greetings.afternoon;
}

/**
 * Get random greeting
 */
export function getRandomGreeting(userName: string): string {
  const variations = getGreetingVariations(userName);
  return variations[Math.floor(Math.random() * variations.length)];
}

/**
 * Create personalized welcome message with emotion
 */
export function createPersonalizedWelcome(
  userName: string,
  includeEmoji: boolean = false
): string {
  const greeting = getRandomGreeting(userName);
  if (includeEmoji) {
    const emojis = ["👋", "🎉", "✨", "🚀", "💡"];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    return `${emoji} ${greeting}`;
  }
  return greeting;
}

/**
 * Handle voice welcome with error handling
 */
export async function handleVoiceWelcome(
  userName: string,
  settings: VoiceSettings = DEFAULT_VOICE_SETTINGS,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    if (!isSpeechSynthesisSupported()) {
      throw new Error("Speech Synthesis not supported");
    }

    await playWelcomeMessage(userName, settings);
    onSuccess?.();
  } catch (error) {
    console.error("Voice welcome error:", error);
    onError?.(error as Error);
  }
}

/**
 * Debounce voice welcome to prevent multiple plays
 */
let voiceWelcomeTimeout: NodeJS.Timeout | null = null;

export function debouncedVoiceWelcome(
  userName: string,
  settings: VoiceSettings = DEFAULT_VOICE_SETTINGS,
  delay: number = 500
): void {
  if (voiceWelcomeTimeout) {
    clearTimeout(voiceWelcomeTimeout);
  }

  voiceWelcomeTimeout = setTimeout(() => {
    playWelcomeMessage(userName, settings).catch((error) => {
      console.error("Debounced voice welcome error:", error);
    });
  }, delay);
}

/**
 * Clear debounced voice welcome
 */
export function clearDebouncedVoiceWelcome(): void {
  if (voiceWelcomeTimeout) {
    clearTimeout(voiceWelcomeTimeout);
    voiceWelcomeTimeout = null;
  }
}
