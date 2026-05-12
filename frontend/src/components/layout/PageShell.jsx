/**
 * Fluid page container: full width of parent with responsive horizontal padding.
 * Use for main app views (no narrow max-width column).
 */
export default function PageShell({ children, className = '' }) {
  return (
    <div
      className={`w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 ${className}`}
    >
      {children}
    </div>
  )
}
