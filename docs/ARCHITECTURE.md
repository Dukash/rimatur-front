📐 Arquitetura

**Visão Geral**

- **Frontend:** Next.js (App Router)
- **Backend:** NestJS (REST API)
- **Banco de dados:** PostgreSQL

Comunicação via HTTP/JSON (REST). Autenticação por JWT.

**Backend (padrão de responsabilidades)**

- Controller → Service → Repository (TypeORM) → Database

**Frontend (Next.js)**

- App Router para rotas e UIs
- Componentes reutilizáveis em `app/components/`
- Chamadas ao backend via `NEXT_PUBLIC_API_BASE`

Mantenha este documento curto: detalhes e migrações estão no repositório do backend.