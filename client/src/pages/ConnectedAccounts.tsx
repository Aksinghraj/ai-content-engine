import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Link2,
  Unlink2,
  RefreshCw,
  ExternalLink,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    color: "from-pink-500 to-rose-500",
    description: "Connect your Instagram business account",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    icon: "𝕏",
    color: "from-slate-700 to-slate-900",
    description: "Connect your Twitter/X account",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    color: "from-blue-600 to-blue-700",
    description: "Connect your LinkedIn profile",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "👥",
    color: "from-blue-500 to-blue-600",
    description: "Connect your Facebook page",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "📺",
    color: "from-red-500 to-red-600",
    description: "Connect your YouTube channel",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    color: "from-slate-900 to-slate-800",
    description: "Connect your TikTok account",
  },
];

export default function ConnectedAccounts() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  // Mock connected accounts data
  const [connections, setConnections] = useState<any[]>([]);
  const isLoading = false;
  const refetch = () => {};

  // Mutations - placeholder
  const connectMutation = { mutateAsync: async () => ({ authUrl: '#' }) } as any;
  const disconnectMutation = { mutateAsync: async () => ({}) } as any;
  const validateMutation = { mutateAsync: async () => ({}) } as any;

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    try {
      const result = await connectMutation.mutateAsync({ platform: platformId });
      if (result.authUrl) {
        // Redirect to OAuth flow
        window.open(result.authUrl, "_blank", "width=500,height=600");
        // Refetch after a delay to check if connection was successful
        setTimeout(() => refetch(), 3000);
      }
      toast.success(`Connecting to ${platformId}...`);
    } catch (error) {
      toast.error(`Failed to connect to ${platformId}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (connectionId: number) => {
    setDisconnecting(connectionId.toString());
    try {
      await disconnectMutation.mutateAsync({ connectionId });
      toast.success("Account disconnected");
      refetch();
    } catch (error) {
      toast.error("Failed to disconnect account");
    } finally {
      setDisconnecting(null);
    }
  };

  const handleValidate = async (connectionId: number) => {
    try {
      await validateMutation.mutateAsync({ connectionId });
      toast.success("Credentials validated");
      refetch();
    } catch (error) {
      toast.error("Validation failed");
    }
  };

  const getConnectionStatus = (platformId: string) => {
    return connections.find((c: any) => c.platform === platformId);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Connected Accounts</h1>
          <p className="text-purple-200">
            Manage your social media connections and automate your content across all platforms
          </p>
        </div>

        {/* Connection Status Summary */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-purple-300 text-sm">Connected Accounts</p>
              <p className="text-3xl font-bold text-white">
                {connections.filter((c: any) => c.isConnected).length} / {PLATFORMS.length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-purple-300 text-sm">Validated Accounts</p>
              <p className="text-3xl font-bold text-green-400">
                {connections.filter((c: any) => c.isValidated).length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-purple-300 text-sm">Auto-Post Enabled</p>
              <p className="text-3xl font-bold text-blue-400">
                {connections.filter((c: any) => c.autoPost).length}
              </p>
            </div>
          </div>
        </Card>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORMS.map((platform) => {
            const connection = getConnectionStatus(platform.id);
            const isConnected = connection?.isConnected;
            const isValidated = connection?.isValidated;

            return (
              <Card
                key={platform.id}
                className={`border-2 transition-all ${
                  isConnected
                    ? "bg-slate-800/50 border-green-500/30"
                    : "bg-slate-800/30 border-slate-700/50 hover:border-purple-500/30"
                }`}
              >
                <div className="p-6 space-y-4">
                  {/* Platform Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{platform.icon}</div>
                      <div>
                        <h3 className="text-white font-semibold">{platform.name}</h3>
                        <p className="text-slate-400 text-xs">{platform.description}</p>
                      </div>
                    </div>
                    {isConnected && (
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Status Info */}
                  {isConnected && connection && (
                    <div className="space-y-2 bg-slate-700/30 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Username</span>
                        <span className="text-white font-medium">{connection.username}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Status</span>
                        <Badge
                          className={
                            isValidated
                              ? "bg-green-500/20 text-green-300 border-green-500/50"
                              : "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
                          }
                        >
                          {isValidated ? "Validated" : "Pending Validation"}
                        </Badge>
                      </div>
                      {connection.validationError && (
                        <div className="flex items-start gap-2 text-red-400 text-xs">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{connection.validationError}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {!isConnected ? (
                      <Button
                        onClick={() => handleConnect(platform.id)}
                        disabled={connecting === platform.id}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {connecting === platform.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Link2 className="w-4 h-4 mr-2" />
                            Connect Account
                          </>
                        )}
                      </Button>
                    ) : (
                      <>
                        {!isValidated && (
                          <Button
                            onClick={() => handleValidate(connection.id)}
                            variant="outline"
                            className="w-full"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Validate Credentials
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDisconnect(connection.id)}
                          disabled={disconnecting === connection.id.toString()}
                          variant="destructive"
                          className="w-full"
                        >
                          {disconnecting === connection.id.toString() ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Disconnecting...
                            </>
                          ) : (
                            <>
                              <Unlink2 className="w-4 h-4 mr-2" />
                              Disconnect
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Features */}
                  {isConnected && (
                    <div className="pt-3 border-t border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-2">Available Features:</p>
                      <div className="space-y-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={connection.autoPost || false}
                            className="w-4 h-4 rounded"
                            readOnly
                          />
                          <span className="text-xs text-slate-300">Auto-Post</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={connection.autoReply || false}
                            className="w-4 h-4 rounded"
                            readOnly
                          />
                          <span className="text-xs text-slate-300">Auto-Reply</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <Card className="bg-slate-800/30 border-purple-500/20 p-6">
          <div className="space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-400" />
              How to Connect Your Accounts
            </h3>
            <ol className="space-y-3 text-slate-300 text-sm">
              <li>
                <span className="font-semibold text-white">1. Click "Connect Account"</span> for the platform you want to
                connect
              </li>
              <li>
                <span className="font-semibold text-white">2. Authorize Lumae AI</span> to access your account in the
                popup window
              </li>
              <li>
                <span className="font-semibold text-white">3. Validate your credentials</span> to ensure everything is
                working correctly
              </li>
              <li>
                <span className="font-semibold text-white">4. Enable features</span> like Auto-Post and Auto-Reply to
                automate your workflow
              </li>
            </ol>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
