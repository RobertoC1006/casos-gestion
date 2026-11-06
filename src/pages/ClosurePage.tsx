import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  House,
  UserCircle,
  Wrench,
} from '@phosphor-icons/react'
import { actionMeta } from '../context/IncidentsContext'
import { useActionFeedback } from '../context/ActionFeedbackContext'
import { formatDate } from '../domain/incidents'
import { useCurrentIncident } from '../hooks/useCurrentIncident'
import { IncidentHistory, TicketData } from '../components/IncidentComponents'
import {
  Breadcrumbs,
  Button,
  ButtonLink,
  Card,
  CardHeading,
  Field,
  FlowStepper,
  FormError,
  Modal,
  Notice,
  PageHeading,
  StatusBadge,
} from '../components/ui'
import { NotFoundPage } from './NotFoundPage'

export function ClosurePage() {
  const { incident, dispatch } = useCurrentIncident()
  const { isRunning: busy, runAction } = useActionFeedback()
  const [confirmedBy, setConfirmedBy] = useState(incident?.reporter || '')
  const [comment, setComment] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [showReopen, setShowReopen] = useState(false)
  const [reopenReason, setReopenReason] = useState('')
  if (!incident) return <NotFoundPage ticket />
  if (incident.status !== 'resolved' && incident.status !== 'closed')
    return <Navigate replace to={`/incidentes/${incident.id}`} />
  const closed = incident.status === 'closed'
  const solution = incident.resolution!
  const close = (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    if (confirmedBy.trim().length < 3 || !confirmed) {
      setError('Indica quién confirma y verifica que el servicio funciona.')
      return
    }
    runAction({
      kind: 'close',
      incidentId: incident.id,
      onCommit: () =>
        dispatch({
          type: 'close',
          id: incident.id,
          confirmedBy,
          comment,
          confirmed,
          ...actionMeta(),
        }),
    })
  }
  const reopen = (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    if (reopenReason.trim().length < 10 || confirmedBy.trim().length < 3) {
      setError(
        'Escribe el nombre de quien reporta y explica la falla con al menos 10 caracteres.',
      )
      return
    }
    runAction({
      kind: 'reopen',
      incidentId: incident.id,
      onCommit: () =>
        dispatch({
          type: 'reopen',
          id: incident.id,
          actor: confirmedBy,
          reason: reopenReason,
          ...actionMeta(),
        }),
    })
    setShowReopen(false)
  }
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Incidentes', to: '/incidentes' },
          { label: incident.id, to: `/incidentes/${incident.id}` },
          { label: closed ? 'Cerrado' : 'Cierre' },
        ]}
      />
      <PageHeading
        title={closed ? 'Incidente cerrado' : 'Confirmar recuperación'}
        subtitle={
          closed
            ? 'La atención quedó documentada y el servicio funciona.'
            : 'Verifica con el usuario que el servicio funciona.'
        }
        action={<StatusBadge status={incident.status} />}
      />
      <Card className="stepper-card">
        <FlowStepper status={incident.status} />
      </Card>
      <div className="detail-layout">
        <div className="content-stack">
          <Card className={closed ? 'closed-summary-card' : ''}>
            {closed ? (
              <div className="closed-heading">
                <span className="closed-check">
                  <CheckCircle size={46} weight="duotone" />
                </span>
                <div>
                  <h2>Todo vuelve a funcionar</h2>
                  <p>
                    {incident.service} · {incident.area}
                  </p>
                </div>
              </div>
            ) : (
              <CardHeading title="Solución registrada" icon={Wrench} />
            )}
            <div className="solution-summary">
              <div>
                <h3>Acción realizada</h3>
                <p>{solution.solution}</p>
              </div>
              <div>
                <h3>Verificación técnica</h3>
                <p>{solution.verification}</p>
              </div>
              {closed && incident.closure && (
                <>
                  <div>
                    <h3>Confirmación del usuario</h3>
                    <p>
                      <strong>{incident.closure.confirmedBy}</strong> confirmó
                      que puede continuar trabajando.
                    </p>
                    {incident.closure.comment && (
                      <p className="closure-comment">
                        {incident.closure.comment}
                      </p>
                    )}
                  </div>
                  <Notice icon={Clock}>
                    <strong>
                      Cerrado el {formatDate(incident.closure.at)}
                    </strong>
                  </Notice>
                </>
              )}
            </div>
            {closed && (
              <div className="form-actions form-actions--between">
                <ButtonLink to="/incidentes">
                  <ArrowLeft size={19} />
                  Volver a incidentes
                </ButtonLink>
                <ButtonLink to="/" variant="secondary">
                  <House size={19} />
                  Ir al panel
                </ButtonLink>
              </div>
            )}
          </Card>
          {!closed && (
            <Card>
              <CardHeading title="Confirmación del usuario" icon={UserCircle} />
              <form className="form-stack" onSubmit={close}>
                <FormError message={error} />
                <Field label="Nombre de quien confirma" required>
                  <input
                    className="input"
                    name="confirmedBy"
                    required
                    minLength={3}
                    maxLength={80}
                    value={confirmedBy}
                    onChange={(e) => setConfirmedBy(e.target.value)}
                  />
                </Field>
                <label className="confirmation-check">
                  <input
                    type="checkbox"
                    name="confirmed"
                    required
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  <span>
                    Confirmo que el servicio funciona correctamente y puedo
                    continuar trabajando.
                  </span>
                </label>
                <Field label="Comentario de cierre">
                  <textarea
                    className="input"
                    name="comment"
                    rows={3}
                    maxLength={2000}
                    placeholder="Describe la confirmación realizada con el usuario."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </Field>
                <div className="form-actions form-actions--between">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setError('')
                      setShowReopen(true)
                    }}
                  >
                    La falla continúa
                  </Button>
                  <Button type="submit" disabled={busy}>
                    Confirmar y cerrar ticket
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
        <aside className="side-stack">
          <IncidentHistory incident={incident} complete={closed} />
          {closed ? (
            <TicketData incident={incident} short />
          ) : (
            <Notice>
              <strong>Después de confirmar</strong>
              <p>
                El ticket pasará a Cerrado y conservará el historial de la
                atención.
              </p>
            </Notice>
          )}
        </aside>
      </div>
      <Modal
        open={showReopen}
        onClose={() => setShowReopen(false)}
        title="El servicio aún presenta fallas"
      >
        <form onSubmit={reopen}>
          <div className="modal__body form-stack">
            <p>
              El incidente volverá a atención con el mismo responsable. La
              solución anterior permanecerá en el historial.
            </p>
            <FormError message={error} />
            <Field label="Quién reporta" required>
              <input
                className="input"
                required
                minLength={3}
                maxLength={80}
                value={confirmedBy}
                onChange={(e) => setConfirmedBy(e.target.value)}
              />
            </Field>
            <Field label="¿Qué sigue fallando?" required>
              <textarea
                className="input"
                rows={3}
                required
                minLength={10}
                maxLength={2000}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="Explica lo que ocurrió al probar el servicio."
              />
            </Field>
          </div>
          <div className="modal__actions">
            <Button variant="ghost" onClick={() => setShowReopen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>
              Volver a atención
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
