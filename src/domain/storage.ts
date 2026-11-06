import {
  calculatePriority,
  createDemoIncidents,
  STATUSES,
  type Incident,
} from './incidents'

export const STORAGE_KEY = 'soluciona-ti:incidents:v1'
type Store = Pick<Storage, 'getItem' | 'setItem'>
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)
const text = (value: unknown): value is string =>
  typeof value === 'string' && !!value.trim()
const date = (value: unknown): value is string =>
  text(value) && Number.isFinite(Date.parse(value))

export function parseStoredIncidents(raw: string): Incident[] {
  const data: unknown = JSON.parse(raw)
  if (!object(data) || data.version !== 1 || !Array.isArray(data.incidents))
    throw new Error('Formato de datos no compatible.')
  const ids = new Set<string>()
  for (const item of data.incidents) {
    if (
      !object(item) ||
      !text(item.id) ||
      !/^INC-\d+$/.test(item.id) ||
      ids.has(item.id)
    )
      throw new Error('Código de incidente no válido.')
    ids.add(item.id)
    if (
      !['title', 'description', 'service', 'area', 'reporter'].every((k) =>
        text(item[k]),
      )
    )
      throw new Error('Faltan datos del incidente.')
    if (
      ![1, 2, 3].includes(Number(item.impact)) ||
      typeof item.impact !== 'number' ||
      ![1, 2, 3].includes(Number(item.urgency)) ||
      typeof item.urgency !== 'number'
    )
      throw new Error('Clasificación no válida.')
    if (
      item.priority !==
      calculatePriority(item.impact as 1 | 2 | 3, item.urgency as 1 | 2 | 3)
    )
      throw new Error('Prioridad no válida.')
    if (
      !STATUSES.includes(item.status as Incident['status']) ||
      !date(item.createdAt) ||
      !date(item.updatedAt)
    )
      throw new Error('Estado o fecha no válido.')
    if (item.status !== 'pending' && !text(item.assignedTo))
      throw new Error('Falta el responsable.')
    if (item.status === 'pending' && item.assignedTo !== null)
      throw new Error('Responsable no válido.')
    if (item.status === 'resolved' || item.status === 'closed') {
      if (
        !object(item.resolution) ||
        !text(item.resolution.solution) ||
        !text(item.resolution.verification) ||
        !date(item.resolution.at) ||
        !text(item.resolution.actor)
      )
        throw new Error('Falta la solución.')
    } else if (item.resolution !== null)
      throw new Error('Solución no válida para el estado.')
    if (item.status === 'closed') {
      if (
        !object(item.closure) ||
        !text(item.closure.confirmedBy) ||
        typeof item.closure.comment !== 'string' ||
        !date(item.closure.at)
      )
        throw new Error('Falta la confirmación de cierre.')
    } else if (item.closure !== null)
      throw new Error('Cierre no válido para el estado.')
    if (
      !Array.isArray(item.history) ||
      !item.history.length ||
      !item.history.every(
        (e) =>
          object(e) &&
          text(e.id) &&
          ['registered', 'started', 'resolved', 'reopened', 'closed'].includes(
            String(e.kind),
          ) &&
          text(e.title) &&
          typeof e.detail === 'string' &&
          text(e.actor) &&
          date(e.at),
      )
    )
      throw new Error('Historial no válido.')
  }
  return data.incidents as Incident[]
}

export function loadIncidents(store: Store): {
  incidents: Incident[]
  writable: boolean
  warning: string
} {
  try {
    const raw = store.getItem(STORAGE_KEY)
    return {
      incidents: raw ? parseStoredIncidents(raw) : createDemoIncidents(),
      writable: true,
      warning: '',
    }
  } catch {
    return {
      incidents: createDemoIncidents(),
      writable: false,
      warning:
        'No pudimos leer los datos guardados. Puedes explorar la demostración sin reemplazarlos. Reinicia los datos para volver a guardar cambios.',
    }
  }
}

export function saveIncidents(store: Store, incidents: Incident[]) {
  store.setItem(STORAGE_KEY, JSON.stringify({ version: 1, incidents }))
}
