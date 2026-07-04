import { useState, useRef } from "react";
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
  Zap,
  BarChart3,
  CheckCircle2,
  Upload,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { SUBSCRIPTION_PLANS_DISPLAY } from "../../../shared/pricing";

export default function ProfileAdvanced() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || "Your Name",
    email: user?.email || "",
    phone: "",
    bio: "Content creator & social media strategist. Building the future of AI-powered content.",
    location: "India",
    website: "https://lumae.co.in",
    socialLinks: {
      linkedin: "",
      twitter: "",
      instagram: "",
      facebook: "",
    },
  });



  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/profile/upload-avatar", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setAvatarPreview(data.url);
        toast.success("Profile photo updated!");
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Cover image must be smaller than 10MB");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCoverPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/profile/upload-cover", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setCoverPreview(data.url);
        toast.success("Cover photo updated!");
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleUpgradeSubscription = () => {
    navigate("/razorpay-payments");
  };

  const handleCancelSubscription = () => {
    if (window.confirm("Are you sure you want to cancel your subscription?")) {
      toast.error("Subscription cancellation initiated. Contact support for assistance.");
    }
  };

  const currentPlan = user?.subscriptionTier === "pro"
    ? SUBSCRIPTION_PLANS_DISPLAY.pro
    : SUBSCRIPTION_PLANS_DISPLAY.free;

  const avatarSrc = avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || "user")}`;
  const coverSrc = coverPreview || "https://images.unsplash.com/photo-1579546929662-711aa33e6b14?w=1200&h=400&fit=crop";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hidden file inputs */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />

        {/* Cover Image */}
        <div className="relative h-48 rounded-lg overflow-hidden group">
          <img
            src={coverSrc}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploadingCover}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 p-2 rounded-lg text-white transition-all flex items-center gap-2"
            title="Change cover photo"
          >
            {isUploadingCover ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Camera className="w-5 h-5" />
                <span className="text-xs hidden sm:inline">Change Cover</span>
              </>
            )}
          </button>
        </div>

        {/* Profile Header */}
        <div className="relative -mt-24 px-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <img
                src={avatarSrc}
                alt="Avatar"
                className="w-32 h-32 rounded-full border-4 border-slate-900 object-cover"
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 rounded-full transition-all"
                title="Change profile photo"
              >
                {isUploadingAvatar ? (
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="opacity-0 group-hover:opacity-100 flex flex-col items-center gap-1">
                    <Upload className="w-6 h-6 text-white" />
                    <span className="text-white text-xs font-medium">Upload</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 p-2 rounded-full text-white shadow-lg"
                title="Change profile photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                {user?.subscriptionTier === "pro" && (
                  <CheckCircle2 className="w-6 h-6 text-blue-400" />
                )}
              </div>
              <p className="text-slate-400 mb-3">
                {user?.subscriptionTier === "pro" ? "Pro Member" : "Free Member"}
              </p>
              <div className="flex flex-wrap gap-2">
                {user?.subscriptionTier === "pro" && (
                  <Badge className="bg-purple-500/20 text-purple-300">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro Plan
                  </Badge>
                )}
                <Badge className="bg-green-500/20 text-green-300">
                  Active Account
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

        {/* Photo Upload Helper Text */}
        <div className="px-6">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Camera className="w-3 h-3" />
            Tap the camera icon or hover over your photo to upload from your gallery. Supports JPG, PNG, GIF, WebP.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
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
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Location</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-400">Website</label>
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-400">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={4}
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-4 border-t border-slate-700/50">
                  <h4 className="text-white font-semibold mb-3">Social Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: "linkedin", icon: <Linkedin className="w-4 h-4" />, label: "LinkedIn" },
                      { key: "twitter", icon: <Twitter className="w-4 h-4" />, label: "Twitter" },
                      { key: "instagram", icon: <Instagram className="w-4 h-4" />, label: "Instagram" },
                      { key: "facebook", icon: <Facebook className="w-4 h-4" />, label: "Facebook" },
                    ].map(({ key, icon, label }) => (
                      <div key={key}>
                        <label className="text-sm text-slate-400 flex items-center gap-2">
                          {icon} {label}
                        </label>
                        <input
                          type="url"
                          value={profile.socialLinks[key as keyof typeof profile.socialLinks]}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              socialLinks: { ...profile.socialLinks, [key]: e.target.value },
                            })
                          }
                          placeholder={`https://${key}.com/yourprofile`}
                          className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700/50 p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-400">Name</p>
                        <p className="text-white">{profile.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-400">Email</p>
                        <p className="text-white">{profile.email || user?.email || "—"}</p>
                      </div>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-xs text-slate-400">Phone</p>
                          <p className="text-white">{profile.phone}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-400">Location</p>
                        <p className="text-white">{profile.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-400">Website</p>
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                          {profile.website}
                        </a>
                      </div>
                    </div>
                  </div>
                  {profile.bio && (
                    <div className="pt-4 border-t border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-1">Bio</p>
                      <p className="text-slate-300">{profile.bio}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 1, name: "Content Creator", description: "Create your first post", icon: "✍️", unlocked: true },
                { id: 2, name: "Viral Sensation", description: "Get 10K engagement on a post", icon: "🚀", unlocked: false },
                { id: 3, name: "Multi-Platform Master", description: "Connect 5 social platforms", icon: "🌐", unlocked: false },
                { id: 4, name: "AI Expert", description: "Use AI features 50 times", icon: "🤖", unlocked: false },
              ].map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`p-4 transition-all ${achievement.unlocked ? "bg-slate-800/50 border-purple-500/30" : "bg-slate-900/50 border-slate-700/30 opacity-60"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{achievement.name}</h4>
                      <p className="text-xs text-slate-400">{achievement.description}</p>
                    </div>
                    {achievement.unlocked ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                    )}
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
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    {user?.subscriptionTier === "pro" && <Crown className="w-6 h-6 text-yellow-400" />}
                    {currentPlan.name} Plan
                  </h3>
                  <p className="text-purple-200 mt-1">
                    {currentPlan.priceMonthly === 0
                      ? "Free forever"
                      : `${currentPlan.currency}${currentPlan.priceMonthly.toLocaleString("en-IN")}/month`}
                  </p>
                </div>
                <Badge className={user?.subscriptionTier === "pro" ? "bg-green-500/20 text-green-300" : "bg-slate-500/20 text-slate-300"}>
                  {user?.subscriptionTier === "pro" ? "Active" : "Free Tier"}
                </Badge>
              </div>

              <div className="pt-4 border-t border-purple-500/20">
                <h4 className="text-white font-semibold mb-3">Included Features</h4>
                <div className="space-y-2">
                  {currentPlan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {user?.subscriptionTier !== "pro" && (
                  <Button
                    onClick={handleUpgradeSubscription}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Pro — {SUBSCRIPTION_PLANS_DISPLAY.pro.currency}{SUBSCRIPTION_PLANS_DISPLAY.pro.priceMonthly.toLocaleString("en-IN")}/mo
                  </Button>
                )}
                {user?.subscriptionTier === "pro" && (
                  <Button
                    onClick={handleCancelSubscription}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
