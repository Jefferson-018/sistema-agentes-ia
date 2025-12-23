import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, Bot, CheckCircle, AlertCircle, Loader2, RefreshCw, Copy, Check, Sparkles, Send } from 'lucide-react';
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
  
  // --- NOVIDADE: Estado para guardar o texto do chat de cada card ---
  const [chatInputs, setChatInputs] = useState<{ [key: number]: string }>({});
  
  const [copiadoId, setCopiadoId] = useState<number | null>(null);

  const carregarDados = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`https://sistema-agentes-ia-3es4.onrender.com/workflows?userId=${user.id}`);
      setWorkflows(response.data);
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

  const criarAgente = async () => {
    if (!nome || !tarefas) return alert('Preencha tudo!');
    setLoading(true);
    try {
      await axios.post('https://sistema-agentes-ia-3es4.onrender.com/workflows', {
        name: nome,
        steps: [tarefas],
        userId: user?.id
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

  // --- NOVIDADE: Função que manda a mensagem pro Backend ---
  const enviarResposta = async (id: number) => {
    const mensagem = chatInputs[id];
    if (!mensagem) return;

    try {
      // 1. Limpa o campo de texto visualmente
      setChatInputs(prev => ({ ...prev, [id]: '' }));
      
      // 2. Faz o card parecer que está carregando na hora (Feedback instantâneo)
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: 'PENDENTE' } : w));

      // 3. Manda para a Rota de Chat que criamos no Backend
      await axios.post(`https://sistema-agentes-ia-3es4.onrender.com/workflows/${id}/chat`, {
        message: mensagem
      });

      // 4. Recarrega os dados (O backend vai processar e atualizar o texto)
      await carregarDados();
    } catch (error) {
      alert('Erro ao enviar mensagem');
      carregarDados(); // Volta ao normal se der erro
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

  const copiarTexto = (texto: string, id: number) => {
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  if (!isLoaded) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-purple-500" size={50}/>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="mb-8 text-center animate-in fade-in zoom-in duration-700">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-500/10 p-4 rounded-full ring-1 ring-purple-500/30">
                <Sparkles size={40} className="text-purple-400" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Nexus AI
            </h1>
            <p className="text-slate-400 text-lg">Seu exército pessoal de agentes inteligentes.</p>
          </div>
          <SignIn />
        </div>
      </SignedOut>

      <SignedIn>
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* CABEÇALHO */}
            <header className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
                  <Bot className="text-purple-400"/> Nexus AI Dashboard
                </h1>
                <p className="text-slate-400 mt-1 text-sm">
                   Comandante: <span className="text-slate-200 font-medium">{user?.firstName || user?.emailAddresses[0]?.emailAddress}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={carregarDados}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-lg transition-all border border-slate-800 hover:border-slate-600 group"
                  title="Atualizar Lista"
                >
                  <RefreshCw size={20} className="text-slate-400 group-hover:text-white group-hover:rotate-180 transition-transform duration-700" />
                </button>
                <UserButton afterSignOutUrl="/" />
              </div>
            </header>

            {/* ESTATÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Total de Agentes" value={workflows.length} icon={<Bot size={24} className="text-blue-400"/>} color="blue" />
              <StatCard title="Processando" value={workflows.filter(w => w.status === 'PENDENTE').length} icon={<Loader2 size={24} className="text-yellow-400 animate-spin"/>} color="yellow" />
              <StatCard title="Concluídos" value={workflows.filter(w => w.status === 'CONCLUÍDO').length} icon={<CheckCircle size={24} className="text-green-400"/>} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* FORMULÁRIO */}
              <div className="lg:col-span-1">
                <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl sticky top-8">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                    <Plus size={20} className="text-purple-400" /> Novo Agente
                  </h2>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Nome do Projeto</label>
                      <input
                        type="text"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        placeholder="Ex: Resumidor de Notícias"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:outline-none transition-all text-white placeholder:text-slate-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Missão (Prompt)</label>
                      <textarea
                        value={tarefas}
                        onChange={e => setTarefas(e.target.value)}
                        placeholder="Descreva o que a IA deve fazer..."
                        rows={5}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:outline-none transition-all resize-none text-white placeholder:text-slate-600"
                      />
                    </div>

                    <button
                      onClick={criarAgente}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold p-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Iniciar Agente</>}
                    </button>
                  </div>
                </div>
              </div>

              {/* LISTA DE AGENTES */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                  <Bot size={20} className="text-blue-400" /> Meus Agentes
                </h2>

                {workflows.length === 0 && (
                  <div className="text-center py-20 px-6 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                    <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot size={32} className="text-slate-600" />
                    </div>
                    <p className="text-lg font-medium text-slate-400">Nenhum agente ativo</p>
                    <p className="text-sm mt-1">Crie seu primeiro agente inteligente no painel ao lado.</p>
                  </div>
                )}

                {workflows.map(item => (
                  <div key={item.id} className="group bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all shadow-lg hover:shadow-xl relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      item.status === 'CONCLUÍDO' ? 'bg-green-500' : 
                      item.status === 'ERRO' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>

                    <div className="flex justify-between items-start mb-4 pl-3">
                      <div>
                        <h3 className="font-bold text-xl text-white tracking-tight">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                           <span className={`text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1.5 uppercase tracking-wider ${
                            item.status === 'CONCLUÍDO' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                            item.status === 'ERRO' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {item.status === 'CONCLUÍDO' && <CheckCircle size={10}/>}
                            {item.status === 'ERRO' && <AlertCircle size={10}/>}
                            {item.status === 'PENDENTE' && <Loader2 size={10} className="animate-spin"/>}
                            {item.status}
                          </span>
                          <span className="text-[10px] text-slate-600 bg-slate-800/50 px-2 py-1 rounded-full font-mono">ID: #{item.id}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => excluir(item.id)}
                        className="text-slate-600 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Excluir Agente"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="bg-slate-950 rounded-xl p-5 text-slate-300 text-sm border border-slate-800/60 pl-4 ml-1 relative group/code">
                      {item.status === 'PENDENTE' ? (
                        <div className="flex items-center gap-3 text-yellow-500/80 py-4 justify-center">
                          <Loader2 size={20} className="animate-spin" />
                          <span className="animate-pulse font-medium">Processando com Inteligência Artificial...</span>
                        </div>
                      ) : (
                        <>
                          {item.resultado && (
                            <button
                              onClick={() => copiarTexto(item.resultado, item.id)}
                              className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all opacity-0 group-hover/code:opacity-100 border border-slate-700 shadow-lg"
                              title="Copiar Resposta"
                            >
                              {copiadoId === item.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                            </button>
                          )}
                          <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                             <ReactMarkdown>{item.resultado}</ReactMarkdown>
                          </div>
                        </>
                      )}
                    </div>

                    {/* --- NOVIDADE: ÁREA DE CHAT --- */}
                    {/* Só aparece se o agente já terminou a tarefa anterior */}
                    {item.status === 'CONCLUÍDO' && (
                      <div className="mt-4 pl-1 flex gap-2 animate-in slide-in-from-top-2">
                        <input
                          type="text"
                          value={chatInputs[item.id] || ''}
                          onChange={(e) => setChatInputs(prev => ({...prev, [item.id]: e.target.value}))}
                          onKeyDown={(e) => { if (e.key === 'Enter') enviarResposta(item.id); }}
                          placeholder="Fale com este agente... (Ex: 'Melhore o resumo' ou 'Me explique melhor')"
                          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-500"
                        />
                        <button
                          onClick={() => enviarResposta(item.id)}
                          disabled={!chatInputs[item.id]}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/20"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    )}

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

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: any, color: string }) {
  const colorClasses: any = {
    blue: "group-hover:border-blue-500/30",
    yellow: "group-hover:border-yellow-500/30",
    green: "group-hover:border-green-500/30"
  };

  return (
    <div className={`group bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between transition-all ${colorClasses[color]}`}>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <div className="bg-slate-950 p-4 rounded-xl ring-1 ring-slate-800 group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
  )
}