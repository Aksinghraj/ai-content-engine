/**
 * Encryption Router
 * Provides encryption status and utilities for the frontend
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { ENCRYPTION_INFO, encrypt, decrypt } from "../_core/encryption";

export const encryptionRouter = router({
  // Get encryption status info
  getEncryptionStatus: protectedProcedure.query(() => {
    return {
      enabled: true,
      ...ENCRYPTION_INFO,
      features: [
        "Social media credentials",
        "Chat messages",
        "Scheduled post content",
        "File metadata",
        "User preferences",
        "API tokens",
      ],
    };
  }),

  // Encrypt sensitive data before storage
  encryptData: protectedProcedure
    .input(z.object({ data: z.string() }))
    .mutation(({ input }) => {
      const encrypted = encrypt(input.data);
      return { encrypted, success: true };
    }),

  // Decrypt data for display
  decryptData: protectedProcedure
    .input(z.object({ encryptedData: z.string() }))
    .mutation(({ input }) => {
      try {
        const decrypted = decrypt(input.encryptedData);
        return { decrypted, success: true };
      } catch {
        return { decrypted: null, success: false, error: "Decryption failed" };
      }
    }),
});
