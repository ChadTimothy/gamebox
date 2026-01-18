# GameBox Web (Widgets)

React widgets for GameBox - interactive UI components rendered inside ChatGPT.

## Structure

```
web/
├── src/
│   ├── index.tsx         # Entry point
│   ├── App.tsx           # Widget router
│   ├── widgets/          # React components for each game
│   │   ├── WordChallenge.tsx
│   │   ├── Connections.tsx
│   │   ├── SpellingBee.tsx
│   │   ├── Trivia.tsx
│   │   └── GameMenu.tsx
│   ├── hooks/            # React hooks for MCP integration
│   │   ├── useOpenAiGlobal.ts
│   │   ├── useToolOutput.ts
│   │   ├── useToolInput.ts
│   │   └── useWidgetState.ts
│   └── styles/           # Tailwind CSS
│       └── tailwind.css
├── dist/                 # Build output
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Technology

- **Framework**: React 18
- **Language**: TypeScript
- **UI Library**: `@openai/apps-sdk-ui`
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Apps SDK UI design tokens

## Development

```bash
# Install dependencies
npm install

# Run development server (with hot reload)
npm run dev
# Widgets available at http://localhost:4444

# Build for production
npm run build
# Output: dist/
```

## Widget Integration

Each widget:
1. Receives data via `window.openai.toolOutput`
2. Can call MCP tools via `window.openai.callTool()`
3. Persists state via `window.openai.setWidgetState()`
4. Renders inside ChatGPT's iframe sandbox

## Hooks

### useToolOutput()
Access structured content returned from MCP tool calls.

```tsx
const data = useToolOutput<GameState>();
```

### useToolInput()
Access the arguments passed to the current tool.

```tsx
const input = useToolInput<{ mode: string }>();
```

### useWidgetState()
Manage persistent widget state.

```tsx
const [state, setState] = useWidgetState({ score: 0 });
```

### useOpenAiGlobal()
Low-level hook to access any `window.openai` property.

```tsx
const metadata = useOpenAiGlobal('toolResponseMetadata');
```

## Components

Widgets use `@openai/apps-sdk-ui` components for consistency:

- **Button**, ButtonLink, TextLink - Interactive elements
- **Badge**, Alert, Tooltip - Feedback
- **Input**, Textarea, Select, Checkbox, Switch - Forms
- **Avatar**, AvatarGroup - User representation
- **Popover**, Menu - Overlays
- **EmptyMessage** - Empty states
- **Markdown** - Rich text (with LaTeX)
- **CodeBlock** - Syntax highlighting

## Security

### Content Security Policy (CSP)

Widgets run in a sandboxed iframe with strict CSP defined by the MCP server:

```typescript
_meta: {
  "openai/widgetCSP": {
    connect_domains: ["https://gamebox-api.fly.dev"],
    resource_domains: ["https://cdn.fly.dev"]
  }
}
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Building for Production

Build output is served by the MCP server:

```bash
npm run build
# Outputs to dist/ and copies to ../assets/
```

The MCP server embeds these bundles in widget resources:

```typescript
server.registerResource("game-widget", "ui://widget/game.html", {}, async () => ({
  contents: [{
    uri: "ui://widget/game.html",
    mimeType: "text/html+skybridge",
    text: `<div id="root"></div><script>${bundleJs}</script>`
  }]
}));
```
