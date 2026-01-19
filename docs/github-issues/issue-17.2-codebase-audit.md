# Issue #17.2: Audit Codebase References

**Parent Epic:** #17 - Legal Safety Game Rebranding
**Phase:** 1 - Planning & Design
**Duration:** 1.5 hours
**Priority:** Critical
**Dependencies:** #17.1

## Description

Perform a comprehensive audit of the entire codebase to identify all references to the 5 game names. Document every file with references, categorize by type, and prioritize implementation order.

## Objectives

- Search codebase for all old game name references
- Document every affected file
- Categorize files by type (code, test, docs, config)
- Estimate impact for each file
- Establish implementation priority order

## Deliverable

Create `/docs/REBRANDING_AUDIT.md` with the following structure:

### 1. Executive Summary

- Total files affected
- Breakdown by game
- Breakdown by file type
- Estimated total changes

### 2. Word Challenge → Word Morph

**Backend Files:**
- `/server/src/games/wordChallenge.ts` (250 lines) - 🔴 High impact
- `/server/src/games/wordChallenge.test.ts` - 🔴 High impact
- `/server/src/index.ts` (tool registrations) - 🔴 Critical
- `/server/src/data/wordLists.ts` (imports) - 🟡 Medium
- `/server/src/data/streaks.ts` (comments) - 🟢 Low

**Frontend Files:**
- `/web/src/widgets/WordChallenge.tsx` (592 lines) - 🔴 Critical
- `/web/src/widgets/WordChallenge.test.tsx` - 🔴 High impact
- `/web/src/main.tsx` (imports) - 🔴 High impact
- `/web/src/styles/globals.css` (CSS classes) - 🟡 Medium
- `/web/src/hooks/*.ts` (tool IDs) - 🟡 Medium

**Test Files:**
- `/e2e/word-challenge.spec.ts` (11,366 lines) - 🔴 Critical
- `/e2e/widget-ui.spec.ts` - 🔴 High impact
- `/e2e/widget-screenshots.spec.ts` - 🟡 Medium
- `/testing/**/*` (screenshots, docs) - 🟢 Low

**Documentation Files:**
- `/README.md` - 🔴 High visibility
- `/CONTRIBUTING.md` - 🔴 High visibility
- `/docs/TECHNICAL_REVIEW.md` - 🟡 Medium
- `/docs/TESTING_GUIDE.md` - 🟡 Medium
- `/docs/DESIGN_REQUIREMENTS.md` - 🟡 Medium
- `/docs/TECHNICAL_SPIKE_SUMMARY.md` - 🟢 Low
- `/docs/ANIMATION_STORYBOARD.md` - 🟢 Low
- All files in `/testing/` directory - 🟢 Low

**Configuration Files:**
- `/package.json` - 🟢 Low (if any references)
- `/tsconfig.json` - 🟢 Low (if any references)
- `/vite.config.ts` - 🟢 Low (if any references)

### 3. Connections → Kinship

**References:**
- `/server/src/index.ts` (game menu) - 🟡 Medium
- `/README.md` - 🟡 Medium
- `/CONTRIBUTING.md` - 🟡 Medium

(Minimal impact - not yet implemented)

### 4. Spelling Bee → Lexicon Smith

**References:**
- `/server/src/index.ts` (game menu) - 🟡 Medium
- `/README.md` - 🟡 Medium
- `/CONTRIBUTING.md` - 🟡 Medium

(Minimal impact - not yet implemented)

### 5. 20 Questions → Twenty Queries

**References:**
- `/server/src/index.ts` (game menu) - 🟡 Medium
- `/README.md` - 🟡 Medium
- `/CONTRIBUTING.md` - 🟡 Medium

(Minimal impact - not yet implemented)

### 6. Trivia Challenge → Lore Master

**References:**
- `/server/src/index.ts` (game menu) - 🟡 Medium
- `/README.md` - 🟡 Medium
- `/CONTRIBUTING.md` - 🟡 Medium

(Minimal impact - not yet implemented)

### 7. Implementation Priority

**Critical Path (must be done first):**
1. `/server/src/index.ts` - All tool registrations and game menu
2. `/server/src/games/wordChallenge.ts` - Core game logic
3. `/web/src/widgets/WordChallenge.tsx` - Primary UI component
4. `/e2e/word-challenge.spec.ts` - Test coverage

**High Priority (blocking for tests):**
5. Backend test files
6. Frontend test files
7. E2E test files
8. Frontend hooks and integration

**Medium Priority (documentation):**
9. Main documentation files (README, CONTRIBUTING)
10. Technical documentation
11. Frontend CSS and styling

**Low Priority (polish):**
12. Testing directory documentation
13. Screenshot files
14. Configuration files

### 8. Search Commands Used

Document the exact commands used to find references:

```bash
# Word Challenge references
grep -rn "Word Challenge" --include="*.ts" --include="*.tsx" --include="*.md"
grep -rn "word-challenge" --include="*.ts" --include="*.tsx" --include="*.md"
grep -rn "wordChallenge" --include="*.ts" --include="*.tsx" --include="*.md"
grep -rn "WordChallenge" --include="*.ts" --include="*.tsx" --include="*.md"

# Repeat for all 5 games...
```

### 9. Risk Assessment

- Files with high line counts (>500 lines)
- Files with complex logic
- Files with many dependencies
- Files that affect multiple systems

## Acceptance Criteria

- [ ] `/docs/REBRANDING_AUDIT.md` created
- [ ] All game references found and documented
- [ ] Every affected file categorized by impact
- [ ] Implementation priority order established
- [ ] Search commands documented for reproducibility
- [ ] Risk assessment completed

## Implementation Notes

- Use the search patterns from #17.1
- Document line numbers for easy reference
- Include file sizes in audit
- Note any unexpected or hidden references

## Labels

- `phase-1-planning`
- `documentation`
- `critical`
- `epic-17`
