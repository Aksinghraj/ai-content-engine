import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpeechToTextMicrophoneProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Speech-to-Text Microphone Component
 * Allows users to speak and converts speech to text
 */
export function SpeechToTextMicrophone({
  onTranscript,
  onError,
  placeholder = "Click to speak...",
  disabled = false,
}: SpeechToTextMicrophoneProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const [interimTranscript, setInterimTranscript] = useState("");

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser");
      setIsBrowserSupported(false);
      const errorMsg =
        "Speech Recognition not supported. Please use Chrome, Edge, or Safari.";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("🎤 Speech recognition started");
      setIsListening(true);
      setError(null);
      setTranscript("");
      setInterimTranscript("");
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final += transcriptSegment + " ";
        } else {
          interim += transcriptSegment;
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setTranscript((prev) => prev + final);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("❌ Speech recognition error:", event.error);
      let errorMessage = "Speech recognition error";

      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected. Please try again.";
          break;
        case "audio-capture":
          errorMessage = "No microphone found. Check your audio settings.";
          break;
        case "network":
          errorMessage = "Network error. Please check your connection.";
          break;
        case "permission-denied":
          errorMessage = "Microphone permission denied.";
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }

      setError(errorMessage);
      onError?.(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("🎤 Speech recognition ended");
      setIsListening(false);

      // Send final transcript
      const finalText = (transcript + interimTranscript).trim();
      if (finalText) {
        console.log("📝 Final transcript:", finalText);
        onTranscript(finalText);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript, onError, transcript, interimTranscript]);

  const handleMicClick = () => {
    if (!isBrowserSupported) {
      const errorMsg =
        "Speech Recognition not supported. Please use Chrome, Edge, or Safari.";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (isListening) {
      console.log("🛑 Stopping speech recognition");
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      console.log("🎤 Starting speech recognition");
      setTranscript("");
      setInterimTranscript("");
      setError(null);
      recognitionRef.current?.start();
    }
  };

  const handleClear = () => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Microphone Button */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleMicClick}
          disabled={disabled || !isBrowserSupported}
          variant={isListening ? "default" : "outline"}
          size="sm"
          className={`flex items-center gap-2 ${
            isListening
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
          title={isListening ? "Click to stop recording" : "Click to start recording"}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 animate-pulse" />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Start Recording</span>
            </>
          )}
        </Button>

        {/* Clear Button */}
        {(transcript || interimTranscript) && (
          <Button
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">{transcript}</span>
            <span className="text-gray-500 italic">{interimTranscript}</span>
          </div>
        </div>
      )}

      {/* Listening Indicator */}
      {isListening && (
        <div className="flex items-center gap-2 text-sm text-purple-600">
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span>Listening...</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Browser Support Warning */}
      {!isBrowserSupported && (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <span className="text-sm text-yellow-700">
            Speech-to-text requires Chrome, Edge, or Safari
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Hook for using speech-to-text
 */
export function useSpeechToText() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcriptSegment + " ");
        } else {
          interim += transcriptSegment;
        }
      }
    };

    recognition.onerror = (event: any) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setError(null);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setError(null);
  };

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    clearTranscript,
  };
}
