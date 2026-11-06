import {
  MagnifyingGlass,
  Plus,
  SlidersHorizontal,
  X,
} from '@phosphor-icons/react'
import { useSearchParams } from 'react-router-dom'
import { useIncidents } from '../context/IncidentsContext'
import {
  filterIncidents,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
} from '../domain/incidents'
import { IncidentTable } from '../components/IncidentComponents'
import {
  Breadcrumbs,
  Button,
  ButtonLink,
  Card,
  Field,
  PageHeading,
  Select,
} from '../components/ui'

export function IncidentListPage() {
  const { incidents } = useIncidents()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const status = params.get('estado') || 'all'
  const priority = params.get('prioridad') || 'all'
  const sort = params.get('orden') || 'recent'
  const validStatus = [...STATUSES, 'all', 'completed'].includes(status)
    ? status
    : 'all'
  const validPriority = ['high', 'medium', 'low', 'all'].includes(priority)
    ? priority
    : 'all'
  const source =
    validStatus === 'completed'
      ? incidents.filter((i) => ['resolved', 'closed'].includes(i.status))
      : incidents
  const filtered = filterIncidents(
    source,
    query,
    validStatus === 'completed' ? 'all' : validStatus,
    validPriority,
  ).sort((a, b) =>
    sort === 'code'
      ? a.id.localeCompare(b.id, undefined, { numeric: true })
      : sort === 'priority'
        ? { high: 0, medium: 1, low: 2 }[a.priority] -
            { high: 0, medium: 1, low: 2 }[b.priority] ||
          b.createdAt.localeCompare(a.createdAt)
        : b.createdAt.localeCompare(a.createdAt),
  )
  const change = (key: string, value: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (
          !value ||
          value === 'all' ||
          (key === 'orden' && value === 'recent')
        )
          next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )
  const hasFilters = !!query || validStatus !== 'all' || validPriority !== 'all'

  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Panel principal', to: '/' }, { label: 'Incidentes' }]}
      />
      <PageHeading
        title="Incidentes"
        subtitle="Consulta el estado y avance de cada ticket."
        action={
          <ButtonLink to="/incidentes/nuevo">
            <Plus size={20} />
            Reportar incidente
          </ButtonLink>
        }
      />
      <Card className="list-card">
        <div className="list-filters">
          <Field label="Buscar" className="list-search">
            <span className="search-input">
              <MagnifyingGlass size={20} aria-hidden="true" />
              <input
                className="input"
                type="search"
                value={query}
                maxLength={150}
                onChange={(e) => change('q', e.target.value)}
                placeholder="Código, falla, servicio o área..."
              />
            </span>
          </Field>
          <Field label="Estado">
            <Select
              value={validStatus}
              onChange={(e) => change('estado', e.target.value)}
            >
              <option value="all">Todos los estados</option>
              {STATUSES.map((s) => (
                <option value={s} key={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
              <option value="completed">Resueltos y cerrados</option>
            </Select>
          </Field>
          <Field label="Prioridad">
            <Select
              value={validPriority}
              onChange={(e) => change('prioridad', e.target.value)}
            >
              <option value="all">Todas las prioridades</option>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="list-toolbar">
          <p aria-live="polite">
            <strong>{filtered.length}</strong>{' '}
            {filtered.length === 1 ? 'incidente' : 'incidentes'}
            {hasFilters && (
              <span className="body-muted"> de {incidents.length}</span>
            )}
          </p>
          <div className="list-toolbar__right">
            {hasFilters && (
              <Button variant="ghost" icon={X} onClick={() => setParams({})}>
                Limpiar filtros
              </Button>
            )}
            <label className="sort-control">
              <SlidersHorizontal size={17} aria-hidden="true" />
              <span className="sr-only">Ordenar incidentes</span>
              <select
                value={sort}
                onChange={(e) => change('orden', e.target.value)}
              >
                <option value="recent">Más recientes</option>
                <option value="priority">Mayor prioridad</option>
                <option value="code">Por código</option>
              </select>
            </label>
          </div>
        </div>
        <IncidentTable
          incidents={filtered}
          emptyAction={
            <Button variant="secondary" onClick={() => setParams({})}>
              Mostrar todos
            </Button>
          }
        />
        <div className="table-footer">
          {filtered.length > 0
            ? `Mostrando ${filtered.length} de ${incidents.length} incidentes`
            : 'Sin resultados para estos filtros'}
        </div>
      </Card>
      <div className="status-legend">
        <strong>Estados del incidente:</strong>
        {STATUSES.map((s) => (
          <span key={s}>
            <i className={`status-dot status-dot--${s}`} aria-hidden="true" />
            {STATUS_LABELS[s]}
          </span>
        ))}
      </div>
    </>
  )
}
