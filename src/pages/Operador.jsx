import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReportes } from '../ReportesContext.jsx'
import { GRUPOS, UNIDADES, colorDeGrupo, nombreDeGrupo } from '../data/grupos.js'
import { formatoHora, formatoFecha, claseEstado } from '../utilidades.js'
import MapaOperador from '../mapa/MapaOperador.jsx'

//vaciar los reportes
function Lista({ reportes, onSeleccionar }) {
  const { vaciarReportes } = useReportes()


  //funcion por si no hay reportes
  if (reportes.length === 0) {
    return <p>Todavía no hay reportes. Crea uno desde la pantalla del ciudadano.</p>
  }

  function borrarTodos() {
    if (window.confirm('¿Borrar todos los reportes?')) vaciarReportes()
  }


  return (
    <>
      {/* borrar los reportes */}
      <div className="lista__cabecera">
        <span>{reportes.length} reportes</span>
        <button className="boton boton--eliminar" onClick={borrarTodos}>
          Borrar todos
        </button>
      </div>

      {/* mostrar los reportes */}
      <ul className="lista">
        {reportes.map((r) => (
          <li key={r.id}>
            <button className="item" onClick={() => onSeleccionar(r.id)}>
              <span className="item__punto" style={{ '--color': colorDeGrupo(r.grupo) }} />
              <span>
                <strong>{r.grupo}</strong> · {r.barrio}
                <br />
                <small>
                  {r.radicado} · {formatoHora(r.creadoEn)}
                </small>
              </span>
              <span className={claseEstado(r.estado)}>{r.estado}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

//detalle de los reportes
function Detalle({ reporte, onVolver }) {
  const { validarReporte, descartarReporte, despacharReporte, cerrarReporte, eliminarReporte } = useReportes()
  const [grupo, setGrupo] = useState(reporte.grupo)
  const [unidad, setUnidad] = useState(UNIDADES[0])

  const recibido = reporte.estado === 'Recibido'
  const validado = reporte.estado === 'Validado'
  const despachado = reporte.estado === 'Unidad despachada'
  const terminado = reporte.estado === 'Cerrado' || reporte.estado === 'Descartado'

  function eliminar() {
    if (window.confirm('¿Eliminar este reporte?')) {
      eliminarReporte(reporte.id)
      onVolver()
    }
  }

  //boton de volver a la lista de todos los reportes cuando estás dentro de uno
  return (
    <section className="detalle">
      <button className="boton-volver" onClick={onVolver}>
        <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        Volver a la lista
      </button>


      <h3>
        {reporte.radicado} <span className={claseEstado(reporte.estado)}>{reporte.estado}</span>
      </h3>
      <p className="detalle__hora">
        {formatoFecha(reporte.creadoEn)} · {formatoHora(reporte.creadoEn)}
      </p>

      <dl>
        <dt>Ciudadano</dt>
        <dd>
          {reporte.nombres} {reporte.apellidos}
        </dd>
        <dt>Teléfono</dt>
        <dd>{reporte.telefono}</dd>
        <dt>Grupo</dt>
        <dd>
          <span className="item__punto" style={{ '--color': colorDeGrupo(reporte.grupo) }} /> {reporte.grupo} ·{' '}
          {nombreDeGrupo(reporte.grupo)}
        </dd>
        <dt>¿Qué ve?</dt>
        <dd>{reporte.queVe}</dd>
        <dt>Dirección</dt>
        <dd>{reporte.direccion}</dd>
        <dt>Barrio</dt>
        <dd>{reporte.barrio}</dd>
        <dt>Referencia</dt>
        <dd>{reporte.referencia}</dd>
        <dt>Edificio</dt>
        <dd>{reporte.edificio}</dd>
        {reporte.unidad && (
          <>
            <dt>Unidad</dt>
            <dd>{reporte.unidad}</dd>
          </>
        )}
      </dl>

      {reporte.fotos.length > 0 && (
        <div className="fotos-detalle">
          {reporte.fotos.map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer">
              <img src={url} alt="Foto del ciudadano" />
            </a>
          ))}
        </div>
      )}

      <div className="acciones">
        <a className="boton boton--secundario" href={`tel:${reporte.telefono}`}>
          Llamar
        </a>
        <a
          className="boton boton--secundario"
          href={`https://www.google.com/maps?q=${reporte.lat},${reporte.lng}`}
          target="_blank"
          rel="noreferrer"
        >
          Ver en Google Maps
        </a>
      </div>

      {recibido && (
        <div className="bloque">
          <strong>1. Contactar y validar</strong>
          <label>
            Grupo de emergencia (puedes corregirlo)
            <select value={grupo} onChange={(e) => setGrupo(Number(e.target.value))}>
              {GRUPOS.map((g) => (
                <option key={g.codigo} value={g.codigo}>
                  {g.codigo} · {g.nombre}
                </option>
              ))}
            </select>
          </label>
          <div className="acciones">
            <button className="boton boton--principal" onClick={() => validarReporte(reporte.id, grupo)}>
              Validar
            </button>
            <button className="boton boton--peligro" onClick={() => descartarReporte(reporte.id)}>
              Descartar
            </button>
          </div>
        </div>
      )}

      {!despachado && !terminado && (
        <div className="bloque">
          <strong>2. Despachar</strong>
          <select value={unidad} onChange={(e) => setUnidad(e.target.value)} disabled={!validado}>
            {UNIDADES.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
          <button
            className="boton boton--principal"
            disabled={!validado}
            onClick={() => despacharReporte(reporte.id, unidad)}
          >
            Despachar unidad
          </button>
          {!validado && <small>Primero valida el reporte para poder despachar.</small>}
        </div>
      )}

      {despachado && (
        <div className="bloque">
          <strong>3. Cerrar el caso</strong>
          <button className="boton boton--principal" onClick={() => cerrarReporte(reporte.id)}>
            Cerrar caso
          </button>
        </div>
      )}

      <button className="boton boton--eliminar" onClick={eliminar}>
        Eliminar reporte
      </button>
    </section>
  )
}


//componente principal Operador que muestra el mapa con los datos dados por el ciudadano
export default function Operador() {
  const { reportes } = useReportes()
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const seleccionado = reportes.find((r) => r.id === seleccionadoId)

  return (
    <div className="operador">
      <div className="operador__mapa">
        <MapaOperador reportes={reportes} seleccionadoId={seleccionadoId} onSeleccionar={setSeleccionadoId} />
      </div>

      <aside className="operador__panel">
        <div className="operador__titulo">
          <h2>Radio operador</h2>
          <Link to="/" className="boton-volver">
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            Volver al inicio
          </Link>
        </div>

        {seleccionado ? (
          <Detalle key={seleccionado.id} reporte={seleccionado} onVolver={() => setSeleccionadoId(null)} />
        ) : (
          <Lista reportes={reportes} onSeleccionar={setSeleccionadoId} />
        )}
      </aside>
    </div>
  )
}
