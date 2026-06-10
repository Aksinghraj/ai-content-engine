/**
 * Mock Data for Post Scheduling Feature
 * Used for UI development and testing before connecting real accounts
 */

export interface MockAccount {
  id: string;
  platform: "instagram" | "twitter" | "linkedin" | "facebook" | "youtube" | "tiktok";
  username: string;
  displayName: string;
  followers: number;
  avatar: string;
  connected: boolean;
  color: string;
}

export interface MockPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledAt: Date;
  status: "draft" | "scheduled" | "posted" | "failed";
  media?: {
    url: string;
    type: "image" | "video";
    alt?: string;
  }[];
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  createdAt: Date;
  postedAt?: Date;
}

export interface MockAnalytics {
  totalPosts: number;
  postedToday: number;
  scheduledForWeek: number;
  averageEngagement: number;
  topPerformingPost: MockPost;
  bestTimeToPost: string;
}

// Mock Social Media Accounts
export const mockAccounts: MockAccount[] = [
  {
    id: "1",
    platform: "instagram",
    username: "@yourinstagram",
    displayName: "Your Instagram",
    followers: 15420,
    avatar: "🎨",
    connected: true,
    color: "from-pink-500 to-purple-500",
  },
  {
    id: "2",
    platform: "twitter",
    username: "@yourtwitter",
    displayName: "Your Twitter",
    followers: 8932,
    avatar: "🐦",
    connected: true,
    color: "from-blue-400 to-blue-600",
  },
  {
    id: "3",
    platform: "linkedin",
    username: "yourlinkedin",
    displayName: "Your LinkedIn",
    followers: 5420,
    avatar: "💼",
    connected: true,
    color: "from-blue-600 to-blue-800",
  },
  {
    id: "4",
    platform: "facebook",
    username: "yourfacebook",
    displayName: "Your Facebook",
    followers: 12340,
    avatar: "👥",
    connected: true,
    color: "from-blue-500 to-blue-700",
  },
  {
    id: "5",
    platform: "youtube",
    username: "YourYouTube",
    displayName: "Your YouTube",
    followers: 45230,
    avatar: "📺",
    connected: true,
    color: "from-red-500 to-red-700",
  },
  {
    id: "6",
    platform: "tiktok",
    username: "@yourtiktok",
    displayName: "Your TikTok",
    followers: 89450,
    avatar: "🎵",
    connected: true,
    color: "from-black to-gray-800",
  },
];

// Mock Scheduled Posts
export const mockScheduledPosts: MockPost[] = [
  {
    id: "post-1",
    content:
      "🚀 Excited to announce our new AI-powered content automation tool! It's going to revolutionize how creators manage their social media. Who's ready? #AI #ContentCreation #Automation",
    platforms: ["instagram", "twitter", "linkedin"],
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    status: "scheduled",
    media: [
      {
        url: "https://images.unsplash.com/photo-1677442d019cecf8978b4fab0e6e1f1e?w=500&h=500&fit=crop",
        type: "image",
        alt: "AI Technology",
      },
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "post-2",
    content:
      "Just launched our latest feature: AI-powered post scheduling! 🎯 Plan your content weeks in advance and let AI handle the rest. Check it out! #ProductLaunch",
    platforms: ["twitter", "facebook"],
    scheduledAt: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
    status: "scheduled",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: "post-3",
    content:
      "Behind the scenes: How our team built the fastest content automation platform 🏗️ Watch the full story on our YouTube channel! #BehindTheScenes #Development",
    platforms: ["youtube", "instagram", "tiktok"],
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    status: "scheduled",
    media: [
      {
        url: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500&h=500&fit=crop",
        type: "video",
        alt: "Behind the scenes video",
      },
    ],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: "post-4",
    content:
      "💡 Pro tip: The best time to post on Instagram is 11 AM on weekdays. Our analytics show 3x more engagement during this window. What's your best posting time?",
    platforms: ["instagram"],
    scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
    status: "scheduled",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: "post-5",
    content:
      "🎉 Celebrating 100K followers! Thank you all for the support. Here's to the next milestone! 🚀",
    platforms: ["instagram", "twitter", "facebook", "tiktok"],
    scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Posted 2 hours ago
    status: "posted",
    engagement: {
      likes: 4523,
      comments: 342,
      shares: 128,
      views: 45230,
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "post-6",
    content:
      "New blog post: 10 Strategies to Grow Your Social Media Presence in 2024 📈 Read the full article on our blog!",
    platforms: ["linkedin", "twitter"],
    scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    status: "posted",
    engagement: {
      likes: 892,
      comments: 67,
      shares: 45,
      views: 12340,
    },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

// Mock Analytics
export const mockAnalytics: MockAnalytics = {
  totalPosts: 156,
  postedToday: 3,
  scheduledForWeek: 12,
  averageEngagement: 2847,
  topPerformingPost: {
    id: "post-5",
    content: "🎉 Celebrating 100K followers! Thank you all for the support. Here's to the next milestone! 🚀",
    platforms: ["instagram", "twitter", "facebook", "tiktok"],
    scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "posted",
    engagement: {
      likes: 4523,
      comments: 342,
      shares: 128,
      views: 45230,
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  bestTimeToPost: "11:00 AM - 1:00 PM (Weekdays)",
};

// Helper function to get mock account by platform
export function getMockAccountByPlatform(
  platform: string
): MockAccount | undefined {
  return mockAccounts.find((acc) => acc.platform === platform);
}

// Helper function to get all mock posts for a specific status
export function getMockPostsByStatus(status: MockPost["status"]): MockPost[] {
  return mockScheduledPosts.filter((post) => post.status === status);
}

// Helper function to format date for display
export function formatScheduleTime(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `in ${minutes}m`;
  } else {
    return "Now";
  }
}

// Helper function to get engagement rate
export function getEngagementRate(post: MockPost): number {
  if (!post.engagement) return 0;
  const totalEngagement =
    post.engagement.likes +
    post.engagement.comments +
    post.engagement.shares;
  return post.engagement.views > 0
    ? Math.round((totalEngagement / post.engagement.views) * 100 * 10) / 10
    : 0;
}

// Helper function to get platform color
export function getPlatformColor(platform: string): string {
  const account = mockAccounts.find((acc) => acc.platform === platform);
  return account?.color || "from-gray-500 to-gray-700";
}

// Helper function to get platform icon emoji
export function getPlatformEmoji(platform: string): string {
  const account = mockAccounts.find((acc) => acc.platform === platform);
  return account?.avatar || "📱";
}
