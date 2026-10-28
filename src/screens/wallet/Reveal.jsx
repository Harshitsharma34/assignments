import { motion, useTransform } from 'framer-motion'
import { easeOutCubic, revealWindow, useIntroTimeline } from '../../components/coin/timeline.js'

// A wallet block whose entrance is read straight off the intro timeline, so the DOM and the
// 3D camera can never drift apart. Opacity and transform only: no layout shift.
export default function Reveal({ i, children, className = '' }) {
  const timeline = useIntroTimeline()
  const range = revealWindow(i)
  const opacity = useTransform(timeline, range, [0, 1], { ease: easeOutCubic })
  const y = useTransform(timeline, range, [14, 0], { ease: easeOutCubic })
  return <motion.div style={{ opacity, y }} className={className}>{children}</motion.div>
}
