/**
 * Language Detection and Multilingual Response Handler
 * Detects user language and generates responses in the same language
 */

import { invokeLLM } from "./llm";

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: "English",
  hi: "Hindi",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  ja: "Japanese",
  zh: "Chinese (Simplified)",
  ar: "Arabic",
  ru: "Russian",
  it: "Italian",
  ko: "Korean",
  nl: "Dutch",
  pl: "Polish",
  tr: "Turkish",
  vi: "Vietnamese",
  th: "Thai",
  id: "Indonesian",
  bn: "Bengali",
  pa: "Punjabi",
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

/**
 * Detect language from text using LLM
 */
export async function detectLanguage(text: string): Promise<{
  language: SupportedLanguage;
  confidence: number;
  languageName: string;
}> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a language detection expert. Analyze the given text and determine which language it is written in.
          
Respond with ONLY a JSON object in this format:
{
  "language_code": "xx",
  "language_name": "Language Name",
  "confidence": 0.95
}

Supported language codes: ${Object.keys(SUPPORTED_LANGUAGES).join(", ")}

If the text is in a language not in the supported list, use the closest match.`,
        },
        {
          role: "user",
          content: `Detect the language of this text: "${text.substring(0, 200)}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "language_detection",
          strict: true,
          schema: {
            type: "object",
            properties: {
              language_code: {
                type: "string",
                description: "Two-letter language code (e.g., 'en', 'hi', 'es')",
              },
              language_name: {
                type: "string",
                description: "Full language name",
              },
              confidence: {
                type: "number",
                description: "Confidence score between 0 and 1",
              },
            },
            required: ["language_code", "language_name", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);

    const language = (parsed.language_code as SupportedLanguage) || "en";

    return {
      language,
      confidence: parsed.confidence,
      languageName: parsed.language_name,
    };
  } catch (error) {
    console.error("Language detection error:", error);
    // Default to English if detection fails
    return {
      language: "en",
      confidence: 0.5,
      languageName: "English (Default)",
    };
  }
}

/**
 * Generate multilingual response
 */
export async function generateMultilingualResponse(
  userMessage: string,
  detectedLanguage: SupportedLanguage,
  systemPrompt: string = "You are a helpful assistant."
): Promise<string> {
  const languageName = SUPPORTED_LANGUAGES[detectedLanguage];

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `${systemPrompt}

IMPORTANT: You MUST respond in ${languageName} (language code: ${detectedLanguage}).
- Match the tone and style of the user's message
- Use appropriate cultural context for the language
- Maintain the same formality level as the user
- Use local idioms and expressions where appropriate

If the user writes in a casual tone, respond casually.
If the user writes formally, respond formally.
If the user writes with humor, respond with humor.`,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === 'string' ? content : JSON.stringify(content);
}

/**
 * Detect language and generate response in one call
 */
export async function detectAndRespond(
  userMessage: string,
  systemPrompt?: string
): Promise<{
  language: SupportedLanguage;
  languageName: string;
  response: string;
  confidence: number;
}> {
  // Detect language
  const detection = await detectLanguage(userMessage);

  // Generate response in detected language
  const response = await generateMultilingualResponse(
    userMessage,
    detection.language,
    systemPrompt
  );

  return {
    language: detection.language,
    languageName: detection.languageName,
    response,
    confidence: detection.confidence,
  };
}

/**
 * Format multilingual response with language info
 */
export function formatMultilingualResponse(
  response: string,
  language: SupportedLanguage,
  includeLanguageTag: boolean = false
): string {
  if (!includeLanguageTag) {
    return response;
  }

  const languageName = SUPPORTED_LANGUAGES[language];
  return `[${languageName}]\n${response}`;
}

/**
 * Get language code from language name
 */
export function getLanguageCode(languageName: string): SupportedLanguage | null {
  const entry = Object.entries(SUPPORTED_LANGUAGES).find(
    ([_, name]) => name.toLowerCase() === languageName.toLowerCase()
  );
  return entry ? (entry[0] as SupportedLanguage) : null;
}

/**
 * Check if language is supported
 */
export function isLanguageSupported(language: string): boolean {
  return language in SUPPORTED_LANGUAGES;
}

/**
 * Get all supported languages
 */
export function getAllSupportedLanguages(): Array<{
  code: SupportedLanguage;
  name: string;
}> {
  return Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
    code: code as SupportedLanguage,
    name,
  }));
}
