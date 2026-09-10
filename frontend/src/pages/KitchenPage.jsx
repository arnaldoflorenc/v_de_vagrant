import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../services/api'
import './KitchenPage.css'

const statusOptions = ['pendente', 'em produção', 'finalizado']

function formatDate(dateValue) {
  if (!dateValue) return 'Data não informada'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return String(dateValue)

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function KitchenPage({ usuario, onLogout }) {
  const [pedidos, setPedidos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const loadPedidos = useCallback(async () => {
    try {
      setError('')
      const query = new URLSearchParams({
        userId: String(usuario?.id || ''),
        tipo: String(usuario?.tipo || ''),
      }).toString()

      const data = await apiFetch(`/cozinha/pedidos?${query}`)
      setPedidos(Array.isArray(data) ? data : [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }, [usuario?.id, usuario?.tipo])

  useEffect(() => {
    loadPedidos()
    const refreshTimer = window.setInterval(loadPedidos, 30000)

    return () => window.clearInterval(refreshTimer)
  }, [loadPedidos])

  const updateStatus = async (pedido, value) => {
    setUpdatingId(pedido.id)

    try {
      await apiFetch('/cozinha/pedidos', {
        method: 'PUT',
        body: JSON.stringify({ id: pedido.id, value }),
      })
      setPedidos((currentPedidos) =>
        currentPedidos.map((currentPedido) =>
          currentPedido.id === pedido.id
            ? { ...currentPedido, value }
            : currentPedido,
        ),
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <main className="kitchen-page">
      <header className="kitchen-header">
        <div>
          <span className="kitchen-eyebrow">Painel operacional</span>
          <h1>Pedidos da cozinha</h1>
          <p>Olá, {usuario.nome}. Acompanhe os pedidos recebidos em tempo real.</p>
        </div>
        <div className="kitchen-actions">
          <button type="button" className="refresh-button" onClick={loadPedidos}>
            Atualizar
          </button>
          <button type="button" className="logout-button" onClick={onLogout}>
            Sair
          </button>
        </div>
      </header>

      <section className="kitchen-summary" aria-label="Resumo dos pedidos">
        <span>{pedidos.length} pedido{pedidos.length === 1 ? '' : 's'}</span>
        <span className="live-indicator">Atualização automática</span>
      </section>

      {error && <div className="kitchen-error">{error}</div>}

      {isLoading ? (
        <div className="empty-kitchen">Carregando pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div className="empty-kitchen">
          <strong>Nenhum pedido por enquanto</strong>
          <span>Os novos pedidos aparecerão aqui.</span>
        </div>
      ) : (
        <section className="ticket-grid" aria-label="Lista de pedidos">
          {pedidos.map((pedido) => (
            <article className="order-ticket" key={pedido.id}>
              <div className="ticket-topline">
                <span className="ticket-label">Pedido</span>
                <strong>#{pedido.id}</strong>
              </div>
              <div className="ticket-content">
                <span className="ticket-label">Conteúdo</span>
                <p>{pedido.content}</p>
              </div>
              <div className="ticket-meta">
                <div>
                  <span className="ticket-label">Data e hora</span>
                  <time dateTime={pedido.data_pedido}>{formatDate(pedido.data_pedido)}</time>
                </div>
                <label className="ticket-status">
                  <span className="ticket-label">Status</span>
                  <select
                    value={pedido.value}
                    disabled={updatingId === pedido.id}
                    onChange={(event) => updateStatus(pedido, event.target.value)}
                  >
                    {statusOptions.map((status) => (
                      <option value={status} key={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default KitchenPage
