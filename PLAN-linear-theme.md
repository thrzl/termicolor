# Linear Theme Implementation Plan

## Overview
Transform Termicolor from cyberpunk/phosphor green aesthetic to a modern "Linear-style" purple gradient glass theme. This is a popular SaaS aesthetic used by Linear, Raycast, Arc, and other modern dev tools.

## Design System

### Color Palette
```
Background:       #0a0a0f (deep navy-black)
Surface:          #12121a (slightly lighter)
Card:             rgba(18, 18, 30, 0.6) with blur
Border:           rgba(139, 92, 246, 0.1) (purple tint)
Border Hover:     rgba(139, 92, 246, 0.3)

Primary Accent:   #8b5cf6 (violet-500)
Secondary:        #a78bfa (violet-400)
Gradient:         linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #f97316 100%)
                  (purple → pink → orange)

Text Primary:     #f1f5f9 (slate-100)
Text Secondary:   #94a3b8 (slate-400)
Text Muted:       #64748b (slate-500)

Success:          #22c55e (green-500)
Warning:          #f59e0b (amber-500)
Error:            #ef4444 (red-500)
```

### Typography
- Keep Space Grotesk for headings
- Keep JetBrains Mono for code/terminal
- Slightly softer font weights

### Effects
- Glassmorphism: backdrop-filter blur(20px)
- Subtle purple glow on hover (box-shadow)
- Gradient text for hero title
- Softer, more refined shadows

---

## Files to Modify

### 1. `src/theme.ts` (if exists) or `src/styles.css`
- Update CSS variables for new color system
- Replace green (#39ff14) with purple (#8b5cf6)
- Update gradients

### 2. `src/App.tsx`
- Hero section: purple gradient glow, gradient text title
- Update border colors from green to purple
- Update button styles
- Dark/light dropdown styling

### 3. `src/components/layout/AppShell.tsx`
- Background gradient adjustments
- Grid/noise overlay tweaks

### 4. `src/components/preview/TerminalPreview.tsx`
- Glow effect: purple instead of green
- Scanlines: keep but subtle
- Title bar styling

### 5. `src/components/mapping/*.tsx`
- ANSIColorGrid: purple accent badges
- ColorMapper: purple buttons, borders
- ColorSlotEditor: purple glow on swatches
- ReadabilityScore: keep functional, update accent

### 6. `src/components/image/*.tsx`
- ImageDropzone: purple border, icon
- ImagePreview: purple accents

### 7. `src/components/palette/ColorPaletteGrid.tsx`
- Selection ring: purple

### 8. `src/components/profiles/*.tsx`
- ProfileCard: purple hover glow
- ProfileList: purple accents

### 9. `public/favicon.svg`
- Update gradient from green to purple

---

## Implementation Order

### Phase 1: Core Styling (styles.css / theme)
1. Define new CSS variables
2. Update background colors
3. Update accent colors (green → purple)

### Phase 2: App Shell & Hero
4. AppShell background
5. Hero section glow and title gradient
6. Tab styling
7. Button styling

### Phase 3: Components
8. Terminal preview glow
9. Color mapping components
10. Image dropzone
11. Profile cards

### Phase 4: Polish
12. Favicon
13. Hover states consistency
14. Final tweaks

---

## Verification
- [ ] No green (#39ff14) references remain
- [ ] All interactive elements have purple accents
- [ ] Glassmorphism consistent across cards
- [ ] Build passes: `bun run build`
- [ ] Visual review at 1280px viewport

---

## Notes
- Keep all functionality from cyberpunk branch
- This is purely a visual/styling change
- Maintain the same layout structure
