import HomePage from './pages/HomePage'
import KitchenPage from './pages/KitchenPage'
import PedidosPage from './pages/PedidosPage'
import { useState } from 'react'

function App() {
  const [usuario, setUsuario] = useState(null)

  if (usuario?.tipo === 'cozinha') {
    return <KitchenPage usuario={usuario} onLogout={() => setUsuario(null)} />
  }

  if( usuario?.tipo === 'cliente') {
    return <PedidosPage usuario={usuario} onLogout={() => setUsuario(null)} />
  }
  return <HomePage onLogin={setUsuario} />
}

export default App
