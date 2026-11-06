# Soluciona TI

Sistema académico de **gestión de incidentes de TI**, construido con React, TypeScript y Vite. Implementa las vistas aprobadas con la paleta verde esmeralda, tarjetas blancas y componentes reutilizables.

## Ejecutar

Requiere Node.js 22.12 o posterior.

```sh
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://127.0.0.1:5173`.

```sh
npm test          # Reglas del flujo y persistencia
npm run build    # Comprobación de TypeScript y compilación de producción
npm run preview  # Revisar la compilación generada
```

## Vistas y comportamiento

- **Panel principal:** indicadores calculados a partir de los incidentes, últimos registros y accesos al flujo.
- **Registrar incidente:** formulario validado, prioridad según impacto y urgencia y código secuencial.
- **Incidentes:** búsqueda sin distinguir tildes o mayúsculas, filtros por estado/prioridad y ordenamiento.
- **Detalle y atención:** descripción, datos del ticket, asignación del responsable e historial.
- **Registrar solución:** acciones realizadas y pruebas de recuperación obligatorias.
- **Confirmar recuperación:** confirmación explícita del usuario; permite devolver a atención si la falla continúa.
- **Ticket cerrado:** solución, pruebas, confirmación y trazabilidad de toda la atención.

Los tres incidentes iniciales son ejemplos. Los botones **Completar con un ejemplo** permiten demostrar el recorrido sin tener que escribir todos los campos. Estos datos se pueden editar antes de guardar.

Al registrar, iniciar atención, resolver, reabrir o cerrar un incidente, una transición breve muestra la acción en curso y su confirmación. El componente de retroalimentación es compartido, evita envíos duplicados y respeta la preferencia de movimiento reducido. Si se cambia de página antes de aplicar la acción, se cancela la transición pendiente.

## Sin base de datos

Los registros se guardan en `localStorage`, bajo la clave `soluciona-ti:incidents:v1`. Permanecen al recargar o cerrar la página y son propios de cada navegador y origen. No se comparten entre dispositivos ni entre la dirección local y la de Vercel. Borrar los datos del navegador elimina estos registros. No hay servidor ni autenticación; los nombres del equipo son parte de la demostración.

Desde **Datos de demostración** se puede descargar una copia JSON o restaurar los ejemplos con confirmación. Las pestañas del mismo navegador se actualizan al recibir cambios guardados; esta aplicación local no pretende resolver edición concurrente multiusuario. Si el almacenamiento está bloqueado o contiene datos incompatibles, la interfaz lo informa y evita sobrescribirlos automáticamente.

## Publicar en Vercel

Importa este repositorio y usa:

| Opción           | Valor                |
| ---------------- | -------------------- |
| Framework        | Vite                 |
| Root Directory   | raíz del repositorio |
| Install Command  | `npm ci`             |
| Build Command    | `npm run build`      |
| Output Directory | `dist`               |
| Node.js          | 22.x o posterior     |

No requiere variables de entorno. `vercel.json` incluye la reescritura de rutas para abrir o recargar directamente `/incidentes/INC-001`, `/resolucion` o `/cierre`. Referencia: [Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite).

La carpeta `output/mockups/` contiene los diseños de referencia y no forma parte del sitio compilado.

## Organización

```text
src/
  components/   Componentes visuales, navegación, formularios y tarjetas compartidas
  context/      Estado global y persistencia local
  domain/       Reglas del ciclo de vida, búsqueda, almacenamiento y pruebas
  hooks/        Consulta del incidente seleccionado
  pages/        Vistas de la aplicación
  styles.css    Paleta, componentes y adaptación a móvil
```

Las transiciones y el cálculo de prioridad se definen una sola vez en `domain/incidents.ts`. Los datos se validan al recuperarse. No se permite resolver un ticket pendiente, cerrar sin solución y confirmación, ni duplicar una transición por pulsaciones repetidas.
