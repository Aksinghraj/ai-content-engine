import React, { useEffect } from "react";
import { useVoiceWelcome } from "@/hooks/useVoiceWelcome";
import { useAuth } from "@/_core/hooks/useAuth";

interface VoiceWelcomeIntegrationProps {
  onWelcomeComplete?: () => void;
  onWelcomeError?: (error: Error) => void;
  enabled?: boolean;
  delay?: number;
}

/**
 * Component to integrate voice welcome into any page
 * Place this at the top level of your page to enable voice welcome
 */
export function VoiceWelcomeIntegration({
  onWelcomeComplete,
  onWelcomeError,
  enabled = true,
  delay = 500,
}: VoiceWelcomeIntegrationProps) {
  const { user } = useAuth();
  const { isPlaying, userName } = useVoiceWelcome({
    enabled,
    delay,
    onSuccess: onWelcomeComplete,
    onError: onWelcomeError,
  });

  // This component doesn't render anything visible
  // It just handles the voice welcome logic
  return null;
}

/**
 * Hook version for more control
 */
export function usePageVoiceWelcome(options?: {
  enabled?: boolean;
  delay?: number;
}) {
  const { isPlaying, userName } = useVoiceWelcome({
    enabled: options?.enabled ?? true,
    delay: options?.delay ?? 500,
  });

  return {
    isPlaying,
    userName,
  };
}

/**
 * Wrapper component that shows a subtle indicator when voice is playing
 */
export function VoiceWelcomeIndicator() {
  const { isPlaying, userName } = usePageVoiceWelcome();

  if (!isPlaying || !userName) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
      <span className="text-sm">Welcoming {userName}...</span>
    </div>
  );
}
