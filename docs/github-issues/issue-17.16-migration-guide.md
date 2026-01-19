# Issue #17.16: Create Migration Guide

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 4 - Testing & Documentation
**Duration:** 1.5 hours
**Priority:** High
**Dependencies:** #17.15

## Description

Create a comprehensive migration guide documenting all breaking changes from the rebranding effort. This guide helps users, developers, and ChatGPT integrators update their code to work with the new game names and tool IDs.

## Objectives

- Document all breaking changes
- Provide clear migration steps
- Include code examples showing before/after
- Address common issues
- Create FAQ section
- Document timeline

## Deliverable

Create `/docs/REBRANDING_MIGRATION.md`

## Content Structure

### 1. Executive Summary

```markdown
# GameBox Rebranding Migration Guide

## Overview

GameBox has undergone comprehensive rebranding for legal safety and trademark compliance. All 5 games have been renamed to ensure clear differentiation from NYT Games.

**Effective Date:** [Date]
**Epic:** #17 - Legal Safety Game Rebranding
**Impact:** Breaking changes to tool IDs, widget URIs, and visual design

## Quick Reference

| Old Name | New Name | Status |
|----------|----------|--------|
| Word Challenge | Word Morph | ✅ Implemented |
| Connections | Kinship | 🔜 Coming Soon |
| Spelling Bee | Lexicon Smith | 🔜 Coming Soon |
| 20 Questions | Twenty Queries | 🔜 Coming Soon |
| Trivia Challenge | Lore Master | 🔜 Coming Soon |

## Why the Rebranding?

**Legal Safety:** Ensure GameBox games are legally distinct from NYT Games:
- Avoid trademark conflicts
- Create unique visual identities
- Establish original branding

**What Changed:**
- Game names
- MCP tool IDs
- Widget resource URIs
- Visual designs (colors, layouts)
- Component names (for developers)
```

### 2. Breaking Changes

```markdown
## Breaking Changes

### Tool IDs

#### Word Morph (formerly Word Challenge)

**Tool ID Changes:**

| Old Tool ID | New Tool ID | Status |
|-------------|-------------|--------|
| `gamebox.start_word_challenge` | `gamebox.start_word_morph` | ❌ Old removed |
| `gamebox.check_word_guess` | `gamebox.check_word_morph_guess` | ❌ Old removed |

**Before:**
```json
{
  "name": "gamebox.start_word_challenge",
  "arguments": { "difficulty": "medium" }
}
```

**After:**
```json
{
  "name": "gamebox.start_word_morph",
  "arguments": { "difficulty": "medium" }
}
```

**Impact:** Any code or ChatGPT integrations using old tool IDs will break.

### Widget Resource URIs

**Before:**
```
ui://widget/word-challenge.html
```

**After:**
```
ui://widget/word-morph.html
```

**Impact:** Widget loading code must be updated.

### Visual Design Changes

**Color Scheme:**

| Element | Old Color | New Color |
|---------|-----------|-----------|
| Correct | Green #6AAA64 | Teal #14B8A6 |
| Present | Yellow #C9B458 | Coral #F97316 |
| Absent | Gray #787C7E | Slate #64748B |

**Impact:** Screenshot tests, color-based logic, visual documentation.

**Layout Changes:**
- Border radius: 4px → 8px
- Tile spacing: 5px → 12px
- Animation timing: 250ms → 150ms

### Component Names (Developers Only)

**Frontend Components:**
```typescript
// Before
import { WordChallenge } from './widgets/WordChallenge';

// After
import { WordMorph } from './widgets/WordMorph';
```

**Backend Classes:**
```typescript
// Before
import { WordChallengeGame } from './games/wordChallenge';

// After
import { WordMorphGame } from './games/wordMorph';
```

**Impact:** Developers extending GameBox must update imports.
```

### 3. Migration Steps

```markdown
## Migration Steps

### For ChatGPT Users

**No action required** for casual players. ChatGPT will automatically use the new tool IDs.

**If you have custom GPTs:**
1. Update any hard-coded tool references
2. Replace `gamebox.start_word_challenge` with `gamebox.start_word_morph`
3. Replace `gamebox.check_word_guess` with `gamebox.check_word_morph_guess`
4. Test your custom GPT

### For MCP Client Developers

**Step 1: Update Tool Invocations**

```typescript
// Before
const result = await mcpClient.callTool({
  name: 'gamebox.start_word_challenge',
  arguments: { difficulty: 'medium' }
});

// After
const result = await mcpClient.callTool({
  name: 'gamebox.start_word_morph',
  arguments: { difficulty: 'medium' }
});
```

**Step 2: Update Resource Requests**

```typescript
// Before
const widget = await mcpClient.readResource({
  uri: 'ui://widget/word-challenge.html'
});

