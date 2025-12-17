import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { Workflow } from './entities/workflow.entity';
import { AiService } from './ai.service'; // <--- Importamos o serviço de IA

@Module({
  imports: [TypeOrmModule.forFeature([Workflow])],
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService, 
    AiService // <--- Adicionamos ele aqui para poder usar
  ],
})
export class WorkflowsModule {}