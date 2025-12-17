import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Importa o módulo de config
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowsModule } from './workflows/workflows.module';
import { Workflow } from './workflows/entities/workflow.entity';

@Module({
  imports: [
    // 1. Carrega o .env (Segurança em primeiro lugar)
    ConfigModule.forRoot({
      isGlobal: true, // Disponível no projeto todo
    }),
    
    // 2. Banco de Dados
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Workflow],
      synchronize: true,
    }),
    
    WorkflowsModule,
  ],
})
export class AppModule {}