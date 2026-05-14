/**
 * Modern Question Stats Component
 * Displays votes and answers count with clean, modern styling
 * Responsive design with hover effects and dark mode support
 */
export default function QuestionStats({ 
  votes = 0, 
  answers = 0,
  layout = 'compact',
  variant = 'card',
  interactive = true,
  onVoteClick = null,
  className = ''
}) {
  // Compact horizontal layout (default for cards)
  if (layout === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Votes Stat */}
        <StatItem 
          icon="⬆" 
          label="Votes" 
          value={votes}
          variant={variant}
          interactive={interactive}
          onClick={() => onVoteClick?.('upvote')}
        />
        
        {/* Answers Stat */}
        <StatItem 
          icon="💬" 
          label="Answers" 
          value={answers}
          variant={variant}
          interactive={interactive}
          highlight={answers > 0}
        />
      </div>
    )
  }

  // Vertical/stacked layout (for detailed pages)
  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        {/* Votes Stat */}
        <StatItem 
          icon="⬆" 
          label="Votes" 
          value={votes}
          variant={variant}
          interactive={interactive}
          layout="vertical"
          onClick={() => onVoteClick?.('upvote')}
        />
        
        {/* Answers Stat */}
        <StatItem 
          icon="💬" 
          label="Answers" 
          value={answers}
          variant={variant}
          interactive={interactive}
          layout="vertical"
          highlight={answers > 0}
        />
      </div>
    )
  }

  return null
}

/**
 * Individual Stat Item Component
 */
function StatItem({ 
  icon, 
  label, 
  value, 
  variant = 'card',
  interactive = true,
  layout = 'horizontal',
  highlight = false,
  onClick = null
}) {
  const isVertical = layout === 'vertical'
  
  // Base styles for all variants
  const baseStyles = `
    inline-flex items-center
    transition-all duration-200 ease-in-out
    ${interactive ? 'cursor-pointer select-none' : ''}
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900
  `

  // Card variant - for QuestionCard
  const cardStyles = `
    px-3 py-2 rounded-lg
    bg-gray-50 dark:bg-gray-800/50
    border border-gray-200 dark:border-gray-700/50
    ${interactive ? 'hover:bg-gray-100 dark:hover:bg-gray-700/70 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm' : ''}
    ${highlight ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-700/50' : ''}
  `

  // Minimal variant - for detail pages
  const minimalStyles = `
    px-2 py-1
    ${interactive ? 'hover:text-blue-600 dark:hover:text-blue-400' : ''}
    ${highlight ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}
  `

  const wrapperStyles = variant === 'card' ? cardStyles : minimalStyles

  // Vertical layout specific
  if (isVertical) {
    return (
      <button
        onClick={onClick}
        disabled={!interactive}
        type="button"
        className={`${baseStyles} flex-col items-center gap-1 ${wrapperStyles}`}
        aria-label={`${label}: ${value}`}
      >
        <span className="text-2xl" aria-hidden="true">{icon}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{label}</span>
        <span className="text-lg font-bold text-gray-900 dark:text-white">{value}</span>
      </button>
    )
  }

  // Horizontal layout (compact)
  return (
    <button
      onClick={onClick}
      disabled={!interactive}
      type="button"
      className={`${baseStyles} gap-2 ${wrapperStyles}`}
      aria-label={`${label}: ${value}`}
    >
      <span className="text-lg" aria-hidden="true">{icon}</span>
      <div className="flex flex-col items-start">
        <span className="text-sm font-semibold leading-tight text-gray-900 dark:text-white">{value}</span>
        <span className="text-xs leading-tight text-gray-600 dark:text-gray-400 whitespace-nowrap">{label}</span>
      </div>
    </button>
  )
}

