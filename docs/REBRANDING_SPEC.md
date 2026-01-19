# GameBox Rebranding Specification

**Epic:** #17 - Legal Safety Game Rebranding
**Version:** 1.0
**Status:** Approved
**Last Updated:** 2026-01-19

## Executive Summary

This document serves as the single source of truth for rebranding all 5 GameBox games to avoid trademark conflicts with NYT Games. All implementation tasks must reference this specification for naming, visual design, and technical patterns.

## Legal Risk Assessment

| Game | Current Name | Legal Risk | New Name | Rationale |
|------|--------------|------------|----------|-----------|
| 1 | Word Challenge | 🟡 Medium | Word Morph | Avoid Wordle similarity |
| 2 | Connections | 🔴 High | Kinship | NYT trademark |
| 3 | Spelling Bee | 🔴 High | Lexicon Smith | NYT trademark |
| 4 | 20 Questions | 🟢 Low | Twenty Queries | Modernize, AI theme |
| 5 | Trivia Challenge | 🟢 Low | Lore Master | Distinctive branding |

## 1. Name Mappings

### Complete Game Rebranding Table

| Current Name | New Name | Theme | Tool ID Pattern | Description |
|--------------|----------|-------|----------------|-------------|
| **Word Challenge** | **Word Morph** | Transformation puzzle | `word-morph` | Guess 5-letter words with feedback |
| **Connections** | **Kinship** | Linguistic relationships | `kinship` | Group words by shared connections |
| **Spelling Bee** | **Lexicon Smith** | Medieval forge | `lexicon-smith` | Create words from letter set |
| **20 Questions** | **Twenty Queries** | AI investigation | `twenty-queries` | Guess the word through Q&A |
| **Trivia Challenge** | **Lore Master** | Knowledge keeper | `lore-master` | Answer trivia questions |

### Tool ID Migrations

**Word Challenge → Word Morph:**
```
OLD: gamebox.start_word_challenge
NEW: gamebox.start_word_morph

OLD: gamebox.check_word_guess
NEW: gamebox.check_word_morph_guess
```

**Connections → Kinship:**
```
OLD: gamebox.start_connections
NEW: gamebox.start_kinship

OLD: gamebox.check_connection_guess
NEW: gamebox.check_kinship_guess
```

**Spelling Bee → Lexicon Smith:**
```
OLD: gamebox.start_spelling_bee
NEW: gamebox.start_lexicon_smith

OLD: gamebox.check_spelling_guess
NEW: gamebox.check_lexicon_smith_guess
```

**20 Questions → Twenty Queries:**
```
OLD: gamebox.start_twenty_questions
NEW: gamebox.start_twenty_queries

OLD: gamebox.check_question_guess
NEW: gamebox.check_twenty_queries_guess
```

**Trivia Challenge → Lore Master:**
```
OLD: gamebox.start_trivia_challenge
NEW: gamebox.start_lore_master

OLD: gamebox.check_trivia_guess
NEW: gamebox.check_lore_master_guess
```

## 2. Visual Design Specifications

### Word Morph

**Color Palette:**
```css
/* Correct letter in correct position */
--word-morph-correct: #14B8A6;  /* Teal - NOT Wordle green */

/* Correct letter in wrong position */
--word-morph-present: #F97316;  /* Coral - NOT Wordle yellow */

/* Letter not in word */
--word-morph-absent: #64748B;   /* Slate - NOT Wordle gray */

/* Background colors */
--word-morph-bg: #F8FAFC;
--word-morph-border: #CBD5E1;
```

**Layout:**
- **Grid:** 4×7 or 3×8 (NOT 5×6 like Wordle)
- **Flow:** Horizontal progression (NOT vertical like Wordle)
- **Tile size:** 60px × 60px
- **Border radius:** 8px (rounded corners)
- **Spacing:** 12px between tiles (wider than Wordle)

