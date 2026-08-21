import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../../server/routers";
import { notifyRateLimited } from "./rateLimitFeedback";

export const trpc = createTRPCReact<AppRouter>();

// Vanilla tRPC client for use outside React components (event handlers, utilities)
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      async fetch(input, init) {
        const response = await globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
        if (response.status === 429) notifyRateLimited(response.headers);
        return response;
      },
    }),
  ],
});
