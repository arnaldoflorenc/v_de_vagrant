import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../services/api'
import './PedidosPage.css'

const cardapio = [
  'Pizza Marguerita',
  'Pizza Calabresa',
  'Pizza Portuguesa',
  'Guaraná',
  'Coca-Cola',
  'Água Mineral',
]

function formatDate(dateValue) {
  if (!dateValue) return 'Data não informada'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return String(dateValue)

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}


function montarContent(quantidades) {
  return Object.entries(quantidades)
    .filter(([, qtd]) => qtd > 0)
    .map(([prato, qtd]) => `${qtd}x ${prato}`)
    .join(', ')
}

function PedidosPage({ usuario, onLogout }) {
  const [pedidos, setPedidos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [quantidades, setQuantidades] = useState(
    Object.fromEntries(cardapio.map((item) => [item, 0]))
  )

  const fetchPedidos = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await apiFetch('/cozinha/pedidos')
      setPedidos(Array.isArray(response) ? response : [])
    } catch (err) {
      setError('Erro ao buscar pedidos: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPedidos()
  }, [fetchPedidos])

  const handleQuantidadeChange = (prato, delta) => {
    setQuantidades((prev) => ({
      ...prev,
      [prato]: Math.max(0, prev[prato] + delta),
    }))
  }

  const handleCriarPedido = async (e) => {
    e.preventDefault()

    const content = montarContent(quantidades)
    if (!content) {
      setError('Selecione ao menos um item.')
      return
    }

    setIsSubmitting(true)
    setError('')

    const agora = new Date()
    const data_pedido = agora.toISOString().slice(0, 19).replace('T', ' ')
    const hora_pedido = agora.toTimeString().slice(0, 8)

    try {
      const response = await apiFetch('/cozinha/pedidos', {
        method: 'POST',
        body: JSON.stringify({
          id_usuario: usuario.id,
          data_pedido,
          hora_pedido,
          content,
        }),
      })

      setPedidos((prevPedidos) => [
        { id: response.id, content, value: 'pendente', data_pedido, hora_pedido },
        ...prevPedidos,
      ])
      setQuantidades(Object.fromEntries(cardapio.map((item) => [item, 0])))
    } catch (err) {
      setError('Erro ao enviar pedido: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAtualizarStatus = async (id, novoValue) => {
    setUpdatingId(id)
    setError('')

    try {
      await apiFetch('/cozinha/pedidos', {
        method: 'PUT',
        body: JSON.stringify({ id, value: novoValue }),
      })
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) =>
          pedido.id === id ? { ...pedido, value: novoValue } : pedido
        )
      )
    } catch (err) {
      setError('Erro ao atualizar pedido: ' + err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="pedidos-page">
      <header className="pedidos-header">
        <h1>Pedidos</h1>
        {usuario && <span>Olá, {usuario.nome}</span>}
        {onLogout && <button onClick={onLogout}>Sair</button>}
      </header>

      <form className="novo-pedido-form" onSubmit={handleCriarPedido}>
        <ul className="cardapio-lista">
          {cardapio.map((prato) => (
            <li key={prato} className="cardapio-item">
              <span>{prato}</span>
              <div className="quantidade-controle">
                <button
                  type="button"
                  onClick={() => handleQuantidadeChange(prato, -1)}
                  disabled={quantidades[prato] === 0}
                >
                  -
                </button>
                <span>{quantidades[prato]}</span>
                <button type="button" onClick={() => handleQuantidadeChange(prato, 1)}>
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar para a cozinha'}
        </button>
      </form>

      {error && <p className="pedidos-error">{error}</p>}

      {isLoading ? (
        <p>Carregando pedidos...</p>
      ) : (
        <ul className="pedidos-lista">
          {pedidos.map((pedido) => (
            <li key={pedido.id} className="pedido-item">
              <strong>{pedido.content}</strong>
              <span className="pedido-data">{formatDate(pedido.data_pedido)}</span>
              <span className={`status status-${pedido.value.replace(' ', '-')}`}>
                {pedido.value}
              </span>
              <select
                value={pedido.value}
                disabled={updatingId === pedido.id}
                onChange={(e) => handleAtualizarStatus(pedido.id, e.target.value)}
              >
                <option value="pendente">Pendente</option>
                <option value="em produção">Em produção</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PedidosPage