import { useState, useEffect } from "react";
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
import { trpc, trpcClient } from "@/lib/trpc";

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    color: "from-pink-500 to-rose-500",
    description: "Connect your Instagram business account",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "👥",
    color: "from-blue-500 to-blue-600",
    description: "Connect your Facebook page",
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
  const [connections, setConnections] = useState<Record<string, any>>({});

  // Fetch connected accounts
  const { data: connectedAccounts, isLoading, refetch } = trpc.socialOAuthIntegration.getConnectedAccounts.useQuery();

  // Mutations
  const disconnectMutation = trpc.socialOAuthIntegration.disconnectAccount.useMutation();
  const refreshTokenMutation = trpc.socialOAuthIntegration.refreshToken.useMutation();

  // Build connections map
  useEffect(() => {
    if (connectedAccounts) {
      const map: Record<string, any> = {};
      connectedAccounts.forEach((conn: any) => {
        map[conn.platform] = conn;
      });
      setConnections(map);
    }
  }, [connectedAccounts]);

  // Check for OAuth callback with success/error
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const platform = params.get("platform");
    const error = params.get("error");
    const message = params.get("message");

    if (success && platform) {
      toast.success(`${platform} account connected successfully!`);
      refetch();
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (error) {
      toast.error(`OAuth Error: ${error} - ${message || "Unknown error"}`);
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refetch]);

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    try {
      // Call tRPC mutation to get authorization URL (can't use hooks inside event handlers)
      const result = await trpcClient.socialOAuthIntegration.getAuthorizationUrl.query(
        { platform: platformId as any }
      );
      if (result?.url) {
        // Redirect to OAuth provider
        window.location.href = result.url;
      } else {
        throw new Error("No authorization URL provided");
      }
    } catch (error) {
      console.error("OAuth error:", error);
      toast.error(`Failed to connect ${platformId}: ${(error as Error)?.message || "Unknown error"}`);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    setDisconnecting(platformId);
    try {
      await disconnectMutation.mutateAsync({
        platform: platformId as any,
      });
      toast.success(`${platformId} account disconnected`);
      refetch();
    } catch (error) {
      toast.error(`Failed to disconnect: ${(error as Error)?.message || "Unknown error"}`);
    } finally {
      setDisconnecting(null);
    }
  };

  const handleRefreshToken = async (platformId: string) => {
    try {
      await refreshTokenMutation.mutateAsync({
        platform: platformId as any,
      });
      toast.success(`${platformId} token refreshed`);
      refetch();
    } catch (error) {
      toast.error(`Failed to refresh token: ${(error as Error)?.message || "Unknown error"}`);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Connected Accounts</h1>
          <p className="text-gray-400 mt-2">
            Connect your social media accounts to start posting and managing content
          </p>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map((platform) => {
            const isConnected = connections[platform.id];
            const isConnecting = connecting === platform.id;
            const isDisconnecting = disconnecting === platform.id;

            return (
              <Card
                key={platform.id}
                className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6 hover:border-slate-600 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl`}>{platform.icon}</div>
                    <div>
                      <h3 className="font-semibold text-white">{platform.name}</h3>
                      <p className="text-sm text-gray-400">{platform.description}</p>
                    </div>
                  </div>
                  {isConnected && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>

                {isConnected ? (
                  <div className="space-y-3">
                    <div className="bg-slate-700/50 rounded-lg p-3 text-sm">
                      <p className="text-gray-300">
                        <span className="text-gray-400">Username:</span> {isConnected.username}
                      </p>
                      {isConnected.tokenExpiresAt && (
                        <p className="text-gray-300 mt-1">
                          <span className="text-gray-400">Expires:</span>{" "}
                          {new Date(isConnected.tokenExpiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRefreshToken(platform.id)}
                        disabled={isDisconnecting}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDisconnect(platform.id)}
                        disabled={isDisconnecting}
                      >
                        {isDisconnecting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Unlink2 className="w-4 h-4 mr-2" />
                        )}
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => handleConnect(platform.id)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Link2 className="w-4 h-4 mr-2" />
                    )}
                    {isConnecting ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <Card className="bg-blue-500/10 border-blue-500/30 p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">How it works</p>
              <ul className="space-y-1 text-blue-100">
                <li>• Click "Connect" to authorize your account with the platform</li>
                <li>• Your access token is encrypted and stored securely</li>
                <li>• Tokens are automatically refreshed before expiration</li>
                <li>• Click "Disconnect" to revoke access and remove stored tokens</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
