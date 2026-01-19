# Epic #17: Legal Safety Game Rebranding

## Overview

Comprehensive rebranding of all 5 games in GameBox to ensure legal safety and avoid trademark conflicts with NYT Games. This Epic includes renaming games, updating visual designs, refactoring code, and creating migration documentation.

## Legal Risk Summary

| Game | Current Name | Legal Risk | New Name | Theme |
|------|--------------|------------|----------|-------|
| 1 | Word Challenge | 🟡 Medium (Wordle similarity) | Word Morph | Transformation puzzle |
| 2 | Connections | 🔴 High (NYT trademark) | Kinship | Linguistic relationships |
| 3 | Spelling Bee | 🔴 High (NYT trademark) | Lexicon Smith | Medieval forge |
| 4 | 20 Questions | 🟢 Low | Twenty Queries | AI-powered investigation |
| 5 | Trivia Challenge | 🟢 Low | Lore Master | Narrative knowledge keeper |

## Strategic Decisions

- ✅ Rename all 5 games (comprehensive approach)
- ✅ Include visual design changes in this Epic
- ✅ Clean break on tool IDs (document migration, no backward compatibility)

## Scope

### Currently Implemented
- **Word Challenge only** (~40 files affected)
  - Backend: game logic, MCP tools, word lists, streaks
  - Frontend: React widget component
  - Tests: Unit, integration, E2E
  - Documentation: 15+ markdown files

### Not Yet Implemented (Menu Only)
- Connections, Spelling Bee, 20 Questions, Trivia Challenge
- Only references in: game menu, README.md, CONTRIBUTING.md

## Implementation Phases

### Phase 1: Planning & Design
- #17.1 - Create Rebranding Specification
- #17.2 - Audit Codebase References
- #17.3 - Design Visual Differentiation

### Phase 2: Backend Refactoring
- #17.4 - Rename Word Morph Backend Module
- #17.5 - Update MCP Tool Registrations
- #17.6 - Update Visual Design - Backend
- #17.7 - Update Backend Documentation

### Phase 3: Frontend Refactoring
- #17.8 - Rename Word Morph Widget
- #17.9 - Implement Visual Design - Frontend
- #17.10 - Update Frontend Tool Integration
- #17.11 - Update Frontend Documentation

### Phase 4: Apps SDK Compliance (CRITICAL)
- #17.17 - Add Dark Mode Support (CRITICAL - blocks App Store)
- #17.18 - Implement Widget State Persistence (CRITICAL - blocks App Store)
- #17.19 - Integrate Apps SDK UI Design System (HIGH - strongly recommended)
- #17.20 - Add Picture-in-Picture Mode (MEDIUM - recommended enhancement)

### Phase 5: Testing & Documentation
- #17.12 - Update E2E Tests
- #17.13 - Update Screenshot Baselines
- #17.14 - Update Project Documentation
- #17.15 - Verify Complete Rebranding
- #17.16 - Create Migration Guide

## Critical Files

The 5 most critical files requiring changes:

1. **`/server/src/index.ts`** (432 lines) - All MCP tool registrations, game menu
2. **`/server/src/games/wordChallenge.ts`** (250 lines) - Core game logic
3. **`/web/src/widgets/WordChallenge.tsx`** (592 lines) - Primary UI component
4. **`/README.md`** (208 lines) - Project branding
5. **`/e2e/word-challenge.spec.ts`** (11,366 lines) - Comprehensive E2E tests

## Success Criteria

- [ ] All 5 games renamed across codebase
- [ ] Visual design differentiated from NYT (new colors, layouts)
- [ ] Tool IDs updated (breaking change documented)
- [ ] Zero references to old names in code
- [ ] **Dark mode support implemented (CRITICAL for App Store)**
- [ ] **Widget state persistence via window.openai API (CRITICAL)**
- [ ] **Apps SDK UI design system integrated (recommended)**
- [ ] **Picture-in-Picture mode support (recommended)**
- [ ] 100% tests passing
- [ ] Documentation complete and accurate
- [ ] Migration guide published
- [ ] **Ready for ChatGPT App Store submission**

## Timeline

- **Estimated Total:** 34-42 hours
- **20 tasks** (16 original + 4 Apps SDK compliance)
- Rebranding: 24-28 hours
- Apps SDK Compliance: 10-14 hours
- Clear acceptance criteria for each task

### Critical Path Dependencies
- Phase 4 (Apps SDK) can be done in parallel with Phases 2-3
- Dark mode (#17.17) should be done before or alongside visual design (#17.9)
- Widget state (#17.18) should be done early to enable proper testing

## Apps SDK Compliance Requirements

### CRITICAL (Blocks App Store Submission)

**#17.17 - Dark Mode Support**
- Install `@openai/apps-sdk-ui` design system
- Replace fixed colors with theme-aware tokens
- Support both light and dark themes automatically
- **Why critical:** All ChatGPT apps MUST support both themes to pass review

**#17.18 - Widget State Persistence**
- Implement `window.openai.setWidgetState()` for state persistence
- Hydrate state from `window.openai.widgetState` on load
- Enable agent to see and reference game state
- **Why critical:** Required for proper widget functionality and agent awareness

### HIGH Priority (Strongly Recommended)

**#17.19 - Apps SDK UI Integration**
- Replace custom components with official Apps SDK components
- Use Button, Card, Stack, Heading, Text, Alert components
- Leverage design tokens for consistent styling
- **Why important:** Higher App Store approval chances, built-in accessibility

### MEDIUM Priority (Recommended Enhancement)

**#17.20 - Picture-in-Picture Mode**
- Implement `window.openai.requestDisplayMode()` API
- Allow game to stay visible while chatting with agent
- Perfect for clue-based gameplay
- **Why recommended:** Significantly better UX for conversational games

## Risk Mitigation

**Tool ID Breaking Changes:**
- Clean break approach (user choice)
- Comprehensive migration guide
- Clear communication in docs

**Visual Design Changes:**
- Screenshot baselines regenerated
- Visual regression tests updated
- Manual review of design consistency

## Labels

- `epic`
- `legal-safety`
- `rebranding`
- `breaking-change`
- `high-priority`

## Related

- Epic #4 - Project Board 4 (Ralph Loop)
- Design Requirements
- MCP Server SDK compliance
- `/docs/APPS_SDK_COMPLIANCE_ANALYSIS.md` - Complete Apps SDK gap analysis
- `/docs/CRYPTIC_CLUES_TASKS.md` - Uses window.openai API patterns
- [OpenAI Apps SDK Documentation](https://developers.openai.com/apps-sdk)
- [Apps SDK UI Design System](https://github.com/openai/apps-sdk-ui)
