import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Workflow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // MUDANÇA AQUI: Adicionamos { nullable: true } para não travar com dados antigos
  @Column('simple-json', { nullable: true }) 
  steps: string[];

  @Column({ default: 'PENDENTE' })
  status: string;

  @Column({ type: 'text', nullable: true })
  resultado: string;

  @CreateDateColumn({ type: 'timestamp' }) 
  dataCriacao: Date;

  @Column({ nullable: true }) 
  userId: string;
}