// After
const widget = await mcpClient.readResource({
  uri: 'ui://widget/word-morph.html'
});
```

**Step 3: Update Error Handling**

```typescript
// Update error messages
if (error.message.includes('Word Challenge')) {
  // Update to check for 'Word Morph'
}
```

**Step 4: Test Integration**

1. Start GameBox MCP server
2. Invoke `gamebox.start_word_morph`
3. Verify response
4. Test widget loading
5. Verify visual appearance

### For GameBox Contributors

**Step 1: Pull Latest Changes**

```bash
git checkout master
git pull origin master
```

**Step 2: Update Dependencies**

```bash
npm install
```

**Step 3: Rebuild Everything**

```bash
# Backend
cd server && npm run build

# Frontend
cd web && npm run build
```

**Step 4: Run Tests**

```bash
npm test
npm run test:e2e
```

**Step 5: Update Your Code**

If you have local branches or custom code:
- Update all tool ID references
- Update component imports
- Update CSS class names
- Update test selectors
- Regenerate screenshot baselines if needed

### For Documentation Writers

**Step 1: Update Game Names**

Replace in all documentation:
- Word Challenge → Word Morph
- Connections → Kinship
- Spelling Bee → Lexicon Smith
- 20 Questions → Twenty Queries
- Trivia Challenge → Lore Master

**Step 2: Update Tool Examples**

Update all MCP tool examples to use new IDs.

**Step 3: Update Screenshots**

Replace screenshots showing old branding with new ones.
```

### 4. Visual Changes

```markdown
## Visual Design Changes

### Word Morph

**Legal Requirement:** Differentiate from Wordle's visual identity

#### Color Palette

**Before (Wordle-like):**
- ✅ Correct: Green #6AAA64
- ⚠️ Present: Yellow #C9B458
- ❌ Absent: Gray #787C7E

**After (Unique):**
- ✅ Correct: Teal #14B8A6
- ⚠️ Present: Coral #F97316
- ❌ Absent: Slate #64748B

#### Layout Differences

| Property | Before | After | Reason |
|----------|--------|-------|--------|
| Border radius | 4px | 8px | More distinctive shape |
| Tile spacing | 5px | 12px | Wider, more spacious |
| Animation | 250ms | 150ms | Snappier feel |
| Grid size | 5×6 | 4×7 | Different dimensions |

#### Screenshots Comparison

[Include before/after screenshots]

### Future Game Designs

- **Kinship:** Radial layout (not grid)
- **Lexicon Smith:** Medieval forge theme
- **Twenty Queries:** Conversation bubbles
- **Lore Master:** Book/scroll interface
```

### 5. Backwards Compatibility

```markdown
## Backwards Compatibility

### No Backward Compatibility

**Important:** This is a clean break. Old tool IDs are NOT supported.

**Removed:**
- ❌ `gamebox.start_word_challenge`
- ❌ `gamebox.check_word_guess`
- ❌ `ui://widget/word-challenge.html`

**Why no compatibility layer?**
1. Legal clarity - clean separation from old names
2. Simpler codebase - no dual naming
3. Clear migration path - all or nothing

### Data Migration

**User Progress:**
- Existing streak data migrated automatically
- Game statistics preserved
- User preferences retained

**Configuration:**
- No configuration changes needed
- Settings carry over

**Storage Keys:**
Local storage keys have changed:
```typescript
// Before
localStorage.getItem('gamebox-word-challenge-state')

// After
localStorage.getItem('gamebox-word-morph-state')
```

Users may lose their in-progress game (one-time).
```

### 6. Troubleshooting

```markdown
## Troubleshooting

### "Tool not found" Error

**Symptom:** Error message "Tool 'gamebox.start_word_challenge' not found"

**Cause:** Using old tool ID

**Solution:**
```typescript
// ❌ Don't use
gamebox.start_word_challenge

// ✅ Use instead
gamebox.start_word_morph
```

### "Widget not loading" Error

**Symptom:** Widget resource not found

**Cause:** Using old widget URI

**Solution:**
```typescript
// ❌ Don't use
ui://widget/word-challenge.html

// ✅ Use instead
ui://widget/word-morph.html
```

### "Import not found" Error (Developers)

**Symptom:** TypeScript error: Cannot find module './widgets/WordChallenge'

**Cause:** Component renamed

**Solution:**
```typescript
// ❌ Don't use
import { WordChallenge } from './widgets/WordChallenge';

// ✅ Use instead
import { WordMorph } from './widgets/WordMorph';
```

### Visual Tests Failing

**Symptom:** Screenshot tests fail after update

**Cause:** Visual design changed (colors, spacing)

**Solution:**
```bash
# Regenerate screenshot baselines
npm run test:e2e -- --update-snapshots
```

### Cached Old Version

**Symptom:** Still seeing "Word Challenge" in UI

**Cause:** Browser cache or old build

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Rebuild frontend: `npm run build`
4. Restart development server
```

### 7. FAQ

```markdown
## Frequently Asked Questions

### General

**Q: Why did the names change?**
A: Legal safety and trademark compliance. We want to ensure GameBox games are clearly differentiated from NYT Games.

**Q: Will old tool IDs still work?**
A: No. This is a clean break with no backward compatibility.

**Q: Do I need to update my code?**
A: Yes, if you directly invoke MCP tools or reference game names.

