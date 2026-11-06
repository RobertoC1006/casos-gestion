import {
  Clock,
  ClockCounterClockwise,
  Info,
  Ticket,
} from '@phosphor-icons/react'
import {
  formatDate,
  IMPACT_LABELS,
  URGENCY_LABELS,
  type Incident,
} from '../domain/incidents'
import {
  Card,
  CardHeading,
  EmptyState,
  PriorityBadge,
  StatusBadge,
  TextLink,
} from './ui'

export function IncidentTable({
  incidents,
  compact = false,
  emptyAction,
}: {
  incidents: Incident[]
  compact?: boolean
  emptyAction?: React.ReactNode
}) {
  if (!incidents.length)
    return (
      <EmptyState
        description="Prueba con otra búsqueda o cambia los filtros."
        action={emptyAction}
      />
    )
  return (
    <div className="table-scroll">
      <table
        className={`incident-table ${compact ? 'incident-table--compact' : ''}`}
      >
        <thead>
          <tr>
            <th>Código</th>
            <th>Incidente{!compact && ' / Servicio'}</th>
            {!compact && <th>Área</th>}
            <th>Prioridad</th>
            <th>Estado</th>
            <th>
              <span className="sr-only">Acción</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id}>
              <td data-label="Código">
                <strong className="ticket-code">{incident.id}</strong>
              </td>
              <td data-label="Incidente">
                <span className="incident-table__title">{incident.title}</span>
                {!compact && (
                  <span className="incident-table__service">
                    {incident.service}
                  </span>
                )}
              </td>
              {!compact && <td data-label="Área">{incident.area}</td>}
              <td data-label="Prioridad">
                <PriorityBadge priority={incident.priority} />
              </td>
              <td data-label="Estado">
                <StatusBadge status={incident.status} />
              </td>
              <td>
                <TextLink to={`/incidentes/${incident.id}`}>
                  {compact ? 'Ver ticket' : 'Ver detalle'}
                </TextLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TicketData({
  incident,
  short = false,
}: {
  incident: Incident
  short?: boolean
}) {
  return (
    <Card>
      <CardHeading
        title={short ? incident.id : 'Datos del ticket'}
        icon={short ? Ticket : Info}
      />
      <dl className="data-list">
        <div>
          <dt>Servicio</dt>
          <dd>{incident.service}</dd>
        </div>
        <div>
          <dt>Reportado por</dt>
          <dd>{incident.reporter}</dd>
        </div>
        <div>
          <dt>Área</dt>
          <dd>{incident.area}</dd>
        </div>
        <div>
          <dt>Prioridad</dt>
          <dd>
            <PriorityBadge priority={incident.priority} />
          </dd>
        </div>
        <div>
          <dt>Registro</dt>
          <dd>{formatDate(incident.createdAt)}</dd>
        </div>
        {incident.assignedTo && (
          <div>
            <dt>Responsable</dt>
            <dd>{incident.assignedTo}</dd>
          </div>
        )}
      </dl>
    </Card>
  )
}

export function IncidentHistory({
  incident,
  complete = false,
}: {
  incident: Incident
  complete?: boolean
}) {
  return (
    <Card className="history-card">
      <CardHeading
        title={complete ? 'Historial completo' : 'Historial'}
        icon={complete ? ClockCounterClockwise : Clock}
      />
      <ol className="history">
        {incident.history.map((event, index) => (
          <li
            key={event.id}
            className={
              index === incident.history.length - 1 ? 'history__latest' : ''
            }
          >
            <span className="history__dot" aria-hidden="true" />
            <div>
              <h3>{event.title}</h3>
              <p>
                <time dateTime={event.at} title={formatDate(event.at)}>
                  {formatDate(event.at)}
                </time>
              </p>
              <p className="history__actor">{event.actor}</p>
              {['resolved', 'reopened', 'closed'].includes(event.kind) && (
                <details className="history__details">
                  <summary>Ver detalle</summary>
                  <p>{event.detail}</p>
                </details>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}

export function ImpactSummary({ incident }: { incident: Incident }) {
  return (
    <div className="impact-summary">
      <div>
        <span>Impacto</span>
        <strong>{IMPACT_LABELS[incident.impact]}</strong>
      </div>
      <div>
        <span>Urgencia</span>
        <strong>{URGENCY_LABELS[incident.urgency]}</strong>
      </div>
    </div>
  )
}
