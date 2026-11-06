export const STATUSES = ['pending', 'working', 'resolved', 'closed'] as const
export type Status = (typeof STATUSES)[number]
export type Priority = 'high' | 'medium' | 'low'
export type Level = 1 | 2 | 3
export const STATUS_LABELS: Record<Status, string> = {
  pending: 'Pendiente',
  working: 'En atención',
  resolved: 'Resuelto',
  closed: 'Cerrado',
}
export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}
export const SERVICES = [
  'Impresión de comprobantes',
  'Sistema de ventas',
  'Conectividad',
  'Correo empresarial',
  'Equipos de trabajo',
]
export const AREAS = ['Caja 01', 'Caja 02', 'Almacén', 'Administración']
export const TECHNICIANS = ['Carlos Ruiz', 'María López', 'Diego Flores']
export const IMPACT_LABELS: Record<Level, string> = {
  1: 'Una caja o un trabajador',
  2: 'Varias áreas o trabajadores',
  3: 'Toda la empresa',
}
export const URGENCY_LABELS: Record<Level, string> = {
  1: 'Podemos esperar',
  2: 'Podemos trabajar con dificultad',
  3: 'No podemos continuar la atención',
}

export type HistoryEvent = {
  id: string
  kind: 'registered' | 'started' | 'resolved' | 'reopened' | 'closed'
  title: string
  detail: string
  actor: string
  at: string
}

export type Incident = {
  id: string
  title: string
  description: string
  service: string
  area: string
  reporter: string
  impact: Level
  urgency: Level
  priority: Priority
  status: Status
  assignedTo: string | null
  createdAt: string
  updatedAt: string
  resolution: {
    solution: string
    verification: string
    at: string
    actor: string
  } | null
  closure: { confirmedBy: string; comment: string; at: string } | null
  history: HistoryEvent[]
}

export type NewIncident = Pick<
  Incident,
  | 'title'
  | 'description'
  | 'service'
  | 'area'
  | 'reporter'
  | 'impact'
  | 'urgency'
>
type ActionBase = { at: string; eventId: string }
export type IncidentAction =
  | (ActionBase & { type: 'create'; input: NewIncident })
  | (ActionBase & { type: 'start'; id: string; technician: string })
  | (ActionBase & {
      type: 'resolve'
      id: string
      solution: string
      verification: string
    })
  | (ActionBase & { type: 'reopen'; id: string; reason: string; actor: string })
  | (ActionBase & {
      type: 'close'
      id: string
      confirmedBy: string
      comment: string
      confirmed: boolean
    })

// The explicit matrix is shared by the form, records and tests.
export function calculatePriority(impact: Level, urgency: Level): Priority {
  if (impact + urgency >= 4) return 'high'
  return impact + urgency >= 3 ? 'medium' : 'low'
}

export function nextIncidentId(incidents: Incident[]) {
  const max = Math.max(
    0,
    ...incidents.map((i) => Number(i.id.replace('INC-', '')) || 0),
  )
  return `INC-${String(max + 1).padStart(3, '0')}`
}

