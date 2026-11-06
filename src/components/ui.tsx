import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import {
  ArrowRight,
  CaretDown,
  Check,
  Clock,
  Headset,
  Info,
  Laptop,
  Play,
  Warning,
  X,
  type Icon,
} from '@phosphor-icons/react'
import {
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Priority,
  type Status,
} from '../domain/incidents'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  icon?: Icon
}
export function Button({
  variant = 'primary',
  className = '',
  icon: Icon,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`button button--${variant} ${className}`}
      {...props}
    >
      {Icon && <Icon size={19} aria-hidden="true" />}
      {children}
    </button>
  )
}
export function ButtonLink({
  className = '',
  variant = 'primary',
  children,
  ...props
}: LinkProps & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return (
    <Link className={`button button--${variant} ${className}`} {...props}>
      {children}
    </Link>
  )
}
export function TextLink({ children, className = '', ...props }: LinkProps) {
  return (
    <Link className={`text-link ${className}`} {...props}>
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </Link>
  )
}
export function Card({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={`card ${className}`} {...props}>
      {children}
    </section>
  )
}
export function CardHeading({
  title,
  icon: Icon,
  action,
}: {
  title: string
  icon?: Icon
  action?: ReactNode
}) {
  return (
    <div className="card-heading">
      <div className="card-heading__title">
        {Icon && <IconBubble icon={Icon} small />}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  )
}
export function IconBubble({
  icon: Icon,
  tone = 'green',
  small = false,
}: {
  icon: Icon
  tone?: 'green' | 'amber' | 'blue' | 'gray'
  small?: boolean
}) {
  return (
    <span
      className={`icon-bubble icon-bubble--${tone} ${small ? 'icon-bubble--small' : ''}`}
    >
      <Icon size={small ? 25 : 32} weight="regular" aria-hidden="true" />
    </span>
  )
}
export function StatusBadge({ status }: { status: Status }) {
  const Icon = {
    pending: Clock,
    working: Play,
    resolved: Check,
    closed: Check,
  }[status]
  return (
    <span className={`badge badge--${status}`}>
      <Icon size={14} weight="bold" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  )
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge badge--${priority}`}>
      {priority === 'high' && (
        <Warning size={14} weight="fill" aria-hidden="true" />
      )}
      {priority === 'medium' && (
        <span className="priority-diamond" aria-hidden="true" />
      )}
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
export function Field({
  label,
  required,
  hint,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`field ${className}`}>
      <span className="field__label">
        {label}
        {required && (
          <span className="required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </span>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  )
}
export function Select({
  children,
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="select-wrap">
      <select className={`input ${className}`} {...props}>
        {children}
      </select>
      <CaretDown size={16} aria-hidden="true" />
    </span>
  )
}
export function Notice({
  children,
  tone = 'green',
  icon: Icon = Info,
}: {
  children: ReactNode
  tone?: 'green' | 'amber'
  icon?: Icon
}) {
  return (
    <div className={`notice notice--${tone}`}>
      <Icon size={21} weight="fill" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
export function SupportIllustration({
  variant = 'support',
}: {
  variant?: 'support' | 'success' | 'ticket'
}) {
  return (
    <div
      className={`support-illustration support-illustration--${variant}`}
      aria-hidden="true"
    >
      <span className="support-illustration__blob" />
      <Laptop
        size={150}
        weight="duotone"
        className="support-illustration__laptop"
      />
      <span className="support-illustration__symbol">
        {variant === 'success' ? (
          <Check size={35} weight="bold" />
        ) : (
          <Headset size={35} weight="duotone" />
        )}
      </span>
    </div>
  )
}
export function PageHeading({
  title,
  subtitle,
  action,
  illustration = true,
  children,
}: {
  title: string
  subtitle: string
  action?: ReactNode
  illustration?: boolean
  children?: ReactNode
}) {
  return (
    <header className="page-heading">
      {illustration && <SupportIllustration />}
      <div className="page-heading__copy">
        {children}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action && <div className="page-heading__action">{action}</div>}
    </header>
  )
}
export function Breadcrumbs({
  items,
}: {
  items: { label: string; to?: string }[]
}) {
  return (
    <nav aria-label="Ubicación" className="breadcrumbs">
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            {item.to ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
export function FlowStepper({ status }: { status: Status }) {
  const current = STATUSES.indexOf(status)
  return (
    <ol className="flow-stepper" aria-label="Avance del incidente">
      {STATUSES.map((step, index) => (
        <li
          key={step}
          className={`${index < current || status === 'closed' ? 'is-complete' : ''} ${step === status ? 'is-current' : ''}`}
          aria-current={step === status ? 'step' : undefined}
        >
          <span className="flow-stepper__number">
            {index < current || status === 'closed' ? (
              <Check size={18} weight="bold" aria-hidden="true" />
            ) : (
              index + 1
            )}
          </span>
          <span>{STATUS_LABELS[step]}</span>
        </li>
      ))}
    </ol>
  )
}
export function EmptyState({
  title = 'No encontramos incidentes',
  description,
  action,
}: {
  title?: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <IconBubble icon={Info} />
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  )
}
export function FormError({ message }: { message: string }) {
  return message ? (
    <div className="form-error" role="alert">
      <Warning size={19} aria-hidden="true" />
      {message}
    </div>
  ) : null
}
export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (open && dialog && !dialog.open) dialog.showModal()
    if (!open && dialog?.open) dialog.close()
  }, [open])
  return (
    <dialog
      className="modal"
      ref={ref}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const r = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < r.left ||
            event.clientX > r.right ||
            event.clientY < r.top ||
            event.clientY > r.bottom
          )
            onClose()
        }
      }}
      aria-labelledby={`modal-${title.replace(/\s/g, '-')}`}
    >
      <div className="modal__header">
        <h2 id={`modal-${title.replace(/\s/g, '-')}`}>{title}</h2>
        <button
          className="icon-button"
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana"
        >
          <X size={22} />
        </button>
      </div>
      {children}
    </dialog>
  )
}
