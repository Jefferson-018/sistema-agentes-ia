# 🤖 Sistema de Orquestração de Agentes de IA

Plataforma Fullstack para gerenciamento e execução de fluxos de trabalho (workflows) alimentados por Inteligência Artificial. O sistema permite criar tarefas, processá-las em segundo plano e monitorar o status em tempo real através de um dashboard interativo.

## 🏗️ Arquitetura (Monorepo)
Este projeto está organizado em uma estrutura unificada:

- 📂 **frontend/**: Interface do usuário (Dashboard) construída com **React**, **TypeScript** e **Vite**. Foca em performance e experiência do usuário (UX).
- 📂 **backend/**: API Robusta construída com **NestJS**, **TypeORM (SQLite)** e Filas para processamento assíncrono de tarefas pesadas.

## 🚀 Tecnologias
- **Frontend:** React, Vite, CSS Modules.
- **Backend:** NestJS (Node.js), SQLite, TypeORM.
- **Integração:** Comunicação via API REST.
- **IA:** Estrutura preparada para integração com OpenAI/GPT.

## ✨ Funcionalidades
- [x] **Dashboard Interativo:** Criação e monitoramento de pedidos via interface gráfica.
- [x] **Processamento Assíncrono:** O backend aceita o pedido e libera o usuário imediatamente (Status: PENDENTE -> CONCLUÍDO).
- [x] **Persistência de Dados:** Histórico completo salvo em banco SQL local.
- [x] **Comunicação Fullstack:** Integração completa entre cliente (Porta 5173) e servidor (Porta 3000) com CORS configurado.

## 🛠️ Como rodar o projeto

### 1. Backend (Motor)
```bash
cd backend
npm install
npm run start:dev
# Roda na porta 3000

Desenvolvido por Jefferson-018


### Onde salvar esse arquivo?

1.  No VS Code, clique na pasta "Mãe" (`projeto-agentes` ou o nome que você deu).
2.  Clique no ícone de "Novo Arquivo" e crie o arquivo **`README.md`**.
3.  Cole esse texto acima e salve.
4.  Faça o commit e o push (`git add .`, `git commit -m "docs: readme principal"`, `git push`).

Assim quem entrar no seu GitHub vai ver de cara que é um projeto grande e organizado! Ficou claro como salvar?