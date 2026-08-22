import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie } from "lucide-react";

// Extend Window interface for Google Analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    loadLumaeWebTracking?: () => void;
  }
}

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a consent choice
    const consentStatus = localStorage.getItem("cookie-consent");
    if (!consentStatus) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "accepted-all");
    localStorage.setItem("cookie-consent-timestamp", new Date().toISOString());
    setShowBanner(false);
    
    // Enable Google Analytics and AdSense cookies
    if (typeof window !== "undefined") {
      window.loadLumaeWebTracking?.();
      window.dataLayer = window.dataLayer || [];
      if (window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: "granted",
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
        });
      }
    }
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("cookie-consent", "accepted-essential");
    localStorage.setItem("cookie-consent-timestamp", new Date().toISOString());
    setShowBanner(false);
    
    // Only enable essential cookies
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      if (window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
      }
    }
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    localStorage.setItem("cookie-consent-timestamp", new Date().toISOString());
    setShowBanner(false);
    
    // Disable all non-essential cookies
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      if (window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
      }
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <Cookie className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                We use cookies to enhance your experience
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                We use cookies and similar technologies to understand your use of our site, personalize content, and improve your experience. This includes cookies for analytics, advertising, and user preferences.
              </p>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium underline"
              >
                {showDetails ? "Hide details" : "Learn more"}
              </button>

              {showDetails && (
                <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground space-y-2">
                  <p>
                    <strong>Essential Cookies:</strong> Required for site functionality, security, and basic analytics.
                  </p>
                  <p>
                    <strong>Analytics Cookies:</strong> Help us understand how you use our site to improve performance and user experience.
                  </p>
                  <p>
                    <strong>Advertising Cookies:</strong> Used to show you relevant ads and measure advertising effectiveness. Powered by Google AdSense.
                  </p>
                  <p>
                    <strong>Personalization Cookies:</strong> Remember your preferences and settings for a better experience.
                  </p>
                  <p className="pt-2 border-t border-border">
                    <a
                      href="/cookie-policy"
                      className="text-purple-600 hover:text-purple-700 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cookie Policy
                    </a>
                    {" • "}
                    <a
                      href="/privacy-policy"
                      className="text-purple-600 hover:text-purple-700 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                    {" • "}
                    <a
                      href="/terms"
                      className="text-purple-600 hover:text-purple-700 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms & Conditions
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowBanner(false)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close cookie banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            className="text-xs sm:text-sm"
          >
            Reject All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAcceptEssential}
            className="text-xs sm:text-sm"
          >
            Essential Only
          </Button>
          <Button
            size="sm"
            onClick={handleAcceptAll}
            className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
