import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReportes } from '../ReportesContext.jsx'
import { GRUPOS, PASOS, MENSAJE_ESTADO } from '../data/grupos.js'
import { BARRIOS } from '../data/barrios.js'
import { validarFormulario, formatoHora, formatoFecha, claseEstado } from '../utilidades.js'
import Cabecera from '../components/Cabecera.jsx'

//cantidad máxima de fotos y videos
const MAX_ARCHIVOS = 3

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
  const [archivos, setArchivos] = useState([])
  const [avisoArchivos, setAvisoArchivos] = useState('')

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

  function agregarArchivos(e) {
    const elegidas = Array.from(e.target.files)
    const espacio = MAX_ARCHIVOS - archivos.length
    const aceptadas = elegidas.slice(0, espacio)

    if (elegidas.length > espacio) {
      setAvisoArchivos(`Solo puedes adjuntar hasta ${MAX_ARCHIVOS} archivos (fotos o videos).`)
    } else {
      setAvisoArchivos('')
    }

    const nuevos = aceptadas.map((archivo) => ({
      id: `${archivo.name}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(archivo),
      tipo: archivo.type.startsWith('video/') ? 'video' : 'imagen',
      nombre: archivo.name,
    }))

    setArchivos((prev) => [...prev, ...nuevos])
    e.target.value = ''
  }

  function quitarArchivo(id) {
    const encontrado = archivos.find((a) => a.id === id)
    if (encontrado) {
      URL.revokeObjectURL(encontrado.url)
    }
    setArchivos((prev) => prev.filter((a) => a.id !== id))
    setAvisoArchivos('')
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
      fotos: archivos,
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
        <legend>Fotos y videos (opcional, máximo {MAX_ARCHIVOS})</legend>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={agregarArchivos}
          disabled={archivos.length >= MAX_ARCHIVOS}
        />
        {avisoArchivos && <span className="campo__error">{avisoArchivos}</span>}
        <div className="fotos">
          {archivos.map((item) => (
            <div className={`foto ${item.tipo === 'video' ? 'foto--video' : ''}`} key={item.id}>
              {item.tipo === 'video' ? (
                <div className="foto__video-preview">
                  <video src={item.url} muted playsInline preload="metadata" />
                  <span className="foto__badge-video">
                    <span className="material-symbols-outlined">videocam</span>
                  </span>
                </div>
              ) : (
                <img src={item.url} alt="Evidencia de la emergencia" />
              )}
              <button
                type="button"
                onClick={() => quitarArchivo(item.id)}
                aria-label={`Quitar ${item.tipo === 'video' ? 'video' : 'foto'}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <span className="ayuda">
          Una foto o video claro del lugar ayuda a que los bomberos clasifiquen el incidente y lleguen más rápido.
        </span>
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

// Ventana flotante con recomendaciones importantes para el ciudadano
function VentanaRecomendaciones({ abierta, onCerrar }) {
  if (!abierta) return null

  return (
    <div className="ventana-flotante-overlay" role="dialog" aria-modal="true" aria-labelledby="titulo-recomendaciones">
      <div className="ventana-flotante">
        <div className="ventana-flotante__cabecera">
          <div className="ventana-flotante__titulo">
            <span className="material-symbols-outlined icono-alerta"></span>
            <h3 id="titulo-recomendaciones">Recomendaciones importantes para el ciudadano</h3>
          </div>
          <button className="ventana-flotante__cerrar" onClick={onCerrar} aria-label="Cerrar ventana">
            &times;
          </button>
        </div>

        <div className="ventana-flotante__contenido">
          <div className="recomendacion-item">
            <span className="material-symbols-outlined item-icono"></span>
            <div>
              <strong>Prioriza tu vida y seguridad</strong>
              <p>
                No te acerques al fuego, derrumbes, inundaciones ni cables energizados para tomar fotos o videos. Mantente siempre a una distancia prudente y segura.
              </p>
            </div>
          </div>

          <div className="recomendacion-item">
            <span className="material-symbols-outlined item-icono"></span>
            <div>
              <strong>Cómo tomar fotos o videos útiles</strong>
              <p>
                Graba o fotografía de forma <strong>horizontal</strong>. Captura fachadas, esquinas y letreros de referencia para que las unidades de bomberos ubiquen el punto con precisión.
              </p>
            </div>
          </div>

          <div className="recomendacion-item">
            <span className="material-symbols-outlined item-icono"></span>
            <div>
              <strong>Mantén tu teléfono disponible</strong>
              <p>
                El radio operador de Bomberos Cali podría llamarte inmediatamente al número reportado para verificar detalles o guiarte antes de la llegada de la unidad.
              </p>
            </div>
          </div>

          <div className="recomendacion-item">
            <span className="material-symbols-outlined item-icono"></span>
            <div>
              <strong>¿Riesgo inminente para la vida?</strong>
              <p>
                Si hay personas atrapadas o una amenaza extrema que requiera atención inmediata, marca directamente al <strong>119</strong> o <strong>123</strong> sin demora.
              </p>
            </div>
          </div>
        </div>

        <div className="ventana-flotante__pie">
          <button type="button" className="boton boton--principal" onClick={onCerrar}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}


export default function Reportar() {
  const { reportes, ultimoId, agregarReporte, olvidarUltimo } = useReportes()
  const reporte = reportes.find((r) => r.id === ultimoId)
  const [mostrarRecomendaciones, setMostrarRecomendaciones] = useState(true)

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
            <p>Completa los datos. Si puedes, adjunta fotos o videos del lugar.</p>
            <Formulario onEnviar={agregarReporte} />
          </>
        )}
      </main>

      {/* Botón flotante para reabrir recomendaciones */}
      <button
        type="button"
        className="boton-flotante-ayuda"
        onClick={() => setMostrarRecomendaciones(true)}
        aria-label="Ver recomendaciones para ciudadanos"
      >
        <span className="material-symbols-outlined" aria-hidden="true"></span>
        <span>Recomendaciones</span>
      </button>

      {/* Ventana flotante */}
      <VentanaRecomendaciones
        abierta={mostrarRecomendaciones}
        onCerrar={() => setMostrarRecomendaciones(false)}
      />
    </>
  )
}
