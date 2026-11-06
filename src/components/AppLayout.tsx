import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  ArrowCounterClockwise,
  ArrowRight,
  Bell,
  Buildings,
  CaretDown,
  CheckCircle,
  Database,
  DownloadSimple,
  Headset,
  House,
  Info,
  List,
  MagnifyingGlass,
  PlusCircle,
  Ticket,
  Users,
  Warning,
  X,
} from '@phosphor-icons/react'
import { useIncidents } from '../context/IncidentsContext'
import { STATUS_LABELS, TECHNICIANS } from '../domain/incidents'
import { Button, IconBubble, Modal, Notice } from './ui'

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [modal, setModal] = useState<'support' | 'data' | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { incidents, reset, notice, warning } = useIncidents()

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  const closeModal = () => {
    setModal(null)
    setConfirmReset(false)
  }
  const download = () => {
    const blob = new Blob(
      [JSON.stringify({ version: 1, incidents }, null, 2)],
      { type: 'application/json' },
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `soluciona-ti-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Ir al contenido
      </a>
      <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <Link to="/" className="brand" aria-label="Soluciona TI, inicio">
          <Headset
            className="brand__icon"
            size={43}
            weight="duotone"
            aria-hidden="true"
          />
          <span>
            <strong>Soluciona TI</strong>
            <small>Gestión de incidentes</small>
          </span>
        </Link>
        <div className="organization">
          <Buildings size={21} aria-hidden="true" />
          <span>Minimarket San Miguel</span>
        </div>
        <nav className="sidebar__nav" aria-label="Navegación principal">
          <NavLink
            end
            to="/"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item--active' : ''}`
            }
          >
            <House size={23} />
            Panel principal
          </NavLink>
          <Link
            to="/incidentes"
            className={`nav-item ${location.pathname.startsWith('/incidentes') && !location.pathname.endsWith('/nuevo') ? 'nav-item--active' : ''}`}
            aria-current={
              location.pathname.startsWith('/incidentes') &&
              !location.pathname.endsWith('/nuevo')
                ? 'page'
                : undefined
            }
          >
            <Ticket size={23} />
            Incidentes
          </Link>
          <NavLink
            to="/incidentes/nuevo"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item--active' : ''}`
            }
          >
            <PlusCircle size={23} />
            Reportar incidente
          </NavLink>
        </nav>
        <div className="sidebar__secondary">
          <button
            type="button"
            className="nav-item"
            onClick={() => {
              setModal('support')
              setMenuOpen(false)
            }}
          >
            <Headset size={23} />
            Soporte de TI
          </button>
          <button
            type="button"
            className="nav-item"
            onClick={() => {
              setModal('data')
              setMenuOpen(false)
            }}
          >
            <Database size={23} />
            Datos de demostración
          </button>
        </div>
        <div className="sidebar__note">
          <span className="live-dot" />
          Un caso práctico de ITIL 4<small>Gestión de incidentes</small>
        </div>
      </aside>

      <div className="workspace">
        <Topbar
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((v) => !v)}
          onOpenData={() => setModal('data')}
        />
        <main id="main-content" className="main-content" tabIndex={-1}>
          {warning && (
            <div className="storage-warning" role="alert">
              <Notice tone="amber" icon={Warning}>
                <span>{warning}</span>
                <button
                  className="inline-button"
                  type="button"
                  onClick={() => setModal('data')}
                >
                  Ver opciones
                </button>
              </Notice>
            </div>
          )}
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>
            Prototipo académico <span aria-hidden="true">·</span> Datos de
            ejemplo
          </span>
          <span>
            ITIL 4 <span aria-hidden="true">/</span> Gestión de incidentes
          </span>
        </footer>
      </div>
      {notice && (
        <div className="toast" role="status">
          <CheckCircle size={22} weight="fill" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      )}

      <Modal
        open={modal === 'support'}
        onClose={closeModal}
        title="Soporte de TI"
      >
        <div className="modal__body">
          <div className="modal-intro">
            <IconBubble icon={Headset} />
            <p>
              Registra una falla y sigue su atención hasta confirmar que el
              servicio funciona.
            </p>
          </div>
          <ol className="help-steps">
            <li>
              <strong>Reporta el incidente.</strong>
              <span>
                Describe qué ocurre, dónde ocurre y cuánto afecta la operación.
              </span>
            </li>
            <li>
              <strong>Inicia la atención.</strong>
              <span>Asigna a un responsable del equipo de soporte.</span>
            </li>
            <li>
              <strong>Documenta la solución.</strong>
              <span>Registra la acción y las pruebas realizadas.</span>
            </li>
            <li>
              <strong>Confirma y cierra.</strong>
              <span>El usuario verifica que puede continuar trabajando.</span>
            </li>
          </ol>
          <Notice>
            Este sistema demuestra la práctica de{' '}
            <strong>gestión de incidentes</strong>: restablecer el servicio y
            reducir el impacto de las fallas.
          </Notice>
        </div>
        <div className="modal__actions">
          <Button
            onClick={() => {
              closeModal()
              navigate('/incidentes/nuevo')
            }}
            icon={PlusCircle}
          >
            Reportar incidente
          </Button>
        </div>
      </Modal>
      <Modal
        open={modal === 'data'}
        onClose={closeModal}
        title="Datos de demostración"
      >
        <div className="modal__body">
          <Notice icon={Database}>
            Los datos se guardan en este navegador. Otros dispositivos y
            navegadores tendrán sus propios incidentes.
          </Notice>
          <p className="body-muted">
            Puedes descargar tus registros o restaurar los tres incidentes
            iniciales para volver a presentar el caso.
          </p>
          <div className="demo-data-summary">
            <span>Incidentes guardados</span>
            <strong>{incidents.length}</strong>
          </div>
          <Button variant="secondary" onClick={download} icon={DownloadSimple}>
            Descargar copia de los datos
          </Button>
          {confirmReset && (
            <div className="reset-confirmation" role="alert">
              <h3>¿Restaurar la demostración?</h3>
              <p>
                Se reemplazarán los incidentes de este navegador por los tres
                ejemplos iniciales. Descarga una copia si deseas conservarlos.
              </p>
            </div>
          )}
        </div>
        <div className="modal__actions">
          <Button variant="ghost" onClick={closeModal}>
            Cancelar
          </Button>
          {confirmReset ? (
            <Button
              variant="danger"
              onClick={() => {
                reset()
                closeModal()
                navigate('/')
              }}
              icon={ArrowCounterClockwise}
            >
              Sí, restaurar los datos
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setConfirmReset(true)}
              icon={ArrowCounterClockwise}
            >
              Restaurar demostración
            </Button>
          )}
        </div>
      </Modal>
    </div>
  )
}

