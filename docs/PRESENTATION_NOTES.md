# Notas para apresentação

Mantenha a apresentação curta e focada na demo. Use estes pontos como roteiro.

- **Tecnologias:** Next.js 16 (App Router), React 19, TypeScript, Bootstrap 5
- **Principais pontos para demonstrar:**
  - Fluxo de login (`/login`) e armazenamento do token no `localStorage`
  - Listagem e criação de mensagens (`/messages`)
  - Estrutura do projeto: `app/`, `app/components/`, `docs/`
- **Slide rápido de arquitetura:** Browser → Next.js → API → DB (veja `docs/ARCHITECTURE.md`)
- **Dicas rápidas:**
  - Mantenha a demo curta (2–5 minutos): login → criar mensagem → navegar para rotinas
  - Mencione a variável de ambiente `NEXT_PUBLIC_API_BASE` e o comando `npm run dev`

## Estrutura sugerida para apresentação (5–8 slides)

1. Título e contexto — objetivo do projeto e problema que resolve.
2. Arquitetura e stack.
3. Principais rotas e fluxos (login, registro, mensagens).
4. Componentes reutilizáveis e padrões de UI.
5. Como rodar localmente (comandos).
6. Próximos passos e melhorias.
7. Perguntas.

## Dicas práticas

- Tenha links diretos para as páginas em `docs/` durante a apresentação.
- Prepare capturas de tela das telas principais.
- Se possível, faça um pequeno demo ao vivo com `npm run dev`.
