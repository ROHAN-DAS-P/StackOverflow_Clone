# QuestionStats Component - Implementation Guide

## Overview

The `QuestionStats` component is a modern, reusable React component that displays question statistics (votes and answers count) with a clean, modern design inspired by Stack Overflow, GitHub, and modern SaaS dashboards.

## File Location

```
frontend/src/components/stats/QuestionStats.jsx
```

## Component Architecture

### Main Export: `QuestionStats`
The wrapper component that manages layout and renders child `StatItem` components.

```jsx
export default function QuestionStats({
  votes = 0,              // Number of votes (default: 0)
  answers = 0,            // Number of answers (default: 0)
  layout = 'compact',     // Layout mode: 'compact' or 'vertical'
  variant = 'card',       // Visual style: 'card' or 'minimal'
  interactive = true,     // Enable/disable interactivity
  onVoteClick = null,     // Callback function for vote actions
  className = ''          // Additional CSS classes
})
```

### Sub-component: `StatItem`
Individual stat display with icon, label, and value.

```jsx
function StatItem({
  icon,                   // Icon character (emoji)
  label,                  // Stat label ('Votes', 'Answers')
  value,                  // Numeric value to display
  variant = 'card',       // Visual style: 'card' or 'minimal'
  interactive = true,     // Enable/disable interactivity
  layout = 'horizontal',  // Layout: 'horizontal' or 'vertical'
  highlight = false,      // Highlight state (for answers > 0)
  onClick = null          // Click handler
})
```

## Usage Examples

### Basic Usage in QuestionCard
```jsx
import QuestionStats from '../stats/QuestionStats'

export default function QuestionCard({ question }) {
  return (
    <div className="card">
      <QuestionStats 
        votes={question.votes_count || 0}
        answers={question.answers_count || 0}
        layout="compact"
        variant="card"
      />
      {/* Rest of card content */}
    </div>
  )
}
```

### With Interaction in QuestionDetail
```jsx
import QuestionStats from '../../components/stats/QuestionStats'

export default function QuestionDetail() {
  const handleVoteQuestion = (voteType) => {
    // Handle vote logic
    questionsService.vote(id, voteType)
  }

  return (
    <div>
      <button onClick={() => handleVoteQuestion('downvote')}>👎</button>
      <QuestionStats
        votes={question.votes_count || 0}
        answers={question.answers_count || 0}
        layout="compact"
        variant="minimal"
        interactive={true}
        onVoteClick={handleVoteQuestion}
      />
      <button onClick={() => handleVoteQuestion('upvote')}>👍</button>
    </div>
  )
}
```

### Vertical Layout (Future Use)
```jsx
<QuestionStats 
  votes={10}
  answers={5}
  layout="vertical"
  variant="card"
/>
```

## Layout Modes

### Compact Layout
- **Use case:** Question cards, listings, compact displays
- **Orientation:** Horizontal (side-by-side)
- **Spacing:** Tight (gap-3 between items)
- **Icon position:** Left of text
- **Text layout:** Stacked (number above label)

```
┌──────────────┐  ┌──────────────┐
│ ⬆ 5 Votes    │  │ 💬 2 Answers │
└──────────────┘  └──────────────┘
```

### Vertical Layout
- **Use case:** Sidebar stats, detailed views, stacked information
- **Orientation:** Vertical (stacked)
- **Spacing:** Regular (gap-4 between items)
- **Icon position:** Top
- **Text layout:** Stacked below icon

```
┌──────────────┐
│      ⬆       │
│      5       │
│    Votes     │
└──────────────┘
     and
┌──────────────┐
│      💬      │
│      2       │
│   Answers    │
└──────────────┘
```

## Visual Variants

### Card Variant
- **Use case:** Standalone stats boxes, question cards
- **Features:**
  - Visible background color
  - Border styling
  - Rounded corners
  - Shadow on hover
  - Prominent visual presence

**CSS:**
```css
bg-gray-50 dark:bg-gray-800/50
border border-gray-200 dark:border-gray-700/50
rounded-lg px-3 py-2
hover:bg-gray-100 hover:shadow-sm
hover:border-gray-300 hover:border-gray-600
```

### Minimal Variant
- **Use case:** Inline stats, detail page footers, compact displays
- **Features:**
  - No background or border
  - Text-based styling only
  - Color changes on hover
  - Minimal visual footprint
  - Clean, unobtrusive look

**CSS:**
```css
px-2 py-1
text-gray-700 dark:text-gray-300
hover:text-blue-600 dark:hover:text-blue-400
```

## Highlight State

The component automatically highlights stats when `answers > 0`.

**Highlight Colors:**
```
Light mode:
  - Background: amber-50
  - Border: amber-200
  - Text: amber-600

Dark mode:
  - Background: amber-950/20
  - Border: amber-700/50
  - Text: amber-400
```

**Styling:**
```jsx
${highlight ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-700/50' : ''}
```

## Interactive Features

### Click Handlers
```jsx
// Single click on upvote icon
onClick={() => onVoteClick?.('upvote')}

// Single click on downvote icon (external buttons)
onClick={() => onVoteClick?.('downvote')}
```

### Visual Feedback
- **Hover state:** Background color transition, subtle shadow
- **Active state:** Maintained through CSS transitions
- **Focus state:** Blue ring (2px) with offset
- **Disabled state:** Cursor changes to default

