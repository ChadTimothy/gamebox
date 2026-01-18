# GameBox Technical Design Review

**Date**: 2026-01-19
**Review Against**: OpenAI Apps SDK Official Documentation

## Executive Summary

This document reviews the GameBox technical design against the official OpenAI Apps SDK documentation to ensure compliance with ChatGPT app requirements.

## ✅ What We Got Right

### 1. MCP Server Architecture
- **Status**: ✅ **Correct**
- **Evidence**: Using `McpServer` from `@openai/apps-sdk` (renamed from `@modelcontextprotocol/sdk`)
- **Reference**: [Apps SDK MCP Server Docs](https://developers.openai.com/apps-sdk/build/mcp-server)

### 2. Widget Resource Registration
- **Status**: ✅ **Correct**
- **Pattern**: `ui://widget/{name}.html` with `text/html+skybridge` mime type
- **Evidence**: Matches official examples exactly

### 3. Tool Registration Pattern
- **Status**: ✅ **Correct**
- **Pattern**: Using `_meta["openai/outputTemplate"]` to link tools to widgets
- **Example**:
```typescript
server.registerTool("start_word_challenge", {
  // ... tool config
  _meta: { "openai/outputTemplate": "ui://widget/word-challenge.html" }
});
```

### 4. Deployment Strategy
- **Status**: ✅ **Correct**
- **Choice**: Fly.io is explicitly mentioned in official docs as a good option
- **Reference**: [Step 5 – Expose an HTTPS endpoint](https://developers.openai.com/apps-sdk/build/mcp-server)

## ⚠️ What Needs Updates

### 1. SDK Package Name
- **Issue**: We referenced `@modelcontextprotocol/sdk` but should use `@openai/apps-sdk`
- **Fix Required**: Update all package.json references
- **Priority**: **HIGH**
- **Ticket**: Create issue to update dependency

**Current (Wrong)**:
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
```

**Should Be**:
```typescript
import { McpServer } from "@openai/apps-sdk";
```

### 2. Transport Layer
- **Issue**: We used `SSEServerTransport` but should use `StreamableHTTPServerTransport`
- **Fix Required**: Update server implementation
- **Priority**: **HIGH**
- **Reference**: Official quickstart uses `StreamableHTTPServerTransport`

**Should Use**:
```typescript
import { StreamableHTTPServerTransport } from "@openai/apps-sdk";

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined, // stateless mode
  enableJsonResponse: true,
});
```

### 3. UI Component Library
- **Issue**: We planned to use only Tailwind CSS, but official best practice is `@openai/apps-sdk-ui`
- **Fix Required**: Add `@openai/apps-sdk-ui` dependency
- **Priority**: **MEDIUM**
- **Benefits**:
  - Pre-built accessible components
  - Consistent with ChatGPT design
  - Dark mode support built-in
  - Less custom CSS needed

**Should Install**:
```bash
npm install @openai/apps-sdk-ui
```

**Example Usage**:
```tsx
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
```

### 4. Widget Hooks
- **Issue**: We need to use official hooks for accessing tool data
- **Fix Required**: Create hooks following official patterns
- **Priority**: **HIGH**

**Official Hooks to Implement**:
```typescript
// hooks/useOpenAiGlobal.ts
export function useToolInput() {
  return useOpenAiGlobal("toolInput");
}

export function useToolOutput() {
  return useOpenAiGlobal("toolOutput");
}

export function useWidgetState() {
  // Syncs with window.openai.setWidgetState
}
```

### 5. Content Security Policy (CSP)
- **Issue**: **MISSING** - Required for production apps
- **Fix Required**: Add CSP configuration to all widget resources
- **Priority**: **HIGH** (blocks app directory submission)

**Must Add**:
```typescript
server.registerResource("word-challenge", "ui://widget/word-challenge.html", {}, async () => ({
  contents: [{
    uri: "ui://widget/word-challenge.html",
    mimeType: "text/html+skybridge",
    text: widgetHtml,
    _meta: {
      "openai/widgetPrefersBorder": true,
      "openai/widgetCSP": {
        connect_domains: ["https://gamebox-api.fly.dev"], // Our API
        resource_domains: ["https://cdn.fly.dev"], // CDN for assets
        // Add if using external services
      }
    }
  }]
}));
```

### 6. Widget Border Preference
- **Issue**: Missing `openai/widgetPrefersBorder` metadata
- **Fix Required**: Add to widget resources
- **Priority**: **LOW** (cosmetic)

### 7. Tool Invocation Messaging
- **Issue**: Missing helpful loading states
- **Fix Required**: Add `openai/toolInvocation` metadata
- **Priority**: **MEDIUM** (UX improvement)

**Should Add**:
```typescript
_meta: {
  "openai/outputTemplate": "ui://widget/word-challenge.html",
  "openai/toolInvocation/invoking": "Starting Word Challenge",
  "openai/toolInvocation/invoked": "Word Challenge ready"
}
```

## ❌ What's Missing Entirely

### 1. Widget State Management
- **Issue**: No implementation of `window.openai.setWidgetState`
- **Impact**: State won't persist across messages
- **Priority**: **HIGH**
- **Required For**: Proper game state management

**Implementation Needed**:
```tsx
// In React components
const [state, setState] = useWidgetState({
  guesses: [],
  status: "playing"
});

