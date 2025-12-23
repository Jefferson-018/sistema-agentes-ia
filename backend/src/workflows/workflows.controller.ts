import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  create(@Body() createWorkflowDto: CreateWorkflowDto) {
    return this.workflowsService.create(createWorkflowDto);
  }

  // 👇 NOVA ROTA: O CHAT 👇
  @Post(':id/chat')
  async chat(@Param('id') id: string, @Body() body: { message: string }) {
    // 1. Pega o agente atual
    const workflow = await this.workflowsService.findOne(+id);
    
    // 2. Muda status para processando para aparecer o loading no front
    await this.workflowsService.update(+id, { status: 'PENDENTE' });
    
    // 3. Manda a nova mensagem para a IA processar (com histórico)
    // O service vai rodar em segundo plano sem travar a resposta aqui
    this.workflowsService.processarComHttpBruto(+id, [body.message]);
    
    return { message: "Mensagem enviada para a IA!" };
  }

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.workflowsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto) {
    return this.workflowsService.update(+id, updateWorkflowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(+id);
  }
}