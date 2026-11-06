import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { IncidentListPage } from './pages/IncidentListPage'
import { NewIncidentPage } from './pages/NewIncidentPage'
import { IncidentDetailPage } from './pages/IncidentDetailPage'
import { ResolutionPage } from './pages/ResolutionPage'
import { ClosurePage } from './pages/ClosurePage'
import { NotFoundPage } from './pages/NotFoundPage'

export function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = `${pathname === '/' ? 'Panel principal' : pathname.endsWith('/nuevo') ? 'Reportar incidente' : pathname.endsWith('/resolucion') ? 'Registrar solución' : pathname.endsWith('/cierre') ? 'Confirmación y cierre' : 'Incidentes'} · Soluciona TI`
  }, [pathname])
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="incidentes" element={<IncidentListPage />} />
        <Route path="incidentes/nuevo" element={<NewIncidentPage />} />
        <Route path="incidentes/:id" element={<IncidentDetailPage />} />
        <Route path="incidentes/:id/resolucion" element={<ResolutionPage />} />
        <Route path="incidentes/:id/cierre" element={<ClosurePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
