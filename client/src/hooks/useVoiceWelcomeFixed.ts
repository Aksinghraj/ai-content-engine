import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  VoiceSettings,
  DEFAULT_VOICE_SETTINGS,
  getVoiceSettingsFromStorage,
} from "@/lib/voiceWelcome";
import {
  voiceWelcomeFlow as enhancedVoiceFlow,
  initializeVoiceWelcome,
  getDebugInfo,
  logVoiceDebugInfo,
} from "@/lib/voiceWelcomeEnhanced";

interface UseVoiceWelcomeFixedOptions {
  enabled?: boolean;
  delay?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  debug?: boolean;
}

/**
 * Fixed useVoiceWelcome hook with enhanced debugging
 */
export function useVoiceWelcomeFixed(options: UseVoiceWelcomeFixedOptions = {}) {
  const {
    enabled = true,
    delay = 1000,
    onSuccess,
    onError,
    debug = true,
  } = options;
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(
    DEFAULT_VOICE_SETTINGS
  );
  const [error, setError] = useState<string | null>(null);
  const hasPlayedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load voice settings
  useEffect(() => {
    console.log("📦 Loading voice settings from storage...");
    const storedSettings = getVoiceSettingsFromStorage();
    if (storedSettings) {
      console.log("✅ Voice settings loaded:", storedSettings);
      setVoiceSettings(storedSettings);
    } else {
      console.log("ℹ️ Using default voice settings");
    }
  }, []);

  // Play welcome message
  useEffect(() => {
    // Early exit conditions
    if (!enabled) {
      console.log("ℹ️ Voice welcome disabled");
      return;
    }

    if (!user) {
      console.log("⏳ Waiting for user authentication...");
      return;
    }

    if (!user.name) {
      console.warn("⚠️ User name not available");
      return;
    }

    if (hasPlayedRef.current) {
      console.log("ℹ️ Voice welcome already played in this session");
      return;
    }

    if (debug) {
      console.log("🔍 Voice Welcome Debug Mode Enabled");
      const debugInfo = getDebugInfo(user.name, true);
      logVoiceDebugInfo(debugInfo);
    }

    // Mark as played
    hasPlayedRef.current = true;

    const playWelcome = async () => {
      try {
        console.log("🎤 Starting voice welcome for user:", user.name);
        setIsPlaying(true);
        setError(null);

        // Initialize voice welcome
        const initResult = await initializeVoiceWelcome(user.name || "");
        if (!initResult.success) {
          throw new Error(initResult.error || "Initialization failed");
        }

        // Generate greeting message
        const hour = new Date().getHours();
        const timeGreeting =
          hour < 12
            ? "Good morning"
            : hour < 18
              ? "Good afternoon"
              : "Good evening";

        const greetingMessage = `${timeGreeting}, ${user.name}! Welcome back to Lumae AI.`;

        console.log("📢 Greeting message:", greetingMessage);

        // Play voice welcome
        const result = await enhancedVoiceFlow(user.name || "User", voiceSettings, greetingMessage);

        if (result.success) {
          console.log("✅ Voice welcome completed successfully");
          setIsPlaying(false);
          onSuccess?.();
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("❌ Voice welcome error:", errorMessage);
        setError(errorMessage);
        setIsPlaying(false);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    };

    // Set timer with cleanup
    console.log(`⏱️ Scheduling voice welcome in ${delay}ms...`);
    timerRef.current = setTimeout(() => {
      playWelcome();
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        console.log("🛑 Voice welcome timer cleared");
      }
    };
  }, [enabled, user, voiceSettings, delay, onSuccess, onError, debug]);

  return {
    isPlaying,
    voiceSettings,
    setVoiceSettings,
    userName: user?.name || null,
    error,
    setError,
  };
}

/**
 * Hook to manage voice settings with debugging
 */
export function useVoiceSettingsFixed() {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("📦 Loading voice settings...");
    const storedSettings = getVoiceSettingsFromStorage();
    if (storedSettings) {
      console.log("✅ Settings loaded:", storedSettings);
      setSettings(storedSettings);
    }
    setIsLoading(false);
  }, []);

  const updateSettings = (newSettings: Partial<VoiceSettings>) => {
    console.log("🔄 Updating voice settings:", newSettings);
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("voiceSettings", JSON.stringify(updated));
    console.log("✅ Settings saved to storage");
  };

  const resetSettings = () => {
    console.log("🔄 Resetting voice settings to defaults");
    setSettings(DEFAULT_VOICE_SETTINGS);
    localStorage.removeItem("voiceSettings");
    console.log("✅ Settings reset");
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
  };
}

/**
 * Hook for testing voice welcome
 */
export function useVoiceTest() {
  const [isTesting, setIsTesting] = useState(false);

  const testVoice = async (settings: VoiceSettings) => {
    try {
      console.log("🧪 Testing voice with settings:", settings);
      setIsTesting(true);

      const testMessage = `Hello! This is a test of the voice welcome feature. My name is Test User.`;

      const result = await enhancedVoiceFlow("Test User", settings, testMessage);

      if (!result.success) {
        throw new Error(result.message);
      }

      console.log("✅ Voice test completed successfully");
      setIsTesting(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Voice test error:", errorMessage);
      setIsTesting(false);
      throw error;
    }
  };

  return { isTesting, testVoice };
}
