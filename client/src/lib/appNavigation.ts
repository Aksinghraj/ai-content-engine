import {
  BarChart3,
  CalendarDays,
  CircleUserRound,
  CreditCard,
  LayoutDashboard,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type AppNavigationTab = {
  label: string;
  path: string;
};

export type AppNavigationArea = {
  label: string;
  path: string;
  icon: LucideIcon;
  tabs?: AppNavigationTab[];
};

export const appNavigation: AppNavigationArea[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  {
    label: "Content Studio",
    path: "/content-studio/ai-generator",
    icon: Sparkles,
    tabs: [
      { label: "AI Generator", path: "/content-studio/ai-generator" },
      { label: "Media Generation", path: "/content-studio/media-generation" },
      { label: "Content Rewriter", path: "/content-studio/content-rewriter" },
      { label: "Repurposing Engine", path: "/content-studio/repurposing" },
      { label: "Video Repurposing", path: "/content-studio/video-repurposing" },
      { label: "Format Agent", path: "/content-studio/format-agent" },
      { label: "Create Post Pro", path: "/content-studio/create-post-pro" },
    ],
  },
  {
    label: "Scheduling",
    path: "/scheduling/post-scheduling",
    icon: CalendarDays,
    tabs: [
      { label: "Post Scheduling", path: "/scheduling/post-scheduling" },
      { label: "Social Publishing", path: "/scheduling/social-publishing" },
      { label: "Connected Accounts", path: "/scheduling/connected-accounts" },
    ],
  },
  {
    label: "Automation",
    path: "/automation/auto-reply",
    icon: Zap,
    tabs: [
      { label: "Auto-Reply AI", path: "/automation/auto-reply" },
      { label: "Reply Inbox", path: "/automation/reply-inbox" },
      { label: "Escalation", path: "/automation/escalation" },
      { label: "Social Automation", path: "/automation/social-automation" },
    ],
  },
  {
    label: "Analytics",
    path: "/analytics/usage",
    icon: BarChart3,
    tabs: [
      { label: "Usage Analytics", path: "/analytics/usage" },
      { label: "ROI Dashboard", path: "/analytics/roi" },
      { label: "Viral Score", path: "/analytics/viral-score" },
    ],
  },
  {
    label: "Account",
    path: "/account/profile",
    icon: CircleUserRound,
    tabs: [
      { label: "My Profile", path: "/account/profile" },
      { label: "Settings", path: "/account/settings" },
      { label: "OAuth Settings", path: "/account/oauth-settings" },
    ],
  },
  {
    label: "Billing",
    path: "/billing/buy-credits",
    icon: CreditCard,
    tabs: [
      { label: "Buy Credits", path: "/billing/buy-credits" },
      { label: "My Credits", path: "/billing/my-credits" },
      { label: "Subscription Plans", path: "/billing/subscription-plans" },
    ],
  },
];

export function getNavigationArea(location: string) {
  return appNavigation.find((area) =>
    area.label === "Dashboard"
      ? location === "/dashboard"
      : area.tabs?.some((tab) => location === tab.path || location.startsWith(`${tab.path}/`)),
  );
}
