# Issue #17.1: Create Rebranding Specification

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 1 - Planning & Design
**Duration:** 1 hour
**Priority:** Critical
**Dependencies:** None

## Description

Create a comprehensive rebranding specification document that defines naming conventions, visual design requirements, identifier patterns, and search patterns for all 5 games.

## Objectives

- Document all name mappings (old → new) for all 5 games
- Define visual design specifications (colors, icons, layouts)
- Establish identifier patterns (tool names, file names, CSS classes)
- Create UI text guidelines
- Provide search patterns for finding references

## Deliverable

Create `/docs/REBRANDING_SPEC.md` with the following sections:

### 1. Name Mappings

| Current Name | New Name | Theme | Tool ID Pattern |
|--------------|----------|-------|----------------|
| Word Challenge | Word Morph | Transformation puzzle | `word-morph` |
| Connections | Kinship | Linguistic relationships | `kinship` |
| Spelling Bee | Lexicon Smith | Medieval forge | `lexicon-smith` |
| 20 Questions | Twenty Queries | AI investigation | `twenty-queries` |
| Trivia Challenge | Lore Master | Knowledge keeper | `lore-master` |

### 2. Visual Design Specifications

**Word Morph:**
- Colors: Teal (#14B8A6), Coral (#F97316), Slate (#64748B)
- Layout: Horizontal flow (not vertical grid)
- Grid: 4×7 or 3×8 (NOT 5×6)

**Kinship:**
- Layout: Radial/circular (not grid-based)
- Colors: TBD in design phase

**Lexicon Smith:**
- Theme: Medieval forge (anvil icon)
- Colors: Bronze/gold tones

**Twenty Queries:**
- Layout: Conversation bubble interface
- Colors: TBD

**Lore Master:**
- Theme: Book/scroll interface
- Colors: Parchment tones

### 3. Identifier Patterns

**File naming:**
- Backend: `wordMorph.ts`, `kinship.ts`, `lexiconSmith.ts`, `twentyQueries.ts`, `loreMaster.ts`
- Frontend: `WordMorph.tsx`, `Kinship.tsx`, `LexiconSmith.tsx`, `TwentyQueries.tsx`, `LoreMaster.tsx`
- Tests: `wordMorph.spec.ts`, etc.

**CSS classes:**
- `.word-morph-*`, `.kinship-*`, `.lexicon-smith-*`, `.twenty-queries-*`, `.lore-master-*`

**Tool IDs:**
- `gamebox.start_word_morph`, `gamebox.check_word_morph_guess`
- `gamebox.start_kinship`, `gamebox.check_kinship_guess`
- `gamebox.start_lexicon_smith`, `gamebox.check_lexicon_smith_guess`
- `gamebox.start_twenty_queries`, `gamebox.check_twenty_queries_guess`
- `gamebox.start_lore_master`, `gamebox.check_lore_master_guess`

### 4. UI Text Guidelines

- Display names: "Word Morph", "Kinship", "Lexicon Smith", "Twenty Queries", "Lore Master"
- Taglines/descriptions for each game
- Error messages
- Success messages
- Help text

### 5. Golden Prompt Testing (CRITICAL - Added from Agent Review)

**Required for ChatGPT App Store submission and tool discovery testing.**

Golden prompts validate that ChatGPT correctly discovers and invokes your tools. Each game must have:

#### 5.1 Direct Prompts (Should Trigger)
Explicit references to the game name:

**Word Morph:**
- "Let's play Word Morph"
- "Start a Word Morph game"
- "I want to play Word Morph"
- "Show me the Word Morph connector"
- "Launch Word Morph"

**Kinship:**
- "Let's play Kinship"
- "Start a Kinship game"
- "I want to play the Kinship game"

**Lexicon Smith:**
- "Let's play Lexicon Smith"
- "Start Lexicon Smith"
- "I want to play Lexicon Smith"

**Twenty Queries:**
- "Let's play Twenty Queries"
- "Start a Twenty Queries game"
- "I want to play Twenty Queries"

**Lore Master:**
- "Let's play Lore Master"
- "Start Lore Master"
- "I want to play Lore Master trivia"

#### 5.2 Indirect Prompts (Should Trigger)
Intent-based queries without explicit game name:

**Word Morph:**
- "I want to play a word guessing game"
- "Let's play a word transformation puzzle"
- "I'd like to guess 5-letter words"

**Kinship:**
- "I want to group words by category"
- "Let's play a word connection game"
- "Help me find relationships between words"

**Lexicon Smith:**
- "I want to make words from letters"
- "Let's play a spelling game"
- "Help me practice making words"

**Twenty Queries:**
- "Let's play a guessing game"
- "I want to guess what you're thinking"
- "Play a question-and-answer game"

**Lore Master:**
- "Let's play trivia"
- "I want to answer knowledge questions"
- "Test my knowledge"

#### 5.3 Negative Prompts (Should NOT Trigger)
Similar queries that should NOT invoke the tool:

**Word Morph:**
- "Let's play Wordle" (competitor game)
- "I want to play a word search" (different game type)
- "Help me with spelling" (different use case)

**Kinship:**
- "Let's play Connections" (old/competitor name)
- "Help me organize my files" (different domain)

**Lexicon Smith:**
- "Let's play Spelling Bee" (old/competitor name)
- "Help me spell a word" (different use case)

**Twenty Queries:**
- "Let's play 20 Questions" (old name - should still work but redirect?)
- "I have questions about Python" (different domain)

**Lore Master:**
- "Let's play Trivia Challenge" (old name)
- "Tell me a fact" (informational, not game)

#### 5.4 Tool Description Requirements

Based on golden prompts, tool descriptions must:

1. **Include game name** prominently in title and description
2. **Use trigger phrases** like "Use this when the user wants to..."
3. **Be specific** about game mechanics
4. **Avoid generic terms** that might trigger on unrelated queries
5. **Include examples** of valid prompts in description

**Example tool description pattern:**

```typescript
{
  name: "gamebox.start_word_morph",
  title: "Start Word Morph Game",
  description: "Use this when the user explicitly asks to play Word Morph, use the Word Morph connector, or launch the Word Morph app. This is a word transformation puzzle where users guess 5-letter words. Do NOT use for general word games - only when the user specifically mentions Word Morph or asks to use this connector.",
  // ...
}
```

#### 5.5 Testing Workflow

Golden prompts must be tested via ngrok tunnel:

1. Start local server: `npm run dev`
2. Create ngrok tunnel: `ngrok http 8000`
3. Add connector in ChatGPT with ngrok URL
4. Test each golden prompt set:
   - ✅ All direct prompts trigger the tool
   - ✅ All indirect prompts trigger the tool
   - ❌ All negative prompts do NOT trigger
5. Document results in testing report

**This testing is REQUIRED before App Store submission.**

### 6. Search Patterns

Grep commands to find all references:

```bash
# Word Challenge → Word Morph
grep -r "Word Challenge\|word-challenge\|wordChallenge\|WordChallenge" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json"

# Connections → Kinship
grep -r "Connections\|connections" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json"

# Spelling Bee → Lexicon Smith
grep -r "Spelling Bee\|spelling-bee\|spellingBee\|SpellingBee" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json"

# 20 Questions → Twenty Queries
grep -r "20 Questions\|twenty-questions\|twentyQuestions" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json"

# Trivia Challenge → Lore Master
grep -r "Trivia Challenge\|trivia-challenge\|triviaChallenge\|TriviaChallenge" \
  --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json"
```

## Acceptance Criteria

- [ ] `/docs/REBRANDING_SPEC.md` created
- [ ] All 5 games have complete name mappings
- [ ] Visual design specs documented for all games
- [ ] Identifier patterns defined consistently
- [ ] Search patterns tested and validated
- [ ] **Golden prompt sets defined for all 5 games** (CRITICAL - App Store requirement)
- [ ] **Direct prompts (5 per game)** - explicit game name mentions
- [ ] **Indirect prompts (5 per game)** - intent-based discovery
- [ ] **Negative prompts (3 per game)** - should NOT trigger
- [ ] **Tool description patterns** documented for optimal discovery
- [ ] **Testing workflow** defined for ngrok-based validation
- [ ] Document reviewed and approved

## Implementation Notes

- This document serves as the single source of truth for all rebranding decisions
- All subsequent tasks should reference this specification
- Keep patterns consistent across all games

## Labels

- `phase-1-planning`
- `documentation`
- `critical`
- `epic-17`
