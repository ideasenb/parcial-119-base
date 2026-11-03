export function formatoHora(iso) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

export function formatoFecha(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function claseEstado(estado) {
  return `estado estado--${estado.toLowerCase().replace(/ /g, '-')}`
}

export function validarFormulario(v) {
  const errores = {}

  if (!v.nombres.trim()) errores.nombres = 'Escribe tus nombres'
  if (!v.apellidos.trim()) errores.apellidos = 'Escribe tus apellidos'
  if (!/^\d{10}$/.test(v.telefono)) errores.telefono = 'El teléfono debe tener 10 dígitos, solo números'
  if (!v.grupo) errores.grupo = 'Elige el grupo de emergencia'
  if (!v.queVe.trim()) errores.queVe = 'Cuéntanos qué estás viendo'
  if (!v.direccion.trim()) errores.direccion = 'Escribe la dirección'
  if (!v.barrio) errores.barrio = 'Elige el barrio'
  if (!v.referencia.trim()) errores.referencia = 'Escribe un punto de referencia'
  if (!v.edificioNoAplica && !v.edificio.trim()) {
    errores.edificio = 'Escribe el nombre del edificio o marca "No aplica"'
  }

  return errores
}
