🗄️ docs/DATABASE.md
Visão Geral

# Banco de Dados (referência para o frontend)

Este documento é uma referência compacta que o frontend usa para entender as entidades do backend e os campos esperados.

> Observação: o esquema canônico vive nas migrations do backend. Mantenha este documento apenas como alinhamento rápido para o frontend.

## Tabelas (visão rápida)

### user

| Campo | Tipo | Restrições | Descrição |
|---|---:|---|---|
| id | integer | PK | Identificador primário do usuário |
| name | text |  | Nome exibido |
| email | text | unique | Email de login |
| password | text |  | Senha (hash, apenas no backend) |
| role | user_role_enum | default `user` | `admin` ou `user` |

### message

| Campo | Tipo | Restrições | Descrição |
|---|---:|---|---|
| id | integer | PK | Identificador da mensagem |
| text | text |  | Conteúdo da mensagem |
| user_id | integer | FK -> user(id) | Usuário autor |
| created_at | timestamp |  | Data de criação |

### routine_activities

| Campo | Tipo | Restrições | Descrição |
|---|---:|---|---|
| id | integer | PK | Identificador da relação |
| routine_id | integer | FK -> routines(id) | Rotina pai |
| activity_id | integer | FK -> activities(id) | Referência à atividade |
| order | integer |  | Posição dentro da rotina |

## Enumerações

- `user_role_enum`: `admin`, `user`

## Observações para o frontend

- O frontend espera os formatos `user` e `message` ao renderizar listas e detalhes.
- Respostas de autenticação costumam incluir `token` e `userId` (veja o fluxo de login em `app/login/page.tsx`).
- Se os nomes de campos do backend mudarem, atualize os adaptadores de API e este documento.


Campo	Tipo	Descrição
id	integer (PK)	Identificador único
subject	varchar	Assunto da mensagem
body	text	Conteúdo da mensagem
isRead	boolean	Status de leitura
sender_id	integer (FK)	Usuário remetente
receiver_id	integer (FK)	Usuário destinatário
createdAt	timestamp	Data de criação
updatedAt	timestamp	Última atualização
routine_activities

Armazena atividades/rotinas associadas a um usuário.

Campo	Tipo	Descrição
id	integer (PK)	Identificador único
title	varchar	Título da atividade
description	varchar	Descrição opcional
category	varchar	Categoria
visibility	varchar	Visibilidade da atividade
status	varchar	Status
startTime	timestamp	Início da atividade
endTime	timestamp	Fim da atividade
userId	integer (FK)	Usuário dono
createdByName	varchar	Nome do criador
createdAt	timestamp	Data de criação
migrations

Tabela gerenciada automaticamente pelo TypeORM para controle de migrations.

Campo	Tipo	Descrição
id	integer (PK)	Identificador
timestamp	bigint	Timestamp da migration
name	varchar	Nome da migration
Relacionamentos

user 1:N message (sender_id)

user 1:N message (receiver_id)

user 1:N routine_activities

Todos os relacionamentos são aplicados via Foreign Keys no banco de dados.

Observações Técnicas

Todas as tabelas utilizam id auto incremental via SEQUENCE.

Datas utilizam timestamp without time zone.

Senhas são armazenadas apenas como hash.

Não há dados sensíveis versionados no repositório.