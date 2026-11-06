import { useParams } from 'react-router-dom'
import { useIncidents } from '../context/IncidentsContext'

export function useCurrentIncident() {
  const { id } = useParams()
  const context = useIncidents()
  return { ...context, incident: context.incidents.find((i) => i.id === id) }
}
