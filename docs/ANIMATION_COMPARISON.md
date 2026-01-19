# Animation Library Comparison

## Context
The Word Challenge widget needs animations for:
1. Tile flip animations (300ms per tile, 100ms stagger)
2. Keyboard press feedback
3. Win/loss celebrations
4. State transitions

## Option 1: CSS Animations (Current)

### Current Implementation
```css
@keyframes flip {
  0% { transform: rotateX(0); }
  50% { transform: rotateX(90deg); }
  100% { transform: rotateX(0); }
}

.animate-flip {
  animation: flip 0.6s ease-in-out;
}
```

### Usage in Component
```tsx
<div
  className={`${bgColor} ${feedback !== "empty" ? "animate-flip" : ""}`}
  style={{ animationDelay: `${index * 100}ms` }}
/>
```

### Pros
- ✅ Zero dependencies
- ✅ Lightweight (no bundle impact)
- ✅ Hardware-accelerated
- ✅ Already implemented and working
- ✅ Stagger timing via inline styles
- ✅ Good browser support
- ✅ Can use Tailwind arbitrary values

### Cons
- ⚠️ Limited control over animation state
- ⚠️ Harder to coordinate complex sequences
- ⚠️ CSS-in-JS mixing (inline styles for delays)
- ⚠️ No spring physics
- ⚠️ Manual cleanup required

### Performance
- **60 FPS**: Yes (transform is GPU-accelerated)
- **Bundle Size**: 0 bytes
- **Runtime Overhead**: Minimal

## Option 2: Framer Motion

### Installation
```bash
npm install framer-motion
```

### Example Implementation
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ rotateX: 0 }}
  animate={{ rotateX: [0, 90, 0] }}
  transition={{
    duration: 0.6,
    delay: index * 0.1,
    ease: "easeInOut"
  }}
  className={bgColor}
>
  {letter}
</motion.div>
```

### Pros
- ✅ Declarative React API
- ✅ Built-in stagger support
- ✅ Spring physics available
- ✅ Easy state-based animations
- ✅ Gesture support (drag, tap)
- ✅ Layout animations
- ✅ Powerful orchestration
- ✅ Better TypeScript support

### Cons
- ❌ Additional dependency (~54KB gzipped)
- ❌ Learning curve for team
- ❌ More React re-renders
- ❌ Overkill for simple animations
- ⚠️ Potential bundle size impact

### Performance
- **60 FPS**: Yes (uses transform/opacity)
- **Bundle Size**: +54KB gzipped
- **Runtime Overhead**: Moderate (React overhead)

## Decision Matrix

| Criteria | CSS Animations | Framer Motion | Winner |
|----------|----------------|---------------|--------|
| **Bundle Size** | 0 KB | +54 KB | CSS |
| **Implementation Speed** | Already done | Need to refactor | CSS |
| **Maintainability** | Moderate | High | Framer |
| **Animation Control** | Basic | Advanced | Framer |
| **Team Learning Curve** | Low | Moderate | CSS |
| **Future Flexibility** | Limited | High | Framer |
| **Performance** | Excellent | Good | CSS |
| **Code Readability** | Good | Excellent | Framer |

## Recommendation: CSS Animations

### Rationale
1. **Already Implemented**: Flip animation is working and tested (28/28 tests passing)
2. **Zero Bundle Impact**: No additional dependencies
3. **Sufficient for Requirements**: All design requirements can be met with CSS
4. **Performance**: Hardware-accelerated transforms are optimal
5. **Simplicity**: Aligns with project values (avoid over-engineering)

### Implementation Plan for Remaining Animations

#### 1. Tile Flip (Already Done ✅)
```css
/* globals.css - Already implemented */
@keyframes flip {
  0% { transform: rotateX(0); }
  50% { transform: rotateX(90deg); }
  100% { transform: rotateX(0); }
}
```

#### 2. Keyboard Press Feedback (Add)
```css
/* globals.css */
@keyframes key-press {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.animate-key-press {
  animation: key-press 0.15s ease-in-out;
}
```
Already using `active:scale-95` in Tailwind - can enhance with CSS animation if needed.

#### 3. Win Celebration (Add)
```css
/* globals.css */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

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

.animate-bounce {
  animation: bounce 0.5s ease-in-out;
}

.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out;
}
```

#### 4. Loss State (Add)
```css
/* globals.css */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}
```

### When to Reconsider Framer Motion
Consider switching to Framer Motion if:
- Need gesture-based interactions (drag/drop games)
- Require complex animation orchestration
- Want layout animations (shared element transitions)
- Team prefers declarative React APIs
- Bundle size is not a concern

## Testing Results

### CSS Animation Performance
- **Tile Flip**: 60 FPS ✅
- **Stagger Delay**: Working correctly ✅
- **All Tests**: 28/28 passing ✅
- **Bundle Size Impact**: 0 bytes ✅

### Browser Compatibility
- Chrome: ✅ Supported
- Firefox: ✅ Supported
- Safari: ✅ Supported
- Edge: ✅ Supported
- Mobile: ✅ Supported (iOS/Android)

## Conclusion

**Stick with CSS Animations** for the Word Challenge widget. The current implementation meets all requirements, has zero dependencies, and performs excellently. Add additional CSS animations for keyboard feedback and win/loss states as outlined above.

If future games require more complex interactions (drag-and-drop, gesture-based gameplay, shared element transitions), revisit Framer Motion at that time.

---

**Status**: ✅ Decision Made - CSS Animations
**Date**: 2026-01-19
**Reviewed By**: Technical Spike
