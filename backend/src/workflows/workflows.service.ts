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

    // Salva o status inicial no banco
    const salvo = await this.workflowsRepository.save(workflow) as any;
    
    // Chama a função que processa (em segundo plano)
    this.processarComHttpBruto(salvo.id, createWorkflowDto.steps);
    
    return salvo;
  }

  // 2. O CÉREBRO (IA - Versão Blindada)
  async processarComHttpBruto(id: number, tarefas: string[]) {
    const apiKey = process.env.GEMINI_API_KEY;

    // Se não tiver chave, nem tenta conectar
    if (!apiKey) {
        console.error("❌ ERRO: Chave GEMINI_API_KEY não configurada no Render!");
        return this.gravarErro(id, "Erro de Configuração: Chave de API ausente.");
    }

    // 🔥 MODELO ÚNICO E DEFINITIVO (O mais rápido e estável)
    const modelo = "gemini-1.5-flash"; 

    const prompt = `Você é um assistente executivo focado e eficiente.
    Tarefas: ${tarefas.join('. ')}.
    
    Instrução: Responda em Português do Brasil. Use Markdown (negrito, listas) para formatar bem a resposta.`;

    try {
        console.log(`🚀 Iniciando processamento com ${modelo}...`);
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await response.json();

        // Se o Google reclamar, pegamos o erro aqui
        if (data.error) {
          throw new Error(`Erro da API do Google: ${data.error.message}`);
        }

        const textoFinal = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textoFinal) {
             throw new Error("A IA respondeu, mas o texto veio vazio.");
        }

        // SUCESSO! Salva no banco
        await this.workflowsRepository.update(id, {
          status: 'CONCLUÍDO',
          resultado: textoFinal,
        });
        
        console.log(`✅ SUCESSO TOTAL! Agente ${id} finalizado.`);

    } catch (erro: any) {
        console.error(`❌ ERRO FATAL no Agente ${id}:`, erro.message);
        await this.gravarErro(id, erro.message);
    }
  }

  // Grava o erro no banco para aparecer no Frontend
  private async gravarErro(id: number, erro: string) {
    await this.workflowsRepository.update(id, {
        status: 'ERRO',
        resultado: `Ops! Algo deu errado: ${erro}`,
      });
  }

  // 3. LISTA TODOS OS PROJETOS
  findAll() {
    return this.workflowsRepository.find();
  }

  // 4. EXCLUI (Necessário para o botão de lixeira funcionar)
  async remove(id: number) {
    if (!id || isNaN(id)) return; 
    await this.workflowsRepository.delete(id);
  }

  // Métodos auxiliares necessários para o Controller
  findOne(id: number) {
    return this.workflowsRepository.findOneBy({ id });
  }

  update(id: number, updateDto: any) {
    return this.workflowsRepository.update(id, updateDto);
  }
}