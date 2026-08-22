import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Bell,
  Lock,
  Zap,
  Database,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Check,
  AlertCircle,
  Shield,
  Key,
  Mail,
  Smartphone,
  Globe,
  Code,
  BarChart3,
  Users,
  CreditCard,
  LogOut,
  Copy,
  Radio,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { TwoFactorSecurityPanel } from "@/components/TwoFactorSecurityPanel";
import { trpc } from "@/lib/trpc";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  masked: string;
  createdAt: string;
  lastUsed: string;
  isActive: boolean;
}

export default function SettingsAdvanced() {
  const [activeTab, setActiveTab] = useState("account");
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const { theme, effectiveTheme, highContrast, setTheme, setHighContrast } = useTheme();
  const deleteAccount = trpc.auth.account.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Your Lumae account and associated data were deleted.");
      window.location.assign("/login?accountDeleted=1");
    },
    onError: (error) => toast.error(error.message || "We could not delete your account. Please try again."),
  });

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: "post-published",
      label: "Post Published",
      description: "Get notified when your posts are published",
      enabled: true,
      channels: { email: true, push: true, sms: false },
    },
    {
      id: "engagement",
      label: "High Engagement",
      description: "Notify when posts get high engagement",
      enabled: true,
      channels: { email: true, push: true, sms: true },
    },
    {
      id: "comments",
      label: "New Comments",
      description: "Get notified of new comments on your posts",
      enabled: true,
      channels: { email: true, push: false, sms: false },
    },
    {
      id: "mentions",
      label: "Mentions & Tags",
      description: "Notify when someone mentions you",
      enabled: true,
      channels: { email: true, push: true, sms: false },
    },
    {
      id: "weekly-digest",
      label: "Weekly Digest",
      description: "Receive weekly performance summary",
      enabled: true,
      channels: { email: true, push: false, sms: false },
    },
  ]);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Production API Key",
      key: "sk_live_abc123def456",
      masked: "sk_live_••••••••••••••••",
      createdAt: "2026-06-15",
      lastUsed: "2026-07-03",
      isActive: true,
    },
    {
      id: "2",
      name: "Development API Key",
      key: "sk_test_xyz789uvw012",
      masked: "sk_test_••••••••••••••••",
      createdAt: "2026-06-01",
      lastUsed: "2026-07-02",
      isActive: true,
    },
  ]);

  const [accountSettings, setAccountSettings] = useState({
    email: "user@example.com",
    username: "username",
    timezone: "UTC",
    language: "English",
    theme: "dark",
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    loginAlerts: true,
    deviceManagement: true,
    sessionTimeout: "30",
  });

  const handleToggleNotification = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, enabled: !n.enabled } : n
      )
    );
  };

  const handleToggleChannel = (id: string, channel: "email" | "push" | "sms") => {
    setNotifications(
      notifications.map((n) =>
        n.id === id
          ? { ...n, channels: { ...n.channels, [channel]: !n.channels[channel] } }
          : n
      )
    );
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    toast.success("API key deleted");
  };

  const handleGenerateApiKey = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: "New API Key",
      key: "sk_live_" + Math.random().toString(36).substring(2, 15),
      masked: "sk_live_••••••••••••••••",
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      isActive: true,
    };
    setApiKeys([...apiKeys, newKey]);
    toast.success("New API key generated");
  };

  const handleExportData = () => {
    toast.success("Data export started. Check your email for download link.");
  };

  const handleDeleteAccount = () => {
    const confirmation = window.prompt("This permanently deletes your Lumae account and associated data. Type DELETE to continue.");
    if (confirmation === "DELETE") {
      deleteAccount.mutate();
    } else if (confirmation !== null) {
      toast.error("Account deletion was cancelled because DELETE was not entered exactly.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, security, notifications, and integrations
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Information */}
              <Card className="bg-slate-800/50 border-slate-700/50 p-6 space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Profile Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-400">Email Address</label>
                    <input
                      type="email"
                      value={accountSettings.email}
                      onChange={(e) =>
                        setAccountSettings({ ...accountSettings, email: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Username</label>
                    <input
                      type="text"
                      value={accountSettings.username}
                      onChange={(e) =>
                        setAccountSettings({ ...accountSettings, username: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Timezone</label>
                    <select
                      value={accountSettings.timezone}
                      onChange={(e) =>
                        setAccountSettings({ ...accountSettings, timezone: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                    >
                      <option>UTC</option>
                      <option>EST</option>
                      <option>CST</option>
                      <option>MST</option>
                      <option>PST</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Language</label>
                    <select
                      value={accountSettings.language}
                      onChange={(e) =>
                        setAccountSettings({ ...accountSettings, language: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </Card>

              {/* Preferences */}
              <Card className="border-border bg-card p-6 space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-card-foreground">
                  <Zap className="h-5 w-5 text-[#f59e0b]" />
                  Appearance & preferences
                </h3>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-muted/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-card-foreground">Display mode</p>
                        <p className="mt-1 text-xs text-muted-foreground">Your selection is saved to this account. Current appearance: {effectiveTheme === "dark" ? "Dark" : "Bright"}.</p>
                      </div>
                      {effectiveTheme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-[#f59e0b]" />}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        { value: "light" as const, label: "Bright", icon: Sun },
                        { value: "dark" as const, label: "Dark", icon: Moon },
                        { value: "auto" as const, label: "System", icon: Monitor },
                      ].map(({ value, label, icon: Icon }) => (
                        <Button key={value} type="button" variant={theme === value ? "default" : "outline"} onClick={() => setTheme(value)} className={theme === value ? "lumae-gradient-cta" : "border-border bg-background text-foreground hover:bg-accent"}>
                          <Icon className="mr-1.5 h-4 w-4" />{label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/25 p-3">
                    <div>
                      <p className="font-medium text-card-foreground">High contrast</p>
                      <p className="text-xs text-muted-foreground">Strengthens borders, text contrast, and keyboard focus indicators.</p>
                    </div>
                    <Button type="button" variant={highContrast ? "default" : "outline"} onClick={() => setHighContrast(!highContrast)} className={highContrast ? "lumae-gradient-cta" : "border-border bg-background text-foreground"}>
                      {highContrast ? "Enabled" : "Enable"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/45 p-3">
                    <div>
                      <p className="font-medium text-card-foreground">Email Digest</p>
                      <p className="text-xs text-muted-foreground">Weekly summary</p>
                    </div>
                    <Radio className="h-6 w-6 text-[#10b981]" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/45 p-3">
                    <div>
                      <p className="font-medium text-card-foreground">Analytics Tracking</p>
                      <p className="text-xs text-muted-foreground">Help us improve</p>
                    </div>
                    <Radio className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="bg-slate-800/50 border-slate-700/50 p-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{notification.label}</h4>
                        <p className="text-sm text-slate-400">{notification.description}</p>
                      </div>
                      <button
                        onClick={() => handleToggleNotification(notification.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          notification.enabled
                            ? "bg-green-500/20 text-green-300"
                            : "bg-slate-600/20 text-slate-400"
                        }`}
                      >
                        {notification.enabled ? "On" : "Off"}
                      </button>
                    </div>

                    {notification.enabled && (
                      <div className="flex gap-4 pt-2 border-t border-slate-700/50">
                        {["email", "push", "sms"].map((channel) => (
                          <label
                            key={channel}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={
                                notification.channels[channel as keyof typeof notification.channels]
                              }
                              onChange={() =>
                                handleToggleChannel(
                                  notification.id,
                                  channel as "email" | "push" | "sms"
                                )
                              }
                              className="w-4 h-4 rounded accent-purple-500"
                            />
                            <span className="text-sm text-slate-300 capitalize">{channel}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TwoFactorSecurityPanel />

              {/* Active Sessions */}
              <Card className="bg-slate-800/50 border-slate-700/50 p-6 space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  Active Sessions
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-700/20 rounded-lg">
                    <p className="text-white font-medium text-sm">Chrome on Windows</p>
                    <p className="text-xs text-slate-400">Last active: 5 minutes ago</p>
                    <Button size="sm" variant="ghost" className="mt-2 text-red-400 hover:text-red-300">
                      <LogOut className="w-3 h-3 mr-1" />
                      Sign Out
                    </Button>
                  </div>
                  <div className="p-3 bg-slate-700/20 rounded-lg">
                    <p className="text-white font-medium text-sm">Safari on iPhone</p>
                    <p className="text-xs text-slate-400">Last active: 2 hours ago</p>
                    <Button size="sm" variant="ghost" className="mt-2 text-red-400 hover:text-red-300">
                      <LogOut className="w-3 h-3 mr-1" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">API Keys</h3>
              <Button
                onClick={handleGenerateApiKey}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Generate New Key
              </Button>
            </div>

            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <Card
                  key={apiKey.id}
                  className="bg-slate-800/50 border-slate-700/50 p-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{apiKey.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Created: {apiKey.createdAt}
                        </p>
                        <p className="text-xs text-slate-400">
                          Last used: {apiKey.lastUsed}
                        </p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-700/30 p-3 rounded-lg">
                      <code className="text-sm text-slate-300 flex-1">
                        {showApiKey === apiKey.id ? apiKey.key : apiKey.masked}
                      </code>
                      <button
                        onClick={() =>
                          setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)
                        }
                        className="text-slate-400 hover:text-white"
                      >
                        {showApiKey === apiKey.id ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(apiKey.key);
                          toast.success("API key copied");
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <Button
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Export */}
              <Card className="bg-slate-800/50 border-slate-700/50 p-6 space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-400" />
                  Export Data
                </h3>
                <p className="text-sm text-slate-400">
                  Download all your data in JSON format
                </p>
                <Button
                  onClick={handleExportData}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>
              </Card>

              {/* Danger Zone */}
              <Card className="bg-red-900/20 border-red-500/30 p-6 space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Danger Zone
                </h3>
                <p className="text-sm text-slate-400">
                  Permanently delete your account and all data
                </p>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleteAccount.isPending}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteAccount.isPending ? "Deleting account…" : "Delete Account"}
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