### Accessibility
- ARIA labels for screen readers
- Keyboard navigation support (Tab)
- Semantic button elements
- Focus visible styling
- No hover-only information

## Responsive Behavior

The component is responsive by default using Tailwind's flex utilities:
- **Desktop:** Full spacing, full size cards
- **Tablet:** Slightly compressed but maintains layout
- **Mobile:** Responsive padding and text sizing

No additional responsive props needed - uses Tailwind's responsive utilities (sm:, md:, lg:, etc.)

## Dark Mode Support

The component fully supports Tailwind's dark mode:

```jsx
// Light mode
bg-gray-50 dark:bg-gray-800/50
border-gray-200 dark:border-gray-700/50

// Dark mode automatically applied when dark class is on parent
```

Ensure your layout has dark mode enabled:
```html
<html class="dark"> <!-- or determined by theme preference -->
  <!-- Content -->
</html>
```

## Performance Considerations

### Optimization Strategies
1. **Memoization:** Component doesn't need memoization unless used in large lists
2. **Rendering:** Minimal re-renders due to simple state management
3. **CSS:** Uses only Tailwind utility classes (zero additional CSS)
4. **Bundle size:** ~1.5KB minified (very lightweight)

### Potential Future Optimizations
```jsx
import { memo } from 'react'

const QuestionStats = memo(function QuestionStats({ ... }) {
  // Component code
}, (prevProps, nextProps) => {
  // Custom comparison for shallow equal check
  return prevProps.votes === nextProps.votes &&
         prevProps.answers === nextProps.answers &&
         prevProps.layout === nextProps.layout &&
         prevProps.variant === nextProps.variant
})
```

## Customization

### Adding Custom CSS Classes
```jsx
<QuestionStats 
  votes={5}
  answers={2}
  className="custom-stats-wrapper"
  layout="compact"
  variant="card"
/>
```

### Creating Variants
To create a new variant style, extend the component:

```jsx
function CustomStatItem({ ... }) {
  // Custom styling logic
  const customStyles = `
    // Your custom CSS
  `
  return (
    <button className={`${baseStyles} ${customStyles}`}>
      {/* Content */}
    </button>
  )
}
```

## Testing

### Unit Test Example
```jsx
import { render, screen } from '@testing-library/react'
import QuestionStats from './QuestionStats'

describe('QuestionStats', () => {
  test('renders vote and answer counts', () => {
    render(<QuestionStats votes={5} answers={2} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  test('shows highlight state when answers > 0', () => {
    const { container } = render(<QuestionStats votes={0} answers={5} />)
    const answerItem = container.querySelector('[aria-label*="Answers"]')
    expect(answerItem).toHaveClass('bg-amber-50')
  })

  test('handles vote clicks', () => {
    const onVoteClick = jest.fn()
    render(
      <QuestionStats 
        votes={5} 
        answers={2}
        interactive={true}
        onVoteClick={onVoteClick}
      />
    )
    // Test click interaction
  })
})
```

### Integration Test Checklist
- [ ] Displays correct values
- [ ] Highlight state works
- [ ] Click handlers trigger
- [ ] Dark mode styling applies
- [ ] Responsive on all screen sizes
- [ ] Accessible with keyboard
- [ ] Screen reader reads labels
- [ ] No console warnings

## Troubleshooting

### Issue: Stats not displaying
**Solution:** Check that `votes` and `answers` props are numbers
```jsx
// ❌ Wrong
<QuestionStats votes="5" answers="2" />

// ✅ Correct
<QuestionStats votes={5} answers={2} />
```

### Issue: Dark mode not working
**Solution:** Ensure dark mode is enabled in Tailwind config
```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
  // ...
}
```

### Issue: Click handler not working
**Solution:** Ensure you're passing the callback correctly
```jsx
// ❌ Wrong
<QuestionStats onVoteClick={handleVote()} /> // Called immediately

// ✅ Correct
<QuestionStats onVoteClick={handleVote} /> // Passed as reference

// Usage in handler
const handleVote = (voteType) => {
  console.log(voteType) // 'upvote' or 'downvote'
}
```

### Issue: Icons not showing
**Solution:** Ensure emoji support in your browser/font
- Modern browsers all support emoji
- Check terminal/console for rendering issues
- Alternative: Replace emoji icons with SVG or font icons

## Future Enhancements

### Potential Additions
1. **Animated counters** - Animate when votes/answers change
2. **Custom icons** - Accept icon components as props
3. **Tooltip support** - Show additional info on hover
4. **Size variants** - 'xs', 'sm', 'md', 'lg' sizes
5. **Color customization** - Custom color schemes via props
6. **Badge indicators** - Show "Accepted" or "Popular" badges
7. **Accessibility options** - Reduced motion support
8. **Statistics details** - Hover to see detailed breakdown

### Example Enhancement
```jsx
// Future: Custom size variant
<QuestionStats 
  votes={5}
  answers={2}
  layout="compact"
  variant="card"
  size="lg"  // New prop
  animate={true}  // New prop for animations
/>
```

## Related Files

- `frontend/src/components/cards/QuestionCard.jsx` - Uses QuestionStats
- `frontend/src/pages/questions/QuestionDetail.jsx` - Uses QuestionStats
- `frontend/tailwind.config.js` - Tailwind configuration

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | May 13, 2026 | Initial release with card and minimal variants |

---

**Last Updated:** May 13, 2026  
**Status:** Production Ready  
**Maintenance:** Regular updates as needed
