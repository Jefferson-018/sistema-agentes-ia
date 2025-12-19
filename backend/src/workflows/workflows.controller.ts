import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  create(@Body() createWorkflowDto: any) {
    // Agora chama o 'create' corretamente (antes era executeWorkflow)
    return this.workflowsService.create(createWorkflowDto);
  }

  @Get()
  findAll() {
    // Agora chama o 'findAll' corretamente (antes era listarTodos)
    return this.workflowsService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(+id);
  }
}