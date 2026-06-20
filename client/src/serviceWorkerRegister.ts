// Register service worker for PWA support
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
}

// Check if app is installed
export function isAppInstalled(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  return false;
}

// Request installation prompt
export function requestInstallPrompt(event: any) {
  event.prompt();
  event.userChoice.then((choiceResult: any) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
  });
}
