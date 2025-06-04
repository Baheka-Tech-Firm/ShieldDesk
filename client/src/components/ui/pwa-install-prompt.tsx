import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, X, Smartphone, Monitor, Shield } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSupported, setInstallSupported] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isRunningInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isRunningStandalone || isRunningInWebAppiOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallSupported(true);
      
      // Show prompt after a delay if not already installed
      if (!isInstalled) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000); // Show after 5 seconds
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('ShieldDesk installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isInstalled || sessionStorage.getItem('pwa-prompt-dismissed') || !installSupported) {
    return null;
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-red-500/30 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  Install ShieldDesk
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  Get the full desktop experience
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Benefits of Installing:</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-blue-400" />
                <span>Native desktop experience</span>
              </li>
              <li className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-green-400" />
                <span>Faster loading with offline support</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-red-400" />
                <span>Enhanced security and privacy</span>
              </li>
              <li className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span>Works on desktop and mobile</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                Progressive Web App
              </Badge>
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                Offline Ready
              </Badge>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            You can also install from your browser's menu or address bar
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}