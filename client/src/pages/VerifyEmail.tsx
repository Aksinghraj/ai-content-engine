import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const verifyMutation = trpc.auth.verifyEmail.useMutation();

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    
    if (!t) {
      setStatus("error");
      setMessage("No verification token provided. Please check your email link.");
      return;
    }

    setToken(t);

    // Verify the token
    const verify = async () => {
      try {
        const result = await verifyMutation.mutateAsync({ token: t });
        if (result.success) {
          setStatus("success");
          setMessage("Email verified successfully! Redirecting to dashboard...");
          setTimeout(() => {
            setLocation("/dashboard");
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Verification failed. Token may have expired. Please sign up again.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
        console.error("Verification error:", error);
      }
    };

    verify();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-6">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Verifying Email</h1>
                <p className="text-muted-foreground">Please wait while we verify your email address...</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <Button onClick={() => setLocation("/dashboard")} className="w-full">
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setLocation("/")} className="flex-1">
                    Back to Home
                  </Button>
                  <Button onClick={() => setLocation("/login")} className="flex-1">
                    Sign In Again
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
