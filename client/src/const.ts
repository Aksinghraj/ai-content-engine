export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate Google OAuth login URL
export const getLoginUrl = () => {
  const origin = window.location.origin;
  return `${origin}/api/oauth/google/login?origin=${encodeURIComponent(origin)}`;
};
