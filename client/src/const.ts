export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate Google OAuth login URL with a safe post-login application path.
export const getLoginUrl = (returnPath = "/") => {
  const origin = window.location.origin;
  const safePath = returnPath.startsWith("/") && !returnPath.startsWith("//") ? returnPath : "/";
  return `${origin}/api/oauth/google/login?returnPath=${encodeURIComponent(safePath)}`;
};
