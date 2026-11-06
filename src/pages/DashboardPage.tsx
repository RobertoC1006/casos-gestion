import {
  ArrowRight,
  CheckCircle,
  Clock,
  Path,
  Plus,
  Stack,
  Ticket,
  Warning,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { useIncidents } from '../context/IncidentsContext'
import { STATUSES, STATUS_LABELS } from '../domain/incidents'
import { IncidentTable } from '../components/IncidentComponents'
import {
  ButtonLink,
  Card,
  CardHeading,
  IconBubble,
  Notice,
  PageHeading,
  SupportIllustration,
  TextLink,
} from '../components/ui'

export function DashboardPage() {
  const { incidents } = useIncidents()
  const counts = {
    total: incidents.length,
    pending: incidents.filter((i) => i.status === 'pending').length,
    working: incidents.filter((i) => i.status === 'working').length,
    completed: incidents.filter((i) =>
      ['resolved', 'closed'].includes(i.status),
    ).length,
  }
  const stats = [
    {
      label: 'Total de incidentes',
      count: counts.total,
      icon: Stack,
      tone: 'green' as const,
      to: '/incidentes',
      hint: 'Todos los registros',
    },
    {
      label: 'Pendientes',
      count: counts.pending,
      icon: Warning,
      tone: 'amber' as const,
      to: '/incidentes?estado=pending',
      hint: 'Por iniciar atención',
    },
    {
      label: 'En atención',
      count: counts.working,
      icon: Clock,
      tone: 'blue' as const,
      to: '/incidentes?estado=working',
      hint: 'En manos de soporte',
    },
    {
      label: 'Resueltos y cerrados',
      count: counts.completed,
      icon: CheckCircle,
      tone: 'green' as const,
      to: '/incidentes?estado=completed',
      hint: 'Servicio recuperado',
    },
  ]
  return (
    <>
      <PageHeading
        title="¡Bienvenido, Carlos!"
        subtitle="Seguimiento de incidentes y recuperación de servicios"
        action={
          <ButtonLink to="/incidentes/nuevo">
            <Plus size={21} />
            Reportar incidente
          </ButtonLink>
        }
      />
      <div className="stats-grid">
        {stats.map((stat) => (
          <Link to={stat.to} className="stat-card" key={stat.label}>
            <IconBubble icon={stat.icon} tone={stat.tone} />
            <div>
              <span className="stat-card__label">{stat.label}</span>
              <strong>{stat.count}</strong>
              <span className="stat-card__hint">{stat.hint}</span>
            </div>
            <ArrowRight
              className="stat-card__arrow"
              size={17}
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
      <Card className="recent-card">
        <CardHeading
          title="Incidentes recientes"
          icon={Ticket}
          action={<TextLink to="/incidentes">Ver todos</TextLink>}
        />
        {incidents.length ? (
          <IncidentTable incidents={incidents.slice(0, 4)} compact />
        ) : (
          <Notice>
            No hay incidentes registrados. Reporta una falla para comenzar.
          </Notice>
        )}
      </Card>
      <div className="dashboard-bottom">
        <Card className="quick-report">
          <CardHeading title="Reportar una falla" icon={Plus} />
          <p>Ayuda a soporte a recuperar el servicio.</p>
          <ButtonLink to="/incidentes/nuevo">
            Nuevo incidente
            <ArrowRight size={20} />
          </ButtonLink>
          <SupportIllustration />
        </Card>
        <Card className="flow-card">
          <CardHeading title="Flujo de atención" icon={Path} />
          <p>El cierre requiere confirmación del usuario.</p>
          <ol className="workflow-overview">
            {STATUSES.map((status, i) => (
              <li key={status}>
                <Link
                  to={`/incidentes?estado=${status}`}
                  className={`workflow-overview__step workflow-overview__step--${status}`}
                >
                  {status === 'pending' ? (
                    <Warning size={27} />
                  ) : status === 'working' ? (
                    <Clock size={27} />
                  ) : (
                    <CheckCircle size={27} />
                  )}
                  <span>{STATUS_LABELS[status]}</span>
                </Link>
                {i < 3 && (
                  <ArrowRight
                    size={19}
                    className="workflow-overview__arrow"
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  )
}
