import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

// Google OAuth has been removed. This page redirects to login.
export default function GoogleOAuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
