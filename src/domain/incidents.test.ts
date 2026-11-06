import { describe, expect, it } from 'vitest'
import {
  calculatePriority,
  createDemoIncidents,
  filterIncidents,
  incidentReducer,
  nextIncidentId,
  type IncidentAction,
  type NewIncident,
} from './incidents'
import {
  loadIncidents,
  parseStoredIncidents,
  saveIncidents,
  STORAGE_KEY,
} from './storage'

const at = '2026-11-05T14:30:00.000Z'
const meta = { at, eventId: 'event-test' }
const input: NewIncident = {
  title: '  No imprime el comprobante  ',
  description: '  La impresora no responde al terminar la venta.  ',
  service: 'Impresión de comprobantes',
  reporter: '  Ana Torres  ',
  area: 'Caja 01',
  impact: 1,
  urgency: 3,
}
const create = () => incidentReducer([], { type: 'create', input, ...meta })
const start = () =>
  incidentReducer(create(), {
    type: 'start',
    id: 'INC-001',
    technician: 'Carlos Ruiz',
    ...meta,
  })
const resolveAction: IncidentAction = {
  type: 'resolve',
  id: 'INC-001',
  solution: 'Se reinició el servicio de impresión.',
  verification: 'Se imprimieron dos comprobantes de prueba.',
  ...meta,
}
const resolve = () => incidentReducer(start(), resolveAction)
const closeAction: IncidentAction = {
  type: 'close',
  id: 'INC-001',
  confirmedBy: 'Ana Torres',
  comment: 'La impresión funciona.',
  confirmed: true,
  ...meta,
}

describe('prioridad y búsqueda', () => {
  it('clasifica los nueve escenarios de impacto y urgencia', () => {
    expect(
      [1, 2, 3].flatMap((impact) =>
        [1, 2, 3].map((urgency) =>
          calculatePriority(impact as 1 | 2 | 3, urgency as 1 | 2 | 3),
        ),
      ),
    ).toEqual([
      'low',
      'medium',
      'high',
      'medium',
      'high',
      'high',
      'high',
      'high',
      'high',
    ])
  })
  it('busca sin distinguir mayúsculas ni tildes y combina filtros', () => {
    const demo = createDemoIncidents(new Date(at))
    expect(
      filterIncidents(demo, 'ALMACEN', 'resolved', 'medium').map((i) => i.id),
    ).toEqual(['INC-003'])
    expect(filterIncidents(demo, 'ALMACEN', 'pending')).toEqual([])
    expect(filterIncidents(demo, 'ana torres')[0].id).toBe('INC-001')
  })
  it('genera códigos sin reutilizar un número anterior', () => {
    const demo = createDemoIncidents(new Date(at))
    expect(nextIncidentId(demo)).toBe('INC-004')
    expect(nextIncidentId([{ ...demo[0], id: 'INC-1000' }])).toBe('INC-1001')
  })
})

