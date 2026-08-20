import { useEffect, useState, useRef } from "react";
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
  BriefcaseBusiness,
  BadgeCheck,
  Target,
  ShieldCheck,
  Sparkles,
  Eye,
  Copy,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { SUBSCRIPTION_PLANS_DISPLAY } from "../../../shared/pricing";
import { trpc } from "@/lib/trpc";

export default function ProfileAdvanced() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const profileQuery = trpc.professionalProfile.mine.useQuery();
  const saveProfileMutation = trpc.professionalProfile.save.useMutation();
  const profileViewsQuery = trpc.professionalProfile.viewSummary.useQuery();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || "Your Name",
    email: user?.email || "",
    professionalTitle: "Content Strategist & AI Workflow Builder",
    phone: "",
    bio: "I build practical content systems that help people turn ideas into clear, consistent publishing workflows.",
    expertise: "Content strategy, brand voice, AI workflows, social publishing",
    availability: "Open to collaborations",
    location: "India",
    website: "https://lumae.co.in",
    socialLinks: {
      linkedin: "",
      twitter: "",
      instagram: "",
      facebook: "",
    },
    publicSlug: "",
    isPublic: false,
    shareSocialLinks: false,
  });

  useEffect(() => {
    const stored = profileQuery.data;
    if (!stored) return;
    const links = (stored.socialLinks ?? {}) as Record<string, string>;
    setProfile({
      name: stored.displayName,
      email: user?.email || "",
      professionalTitle: stored.professionalTitle,
      phone: stored.phone || "",
      bio: stored.biography || "",
      expertise: stored.expertise || "",
      availability: stored.availability || "",
      location: stored.location || "",
      website: stored.website || "",
      socialLinks: {
        linkedin: links.linkedin || "",
        twitter: links.twitter || "",
        instagram: links.instagram || "",
        facebook: links.facebook || "",
      },
      publicSlug: stored.publicSlug || "",
      isPublic: stored.isPublic,
      shareSocialLinks: stored.shareSocialLinks,
    });
    setAvatarPreview(stored.avatarUrl || null);
    setCoverPreview(stored.coverUrl || null);
  }, [profileQuery.data, user?.email]);



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

  const handleSaveProfile = async () => {
    try {
      await saveProfileMutation.mutateAsync({
        displayName: profile.name.trim() || "Lumae creator",
        professionalTitle: profile.professionalTitle.trim() || "Content Strategist & AI Workflow Builder",
        biography: profile.bio.trim() || null,
        expertise: profile.expertise.trim() || null,
        availability: profile.availability.trim() || null,
        phone: profile.phone.trim() || null,
        location: profile.location.trim() || null,
        website: profile.website.trim() || null,
        avatarUrl: avatarPreview || null,
        coverUrl: coverPreview || null,
        socialLinks: Object.fromEntries(Object.entries(profile.socialLinks).filter(([, value]) => value.trim())),
        publicSlug: profile.publicSlug.trim() || null,
        isPublic: profile.isPublic,
        shareSocialLinks: profile.shareSocialLinks,
      });
      await profileQuery.refetch();
      setIsEditing(false);
      toast.success("Professional profile saved securely.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile could not be saved.");
    }
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

  const profileCompleteness = Math.round(([
    profile.name,
    profile.email || user?.email,
    profile.professionalTitle,
    profile.bio,
    profile.expertise,
    profile.location,
    profile.website,
  ].filter(Boolean).length / 7) * 100);
  const expertiseItems = profile.expertise.split(",").map((item) => item.trim()).filter(Boolean);

  const avatarSrc = avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || "user")}`;
  const coverSrc = coverPreview;
  const publicProfileUrl = profile.publicSlug ? `${window.location.origin}/u/${profile.publicSlug}` : "";
  const copyPublicProfileUrl = async () => {
    if (!profile.isPublic || !publicProfileUrl) {
      toast.info("Enable public sharing and choose a profile link first.");
      return;
    }
    await navigator.clipboard.writeText(publicProfileUrl);
    toast.success("Public profile link copied.");
  };

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

        {/* Professional profile cover */}
        <div className="relative h-52 overflow-hidden rounded-2xl border border-border group">
          {coverSrc ? (
            <img src={coverSrc} alt="Profile cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_16%_20%,rgb(99_102_241_/_35%),transparent_32%),radial-gradient(circle_at_84%_18%,rgb(6_182_212_/_20%),transparent_28%),linear-gradient(115deg,#18181b,#141417)] dark:bg-[radial-gradient(circle_at_16%_20%,rgb(99_102_241_/_30%),transparent_32%),radial-gradient(circle_at_84%_18%,rgb(6_182_212_/_16%),transparent_28%),linear-gradient(115deg,#09090b,#141417)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
            <BriefcaseBusiness className="h-3.5 w-3.5" /> Professional profile
          </div>
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploadingCover}
            className="absolute right-4 top-4 flex items-center gap-2 rounded-lg border border-white/15 bg-black/45 p-2 text-white transition-colors hover:bg-black/70"
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

        {/* Professional introduction header */}
        <div className="relative -mt-20 px-5 sm:px-7 space-y-5">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <img
                src={avatarSrc}
                alt="Avatar"
                className="h-28 w-28 rounded-2xl border-4 border-background object-cover shadow-xl sm:h-32 sm:w-32"
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
                className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg transition-transform hover:scale-105"
                title="Change profile photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">{profile.name}</h1>
                <BadgeCheck className="h-5 w-5 text-primary" aria-label="Verified account" />
              </div>
              <p className="mb-2 text-sm font-medium text-primary">{profile.professionalTitle}</p>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-border bg-card text-card-foreground">
                  <ShieldCheck className="mr-1 h-3 w-3 text-[#10b981]" />
                  {profile.availability}
                </Badge>
                {user?.subscriptionTier === "pro" && (
                  <Badge className="border border-primary/30 bg-primary/10 text-primary">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro Plan
                  </Badge>
                )}
                <Badge className="border border-border bg-card text-muted-foreground">
                  <Sparkles className="mr-1 h-3 w-3 text-[#8b5cf6]" />
                  {user?.subscriptionTier === "pro" ? "Pro member" : "Free member"}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="lumae-gradient-cta"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 px-5 sm:grid-cols-3 sm:px-7">
          {[
            { label: "Focus", value: "AI-assisted content", icon: Target },
            { label: "Profile status", value: "Active & verified", icon: ShieldCheck },
            { label: "Plan", value: currentPlan.name, icon: Crown },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="border-border bg-card p-4 shadow-sm">
              <Icon className="mb-2 h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm font-medium text-card-foreground">{value}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 px-5 sm:grid-cols-3 sm:px-7">
          <Card className="border-border bg-card p-4 shadow-sm">
            <Eye className="mb-2 h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Public profile views</p>
            <p className="mt-1 text-lg font-semibold text-card-foreground">{profileViewsQuery.data?.totalViews ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">{profileViewsQuery.data?.viewsLast30Days ?? 0} in the last 30 days</p>
          </Card>
          <Card className="border-border bg-card p-4 shadow-sm sm:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-medium text-card-foreground"><Share2 className="h-4 w-4 text-primary" />Public profile sharing</p>
                <p className="mt-1 text-xs text-muted-foreground">{profile.isPublic && publicProfileUrl ? publicProfileUrl : "Private by default — enable sharing in Edit Profile."}</p>
              </div>
              <Button type="button" variant="outline" onClick={copyPublicProfileUrl} className="border-border bg-background text-card-foreground"><Copy className="mr-2 h-4 w-4" />Copy link</Button>
            </div>
          </Card>
        </div>

        <div className="px-5 sm:px-7">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Camera className="w-3 h-3" />
            Update your portrait or cover image anytime. Supports JPG, PNG, GIF, and WebP.
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
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground">Professional title</label>
                    <input
                      type="text"
                      value={profile.professionalTitle}
                      onChange={(e) => setProfile({ ...profile, professionalTitle: e.target.value })}
                      placeholder="e.g., Content Strategist & AI Workflow Builder"
                      className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
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
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground">Areas of expertise</label>
                    <input
                      type="text"
                      value={profile.expertise}
                      onChange={(e) => setProfile({ ...profile, expertise: e.target.value })}
                      placeholder="Separate focus areas with commas"
                      className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground">Availability</label>
                    <input
                      type="text"
                      value={profile.availability}
                      onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                      placeholder="e.g., Open to collaborations"
                      className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/35 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="font-semibold text-card-foreground">Public profile sharing</h4>
                      <p className="mt-1 text-sm text-muted-foreground">Your email and phone are never published. Sharing is off by default.</p>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                      <input type="checkbox" checked={profile.isPublic} onChange={(e) => setProfile({ ...profile, isPublic: e.target.checked })} className="h-4 w-4 accent-primary" />
                      Make profile public
                    </label>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <label className="text-sm text-muted-foreground">Public profile link</label>
                      <div className="mt-1 flex items-center rounded-lg border border-input bg-background px-3">
                        <span className="shrink-0 text-sm text-muted-foreground">lumae.co.in/u/</span>
                        <input value={profile.publicSlug} onChange={(e) => setProfile({ ...profile, publicSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} placeholder="your-name" className="min-w-0 flex-1 bg-transparent px-1 py-2 text-foreground outline-none" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 pb-2 text-sm text-card-foreground">
                      <input type="checkbox" checked={profile.shareSocialLinks} onChange={(e) => setProfile({ ...profile, shareSocialLinks: e.target.checked })} className="h-4 w-4 accent-primary" />
                      Share social links
                    </label>
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
              <Card className="border-border bg-card p-6">
                <div className="space-y-6">
                  <section className="rounded-xl border border-border bg-muted/35 p-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Professional introduction</p>
                        <h3 className="mt-2 text-xl font-semibold text-card-foreground">{profile.professionalTitle}</h3>
                        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{profile.bio}</p>
                      </div>
                      <div className="min-w-28 rounded-lg border border-border bg-card px-3 py-2 text-center">
                        <p className="text-lg font-semibold text-card-foreground">{profileCompleteness}%</p>
                        <p className="text-[11px] text-muted-foreground">Profile complete</p>
                      </div>
                    </div>
                    {expertiseItems.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {expertiseItems.map((expertise) => <Badge key={expertise} className="border border-primary/20 bg-primary/10 text-primary">{expertise}</Badge>)}
                      </div>
                    )}
                  </section>
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
