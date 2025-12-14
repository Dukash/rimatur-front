
# Componentes

Este arquivo documenta componentes reutilizáveis, padrões de UI e sugestões de extração para facilitar manutenção e apresentação.

Os componentes ficam principalmente em `app/components/`, mas há várias peças implementadas inline nas páginas (veja Observações).

---

## Componentes documentados

- **Navbar** — `app/components/navbar.tsx`
  - Propósito: navegação global e ações de sessão (login/logout).
  - Tipo: componente cliente.
  - Comportamento: lê `localStorage` (`token`, `userName`, `userId`, `userRole`) para decidir quais links exibir; `handleLogout()` limpa o armazenamento e redireciona para `/login`.
  - Uso:

```tsx
import Navbar from '@/app/components/navbar';

export default function Page() {
  return (
    <div>
      <Navbar />
      {/* corpo da página */}
    </div>
  );
}
```

- **CheckStatusIcon (inline)** — definido em `app/messages/page.tsx`
  - Propósito: indicador compacto de status de mensagem (entregue / lido).
  - Props: `{ msg: Message, isOwn: boolean }` — quando `isOwn` é verdadeiro, mostra ✓✓ em cinza ou azul.
  - Observação: atualmente local à página de mensagens; considerar extrair para `app/components/MessageStatus.tsx`.

---

## Padrões de UI implementados inline (sugestões de extração)

Estes trechos estão implementados diretamente nas páginas e se beneficiariam de serem extraídos:

- **LoginForm** (`app/login/page.tsx`) — formulário de email/senha, validação e chamada de login. Props sugeridas: `onSuccess?: (data)=>void`.
- **RegisterForm** (`app/register/page.tsx`) — inputs de registro e validações.
- **MessageComposer** (`app/messages/page.tsx`) — seleção de destinatário, assunto, corpo e envio; props sugeridas: `onSend(subject, body, receiverId)`.
- **MessageList** / **MessageItem** (`app/messages/page.tsx`) — pré-visualização de mensagens e ação de abrir conversa; props: `messages: Message[]`, `onSelectConversation(userId)`.
- **SearchBar** — campo de busca com `onSearch(query)`.

Extrair esses componentes facilita testes, documentação e criação de capturas de tela para slides.

---

## Como documentar um novo componente

Ao adicionar um componente neste documento, inclua:

1. **Nome & caminho**: local do arquivo.
2. **Propósito**: frase curta explicando a função.
3. **Tipo**: Cliente / Server / UI pura.
4. **Props**: lista de props e tipos (tabela ou snippet TypeScript).
5. **Exemplo de uso**: snippet mínimo mostrando import e uso.
6. **Screenshot (opcional)**: adicione um PNG em `docs/assets/components/` com legenda curta.

---

## Espaços reservados e próximos passos

- Pasta criada: `docs/assets/components/` para capturas de tela e imagens (adicione imagens nomeadas pelos componentes, ex.: `Navbar.png`).
- Próxima sugestão: extrair `MessageItem` para `app/components/`, adicionar um screenshot em `docs/assets/components/` e documentar o componente aqui.