export function incidentReducer(
  incidents: Incident[],
  action: IncidentAction,
): Incident[] {
  if (action.type === 'create') {
    const input = action.input
    if (
      ![
        input.title,
        input.description,
        input.service,
        input.area,
        input.reporter,
      ].every((s) => s.trim())
    )
      return incidents
    if (![1, 2, 3].includes(input.impact) || ![1, 2, 3].includes(input.urgency))
      return incidents
    const incident: Incident = {
      ...input,
      title: input.title.trim(),
      description: input.description.trim(),
      reporter: input.reporter.trim(),
      id: nextIncidentId(incidents),
      priority: calculatePriority(input.impact, input.urgency),
      status: 'pending',
      assignedTo: null,
      createdAt: action.at,
      updatedAt: action.at,
      resolution: null,
      closure: null,
      history: [
        {
          id: action.eventId,
          kind: 'registered',
          title: 'Incidente registrado',
          detail: `Se reportó una falla en ${input.area}.`,
          actor: input.reporter.trim(),
          at: action.at,
        },
      ],
    }
    return [incident, ...incidents]
  }

  let changed = false
  const result = incidents.map((incident) => {
    if (incident.id !== action.id) return incident
    let next: Incident
    let event: Omit<HistoryEvent, 'id' | 'at'>
    switch (action.type) {
      case 'start': {
        if (incident.status !== 'pending' || !action.technician.trim())
          return incident
        next = {
          ...incident,
          status: 'working',
          assignedTo: action.technician.trim(),
        }
        event = {
          kind: 'started',
          title: 'Atención iniciada',
          detail: 'El responsable inició el diagnóstico.',
          actor: action.technician.trim(),
        }
        break
      }
      case 'resolve': {
        if (
          incident.status !== 'working' ||
          !action.solution.trim() ||
          !action.verification.trim()
        )
          return incident
        next = {
          ...incident,
          status: 'resolved',
          resolution: {
            solution: action.solution.trim(),
            verification: action.verification.trim(),
            at: action.at,
            actor: incident.assignedTo!,
          },
          closure: null,
        }
        event = {
          kind: 'resolved',
          title: 'Servicio restablecido',
          detail: `${action.solution.trim()}\nVerificación: ${action.verification.trim()}`,
          actor: incident.assignedTo!,
        }
        break
      }
      case 'reopen': {
        if (
          incident.status !== 'resolved' ||
          !action.reason.trim() ||
          !action.actor.trim()
        )
          return incident
        next = {
          ...incident,
          status: 'working',
          resolution: null,
          closure: null,
        }
        event = {
          kind: 'reopened',
          title: 'La falla continúa',
          detail: action.reason.trim(),
          actor: action.actor.trim(),
        }
        break
      }
      case 'close': {
        if (
          incident.status !== 'resolved' ||
          !incident.resolution ||
          !action.confirmed ||
          !action.confirmedBy.trim()
        )
          return incident
        next = {
          ...incident,
          status: 'closed',
          closure: {
            confirmedBy: action.confirmedBy.trim(),
            comment: action.comment.trim(),
            at: action.at,
          },
        }
        event = {
          kind: 'closed',
          title: 'Cierre confirmado',
          detail:
            action.comment.trim() ||
            'El usuario confirmó que el servicio funciona.',
          actor: action.confirmedBy.trim(),
        }
        break
      }
    }
    changed = true
    return {
      ...next,
      updatedAt: action.at,
      history: [
        ...incident.history,
        { ...event, id: action.eventId, at: action.at },
      ],
    }
  })
  return changed ? result : incidents
}

export function createDemoIncidents(now = new Date()): Incident[] {
  const at = (minutes: number) =>
    new Date(now.getTime() - minutes * 60_000).toISOString()
  let incidents: Incident[] = []
  const inputs: NewIncident[] = [
    {
      title: 'La impresora no emite comprobantes',
      description:
        'La impresora está encendida, pero los comprobantes quedan en espera y no se imprimen.',
      service: SERVICES[0],
      area: 'Caja 01',
      reporter: 'Ana Torres',
      impact: 1,
      urgency: 3,
    },
    {
      title: 'El sistema de ventas responde lento',
      description:
        'Las consultas y el registro de ventas tardan más de lo habitual. Podemos seguir atendiendo con dificultad.',
      service: SERVICES[1],
      area: 'Caja 02',
      reporter: 'Luis Pérez',
      impact: 1,
      urgency: 2,
    },
    {
      title: 'Sin conexión en el equipo de almacén',
      description:
        'El equipo de almacén perdió la conexión a la red y no permite consultar el inventario.',
      service: SERVICES[2],
      area: 'Almacén',
      reporter: 'Rosa Díaz',
      impact: 1,
      urgency: 2,
    },
  ]
  inputs.forEach((input, i) => {
    incidents = incidentReducer(incidents, {
      type: 'create',
      input,
      at: at(180 - i * 20),
      eventId: `demo-created-${i}`,
    })
  })
  incidents = incidentReducer(incidents, {
    type: 'start',
    id: 'INC-002',
    technician: 'María López',
    at: at(150),
    eventId: 'demo-started-2',
  })
  incidents = incidentReducer(incidents, {
    type: 'start',
    id: 'INC-003',
    technician: 'Carlos Ruiz',
    at: at(130),
    eventId: 'demo-started-3',
  })
  incidents = incidentReducer(incidents, {
    type: 'resolve',
    id: 'INC-003',
    solution:
      'Se reemplazó el cable de red que conectaba el equipo al punto de acceso.',
    verification:
      'Se verificó la conexión y se consultó el inventario correctamente.',
    at: at(110),
    eventId: 'demo-resolved-3',
  })
  return incidents.sort((a, b) => a.id.localeCompare(b.id))
}

export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim()
}

export function filterIncidents(
  incidents: Incident[],
  query: string,
  status = 'all',
  priority = 'all',
) {
  const needle = normalizeSearch(query)
  return incidents.filter(
    (i) =>
      (status === 'all' || i.status === status) &&
      (priority === 'all' || i.priority === priority) &&
      normalizeSearch(
        `${i.id} ${i.title} ${i.service} ${i.area} ${i.reporter}`,
      ).includes(needle),
  )
}

export function formatDate(value: string, timeOnly = false) {
  return new Intl.DateTimeFormat(
    'es-PE',
    timeOnly
      ? { hour: '2-digit', minute: '2-digit', hour12: false }
      : {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        },
  ).format(new Date(value))
}
