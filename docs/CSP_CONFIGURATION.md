# Content Security Policy (CSP) Configuration

## Issue Fixed

ChatGPT was blocking widget assets from loading due to CSP violations:
```
Loading the script 'https://word-challenge.fly.dev/assets/index.js' violates the following Content Security Policy directive
```

## Root Cause

The CSP configuration in `server/src/config/csp.ts` was configured for old placeholder domains (`gamebox-api.fly.dev` and `cdn.fly.dev`) instead of the actual deployment domain (`word-challenge.fly.dev`).

## Solution

Updated CSP configuration to include the correct Fly.io deployment domain:

```typescript
// Default production URLs
const DEFAULT_PRODUCTION_API = "https://word-challenge.fly.dev";
const DEFAULT_PRODUCTION_CDN = "https://word-challenge.fly.dev";

// Development tunnel patterns (includes Fly.io for testing)
const DEV_TUNNELS = [
  "https://*.ngrok.app",
  "https://*.ngrok-free.app",
  "https://*.serveousercontent.com",
  "https://word-challenge.fly.dev",
];
```

## How CSP Works in ChatGPT Widgets

1. **Widget Registration**: When ChatGPT loads a widget, it requests the widget resource from the MCP server
2. **Metadata Delivery**: The MCP server returns the widget HTML with `_meta` field containing CSP configuration
3. **Policy Enforcement**: ChatGPT applies the CSP to restrict what domains the widget can:
   - `connect_domains`: Make HTTP requests to (API calls)
   - `resource_domains`: Load resources from (JS, CSS, images)
   - `frame_domains`: Embed in iframes (optional)

## Current CSP Configuration

### Development (NODE_ENV != "production")
- **Connect Domains**: `http://localhost:8000`, dev tunnels, `https://word-challenge.fly.dev`
- **Resource Domains**: `http://localhost:4444`, dev tunnels, `https://word-challenge.fly.dev`, `https://*.oaistatic.com`

### Production (NODE_ENV = "production")
- **Connect Domains**: `https://word-challenge.fly.dev`
- **Resource Domains**: `https://word-challenge.fly.dev`, `https://*.oaistatic.com`

## Testing CSP Changes

After updating CSP configuration:

1. **Local Testing**: Restart MCP server (nodemon auto-restarts)
   ```bash
   # Server restarts automatically when csp.ts changes
   tail -f /tmp/mcp-server.log
   ```

2. **Production Testing**: Deploy to Fly.io
   ```bash
   fly deploy
   ```

3. **Verify in ChatGPT**: Test the widget in ChatGPT - check browser console for CSP errors

## Environment Variables

You can override CSP domains using environment variables:

```bash
# Production API endpoint
PRODUCTION_API_URL=https://your-domain.com

# Production CDN for widget assets
PRODUCTION_CDN_URL=https://your-cdn.com
```

If not set, defaults to `word-challenge.fly.dev` for both.

## Common Issues

### Issue: Widget loads but can't connect to API
**Solution**: Add your API domain to `connect_domains`

### Issue: Widget HTML loads but JS/CSS don't load
**Solution**: Add your asset domain to `resource_domains`

### Issue: CSP changes not taking effect
**Solution**:
1. Local: Check nodemon restarted (watch logs)
2. Production: Redeploy with `fly deploy`
3. ChatGPT: Hard refresh (Cmd+Shift+R) to clear cache

## References

- CSP Configuration: `server/src/config/csp.ts`
- Widget Metadata Usage: `server/src/index.ts` (search for `getWidgetMetadata()`)
- OpenAI Widget Documentation: [ChatGPT Apps SDK](https://platform.openai.com/docs/guides/apps)
