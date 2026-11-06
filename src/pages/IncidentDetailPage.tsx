import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Play,
  UserCircle,
  Wrench,
} from '@phosphor-icons/react'
import { actionMeta } from '../context/IncidentsContext'
import { useActionFeedback } from '../context/ActionFeedbackContext'
import { TECHNICIANS } from '../domain/incidents'
import { useCurrentIncident } from '../hooks/useCurrentIncident'
import {
  ImpactSummary,
  IncidentHistory,
  TicketData,
} from '../components/IncidentComponents'
import {
  Breadcrumbs,
  Button,
  ButtonLink,
  Card,
  CardHeading,
  Field,
  FlowStepper,
  Notice,
  PageHeading,
  Select,
  StatusBadge,
} from '../components/ui'
import { NotFoundPage } from './NotFoundPage'
import { TechnicianScene } from '../components/TechnicianScene'

export function IncidentDetailPage() {
  const { incident, dispatch } = useCurrentIncident()
  const { isRunning, runAction } = useActionFeedback()
  const [technician, setTechnician] = useState(TECHNICIANS[0])
  if (!incident) return <NotFoundPage ticket />
  if (incident.status === 'closed')
    return <Navigate replace to={`/incidentes/${incident.id}/cierre`} />

  const start = (event: FormEvent) => {
    event.preventDefault()
    runAction({
      kind: 'start',
      incidentId: incident.id,
      onCommit: () =>
        dispatch({
          type: 'start',
          id: incident.id,
          technician,
          ...actionMeta(),
        }),
    })
  }
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Incidentes', to: '/incidentes' },
          { label: incident.id },
        ]}
      />
      <PageHeading
        title={incident.title}
        subtitle={`${incident.id} · ${incident.service}`}
        action={<StatusBadge status={incident.status} />}
      />
      <Card className="stepper-card">
        <FlowStepper status={incident.status} />
      </Card>
      <div className="detail-layout">
        <div className="content-stack">
          {incident.status === 'working' && <TechnicianScene key={incident.id} incident={incident} />}
          <Card>
            <CardHeading title="Descripción del incidente" icon={FileText} />
            <p className="incident-description">{incident.description}</p>
            <ImpactSummary incident={incident} />
          </Card>
          <Card>
            <CardHeading title="Atención del incidente" icon={Wrench} />
            {incident.status === 'pending' ? (
              <form onSubmit={start} className="form-stack">
                <Field label="Responsable" required>
                  <Select
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    name="technician"
                    disabled={isRunning}
                  >
                    {TECHNICIANS.map((t) => (
                      <option key={t} value={t}>
                        {t} · Soporte TI
                      </option>
                    ))}
                  </Select>
                </Field>
                <Notice>
                  Inicia la atención para comenzar el diagnóstico.
                </Notice>
                <div className="form-actions form-actions--between">
                  <ButtonLink variant="secondary" to="/incidentes">
                    <ArrowLeft size={18} />
                    Volver a incidentes
                  </ButtonLink>
                  <Button type="submit" icon={Play} disabled={isRunning}>
                    Iniciar atención
                  </Button>
                </div>
              </form>
            ) : (
              <div className="form-stack">
                <div className="assigned-person">
                  <span className="small-avatar">
                    {incident.assignedTo
                      ?.split(' ')
                      .map((s) => s[0])
                      .join('')}
                  </span>
                  <div>
                    <span>Responsable del incidente</span>
                    <strong>{incident.assignedTo} · Soporte TI</strong>
                  </div>
                  <UserCircle size={22} />
                </div>
                {incident.status === 'working' ? (
                  <Notice>
                    El incidente está en atención. Cuando el servicio funcione,
                    documenta la solución y las pruebas realizadas.
                  </Notice>
                ) : (
                  <Notice>
                    El servicio fue restablecido. Falta la confirmación del
                    usuario para cerrar el ticket.
                  </Notice>
                )}
                <div className="form-actions form-actions--between">
                  <ButtonLink variant="secondary" to="/incidentes">
                    <ArrowLeft size={18} />
                    Volver a incidentes
                  </ButtonLink>
                  <ButtonLink
                    to={`/incidentes/${incident.id}/${incident.status === 'working' ? 'resolucion' : 'cierre'}`}
                  >
                    {incident.status === 'working'
                      ? 'Registrar solución'
                      : 'Confirmar y cerrar'}
                    <ArrowRight size={18} />
                  </ButtonLink>
                </div>
              </div>
            )}
          </Card>
          {incident.resolution && (
            <Card>
              <CardHeading title="Solución registrada" icon={Wrench} />
              <div className="solution-summary">
                <div>
                  <h3>Acción realizada</h3>
                  <p>{incident.resolution.solution}</p>
                </div>
                <div>
                  <h3>Verificación técnica</h3>
                  <p>{incident.resolution.verification}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
        <aside className="side-stack">
          <TicketData incident={incident} />
          <IncidentHistory incident={incident} />
        </aside>
      </div>
    </>
  )
}
