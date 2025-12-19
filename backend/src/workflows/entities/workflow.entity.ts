import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Workflow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('simple-json') // SQLite e Postgres aceitam simple-json para listas
  steps: string[];

  @Column({ default: 'PENDENTE' })
  status: string;

  @Column({ type: 'text', nullable: true })
  resultado: string;

  // --- AQUI ESTAVA O ERRO ---
  // O Postgres prefere 'timestamp' em vez de 'datetime'
  @CreateDateColumn({ type: 'timestamp' }) 
  dataCriacao: Date;
}