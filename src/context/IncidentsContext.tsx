import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  createDemoIncidents,
  incidentReducer,
  type Incident,
  type IncidentAction,
} from '../domain/incidents'
import {
  loadIncidents,
  parseStoredIncidents,
  saveIncidents,
  STORAGE_KEY,
} from '../domain/storage'

type Context = {
  incidents: Incident[]
  dispatch: (action: IncidentAction) => void
  reset: () => void
  warning: string
  notice: string
  notify: (message: string) => void
}
const IncidentsContext = createContext<Context | null>(null)

export function IncidentsProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => {
    try {
      return loadIncidents(window.localStorage)
    } catch {
      return {
        incidents: createDemoIncidents(),
        writable: false,
        warning:
          'El navegador no permite guardar datos. Los cambios se mantendrán solo mientras esta página esté abierta.',
      }
    }
  })
  const [incidents, setIncidents] = useState(initial.incidents)
  const [warning, setWarning] = useState(initial.warning)
  const [notice, setNotice] = useState('')
  const writable = useRef(initial.writable)

  useEffect(() => {
    if (!writable.current) return
    try {
      saveIncidents(window.localStorage, incidents)
    } catch {
      setWarning(
        'No pudimos guardar los últimos cambios en este navegador. Conserva esta página abierta o descarga una copia desde Datos de demostración.',
      )
    }
  }, [incidents])

  useEffect(() => {
    if (!notice) return
    const id = window.setTimeout(() => setNotice(''), 4500)
    return () => window.clearTimeout(id)
  }, [notice])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return
      try {
        const updated = parseStoredIncidents(event.newValue)
        if (writable.current) setIncidents(updated)
      } catch {
        setWarning(
          'Otra pestaña guardó datos que no pudimos leer. Se conservó la información de esta página.',
        )
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const dispatch = useCallback(
    (action: IncidentAction) =>
      setIncidents((current) => incidentReducer(current, action)),
    [],
  )
  const reset = useCallback(() => {
    const examples = createDemoIncidents()
    try {
      saveIncidents(window.localStorage, examples)
      writable.current = true
      setWarning('')
    } catch {
      writable.current = false
      setWarning(
        'Los datos se reiniciaron en esta página, pero el navegador no permite guardarlos.',
      )
    }
    setIncidents(examples)
    setNotice('Se restauraron los tres incidentes de ejemplo.')
  }, [])

  const value = useMemo(
    () => ({ incidents, dispatch, reset, warning, notice, notify: setNotice }),
    [incidents, dispatch, reset, warning, notice],
  )
  return (
    <IncidentsContext.Provider value={value}>
      {children}
    </IncidentsContext.Provider>
  )
}

export function useIncidents() {
  const context = useContext(IncidentsContext)
  if (!context) throw new Error('Falta IncidentsProvider.')
  return context
}

export function actionMeta() {
  return { at: new Date().toISOString(), eventId: crypto.randomUUID() }
}
