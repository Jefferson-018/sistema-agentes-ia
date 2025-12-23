import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, Bot, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SignedIn, SignedOut, SignIn, UserButton, useUser } from '@clerk/clerk-react';

interface Workflow {
  id: number;
  name: string;
  status: string;
  resultado: string;
}

export default function App() {
  const { user, isLoaded } = useUser();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [nome, setNome] = useState('');
  const [tarefas, setTarefas] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. CARREGAR DADOS (Agora filtrando pelo ID)
  const carregarDados = async () => {
    if (!user) return;
    try {
      // 🔥 MUDANÇA AQUI: Passamos ?userId=... na URL
      const response = await axios.get(`https://sistema-agentes-ia-3es4.onrender.com/workflows?userId=${user.id}`);
      setWorkflows(response.data); // O backend já ordena, não precisa .reverse()
    } catch (error) {
      console.error('Erro ao buscar:', error);
    }
  };

  useEffect(() => {
    if (user) {
      carregarDados();
      const intervalo = setInterval(carregarDados, 5000);
      return () => clearInterval(intervalo);
    }
  }, [user]);

  // 2. CRIAR AGENTE (Agora enviando o DONO)
  const criarAgente = async () => {
    if (!nome || !tarefas) return alert('Preencha tudo!');
    setLoading(true);
    try {
      await axios.post('https://sistema-agentes-ia-3es4.onrender.com/workflows', {
        name: nome,
        steps: [tarefas],
        userId: user?.id // 🔥 MUDANÇA AQUI: Enviamos o ID do dono
      });
      setNome('');
      setTarefas('');
      await carregarDados();
    } catch (error) {
      alert('Erro ao criar');
    } finally {
      setLoading(false);
    }
  };

  const excluir = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      await axios.delete(`https://sistema-agentes-ia-3es4.onrender.com/workflows/${id}`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-purple-500" size={50}/>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              Nexus AI
            </h1>
            <p className="text-slate-400">Sistema de Inteligência Artificial Autônomo</p>
          </div>
          <SignIn />
        </div>
      </SignedOut>

      <SignedIn>
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex justify-between items-center border-b border-slate-700 pb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Nexus AI Dashboard
                </h1>
                <p className="text-slate-400 mt-1">
                   Olá, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <button onClick={carregarDados} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-all border border-slate-700">
                  <RefreshCw size={20} className="text-slate-300 hover:text-white hover:rotate-180 transition-transform duration-500" />
                </button>
                <UserButton afterSignOutUrl="/" />
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Total de Agentes" value={workflows.length} icon={<Bot size={24} className="text-blue-400"/>} />
              <StatCard title="Processando" value={workflows.filter(w => w.status === 'PENDENTE').length} icon={<Loader2 size={24} className="text-yellow-400 animate-spin"/>} />
              <StatCard title="Concluídos" value={workflows.filter(w => w.status === 'CONCLUÍDO').length} icon={<CheckCircle size={24} className="text-green-400"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 shadow-xl sticky top-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-purple-400" /> Novo Agente
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Nome do Projeto</label>
                      <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Analista Financeiro" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Missão (Prompt)</label>
                      <textarea value={tarefas} onChange={e => setTarefas(e.target.value)} placeholder="O que o agente deve fazer?" rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all resize-none text-white" />
                    </div>
                    <button onClick={criarAgente} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium p-3 rounded-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-900/20">
                      {loading ? <Loader2 className="animate-spin" /> : 'Disparar Agente IA'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Bot size={20} className="text-blue-400" /> Histórico de Execuções
                </h2>

                {workflows.length === 0 && (
                  <div className="text-center p-12 text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
                    <Bot size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Nenhum agente criado ainda.</p>
                  </div>
                )}

                {workflows.map(item => (
                  <div key={item.id} className="group bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all shadow-lg hover:shadow-xl relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.status === 'CONCLUÍDO' ? 'bg-green-500' : item.status === 'ERRO' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                    <div className="flex justify-between items-start mb-3 pl-3">
                      <div>
                        <h3 className="font-bold text-lg text-white">{item.name}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-flex items-center gap-1 ${item.status === 'CONCLUÍDO' ? 'bg-green-500/20 text-green-300' : item.status === 'ERRO' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                          {item.status === 'CONCLUÍDO' && <CheckCircle size={12}/>} {item.status === 'ERRO' && <AlertCircle size={12}/>} {item.status === 'PENDENTE' && <Loader2 size={12} className="animate-spin"/>} {item.status}
                        </span>
                      </div>
                      <button onClick={() => excluir(item.id)} className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-slate-700/50 transition-colors opacity-0 group-hover:opacity-100" title="Excluir"><Trash2 size={18} /></button>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4 text-slate-300 text-sm border border-slate-700/50 pl-3 ml-1">
                      {item.status === 'PENDENTE' ? <div className="flex items-center gap-2 text-yellow-500/80 animate-pulse"><Bot size={16} /> Processando...</div> : <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{item.resultado}</ReactMarkdown></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: any }) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center justify-between hover:border-slate-600 transition-colors">
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className="bg-slate-700/50 p-3 rounded-lg ring-1 ring-slate-600">{icon}</div>
    </div>
  )
}