**Q: When do these changes take effect?**
A: [Date]. After this date, old tool IDs will not work.

### For Users

**Q: Will I lose my game progress?**
A: Streaks and statistics are preserved. In-progress games may be lost (one-time).

**Q: Do I need to do anything?**
A: Not if you're just playing through ChatGPT. The changes are automatic.

**Q: Why do the colors look different?**
A: Legal requirement to differentiate from Wordle. We now use teal/coral/slate instead of green/yellow/gray.

### For Developers

**Q: How do I update my integration?**
A: Follow the migration steps above. Update tool IDs and widget URIs.

**Q: Are the tool parameters the same?**
A: Yes. Only the tool IDs changed, not the parameters or responses.

**Q: Do I need to update my tests?**
A: Yes. Update test expectations for new names, tool IDs, and colors.

**Q: How do I regenerate screenshots?**
A: Run `npm run test:e2e -- --update-snapshots`

### Technical

**Q: Can I use both old and new IDs during transition?**
A: No. This is a clean break for legal clarity.

**Q: Are there any breaking changes to the API?**
A: Only the tool IDs and widget URIs. Parameters and responses are unchanged.

**Q: What about future games?**
A: All 5 games have been renamed. Future games will use the new naming pattern.
```

### 8. Timeline

```markdown
## Timeline

| Date | Event |
|------|-------|
| [Date] | Rebranding announced (Epic #17 created) |
| [Date] | Implementation started |
| [Date] | Backend changes complete |
| [Date] | Frontend changes complete |
| [Date] | Testing complete |
| [Date] | Migration guide published (this document) |
| [Date] | **Breaking changes take effect** |
| [Date+] | Old tool IDs no longer work |

## Support

**Questions?** Open a GitHub issue: https://github.com/[org]/gamebox/issues

**Found a bug?** Report it: https://github.com/[org]/gamebox/issues/new

**Need help migrating?** See troubleshooting section above
```

### 9. Reference Tables

```markdown
## Reference Tables

### Complete Name Mapping

| Old Name | New Name | Tool ID Pattern | Status |
|----------|----------|-----------------|--------|
| Word Challenge | Word Morph | `word-morph` | ✅ Live |
| Connections | Kinship | `kinship` | 🔜 Soon |
| Spelling Bee | Lexicon Smith | `lexicon-smith` | 🔜 Soon |
| 20 Questions | Twenty Queries | `twenty-queries` | 🔜 Soon |
| Trivia Challenge | Lore Master | `lore-master` | 🔜 Soon |

### Complete Tool ID Mapping

| Old Tool ID | New Tool ID | Parameters Changed? |
|-------------|-------------|---------------------|
| `gamebox.start_word_challenge` | `gamebox.start_word_morph` | No |
| `gamebox.check_word_guess` | `gamebox.check_word_morph_guess` | No |

### Widget URI Mapping

| Old URI | New URI |
|---------|---------|
| `ui://widget/word-challenge.html` | `ui://widget/word-morph.html` |

### Color Mapping

| Purpose | Old Color | New Color | Hex |
|---------|-----------|-----------|-----|
| Correct position | Green | Teal | #14B8A6 |
| Present in word | Yellow | Coral | #F97316 |
| Not in word | Gray | Slate | #64748B |
```

## Acceptance Criteria

- [ ] Migration guide created: `/docs/REBRANDING_MIGRATION.md`
- [ ] Executive summary written
- [ ] Breaking changes documented with examples
- [ ] Migration steps provided for all user types
- [ ] Visual changes documented with comparison
- [ ] Backwards compatibility (lack thereof) explained
- [ ] Troubleshooting section complete
- [ ] FAQ section complete
- [ ] Timeline documented
- [ ] Reference tables complete
- [ ] All code examples tested
- [ ] Guide reviewed for clarity
- [ ] Guide reviewed for accuracy

## Implementation Checklist

- [ ] Create `/docs/REBRANDING_MIGRATION.md`
- [ ] Write executive summary
- [ ] Document breaking changes
- [ ] Create before/after code examples
- [ ] Write migration steps
  - [ ] For ChatGPT users
  - [ ] For MCP developers
  - [ ] For contributors
  - [ ] For documentation writers
- [ ] Document visual changes
- [ ] Explain backwards compatibility policy
- [ ] Write troubleshooting section
- [ ] Write FAQ section
- [ ] Document timeline
- [ ] Create reference tables
- [ ] Test all code examples
- [ ] Review for clarity
- [ ] Review for accuracy
- [ ] Add to README.md with link

## Code Example Testing

**Verify all code examples work:**

```bash
# Test tool invocation examples
# Test widget URI examples
# Test component import examples
# Test CSS class examples
```

All examples must be copy-pasteable and functional.

## Related Tasks

- **Depends on:** #17.15 (Final verification must be complete)
- **Related:** All other tasks in Epic #17
- **Blocks:** None (this is the final task)

## Labels

- `phase-4-testing`
- `documentation`
- `migration`
- `high-priority`
- `epic-17`
- `user-facing`
