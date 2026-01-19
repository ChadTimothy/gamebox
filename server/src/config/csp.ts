/**
 * Content Security Policy (CSP) configuration for ChatGPT widgets.
 *
 * CSP controls what domains widgets can connect to and load resources from.
 * This is required for ChatGPT app directory submission.
 *
 * @module config/csp
 */

// OpenAI CDN for SDK UI assets (always allowed)
const OPENAI_CDN = "https://*.oaistatic.com";

// Default production URLs (can be overridden via environment variables)
const DEFAULT_PRODUCTION_API = "https://word-challenge.fly.dev";
const DEFAULT_PRODUCTION_CDN = "https://word-challenge.fly.dev";

// Development tunnel patterns
const DEV_TUNNELS = [
  "https://*.ngrok.app",
  "https://*.ngrok-free.app",
  "https://*.serveousercontent.com",
  "https://word-challenge.fly.dev", // Include Fly.io deployment in development
];

/**
 * CSP configuration structure for OpenAI widgets.
 */
export interface WidgetCSPConfig {
  /** Domains that widgets can make HTTP requests to */
  connect_domains: string[];
  /** Domains that widgets can load resources from */
  resource_domains: string[];
  /** Domains that can be embedded in iframes (optional) */
  frame_domains?: string[];
}

/**
 * Widget metadata structure.
 * Uses index signature for MCP SDK compatibility.
 */
interface WidgetMetadata {
  [key: string]: unknown;
  "openai/widgetPrefersBorder": boolean;
  "openai/widgetCSP": WidgetCSPConfig;
  "openai/widgetDomain"?: string;
}

/**
 * Get CSP configuration for production environment.
 */
function getProductionCSP(): WidgetCSPConfig {
  return {
    connect_domains: [process.env.PRODUCTION_API_URL ?? DEFAULT_PRODUCTION_API],
    resource_domains: [process.env.PRODUCTION_CDN_URL ?? DEFAULT_PRODUCTION_CDN, OPENAI_CDN],
  };
}

/**
 * Get CSP configuration for development environment.
 */
function getDevelopmentCSP(): WidgetCSPConfig {
  return {
    connect_domains: ["http://localhost:8000", ...DEV_TUNNELS],
    resource_domains: ["http://localhost:4444", ...DEV_TUNNELS, OPENAI_CDN],
  };
}

/**
 * Get environment-aware CSP configuration.
 */
export function getWidgetCSP(): WidgetCSPConfig {
  const isProduction = process.env.NODE_ENV === "production";
  return isProduction ? getProductionCSP() : getDevelopmentCSP();
}

/**
 * Get common metadata for all widgets.
 */
export function getWidgetMetadata(): WidgetMetadata {
  const metadata: WidgetMetadata = {
    "openai/widgetPrefersBorder": true,
    "openai/widgetCSP": getWidgetCSP(),
  };

  // Add widgetDomain in production (required for ChatGPT Apps submission)
  if (process.env.NODE_ENV === "production") {
    metadata["openai/widgetDomain"] = "word-challenge.fly.dev";
  }

  return metadata;
}
