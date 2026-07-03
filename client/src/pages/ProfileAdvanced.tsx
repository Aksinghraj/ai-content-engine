import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Edit2,
  Save,
  X,
  Camera,
  Award,
  TrendingUp,
  Zap,
  Users,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Heart,
  Share2,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
  coverImage: string;
  joinDate: string;
  role: string;
  verified: boolean;
  socialLinks: {
    linkedin: string;
    twitter: string;
    instagram: string;
    facebook: string;
  };
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  progress: number;
}

interface SubscriptionPlan {
  name: string;
  price: number;
  status: "active" | "inactive" | "expired";
  startDate: string;
  endDate: string;
  features: string[];
  renewalDate: string;
}

export default function ProfileAdvanced() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: "Ak Rajput",
    email: "ak@lumae.ai",
    phone: "+1 (555) 123-4567",
    bio: "Content creator & social media strategist. Building the future of AI-powered content.",
    location: "San Francisco, CA",
    website: "https://lumae.ai",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ak",
    coverImage: "https://images.unsplash.com/photo-1579546929662-711aa33e6b14?w=1200&h=400&fit=crop",
    joinDate: "2026-01-15",
    role: "Premium Member",
    verified: true,
    socialLinks: {
      linkedin: "https://linkedin.com/in/akrajput",
      twitter: "https://twitter.com/akrajput",
      instagram: "https://instagram.com/akrajput",
      facebook: "https://facebook.com/akrajput",
    },
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      name: "Content Creator",
      description: "Create your first post",
      icon: "✍️",
      unlockedAt: "2026-01-20",
      progress: 100,
    },
    {
      id: 2,
      name: "Viral Sensation",
      description: "Get 10K engagement on a post",
      icon: "🚀",
      unlockedAt: "2026-02-10",
      progress: 100,
    },
    {
      id: 3,
      name: "Multi-Platform Master",
      description: "Connect 5 social platforms",
      icon: "🌐",
      unlockedAt: "2026-03-05",
      progress: 100,
    },
    {
      id: 4,
      name: "AI Expert",
      description: "Use AI features 50 times",
      icon: "🤖",
      unlockedAt: "2026-04-12",
      progress: 100,
    },
  ]);

  const [subscription, setSubscription] = useState<SubscriptionPlan>({
    name: "Premium Pro",
    price: 99,
    status: "active",
    startDate: "2026-06-01",
    endDate: "2026-07-01",
    renewalDate: "2026-07-01",
    features: [
      "Unlimited posts",
      "Advanced analytics",
      "AI content generation",
      "Multi-platform scheduling",
      "Priority support",
      "Custom branding",
    ],
  });

  const [stats, setStats] = useState({
    totalPosts: 247,
    totalEngagement: 125430,
    followers: 8932,
    averageEngagementRate: 18.5,
    contentCreated: 156,
    hoursScheduled: 342,
    platformsConnected: 5,
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleUpgradeSubscription = () => {
    toast.success("Redirecting to upgrade page...");
  };

  const handleCancelSubscription = () => {
    if (window.confirm("Are you sure you want to cancel your subscription?")) {
      toast.error("Subscription cancellation initiated");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cover Image */}
        <div className="relative h-48 rounded-lg overflow-hidden">
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <button className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-lg text-white transition-all">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="relative -mt-24 px-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatar}
                alt="Avatar"
                className="w-32 h-32 rounded-full border-4 border-slate-900 object-cover"
              />
              <button className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 p-2 rounded-full text-white">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                {profile.verified && (
                  <CheckCircle2 className="w-6 h-6 text-blue-400" />
                )}
              </div>
              <p className="text-slate-400 mb-3">{profile.role}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-purple-500/20 text-purple-300">
                  {stats.platformsConnected} Platforms Connected
                </Badge>
                <Badge className="bg-green-500/20 text-green-300">
                  {stats.totalPosts} Posts Created
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Subscription</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            {isEditing ? (
              <Card className="bg-slate-800/50 border-slate-700/50 p-6 space-y-4">
                <h3 className="text-white font-semibold mb-4">Edit Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Location</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) =>
                        setProfile({ ...profile, location: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-400">Website</label>
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) =>
                        setProfile({ ...profile, website: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-400">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) =>
                        setProfile({ ...profile, bio: e.target.value })
                      }
                      rows={4}
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-4 border-t border-slate-700/50">
                  <h4 className="text-white font-semibold mb-3">Social Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-400 flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={profile.socialLinks.linkedin}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            socialLinks: {
                              ...profile.socialLinks,
                              linkedin: e.target.value,
                            },
                          })
                        }
                        className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 flex items-center gap-2">
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={profile.socialLinks.twitter}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            socialLinks: {
                              ...profile.socialLinks,
                              twitter: e.target.value,
                            },
                          })
                        }
                        className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 flex items-center gap-2">
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={profile.socialLinks.instagram}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            socialLinks: {
                              ...profile.socialLinks,
                              instagram: e.target.value,
                            },
                          })
                        }
                        className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 flex items-center gap-2">
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={profile.socialLinks.facebook}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            socialLinks: {
                              ...profile.socialLinks,
                              facebook: e.target.value,
                            },
                          })
                        }
                        className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <Card className="bg-slate-800/50 border-slate-700/50 p-6 space-y-4">
                  <h3 className="text-white font-semibold">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-400">Email</p>
                        <p className="text-white">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-xs text-slate-400">Phone</p>
                        <p className="text-white">{profile.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="text-xs text-slate-400">Location</p>
                        <p className="text-white">{profile.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-400">Website</p>
                        <p className="text-white text-sm break-all">{profile.website}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Bio & Social */}
                <Card className="bg-slate-800/50 border-slate-700/50 p-6 space-y-4">
                  <h3 className="text-white font-semibold">About</h3>
                  <p className="text-slate-300">{profile.bio}</p>
                  <div className="pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-3">Social Links</p>
                    <div className="flex gap-3">
                      {profile.socialLinks.linkedin && (
                        <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-5 h-5 text-blue-400 hover:text-blue-300 cursor-pointer" />
                        </a>
                      )}
                      {profile.socialLinks.twitter && (
                        <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="w-5 h-5 text-blue-400 hover:text-blue-300 cursor-pointer" />
                        </a>
                      )}
                      {profile.socialLinks.instagram && (
                        <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                          <Instagram className="w-5 h-5 text-pink-400 hover:text-pink-300 cursor-pointer" />
                        </a>
                      )}
                      {profile.socialLinks.facebook && (
                        <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                          <Facebook className="w-5 h-5 text-blue-500 hover:text-blue-400 cursor-pointer" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/20 p-4">
                <div className="space-y-2">
                  <p className="text-blue-300 text-xs font-medium">Total Posts</p>
                  <p className="text-3xl font-bold text-white">{stats.totalPosts}</p>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/20 p-4">
                <div className="space-y-2">
                  <p className="text-green-300 text-xs font-medium">Total Engagement</p>
                  <p className="text-3xl font-bold text-white">{(stats.totalEngagement / 1000).toFixed(1)}K</p>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/20 p-4">
                <div className="space-y-2">
                  <p className="text-purple-300 text-xs font-medium">Followers</p>
                  <p className="text-3xl font-bold text-white">{(stats.followers / 1000).toFixed(1)}K</p>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border-pink-500/20 p-4">
                <div className="space-y-2">
                  <p className="text-pink-300 text-xs font-medium">Avg Engagement Rate</p>
                  <p className="text-3xl font-bold text-white">{stats.averageEngagementRate}%</p>
                </div>
              </Card>
            </div>

            {/* Detailed Stats */}
            <Card className="bg-slate-800/50 border-slate-700/50 p-6 space-y-4">
              <h3 className="text-white font-semibold">Detailed Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-700/20 rounded-lg">
                  <p className="text-slate-400 text-sm">Content Created</p>
                  <p className="text-2xl font-bold text-white mt-2">{stats.contentCreated}</p>
                </div>
                <div className="p-4 bg-slate-700/20 rounded-lg">
                  <p className="text-slate-400 text-sm">Hours Scheduled</p>
                  <p className="text-2xl font-bold text-white mt-2">{stats.hoursScheduled}</p>
                </div>
                <div className="p-4 bg-slate-700/20 rounded-lg">
                  <p className="text-slate-400 text-sm">Platforms Connected</p>
                  <p className="text-2xl font-bold text-white mt-2">{stats.platformsConnected}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className="bg-slate-800/50 border-slate-700/50 p-4 hover:border-purple-500/30 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{achievement.name}</h4>
                        <p className="text-xs text-slate-400">{achievement.description}</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-xs text-slate-400">
                      Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-4">
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/20 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">{subscription.name}</h3>
                  <p className="text-purple-200 mt-1">${subscription.price}/month</p>
                </div>
                <Badge className="bg-green-500/20 text-green-300">Active</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-purple-500/20">
                <div>
                  <p className="text-xs text-slate-400">Start Date</p>
                  <p className="text-white font-semibold">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Renewal Date</p>
                  <p className="text-white font-semibold">
                    {new Date(subscription.renewalDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-500/20">
                <h4 className="text-white font-semibold mb-3">Included Features</h4>
                <div className="space-y-2">
                  {subscription.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpgradeSubscription}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Upgrade Plan
                </Button>
                <Button
                  onClick={handleCancelSubscription}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel Subscription
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
