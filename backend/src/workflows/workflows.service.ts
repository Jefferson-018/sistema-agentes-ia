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

    const salvo = await this.workflowsRepository.save(workflow) as any;
    
    // Chama o processamento
    this.processarComHttpBruto(salvo.id, createWorkflowDto.steps);
    
    return salvo;
  }

  // 2. O CÉREBRO (IA - COM AUTO-DETECÇÃO DE MODELO)
  async processarComHttpBruto(id: number, tarefas: string[]) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ ERRO: Chave GEMINI_API_KEY não encontrada!");
        return this.gravarErro(id, "Chave de API não configurada.");
    }

    // --- FASE 1: AUTO-DETECÇÃO (SHERLOCK HOLMES) ---
    // Em vez de chutar o nome, perguntamos pro Google o que tem disponível
    let modeloParaUsar = "gemini-1.5-flash"; // Chute inicial (caso a lista falhe)

    try {
        console.log("🕵️ Perguntando ao Google quais modelos estão disponíveis...");
        
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listResp = await fetch(listUrl);
        const listData = await listResp.json();

        if (listData.models) {
            // Procura na lista oficial do Google um modelo que gere texto
            // Prioridade: Flash > Pro > Qualquer outro Gemini
            const modeloEncontrado = listData.models.find((m: any) => {
                const metodos = m.supportedGenerationMethods || [];
                const nome = m.name || "";
                return metodos.includes("generateContent") && 
                       (nome.includes("flash") || nome.includes("gemini-1.5") || nome.includes("gemini-pro"));
            });

            if (modeloEncontrado) {
                // O Google devolve "models/gemini-1.5-flash", precisamos tirar o "models/"
                modeloParaUsar = modeloEncontrado.name.replace("models/", "");
                console.log(`🎯 MODELO DETECTADO E SELECIONADO: ${modeloParaUsar}`);
            } else {
                console.log("⚠️ Nenhum modelo específico encontrado. Usando padrão.");
            }
        }
    } catch (e) {
        console.log("⚠️ Erro na auto-detecção. Indo com o padrão.", e);
    }

    // --- FASE 2: EXECUÇÃO ---
    const prompt = `Você é um assistente executivo focado.
    Tarefas: ${tarefas.join('. ')}.
    Instrução: Responda em Português do Brasil. Use Markdown.`;

    try {
        console.log(`🚀 Disparando IA com modelo: ${modeloParaUsar}...`);
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modeloParaUsar}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(`Google recusou (${modeloParaUsar}): ${data.error.message}`);
        }

        const textoFinal = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!textoFinal) throw new Error("IA retornou resposta vazia.");

        // SUCESSO!
        await this.workflowsRepository.update(id, {
          status: 'CONCLUÍDO',
          resultado: textoFinal,
        });
        
        console.log(`✅ SUCESSO TOTAL! Agente ${id} finalizado.`);

    } catch (erro: any) {
        console.error(`❌ ERRO NO AGENTE ${id}:`, erro.message);
        await this.gravarErro(id, erro.message);
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