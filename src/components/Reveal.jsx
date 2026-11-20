import { useEffect, useRef } from 'react'

// Fades its children in as they scroll into view. Content is visible by default; only
// elements that start below the fold are hidden (and only once JS is running), so crawlers,
// screenshots and reduced-motion users always see everything.
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    if (el.getBoundingClientRect().top < window.innerHeight) return

    el.classList.add('reveal-pending')
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.remove('reveal-pending')
        io.disconnect()
      }
    }, { rootMargin: '0px 0px -40px 0px' })
    io.observe(el)
    return () => {
      io.disconnect()
      el.classList.remove('reveal-pending')
    }
  }, [])

  return (
    <Tag ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined} {...rest}>
      {children}
    </Tag>
  )
}
