import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity() // Isso diz: "Crie uma tabela para essa classe"
export class Workflow {
  @PrimaryGeneratedColumn('uuid') // Gera IDs únicos (ex: a1b2-c3d4...)
  id: string;

  @Column()
  nome: string;

  @Column()
  status: string; // PENDENTE, CONCLUÍDO

  @Column('simple-array', { nullable: true })
  steps: string[]; // Salva a lista ["Agente A", "Agente B"]

  @Column({ nullable: true })
  resultado: string; // O texto final da IA

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  dataCriacao: Date;
}