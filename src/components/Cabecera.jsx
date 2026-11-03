import { Link } from 'react-router-dom'

export default function Cabecera() {
  return (
    <header className="cabecera">
      <Link to="/" className="cabecera__logo">
        <img src="/logo_bomberos.png" alt="" />
        <span>Línea 119 · Bomberos Cali</span>
      </Link>
    </header>
  )
}
