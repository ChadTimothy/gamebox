/**
 * Content Security Policy (CSP) configuration for ChatGPT widgets.
 *
 * CSP controls what domains widgets can connect to and load resources from.
 * This is required for ChatGPT app directory submission.
 *
 * @module config/csp
 */

/**
 * CSP configuration structure for OpenAI widgets.
 */
export interface WidgetCSPConfig {
  /**
   * Domains that widgets can make HTTP requests to.
   * Used for API calls, WebSocket connections, etc.
   */
  connect_domains: string[];

  /**
   * Domains that widgets can load resources from.
   * Used for scripts, stylesheets, images, fonts, etc.
   */
  resource_domains: string[];

  /**
   * Domains that can be embedded in iframes (optional).
   * Only needed if widgets embed external content.
   */
  frame_domains?: string[];
}

/**
 * Get environment-aware CSP configuration.
 *
 * Development: Allows localhost and ngrok for local testing
 * Production: Restricts to production domains only
 *
 * @returns CSP configuration object
 */
export function getWidgetCSP(): WidgetCSPConfig {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    return {
      connect_domains: [
        process.env.PRODUCTION_API_URL || "https://gamebox-api.fly.dev",
      ],
      resource_domains: [
        process.env.PRODUCTION_CDN_URL || "https://cdn.fly.dev",
        "https://*.oaistatic.com", // OpenAI CDN for SDK UI assets
      ],
    };
  }

  // Development configuration
  return {
    connect_domains: [
      "http://localhost:8000", // Local MCP server
      "https://*.ngrok.app", // ngrok tunnel for ChatGPT testing
      "https://*.ngrok-free.app", // ngrok free tier
    ],
    resource_domains: [
      "http://localhost:4444", // Local Vite dev server
      "https://*.ngrok.app", // ngrok tunnel
      "https://*.ngrok-free.app", // ngrok free tier
      "https://*.oaistatic.com", // OpenAI CDN
    ],
  };
}

/**
 * Common metadata for all widgets.
 *
 * Includes CSP and border preference.
 */
export function getWidgetMetadata() {
  return {
    "openai/widgetPrefersBorder": true,
    "openai/widgetCSP": getWidgetCSP(),
  };
}
