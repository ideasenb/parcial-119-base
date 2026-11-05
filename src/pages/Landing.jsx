import { Link } from 'react-router-dom'
import { GRUPOS } from '../data/grupos.js'
import Cabecera from '../components/Cabecera.jsx'
import EscenaLanding from '../three/EscenaLanding.jsx'

export default function Landing() {
  return (
    <>
      <Cabecera />

      <section className="hero">
        <div className="hero__texto">
          <p className="hero__pregunta">¿Tienes una emergencia?</p>
          <h1>Repórtala con tu ubicación y una foto</h1>
          <p>
            Un radio operador de Bomberos Cali recibe tu reporte, lo valida y despacha la unidad que necesitas.
          </p>
          <div className="hero__botones">
            <Link to="/reportar" className="boton boton--principal">
              Reportar emergencia
            </Link>
            <a href="tel:119" className="boton boton--secundario">
              Llamar al 119
            </a>
          </div>
        </div>

        <div>
          <div className="hero__escena">
            <EscenaLanding />
          </div>
          <p className="hero__nota">Toca el fondo para cambiar entre día y noche.</p>
        </div>
      </section>

      <section className="grupos">
        <h2>Tipos de emergencia</h2>
        <div className="grupos__rejilla">
          {GRUPOS.map((g) => (
            <article key={g.codigo} className="tarjeta-grupo" style={{ '--color': g.color }}>
              <div className="tarjeta-grupo__codigo">{g.codigo}</div>
              <h3>{g.nombre}</h3>
              <p>{g.ejemplos}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="pie">
        <Link to="/operador" className="boton-operador">
          Acceso radio operador
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </Link>
      </footer>
    </>
  )
}
