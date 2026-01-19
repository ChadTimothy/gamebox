# Issue: Schema Validation Error Fix

**Issue ID:** Schema Validation Error
**Severity:** 🔴 CRITICAL
**Status:** Identified - Ready to Fix
**Date:** 2026-01-19

---

## Problem

Tool calls fail with error:
```
v3Schema.safeParseAsync is not a function
```

## Root Cause

**File:** `server/src/index.ts`
**Lines:** 155, 235

The code uses plain JSON Schema objects with `as any` type assertions:

```typescript
// ❌ INCORRECT (lines 146-155)
inputSchema: {
  type: "object",
  properties: {
    mode: {
      type: "string",
      enum: ["daily", "practice"],
      description: "Game mode: 'daily' for daily puzzle, 'practice' for random word",
    },
  },
} as any,  // <-- This bypasses type checking but fails at runtime
```

The MCP SDK expects **Zod schema objects**, not plain JSON Schema. The `as any` hides the type mismatch during compilation, but at runtime the SDK tries to call `safeParseAsync()` on the schema object, which doesn't exist on plain objects.

## Solution

Replace plain JSON Schema objects with Zod schemas.

### Step 1: Import Zod

Add to imports at top of `server/src/index.ts`:

```typescript
import { z } from "zod";
```

### Step 2: Fix `start_word_challenge` tool (line 141)

Replace lines 146-155 with:

```typescript
inputSchema: z.object({
  mode: z.enum(["daily", "practice"]).optional().default("daily")
    .describe("Game mode: 'daily' for daily puzzle, 'practice' for random word"),
}),
```

### Step 3: Fix `check_word_guess` tool (line 216)

Replace lines 221-235 with:

```typescript
inputSchema: z.object({
  gameId: z.string()
    .describe("Game session ID from start_word_challenge"),
  guess: z.string()
    .length(5)
    .regex(/^[A-Za-z]{5}$/)
    .transform(s => s.toUpperCase())
    .describe("5-letter word guess"),
}),
```

### Step 4: Update `show_game_menu` tool (line 314)

Replace line 318 with:

```typescript
inputSchema: z.object({}),  // No parameters needed
```

## Complete Fixed Code

### Import Section (top of file)
```typescript
import { z } from "zod";
```

### Tool 1: start_word_challenge (line 141-209)
```typescript
server.registerTool(
  "start_word_challenge",
  {
    title: "Start Word Challenge",
    description: "Start a new Word Challenge game (Wordle-style word guessing game)",
    inputSchema: z.object({
      mode: z.enum(["daily", "practice"]).optional().default("daily")
        .describe("Game mode: 'daily' for daily puzzle, 'practice' for random word"),
    }),
    _meta: {
      "openai/outputTemplate": "ui://widget/word-challenge.html",
      "openai/toolInvocation/invoking": "Starting Word Challenge",
      "openai/toolInvocation/invoked": "Word Challenge ready! Make your first guess.",
    },
  },
  async (params: unknown) => {
    const { mode = "daily" } = params as { mode?: "daily" | "practice" };
    // ... rest of handler
```

### Tool 2: check_word_guess (line 216-310)
```typescript
server.registerTool(
  "check_word_guess",
  {
    title: "Make Word Guess",
    description: "Submit a guess for the active Word Challenge game",
    inputSchema: z.object({
      gameId: z.string()
        .describe("Game session ID from start_word_challenge"),
      guess: z.string()
        .length(5)
        .regex(/^[A-Za-z]{5}$/)
        .transform(s => s.toUpperCase())
        .describe("5-letter word guess"),
    }),
    _meta: {
      "openai/outputTemplate": "ui://widget/word-challenge.html",
    },
  },
  async (params: unknown) => {
    const { gameId, guess } = params as { gameId: string; guess: string };
    // ... rest of handler
```

### Tool 3: show_game_menu (line 313-342)
```typescript
server.registerTool(
  "show_game_menu",
  {
    title: "Show Game Menu",
    description: "Display the GameBox game selection menu",
    inputSchema: z.object({}),
    _meta: {
      "openai/outputTemplate": "ui://widget/game-menu.html",
      "openai/toolInvocation/invoking": "Loading GameBox menu",
      "openai/toolInvocation/invoked": "GameBox menu ready",
    },
  },
  async () => ({
    // ... rest of handler
```

## Benefits of Zod Schemas

✅ **Runtime Validation** - Automatic input validation
✅ **Type Safety** - TypeScript types inferred from schemas
✅ **Transformations** - Can transform inputs (e.g., uppercase guess)
✅ **Better Errors** - Clearer validation error messages
✅ **MCP Compatibility** - Works with SDK's `safeParseAsync()`

## Testing After Fix

1. **Restart Server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test Tool Registration**
   ```bash
   curl -X POST http://localhost:8000/mcp \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
   ```

   Expected: ✅ Tools list successfully

3. **Test Daily Mode**
   ```bash
   curl -X POST http://localhost:8000/mcp \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -d '{
       "jsonrpc":"2.0",
       "method":"tools/call",
       "params":{
         "name":"start_word_challenge",
         "arguments":{"mode":"daily"}
       },
       "id":2
     }'
   ```

   Expected: ✅ Game starts, returns gameId and streak data

4. **Test Practice Mode**
   ```bash
   curl -X POST http://localhost:8000/mcp \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -d '{
       "jsonrpc":"2.0",
       "method":"tools/call",
       "params":{
         "name":"start_word_challenge",
         "arguments":{"mode":"practice"}
       },
       "id":3
     }'
   ```

   Expected: ✅ Game starts with different word

5. **Test Guess (valid word)**
   ```bash
   # Use gameId from step 3
   curl -X POST http://localhost:8000/mcp \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -d '{
       "jsonrpc":"2.0",
       "method":"tools/call",
       "params":{
         "name":"check_word_guess",
         "arguments":{"gameId":"wc_xxx","guess":"CRANE"}
       },
       "id":4
     }'
   ```

   Expected: ✅ Returns feedback with letter statuses

6. **Test Guess (invalid - too short)**
   ```bash
   curl -X POST http://localhost:8000/mcp \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -d '{
       "jsonrpc":"2.0",
       "method":"tools/call",
       "params":{
         "name":"check_word_guess",
         "arguments":{"gameId":"wc_xxx","guess":"CAT"}
       },
       "id":5
     }'
   ```

   Expected: ✅ Returns validation error

## Verification Checklist

After applying fix:

- [ ] Server starts without errors
- [ ] Tools register successfully
- [ ] Daily mode starts game
- [ ] Practice mode starts game
- [ ] Valid guesses return feedback
- [ ] Invalid guesses return errors
- [ ] Streak tracking persists
- [ ] MCP Inspector can call tools
- [ ] Unit tests pass: `npm test`

## Related Files

- `server/src/index.ts` - Main fix location
- `server/package.json` - Already has `zod@3.25.76` dependency
- `testing/word-challenge-test-report.md` - Test results

## Estimated Time

**Fix:** 5 minutes
**Testing:** 15 minutes
**Total:** ~20 minutes

## Priority

🔴 **CRITICAL** - Blocks all functionality. Apply immediately.

## Next Steps After Fix

1. ✅ Apply code changes
2. ✅ Test locally with curl
3. ✅ Run unit tests
4. ✅ Test with MCP Inspector
5. ✅ Update test report with passing results
6. ✅ Test in ChatGPT
7. ✅ Update TESTING_GUIDE.md with successful test run

---

**Status:** Ready to implement
**Assigned to:** Development team
**ETA:** 20 minutes
