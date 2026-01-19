# Issue #17.5: Update MCP Tool Registrations

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 2 - Backend Refactoring
**Duration:** 2 hours
**Priority:** Critical
**Dependencies:** #17.4

## Description

Update all MCP tool registrations in the server index file to use new game names and tool IDs. This is the most critical file for the rebranding effort, affecting all ChatGPT integrations.

## Objectives

- Update tool IDs for Word Morph
- Update resource URIs
- Update tool titles and descriptions
- Update game menu with all 5 new names
- Import updated WordMorphGame class
- Ensure backward compatibility is intentionally removed (clean break)
- **Migrate to SSE transport for ChatGPT Apps compatibility** (CRITICAL)
- **Add required ChatGPT App Store endpoints** (CRITICAL)
- **Fix tool schema format (JSON Schema, not Zod)** (CRITICAL)
- **Add tool annotations for ChatGPT discovery** (CRITICAL)

## Primary File

**File:** `/server/src/index.ts` (432 lines)

This is the most critical file in the rebranding effort.

## ChatGPT App Store Requirements (CRITICAL - Added from Agent Review)

### 1. SSE Transport Migration (BLOCKS APP STORE)

**Current implementation uses `StreamableHTTPServerTransport` which is NOT compatible with ChatGPT Apps.**

**Required:** Migrate to `SSEServerTransport` for ChatGPT Apps compliance.

**Pattern from ChatGPT App Builder skill (`node_chatgpt_app.md`):**

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

// Session management for multi-user support
interface SessionRecord {
  transport: SSEServerTransport;
  server: Server;
}
const sessions = new Map<string, SessionRecord>();

// GET /mcp - Establish SSE connection
app.get('/mcp', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Create transport and server for this session
  const transport = new SSEServerTransport('/mcp/messages', res);
  const server = new Server({ name: 'gamebox', version: '1.0.0' }, { capabilities: {} });

  // Register tool handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [...] }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => { /* ... */ });

  // Connect transport to server
  await server.connect(transport);

  // Store session for message handling
  sessions.set(sessionId, { transport, server });

  // Cleanup on disconnect
  req.on('close', () => {
    sessions.delete(sessionId);
  });
});

// POST /mcp/messages - Handle incoming messages
app.post('/mcp/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  await session.transport.handlePostMessage(req, res);
});
```

**Critical:** Session routing must use direct Map lookup by sessionId (not array iteration).

### 2. Required ChatGPT App Store Endpoints (BLOCKS APP STORE)

**Missing endpoints that MUST be added:**

#### a. Domain Verification Endpoint
```typescript
// /.well-known/openai-apps-challenge
app.get('/.well-known/openai-apps-challenge', (req, res) => {
  const challengeToken = process.env.OPENAI_CHALLENGE_TOKEN;
  if (!challengeToken) {
    return res.status(500).json({ error: 'Challenge token not configured' });
  }
  res.json({ challenge_token: challengeToken });
});
```

**Environment variable:** `OPENAI_CHALLENGE_TOKEN` (from App Store dashboard)

#### b. Privacy Policy Endpoint
```typescript
// /privacy
app.get('/privacy', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>GameBox Privacy Policy</title></head>
      <body>
        <h1>Privacy Policy</h1>
        <p>Last updated: [Date]</p>
        <h2>Information We Collect</h2>
        <p>GameBox collects minimal data:</p>
        <ul>
          <li>Game state (stored temporarily during play)</li>
          <li>No personal information</li>
          <li>No account data</li>
        </ul>
        <h2>Data Usage</h2>
        <p>Game state is stored in memory only for the duration of your session.</p>
        <h2>Contact</h2>
        <p>Email: [Your Email]</p>
      </body>
    </html>
  `);
});
```

#### c. Terms of Service Endpoint
```typescript
// /terms
app.get('/terms', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>GameBox Terms of Service</title></head>
      <body>
        <h1>Terms of Service</h1>
        <p>Last updated: [Date]</p>
        <h2>Acceptance of Terms</h2>
        <p>By using GameBox, you agree to these terms.</p>
        <h2>Service Description</h2>
        <p>GameBox provides word puzzle games through ChatGPT.</p>
        <h2>User Conduct</h2>
        <p>Users must use the service respectfully and not attempt to abuse or exploit it.</p>
        <h2>Limitation of Liability</h2>
        <p>GameBox is provided "as is" without warranty.</p>
      </body>
    </html>
  `);
});
```

### 3. Tool Schema Format Fix (BLOCKS VALIDATION)

**Current issue:** Using Zod schemas directly in tool definitions fails ChatGPT validation.

**Required pattern from ChatGPT App Builder skill:**

```typescript
import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