describe('ciclo de vida de un incidente', () => {
  it('registra y limpia espacios, sin inventar solución o responsable', () => {
    const [incident] = create()
    expect(incident).toMatchObject({
      id: 'INC-001',
      reporter: 'Ana Torres',
      title: 'No imprime el comprobante',
      status: 'pending',
      assignedTo: null,
      resolution: null,
      closure: null,
      priority: 'high',
    })
    expect(incident.history).toHaveLength(1)
  })
  it('rechaza datos vacíos y clasificaciones inválidas', () => {
    expect(
      incidentReducer([], {
        type: 'create',
        input: { ...input, title: ' ' },
        ...meta,
      }),
    ).toEqual([])
    expect(
      incidentReducer([], {
        type: 'create',
        input: { ...input, impact: 4 as 1 },
        ...meta,
      }),
    ).toEqual([])
  })
  it('no resuelve antes de iniciar la atención', () => {
    const current = create()
    expect(incidentReducer(current, resolveAction)).toBe(current)
  })
  it('asigna el responsable e inicia una sola vez', () => {
    const current = start()
    expect(current[0]).toMatchObject({
      assignedTo: 'Carlos Ruiz',
      status: 'working',
    })
    expect(current[0].history).toHaveLength(2)
    expect(
      incidentReducer(current, {
        type: 'start',
        id: 'INC-001',
        technician: 'María López',
        ...meta,
      }),
    ).toBe(current)
  })
  it('exige solución y pruebas y conserva el estado si faltan', () => {
    const current = start()
    expect(incidentReducer(current, { ...resolveAction, solution: ' ' })).toBe(
      current,
    )
    expect(
      incidentReducer(current, { ...resolveAction, verification: ' ' }),
    ).toBe(current)
    expect(resolve()[0].resolution?.actor).toBe('Carlos Ruiz')
  })
  it('no permite cerrar sin confirmación explícita del usuario', () => {
    const current = resolve()
    expect(incidentReducer(current, { ...closeAction, confirmed: false })).toBe(
      current,
    )
    expect(incidentReducer(current, { ...closeAction, confirmedBy: ' ' })).toBe(
      current,
    )
    expect(incidentReducer(start(), closeAction)[0].status).toBe('working')
  })
  it('registra el cierre y evita duplicar el evento', () => {
    const closed = incidentReducer(resolve(), closeAction)
    expect(closed[0].status).toBe('closed')
    expect(closed[0].closure).toMatchObject({
      confirmedBy: 'Ana Torres',
      comment: 'La impresión funciona.',
    })
    expect(closed[0].history.map((h) => h.kind)).toEqual([
      'registered',
      'started',
      'resolved',
      'closed',
    ])
    expect(incidentReducer(closed, closeAction)).toBe(closed)
  })
  it('devuelve el ticket a atención conservando la solución anterior en el historial', () => {
    const reopened = incidentReducer(resolve(), {
      type: 'reopen',
      id: 'INC-001',
      reason: 'La falla volvió al imprimir otra venta.',
      actor: 'Ana Torres',
      ...meta,
    })
    expect(reopened[0]).toMatchObject({
      status: 'working',
      assignedTo: 'Carlos Ruiz',
      resolution: null,
      closure: null,
    })
    expect(reopened[0].history[2].detail).toContain(
      'Se reinició el servicio de impresión.',
    )
    expect(reopened[0].history[3].kind).toBe('reopened')
  })
  it('atiende el ticket seleccionado y no modifica otro', () => {
    const demo = createDemoIncidents(new Date(at))
    const updated = incidentReducer(demo, {
      type: 'start',
      id: 'INC-001',
      technician: 'Diego Flores',
      ...meta,
    })
    expect(updated.find((i) => i.id === 'INC-002')).toBe(
      demo.find((i) => i.id === 'INC-002'),
    )
    expect(updated.find((i) => i.id === 'INC-001')?.assignedTo).toBe(
      'Diego Flores',
    )
  })
})

describe('persistencia en el navegador', () => {
  it('guarda y recupera el historial completo', () => {
    const data = incidentReducer(resolve(), closeAction)
    const values = new Map<string, string>()
    const store = {
      getItem: (key: string) => values.get(key) || null,
      setItem: (key: string, value: string) => {
        values.set(key, value)
      },
    }
    saveIncidents(store, data)
    expect(loadIncidents(store)).toEqual({
      incidents: data,
      writable: true,
      warning: '',
    })
    expect(values.has(STORAGE_KEY)).toBe(true)
  })
  it('acepta un registro vacío sin volver a crear ejemplos', () => {
    expect(
      parseStoredIncidents(JSON.stringify({ version: 1, incidents: [] })),
    ).toEqual([])
  })
  it('protege datos corruptos o de otra versión contra sobrescritura', () => {
    for (const raw of [
      '{broken',
      '{"version":2,"incidents":[]}',
      '{"version":1,"incidents":[{}]}',
    ]) {
      const loaded = loadIncidents({
        getItem: () => raw,
        setItem: () => {
          throw new Error('No se debe escribir al leer')
        },
      })
      expect(loaded.writable).toBe(false)
      expect(loaded.warning).not.toBe('')
    }
  })
  it('rechaza códigos duplicados y cierres sin evidencia', () => {
    const duplicate = [...create(), ...create()]
    expect(() =>
      parseStoredIncidents(
        JSON.stringify({ version: 1, incidents: duplicate }),
      ),
    ).toThrow()
    expect(() =>
      parseStoredIncidents(
        JSON.stringify({
          version: 1,
          incidents: [{ ...create()[0], status: 'closed' }],
        }),
      ),
    ).toThrow()
  })
  it('funciona con almacenamiento bloqueado y avisa de la limitación', () => {
    const loaded = loadIncidents({
      getItem: () => {
        throw new Error('Acceso bloqueado')
      },
      setItem: () => {},
    })
    expect(loaded.writable).toBe(false)
    expect(loaded.incidents).toHaveLength(3)
  })
})
