import { Controller, Post, Get, Body } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';

@Controller('workflows')
export class WorkflowsController {
  
  // Injeta o Service atualizado
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  async criarWorkflow(@Body() corpoDaRequisicao: any) {
    // Agora ele chama o Service que tem a lógica dos 5 segundos
    return this.workflowsService.executeWorkflow(corpoDaRequisicao);
  }

  @Get()
  async listarWorkflows() {
    // Essa é a rota que estava faltando (por isso dava erro 404)
    return this.workflowsService.listarTodos();
  }
}