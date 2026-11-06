import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { IconContext } from '@phosphor-icons/react'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-600.css'
import '@fontsource/dm-sans/latin-700.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/latin-700.css'
import '@fontsource/manrope/latin-800.css'
import { IncidentsProvider } from './context/IncidentsContext'
import { ActionFeedbackProvider } from './context/ActionFeedbackContext'
import { App } from './App'
import './styles.css'
import './technician-scene.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IconContext.Provider value={{ size: 22, weight: 'regular' }}>
      <BrowserRouter>
        <IncidentsProvider>
          <ActionFeedbackProvider>
            <App />
          </ActionFeedbackProvider>
        </IncidentsProvider>
      </BrowserRouter>
    </IconContext.Provider>
  </StrictMode>,
)
