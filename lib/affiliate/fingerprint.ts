/**
 * Device fingerprinting utility for affiliate fraud detection
 * Uses FingerprintJS for consistent device identification
 */

export async function getDeviceFingerprint(): Promise<string | null> {
  try {
    // Load FingerprintJS from CDN if not already loaded
    if (!window.FingerprintJS) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@fingerprintjs/js@3";
      script.async = true;

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // Get the visitor ID
    if (window.FingerprintJS) {
      const fp = await window.FingerprintJS.load();
      const result = await fp.get();
      return result.visitorId;
    }

    return null;
  } catch (error) {
    console.error("[Fingerprint] Error getting device fingerprint:", error);
    return null;
  }
}

/**
 * Get user's IP address via API endpoint
 */
export async function getUserIP(): Promise<string | null> {
  try {
    const response = await fetch("/api/utils/ip");
    if (!response.ok) return null;
    const data = await response.json();
    return data.ip || null;
  } catch (error) {
    console.error("[Fingerprint] Error getting IP:", error);
    return null;
  }
}

/**
 * Get user's browser user agent
 */
export function getUserAgent(): string {
  return navigator.userAgent;
}

/**
 * Combine device fingerprint and IP for stronger household detection
 */
export async function getDeviceSignature(): Promise<{
  deviceId: string | null;
  ip: string | null;
  ua: string;
}> {
  const [deviceId, ip] = await Promise.all([
    getDeviceFingerprint(),
    getUserIP(),
  ]);

  return {
    deviceId,
    ip,
    ua: getUserAgent(),
  };
}

// Extend Window interface for FingerprintJS
declare global {
  interface Window {
    FingerprintJS?: {
      load: () => Promise<{
        get: () => Promise<{ visitorId: string }>;
      }>;
    };
  }
}
