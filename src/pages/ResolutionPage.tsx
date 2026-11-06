import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Printer, Sparkle } from '@phosphor-icons/react'
import { actionMeta } from '../context/IncidentsContext'
import { useActionFeedback } from '../context/ActionFeedbackContext'
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
  Notice,
  PageHeading,
  Select,
  StatusBadge,
} from '../components/ui'
import { NotFoundPage } from './NotFoundPage'

export function ResolutionPage() {
  const { incident, dispatch } = useCurrentIncident()
  const { isRunning: busy, runAction } = useActionFeedback()
  const navigate = useNavigate()
  const [solution, setSolution] = useState('')
  const [verification, setVerification] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  if (!incident) return <NotFoundPage ticket />
  if (incident.status !== 'working')
    return (
      <Navigate
        replace
        to={`/incidentes/${incident.id}${['resolved', 'closed'].includes(incident.status) ? '/cierre' : ''}`}
      />
    )
  const fillExample = () => {
    const printer = incident.service === 'Impresión de comprobantes'
    setSolution(
      printer
        ? 'Se eliminó la cola bloqueada, se reinició el servicio de impresión y se reconectó la impresora.'
        : `Se revisó la configuración de ${incident.service.toLocaleLowerCase()} y se corrigió la falla reportada.`,
    )
    setVerification(
      printer
        ? 'Se imprimieron dos comprobantes de prueba correctamente.'
        : 'Se probó el servicio con el usuario y se verificó que funciona con normalidad.',
    )
    setResult('restored')
    setError('')
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    if (solution.trim().length < 10 || verification.trim().length < 10) {
      setError(
        'Describe la solución y las pruebas con al menos 10 caracteres en cada campo.',
      )
      return
    }
    if (result !== 'restored') {
      setError('Confirma el resultado de las pruebas antes de continuar.')
      return
    }
    runAction({
      kind: 'resolve',
      incidentId: incident.id,
      onCommit: () =>
        dispatch({
          type: 'resolve',
          id: incident.id,
          solution,
          verification,
          ...actionMeta(),
        }),
      onComplete: () => navigate(`/incidentes/${incident.id}/cierre`),
    })
  }
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Incidentes', to: '/incidentes' },
          { label: incident.id, to: `/incidentes/${incident.id}` },
          { label: 'Resolución' },
        ]}
      />
      <PageHeading
        title="Registrar la solución"
        subtitle="Documenta cómo se restableció el servicio."
        action={<StatusBadge status={incident.status} />}
      />
      <Card className="stepper-card">
        <FlowStepper status={incident.status} />
      </Card>
      <div className="detail-layout detail-layout--form">
        <Card>
          <CardHeading title={incident.title} icon={Printer} />
          <p className="resolution-owner">{incident.assignedTo} · Soporte TI</p>
          <div className="form-intro">
            <span>Completa la solución de este ticket.</span>
            <Button variant="ghost" icon={Sparkle} onClick={fillExample}>
              Completar ejemplo
            </Button>
          </div>
          <form className="form-stack" onSubmit={submit}>
            <FormError message={error} />
            <Field label="Solución aplicada" required>
              <textarea
                className="input"
                name="solution"
                rows={4}
                required
                minLength={10}
                maxLength={3000}
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Describe las acciones que recuperaron el servicio."
              />
            </Field>
            <Field label="Pruebas realizadas" required>
              <textarea
                className="input"
                name="verification"
                rows={3}
                required
                minLength={10}
                maxLength={2000}
                value={verification}
                onChange={(e) => setVerification(e.target.value)}
                placeholder="¿Cómo comprobaste que el servicio funciona?"
              />
            </Field>
            <Field label="Resultado" required>
              <Select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                name="result"
                required
              >
                <option value="" disabled>
                  Selecciona el resultado
                </option>
                <option value="restored">
                  El servicio funciona con normalidad
                </option>
              </Select>
            </Field>
            <Notice>
              El ticket quedará <strong>Resuelto</strong>. Falta la confirmación
              del usuario para cerrarlo.
            </Notice>
            <div className="form-actions">
              <ButtonLink variant="secondary" to={`/incidentes/${incident.id}`}>
                <ArrowLeft size={18} />
                Volver al ticket
              </ButtonLink>
              <Button type="submit" disabled={busy}>
                Marcar como resuelto
                <ArrowRight size={18} />
              </Button>
            </div>
          </form>
        </Card>
        <aside className="side-stack">
          <TicketData incident={incident} short />
          <IncidentHistory incident={incident} />
        </aside>
      </div>
    </>
  )
}
