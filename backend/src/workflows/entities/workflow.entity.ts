import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Workflow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('simple-json', { nullable: true })
  steps: string[];

  @Column({ default: 'PENDENTE' })
  status: string;

  @Column({ type: 'text', nullable: true })
  resultado: string;

  // 👇 NOVA COLUNA: AQUI VAI FICAR O BATE-PAPO 👇
  @Column('simple-json', { nullable: true })
  messages: any[];

  @CreateDateColumn({ type: 'timestamp' }) 
  dataCriacao: Date;

  @Column({ nullable: true }) 
  userId: string;
}