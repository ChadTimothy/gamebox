# Epic #17: Legal Safety Game Rebranding - Issue Summary

## Overview

This document provides a quick reference for all issues in Epic #17.

**Total Issues**: 21 (1 Epic + 20 Tasks)
**Estimated Duration**: 34-42 hours (24-28 rebranding + 10-14 Apps SDK)
**Status**: Issues created, ready for implementation

## File Locations

All issue templates are located in `/docs/github-issues/`:

### Epic Main Issue
- `epic-17-main.md` - Main Epic tracking issue

### Phase 1: Planning & Design (3 tasks)
- `issue-17.1-rebranding-spec.md` - Create Rebranding Specification
- `issue-17.2-codebase-audit.md` - Audit Codebase References
- `issue-17.3-visual-design.md` - Design Visual Differentiation

### Phase 2: Backend Refactoring (4 tasks)
- `issue-17.4-backend-module-rename.md` - Rename Word Morph Backend Module
- `issue-17.5-mcp-tools-update.md` - Update MCP Tool Registrations
- `issue-17.6-backend-visual-design.md` - Update Visual Design - Backend
- `issue-17.7-backend-documentation.md` - Update Backend Documentation

### Phase 3: Frontend Refactoring (4 tasks)
- `issue-17.8-frontend-widget-rename.md` - Rename Word Morph Widget
- `issue-17.9-frontend-visual-design.md` - Implement Visual Design - Frontend
- `issue-17.10-frontend-tool-integration.md` - Update Frontend Tool Integration
- `issue-17.11-frontend-documentation.md` - Update Frontend Documentation

### Phase 4: Apps SDK Compliance (4 tasks) **NEW - CRITICAL**
- `issue-17.17-dark-mode-support.md` - Add Dark Mode Support (CRITICAL)
- `issue-17.18-widget-state-persistence.md` - Implement Widget State Persistence (CRITICAL)
- `issue-17.19-apps-sdk-ui-integration.md` - Integrate Apps SDK UI Design System (HIGH)
- `issue-17.20-picture-in-picture-mode.md` - Add Picture-in-Picture Mode (MEDIUM)

### Phase 5: Testing & Documentation (5 tasks)
- `issue-17.12-e2e-tests-update.md` - Update E2E Tests
- `issue-17.13-screenshot-baselines.md` - Update Screenshot Baselines
- `issue-17.14-project-documentation.md` - Update Project Documentation
- `issue-17.15-final-verification.md` - Verify Complete Rebranding
- `issue-17.16-migration-guide.md` - Create Migration Guide

## Dependency Graph

```
#17.1 (Spec) ──────────┬──────────> #17.3 (Visual Design)
                       │                      │
                       └──> #17.2 (Audit)     │
                               │              │
                               v              │
                         #17.4 (Backend)      │
                               │              │
                               v              │
                         #17.5 (MCP Tools) <──┴──────┐
                               │                     │
                               v                     │
                         #17.6 (Backend Visual)      │
                               │                     │
                               v                     │
                         #17.7 (Backend Docs)        │
                               │                     │
                               ├──> #17.8 (Frontend Rename)
                               │         │           │
                               │         v           │
                               │    #17.17 (Dark Mode) <──┘ (CRITICAL)
                               │         │
                               │         ├──> #17.9 (Frontend Visual)
                               │         │         │
                               │         │         v
                               │         │    #17.10 (Frontend Tools)
                               │         │         │
                               │         ├────> #17.18 (Widget State) (CRITICAL)
                               │         │         │
                               │         v         v
                               │    #17.19 (Apps SDK UI)
                               │              │
                               │              v
                               │         #17.20 (PiP Mode)
                               │              │
                               └──> #17.11 (Frontend Docs) <──┘
                                         │
                                         v
                                    #17.12 (E2E Tests)
                                         │
                                         v
                                    #17.13 (Screenshots)
                                         │
                                         v
                                    #17.14 (Project Docs)
                                         │
                                         v
                                    #17.15 (Verification)
                                         │
                                         v
                                    #17.16 (Migration)
```

## Critical Path

The shortest path through the Epic (including Apps SDK compliance):

1. #17.1 → #17.2 → #17.3 (Planning) - 4.5 hours
2. #17.4 (Backend module) - 1.5 hours
3. #17.5 (MCP tools) - 2 hours
4. #17.8 (Frontend rename) - 2 hours
5. **#17.17 (Dark mode) - 2.5 hours** ⚡ CRITICAL
6. **#17.18 (Widget state) - 2.5 hours** ⚡ CRITICAL
7. #17.9 (Frontend visual) - 2.5 hours
8. **#17.19 (Apps SDK UI) - 4 hours** (recommended)
9. #17.12 → #17.13 (Testing) - 3 hours
10. #17.15 (Verification) - 2 hours

**Estimated Critical Path Duration**: ~26-28 hours (includes Apps SDK compliance)

## Parallel Work Opportunities

These tasks can be done in parallel:

### After #17.3 completes (Visual Design Spec):
- #17.17 (Dark mode) can start immediately in parallel with backend work
- Doesn't need to wait for #17.8 (Frontend rename)

### After #17.5 completes:
- #17.6 (Backend visual config)
- #17.8 (Frontend rename) - can start independently
- #17.17 (Dark mode) - can start if not already done

### After #17.8 completes:
- #17.18 (Widget state) can start immediately
- Works in parallel with #17.9 (Frontend visual)

### After #17.17 and #17.18 complete:
- #17.19 (Apps SDK UI) can begin
- #17.20 (PiP mode) can begin
- #17.9 (Frontend visual) if not already done
- #17.10 (Frontend tools)

### After #17.12 completes:
- #17.11 (Frontend docs)
- #17.13 (Screenshots)
- #17.14 (Project docs) - can work on these concurrently

