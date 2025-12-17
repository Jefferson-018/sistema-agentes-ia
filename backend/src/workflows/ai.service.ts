import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (apiKey && !apiKey.includes('***')) {
      this.openai = new OpenAI({ apiKey });
      console.log('[AI Service] Conectado com OpenAI!');
    } else {
      console.warn('[AI Service] Sem chave de API detectada. Usando modo Simulação.');
    }
  }

  async gerarConteudo(prompt: string): Promise<string> {
    // 1. Se tiver OpenAI configurada, usa ela
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini', // Modelo rápido e barato
          messages: [
            { role: 'system', content: 'Você é um agente especialista executando uma tarefa.' },
            { role: 'user', content: prompt }
          ],
        });
        return response.choices[0].message.content || 'Sem resposta da IA.';
      } catch (error) {
        console.error('[AI Service] Erro na OpenAI:', error);
        return 'Erro ao processar na OpenAI. Verifique os logs.';
      }
    }

    // 2. Se não tiver chave, simula uma resposta inteligente
    await new Promise(r => setTimeout(r, 3000)); // Delay dramático
    return `[SIMULAÇÃO] Eu analisei o pedido "${prompt}" e processei com sucesso. (Configure a OPENAI_API_KEY no .env para resultados reais)`;
  }
}