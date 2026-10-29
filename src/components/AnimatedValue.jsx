import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'

// Counts between values so balance changes read as money moving, not a number swapping.
export default function AnimatedValue({ value, format, duration = 0.9, from: start }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce || start == null ? value : start)
  const from = useRef(start ?? value)

  useEffect(() => {
    if (reduce) {
      setShown(value)
      from.current = value
      return
    }
    const controls = animate(from.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(v),
    })
    from.current = value
    return () => controls.stop()
  }, [value, reduce, duration])

  return <>{format(Math.round(shown * 100) / 100)}</>
}
