import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import ReviewPanel from './components/ReviewPanel.jsx'
import ScoinGlyph from './components/ScoinGlyph.jsx'
import Toast from './components/Toast.jsx'
import { useWallet } from './lib/useWallet.js'
import { formatRupees, inAppValue } from './lib/scoins.js'
import NextBuild from './screens/NextBuild.jsx'
import Wallet from './screens/Wallet.jsx'

const SEEN_KEY = 'scoins-intro-seen'

function readSeen() {
  try { return localStorage.getItem(SEEN_KEY) === '1' } catch { return false }
}
function writeSeen() {
  try { localStorage.setItem(SEEN_KEY, '1') } catch { /* storage unavailable: intro simply plays in full next time */ }
}
const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const wallet = useWallet('active')
  const [reduced, setReduced] = useState(prefersReduced)
  const [intro, setIntro] = useState(() => ({ mode: prefersReduced() ? 'none' : readSeen() ? 'short' : 'full', skip: false, run: 0 }))
  const [revealed, setRevealed] = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const [route, setRoute] = useState('wallet')
  const [toast, setToast] = useState(null)
  const scroller = useRef(null)

  const notify = useCallback((t) => setToast({ id: Date.now(), ...t }), [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const ev = wallet.state.lastEvent
  useEffect(() => {
    if (!ev) return
    if (ev.type === 'reward') {
      notify({ icon: <ScoinGlyph size={16} />, text: `+${ev.scoins} Scoins added · ${formatRupees(inAppValue(ev.scoins))} to spend` })
      scroller.current?.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    } else {
      notify({ text: `Payment counted · ${ev.left} more for your bonus` })
    }
  }, [ev, notify, reduced])

  const replay = (mode) => {
    setRoute('wallet')
    scroller.current?.scrollTo({ top: 0 })
    setRevealed(false)
    setIntroDone(false)
    setIntro((i) => ({ mode: reduced ? 'none' : mode, skip: false, run: i.run + 1 }))
  }

  const setUserState = (id) => {
    wallet.dispatch({ type: 'switch', stateId: id })
    setRoute('wallet')
    scroller.current?.scrollTo({ top: 0 })
  }

  const onReduced = (on) => {
    setReduced(on)
    if (on) setIntro((i) => ({ ...i, skip: true }))
  }

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <div className="flex min-h-full flex-col items-center gap-6 py-0 sm:py-8 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
        <div className="relative h-[100dvh] w-full overflow-hidden bg-ink-950 sm:h-[844px] sm:w-[390px] sm:rounded-[48px] sm:border sm:border-line sm:shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
          <StatusBar />

          <motion.div
            ref={scroller}
            className="absolute inset-0 overflow-y-auto no-scrollbar"
            animate={route === 'wallet' ? { x: 0, opacity: 1 } : { x: -60, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden={route !== 'wallet'}
            inert={route !== 'wallet' ? '' : undefined}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(120%_70%_at_50%_0%,rgba(232,181,71,0.10),transparent_70%)]" aria-hidden="true" />
            <Wallet
              key={intro.run}
              wallet={wallet}
              intro={intro}
              revealed={revealed}
              idleMotion={!reduced}
              onIntroReveal={() => setRevealed(true)}
              onIntroDone={() => { setIntroDone(true); writeSeen() }}
              navigate={setRoute}
              notify={notify}
            />
          </motion.div>

          <AnimatePresence>
            {route !== 'wallet' && (
              <motion.div
                key={route}
                className="absolute inset-0 z-30 overflow-y-auto bg-ink-950 no-scrollbar"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%', transition: { duration: 0.26, ease: [0.4, 0, 1, 1] } }}
                transition={{ type: 'spring', damping: 34, stiffness: 320 }}
              >
                <NextBuild route={route} balance={wallet.balance} onBack={() => setRoute('wallet')} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!introDone && intro.mode === 'full' && (
              <motion.button
                className="absolute bottom-10 left-1/2 z-40 min-h-[44px] -translate-x-1/2 rounded-full border border-line bg-ink-900/80 px-5 text-[14px] text-fg-2 hover:text-fg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.3 } }}
                exit={{ opacity: 0 }}
                onClick={() => setIntro((i) => ({ ...i, skip: true }))}
              >
                Skip intro
              </motion.button>
            )}
          </AnimatePresence>

          <Toast toast={toast} />
        </div>

        <div className="w-full px-4 pb-10 sm:w-auto sm:px-0 lg:pb-0">
          <ReviewPanel
            stateId={wallet.state.stateId}
            onState={setUserState}
            onUpi={() => wallet.dispatch({ type: 'upi' })}
            onReplay={replay}
            reduced={reduced}
            onReduced={onReduced}
          />
        </div>
      </div>
    </MotionConfig>
  )
}

function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-11 items-center justify-between bg-gradient-to-b from-ink-950 via-ink-950/80 to-transparent px-8 text-[15px] font-semibold text-fg" aria-hidden="true">
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <span className="flex items-end gap-[2px]">{[5, 7, 9, 11].map((h) => <span key={h} className="w-[3px] rounded-sm bg-fg" style={{ height: h }} />)}</span>
        <span className="ml-1 h-[11px] w-[22px] rounded-[3px] border border-fg/70 p-[1.5px]"><span className="block h-full w-[70%] rounded-[1px] bg-fg" /></span>
      </span>
    </div>
  )
}
