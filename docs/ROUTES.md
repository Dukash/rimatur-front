# Rotas & Fluxos

Este arquivo descreve as rotas principais da aplicação e o que demonstrar durante uma demo.

| Rota | Arquivo | Propósito |
|---|---|---|
| / | `app/page.tsx` | Redireciona para `/login` (ponto de entrada da demo) |
| /login | `app/login/page.tsx` | Formulário de login; salva `token` e `userId` no `localStorage` |
| /register | `app/register/page.tsx` | Formulário de registro (apenas para demo) |
| /messages | `app/messages/page.tsx` | Listagem de mensagens e fluxo de criação |
| /rotinas | `app/rotinas/page.tsx` | Listagem e gerenciamento de rotinas (específico do projeto) |

Exemplo de fluxo para demonstração:
- Comece em `/login` → autentique → verifique `token` em `localStorage`
- Vá para `/messages` → mostre mensagens e crie uma para ilustrar chamadas à API

Se adicionar rotas, siga a estrutura do App Router em `app/` e mantenha componentes em `app/components/`.
# Rotas e Páginas

Páginas e rotas principais encontradas:

- `/` — `app/page.tsx` (home)
- `/login` — `app/login/page.tsx`
- `/register` — `app/register/page.tsx`
- `/messages` — `app/messages/page.tsx`

Observações

- Cada pasta dentro de `app/` representa uma rota. Verificar arquivos `layout.tsx` locais para layouts aninhados.
- Adicionar documentação de rotas protegidas (autenticação) e comportamento esperado (redirects, guards) se aplicável.
