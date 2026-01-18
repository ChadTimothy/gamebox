# Contributing to ChatCade

Thank you for your interest in contributing to ChatCade! This document provides guidelines and the development process for contributing.

## Development Process

Each task in ChatCade follows a structured process called the "Ralph Loop" to ensure quality and consistency:

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
feat(word-challenge): implement daily word selection

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
- **Epic #4**: Game 1 - Word Challenge
- **Epic #11**: Game 2 - 20 Questions AI
- **Epic #12**: Game 3 - Connections
- **Epic #13**: Game 4 - Spelling Bee
- **Epic #14**: Game 5 - Trivia Challenge
- **Epic #15**: Integration & Polish
- **Epic #16**: Testing & Deployment

Pick tasks from the project board and follow the development process above.

## Questions?

Open an issue or discussion on GitHub - we're happy to help!

---

Thank you for contributing to ChatCade! 🎮