function Topbar({
  menuOpen,
  onToggleMenu,
  onOpenData,
}: {
  menuOpen: boolean
  onToggleMenu: () => void
  onOpenData: () => void
}) {
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const { incidents } = useIncidents()
  const alerts = incidents.filter(
    (i) => i.status === 'pending' || i.status === 'resolved',
  )

  useEffect(() => {
    const close = (event: MouseEvent | KeyboardEvent) => {
      const escape = 'key' in event && event.key === 'Escape'
      ref.current?.querySelectorAll('details[open]').forEach((details) => {
        if (
          escape ||
          (event.target instanceof Node && !details.contains(event.target))
        ) {
          details.removeAttribute('open')
          if (escape) details.querySelector('summary')?.focus()
        }
      })
    }
    document.addEventListener('click', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('keydown', close)
    }
  }, [])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    navigate(
      `/incidentes${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`,
    )
    setQuery('')
  }

  return (
    <header className="topbar" ref={ref}>
      <button
        type="button"
        className="icon-button mobile-menu-toggle"
        onClick={onToggleMenu}
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={24} /> : <List size={24} />}
      </button>
      <form className="global-search" onSubmit={submit} role="search">
        <MagnifyingGlass size={21} aria-hidden="true" />
        <input
          aria-label="Buscar incidentes en el sistema"
          placeholder="Buscar incidentes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={150}
        />
        <button type="submit" aria-label="Realizar búsqueda">
          <ArrowRight size={19} />
        </button>
      </form>
      <div className="topbar__right">
        <span className="team-label">
          <Users size={23} aria-hidden="true" />
          Equipo de TI
        </span>
        <details className="header-dropdown">
          <summary
            className="icon-button notification-button"
            aria-label={`${alerts.length} notificaciones de incidentes`}
          >
            <Bell size={25} />
            {alerts.length > 0 && (
              <span className="notification-count">{alerts.length}</span>
            )}
          </summary>
          <div className="dropdown-panel notifications-panel">
            <h2>
              Por revisar <span>{alerts.length}</span>
            </h2>
            {alerts.length ? (
              <ul>
                {alerts.slice(0, 5).map((i) => (
                  <li key={i.id}>
                    <Link
                      to={`/incidentes/${i.id}`}
                      onClick={(e) =>
                        e.currentTarget
                          .closest('details')
                          ?.removeAttribute('open')
                      }
                    >
                      <span
                        className={`notification-status notification-status--${i.status}`}
                      />
                      <span>
                        <strong>
                          {i.id} · {STATUS_LABELS[i.status]}
                        </strong>
                        <span>{i.title}</span>
                      </span>
                      <ArrowRight size={17} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dropdown-empty">
                No hay incidentes pendientes de revisión.
              </p>
            )}
            <Link
              className="text-link dropdown-footer"
              to="/incidentes"
              onClick={(e) =>
                e.currentTarget.closest('details')?.removeAttribute('open')
              }
            >
              Ver todos los incidentes
              <ArrowRight size={17} />
            </Link>
          </div>
        </details>
        <span className="topbar__divider" />
        <details className="header-dropdown">
          <summary className="profile-button">
            <span className="avatar">CR</span>
            <span className="profile-button__name">Carlos</span>
            <CaretDown size={17} />
          </summary>
          <div className="dropdown-panel profile-panel">
            <h2>Equipo de soporte</h2>
            <p className="body-muted">Demostración sin inicio de sesión</p>
            <ul>
              {TECHNICIANS.map((t) => (
                <li key={t}>
                  <span className="small-avatar">
                    {t
                      .split(' ')
                      .map((x) => x[0])
                      .join('')}
                  </span>
                  <span>
                    {t}
                    <small>Soporte de TI</small>
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="text-link dropdown-footer"
              onClick={(e) => {
                e.currentTarget.closest('details')?.removeAttribute('open')
                onOpenData()
              }}
            >
              <Info size={17} />
              Datos de la demostración
            </button>
          </div>
        </details>
      </div>
    </header>
  )
}
