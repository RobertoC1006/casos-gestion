import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Flag, Info, Sparkle } from '@phosphor-icons/react'
import { actionMeta, useIncidents } from '../context/IncidentsContext'
import { useActionFeedback } from '../context/ActionFeedbackContext'
import { INCIDENT_EXAMPLES } from '../domain/incidentExamples'
import { TechnicianScene } from '../components/TechnicianScene'
import {
  AREAS,
  calculatePriority,
  IMPACT_LABELS,
  nextIncidentId,
  SERVICES,
  URGENCY_LABELS,
  type Level,
  type NewIncident,
} from '../domain/incidents'
import {
  Breadcrumbs,
  Button,
  ButtonLink,
  Card,
  CardHeading,
  Field,
  FormError,
  Notice,
  PageHeading,
  PriorityBadge,
  Select,
  SupportIllustration,
} from '../components/ui'

const blank: NewIncident = {
  reporter: '',
  area: '',
  service: '',
  title: '',
  description: '',
  impact: 1,
  urgency: 2,
}

export function NewIncidentPage() {
  const [form, setForm] = useState<NewIncident>(blank)
  const [error, setError] = useState('')
  const [selectedExample, setSelectedExample] = useState('')
  const { isRunning: busy, runAction } = useActionFeedback()
  const { incidents, dispatch } = useIncidents()
  const navigate = useNavigate()
  const set = (key: keyof NewIncident, value: string | Level) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }
  const chooseExample = (id: string) => {
    setSelectedExample(id)
    const example = INCIDENT_EXAMPLES.find(item => item.id === id)
    setForm(example ? { ...example.input } : { ...blank })
    setError('')
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    if (
      form.reporter.trim().length < 3 ||
      form.title.trim().length < 5 ||
      form.description.trim().length < 10
    ) {
      setError(
        'Escribe tu nombre, un título de al menos 5 caracteres y una descripción de al menos 10 caracteres.',
      )
      return
    }
    if (!form.area || !form.service) {
      setError('Selecciona el área y el servicio afectado.')
      return
    }
    const id = nextIncidentId(incidents)
    runAction({
      kind: 'create',
      incidentId: id,
      onCommit: () =>
        dispatch({ type: 'create', input: form, ...actionMeta() }),
      onComplete: () => navigate(`/incidentes/${id}`),
    })
  }

  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Inicio', to: '/' }, { label: 'Nuevo incidente' }]}
      />
      <PageHeading
        title="Reportar un incidente"
        subtitle="Cuéntanos qué dejó de funcionar."
      />
      <Card className="example-picker">
        <CardHeading title="Elige un caso y comienza" icon={Sparkle} />
        <p>Selecciona un reporte preparado para completar todos los campos. Puedes editarlo antes de registrarlo.</p>
        <Field label="Caso preparado">
          <Select aria-label="Caso preparado" value={selectedExample} onChange={event => chooseExample(event.target.value)}>
            <option value="">Escribir mi propio reporte</option>
            {INCIDENT_EXAMPLES.map(example => <option key={example.id} value={example.id}>{example.label}</option>)}
          </Select>
        </Field>
        {selectedExample && <div className="example-picker__selected" role="status"><Check size={18} aria-hidden="true" /><span>Reporte completo. Regístralo y pulsa <strong>Iniciar atención</strong> para ver al encargado trabajando.</span></div>}
        {form.service && <details className="example-preview" key={form.service}><summary>Ver la animación de este caso</summary><TechnicianScene incident={{ id: 'Vista previa', service: form.service, area: form.area || 'Área por seleccionar', assignedTo: 'Demostración' }} /></details>}
      </Card>
      <div className="form-layout">
        <Card className="new-incident-card">
          <div className="form-intro">
            <span>
              Los campos con <span className="required">*</span> son
              obligatorios.
            </span>
            <Button
              variant="ghost"
              icon={Sparkle}
              onClick={() => {
                chooseExample('printer')
              }}
            >
              Completar con un ejemplo
            </Button>
          </div>
          <form onSubmit={submit} className="form-stack">
            <FormError message={error} />
            <div className="form-grid">
              <Field label="Tu nombre" required>
                <input
                  className="input"
                  name="reporter"
                  autoComplete="name"
                  required
                  minLength={3}
                  maxLength={80}
                  placeholder="Nombre y apellido"
                  value={form.reporter}
                  onChange={(e) => set('reporter', e.target.value)}
                />
              </Field>
              <Field label="Área" required>
                <Select
                  name="area"
                  required
                  value={form.area}
                  onChange={(e) => set('area', e.target.value)}
                >
                  <option value="" disabled>
                    Selecciona un área
                  </option>
                  {AREAS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Servicio afectado" required>
              <Select
                name="service"
                required
                value={form.service}
                onChange={(e) => set('service', e.target.value)}
              >
                <option value="" disabled>
                  Selecciona un servicio
                </option>
                {SERVICES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Título de la falla" required>
              <input
                className="input"
                name="title"
                required
                minLength={5}
                maxLength={120}
                placeholder="Ej. La impresora no emite comprobantes"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </Field>
            <Field label="Descripción" required>
              <textarea
                className="input"
                name="description"
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                placeholder="¿Qué ocurre? ¿Qué estabas haciendo cuando sucedió?"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </Field>
            <div className="form-grid">
              <Field label="Impacto" required>
                <Select
                  name="impact"
                  value={form.impact}
                  onChange={(e) =>
                    set('impact', Number(e.target.value) as Level)
                  }
                >
                  {Object.entries(IMPACT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Urgencia" required>
                <Select
                  name="urgency"
                  value={form.urgency}
                  onChange={(e) =>
                    set('urgency', Number(e.target.value) as Level)
                  }
                >
                  {Object.entries(URGENCY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div aria-live="polite">
              <Notice icon={Flag}>
                <div className="priority-preview">
                  <strong>Prioridad sugerida:</strong>
                  <PriorityBadge
                    priority={calculatePriority(form.impact, form.urgency)}
                  />
                </div>
                <p>Calculada según impacto y urgencia.</p>
              </Notice>
            </div>
            <div className="form-actions">
              <ButtonLink to="/incidentes" variant="secondary">
                Cancelar
              </ButtonLink>
              <Button type="submit" disabled={busy}>
                Registrar incidente
                <ArrowRight size={19} />
              </Button>
            </div>
          </form>
        </Card>
        <aside className="side-stack">
          <Card className="guidance-card">
            <CardHeading title="Antes de enviar" icon={Info} />
            <ul className="guidance-list">
              <li>
                <Check size={18} />
                Describe lo que ocurre.
              </li>
              <li>
                <Check size={18} />
                Indica el servicio afectado.
              </li>
              <li>
                <Check size={18} />
                No incluyas contraseñas.
              </li>
            </ul>
            <SupportIllustration />
          </Card>
          <p className="form-side-note">
            Una falla registrada permite priorizar la atención y conservar el
            historial de la solución.
          </p>
        </aside>
      </div>
    </>
  )
}
