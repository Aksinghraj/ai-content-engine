import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function GoogleOAuthCallback() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const exchangeCodeMutation = trpc.googleAuth.exchangeCode.useMutation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code and state from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (!code) {
          const errorParam = params.get("error");
          const errorDescription = params.get("error_description");
          setError(errorDescription || errorParam || "Authorization failed");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        if (!state) {
          setError("Invalid state parameter");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // Exchange code for tokens
        const result = await exchangeCodeMutation.mutateAsync({
          code,
          state,
        });

        // Store tokens in localStorage
        localStorage.setItem("google_access_token", result.tokens.accessToken);
        if (result.tokens.refreshToken) {
          localStorage.setItem("google_refresh_token", result.tokens.refreshToken);
        }
        localStorage.setItem("google_token_expires_at", 
          (Date.now() + (result.tokens.expiresIn * 1000)).toString()
        );

        // Store user info
        localStorage.setItem("user_info", JSON.stringify(result.user));

        // Redirect to return path or home
        setTimeout(() => {
          navigate(result.returnPath || "/");
        }, 500);
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleCallback();
  }, [navigate, exchangeCodeMutation]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8 max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Authentication Error</h2>
            <p className="text-slate-300 mb-6">{error}</p>
            <p className="text-slate-400 text-sm">Redirecting to login...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8 max-w-md">
        <div className="text-center space-y-4">
          <Spinner />
          <h2 className="text-2xl font-bold text-white">Signing you in...</h2>
          <p className="text-slate-400">Please wait while we complete your authentication</p>
        </div>
      </Card>
    </div>
  );
}
