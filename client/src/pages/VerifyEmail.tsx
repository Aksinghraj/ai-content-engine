import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Sparkles, Mail, RefreshCw, CheckCircle2, ArrowLeft } from "lucide-react";

export default function VerifyEmail() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setIsVerified(true);
        toast.success("Email verified successfully!");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast.error("Invalid or expired OTP. Please try again.");
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    },
    onError: () => {
      toast.error("Verification failed. Please try again.");
    },
  });

  const resendMutation = trpc.auth.resendOtp.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("New OTP sent to your email!");
        setCountdown(60);
      } else if (data.deliveryUnavailable) {
        toast.error("Email delivery is not configured, so no code was sent.");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    },
    onError: () => {
      toast.error("Failed to send OTP. Please try again.");
    },
  });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!loading && user?.emailVerified) navigate("/dashboard");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading, navigate]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (digit && index === 5) {
      const full = newOtp.join("");
      if (full.length === 6) verifyMutation.mutate({ token: full });
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "Enter") {
      const full = otp.join("");
      if (full.length === 6) verifyMutation.mutate({ token: full });
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = Array(6).fill("");
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    if (pasted.length === 6) {
      verifyMutation.mutate({ token: pasted });
    } else {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerify = () => {
    const full = otp.join("");
    if (full.length !== 6) { toast.error("Please enter all 6 digits"); return; }
    verifyMutation.mutate({ token: full });
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
          {isVerified ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-slate-400 text-sm">Redirecting you to the dashboard...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-purple-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
                <p className="text-slate-400 text-sm">
                  Enter the 6-digit OTP for{" "}
                  <span className="text-purple-400 font-medium">{user?.email}</span>
                </p>
                <p className="text-slate-500 text-xs mt-1">Check your inbox and spam folder</p>
              </div>

              <div className="flex gap-2 sm:gap-3 justify-center mb-6" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={[
                      "w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2",
                      "bg-slate-800 text-white outline-none transition-all duration-200",
                      digit ? "border-purple-500 bg-purple-500/10" : "border-slate-600",
                      "focus:border-purple-400 focus:bg-purple-500/5",
                    ].join(" ")}
                    disabled={verifyMutation.isPending}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <Button
                onClick={handleVerify}
                disabled={otp.join("").length !== 6 || verifyMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl mb-4"
              >
                {verifyMutation.isPending ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" />Verifying...</span>
                ) : "Verify Email"}
              </Button>

              <div className="text-center">
                <p className="text-slate-500 text-sm mb-2">Didn't receive the code?</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resendMutation.mutate()}
                  disabled={countdown > 0 || resendMutation.isPending}
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-sm"
                >
                  {resendMutation.isPending ? (
                    <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin" />Sending...</span>
                  ) : countdown > 0 ? `Resend in ${countdown}s` : (
                    <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" />Resend OTP</span>
                  )}
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-slate-500 hover:text-slate-400 text-xs flex items-center gap-1.5 mx-auto transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Skip for now, go to dashboard
                </button>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 mt-6">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-slate-500 text-sm">Lumae AI</span>
        </div>
      </div>
    </div>
  );
}
