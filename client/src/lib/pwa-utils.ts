// PWA utility functions
export class PWAManager {
  private static instance: PWAManager;
  
  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  // Check if app is installed
  isInstalled(): boolean {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isWebApp = (window.navigator as any).standalone === true;
    return isStandalone || isWebApp;
  }

  // Check if PWA is supported
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get installation state
  getInstallationState(): 'installed' | 'installable' | 'not-supported' {
    if (!this.isSupported()) return 'not-supported';
    if (this.isInstalled()) return 'installed';
    return 'installable';
  }

  // Handle file opening (for file_handlers in manifest)
  handleFileOpen(files: FileList) {
    console.log('PWA opened with files:', files);
    // Redirect to file vault with the files
    const fileData = Array.from(files).map(file => ({
      name: file.name,
      type: file.type,
      size: file.size
    }));
    
    // Store files in session storage for the file vault to pick up
    sessionStorage.setItem('pwa-opened-files', JSON.stringify(fileData));
    
    // Navigate to file vault
    window.location.href = '/enhanced-file-vault';
  }

  // Handle protocol handlers (for web+shielddesk:// URLs)
  handleProtocol(action: string) {
    console.log('PWA opened with protocol action:', action);
    
    const actionMap: Record<string, string> = {
      'dashboard': '/enhanced-dashboard',
      'vault': '/enhanced-file-vault',
      'scanner': '/vulnerability-scanner',
      'compliance': '/compliance'
    };
    
    const route = actionMap[action] || '/enhanced-dashboard';
    window.location.href = route;
  }

  // Setup PWA event listeners
  setupEventListeners() {
    // Handle launch queue (for file handlers)
    if ('launchQueue' in window) {
      (window as any).launchQueue.setConsumer((launchParams: any) => {
        if (launchParams.files && launchParams.files.length) {
          this.handleFileOpen(launchParams.files);
        }
      });
    }

    // Handle app update available
    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      if (!this.isInstalled()) return;
      
      // Show update available notification
      this.showUpdateNotification();
    });

    // Handle window controls overlay (for desktop PWA)
    if ('windowControlsOverlay' in navigator) {
      const overlay = (navigator as any).windowControlsOverlay;
      overlay.addEventListener('geometrychange', (event: any) => {
        // Adjust UI for window controls overlay
        this.adjustForWindowControls(event.target.getTitlebarAreaRect());
      });
    }
  }

  private showUpdateNotification() {
    // Create a custom event for the app to handle
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  private adjustForWindowControls(titlebarRect: DOMRect) {
    // Adjust the app layout to accommodate window controls
    const root = document.documentElement;
    root.style.setProperty('--titlebar-height', `${titlebarRect.height}px`);
    root.style.setProperty('--titlebar-width', `${titlebarRect.width}px`);
  }

  // Get app info for about/settings pages
  getAppInfo() {
    return {
      name: 'ShieldDesk',
      version: '1.0.0',
      installed: this.isInstalled(),
      installationState: this.getInstallationState(),
      platform: this.getPlatform(),
      displayMode: this.getDisplayMode()
    };
  }

  private getPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) return 'Windows';
    if (userAgent.includes('mac')) return 'macOS';
    if (userAgent.includes('linux')) return 'Linux';
    if (userAgent.includes('android')) return 'Android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS';
    return 'Unknown';
  }

  private getDisplayMode(): string {
    if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
    if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
    if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
    return 'browser';
  }

  // Share functionality (Web Share API)
  async share(data: { title?: string; text?: string; url?: string }) {
    if ('share' in navigator) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.log('Share cancelled or failed:', error);
        return false;
      }
    }
    
    // Fallback to clipboard
    if (data.url && 'clipboard' in navigator) {
      try {
        await navigator.clipboard.writeText(data.url);
        return true;
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
      }
    }
    
    return false;
  }
}

// Global PWA manager instance
export const pwaManager = PWAManager.getInstance();