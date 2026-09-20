declare global {
  interface Window {
    Capacitor?: { isNativePlatform?: () => boolean };
    __lumaeNativeContainer?: boolean;
    __lumaeWebTrackingLoaded?: boolean;
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    loadLumaeWebTracking?: () => void;
  }
}

export function installWebTrackingLoader() {
  if (typeof window === "undefined") return;

  const nativeWindow = window as Window & {
    Capacitor?: { isNativePlatform?: () => boolean };
  };
  window.__lumaeNativeContainer = Boolean(
    nativeWindow.Capacitor &&
      typeof nativeWindow.Capacitor.isNativePlatform === "function" &&
      nativeWindow.Capacitor.isNativePlatform(),
  );

  window.loadLumaeWebTracking = () => {
    if (
      window.__lumaeNativeContainer ||
      localStorage.getItem("cookie-consent") !== "accepted-all" ||
      window.__lumaeWebTrackingLoaded
    ) {
      return;
    }

    window.__lumaeWebTrackingLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: any[]) {
      window.dataLayer.push(args);
    };
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
    window.gtag("js", new Date());
    window.gtag("config", "G-XHDZ9K757E", { anonymize_ip: true });

    const analytics = document.createElement("script");
    analytics.async = true;
    analytics.src = "https://www.googletagmanager.com/gtag/js?id=G-XHDZ9K757E";
    document.head.appendChild(analytics);

    const ads = document.createElement("script");
    ads.async = true;
    ads.crossOrigin = "anonymous";
    ads.dataset.adClient = "ca-pub-4177369465238531";
    ads.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4177369465238531";
    document.head.appendChild(ads);

    const umamiEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
    const umamiWebsiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;
    if (umamiEndpoint && umamiWebsiteId) {
      const umami = document.createElement("script");
      umami.defer = true;
      umami.src = `${umamiEndpoint}/umami`;
      umami.dataset.websiteId = umamiWebsiteId;
      document.head.appendChild(umami);
    }
  };

  window.loadLumaeWebTracking();
}

installWebTrackingLoader();

export {};
