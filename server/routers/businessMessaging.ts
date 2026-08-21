import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createBusinessContact, getWhatsAppBusinessConnection, listBusinessContacts, setWhatsAppBusinessConnectionState, withdrawBusinessContactConsent } from "../db/businessMessaging";
import { protectedProcedure, router } from "../_core/trpc";

const contactInput = z.object({
  name: z.string().trim().max(160).optional(),
  email: z.string().trim().email().max(320).optional(),
  phone: z.string().trim().min(6).max(40).optional(),
  emailConsent: z.boolean(),
  whatsappConsent: z.boolean(),
});

function officialWhatsAppConfigured() {
  return Boolean(process.env.META_WHATSAPP_APP_ID && process.env.META_WHATSAPP_CONFIG_ID && process.env.META_WHATSAPP_APP_SECRET);
}

export const businessMessagingRouter = router({
  contacts: router({
    list: protectedProcedure.query(({ ctx }) => listBusinessContacts(ctx.user.id)),
    create: protectedProcedure.input(contactInput).mutation(async ({ ctx, input }) => {
      if (!input.email && !input.phone) throw new TRPCError({ code: "BAD_REQUEST", message: "Add an email address or WhatsApp phone number." });
      if (input.email && !input.emailConsent) throw new TRPCError({ code: "BAD_REQUEST", message: "Record explicit email consent before adding an email contact." });
      if (input.phone && !input.whatsappConsent) throw new TRPCError({ code: "BAD_REQUEST", message: "Record explicit WhatsApp consent before adding a WhatsApp contact." });
      return { id: await createBusinessContact(ctx.user.id, { ...input, source: "manual" }) };
    }),
    withdrawConsent: protectedProcedure.input(z.object({ contactId: z.number().int().positive(), channel: z.enum(["email", "whatsapp"]) })).mutation(async ({ ctx, input }) => {
      const updated = await withdrawBusinessContactConsent(ctx.user.id, input.contactId, input.channel);
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Contact not found." });
      return { success: true };
    }),
  }),
  whatsapp: router({
    status: protectedProcedure.query(async ({ ctx }) => {
      const connection = await getWhatsAppBusinessConnection(ctx.user.id);
      const configured = officialWhatsAppConfigured();
      return {
        status: connection?.status ?? (configured ? "ready_to_link" : "not_configured"),
        displayPhoneNumber: connection?.displayPhoneNumber ?? null,
        configured,
        outboundMessagingEnabled: false,
      };
    }),
    beginOfficialLink: protectedProcedure.mutation(async ({ ctx }) => {
      if (!officialWhatsAppConfigured()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "WhatsApp connection is not configured yet. Complete the official Meta app setup first." });
      await setWhatsAppBusinessConnectionState(ctx.user.id, "ready_to_link");
      return { status: "ready_to_link" as const };
    }),
  }),
});