## Breaking Changes Summary

### Tool IDs
- `gamebox.start_word_challenge` → `gamebox.start_word_morph`
- `gamebox.check_word_guess` → `gamebox.check_word_morph_guess`

### Widget URIs
- `ui://widget/word-challenge.html` → `ui://widget/word-morph.html`

### Visual Design
- Colors: Green/Yellow/Gray → Teal/Coral/Slate
- Border radius: 4px → 8px
- Spacing: 5px → 12px
- Animation: 250ms → 150ms

### Game Names
- Word Challenge → Word Morph
- Connections → Kinship
- Spelling Bee → Lexicon Smith
- 20 Questions → Twenty Queries
- Trivia Challenge → Lore Master

### Apps SDK Requirements (NEW)
- **Dark mode support mandatory** (light + dark themes)
- **Widget state persistence via `window.openai.setWidgetState()`**
- Recommended: Apps SDK UI components (Button, Card, Stack, etc.)
- Recommended: Picture-in-Picture mode support

## Key Deliverables

### Documentation
- `/docs/REBRANDING_SPEC.md` (#17.1)
- `/docs/REBRANDING_AUDIT.md` (#17.2)
- `/docs/VISUAL_DESIGN_SPEC.md` (#17.3)
- `/docs/REBRANDING_VERIFICATION_REPORT.md` (#17.15)
- `/docs/REBRANDING_MIGRATION.md` (#17.16)

### Code Changes
- Backend: `/server/src/games/wordMorph.ts`
- Backend: `/server/src/index.ts` (MCP tools)
- Backend: `/server/src/config/themes.ts` (new file)
- Frontend: `/web/src/widgets/WordMorph.tsx`
- Frontend: `/web/src/styles/globals.css`
- Frontend: `/web/src/hooks/useWidgetState.ts` (new file - widget state hook)
- Frontend: `/web/src/types/widgetState.ts` (new file - state interface)
- Frontend: `/web/src/types/window.d.ts` (new file - window.openai types)
- Frontend: `/web/src/main.tsx` (Apps SDK provider)
- E2E: `/e2e/word-morph.spec.ts`

### Apps SDK Compliance Documentation (NEW)
- `/docs/APPS_SDK_COMPLIANCE_ANALYSIS.md` (already created ✅)
- `/docs/CRYPTIC_CLUES_TASKS.md` (updated for window.openai ✅)

## Success Criteria

### Rebranding (Original Scope)
- [ ] All 5 games renamed
- [ ] Zero old name references in code
- [ ] Visual design differentiated (teal/coral/slate)
- [ ] All tool IDs updated
- [ ] 100% tests passing
- [ ] Documentation complete
- [ ] Migration guide published

### Apps SDK Compliance (NEW - CRITICAL)
- [ ] **Dark mode support implemented** (blocks App Store)
- [ ] **Widget state persistence via window.openai** (blocks App Store)
- [ ] Apps SDK UI components integrated (strongly recommended)
- [ ] Picture-in-Picture mode implemented (recommended)
- [ ] All WCAG AA accessibility standards met
- [ ] **Ready for ChatGPT App Store submission**

## Risk Areas

1. **Tool ID Breaking Changes** - Users must update integrations
2. **Screenshot Baselines** - Will fail until regenerated
3. **Visual Design** - Must meet legal differentiation requirements
4. **Apps SDK Compliance** - Dark mode and widget state are CRITICAL blockers for App Store
5. **Scope Creep** - Stick to plan, avoid additional features
6. **Timeline** - Added 10-14 hours for Apps SDK compliance (34-42 hours total)

## Next Steps

1. Create GitHub Epic #17 using `epic-17-main.md`
2. Create all 16 sub-issues using the individual task files
3. Link all sub-issues to the Epic
4. Add all issues to Project Board #4
5. Update CONTRIBUTING.md (already done ✅)
6. Begin implementation following Ralph Loop process

## GitHub Commands

### Create Epic
```bash
gh issue create --title "Epic #17: Legal Safety Game Rebranding" --body-file docs/github-issues/epic-17-main.md --label "epic,legal-safety,high-priority"
```

### Create Sub-Issues (example)
```bash
gh issue create --title "Task #17.1: Create Rebranding Specification" --body-file docs/github-issues/issue-17.1-rebranding-spec.md --label "phase-1-planning,documentation,critical,epic-17"
```

### Link to Epic
```bash
# After creating issues, link them in the Epic description
# or use GitHub's "Link issue" feature in the UI
```

## Verification Checklist

Before starting implementation:
- [x] All 21 issue files created (16 original + 4 Apps SDK + 1 Epic)
- [x] CONTRIBUTING.md updated with Epic #17
- [x] Apps SDK compliance analysis complete
- [x] Cryptic clues tasks updated for window.openai API
- [ ] Issues created on GitHub
- [ ] Issues linked to Epic
- [ ] Issues added to Project Board
- [ ] Team notified of rebranding plan and Apps SDK requirements

## Notes

- This is a comprehensive rebranding affecting ~40 files
- Clean break on tool IDs (no backward compatibility)
- Legal compliance is the primary driver
- Visual differentiation is critical
- Migration guide essential for users
- **Apps SDK compliance added**: 4 new tasks (10-14 hours)
- **Dark mode and widget state are CRITICAL** - blocks App Store without them
- Apps SDK UI integration strongly recommended for better approval chances
- Picture-in-Picture mode recommended for better game UX

---

**Created**: 2026-01-19
**Updated**: 2026-01-19 (added Apps SDK compliance)
**Epic Owner**: [To be assigned]
**Estimated Completion**: [To be scheduled]
**Total Duration**: 34-42 hours (was 24-28, added 10-14 for Apps SDK)
