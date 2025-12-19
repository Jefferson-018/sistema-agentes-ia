import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkflowsModule } from './workflows/workflows.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workflow } from './workflows/entities/workflow.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }), 
    
    WorkflowsModule,

    // --- CONEXÃO COM O NEON (POSTGRESQL) ---
    TypeOrmModule.forRoot({
      type: 'postgres', // Mudamos de 'sqlite' para 'postgres'
      url: 'postgresql://neondb_owner:npg_XiVTZ6JzK5aR@ep-falling-fire-a4zgk00p-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require', // Sua Chave do Neon
      entities: [Workflow],
      synchronize: true, // Cria as tabelas automaticamente na nuvem
      ssl: { rejectUnauthorized: false }, // Obrigatório para aceitar a conexão segura do Neon
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}