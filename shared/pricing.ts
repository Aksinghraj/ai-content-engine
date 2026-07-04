/**
 * SINGLE SOURCE OF TRUTH for all pricing and credit amounts.
 * Import from this file everywhere — never hardcode prices in components.
 */

export const SUBSCRIPTION_PLANS_DISPLAY = {
  free: {
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "₹",
    label: "Forever free",
    generationsPerDay: 5,
    features: [
      "5 content generations per day",
      "All core features included",
      "30-day content history",
      "Basic analytics",
    ],
    limitations: [
      "No automation",
      "No advanced analytics",
    ],
  },
  pro: {
    name: "Pro",
    priceMonthly: 999,       // ₹999/month
    priceYearly: 9999,       // ₹9,999/year (save ~17%)
    currency: "₹",
    label: "Billed monthly, cancel anytime",
    generationsPerDay: -1,   // unlimited
    features: [
      "Unlimited content generations",
      "Advanced analytics",
      "AI content generation",
      "Multi-platform scheduling",
      "Priority support",
      "Custom branding",
      "Automation workflows",
      "All core features",
    ],
    limitations: [],
  },
} as const;

export const CREDIT_PACKAGES_DISPLAY = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 100,
    priceINR: 499,
    label: "₹499",
    perCreditLabel: "₹4.99/credit",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro Pack",
    credits: 500,
    priceINR: 1999,
    label: "₹1,999",
    perCreditLabel: "₹3.99/credit",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Pack",
    credits: 2000,
    priceINR: 5999,
    label: "₹5,999",
    perCreditLabel: "₹2.99/credit",
    popular: false,
  },
] as const;

/** Free trial credits granted to new users on first login */
export const FREE_TRIAL_CREDITS = 50;

/** Credit costs per feature */
export const CREDIT_COSTS = {
  contentRewrite: 5,
  contentGeneration: 10,
  automation: 10,
  imageGeneration: 20,
  videoGeneration: 50,
} as const;
