import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react'

type Operation = {
  kind: 'create' | 'start' | 'resolve' | 'close' | 'reopen'
  incidentId: string
  onCommit: () => void
  onComplete?: () => void
}
const Context = createContext<{ isRunning: boolean; runAction: (operation: Operation) => void } | null>(null)

// A shared submission guard; illustrations belong to the incident itself.
export function ActionFeedbackProvider({ children }: { children: ReactNode }) {
  const locked = useRef(false)
  const runAction = useCallback((operation: Operation) => {
    if (locked.current) return
    locked.current = true
    try {
      operation.onCommit()
      operation.onComplete?.()
    } finally {
      queueMicrotask(() => { locked.current = false })
    }
  }, [])
  const value = useMemo(() => ({ isRunning: false, runAction }), [runAction])
  return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useActionFeedback() {
  const value = useContext(Context)
  if (!value) throw new Error('Falta ActionFeedbackProvider.')
  return value
}
