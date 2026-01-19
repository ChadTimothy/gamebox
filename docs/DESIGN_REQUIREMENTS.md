# Word Challenge Widget - Design & UX Requirements

**Issue #:** [To be assigned]
**Created:** 2026-01-19
**Priority:** High
**Status:** Research Complete - Ready for Design Phase

---

## Executive Summary

The current Word Challenge widget is functionally complete with 100% test coverage, but needs a comprehensive design overhaul to meet OpenAI's Apps SDK standards and provide an engaging user experience in ChatGPT. This document compiles research from OpenAI's official guidelines and outlines specific requirements for the redesign.

---

## Problem Statement

**Current State:**
- ✅ Functionally complete (all game mechanics work)
- ✅ 100% test coverage (146/146 tests passing)
- ⚠️ Basic aesthetics (plain white background, gray borders)
- ⚠️ No dark mode support (ChatGPT has light/dark themes)
- ⚠️ No animations or visual feedback
- ⚠️ Doesn't feel "game-like" or engaging
- ⚠️ Not optimized for ChatGPT embedding context

**Risk:** App may be rejected from ChatGPT store for not meeting quality/UX standards.

---

## OpenAI Apps SDK Requirements

### Official Documentation Sources

- [UI Guidelines](https://developers.openai.com/apps-sdk/concepts/ui-guidelines/)
- [UX Principles](https://developers.openai.com/apps-sdk/concepts/ux-principles/)
- [App Submission Guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines/)
- [Apps SDK UI Kit](https://github.com/openai/apps-sdk-ui)

### Display Mode Requirements

**Inline Mode (Current Implementation)**
- Widget appears directly in conversation flow
- Should be "lightweight, single-purpose"
- Maximum TWO primary actions per card
- No nested scrolling - content must auto-fit
- No tabs, deep navigation, or multiple views
- Dynamic layout expands up to mobile viewport height

**Picture-in-Picture Mode (Recommended for Games)**
- Persistent floating window for parallel activities
- Stays fixed during scroll
- Updates dynamically based on chat input
- Perfect for games that run alongside conversation
- Auto-closes when session ends

### Visual Design Standards

**Color Requirements:**
- ✅ Use system-defined palettes for text, icons, dividers
- ✅ Support light AND dark modes
- ✅ Brand accents allowed for logos, primary buttons, badges
- ❌ Don't override system backgrounds or text colors
- ❌ Avoid custom gradients or patterns

**Typography Requirements:**
- Use platform-native system fonts (SF Pro/iOS, Roboto/Android)
- Inherit system font stack
- Respect sizing hierarchy (body, body-small)
- Limit font size variation
- Reserve bold/italic for content, not structural UI

**Spacing & Layout:**
- Use system grid spacing
- Maintain consistent padding
- Respect system corner radius specifications
- Clear visual hierarchy: headline → supporting text → CTA
- No edge-to-edge text

**Accessibility (WCAG AA):**
- ⚠️ Minimum contrast ratio 4.5:1 for normal text
- ⚠️ Minimum contrast ratio 3:1 for large text
- ⚠️ Alt text required for all images
- ⚠️ Support text resizing without layout breakage
- ⚠️ Keyboard navigation support

### UX Principles

**Core Design Philosophy:**
> "A focused, conversational experience that feels native to ChatGPT"

**Five Principles:**
1. **Extract, don't port** - Atomic actions, not full interface clones
2. **Design for conversational entry** - Support open-ended prompts
3. **Design for ChatGPT environment** - UI only where genuinely helpful
4. **Optimize for conversation, not navigation** - Clear actions, concise results
5. **Embrace the ecosystem** - Accept natural language, compose with other apps

**Pre-Publication Checklist:**
- ✅ Leverages ChatGPT's conversational strengths?
- ✅ Provides capabilities beyond base ChatGPT?
- ✅ Tools atomic and model-friendly?
- ⚠️ UI genuinely helpful vs. ornamental?
- ✅ Users can complete tasks without leaving ChatGPT?
- ✅ Responds quickly for conversation rhythm?
- ✅ Would prompts naturally select this app?

### Quality Standards (Submission)

- **Stability:** No crashes, hangs, or inconsistent behavior
- **Performance:** Low latency required for conversation flow
- **Testing:** Thoroughly tested across wide range of scenarios
- **Error Handling:** Clear messaging, fallback behaviors
- **Completeness:** No trials or demos - must be fully functional

---

## Specific Design Requirements for Word Challenge

### Critical Issues to Address

1. **Dark Mode Support** (CRITICAL)
   - Current: White background only
   - Required: Dynamic theming based on ChatGPT mode
   - Implementation: Use system-defined palettes from Apps SDK UI

2. **Visual Feedback & Animations** (HIGH)
   - Current: No animations, instant state changes
   - Required:
     - Tile flip animations on guess submission
     - Color transitions for correct/present/absent
     - Keyboard key press feedback
     - Win/loss celebration animations
     - Smooth state transitions

3. **Game State Communication** (HIGH)
   - Current: Basic "Guess 1 of 6" text
   - Suggested:
     - Visual progress indicator (dots or bar)
     - Remaining guesses shown visually
     - Streak display with icon
     - Win/loss state with personality

4. **Accessibility** (CRITICAL)
   - Current: No ARIA labels, no keyboard nav hints
   - Required:
     - ARIA labels for all interactive elements
     - Keyboard navigation support
     - Screen reader announcements for game state
     - Focus management
     - Alt text for visual indicators

5. **Mobile Optimization** (HIGH)
   - Current: Works but tiles are small
   - Suggested:
     - Larger touch targets (min 44x44px)
     - Optimized for portrait orientation
     - Responsive tile sizing
     - Swipe gestures for backspace?

6. **Brand Identity** (MEDIUM)
   - Current: Generic appearance
   - Suggested:
     - Subtle logo/branding
     - Unique color accent for correct letters
     - Personality in win/loss messages
     - Shareable results with branding

### Recommended Component Updates

**Current Component Structure:**
```
WordChallenge (main)
├── GameBoard (6x5 grid)
├── Keyboard (on-screen keys)
└── Message (validation/errors)
```

**Recommended Structure:**
```
WordChallenge (main + theme provider)
├── Header (title, streak, progress)
├── GameBoard (animated tiles)
│   └── Tile (with flip animation)
├── Keyboard (with key feedback)
│   └── Key (animated press state)
├── GameStatus (win/loss celebrations)
└── Actions (share, new game)
```

### Animation Requirements

1. **Tile Flip Animation**
   - Duration: 300ms per tile
   - Stagger: 100ms delay between tiles
   - Easing: ease-in-out
   - Reveal color during flip

2. **Keyboard Feedback**
   - Press animation: scale(0.95) + brightness change
   - Duration: 150ms
   - Color update after guess processes

3. **Win Celebration**
   - Tile bounce animation
   - Confetti or sparkle effect (optional)
   - Victory message slide-in

4. **Loss State**
   - Reveal word animation
   - Gentle shake for sympathy
   - Encouraging message

### Color Palette (Following Apps SDK)

**Light Mode:**
- Background: System light background
- Tiles (empty): Gray-200 border, transparent bg
- Tiles (absent): Gray-500
- Tiles (present): Yellow-500
- Tiles (correct): Green-600
- Text: System text colors
- Keyboard: Gray-300

**Dark Mode:**
- Background: System dark background
- Tiles (empty): Gray-700 border, transparent bg
- Tiles (absent): Gray-600
- Tiles (present): Yellow-600
- Tiles (correct): Green-500
- Text: System text colors (light)
- Keyboard: Gray-600

### Typography Scale

```
Title: text-3xl font-bold (30px)
Tiles: text-2xl font-bold uppercase (24px)
Keys: text-sm font-bold (14px)
Status: text-base (16px)
Messages: text-sm (14px)
```

---

## Implementation Strategy

### Phase 1: Apps SDK UI Integration (Week 1)

**Tasks:**
1. Install `@openai/apps-sdk-ui` package
2. Configure Tailwind 4 with Apps SDK tokens
3. Wrap app with `<AppsSDKUIProvider>`
4. Replace custom colors with system tokens
5. Implement dark mode detection and theming

**Acceptance Criteria:**
- Widget renders in both light and dark modes
- Colors match ChatGPT system palette
- No visual regressions in existing tests

### Phase 2: Animations & Feedback (Week 2)

**Tasks:**
1. Add tile flip animations (Framer Motion or CSS)
2. Implement keyboard press feedback
3. Add win/loss celebration animations
4. Smooth transitions for all state changes
5. Performance test (60fps target)

**Acceptance Criteria:**
- All animations run smoothly
- No performance degradation
- Animations can be disabled for accessibility

### Phase 3: Accessibility & Polish (Week 3)

**Tasks:**
1. Add ARIA labels to all interactive elements
2. Implement keyboard navigation
3. Add screen reader announcements
4. Test with VoiceOver/NVDA
5. Mobile touch target optimization
6. Focus management improvements

**Acceptance Criteria:**
- WCAG AA compliance verified
- Keyboard-only navigation works
- Screen readers announce game state
- Touch targets meet minimum size

### Phase 4: UX Enhancements (Week 4)

**Tasks:**
1. Design and implement win/loss states
2. Add streak visualization
3. Create shareable results format
4. Onboarding hints for first-time users
5. Loading states and error handling UI
6. Picture-in-Picture mode investigation

**Acceptance Criteria:**
- Win/loss states feel celebratory/encouraging
- Share results format ready
- First-time user experience smooth
- All error states have clear UI

---

## Testing Requirements

### Design Review Checklist

- [ ] Meets OpenAI UI Guidelines (card design, visual standards)
- [ ] Passes UX Principles checklist (conversational, native fit, composability)
- [ ] Supports both light and dark modes
- [ ] WCAG AA compliant (contrast, text sizing, keyboard nav)
- [ ] Animations smooth and purposeful
- [ ] Mobile responsive (375px - 1920px)
- [ ] No nested scrolling
- [ ] Maximum 2 primary actions per view
- [ ] Clear visual hierarchy
- [ ] Accessible to screen readers

### User Testing

**Target Personas:**
1. Casual Player - Plays occasionally for fun
2. Daily Player - Part of morning routine
3. Competitive Player - Cares about streaks and sharing
4. Accessibility User - Uses screen reader or keyboard only

**Test Scenarios:**
- First-time play without instructions
- Daily streak maintenance
- Share results to social media
- Play with screen reader
- Play with keyboard only
- Play on mobile device
- Switch between light/dark modes

---

## Success Metrics

### Pre-Launch (Design Quality)
- ✅ Passes OpenAI design review checklist
- ✅ WCAG AA compliant
- ✅ 60fps animations on target devices
- ✅ Zero accessibility violations (axe DevTools)

### Post-Launch (User Engagement)
- Average game completion rate > 85%
- Return player rate (7-day) > 40%
- Share rate > 15% of wins
- Session duration appropriate for game type
- Low error/confusion rates

---

## Resources & References

### Official Documentation
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk/)
- [UI Guidelines](https://developers.openai.com/apps-sdk/concepts/ui-guidelines/)
- [UX Principles](https://developers.openai.com/apps-sdk/concepts/ux-principles/)
- [Submission Guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines/)
- [Apps SDK UI Kit](https://github.com/openai/apps-sdk-ui)

### Design Systems
- [Apps SDK UI Components](https://openai.github.io/apps-sdk-ui/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind 4 Documentation](https://tailwindcss.com/)

### Inspiration
- NYT Wordle (visual design, animations)
- Worldle (share functionality)
- Spelling Bee (clean game UI)

---

## Next Steps

1. **Design Phase** - Create mockups showing:
   - Light/dark mode variations
   - Win/loss states
   - Animation sequences (storyboards)
   - Mobile responsive views

2. **User Research** (Optional)
   - Survey target personas
   - A/B test different color schemes
   - Gather feedback on animations

3. **Technical Spike**
   - Prototype Apps SDK UI integration
   - Test animation library options
   - Validate dark mode implementation

4. **Implementation**
   - Follow 4-phase plan above
   - Update tests as needed
   - Document new components

---

## Open Questions

1. **Picture-in-Picture Mode** - Should we implement PiP for persistent game state?
2. **Sound Effects** - Do we want audio feedback? (Must be optional)
3. **Haptic Feedback** - Should mobile show haptics on key press?
4. **Share Format** - What should shared results look like in ChatGPT?
5. **Tutorial** - First-time onboarding flow or rely on familiarity with Wordle?
6. **Branding** - How much of our brand identity vs. ChatGPT native look?

---

**Document Status:** ✅ Research Complete
**Next Action:** Create design mockups
**Owner:** [To be assigned]
**Target Completion:** Q1 2026
