import { createContext, useContext, useEffect, useState } from 'react'
import { BARRIOS } from './data/barrios.js'

const CLAVE_REPORTES = 'reportes119'
const CLAVE_ULTIMO = 'ultimoReporte119'

const ReportesContext = createContext(null)

function leer(clave, valorPorDefecto) {
  try {
    const guardado = localStorage.getItem(clave)
    return guardado ? JSON.parse(guardado) : valorPorDefecto
  } catch {
    return valorPorDefecto
  }
}

export function ReportesProvider({ children }) {
  const [reportes, setReportes] = useState(() => leer(CLAVE_REPORTES, []))
  const [ultimoId, setUltimoId] = useState(() => leer(CLAVE_ULTIMO, null))

  // Las fotos son URLs temporales, por eso no se guardan
  useEffect(() => {
    localStorage.setItem(CLAVE_REPORTES, JSON.stringify(reportes.map((r) => ({ ...r, fotos: [] }))))
  }, [reportes])

  useEffect(() => {
    localStorage.setItem(CLAVE_ULTIMO, JSON.stringify(ultimoId))
  }, [ultimoId])

  function agregarReporte(datos) {
    const barrio = BARRIOS.find((b) => b.nombre === datos.barrio)
    const id = reportes.reduce((mayor, r) => Math.max(mayor, r.id), 0) + 1
    const desvio = () => (Math.random() - 0.5) * 0.004

    const nuevo = {
      ...datos,
      id,
      radicado: `119-${String(id).padStart(4, '0')}`,
      creadoEn: new Date().toISOString(),
      estado: 'Recibido',
      unidad: null,
      lat: barrio.lat + desvio(),
      lng: barrio.lng + desvio(),
    }

    setReportes([nuevo, ...reportes])
    setUltimoId(id)
    return nuevo
  }

  // Solo cambia el reporte si cumple la condición, así no se saltan pasos
  function actualizar(id, cambios, condicion) {
    setReportes((anteriores) =>
      anteriores.map((r) => (r.id === id && condicion(r) ? { ...r, ...cambios } : r))
    )
  }

  const valor = {
    reportes,
    ultimoId,
    agregarReporte,
    validarReporte: (id, grupo) => actualizar(id, { estado: 'Validado', grupo }, (r) => r.estado === 'Recibido'),
    descartarReporte: (id) => actualizar(id, { estado: 'Descartado' }, (r) => r.estado === 'Recibido'),
    despacharReporte: (id, unidad) =>
      actualizar(id, { estado: 'Unidad despachada', unidad }, (r) => r.estado === 'Validado'),
    cerrarReporte: (id) => actualizar(id, { estado: 'Cerrado' }, (r) => r.estado === 'Unidad despachada'),
    eliminarReporte: (id) => setReportes((anteriores) => anteriores.filter((r) => r.id !== id)),
    vaciarReportes: () => {
      setReportes([])
      setUltimoId(null)
    },
    olvidarUltimo: () => setUltimoId(null),
  }

  return <ReportesContext.Provider value={valor}>{children}</ReportesContext.Provider>
}

export function useReportes() {
  return useContext(ReportesContext)
}
