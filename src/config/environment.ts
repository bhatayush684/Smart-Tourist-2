// Environment configuration
export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}` : 'http://localhost:5000'),
  API_URL: import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}` : 'http://localhost:5000'),
  wsUrl:
    import.meta.env.VITE_WS_URL ||
    (() => {
      const api = (import.meta.env.VITE_API_URL as string | undefined) ||
        (typeof window !== 'undefined' ? `${window.location.origin}` : 'http://localhost:5000');
      try {
        const url = new URL(api);
        url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        // Append "/socket.io" if not provided; your server listens on "/socket.io"
        // If a custom WS path is provided via VITE_WS_PATH, respect it
        const wsPath = (import.meta.env.VITE_WS_PATH as string | undefined) || '/socket.io';
        url.pathname = wsPath;
        return url.toString();
      } catch (_) {
        return 'ws://localhost:5000/socket.io';
      }
    })(),
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Tourist Safety Platform',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  nodeEnv: import.meta.env.MODE,
  
  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebugTools: import.meta.env.VITE_ENABLE_DEBUG_TOOLS === 'true',
  
  // External Services
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  analyticsId: import.meta.env.VITE_ANALYTICS_ID || '',
  
  // WebSocket Configuration
  wsReconnectInterval: 3000,
  wsMaxReconnectAttempts: 5,
  
  // API Configuration
  apiTimeout: 10000,
  apiRetryAttempts: 3,
} as const;

export default config;
