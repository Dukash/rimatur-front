# Arquitetura

Resumo da arquitetura do frontend:

- Framework: Next.js (App Router)
- Linguagem: TypeScript
- Estilos: Tailwind CSS (devDependency) e BootStrap 5 instalado como dependência
- Organização: rotas por pasta dentro de `app/` e componentes em `app/components/`.

Rotas e layout

- `app/layout.tsx` — layout principal (cabeçalho, rodapé, providers).
- `app/page.tsx` — página raiz.
- Pastas como `app/login/`, `app/register/`, `app/messages/` representam rotas.

Decisões de arquitetura

- Uso do App Router do Next.js para aproveitar layouts aninhados e rendering por rota.
- Separação clara entre componentes reutilizáveis (`app/components/`) e páginas.
- Estilos globais em `globals.css`.

Observações

- Se a aplicação consumir APIs externas, a documentação das integrações deve ser adicionada aqui (endpoints, formatos de resposta, autenticação).
