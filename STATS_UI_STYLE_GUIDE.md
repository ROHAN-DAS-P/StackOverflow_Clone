# Question Stats UI - Visual Style Guide

## Component Appearance

### QuestionCard - Compact Card Variant

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌─────────────┐  ┌─────────────┐                   │
│  │ ⬆   1       │  │ 💬   2      │  How to...       │
│  │ Votes       │  │ Answers     │  Lorem ipsum     │
│  └─────────────┘  └─────────────┘  dolor sit...    │
│                                                      │
│                   [react] [js] [web]                │
│                                                      │
│  asked Jan 1, 2024        👤 John Doe              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Style Details:**
- Background: Light gray (50) / Dark gray (800/50)
- Border: 1px solid gray (200) / gray (700/50)
- Padding: 0.75rem
- Border radius: 8px
- Hover: Slightly lighter background + subtle shadow
- Icon size: Large (text-lg)
- Font weight: Numbers are bold, labels are normal

### QuestionCard - Highlight State (With Answers)

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌─────────────┐  ┌──────────────────────────────┐ │
│  │ ⬆   5       │  │ 💬   3 Answers ⭐           │ │
│  │ Votes       │  │ (highlighted in amber)      │ │
│  └─────────────┘  └──────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Highlight Details:**
- Amber background: amber-50 (light) / amber-950/20 (dark)
- Border color: amber-200 (light) / amber-700/50 (dark)
- Text color: amber-600 (light) / amber-400 (dark)
- Indicates question has answers

### QuestionDetail - Minimal Variant

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│ User Avatar  │ Author Name      │ 👎  ⬆ 5    💬 2  👍 │
│              │ Jan 1, 2024      │      Votes Answers  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Style Details:**
- No visible box/border
- Text-only styling
- Compact spacing
- Votes/Answers display only numbers and labels (no icons in boxes)
- Hover: Text color changes to blue-600 (light) / blue-400 (dark)
- Vote buttons on sides (👎 and 👍)

### Responsive Behavior

#### Desktop (≥ 1024px)
```
┌─────────────────┐
│ ⬆ 5    💬 2    │  Full card stats in QuestionCard
│ Votes  Answers │  Side-by-side layout
└─────────────────┘
```

#### Tablet (768px - 1023px)
```
┌─────────────────┐
│ ⬆ 5  💬 2      │  Slightly compressed but same layout
└─────────────────┘
```

#### Mobile (< 768px)
```
┌─────────────┐
│ ⬆ 5 Votes  │  Stacked layout if needed
│ 💬 2 Ans.  │  Or horizontal with smaller text
└─────────────┘
```

## Color Schemes

### Light Mode
```
Background (inactive):     #f9fafb (gray-50)
Border (inactive):         #e5e7eb (gray-200)
Border (hover):            #d1d5db (gray-300)
Background (hover):        #f3f4f6 (gray-100)

Text (primary):            #111827 (gray-900)
Text (secondary):          #6b7280 (gray-600)
Text (tertiary):           #9ca3af (gray-400)

Background (highlight):    #fef3c7 (amber-50)
Border (highlight):        #fcd34d (amber-200)
Text (highlight):          #b45309 (amber-600)

Hover (interactive):       #2563eb (blue-600)
Success color:             #16a34a (green-600)
Error color:               #dc2626 (red-600)
```

### Dark Mode
```
Background (inactive):     #1f2937/0.5 (gray-800/50)
Border (inactive):         #374151/0.5 (gray-700/50)
Border (hover):            #4b5563 (gray-600)
Background (hover):        #374151/0.7 (gray-700/70)

Text (primary):            #ffffff (white)
Text (secondary):          #d1d5db (gray-300)
Text (tertiary):           #6b7280 (gray-400)

Background (highlight):    #78350f/0.2 (amber-950/20)
Border (highlight):        #a16207/0.5 (amber-700/50)
Text (highlight):          #fbbf24 (amber-400)

Hover (interactive):       #60a5fa (blue-400)
Success color:             #4ade80 (green-400)
Error color:               #f87171 (red-400)
```

## Typography

### Card Variant
```
Icon size:        text-lg (1.125rem)
Value (number):   text-sm / font-semibold / text-gray-900
Label text:       text-xs / text-gray-600
Letter spacing:   normal
Line height:      tight (1.25)
```

### Minimal Variant
```
Icon size:        text-lg (1.125rem)
Value (number):   text-sm / font-semibold
Label text:       text-xs
Letter spacing:   normal
Line height:      tight (1.25)
```

## Spacing & Sizing

### Component Dimensions
```
Card variant:
  - Padding: px-3 py-2 (0.75rem)
  - Gap between icon/text: 0.5rem
  - Border radius: 0.5rem (8px)
  - Min height: ~2.5rem (40px)

Minimal variant:
  - Padding: px-2 py-1 (minimal)
  - Gap between icon/text: 0.5rem
  - Border radius: none
  - Min height: ~1.5rem (24px)

Container gaps:
  - Between stat items: 0.75rem (12px)
  - In vertical layout: 1rem (16px)
```

## Animations & Transitions

### Hover Transitions
```
Duration:         200ms (0.2s)
Timing function:  ease-in-out
Properties:
  - background-color
  - border-color
  - box-shadow
  - color (for minimal variant)
```

### Interactive States
```
Normal:   cursor-pointer, select-none
Hover:    slight background change, subtle shadow
Active:   deeper color, maintained transitions
Disabled: opacity-50, cursor-not-allowed (if applicable)
```

## Focus States (Accessibility)

```
Focus ring:
  - Width: 2px
  - Color: blue-500 (light) / blue-400 (dark)
  - Offset: 2px
  - Border radius: inherited from element
```

## Icon Reference

| Icon | Purpose | Size |
|------|---------|------|
| ⬆ | Votes/Upvote | text-lg |
| 💬 | Answers | text-lg |
| 👍 | Upvote button | Default |
| 👎 | Downvote button | Default |

## Usage Examples

### In QuestionCard
```jsx
<QuestionStats 
  votes={5}
  answers={2}
  layout="compact"
  variant="card"
/>
```

### In QuestionDetail
```jsx
<button onClick={() => handleVote('downvote')}>👎</button>
<QuestionStats
  votes={5}
  answers={2}
  layout="compact"
  variant="minimal"
  interactive={true}
  onVoteClick={handleVote}
/>
<button onClick={() => handleVote('upvote')}>👍</button>
```

## Accessibility Checklist

- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation supported (Tab, Enter)
- ✅ Focus visible styling
- ✅ Color contrast ratio ≥ 4.5:1 (WCAG AA)
- ✅ Semantic HTML (button elements)
- ✅ No hover-only information
- ✅ Proper button types and roles
- ✅ Screen reader friendly labels

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Flexbox | ✅ | ✅ | ✅ | ✅ |
| CSS Transitions | ✅ | ✅ | ✅ | ✅ |
| Focus Ring | ✅ | ✅ | ✅ | ✅ |
| CSS Grid | ✅ | ✅ | ✅ | ✅ |
| Dark Mode | ✅ | ✅ | ✅ | ✅ |

---

*Last Updated: May 13, 2026*
*Component: QuestionStats.jsx*
*Status: Production Ready*
