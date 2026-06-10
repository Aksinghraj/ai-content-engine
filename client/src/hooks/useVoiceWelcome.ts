import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  playWelcomeMessage,
  VoiceSettings,
  DEFAULT_VOICE_SETTINGS,
  getVoiceSettingsFromStorage,
  debouncedVoiceWelcome,
  clearDebouncedVoiceWelcome,
} from "@/lib/voiceWelcome";

interface UseVoiceWelcomeOptions {
  enabled?: boolean;
  delay?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to play voice welcome on page load
 */
export function useVoiceWelcome(options: UseVoiceWelcomeOptions = {}) {
  const { enabled = true, delay = 500, onSuccess, onError } = options;
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    // Load voice settings from storage
    const storedSettings = getVoiceSettingsFromStorage();
    if (storedSettings) {
      setVoiceSettings(storedSettings);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !user?.name || hasPlayedRef.current) {
      return;
    }

    // Mark as played to prevent multiple plays
    hasPlayedRef.current = true;

    const playWelcome = async () => {
      try {
        setIsPlaying(true);
        await playWelcomeMessage(user.name || "User", voiceSettings);
        setIsPlaying(false);
        onSuccess?.();
      } catch (error) {
        setIsPlaying(false);
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
      }
    };

    // Delay welcome message slightly
    const timer = setTimeout(() => {
      playWelcome();
    }, delay);

    return () => {
      clearTimeout(timer);
      clearDebouncedVoiceWelcome();
    };
  }, [enabled, user?.name, voiceSettings, delay, onSuccess, onError]);

  return {
    isPlaying,
    voiceSettings,
    setVoiceSettings,
    userName: user?.name,
  };
}

/**
 * Hook to manage voice settings
 */
export function useVoiceSettings() {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load settings from storage
    const storedSettings = getVoiceSettingsFromStorage();
    if (storedSettings) {
      setSettings(storedSettings);
    }
    setIsLoading(false);
  }, []);

  const updateSettings = (newSettings: Partial<VoiceSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    // Save to storage
    localStorage.setItem("voiceSettings", JSON.stringify(updated));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_VOICE_SETTINGS);
    localStorage.setItem("voiceSettings", JSON.stringify(DEFAULT_VOICE_SETTINGS));
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
  };
}

/**
 * Hook to test voice settings
 */
export function useVoiceTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testMessage, setTestMessage] = useState("Hello, this is a test message.");

  const testVoice = async (settings: VoiceSettings) => {
    try {
      setIsTesting(true);
      await playWelcomeMessage("User", settings);
      setIsTesting(false);
    } catch (error) {
      setIsTesting(false);
      console.error("Voice test failed:", error);
    }
  };

  return {
    isTesting,
    testMessage,
    setTestMessage,
    testVoice,
  };
}

/**
 * Hook to manage voice welcome state
 */
export function useVoiceWelcomeState() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const enable = () => setIsEnabled(true);
  const disable = () => setIsEnabled(false);
  const toggle = () => setIsEnabled(!isEnabled);
  const markAsPlayed = () => setHasPlayed(true);
  const reset = () => {
    setIsEnabled(true);
    setHasPlayed(false);
    setError(null);
  };

  return {
    isEnabled,
    hasPlayed,
    error,
    enable,
    disable,
    toggle,
    markAsPlayed,
    setError,
    reset,
  };
}
