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

  // 1. CRIA O AGENTE
  async create(createWorkflowDto: any) {
    const workflow = this.workflowsRepository.create({
      ...createWorkflowDto, // userId vem aqui dentro
      status: 'PENDENTE',
      resultado: 'Iniciando processamento inteligente...',
      messages: [] // Começa com histórico vazio
    });

    const salvo = await this.workflowsRepository.save(workflow) as any;
    
    // Chama o processamento da IA
    this.processarComHttpBruto(salvo.id, createWorkflowDto.steps);
    
    return salvo;
  }

  // 2. O CÉREBRO (IA COM MEMÓRIA)
  async processarComHttpBruto(id: number, tarefas: string[]) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ ERRO: Chave GEMINI_API_KEY não encontrada!");
        return this.gravarErro(id, "Chave de API não configurada.");
    }

    // A. BUSCA O HISTÓRICO ATUAL NO BANCO
    const agente = await this.workflowsRepository.findOneBy({ id });
    if (!agente) return;

    // Se já tiver mensagens, usa elas. Se for null, cria array vazio.
    let historico = agente.messages || [];

    // B. ADICIONA A NOVA MENSAGEM DO USUÁRIO
    // O prompt inicial também vira uma mensagem de usuário
    historico.push({
        role: "user",
        parts: [{ text: tarefas.join('\n') }]
    });

    // --- FASE 1: AUTO-DETECÇÃO (Mantida igual) ---
    let modeloParaUsar = "gemini-1.5-flash"; 
    try {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listResp = await fetch(listUrl);
        const listData = await listResp.json();
        if (listData.models) {
            const modeloEncontrado = listData.models.find((m: any) => {
                const metodos = m.supportedGenerationMethods || [];
                const nome = m.name || "";
                return metodos.includes("generateContent") && 
                       (nome.includes("flash") || nome.includes("gemini-1.5") || nome.includes("gemini-pro"));
            });
            if (modeloEncontrado) modeloParaUsar = modeloEncontrado.name.replace("models/", "");
        }
    } catch (e) { console.log("⚠️ Erro na auto-detecção, usando padrão."); }

    // --- FASE 2: EXECUÇÃO (AGORA ENVIANDO O HISTÓRICO) ---
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modeloParaUsar}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // AQUI ESTÁ A MÁGICA: Enviamos todo o histórico, não só a última
          body: JSON.stringify({ contents: historico })
        });

        const data = await response.json();

        if (data.error) throw new Error(`Google recusou (${modeloParaUsar}): ${data.error.message}`);

        const textoFinal = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textoFinal) throw new Error("IA retornou resposta vazia.");

        // C. ADICIONA A RESPOSTA DA IA NO HISTÓRICO
        historico.push({
            role: "model",
            parts: [{ text: textoFinal }]
        });

        // D. SALVA TUDO NO BANCO (Resultado visível + Histórico oculto)
        await this.workflowsRepository.update(id, {
          status: 'CONCLUÍDO',
          resultado: textoFinal, // Mostra a última resposta na tela
          messages: historico    // Salva o chat completo para a próxima vez
        });

    } catch (erro: any) {
        console.error(`❌ ERRO NO AGENTE ${id}:`, erro.message);
        await this.gravarErro(id, erro.message);
    }
  }

  findAll(userId: string) {
    if (!userId) return [];
    return this.workflowsRepository.find({
        where: { userId: userId },
        order: { dataCriacao: 'DESC' }
    });
  }

  private async gravarErro(id: number, erro: string) {
    await this.workflowsRepository.update(id, {
        status: 'ERRO',
        resultado: `Ops! Erro ao processar: ${erro}`,
      });
  }
  
  async remove(id: number) {
    if (!id || isNaN(id)) return; 
    await this.workflowsRepository.delete(id);
  }

  findOne(id: number) { return this.workflowsRepository.findOneBy({ id }); }
  update(id: number, updateDto: any) { return this.workflowsRepository.update(id, updateDto); }
}