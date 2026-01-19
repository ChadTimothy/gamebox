# Contributing to GameBox

Thank you for your interest in contributing to GameBox! This document provides guidelines and the development process for contributing.

## Development Process

Each task in GameBox follows a structured process called the "Ralph Loop" to ensure quality and consistency:

### 1. Read Ticket
- Review the issue/task requirements thoroughly
- Look for related tickets and dependencies
- Check the technical design documentation
- Understand acceptance criteria

### 2. Review Documentation
- Review the technical design document
- Check existing code patterns and conventions
- Review related epics and tasks
- Ensure alignment with current codebase state

### 3. Make Implementation Plan
- Break down the task into steps
- Identify files to create or modify
- Consider edge cases and error handling
- Assess plan for readiness and create subtasks if needed

### 4. Create Placeholder PR
- Create a draft PR for the task
- Link the PR to the issue
- Add initial description of planned changes

### 5. Enter Ralph Loop

This is the iterative development cycle:

#### a. Start Implementation
- Create/modify files as planned
- Follow existing code patterns
- Write clean, readable code
- Add comments for complex logic

#### b. Simplify Code
- Refactor for clarity and maintainability
- Remove duplication
- Ensure code is DRY (Don't Repeat Yourself)
- Optimize for readability first, performance second

#### c. Write Tests
- Write comprehensive unit tests
- Test edge cases and error conditions
- Ensure test coverage is adequate
- Run tests and fix any failures

#### d. Code Review
- Self-review all changes
- Check for security vulnerabilities
- Verify error handling
- Ensure documentation is updated

#### e. Complete Subtask
- Mark subtask as complete with comments
- Document any decisions or trade-offs made
- Update the PR description

#### f. Move to Next Subtask
- If more subtasks exist, repeat the loop
- Otherwise, finalize the PR

### 6. Finalize PR
- Attach all commits to the PR
- Run code simplification one more time
- Run all tests (unit, integration, E2E)
- Perform final code review
- Fix any issues found
- For low priority issues: verify they won't cause problems in normal use
- Mark task as complete
- Request review from maintainers

### 7. Move to Next Task
- Once PR is merged, move to next task
- Update project board
- Repeat the process

## Code Standards

### TypeScript
- Use TypeScript strict mode
- Define explicit types (avoid `any`)
- Use interfaces for object shapes
- Document complex types with JSDoc comments

### React
- Use functional components with hooks
- Follow React best practices
- Keep components small and focused
- Use meaningful component and prop names

### Testing
- Write tests for all game logic
- Test edge cases and error conditions
- Use meaningful test descriptions
- Aim for high code coverage

### Git Commits
- Write clear, descriptive commit messages
- Use conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `test:` for tests
  - `refactor:` for refactoring
  - `chore:` for maintenance

Example:
```
feat(word-morph): implement daily word selection

- Add deterministic date-based word selection
- Ensure same word for all users on same day
- Add tests for consistency
```

## Pull Request Guidelines

1. **Title**: Clear and descriptive
2. **Description**:
   - What changes were made
   - Why the changes were needed
   - How to test the changes
   - Screenshots/videos for UI changes
3. **Link to Issue**: Reference the issue number
4. **Tests**: Include test results
5. **Checklist**: Complete all PR checklist items

## Code Review Process

All PRs require:
- [ ] All tests passing
- [ ] Code follows project standards
- [ ] No security vulnerabilities introduced
- [ ] Documentation updated
- [ ] Self-review completed
- [ ] Related issues linked

## Getting Help

- **Questions**: Open a discussion on GitHub
- **Bugs**: Open an issue with reproduction steps
- **Features**: Open an issue with detailed description

## Project Board

Track progress on our [GitHub Project Board](https://github.com/users/ChadTimothy/projects/4)

## Epics and Tasks

Work is organized into epics (large features) and tasks (individual work items):

- **Epic #1**: Project Setup & Infrastructure
- **Epic #4**: Game 1 - Word Morph (formerly Word Challenge)
- **Epic #11**: Game 2 - Twenty Queries (formerly 20 Questions AI)
- **Epic #12**: Game 3 - Kinship (formerly Connections)
- **Epic #13**: Game 4 - Lexicon Smith (formerly Spelling Bee)
- **Epic #14**: Game 5 - Lore Master (formerly Trivia Challenge)
- **Epic #15**: Integration & Polish
- **Epic #16**: Testing & Deployment
- **Epic #17**: Legal Safety Game Rebranding ✅

### Epic #17: Legal Safety Game Rebranding

Comprehensive rebranding of all 5 games for legal compliance and trademark safety. This epic includes renaming all games to avoid trademark conflicts with NYT Games, updating visual designs to be legally distinct, and creating migration documentation.

**Status**: ✅ Complete (Issues created, ready for implementation)

**Phases**:
1. **Planning & Design** (Tasks #17.1-17.3)
   - Rebranding specification
   - Codebase audit
   - Visual design differentiation

2. **Backend Refactoring** (Tasks #17.4-17.7)
   - Backend module renaming
   - MCP tool ID updates
   - Visual design configuration
   - Backend documentation

3. **Frontend Refactoring** (Tasks #17.8-17.11)
   - Frontend component renaming
   - Visual design implementation
   - Tool integration updates
   - Frontend documentation

4. **Apps SDK Compliance** (Tasks #17.17-17.20) ⚡ CRITICAL
   - Dark mode support (CRITICAL - blocks App Store)
   - Widget state persistence (CRITICAL - blocks App Store)
   - Apps SDK UI integration (HIGH - strongly recommended)
   - Picture-in-Picture mode (MEDIUM - recommended)

5. **Testing & Documentation** (Tasks #17.12-17.16)
   - E2E test updates
   - Screenshot baseline regeneration
   - Project documentation updates
   - Final verification
   - Migration guide creation

**Key Changes**:
- Word Challenge → Word Morph
- Connections → Kinship
- Spelling Bee → Lexicon Smith
- 20 Questions → Twenty Queries
- Trivia Challenge → Lore Master

**Breaking Changes**:
- Tool IDs updated (e.g., `gamebox.start_word_morph` instead of `gamebox.start_word_challenge`)
- Widget URIs updated (e.g., `ui://widget/word-morph.html`)
- Visual design differentiated (teal/coral/slate colors instead of green/yellow/gray)

**Apps SDK Requirements** (NEW):
- Dark mode support mandatory (light + dark themes)
- Widget state persistence via `window.openai.setWidgetState()`
- Apps SDK UI components recommended
- Picture-in-Picture mode recommended

**Timeline**: 34-42 hours total (24-28 rebranding + 10-14 Apps SDK compliance)

**Migration**: See `/docs/REBRANDING_MIGRATION.md` (created in Task #17.16) and `/docs/APPS_SDK_COMPLIANCE_ANALYSIS.md`

Pick tasks from the project board and follow the development process above.

## Questions?

Open an issue or discussion on GitHub - we're happy to help!

---

Thank you for contributing to GameBox! 🎮
