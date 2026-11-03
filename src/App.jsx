import { Routes, Route, Link } from 'react-router-dom'
import { ReportesProvider } from './ReportesContext.jsx'
import Landing from './pages/Landing.jsx'
import Reportar from './pages/Reportar.jsx'
import Operador from './pages/Operador.jsx'

export default function App() {
  return (
    <ReportesProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/reportar" element={<Reportar />} />
        <Route path="/operador" element={<Operador />} />
        <Route path="*" element={<p style={{ padding: 24 }}>Página no encontrada. <Link to="/">Volver</Link></p>} />
      </Routes>
    </ReportesProvider>
  )
}
