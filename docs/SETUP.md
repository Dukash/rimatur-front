# Configuração e execução

Passos rápidos para rodar o frontend localmente.

## Pré-requisitos

- Node.js 18+ e npm/yarn
- API backend em execução (ou um mock) — base padrão: `http://localhost:3001`

## Ambiente

Crie um arquivo `.env.local` na raiz do projeto (não comitar). Exemplo:

```
NEXT_PUBLIC_API_BASE=http://localhost:3001

# Opcional: personalizar portas
PORT=3000
```

## Instalar e executar

```
npm install
npm run dev
```

Build para produção:

```
npm run build
npm start
```

## Lint e formatação

```
npm run lint
npm run format
```

## Observações

- As rotas ficam em `app/` usando o App Router do Next.js. Veja [ROUTES.md](ROUTES.md).
- O frontend espera um endpoint de autenticação (login/registro). Veja `app/login/page.tsx` para o fluxo de exemplo.
# Setup e Execução

Este documento descreve como configurar e executar o frontend localmente.

Pré-requisitos

- Node.js (>= 18 recomendado)
- npm

Instalação

```bash
npm install
```

Modo Desenvolvimento

```bash
npm run dev
```

Build para produção

```bash
npm run build
npm run start
```

Lint e formatação

```bash
npm run lint
npm run format
```

Notas

- O projeto usa Next.js (App Router). As rotas estão dentro de `app/`.
