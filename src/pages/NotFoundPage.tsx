import { ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react'
import { ButtonLink, Card, IconBubble } from '../components/ui'

export function NotFoundPage({ ticket = false }: { ticket?: boolean }) {
  return (
    <Card className="not-found">
      <IconBubble icon={MagnifyingGlass} />
      <h1>
        {ticket
          ? 'No encontramos este incidente'
          : 'Esta página no está disponible'}
      </h1>
      <p>
        {ticket
          ? 'Revisa el código o vuelve a la lista de incidentes de este navegador.'
          : 'Puedes volver al panel y continuar desde allí.'}
      </p>
      <ButtonLink to={ticket ? '/incidentes' : '/'}>
        <ArrowLeft size={18} />
        {ticket ? 'Ver incidentes' : 'Volver al panel'}
      </ButtonLink>
    </Card>
  )
}