// Define tool with JSON Schema (for ChatGPT)
const tools: Tool[] = [
  {
    name: 'gamebox.start_word_morph',
    title: 'Start Word Morph',
    description: 'Use this when the user wants to start a new Word Morph game - a unique word transformation puzzle',
    inputSchema: {
      type: 'object',
      properties: {
        difficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard'],
          description: 'Game difficulty level'
        }
      },
      required: []  // difficulty is optional
    },
    _meta: {
      'openai/outputTemplate': 'ui://widget/word-morph.html',
      'openai/widgetAccessible': true
    },
    annotations: {
      readOnlyHint: false,     // Creates/modifies game state
      destructiveHint: false,  // Non-destructive action
      openWorldHint: false     // Constrained to game system
    }
  },
  {
    name: 'gamebox.check_word_morph_guess',
    title: 'Check Word Morph Guess',
    description: 'Use this when the user submits a word guess in Word Morph',
    inputSchema: {
      type: 'object',
      properties: {
        guess: {
          type: 'string',
          description: 'The 5-letter word guess',
          minLength: 5,
          maxLength: 5,
          pattern: '^[A-Za-z]{5}$'
        }
      },
      required: ['guess']
    },
    _meta: {
      'openai/outputTemplate': 'ui://widget/word-morph.html',
      'openai/widgetAccessible': true
    },
    annotations: {
      readOnlyHint: false,     // Modifies game state
      destructiveHint: false,  // Non-destructive action
      openWorldHint: false     // Constrained to game system
    }
  }
];

// Separate Zod schemas for runtime validation
const StartWordMorphSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium')
});

const CheckWordMorphGuessSchema = z.object({
  guess: z.string().length(5).regex(/^[A-Za-z]+$/)
});

// Handler with Zod validation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'gamebox.start_word_morph') {
    const parsed = StartWordMorphSchema.parse(args);
    // ... use parsed.difficulty
  }

  if (name === 'gamebox.check_word_morph_guess') {
    const parsed = CheckWordMorphGuessSchema.parse(args);
    // ... use parsed.guess
  }
});
```

**Key points:**
- Tool definition uses JSON Schema (for ChatGPT validation)
- Separate Zod schema for runtime validation in handler
- Include tool annotations (readOnlyHint, destructiveHint, openWorldHint)
- Include _meta fields for widget integration

### 4. CORS Configuration for ChatGPT

**Required CORS headers:**

```typescript
import cors from 'cors';

