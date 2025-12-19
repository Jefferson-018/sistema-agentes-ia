import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './entities/workflow.entity';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow)
    private workflowsRepository: Repository<Workflow>,
  ) {}

  // 1. CRIA O AGENTE E CHAMA A IA
  async create(createWorkflowDto: any) {
    const workflow = this.workflowsRepository.create({
      ...createWorkflowDto,
      status: 'PENDENTE',
      resultado: 'Iniciando processamento inteligente...',
    });

    // --- A CORREÇÃO ESTÁ AQUI 👇 ---
    // Adicionamos 'as any' para garantir que o TypeScript entenda que é um objeto único
    const salvo = await this.workflowsRepository.save(workflow) as any;
    
    // Chama a função que processa (em segundo plano)
    this.processarComHttpBruto(salvo.id, createWorkflowDto.steps);
    
    return salvo;
  }

  // 2. O CÉREBRO (Conexão Direta e Robusta)
  async processarComHttpBruto(id: number, tarefas: string[]) {
    // 🔒 Pega a chave do ambiente (Render)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ ERRO: Chave GEMINI_API_KEY não encontrada!");
        return this.gravarErro(id, "Chave de API não configurada.");
    }

    // Lista de modelos para tentar (do mais novo ao mais clássico)
    const modelosParaTentar = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro"
    ];

    let sucesso = false;
    let ultimoErro = "";

    const prompt = `Você é um assistente executivo altamente eficiente.
    Tarefas solicitadas: ${tarefas.join('. ')}.
    
    Instrução: Responda de forma direta, profissional e estruturada em Português do Brasil. Use Markdown para formatar.`;

    // Loop de Tentativas
    for (const modelo of modelosParaTentar) {
      if (sucesso) break;

      try {
        console.log(`🚀 Tentando modelo: ${modelo}...`);
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        const textoFinal = data.candidates?.[0]?.content?.parts?.[0]?.text || 'IA não retornou texto.';
        
        // Atualiza o banco com o Sucesso
        await this.workflowsRepository.update(id, {
          status: 'CONCLUÍDO',
          resultado: textoFinal,
        });
        
        sucesso = true;
        console.log(`✅ SUCESSO com ${modelo}!`);

      } catch (erro: any) {
        console.error(`❌ Falha no ${modelo}:`, erro.message);
        ultimoErro = erro.message;
      }
    }

    // Se ninguém funcionou
    if (!sucesso) {
      await this.gravarErro(id, ultimoErro);
    }
  }

  // Auxiliar para gravar erro
  private async gravarErro(id: number, erro: string) {
    await this.workflowsRepository.update(id, {
        status: 'ERRO',
        resultado: `Falha ao processar. Motivo: ${erro}`,
      });
  }

  // 3. LISTA TODOS
  findAll() {
    return this.workflowsRepository.find();
  }

  // 4. EXCLUI
  async remove(id: number) {
    if (!id || isNaN(id)) return; 
    await this.workflowsRepository.delete(id);
  }
}