/**
 * SecureWeb SDK - Client-side security integration
 * Add this single line to your website:
 * <script src="https://cdn.yourdomain.com/secureweb.js" data-api-key="your-api-key"></script>
 */

interface SecureWebConfig {
  apiKey: string;
  endpoint?: string;
  enableXSSProtection?: boolean;
  enableCSRFProtection?: boolean;
  enableRateLimiting?: boolean;
  enableHeaderSecurity?: boolean;
  debug?: boolean;
}

class SecureWeb {
  private config: SecureWebConfig;
  private endpoint: string;
  private requestQueue: Map<string, number> = new Map();
  private csrfToken: string = '';

  constructor(config: SecureWebConfig) {
    this.config = {
      endpoint: 'https://api.yourdomain.com/security',
      enableXSSProtection: true,
      enableCSRFProtection: true,
      enableRateLimiting: true,
      enableHeaderSecurity: true,
      debug: false,
      ...config
    };
    this.endpoint = this.config.endpoint!;
    this.csrfToken = this.generateCSRFToken();
    this.initialize();
  }

  private generateCSRFToken(): string {
    // Browser-compatible random token generation
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      // Fallback for older browsers
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private initialize(): void {
    if (this.config.debug) {
      console.log('[SecureWeb] Initializing with config:', this.config);
    }

    // XSS Protection
    if (this.config.enableXSSProtection) {
      this.enableXSSProtection();
    }

    // CSRF Protection
    if (this.config.enableCSRFProtection) {
      this.enableCSRFProtection();
    }

    // Rate Limiting
    if (this.config.enableRateLimiting) {
      this.enableRateLimiting();
    }

    // Header Security
    if (this.config.enableHeaderSecurity) {
      this.enableHeaderSecurity();
    }

    // Start monitoring
    this.startMonitoring();
  }

  private enableXSSProtection(): void {
    // Sanitize DOM operations
    const originalInnerHTMLDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    const originalSetInnerHTML = originalInnerHTMLDescriptor?.set;
    const originalGetInnerHTML = originalInnerHTMLDescriptor?.get;

    if (originalSetInnerHTML && originalGetInnerHTML) {
      Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function(value: string) {
          const sanitized = SecureWeb.sanitizeHTML(value);
          originalSetInnerHTML.call(this, sanitized);
        },
        get: function() {
          return originalGetInnerHTML.call(this);
        }
      });
    }

    // Monitor eval usage
    const originalEval = window.eval;
    window.eval = function(code: string) {
      if (SecureWeb.containsDangerousPatterns(code)) {
        console.warn('[SecureWeb] Blocked potentially dangerous eval call');
        return;
      }
      return originalEval.call(window, code);
    };

    if (this.config.debug) {
      console.log('[SecureWeb] XSS protection enabled');
    }
  }

  private static sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  private static containsDangerousPatterns(code: string): boolean {
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /document\.cookie/i,
      /window\.location/i
    ];
    return dangerousPatterns.some(pattern => pattern.test(code));
  }

  private enableCSRFProtection(): void {
    // Inject CSRF token into all forms
    const observer = new MutationObserver(() => {
      document.querySelectorAll('form:not([data-secureweb-protected])').forEach(form => {
        form.setAttribute('data-secureweb-protected', 'true');
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'secureweb_csrf_token';
        tokenInput.value = this.csrfToken;
        form.appendChild(tokenInput);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const headers = new Headers(init?.headers);
      headers.set('X-SecureWeb-CSRF-Token', this.csrfToken);
      
      const response = await originalFetch.call(window, input, {
        ...init,
        headers
      });

      return response;
    };

    if (this.config.debug) {
      console.log('[SecureWeb] CSRF protection enabled');
    }
  }

  private enableRateLimiting(): void {
    // Track requests per endpoint
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const key = url.split('?')[0]; // Remove query params
      
      const now = Date.now();
      const requests = this.requestQueue.get(key) || 0;
      
      if (requests > 100) { // 100 requests per minute per endpoint
        console.warn('[SecureWeb] Rate limit exceeded for:', key);
        throw new Error('Rate limit exceeded');
      }
      
      this.requestQueue.set(key, requests + 1);
      
      // Clean old entries
      setTimeout(() => {
        const current = this.requestQueue.get(key) || 0;
        this.requestQueue.set(key, Math.max(0, current - 1));
      }, 60000); // 1 minute window

      return originalFetch.call(window, input, init);
    };

    if (this.config.debug) {
      console.log('[SecureWeb] Rate limiting enabled');
    }
  }

  private enableHeaderSecurity(): void {
    // Add security headers to all requests
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const headers = new Headers(init?.headers);
      headers.set('X-SecureWeb-Protected', 'true');
      headers.set('X-SecureWeb-Timestamp', Date.now().toString());
      
      return originalFetch.call(window, input, {
        ...init,
        headers
      });
    };

    if (this.config.debug) {
      console.log('[SecureWeb] Header security enabled');
    }
  }

  private startMonitoring(): void {
    // Monitor for suspicious activity
    setInterval(() => {
      this.reportMetrics();
    }, 30000); // Every 30 seconds

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.reportEvent('page_visible');
      }
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.reportEvent('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno
      });
    });
  }

  private async reportMetrics(): Promise<void> {
    const metrics = {
      apiKey: this.config.apiKey,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      requestCount: this.requestQueue.size,
      csrfToken: this.csrfToken
    };

    try {
      await fetch(`${this.endpoint}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });
    } catch (error) {
      if (this.config.debug) {
        console.error('[SecureWeb] Failed to report metrics:', error);
      }
    }
  }

  private async reportEvent(eventType: string, data?: any): Promise<void> {
    const event = {
      apiKey: this.config.apiKey,
      eventType,
      timestamp: Date.now(),
      url: window.location.href,
      data
    };

    try {
      await fetch(`${this.endpoint}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      if (this.config.debug) {
        console.error('[SecureWeb] Failed to report event:', error);
      }
    }
  }

  public getCSRFToken(): string {
    return this.csrfToken;
  }

  public updateConfig(newConfig: Partial<SecureWebConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Auto-initialize from script tag
declare global {
  interface Window {
    SecureWeb?: SecureWeb;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSecureWeb);
} else {
  initSecureWeb();
}

function initSecureWeb(): void {
  const scriptTag = document.querySelector('script[data-api-key][src*="secureweb"]');
  if (!scriptTag) {
    console.warn('[SecureWeb] No valid script tag found with data-api-key');
    return;
  }

  const apiKey = scriptTag.getAttribute('data-api-key');
  const endpoint = scriptTag.getAttribute('data-endpoint');
  const debug = scriptTag.getAttribute('data-debug') === 'true';

  if (!apiKey) {
    console.error('[SecureWeb] Missing API key');
    return;
  }

  const config: SecureWebConfig = {
    apiKey,
    ...(endpoint && { endpoint }),
    ...(debug && { debug })
  };

  window.SecureWeb = new SecureWeb(config);
  
  if (config.debug) {
    console.log('[SecureWeb] Initialized successfully');
  }
}

export default SecureWeb;