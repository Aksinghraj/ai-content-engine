import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Settings, Moon, Sun, Monitor, Bell, Lock, LogOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function SettingsPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [, navigate] = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logged out successfully");
      navigate("/login");
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    logoutMutation.mutate();
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile updated successfully");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/home")}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Settings
            </h1>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Account Settings */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
              <CardDescription className="text-slate-400">Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={user.name || ""}
                    disabled
                    className="bg-slate-700/50 border-slate-600 text-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={user.email || ""}
                    disabled
                    className="bg-slate-700/50 border-slate-600 text-slate-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="id" className="text-slate-300">
                  User ID
                </Label>
                <Input
                  id="id"
                  value={user.id}
                  disabled
                  className="bg-slate-700/50 border-slate-600 text-slate-300"
                />
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Appearance</CardTitle>
              <CardDescription className="text-slate-400">Customize your visual experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-slate-300">Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === "light"
                        ? "border-blue-500 bg-blue-900/20"
                        : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                    }`}
                  >
                    <Sun className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">Light</p>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === "dark"
                        ? "border-blue-500 bg-blue-900/20"
                        : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                    }`}
                  >
                    <Moon className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">Dark</p>
                  </button>
                  <button
                    onClick={() => setTheme("auto")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === "auto"
                        ? "border-blue-500 bg-blue-900/20"
                        : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                    }`}
                  >
                    <Monitor className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">Auto</p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription className="text-slate-400">Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-slate-400">Receive updates about your account</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Content Generation Alerts</p>
                  <p className="text-sm text-slate-400">Get notified when content is ready</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">Automation Updates</p>
                  <p className="text-sm text-slate-400">Notifications for scheduled content</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security
              </CardTitle>
              <CardDescription className="text-slate-400">Manage your security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-white font-medium mb-2">Login Method</p>
                <p className="text-slate-400 text-sm mb-4">
                  {user.loginMethod === "manus" ? "Manus OAuth" : "Unknown"}
                </p>
                <p className="text-xs text-slate-500">
                  Last signed in: {new Date(user.lastSignedIn).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-500/30 bg-red-900/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
              <CardDescription className="text-slate-400">Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                variant="outline"
                className="w-full border-red-500/50 text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutMutation.isPending ? "Logging out..." : "Log Out"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
