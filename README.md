# Controle de Parcelamentos

Sistema interno do escritório com três frentes:

- **CRM de vendas** (`/crm`) — funil de vendas do lead até virar cliente.
- **Gestor de tarefas** (`/tarefas` e a aba "Implantação" de cada empresa) —
  checklist de implantação do cliente (contrato, cadastro no Asaas, Domínio e
  Sieg), tanto para quem está abrindo CNPJ quanto para quem está migrando de
  outra contabilidade.
- **Parcelamentos** — controle de parcelamentos federais, estaduais e
  municipais de todas as empresas atendidas: cadastro de empresas,
  parcelamentos, geração automática das parcelas, controle de pagamentos,
  painel com alertas de vencimento/atraso e exportação de relatórios em CSV.

Feito em Next.js (App Router) + TypeScript + Prisma (SQLite) + Tailwind CSS.

## Configuração inicial

```bash
npm install
cp .env.example .env
# edite o .env e gere um SESSION_SECRET novo com: openssl rand -base64 32

npx prisma migrate deploy   # cria o banco de dados (dev.db) e as tabelas
npm run db:seed             # cria o primeiro usuário de acesso
```

O seed cria o usuário `admin@escritorio.com` / senha `admin123` (ou os valores
definidos em `SEED_ADMIN_*` no `.env`). **Troque a senha assim que possível** —
ainda não há tela de troca de senha pela interface; para trocar, gere um novo
hash com bcrypt e atualize o campo `passwordHash` do usuário no banco.

## Rodando localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura

- `Lead` — contato em prospecção, com estágio no funil (novo lead, contato
  realizado, proposta enviada, contrato enviado, ganho ou perdido) e um
  histórico de interações (`LeadInteracao`). Ao marcar o lead como "Ganho", é
  possível convertê-lo em cliente (`Empresa`), o que já monta o checklist de
  implantação automaticamente.
- `Empresa` — clientes do escritório. Guarda a origem (`ABERTURA_CNPJ` ou
  `MIGRACAO_CONTABILIDADE`) e a data de conversão em cliente.
- `TarefaOnboarding` — cada item do checklist de implantação de uma empresa
  (contrato, cadastro no Asaas/Domínio/Sieg, abertura de CNPJ ou migração da
  contabilidade anterior, etc.), com status, categoria e prazo. Os modelos
  padrão de checklist ficam em `src/lib/onboarding-templates.ts`.
- `Parcelamento` — um parcelamento (federal/estadual/municipal) de uma empresa,
  com órgão, número, valor total e número de parcelas. Ao criar, as parcelas
  mensais são geradas automaticamente.
- `Parcela` — cada parcela do parcelamento, com vencimento, valor, status
  (pendente/paga) e dados do pagamento.

O painel (`/dashboard`) mostra totais por empresa e por esfera, leads em aberto
no funil, tarefas de implantação em aberto/atrasadas, além de alertas de
parcelas atrasadas e vencendo nos próximos 15 dias. Em `/relatorios` é
possível exportar as parcelas filtradas em CSV (compatível com Excel).

## Comandos úteis

```bash
npm run build        # build de produção
npm run start         # roda o build de produção
npm run lint           # eslint
npx prisma studio      # explorar o banco de dados visualmente
npx prisma migrate dev # criar uma nova migration após alterar o schema
```
