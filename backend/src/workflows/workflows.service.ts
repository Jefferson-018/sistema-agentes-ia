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

    // Salva o status inicial no banco
    const salvo = await this.workflowsRepository.save(workflow) as any;
    
    // Chama a função que processa (em segundo plano)
    this.processarComHttpBruto(salvo.id, createWorkflowDto.steps);
    
    return salvo;
  }

  // 2. O CÉREBRO (Conecta com o Google)
  async processarComHttpBruto(id: number, tarefas: string[]) {
    const apiKey = 'AIzaSyBKf0fsDpO27VOKhr-Q_sKCm2V9tgUyOkM'; // Sua chave de API

    // Lista de modelos poderosos que sua conta tem acesso
    const modelosParaTentar = [
      "gemini-2.5-flash",        // O mais novo e rápido
      "gemini-2.0-flash",        // Versão 2.0 estável
      "gemini-exp-1206",         // Experimental
      "gemini-1.5-flash"         // Clássico (backup)
    ];

    let sucesso = false;
    let ultimoErro = "";

    const prompt = `Você é um assistente executivo altamente eficiente.
    Tarefas solicitadas: ${tarefas.join('. ')}.
    
    Instrução: Responda de forma direta, profissional e estruturada em Português do Brasil.`;

    // Loop de Tentativas (Se um falhar, tenta o próximo)
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

        const textoFinal = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem texto na resposta.';
        
        // Atualiza o banco com o Sucesso
        await this.workflowsRepository.update(id, {
          status: 'CONCLUÍDO',
          resultado: textoFinal,
        });
        
        sucesso = true;
        console.log(`✅ SUCESSO ABSOLUTO com ${modelo}!`);

      } catch (erro: any) {
        console.error(`❌ Falha no ${modelo}:`, erro.message);
        ultimoErro = erro.message;
      }
    }

    // Se ninguém funcionou
    if (!sucesso) {
      await this.workflowsRepository.update(id, {
        status: 'ERRO',
        resultado: `Falha ao processar. Último erro: ${ultimoErro}`,
      });
    }
  }

  // 3. LISTA TODOS OS PROJETOS
  findAll() {
    return this.workflowsRepository.find();
  }

  // 4. EXCLUI (COM PROTEÇÃO ANTI-ERRO)
  async remove(id: number) {
    // Blindagem: Se o ID for inválido (NaN), ignora e não quebra o servidor
    if (!id || isNaN(id)) {
      console.log('Tentativa de excluir ID inválido ignorada.');
      return; 
    }
    
    await this.workflowsRepository.delete(id);
  }
}