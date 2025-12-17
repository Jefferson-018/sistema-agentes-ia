import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './entities/workflow.entity';
import { AiService } from './ai.service'; // Importa a IA

@Injectable()
export class WorkflowsService {
  
  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    private aiService: AiService, // <--- Injetamos a IA aqui
  ) {}

  async executeWorkflow(dados: any) {
    const workflow = this.workflowRepository.create({
      nome: dados.nome || 'Workflow IA',
      status: 'PENDENTE',
      steps: dados.steps || [],
    });

    const salvo = await this.workflowRepository.save(workflow);
    console.log(`[Service] Workflow ${salvo.id} iniciado.`);

    // Chama o processamento em background
    this.processarFila(salvo.id);

    return {
      id: salvo.id,
      status: 'AGENDADO',
      mensagem: 'Agentes ativados e trabalhando!'
    };
  }

  async processarFila(id: string) {
    console.log(`[Background] IA está analisando o ID ${id}...`);

    // Busca os dados no banco
    const workflow = await this.workflowRepository.findOne({ where: { id } });
    if (!workflow) return;

    // --- A MÁGICA ACONTECE AQUI ---
    // Transforma os passos em um texto pro GPT
    const prompt = `Execute as seguintes tarefas em ordem: ${workflow.steps.join(', ')}`;
    
    // Pede para o AiService gerar a resposta
    const resultadoIA = await this.aiService.gerarConteudo(prompt);
    // ------------------------------

    // Atualiza o banco com a resposta da IA
    workflow.status = 'CONCLUÍDO';
    workflow.resultado = resultadoIA;
    
    await this.workflowRepository.save(workflow);
    console.log(`[Background] Sucesso! Resultado salvo no banco.`);
  }

  async listarTodos() {
    return this.workflowRepository.find({
      order: { dataCriacao: 'DESC' }
    });
  }
}