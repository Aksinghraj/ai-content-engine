import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  detectLanguage,
  generateMultilingualResponse,
  detectAndRespond,
  getAllSupportedLanguages,
  isLanguageSupported,
} from "../_core/languageDetection";

/**
 * Multilingual AI Response Router
 * Handles language detection and multilingual responses
 */

export const multilingualAIRouter = router({
  /**
   * Detect language from text
   */
  detectLanguage: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const result = await detectLanguage(input.text);
        return {
          success: true,
          ...result,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to detect language",
        });
      }
    }),

  /**
   * Generate response in user's language
   */
  generateResponse: publicProcedure
    .input(
      z.object({
        userMessage: z.string().min(1),
        language: z.string().optional(),
        systemPrompt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        let language = input.language;

        // Detect language if not provided
        if (!language) {
          const detection = await detectLanguage(input.userMessage);
          language = detection.language;
        }

        if (!isLanguageSupported(language)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Language '${language}' is not supported`,
          });
        }

        const response = await generateMultilingualResponse(
          input.userMessage,
          language as any,
          input.systemPrompt
        );

        return {
          success: true,
          response,
          language,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate response: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Detect language and generate response in one call
   */
  detectAndRespond: publicProcedure
    .input(
      z.object({
        userMessage: z.string().min(1),
        systemPrompt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await detectAndRespond(
          input.userMessage,
          input.systemPrompt
        );

        return {
          success: true,
          ...result,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to detect and respond: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Get all supported languages
   */
  getSupportedLanguages: publicProcedure.query(async () => {
    try {
      const languages = getAllSupportedLanguages();
      return {
        success: true,
        languages,
        total: languages.length,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch supported languages",
      });
    }
  }),

  /**
   * Chat with multilingual support
   * Detects language and responds in the same language
   */
  chat: publicProcedure
    .input(
      z.object({
        message: z.string().min(1),
        context: z.string().optional(),
        includeLanguageInfo: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Build system prompt with context if provided
        let systemPrompt = "You are a helpful AI assistant.";
        if (input.context) {
          systemPrompt += `\n\nContext: ${input.context}`;
        }

        // Detect language and generate response
        const result = await detectAndRespond(input.message, systemPrompt);

        return {
          success: true,
          message: input.message,
          response: result.response,
          language: result.language,
          languageName: result.languageName,
          confidence: result.confidence,
          includeLanguageInfo: input.includeLanguageInfo,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Chat failed: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Translate text to a specific language
   */
  translate: publicProcedure
    .input(
      z.object({
        text: z.string().min(1),
        targetLanguage: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!isLanguageSupported(input.targetLanguage)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Target language '${input.targetLanguage}' is not supported`,
          });
        }

        const response = await generateMultilingualResponse(
          `Translate the following text to ${input.targetLanguage}:\n\n${input.text}`,
          input.targetLanguage as any,
          "You are a professional translator. Translate the given text accurately while maintaining the original tone and meaning."
        );

        return {
          success: true,
          originalText: input.text,
          translatedText: response,
          targetLanguage: input.targetLanguage,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Translation failed: ${(error as Error).message}`,
        });
      }
    }),
});
