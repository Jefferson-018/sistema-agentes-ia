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
      ...createWorkflowDto,
      status: 'PENDENTE',
      resultado: 'Iniciando processamento inteligente...',
    });

    // Salva o status inicial
    const salvo = await this.workflowsRepository.save(workflow) as any;
    
    // Chama o processamento em segundo plano
    this.processarComHttpBruto(salvo.id, createWorkflowDto.steps);
    
    return salvo;
  }

  // 2. O CÉREBRO (IA - MODO ROBUSTO COM LOOP)
  async processarComHttpBruto(id: number, tarefas: string[]) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ ERRO: Chave GEMINI_API_KEY não encontrada!");
        return this.gravarErro(id, "Chave de API não configurada.");
    }

    // 🔥 LISTA DE ELITE: Tenta todos esses nomes até um funcionar
    const modelosParaTentar = [
      "gemini-1.5-flash-latest", // Versão mais recente forçada
      "gemini-1.5-flash",        // Nome padrão
      "gemini-1.5-flash-001",    // Versão específica
      "gemini-1.5-pro-latest"    // Backup mais inteligente
    ];

    let sucesso = false;
    let ultimoErro = "";

    const prompt = `Você é um assistente executivo focado e eficiente.
    Tarefas: ${tarefas.join('. ')}.
    
    Instrução: Responda em Português do Brasil. Use Markdown (negrito, listas) para formatar bem a resposta.`;

    // Loop de Tentativas
    for (const modelo of modelosParaTentar) {
      if (sucesso) break; // Se já funcionou, para de tentar

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
          throw new Error(`Google recusou ${modelo}: ${data.error.message}`);
        }

        const textoFinal = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textoFinal) throw new Error("IA retornou texto vazio.");

        // SUCESSO!
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

    // Se depois de tentar os 4 nomes ainda der erro
    if (!sucesso) {
      await this.gravarErro(id, `Todas as tentativas falharam. Último erro: ${ultimoErro}`);
    }
  }

  private async gravarErro(id: number, erro: string) {
    await this.workflowsRepository.update(id, {
        status: 'ERRO',
        resultado: `Ops! Erro ao processar: ${erro}`,
      });
  }

  findAll() { return this.workflowsRepository.find(); }
  
  async remove(id: number) {
    if (!id || isNaN(id)) return; 
    await this.workflowsRepository.delete(id);
  }

  findOne(id: number) { return this.workflowsRepository.findOneBy({ id }); }
  update(id: number, updateDto: any) { return this.workflowsRepository.update(id, updateDto); }
}