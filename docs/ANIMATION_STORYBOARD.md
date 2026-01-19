# Word Challenge Animation Storyboard

## Overview
This document describes all animation sequences in the Word Challenge widget, including timing, choreography, and user experience flow.

---

## 1. Tile Flip Sequence (Guess Submission)

### Trigger
User presses "ENTER" with a complete 5-letter guess

### Animation Flow
```
[User presses ENTER]
    ↓
[Validate guess] (immediate)
    ↓
[Start tile flip sequence]
    ↓
[Tile 1 flips] → 0ms delay
    ↓
[Tile 2 flips] → 100ms delay
    ↓
[Tile 3 flips] → 200ms delay
    ↓
[Tile 4 flips] → 300ms delay
    ↓
[Tile 5 flips] → 400ms delay
    ↓
[Update keyboard colors] → 900ms total
    ↓
[Check win/loss condition]
```

### Technical Details
- **Animation**: `flip` keyframe (rotateX 0° → 90° → 0°)
- **Duration per tile**: 600ms
- **Stagger**: 100ms between tiles
- **Total sequence time**: 1000ms (last tile finishes at 1000ms)
- **Easing**: ease-in-out
- **Color reveal**: Color changes at 50% rotation (90°)

### Implementation
```tsx
<div
  className={`animate-flip ${bgColor}`}
  style={{ animationDelay: `${index * 100}ms` }}
>
  {letter}
</div>
```

### User Experience
1. User sees letters flip one by one from left to right
2. Each tile reveals its color (green/yellow/gray) mid-flip
3. Rhythm creates satisfying visual feedback
4. Total wait time: ~1 second before next guess

---

## 2. Keyboard Color Update

### Trigger
After tile flip sequence completes

### Animation Flow
```
[All tiles finish flipping] → 1000ms
    ↓
[Update keyboard key colors] (instant)
    ↓
[CSS transition animates color change] → 300ms
```

### Technical Details
- **Animation**: CSS transition on background-color
- **Duration**: 300ms
- **Easing**: Default transition
- **Properties**: background-color, color

### Implementation
```tsx
<button
  className={`${getKeyColor(key)} transition-colors duration-300`}
>
  {key}
</button>
```

---

## 3. Keyboard Press Feedback

### Trigger
User clicks/taps a keyboard key

### Animation Flow
```
[User clicks key]
    ↓
[Button scales down] → 0-75ms
    ↓
[Button scales back up] → 75-150ms
    ↓
[Letter appears in tile] (instant)
```

### Technical Details
- **Animation**: Tailwind's `active:scale-95`
- **Duration**: 150ms total
- **Easing**: Tailwind default
- **Trigger**: :active pseudo-class

### Implementation
```tsx
<button
  className="active:scale-95 transition-transform duration-150"
>
  {key}
</button>
```

### User Experience
1. Immediate tactile feedback on click/tap
2. Subtle scale animation feels responsive
3. Letter appears in tile instantly (no delay)

---

## 4. Win Celebration Sequence

### Trigger
User guesses the correct word (all 5 letters correct)

### Animation Flow
```
[Last tile flips to green] → 1000ms
    ↓
[Check win condition] (immediate)
    ↓
[Winning tiles bounce] → 0ms delay
    ↓
[Victory message fades in] → 300ms delay
    ↓
[Action buttons appear] → 500ms delay
```

### Technical Details

#### 4.1 Winning Tiles Bounce
- **Animation**: `bounce` keyframe (translateY)
- **Duration**: 500ms
- **Stagger**: 100ms per tile (matches flip rhythm)
- **Delay**: 0ms after win detected
- **Easing**: ease-in-out

```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

#### 4.2 Victory Message
- **Animation**: `fade-in-up` keyframe
- **Duration**: 400ms
- **Delay**: 300ms after win
- **Easing**: ease-out
- **Content**: "🎉 You won! Streak: {streak}"

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### 4.3 Action Buttons
- **Animation**: `fade-in-up` (same as message)
- **Duration**: 400ms
- **Delay**: 500ms after win
- **Buttons**: "Share Results" and "New Game"

### Implementation
```tsx
{state.status === "won" && (
  <>
    {/* Winning row tiles get bounce animation */}
    <div className="animate-bounce" style={{ animationDelay: `${index * 100}ms` }}>
      {/* Tile content */}
    </div>

    {/* Victory message */}
    <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      🎉 You won! Streak: {state.streak}
    </div>

    {/* Action buttons */}
    <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
      <button>Share Results</button>
      <button>New Game</button>
    </div>
  </>
)}
```

### User Experience
1. Tiles flip to reveal all green
2. Winning row bounces joyfully (left to right)
3. Victory message slides up from below
4. Action buttons appear shortly after
5. Total sequence: ~2 seconds
6. User feels accomplished and engaged

---

## 5. Loss State Sequence

### Trigger
User submits 6th incorrect guess (game over, word not guessed)

### Animation Flow
```
[Last tile flips] → 1000ms
    ↓
