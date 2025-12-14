# Rimatur — Frontend

Uma interface web simples para o sistema Rimatur, construída com Next.js (App Router) e TypeScript.

**Principais tecnologias:** Next.js 16 · React 19 · TypeScript · Bootstrap 5 · Tailwind (dev)

---

## Índice

- [Visão geral](#visão-geral)
- [Principais comandos](#principais-comandos)
- [Rodando localmente](#rodando-localmente)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Rotas principais](#rotas-principais)
- [Dicas de desenvolvimento](#dicas-de-desenvolvimento)
- [Documentação](#documentação)
- [Contato](#contato)

---

## Visão geral

Frontend do sistema de mensagens Rimatur. Foco em páginas simples: login, registro e mensagens.

## Principais comandos

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # start em produção
npm run lint     # lint
npm run format   # formatação com Prettier
```

## Rodando localmente

1. Instale dependências:

```bash
npm install
```

2. Rode em modo desenvolvimento:

```bash
npm run dev
```

Abra http://localhost:3000 no navegador.

## Estrutura do projeto (resumo)

- `app/` — App Router: `layout.tsx`, `page.tsx`, rotas em pastas (`login/`, `register/`, `messages/`, `rotinas/`).
- `app/components/` — componentes reutilizáveis (ex.: `navbar.tsx`).
- `public/` — recursos estáticos (imagens, logos).

## Rotas principais

- `/` — redireciona para `/login` — Arquivo: [app/page.tsx](app/page.tsx#L1)
- `/login` — página de login — Arquivo: [app/login/page.tsx](app/login/page.tsx#L1)
- `/register` — página de criação de conta — Arquivo: [app/register/page.tsx](app/register/page.tsx#L1)
- `/messages` — lista de mensagens (comentários e detalhes em rotas filhas, ex.: `/messages/[id]`) — Arquivo: [app/messages/page.tsx](app/messages/page.tsx#L1)
- `/rotinas` — lista e gerenciamento de rotinas — Arquivo: [app/rotinas/page.tsx](app/rotinas/page.tsx#L1)

## Dicas de desenvolvimento

- Estilos globais em `globals.css` e estilos customizados em `app/layout.tsx`.
- O projeto usa Bootstrap (via import) e pode incluir Tailwind durante o desenvolvimento.
- Para adicionar um novo componente, coloque em `app/components/` e documente em `docs/COMPONENTS.md`.

## Documentação

Documentação adicional e notas para apresentação estão em `docs/`:

- [SETUP.md](docs/SETUP.md)
- [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [COMPONENTS.md](docs/COMPONENTS.md)
- [ROUTES.md](docs/ROUTES.md)
- [PRESENTATION_NOTES.md](docs/PRESENTATION_NOTES.md)

---

Última atualização: Dezembro 2025
