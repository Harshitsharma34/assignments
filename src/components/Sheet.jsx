import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

// Bottom sheet scoped to the phone viewport. Escape and backdrop close it; focus moves in and back.
export default function Sheet({ open, onClose, title, children }) {
  const panel = useRef(null)
  const opener = useRef(null)

  useEffect(() => {
    if (!open) return
    opener.current = document.activeElement
    const t = setTimeout(() => panel.current?.focus(), 30)
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      opener.current?.focus?.()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <button aria-label="Close" className="absolute inset-0 cursor-default bg-ink/35" onClick={onClose} tabIndex={-1} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className="relative max-h-[86%] w-full overflow-y-auto rounded-t-[28px] border-t border-line bg-surface px-5 pb-8 pt-3 no-scrollbar focus:outline-none"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => (info.offset.y > 110 || info.velocity.y > 600) && onClose()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-strong" aria-hidden="true" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-ink-2 hover:text-ink">
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
