import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReportes } from '../ReportesContext.jsx'
import { GRUPOS, PASOS, MENSAJE_ESTADO } from '../data/grupos.js'
import { BARRIOS } from '../data/barrios.js'
import { validarFormulario, formatoHora, formatoFecha, claseEstado } from '../utilidades.js'
import Cabecera from '../components/Cabecera.jsx'

//cantidad de fotos
const MAX_FOTOS = 3

//variables vacías para llenar
const VACIO = {
  nombres: '',
  apellidos: '',
  telefono: '',
  grupo: '',
  queVe: '',
  direccion: '',
  barrio: '',
  referencia: '',
  edificio: '',
  edificioNoAplica: false,
}

// helper para los campos
function Campo({ etiqueta, error, children }) {
  return (
    <label className="campo">
      <span className="campo__etiqueta">
        {etiqueta} <b className="campo__req">*</b>
      </span>
      {children}
      {error && <span className="campo__error">{error}</span>}
    </label>
  )
}

// formulario para la gente
function Formulario({ onEnviar }) {
  const [valores, setValores] = useState(VACIO)
  const [tocados, setTocados] = useState({})
  const [fotos, setFotos] = useState([])
  const [avisoFotos, setAvisoFotos] = useState('')

  const errores = validarFormulario(valores)
  const hayErrores = Object.keys(errores).length > 0
  const errorDe = (nombre) => (tocados[nombre] ? errores[nombre] : '')

  function cambiar(e) {
    const { name, type, checked } = e.target
    let valor = type === 'checkbox' ? checked : e.target.value
    if (name === 'telefono') valor = valor.replace(/\D/g, '').slice(0, 10)
    setValores({ ...valores, [name]: valor })
  }

  function tocar(e) {
    setTocados({ ...tocados, [e.target.name]: true })
  }

  function agregarFotos(e) {
    const elegidas = Array.from(e.target.files)
    const espacio = MAX_FOTOS - fotos.length
    const aceptadas = elegidas.slice(0, espacio)

    setAvisoFotos(elegidas.length > espacio ? `Solo puedes adjuntar ${MAX_FOTOS} fotos` : '')
    setFotos([...fotos, ...aceptadas.map((archivo) => URL.createObjectURL(archivo))])
    e.target.value = ''
  }

  function quitarFoto(url) {
    URL.revokeObjectURL(url)
    setFotos(fotos.filter((f) => f !== url))
    setAvisoFotos('')
  }

  function enviar(e) {
    e.preventDefault()
    if (hayErrores) return

    onEnviar({
      nombres: valores.nombres.trim(),
      apellidos: valores.apellidos.trim(),
      telefono: valores.telefono,
      grupo: Number(valores.grupo),
      queVe: valores.queVe.trim(),
      direccion: valores.direccion.trim(),
      barrio: valores.barrio,
      referencia: valores.referencia.trim(),
      edificio: valores.edificioNoAplica ? 'No aplica' : valores.edificio.trim(),
      fotos,
    })
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <fieldset>
        <legend>Tus datos</legend>
        <div className="fila">
          <Campo etiqueta="Nombres" error={errorDe('nombres')}>
            <input name="nombres" value={valores.nombres} onChange={cambiar} onBlur={tocar} />
          </Campo>
          <Campo etiqueta="Apellidos" error={errorDe('apellidos')}>
            <input name="apellidos" value={valores.apellidos} onChange={cambiar} onBlur={tocar} />
          </Campo>
        </div>
        <Campo etiqueta="Teléfono" error={errorDe('telefono')}>
          <input
            name="telefono"
            inputMode="numeric"
            placeholder="10 dígitos"
            value={valores.telefono}
            onChange={cambiar}
            onBlur={tocar}
          />
        </Campo>
      </fieldset>

      <fieldset>
        <legend>La emergencia</legend>
        <Campo etiqueta="Grupo de emergencia" error={errorDe('grupo')}>
          <select name="grupo" value={valores.grupo} onChange={cambiar} onBlur={tocar}>
            <option value="">Elige una opción</option>
            {GRUPOS.map((g) => (
              <option key={g.codigo} value={g.codigo}>
                {g.codigo} · {g.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="¿Qué ve?" error={errorDe('queVe')}>
          <textarea name="queVe" rows={3} value={valores.queVe} onChange={cambiar} onBlur={tocar} />
        </Campo>
      </fieldset>

      <fieldset>
        <legend>¿Dónde es?</legend>
        <Campo etiqueta="Dirección" error={errorDe('direccion')}>
          <input name="direccion" value={valores.direccion} onChange={cambiar} onBlur={tocar} />
        </Campo>
        <Campo etiqueta="Barrio" error={errorDe('barrio')}>
          <select name="barrio" value={valores.barrio} onChange={cambiar} onBlur={tocar}>
            <option value="">Elige un barrio</option>
            {BARRIOS.map((b) => (
              <option key={b.nombre} value={b.nombre}>
                {b.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Punto de referencia" error={errorDe('referencia')}>
          <input name="referencia" value={valores.referencia} onChange={cambiar} onBlur={tocar} />
        </Campo>
        <Campo etiqueta="Nombre del edificio" error={errorDe('edificio')}>
          <input
            name="edificio"
            value={valores.edificio}
            onChange={cambiar}
            onBlur={tocar}
            disabled={valores.edificioNoAplica}
          />
        </Campo>
        <label className="casilla">
          <input type="checkbox" name="edificioNoAplica" checked={valores.edificioNoAplica} onChange={cambiar} />
          No aplica
        </label>
      </fieldset>

      <fieldset>
        <legend>Fotos (opcional, máximo {MAX_FOTOS})</legend>
        <input type="file" accept="image/*" multiple onChange={agregarFotos} disabled={fotos.length >= MAX_FOTOS} />
        {avisoFotos && <span className="campo__error">{avisoFotos}</span>}
        <div className="fotos">
          {fotos.map((url) => (
            <div className="foto" key={url}>
              <img src={url} alt="Foto de la emergencia" />
              <button type="button" onClick={() => quitarFoto(url)} aria-label="Quitar foto">
                ×
              </button>
            </div>
          ))}
        </div>
        <span className="ayuda">Una foto clara del lugar ayuda a que lleguemos más rápido.</span>
      </fieldset>

      <button type="submit" className="boton boton--principal" disabled={hayErrores}>
        Enviar reporte
      </button>
      {hayErrores && <span className="ayuda">Completa todos los campos con * para poder enviar.</span>}
    </form>
  )
}


//confirmación del reporte que hace la persona
function Confirmacion({ reporte, onNuevo }) {
  const posicion = PASOS.indexOf(reporte.estado)

  return (
    <section className="confirmacion">
      <p>Recibimos tu reporte</p>
      <div className="confirmacion__radicado">{reporte.radicado}</div>
      <p>
        {formatoFecha(reporte.creadoEn)} · {formatoHora(reporte.creadoEn)}
      </p>
      <span className={claseEstado(reporte.estado)}>{reporte.estado}</span>
      <p>
        {MENSAJE_ESTADO[reporte.estado]}
        {reporte.estado === 'Unidad despachada' && reporte.unidad && ` Unidad: ${reporte.unidad}.`}
      </p>

      {posicion >= 0 && (
        <ol className="pasos">
          {PASOS.map((paso, i) => (
            <li key={paso} className={i < posicion ? 'hecho' : i === posicion ? 'actual' : ''}>
              {paso}
            </li>
          ))}
        </ol>
      )}

      <button className="boton boton--oscuro" onClick={onNuevo}>
        Hacer otro reporte
      </button>
    </section>
  )
}

// TODO (estudiantes): formulario con todos los campos obligatorios
// (sección 3 y Pantalla 2 del enunciado). Usar data/grupos.js y data/barrios.js.
export default function Reportar() {
  const { reportes, ultimoId, agregarReporte, olvidarUltimo } = useReportes()
  const reporte = reportes.find((r) => r.id === ultimoId)

  return (
    <>
      <Cabecera />
      <main className="pagina">
        <Link to="/" className="boton-volver">
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          Volver al inicio
        </Link>

        {reporte ? (
          <Confirmacion reporte={reporte} onNuevo={olvidarUltimo} />
        ) : (
          <>
            <h1>Reportar emergencia</h1>
            <p>Completa los datos. Si puedes, adjunta fotos del lugar.</p>
            <Formulario onEnviar={agregarReporte} />
          </>
        )}
      </main>
    </>
  )
}
