/**
 * Enhanced Voice Welcome with Debugging and Logging
 */

export interface VoiceDebugInfo {
  timestamp: string;
  userAgent: string;
  speechSynthesisSupported: boolean;
  speechRecognitionSupported: boolean;
  voicesAvailable: number;
  userAuthenticated: boolean;
  userName: string | null;
  voiceSettingsLoaded: boolean;
  lastError: string | null;
}

/**
 * Get browser debug information
 */
export function getDebugInfo(
  userName: string | null,
  voiceSettingsLoaded: boolean,
  lastError: string | null = null
): VoiceDebugInfo {
  return {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    speechSynthesisSupported: "speechSynthesis" in window,
    speechRecognitionSupported:
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window,
    voicesAvailable: "speechSynthesis" in window ? window.speechSynthesis.getVoices().length : 0,
    userAuthenticated: !!userName,
    userName,
    voiceSettingsLoaded,
    lastError,
  };
}

/**
 * Log debug information to console
 */
export function logVoiceDebugInfo(debugInfo: VoiceDebugInfo): void {
  console.group("🎤 Voice Welcome Debug Info");
  console.log("Timestamp:", debugInfo.timestamp);
  console.log("User Agent:", debugInfo.userAgent);
  console.log("Speech Synthesis Supported:", debugInfo.speechSynthesisSupported);
  console.log("Speech Recognition Supported:", debugInfo.speechRecognitionSupported);
  console.log("Available Voices:", debugInfo.voicesAvailable);
  console.log("User Authenticated:", debugInfo.userAuthenticated);
  console.log("User Name:", debugInfo.userName);
  console.log("Voice Settings Loaded:", debugInfo.voiceSettingsLoaded);
  if (debugInfo.lastError) {
    console.error("Last Error:", debugInfo.lastError);
  }
  console.groupEnd();
}

/**
 * Check if Web Speech API is available
 */
export function checkWebSpeechAPI(): {
  synthesis: boolean;
  recognition: boolean;
  voices: number;
} {
  const synthesis = "speechSynthesis" in window;
  const recognition = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
  const voices = synthesis ? window.speechSynthesis.getVoices().length : 0;

  return { synthesis, recognition, voices };
}

/**
 * Ensure voices are loaded before speaking
 */
export async function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  if (!("speechSynthesis" in window)) {
    throw new Error("Speech Synthesis not supported");
  }

  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Wait for voices to load
    const onVoicesChanged = () => {
      voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
        resolve(voices);
      }
    };

    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);

    // Timeout after 5 seconds
    setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 5000);
  });
}

/**
 * Enhanced speak with better error handling
 */
export async function enhancedSpeak(
  text: string,
  settings: {
    speed: number;
    pitch: number;
    volume: number;
    language: string;
    voiceType: "male" | "female" | "neutral";
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!("speechSynthesis" in window)) {
      throw new Error("Speech Synthesis not supported in this browser");
    }

    // Ensure voices are loaded
    const voices = await ensureVoicesLoaded();

    if (voices.length === 0) {
      throw new Error("No voices available");
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice properties
    utterance.rate = Math.max(0.5, Math.min(2, settings.speed));
    utterance.pitch = Math.max(0.5, Math.min(2, settings.pitch));
    utterance.volume = Math.max(0, Math.min(1, settings.volume));
    utterance.lang = settings.language;

    // Select voice
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

    return new Promise((resolve) => {
      utterance.onend = () => {
        console.log("✅ Voice welcome completed");
        resolve({ success: true });
      };

      utterance.onerror = (event) => {
        console.error("❌ Speech synthesis error:", event.error);
        resolve({ success: false, error: event.error });
      };

      utterance.onstart = () => {
        console.log("🎤 Voice welcome started");
      };

      window.speechSynthesis.speak(utterance);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Enhanced speak error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Get browser compatibility report
 */
export function getBrowserCompatibilityReport(): {
  compatible: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check Speech Synthesis
  if (!("speechSynthesis" in window)) {
    issues.push("Speech Synthesis API not supported");
    recommendations.push("Update your browser to a newer version");
  } else {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      issues.push("No voices available for Speech Synthesis");
      recommendations.push("Check your system audio settings");
    }
  }

  // Check Speech Recognition
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    issues.push("Speech Recognition API not supported");
    recommendations.push("Use Chrome, Edge, or Safari for speech-to-text features");
  }

  // Check localStorage
  if (!("localStorage" in window)) {
    issues.push("localStorage not available");
    recommendations.push("Enable local storage in your browser settings");
  }

  return {
    compatible: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Initialize voice welcome with full debugging
 */
export async function initializeVoiceWelcome(userName: string | null): Promise<{
  success: boolean;
  debugInfo: VoiceDebugInfo;
  error?: string;
}> {
  console.log("🎤 Initializing Voice Welcome...");

  try {
    // Get debug info
    const debugInfo = getDebugInfo(userName, true);
    logVoiceDebugInfo(debugInfo);

    // Check compatibility
    const compatibility = getBrowserCompatibilityReport();
    if (!compatibility.compatible) {
      console.warn("⚠️ Browser compatibility issues:", compatibility.issues);
      compatibility.recommendations.forEach((rec) => console.log("💡", rec));
    }

    // Check prerequisites
    if (!userName) {
      throw new Error("User name is required");
    }

    if (!debugInfo.speechSynthesisSupported) {
      throw new Error("Speech Synthesis not supported");
    }

    return {
      success: true,
      debugInfo,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Voice welcome initialization error:", errorMessage);

    return {
      success: false,
      debugInfo: getDebugInfo(userName, false, errorMessage),
      error: errorMessage,
    };
  }
}

/**
 * Detailed voice welcome flow with logging
 */
export async function voiceWelcomeFlow(
  userName: string,
  settings: {
    speed: number;
    pitch: number;
    volume: number;
    language: string;
    voiceType: "male" | "female" | "neutral";
  },
  greeting: string
): Promise<{ success: boolean; message: string }> {
  console.log("🎤 Starting voice welcome flow for:", userName);

  try {
    // Step 1: Initialize
    const init = await initializeVoiceWelcome(userName);
    if (!init.success) {
      throw new Error(init.error || "Initialization failed");
    }

    // Step 2: Ensure voices loaded
    console.log("📢 Ensuring voices are loaded...");
    const voices = await ensureVoicesLoaded();
    console.log(`✅ ${voices.length} voices available`);

    // Step 3: Speak greeting
    console.log("🎤 Speaking greeting:", greeting);
    const result = await enhancedSpeak(greeting, settings);

    if (!result.success) {
      throw new Error(result.error || "Speech synthesis failed");
    }

    console.log("✅ Voice welcome completed successfully");
    return { success: true, message: "Voice welcome played successfully" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Voice welcome flow error:", errorMessage);
    return { success: false, message: errorMessage };
  }
}
