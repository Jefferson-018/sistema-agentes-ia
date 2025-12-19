import { useState } from 'react';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Lock, Mail, Loader2, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true); // Alternar entre Login e Cadastro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Tentar Logar
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Tentar Criar Conta
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      // Mensagens de erro amigáveis
      if (err.code === 'auth/invalid-credential') setError('E-mail ou senha incorretos.');
      else if (err.code === 'auth/email-already-in-use') setError('Este e-mail já está cadastrado.');
      else if (err.code === 'auth/weak-password') setError('A senha deve ter pelo menos 6 caracteres.');
      else setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md">
        
        {/* Cabeçalho do Card */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Nexus AI
          </h1>
          <p className="text-slate-400">
            {isLogin ? 'Bem-vindo de volta, Chefe.' : 'Comece a criar seus agentes.'}
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Campo Email */}
          <div className="space-y-1">
            <label className="text-sm text-slate-400 ml-1">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="space-y-1">
            <label className="text-sm text-slate-400 ml-1">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Botão de Ação */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2 shadow-lg shadow-purple-900/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isLogin ? 'Entrar no Sistema' : 'Criar Nova Conta'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Rodapé (Trocar entre Login/Cadastro) */}
        <div className="mt-6 text-center pt-6 border-t border-slate-700">
          <p className="text-slate-400 text-sm mb-3">
            {isLogin ? 'Ainda não tem acesso?' : 'Já possui conta?'}
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center justify-center gap-2 w-full transition-colors"
          >
            {isLogin ? (
              <><UserPlus size={16} /> Criar conta gratuita</>
            ) : (
              <><LogIn size={16} /> Voltar para login</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}