// Service Worker registration and management
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported in this browser');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', this.registration);

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async update(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
    }
  }

  async activateUpdate(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  async getCacheStats(): Promise<any> {
    return new Promise((resolve) => {
      if (!navigator.serviceWorker.controller) {
        resolve({});
        return;
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'CACHE_STATS' },
        [messageChannel.port2]
      );
    });
  }

  async clearCache(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!navigator.serviceWorker.controller) {
        resolve(false);
        return;
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  private handleMessage(event: MessageEvent): void {
    // Handle messages from service worker
    console.log('Message from service worker:', event.data);
  }

  private notifyUpdateAvailable(): void {
    // Dispatch custom event for update notification
    window.dispatchEvent(new CustomEvent('swUpdateAvailable', {
      detail: { manager: this }
    }));
  }
}

// Global service worker manager instance
export const swManager = new ServiceWorkerManager();

// Auto-register service worker
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    swManager.register();
  });
}