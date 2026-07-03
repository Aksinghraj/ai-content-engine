"use client";

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
  const [connections, setConnections] = useState<Record<string, any>>({});

  // Fetch connected accounts
  const { data: connectedAccounts, isLoading, refetch } = trpc.oauth.getConnectedAccounts.useQuery();

  // Mutations
  const handleCallbackMutation = trpc.oauth.handleCallback.useMutation();
  const disconnectMutation = trpc.oauth.disconnectAccount.useMutation();
  const refreshTokenMutation = trpc.oauth.refreshToken.useMutation();

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

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    try {
      // In production, call getAuthorizationUrl mutation to get the OAuth URL
      // For now, show a placeholder
      toast.info(`OAuth setup for ${platformId} coming soon`);
    } catch (error) {
      toast.error(`Failed to start OAuth flow: ${(error as Error)?.message || "Unknown error"}`);
    } finally {
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
                      {isConnected.followers && (
                        <p className="text-gray-300 mt-1">
                          <span className="text-gray-400">Followers:</span> {isConnected.followers.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleRefreshToken(platform.id)}
                        disabled={isDisconnecting}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
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
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={() => handleConnect(platform.id)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Connect Account
                      </>
                    )}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        {/* Info Box */}
        <Card className="bg-blue-500/10 border-blue-500/30 p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-200">How it works</h4>
              <p className="text-sm text-blue-300 mt-1">
                Click "Connect Account" to authenticate with each platform. Your access tokens are securely stored and used
                only to post content and manage your accounts. You can disconnect anytime.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