// Updates both local state AND sends to ChatGPT
setState({ guesses: [...guesses, newGuess] });
```

### 2. Widget Testing Infrastructure
- **Issue**: No testing plan for widgets in ChatGPT environment
- **Priority**: **MEDIUM**
- **Required**: Test with ngrok during development

### 3. App Submission Compliance
- **Issue**: Need to ensure compliance with App Submission Guidelines
- **Priority**: **HIGH** (before launch)
- **Action**: Review guidelines and create checklist

## 📋 Action Items

### Immediate (Epic #1 - Project Setup)

1. **Update Package Dependencies**
   - Remove `@modelcontextprotocol/sdk`
   - Add `@openai/apps-sdk`
   - Add `@openai/apps-sdk-ui`
   - Add proper types

2. **Update Server Implementation**
   - Change to `StreamableHTTPServerTransport`
   - Update MCP endpoint handling
   - Add CORS configuration

3. **Create Widget Hooks**
   - Implement `useToolOutput()`
   - Implement `useToolInput()`
   - Implement `useWidgetState()`
   - Implement `useOpenAiGlobal()`

### Before Each Game (Epics #4, #11-14)

4. **Add CSP Configuration**
   - Define allowed domains
   - Configure for production URL
   - Test CSP violations

5. **Use Official UI Components**
   - Replace custom Tailwind with `@openai/apps-sdk-ui` where possible
   - Import Button, Badge, Alert, etc.
   - Ensure dark mode support

6. **Implement State Management**
   - Use `window.openai.setWidgetState` in all games
   - Test state persistence
   - Keep payload under 4k tokens

### Before Launch (Epic #16)

7. **App Submission Checklist**
   - Review submission guidelines
   - Ensure CSP is configured
   - Test with production URLs
   - Prepare app description and metadata

## Updated File Structure

```
gamebox/
├── server/
│   ├── package.json          # UPDATE: @openai/apps-sdk
│   ├── src/
│   │   ├── index.ts          # UPDATE: StreamableHTTPServerTransport
│   │   ├── games/
│   │   ├── data/
│   │   └── utils/
│   └── tsconfig.json
├── web/
│   ├── package.json          # ADD: @openai/apps-sdk-ui
│   ├── src/
│   │   ├── hooks/
│   │   │   ├── useToolOutput.ts      # NEW
│   │   │   ├── useToolInput.ts       # NEW
│   │   │   ├── useWidgetState.ts     # NEW
│   │   │   └── useOpenAiGlobal.ts    # NEW
│   │   ├── widgets/
│   │   │   ├── WordChallenge.tsx     # UPDATE: use SDK UI
│   │   │   ├── Connections.tsx       # UPDATE: use SDK UI
│   │   │   ├── SpellingBee.tsx       # UPDATE: use SDK UI
│   │   │   └── Trivia.tsx            # UPDATE: use SDK UI
│   │   └── styles/
│   └── vite.config.ts
└── docs/
    ├── TECHNICAL_REVIEW.md   # THIS FILE
    └── APP_SUBMISSION.md     # TO CREATE
```

## Updated Technology Stack

### Server (MCP)
- **Runtime**: Node.js 20+ with TypeScript ✅
- **Framework**: Express.js ✅
- **SDK**: `@openai/apps-sdk` ⚠️ (update from `@modelcontextprotocol/sdk`)
- **Transport**: `StreamableHTTPServerTransport` ⚠️ (update from SSE)
- **Database**: Supabase (PostgreSQL) ✅

### Client (Widgets)
- **Framework**: React 18 with TypeScript ✅
- **UI Library**: `@openai/apps-sdk-ui` ❌ (ADD THIS)
- **Build Tool**: Vite ✅
- **Base Styling**: Tailwind CSS ✅ (but prefer SDK UI components)
- **Hosting**: Fly.io + Cloudflare CDN ✅

## References

- [Apps SDK Documentation](https://developers.openai.com/apps-sdk)
- [Apps SDK Quickstart](https://developers.openai.com/apps-sdk/quickstart)
- [MCP Server Build Guide](https://developers.openai.com/apps-sdk/build/mcp-server)
- [ChatGPT UI Integration](https://developers.openai.com/apps-sdk/build/chatgpt-ui)
- [Apps SDK UI Components](https://github.com/openai/apps-sdk-ui)
- [Apps SDK Examples](https://github.com/openai/openai-apps-sdk-examples)

## Next Steps

1. Create GitHub issues for each action item
2. Update Epic #1 tasks to reflect SDK changes
3. Add new tasks for CSP configuration
4. Add new tasks for widget hooks implementation
5. Update all widget tasks to use SDK UI components
6. Create app submission checklist