// CORS for ChatGPT domains only
app.use(cors({
  origin: [
    'https://chatgpt.com',
    'https://chat.openai.com',
    // Add development origin for testing
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### 5. Health Check Endpoint

```typescript
// /health or / - Health check for App Store
app.get(['/', '/health'], (req, res) => {
  res.json({
    status: 'healthy',
    service: 'gamebox',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});
```

## Changes Required

### 1. Import Statements

```typescript
// OLD
import { WordChallengeGame } from './games/wordChallenge';

// NEW
import { WordMorphGame } from './games/wordMorph';
```

### 2. Tool ID Updates

**Word Morph Start Tool:**
```typescript
// OLD
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'gamebox.start_word_challenge') {
    // ...
  }
});

// NEW
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'gamebox.start_word_morph') {
    // ...
  }
});
```

**Word Morph Check Guess Tool:**
```typescript
// OLD
if (request.params.name === 'gamebox.check_word_guess') {
  // ...
}

// NEW
if (request.params.name === 'gamebox.check_word_morph_guess') {
  // ...
}
```

### 3. Tool Registration (ListToolsRequest)

```typescript
// OLD
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'gamebox.start_word_challenge',
        description: 'Start a new Word Challenge game (like Wordle)',
        inputSchema: {
          type: 'object',
          properties: {
            // ...
          }
        }
      },
      {
        name: 'gamebox.check_word_guess',
        description: 'Check a word guess in the current Word Challenge game',
        inputSchema: {
          type: 'object',
          properties: {
            // ...
          }
        }
      },
      // ... other tools
    ]
  };
});

// NEW
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'gamebox.start_word_morph',
        description: 'Start a new Word Morph game - a unique word transformation puzzle',
        inputSchema: {
          type: 'object',
          properties: {
            // ...
          }
        }
      },
      {
        name: 'gamebox.check_word_morph_guess',
        description: 'Check a word guess in the current Word Morph game',
        inputSchema: {
          type: 'object',
          properties: {
            // ...
          }
        }
      },
      // ... other tools
    ]
  };
});
```

### 4. Resource URI Updates

```typescript
// OLD
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'ui://widget/word-challenge.html',
        name: 'Word Challenge Widget',
        description: 'Interactive Word Challenge game widget',
        mimeType: 'text/html'
      }
    ]
  };
});

// NEW
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'ui://widget/word-morph.html',
        name: 'Word Morph Widget',
        description: 'Interactive Word Morph game widget',
        mimeType: 'text/html'
      }
    ]
  };
});
```

### 5. Game Menu Update

**Critical:** Update all 5 game names in the menu

```typescript
// OLD
const gameMenu = {
  games: [
    { id: "word-challenge", name: "Word Challenge", status: "available" },
    { id: "connections", name: "Connections", status: "coming-soon" },
    { id: "spelling-bee", name: "Spelling Bee", status: "coming-soon" },
    { id: "20-questions", name: "20 Questions", status: "coming-soon" },
    { id: "trivia-challenge", name: "Trivia Challenge", status: "coming-soon" }
  ]
};

// NEW
const gameMenu = {
  games: [
    { id: "word-morph", name: "Word Morph", status: "available" },
    { id: "kinship", name: "Kinship", status: "coming-soon" },
    { id: "lexicon-smith", name: "Lexicon Smith", status: "coming-soon" },
    { id: "twenty-queries", name: "Twenty Queries", status: "coming-soon" },
    { id: "lore-master", name: "Lore Master", status: "coming-soon" }
  ]
};
```

### 6. Game Instance Management

```typescript
// OLD
let currentGame: WordChallengeGame | null = null;

// NEW
let currentGame: WordMorphGame | null = null;
```

**Game initialization:**
```typescript
// OLD
currentGame = new WordChallengeGame(/* params */);

// NEW
currentGame = new WordMorphGame(/* params */);
```

### 7. Error Messages and User-Facing Strings

Update all user-facing strings:
```typescript
// Examples
"No active Word Challenge game" → "No active Word Morph game"
"Word Challenge game completed" → "Word Morph game completed"
"Starting Word Challenge..." → "Starting Word Morph..."
```

### 8. Widget HTML Generation

If there's HTML generation code for the widget:
```typescript
// OLD
const html = `
  <div class="word-challenge-widget">
    <h1>Word Challenge</h1>
    <!-- ... -->
  </div>
`;

// NEW
const html = `
  <div class="word-morph-widget">
    <h1>Word Morph</h1>
    <!-- ... -->
  </div>
`;
```

## Breaking Changes Documentation

**Important:** These are intentional breaking changes

### Old Tool IDs (REMOVED)
- `gamebox.start_word_challenge` ❌
- `gamebox.check_word_guess` ❌

### New Tool IDs (ADDED)
- `gamebox.start_word_morph` ✅
- `gamebox.check_word_morph_guess` ✅

**Impact:** Any ChatGPT integrations using old tool IDs will break and need to update.

**Mitigation:** Migration guide (Task #17.16) will document this change.

## Testing Requirements

### Server Startup Test

```bash
cd server
npm run dev
```

**Verify:**
- [ ] Server starts without errors
- [ ] No warnings about missing modules
- [ ] Tool registration messages show new names
- [ ] Console logs show "Word Morph" (not "Word Challenge")
- [ ] **SSE transport initialized (not StreamableHTTPServerTransport)**
- [ ] **Session management Map initialized**

### ChatGPT App Store Endpoint Tests (CRITICAL)

**Test domain verification:**
```bash
curl http://localhost:8000/.well-known/openai-apps-challenge
# Expected: { "challenge_token": "[your-token]" }
```

**Test privacy policy:**
```bash
curl http://localhost:8000/privacy
# Expected: HTML page with privacy policy
```

**Test terms of service:**
```bash
curl http://localhost:8000/terms
# Expected: HTML page with terms of service
```

**Test health check:**
```bash
curl http://localhost:8000/health
# Expected: { "status": "healthy", "service": "gamebox", "version": "1.0.0", "timestamp": "..." }
```

### SSE Transport Test (CRITICAL)

**Test SSE connection:**
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Test SSE endpoint
curl -N 'http://localhost:8000/mcp?sessionId=test-session-123' \
  -H "Accept: text/event-stream"
# Expected: SSE stream connection established
```

**Test message handling:**
```bash
curl -X POST 'http://localhost:8000/mcp/messages?sessionId=test-session-123' \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
# Expected: Tool list response via SSE
```

### Tool Registration Test

Use MCP inspector or manual test:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

**Expected response includes:**
- `gamebox.start_word_morph` tool
- `gamebox.check_word_morph_guess` tool
- NOT `gamebox.start_word_challenge`
- NOT `gamebox.check_word_guess`

### Tool Invocation Test

Test the new tool IDs work:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "gamebox.start_word_morph",
    "arguments": {
      "difficulty": "medium"
    }
  },
  "id": 2
}
```

**Expected:**
- Tool executes successfully
- Returns game state
- No errors

### Resource Test

```json
{
  "jsonrpc": "2.0",
  "method": "resources/list",
  "id": 3
}
```

**Expected response includes:**
- `ui://widget/word-morph.html` resource
- NOT `ui://widget/word-challenge.html`

## Acceptance Criteria

- [ ] Import statement updated to `WordMorphGame`
- [ ] All tool IDs updated:
  - [ ] `start_word_morph` (not `start_word_challenge`)
  - [ ] `check_word_morph_guess` (not `check_word_guess`)
- [ ] Resource URI updated to `word-morph.html`
- [ ] Game menu updated with all 5 new names
- [ ] Tool titles and descriptions updated
- [ ] Error messages updated
- [ ] Game instance variable updated
- [ ] Server starts without errors
- [ ] Tools register correctly
- [ ] Tool invocations work
- [ ] Resources list correctly
- [ ] No "Word Challenge" strings remain in user-facing text

## Search and Verify

Before marking complete, search for old references:

```bash
cd server/src
grep -n "word.challenge" index.ts
grep -n "Word Challenge" index.ts
grep -n "wordChallenge" index.ts
grep -n "WordChallenge" index.ts
```

All searches should return 0 results (or only in comments explaining the change).

## Implementation Checklist

- [ ] Update imports
- [ ] Update tool IDs in CallToolRequestSchema handler
- [ ] Update tool registrations in ListToolsRequestSchema
- [ ] Update resource URIs
- [ ] Update game menu (all 5 games)
- [ ] Update game instance type
- [ ] Update error messages
- [ ] Update widget HTML generation (if present)
- [ ] Run server startup test
- [ ] Test tool registration
- [ ] Test tool invocation
- [ ] Test resource listing
- [ ] Verify no old references remain

## Related Tasks

- **Depends on:** #17.4 (Backend module must be renamed first)
- **Blocks:** #17.10 (Frontend tools need backend tools updated first)
- **Related:** #17.16 (Migration guide documents these changes)

## Labels

- `phase-2-backend`
- `critical`
- `breaking-change`
- `mcp-tools`
- `epic-17`
