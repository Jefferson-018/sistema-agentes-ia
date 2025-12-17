# 🤖 Backend de Agentes Inteligentes

Plataforma de orquestração de fluxos de trabalho (workflows) alimentada por IA. Este projeto gerencia requisições de usuários, persiste dados e executa tarefas complexas em segundo plano de forma assíncrona.

## 🚀 Tecnologias Utilizadas
- **NestJS:** Framework progressivo para Node.js (Arquitetura Modular).
- **TypeORM + SQLite:** Persistência de dados leve e eficiente.
- **Background Jobs:** Processamento de filas assíncronas (Non-blocking API).
- **OpenAI Integration:** Estrutura pronta para conexão com GPT-4o.

## ✨ Funcionalidades
- [x] Criação de Workflows via API REST.
- [x] Processamento em background (o usuário não fica travado esperando).
- [x] Banco de dados persistente (SQLite).
- [x] Simulação inteligente de IA (Mock) e suporte a chaves reais via `.env`.

## 🛠️ Como rodar
1. Clone o repositório.
2. Rode `npm install`.
3. Configure o `.env` (opcional para IA real).
4. Execute `npm run start:dev`.