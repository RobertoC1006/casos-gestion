import { useEffect, useState } from 'react'
import { ArrowCounterClockwise, Check, Envelope, Monitor, Pause, Play, Printer, WifiHigh, Wrench } from '@phosphor-icons/react'
import type { Incident } from '../domain/incidents'

const scenes = {
  'Impresión de comprobantes': { type: 'printer', icon: Printer, title: 'Revisión de la impresora', steps: ['El encargado se acerca a la impresora', 'Revisa la conexión y la cola de impresión', 'Realiza una impresión de prueba'] },
  'Sistema de ventas': { type: 'computer', icon: Monitor, title: 'Diagnóstico del sistema de ventas', steps: ['El encargado revisa el equipo de caja', 'Analiza la lentitud del sistema', 'Prueba el registro de una venta'] },
  'Conectividad': { type: 'network', icon: WifiHigh, title: 'Revisión de la conexión de red', steps: ['El encargado inspecciona la conexión', 'Revisa el cable y el punto de acceso', 'Comprueba la comunicación del equipo'] },
  'Correo empresarial': { type: 'mail', icon: Envelope, title: 'Revisión del correo empresarial', steps: ['El encargado abre la configuración del correo', 'Revisa la cuenta y la conexión', 'Envía un mensaje de prueba'] },
  'Equipos de trabajo': { type: 'equipment', icon: Monitor, title: 'Revisión del equipo de trabajo', steps: ['El encargado inspecciona el equipo', 'Revisa sus componentes y configuración', 'Comprueba el funcionamiento'] },
}

export function TechnicianScene({ incident }: { incident: Pick<Incident, 'id' | 'service' | 'area' | 'assignedTo'> }) {
  const scene = scenes[incident.service as keyof typeof scenes] || scenes['Equipos de trabajo']
  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => { if (media.matches) setPaused(true) }
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => setStep(value => (value + 1) % 3), 2800)
    return () => window.clearInterval(timer)
  }, [paused, incident.id])
  const Device = scene.icon
  return <section className="technician-scene card" aria-label={`Animación ilustrativa: ${scene.title}`}>
    <div className="technician-scene__heading"><div><span className="technician-scene__eyebrow">El encargado en acción</span><h2>{scene.title}</h2></div><div className="technician-scene__controls"><button className="icon-button" type="button" aria-label={paused ? 'Reproducir escena' : 'Pausar escena'} onClick={() => setPaused(value => !value)}>{paused ? <Play size={19} /> : <Pause size={19} />}</button><button className="icon-button" type="button" aria-label="Reiniciar escena" onClick={() => setStep(0)}><ArrowCounterClockwise size={19} /></button></div></div>
    <figure className={`work-scene work-scene--${scene.type} work-scene--step-${step} ${paused ? 'work-scene--paused' : ''}`}>
      <div className="work-scene__drawing" aria-hidden="true">
        <span className="work-scene__wall-line" /><span className="work-scene__floor" />
        <div className="scene-technician"><span className="scene-technician__head"><i /></span><span className="scene-technician__body" /><span className="scene-technician__arm scene-technician__arm--back" /><span className="scene-technician__arm scene-technician__arm--front"><Wrench size={23} weight="fill" /></span><span className="scene-technician__leg scene-technician__leg--left" /><span className="scene-technician__leg scene-technician__leg--right" /></div>
        <div className="scene-desk"><div className="scene-device"><Device size={scene.type === 'printer' ? 94 : 100} weight="duotone" /><span className="scene-device__scan" />{scene.type === 'printer' ? <span className="scene-receipt"><i /><i /><i /><Check size={13} /></span> : <span className="scene-screen"><i /><i /><i /></span>}{scene.type === 'network' && <span className="scene-network-signal"><i /><i /><i /></span>}{scene.type === 'mail' && <Envelope className="scene-mail" size={26} weight="fill" />}</div><span className="scene-desk__surface" /><span className="scene-desk__leg" /></div>
        <span className="scene-task-bubble" key={step}>{step === 0 ? <Wrench size={20} /> : step === 1 ? <span className="scene-thinking"><i /><i /><i /></span> : <Check size={23} weight="bold" />}</span>
        <span className="scene-location">{incident.area}</span>
      </div>
      <figcaption><span className="scene-step-count">{step + 1} / 3</span><span>{scene.steps[step]}</span></figcaption>
    </figure>
    <ol className="scene-step-picker" aria-label="Etapas de la representación">{scene.steps.map((label, index) => <li key={label}><button type="button" aria-label={label} aria-pressed={step === index} onClick={() => { setStep(index); setPaused(true) }}><span>{index + 1}</span></button></li>)}</ol>
    <p className="technician-scene__caption">{incident.assignedTo} · Escena ilustrativa. La solución real la registra el responsable.</p>
  </section>
}
