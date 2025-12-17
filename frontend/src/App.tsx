import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Estados para armazenar os dados do formulário
  const [nome, setNome] = useState('')
  const [tarefas, setTarefas] = useState('')
  
  // Estados do sistema
  const [status, setStatus] = useState('Sistema pronto.')
  const [workflows, setWorkflows] = useState<any[]>([])

  // Busca os dados assim que a tela abre (Automático)
  useEffect(() => {
    buscarDados()
  }, [])

  async function buscarDados() {
    try {
      const resposta = await fetch('http://localhost:3000/workflows')
      const dados = await resposta.json()
      // Inverte a ordem para o mais recente aparecer primeiro
      setWorkflows(dados.reverse()) 
    } catch (erro) {
      setStatus('Erro ao carregar dados.')
    }
  }

  async function criarWorkflow(e: React.FormEvent) {
    e.preventDefault() // Não deixa a página recarregar sozinha
    setStatus('Enviando pedido para a IA...')

    try {
      // 1. Prepara os dados (transforma o texto em lista)
      const stepsArray = tarefas.split(',').map(item => item.trim())

      // 2. Envia para o Backend (POST)
      const resposta = await fetch('http://localhost:3000/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome,
          steps: stepsArray
        })
      })

      if (resposta.ok) {
        setStatus('✅ Workflow criado com sucesso!')
        setNome('')
        setTarefas('')
        buscarDados() // Atualiza a lista na hora
      } else {
        setStatus('❌ Erro ao criar.')
      }
    } catch (erro) {
      console.error(erro)
      setStatus('Erro de conexão.')
    }
  }

  return (
    <div className="container">
      <header>
        <h1>🤖 Central de Comando</h1>
        <p className="status-bar">Status: {status}</p>
      </header>
      
      {/* ÁREA DE CRIAÇÃO (NOVO) */}
      <section className="card form-section">
        <h2>Novo Pedido</h2>
        <form onSubmit={criarWorkflow}>
          <input 
            type="text" 
            placeholder="Nome do Projeto (ex: Resumo Diário)" 
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
          />
          
          <textarea 
            placeholder="Digite as tarefas separadas por vírgula (ex: Ler email, Resumir texto, Traduzir)" 
            value={tarefas}
            onChange={e => setTarefas(e.target.value)}
            required
          />
          
          <button type="submit">🚀 Disparar Agente</button>
        </form>
      </section>

      <hr />

      {/* LISTA DE RESULTADOS */}
      <main>
        <h2>Histórico de Execuções</h2>
        <button onClick={buscarDados} className="btn-refresh">🔄 Atualizar Lista</button>
        
        {workflows.map(item => (
          <div key={item.id} className="card result-card">
            <div className="card-header">
              <h3>{item.nome}</h3>
              <span className={`badge ${item.status}`}>{item.status}</span>
            </div>
            <p><strong>Tarefas:</strong> {item.steps.join(' → ')}</p>
            <div className="box-resultado">
              <strong>Resultado da IA:</strong>
              <p>{item.resultado || 'Processando...'}</p>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}

export default App