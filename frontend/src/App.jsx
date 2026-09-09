import HomePage from './pages/HomePage'
import KitchenPage from './pages/KitchenPage'
import { useState } from 'react'

function App() {
  const [usuario, setUsuario] = useState(null)

  if (usuario?.tipo === 'cozinha') {
    return <KitchenPage usuario={usuario} onLogout={() => setUsuario(null)} />
  }

  return <HomePage onLogin={setUsuario} />
}

export default App
