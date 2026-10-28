import { AnimatePresence, motion } from 'framer-motion'

export default function Toast({ toast }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-40 flex justify-center px-5" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="flex items-center gap-2 rounded-full border border-line bg-ink-700/95 px-4 py-2.5 text-[14px] text-fg shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
          >
            {toast.icon}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