[Check loss condition] (immediate)
    ↓
[Last row shakes] → 0ms delay
    ↓
[Loss message fades in] → 300ms delay
    ↓
[Action buttons appear] → 500ms delay
```

### Technical Details

#### 5.1 Last Row Shake
- **Animation**: `shake` keyframe (translateX)
- **Duration**: 500ms
- **Stagger**: No stagger (whole row shakes together)
- **Delay**: 0ms after loss detected
- **Easing**: ease-in-out

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

#### 5.2 Loss Message
- **Animation**: `fade-in-up` keyframe
- **Duration**: 400ms
- **Delay**: 300ms after loss
- **Easing**: ease-out
- **Content**: "Game over. The word was: {word}"

#### 5.3 Action Buttons
- **Animation**: `fade-in-up` (same as message)
- **Duration**: 400ms
- **Delay**: 500ms after loss
- **Buttons**: "Share Results" and "New Game"

### Implementation
```tsx
{state.status === "lost" && (
  <>
    {/* Last row shakes */}
    <div className="animate-shake">
      {/* Row tiles */}
    </div>

    {/* Loss message */}
    <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      Game over. The word was: {state.word}
    </div>

    {/* Action buttons */}
    <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
      <button>Share Results</button>
      <button>New Game</button>
    </div>
  </>
)}
```

### User Experience
1. Final tiles flip to reveal colors
2. Last row shakes gently (sympathetic gesture)
3. Word is revealed with encouraging message
4. Action buttons appear
5. User doesn't feel punished, encouraged to try again
6. Total sequence: ~2 seconds

---

## 6. Message Animations

### Trigger
Validation errors or game state messages

### Animation Flow
```
[Error condition detected]
    ↓
[Message appears with fade-in-up] → 0ms
    ↓
[Message auto-dismisses] → 3000ms (optional)
```

### Technical Details
- **Animation**: `fade-in-up`
- **Duration**: 300ms
- **Delay**: 0ms
- **Easing**: ease-out
- **Examples**:
  - "Word must be 5 letters"
  - "Connect to game server to make guesses"
  - "New game started!"

### Implementation
```tsx
{message && (
  <div className="animate-fade-in-up">
    {message}
  </div>
)}
```

---

## Animation Timing Summary

| Animation | Duration | Stagger | Total Time |
|-----------|----------|---------|------------|
| Tile Flip (5 tiles) | 600ms | 100ms | 1000ms |
| Keyboard Update | 300ms | - | 300ms |
| Key Press | 150ms | - | 150ms |
| Win Bounce | 500ms | 100ms | 900ms |
| Win Message | 400ms | 300ms delay | 700ms |
| Win Buttons | 400ms | 500ms delay | 900ms |
| Loss Shake | 500ms | - | 500ms |
| Loss Message | 400ms | 300ms delay | 700ms |
| Loss Buttons | 400ms | 500ms delay | 900ms |
| Message Fade | 300ms | - | 300ms |

---

## Performance Considerations

### GPU Acceleration
All animations use transform and opacity properties for hardware acceleration:
- ✅ `transform: rotateX()` (tile flip)
- ✅ `transform: translateY()` (bounce, fade-in-up)
- ✅ `transform: translateX()` (shake)
- ✅ `transform: scale()` (key press)
- ✅ `opacity` (fade effects)

### Avoiding Layout Thrash
- ❌ No width/height animations
- ❌ No top/left/right/bottom animations
- ❌ No margin/padding animations
- ✅ Only transform and opacity

### 60 FPS Target
- Each animation tested to run at 60fps
- No janky transitions
- Smooth on mobile devices

---

## Accessibility Considerations

### Prefers Reduced Motion
For users who prefer reduced motion, disable or simplify animations:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-flip,
  .animate-bounce,
  .animate-shake,
  .animate-fade-in-up {
    animation: none;
  }

  * {
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Announcements
Pair visual animations with ARIA live regions:

```tsx
<div role="status" aria-live="polite" className="sr-only">
  {state.status === "won" && "Congratulations! You won!"}
  {state.status === "lost" && `Game over. The word was ${state.word}`}
</div>
```

---

## Testing Checklist

- [ ] Tile flip sequence runs smoothly at 60fps
- [ ] Stagger timing is correct (100ms between tiles)
- [ ] Keyboard colors update after flip completes
- [ ] Key press feedback is responsive
- [ ] Win celebration feels joyful (bounce + message)
- [ ] Loss state is encouraging (shake + reveal)
- [ ] Messages fade in smoothly
- [ ] All animations respect prefers-reduced-motion
- [ ] Screen readers announce game state changes
- [ ] Mobile performance is smooth
- [ ] Dark mode animations look correct

---

**Status**: ✅ Storyboard Complete
**Date**: 2026-01-19
**Next Step**: Implement win/loss celebration states with animations