**Animations:**
- **Tile flip:** 150ms (faster than Wordle's 250ms)
- **Color reveal:** Simultaneous (NOT sequential like Wordle)
- **Win animation:** Bounce effect (NOT row-by-row like Wordle)

### Kinship

**Layout:**
- **Grid:** Radial/circular arrangement (NOT rectangular grid)
- **Categories:** 4 groups with distinct visual zones
- **Connection visualization:** Lines/curves showing relationships

**Color Palette:**
```css
/* Category colors - distinct from Connections */
--kinship-category-1: #8B5CF6;  /* Purple */
--kinship-category-2: #06B6D4;  /* Cyan */
--kinship-category-3: #F59E0B;  /* Amber */
--kinship-category-4: #EC4899;  /* Pink */

/* Background */
--kinship-bg: #FAFAFA;
--kinship-border: #E5E7EB;
```

**Theme:**
- Family/relationship metaphors
- Organic, flowing design
- Emphasis on connections between items

### Lexicon Smith

**Theme:** Medieval forge/anvil

**Color Palette:**
```css
/* Bronze/gold tones */
--lexicon-smith-primary: #B45309;   /* Bronze */
--lexicon-smith-secondary: #D97706; /* Amber */
--lexicon-smith-accent: #FCD34D;    /* Gold */

/* Background */
--lexicon-smith-bg: #FEF3C7;   /* Parchment */
--lexicon-smith-border: #B45309;
```

**Layout:**
- **Honeycomb:** NO - use linear/anvil shape instead
- **Letter tiles:** Hexagonal with hammer/forge aesthetic
- **Score display:** Anvil icon

**Icons:**
- Anvil (main icon)
- Hammer (action indicator)
- Forge fire (scoring visual)

### Twenty Queries

**Theme:** AI-powered investigation/detective

**Layout:**
- **Conversation bubble interface** (NOT traditional Q&A list)
- Questions and answers as chat messages
- Progress indicator showing remaining queries

**Color Palette:**
```css
/* Modern, tech-inspired */
--twenty-queries-primary: #6366F1;    /* Indigo */
--twenty-queries-secondary: #8B5CF6;  /* Purple */
--twenty-queries-bg: #F9FAFB;
--twenty-queries-accent: #A78BFA;     /* Light purple */
```

**Visual elements:**
- Question mark icon
- Progress bar (20 queries remaining)
- Reveal animation for final answer

### Lore Master

**Theme:** Book/scroll interface - knowledge keeper

**Layout:**
- **Book/scroll page design** (NOT quiz-show format)
- Questions presented as pages
- Score displayed as chapters completed

**Color Palette:**
```css
/* Parchment/ancient tones */
--lore-master-primary: #92400E;    /* Brown */
--lore-master-secondary: #B45309;  /* Bronze */
--lore-master-bg: #FEF3C7;         /* Parchment */
--lore-master-accent: #D97706;     /* Amber */
```

**Icons:**
- Open book (main icon)
- Scroll (question display)
- Quill (answer selection)

## 3. Identifier Patterns

### File Naming Conventions

**Backend (TypeScript):**
```
server/src/games/wordMorph.ts
server/src/games/kinship.ts
server/src/games/lexiconSmith.ts
server/src/games/twentyQueries.ts
server/src/games/loreMaster.ts
```

**Backend Tests:**
```
server/src/games/wordMorph.test.ts
server/src/games/kinship.test.ts
server/src/games/lexiconSmith.test.ts
server/src/games/twentyQueries.test.ts
server/src/games/loreMaster.test.ts
```

**Frontend (React Components):**
```
web/src/widgets/WordMorph.tsx
web/src/widgets/Kinship.tsx
web/src/widgets/LexiconSmith.tsx
web/src/widgets/TwentyQueries.tsx
web/src/widgets/LoreMaster.tsx
```

**Frontend Tests:**
```
web/src/widgets/WordMorph.test.tsx
web/src/widgets/Kinship.test.tsx
web/src/widgets/LexiconSmith.test.tsx
web/src/widgets/TwentyQueries.test.tsx
web/src/widgets/LoreMaster.test.tsx
```

**E2E Tests:**
```
e2e/word-morph.spec.ts
e2e/kinship.spec.ts
e2e/lexicon-smith.spec.ts
e2e/twenty-queries.spec.ts
e2e/lore-master.spec.ts
```

### CSS Class Naming

**Pattern:** `.{game-id}-{component}`

**Examples:**
```css
/* Word Morph */
.word-morph-grid
.word-morph-tile
.word-morph-keyboard
.word-morph-row

/* Kinship */
.kinship-container
.kinship-category
.kinship-word-card
.kinship-connection-line

/* Lexicon Smith */
.lexicon-smith-honeycomb
.lexicon-smith-letter-tile
.lexicon-smith-score-anvil

/* Twenty Queries */
.twenty-queries-chat
.twenty-queries-question
.twenty-queries-answer
.twenty-queries-progress

/* Lore Master */
.lore-master-book
.lore-master-page
.lore-master-question
.lore-master-score
```

### Variable and Function Naming

**camelCase for variables and functions:**
```typescript
// Word Morph
const wordMorphGame = new WordMorphGame();
function startWordMorph() { }
function checkWordMorphGuess() { }

// Kinship
const kinshipGame = new KinshipGame();
function startKinship() { }
function checkKinshipGuess() { }

// Lexicon Smith
const lexiconSmithGame = new LexiconSmithGame();
function startLexiconSmith() { }
function checkLexiconSmithGuess() { }

// Twenty Queries
const twentyQueriesGame = new TwentyQueriesGame();
function startTwentyQueries() { }
function checkTwentyQueriesGuess() { }

// Lore Master
const loreMasterGame = new LoreMasterGame();
function startLoreMaster() { }
function checkLoreMasterGuess() { }
```

**PascalCase for classes and components:**
```typescript
// Classes
class WordMorphGame { }
class KinshipGame { }
class LexiconSmithGame { }
class TwentyQueriesGame { }
class LoreMasterGame { }

// React components
export function WordMorph() { }
export function Kinship() { }
export function LexiconSmith() { }
export function TwentyQueries() { }
export function LoreMaster() { }
```

### Resource URIs

**Widget URLs:**
```
ui://widget/word-morph.html
ui://widget/kinship.html
ui://widget/lexicon-smith.html
ui://widget/twenty-queries.html
ui://widget/lore-master.html
```

## 4. UI Text Guidelines

### Display Names

**Always use proper title case with spaces:**
- ✅ "Word Morph"
- ❌ "word-morph", "wordMorph", "WORD MORPH"

### Taglines and Descriptions

**Word Morph:**
- Tagline: "Transform letters, discover words"
- Description: "A unique word transformation puzzle where you guess 5-letter words and receive feedback to guide your next guess."

**Kinship:**
- Tagline: "Discover linguistic relationships"
- Description: "Group words that share a common connection. Find all four categories to win."

**Lexicon Smith:**
- Tagline: "Forge words from letters"
- Description: "Create as many words as possible from a set of letters. Channel your inner wordsmith."

**Twenty Queries:**
- Tagline: "Solve the mystery through questions"
- Description: "Ask up to twenty strategic questions to deduce the hidden word. Use yes/no questions wisely."

**Lore Master:**
- Tagline: "Test your knowledge across all domains"
- Description: "Answer trivia questions across various categories. Prove your mastery of lore."

### System Messages

**Start game messages:**
```typescript
"Starting Word Morph..."
"Launching Kinship..."
"Forging a new Lexicon Smith puzzle..."
"Initiating Twenty Queries investigation..."
"Opening the Lore Master tome..."
```

**Error messages:**
```typescript
"Failed to start Word Morph. Please try again."
"Unable to load Kinship game data."
"Lexicon Smith is temporarily unavailable."
"Twenty Queries could not be initialized."
"Lore Master failed to load questions."
```

**Success messages:**
```typescript
"Word Morph: Correct! You found the word!"
"Kinship: Perfect! All connections found!"
"Lexicon Smith: Excellent word smithing!"
"Twenty Queries: Solved! The word was {word}!"
"Lore Master: Correct answer! Knowledge increased!"
```

**Help text:**
```typescript
"Word Morph: Guess the 5-letter word. Teal = correct position, Coral = wrong position, Slate = not in word."
"Kinship: Select 4 words that share a connection. Find all 4 groups."
"Lexicon Smith: Create words using the available letters. Longer words score more points."
"Twenty Queries: Ask yes/no questions to narrow down the word. You have 20 queries."
"Lore Master: Answer trivia questions correctly to increase your score."
```

## 5. Golden Prompt Testing (CRITICAL)

> **Required for ChatGPT App Store submission and tool discovery validation.**

Golden prompts ensure ChatGPT correctly discovers and invokes your tools. Each game requires three types of prompts:

### 5.1 Direct Prompts (Should Trigger)

Explicit references to the game name - these MUST work:

**Word Morph:**
1. "Let's play Word Morph"
2. "Start a Word Morph game"
3. "I want to play Word Morph"
4. "Show me the Word Morph connector"
5. "Launch Word Morph"

**Kinship:**
1. "Let's play Kinship"
2. "Start a Kinship game"
3. "I want to play the Kinship game"
4. "Show me Kinship"
5. "Launch the Kinship connector"

**Lexicon Smith:**
1. "Let's play Lexicon Smith"
2. "Start Lexicon Smith"
3. "I want to play Lexicon Smith"
4. "Show me the Lexicon Smith connector"
5. "Launch Lexicon Smith"

**Twenty Queries:**
1. "Let's play Twenty Queries"
2. "Start a Twenty Queries game"
3. "I want to play Twenty Queries"
4. "Show me Twenty Queries"
5. "Launch the Twenty Queries connector"

**Lore Master:**
1. "Let's play Lore Master"
2. "Start Lore Master"
3. "I want to play Lore Master trivia"
4. "Show me Lore Master"
5. "Launch the Lore Master connector"

### 5.2 Indirect Prompts (Should Trigger)

Intent-based queries without explicit game name:

**Word Morph:**
1. "I want to play a word guessing game"
2. "Let's play a word transformation puzzle"
3. "I'd like to guess 5-letter words"
4. "Can we play a game where I guess words?"
5. "I want to play something like Wordle but different"

**Kinship:**
1. "I want to group words by category"
2. "Let's play a word connection game"
3. "Help me find relationships between words"
4. "I want to match words that go together"
5. "Can we play a grouping game?"

**Lexicon Smith:**
1. "I want to make words from letters"
2. "Let's play a spelling game"
3. "Help me practice making words"
4. "I want to play a word creation game"
5. "Can I play something where I form words?"

**Twenty Queries:**
1. "Let's play a guessing game"
2. "I want to guess what you're thinking"
3. "Play a question-and-answer game"
4. "Can we play a deduction game?"
5. "I want to ask yes/no questions to find a word"

**Lore Master:**
1. "Let's play trivia"
2. "I want to answer knowledge questions"
3. "Test my knowledge"
4. "Can we do a quiz?"
5. "I want to answer trivia questions"

### 5.3 Negative Prompts (Should NOT Trigger)

Similar queries that should NOT invoke the tool:

**Word Morph:**
1. "Let's play Wordle" (competitor game)
2. "I want to play a word search" (different game type)
3. "Help me with spelling" (different use case)

**Kinship:**
1. "Let's play Connections" (old/competitor name)
2. "Help me organize my files" (different domain)
3. "Can you connect to the database?" (different meaning)

**Lexicon Smith:**
1. "Let's play Spelling Bee" (old/competitor name)
2. "Help me spell a word" (different use case)
3. "Check my spelling" (different use case)

**Twenty Queries:**
1. "Let's play 20 Questions" (old name - consider redirect)
2. "I have questions about Python" (different domain)
3. "Answer my questions" (different use case)

**Lore Master:**
1. "Let's play Trivia Challenge" (old name)
2. "Tell me a fact" (informational, not game)
3. "I need trivia for a party" (different use case)

### 5.4 Tool Description Requirements

Based on golden prompts, tool descriptions must:

1. **Include game name prominently** in title and description
2. **Use trigger phrases** like "Use this when the user wants to..."
3. **Be specific** about game mechanics
4. **Avoid generic terms** that might trigger on unrelated queries
5. **Include examples** of valid prompts in description

**Example Tool Description Pattern:**

```typescript
{
  name: "gamebox.start_word_morph",
  title: "Start Word Morph Game",
  description: "Use this when the user explicitly asks to play Word Morph, use the Word Morph connector, or launch the Word Morph app. This is a word transformation puzzle where users guess 5-letter words and receive feedback (teal = correct position, coral = wrong position, slate = not in word). Do NOT use for general word games, Wordle, or other word-related tasks - only when the user specifically mentions Word Morph or asks to use this connector.",
  inputSchema: {
    type: "object",
    properties: {
      difficulty: {
        type: "string",
        enum: ["easy", "medium", "hard"],
        description: "Game difficulty level"
      }
    }
  },
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    openWorldHint: false
  },
  _meta: {
    "openai/outputTemplate": "ui://widget/word-morph.html",
    "openai/widgetAccessible": true
  }
}
```

### 5.5 Testing Workflow

Golden prompts must be tested via ngrok tunnel before App Store submission:

**Setup:**
```bash
# 1. Start local development server
cd server
npm run dev

# 2. Create ngrok tunnel (in separate terminal)
ngrok http 8000

# 3. Note the ngrok URL (e.g., https://abc123.ngrok.io)
```

**Testing Process:**
1. Open ChatGPT
2. Add connector using ngrok URL
3. Test each game's golden prompt set:
   - ✅ All 5 direct prompts should trigger the tool
   - ✅ All 5 indirect prompts should trigger the tool
   - ❌ All 3 negative prompts should NOT trigger the tool
4. Document results in `/docs/GOLDEN_PROMPT_TEST_RESULTS.md`

**Test Result Format:**
```markdown
# Golden Prompt Test Results

## Word Morph

### Direct Prompts (5/5 passing)
- ✅ "Let's play Word Morph" - Triggered correctly
- ✅ "Start a Word Morph game" - Triggered correctly
- ✅ "I want to play Word Morph" - Triggered correctly
- ✅ "Show me the Word Morph connector" - Triggered correctly
- ✅ "Launch Word Morph" - Triggered correctly

### Indirect Prompts (5/5 passing)
- ✅ "I want to play a word guessing game" - Triggered correctly
- ✅ "Let's play a word transformation puzzle" - Triggered correctly
- (... continue for all prompts)

### Negative Prompts (3/3 passing)
- ✅ "Let's play Wordle" - Did NOT trigger (correct)
- ✅ "I want to play a word search" - Did NOT trigger (correct)
- ✅ "Help me with spelling" - Did NOT trigger (correct)
```

**This testing is REQUIRED before App Store submission.**

## 6. Search Patterns

### Finding Old References

Use these grep commands to find all references to old game names:

**Word Challenge → Word Morph:**
```bash
grep -r "Word Challenge\|word-challenge\|wordChallenge\|WordChallenge" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=dist
```

**Connections → Kinship:**
```bash
# Note: Filter out technical "connections" (network, database)
grep -r "Connections" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=dist | \
  grep -v "network connections" | \
  grep -v "database connections"
```

**Spelling Bee → Lexicon Smith:**
```bash
grep -r "Spelling Bee\|spelling-bee\|spellingBee\|SpellingBee" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=dist
```

**20 Questions → Twenty Queries:**
```bash
grep -r "20 Questions\|twenty-questions\|twentyQuestions" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=dist
```

**Trivia Challenge → Lore Master:**
```bash
grep -r "Trivia Challenge\|trivia-challenge\|triviaChallenge\|TriviaChallenge" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=dist
```

### Validation Commands

**After rebranding, these should return 0 results in code files:**
```bash
# Check for any remaining old names (should be 0 results in *.ts, *.tsx files)
grep -r "Word Challenge" --include="*.ts" --include="*.tsx" server/ web/
grep -r "Connections" --include="*.ts" --include="*.tsx" server/ web/ | grep -v "network\|database"
grep -r "Spelling Bee" --include="*.ts" --include="*.tsx" server/ web/
grep -r "20 Questions" --include="*.ts" --include="*.tsx" server/ web/
grep -r "Trivia Challenge" --include="*.ts" --include="*.tsx" server/ web/
```

## 7. Implementation Sequence

**Critical Path (must be done in order):**

1. **Phase 1: Planning & Design** (#17.1, #17.2, #17.3)
   - Create this specification ✅
   - Audit codebase references
   - Design visual differentiation

2. **Phase 2: Backend Refactoring** (#17.4, #17.5, #17.6, #17.7)
   - Rename backend modules
   - Update MCP tool registrations
   - Update visual design configuration
   - Update backend documentation

3. **Phase 3: Frontend Refactoring** (#17.8, #17.9, #17.10, #17.11)
   - Rename frontend components
   - Implement visual design
   - Update tool integration
   - Update frontend documentation

4. **Phase 4: Testing & Documentation** (#17.12, #17.13, #17.14, #17.15, #17.16)
   - Update E2E tests
   - Regenerate screenshot baselines
   - Update project documentation
   - Verify complete rebranding
   - Create migration guide

## 8. Migration Strategy

### Breaking Changes

**Tool IDs are changing - this is a breaking change:**
- Old connectors will need to be updated
- Document migration in REBRANDING_MIGRATION.md
- Provide clear timeline for deprecation

### Backward Compatibility

**NOT providing backward compatibility:**
- Clean break approach (user decision from planning)
- Reduces technical debt
- Clearer codebase
- Better for long-term maintenance

### Communication Plan

1. **Before rebranding:**
   - Announce upcoming changes
   - Provide timeline
   - Share migration guide

2. **During rebranding:**
   - Create migration guide
   - Document all tool ID changes
   - Provide code examples

3. **After rebranding:**
   - Update all documentation
   - Test golden prompts
   - Monitor for issues

## 9. Verification Checklist

### Code Verification
- [ ] Zero old game name references in code (grep returns 0)
- [ ] All file names updated consistently
- [ ] All CSS classes follow naming pattern
- [ ] All tool IDs updated
- [ ] All resource URIs updated

### Build Verification
- [ ] Backend builds successfully (`npm run build`)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Type checking passes (`npm run type-check`)

### Test Verification
- [ ] All unit tests pass (`npm test`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] Screenshot baselines regenerated
- [ ] Visual regression tests pass

### Runtime Verification
- [ ] Server starts without errors
- [ ] Widgets render correctly
- [ ] New colors visible
- [ ] Tool invocations work
- [ ] No console errors

### Visual Verification
- [ ] Word Morph: Teal/Coral/Slate colors (NOT green/yellow/gray)
- [ ] Word Morph: 8px border radius, 12px spacing
- [ ] Kinship: Radial layout (NOT grid)
- [ ] Lexicon Smith: Anvil theme (NOT honeycomb)
- [ ] Twenty Queries: Chat interface
- [ ] Lore Master: Book/scroll theme

### Documentation Verification
- [ ] README.md updated
- [ ] CONTRIBUTING.md updated
- [ ] All docs/ files updated
- [ ] No broken links
- [ ] Code examples valid

### App Store Compliance Verification
- [ ] Golden prompts tested (direct, indirect, negative)
- [ ] SSE transport implemented
- [ ] Required endpoints present (/.well-known, /privacy, /terms)
- [ ] Tool schemas use JSON Schema format
- [ ] Tool annotations present
- [ ] _meta fields present
- [ ] CORS configured correctly
- [ ] Security headers set

## 10. Success Criteria

**Rebranding is complete when:**

1. ✅ All 5 games renamed across entire codebase
2. ✅ Visual design differentiated from NYT Games
3. ✅ Tool IDs updated with breaking change documented
4. ✅ Zero references to old names in code files
5. ✅ 100% tests passing (unit, E2E, integration)
6. ✅ Documentation complete and accurate
7. ✅ Migration guide published
8. ✅ Golden prompts tested and passing
9. ✅ ChatGPT App Store requirements met
10. ✅ Runtime verification successful

## Appendix A: Color Reference

### Word Morph Palette
```css
--word-morph-correct: #14B8A6;  /* Teal 500 */
--word-morph-present: #F97316;  /* Orange 500 */
--word-morph-absent: #64748B;   /* Slate 500 */
--word-morph-bg: #F8FAFC;       /* Slate 50 */
--word-morph-border: #CBD5E1;   /* Slate 300 */
```

### Kinship Palette
```css
--kinship-cat-1: #8B5CF6;  /* Violet 500 */
--kinship-cat-2: #06B6D4;  /* Cyan 500 */
--kinship-cat-3: #F59E0B;  /* Amber 500 */
--kinship-cat-4: #EC4899;  /* Pink 500 */
--kinship-bg: #FAFAFA;     /* Gray 50 */
--kinship-border: #E5E7EB; /* Gray 200 */
```

### Lexicon Smith Palette
```css
--lexicon-primary: #B45309;   /* Amber 700 */
--lexicon-secondary: #D97706; /* Amber 600 */
--lexicon-accent: #FCD34D;    /* Amber 300 */
--lexicon-bg: #FEF3C7;        /* Amber 100 */
```

### Twenty Queries Palette
```css
--queries-primary: #6366F1;   /* Indigo 500 */
--queries-secondary: #8B5CF6; /* Violet 500 */
--queries-bg: #F9FAFB;        /* Gray 50 */
--queries-accent: #A78BFA;    /* Violet 400 */
```

### Lore Master Palette
```css
--lore-primary: #92400E;   /* Amber 800 */
--lore-secondary: #B45309; /* Amber 700 */
--lore-bg: #FEF3C7;        /* Amber 100 */
--lore-accent: #D97706;    /* Amber 600 */
```

## Appendix B: Accessibility Requirements

All games must meet WCAG AA standards:

### Color Contrast
- Text on background: minimum 4.5:1 ratio
- Large text on background: minimum 3:1 ratio
- UI components: minimum 3:1 ratio

### Keyboard Navigation
- All interactive elements focusable
- Logical tab order
- Visible focus indicators
- Keyboard shortcuts documented

### Screen Readers
- Semantic HTML
- ARIA labels for custom components
- Live regions for dynamic content
- Skip links for navigation

### Reduced Motion
- Respect prefers-reduced-motion
- Disable animations when requested
- Provide static alternatives

---

**Document Version:** 1.0
**Last Updated:** 2026-01-19
**Next Review:** After Phase 1 completion
**Owner:** Epic #17 Implementation Team
