# SafeHome API

Backend em `Node.js + TypeScript + PostgreSQL` para o projeto **SafeHome**.
Ele foi estruturado para receber eventos do Arduino/gateway, persistir os dados de monitoramento e disponibilizar tudo para o app mobile via API REST.

## O que esta base entrega

- Autenticacao com JWT para familiares/responsaveis
- Cadastro de residencia monitorada
- Cadastro de gateway central, sensores de presenca e botoes de ajuda
- Ingestao de eventos IoT com token proprio do gateway
- Dashboard consolidado para o app mobile
- Historico de eventos
- Alertas de ajuda, falha de sensor, falha geral e inatividade
- Relatorios com limite por plano
- Scheduler de monitoramento periodico
- Prisma ORM com PostgreSQL

## Stack

- `Node.js`
- `TypeScript`
- `Express`
- `Prisma`
- `PostgreSQL`
- `Zod`
- `JWT`
- `Pino`
- `node-cron`

## Estrutura de pastas

```text
safehome/
  prisma/
  src/
    config/
    database/
    middlewares/
    modules/
      alerts/
      auth/
      dashboard/
      events/
      gateways/
      help-buttons/
      households/
      iot/
      monitoring/
      reports/
      sensors/
    routes/
    shared/
```

## Como subir localmente

### Opcao 1: PostgreSQL via Docker

1. Suba o PostgreSQL:

```bash
docker compose up -d
```

2. Crie o arquivo `.env` a partir do `.env.example`.

### Opcao 2: PostgreSQL ja instalado localmente

Se voce ja tiver o PostgreSQL rodando localmente, use uma `DATABASE_URL` parecida com esta:

```env
DATABASE_URL=postgresql://postgres:root@localhost:5432/safehome
```

Foi exatamente esse formato que usamos para validar a API neste ambiente.

### Passos da aplicacao

1. Crie o arquivo `.env` a partir do `.env.example`.

2. Instale as dependencias:

```bash
npm ci
```

3. Gere o client do Prisma e rode a migration inicial:

```bash
npm run prisma:generate
npx prisma migrate dev --name init
```

4. Opcionalmente popule dados de exemplo:

```bash
npm run db:seed
```

5. Rode a API:

```bash
npm run dev
```

### Comandos que funcionaram aqui

```bash
npm ci
npm run db:deploy
npm run db:seed
npm run start
```

Depois disso, a API respondeu em:

```text
GET http://localhost:3333/api/v1/health
```

## Fluxo sugerido de uso

1. O familiar cria conta em `/api/v1/auth/register`.
2. Faz login em `/api/v1/auth/login`.
3. Cria a residencia em `/api/v1/households`.
4. Cadastra a central/gateway em `/api/v1/households/:householdId/gateways`.
5. Guarda o `gatewayToken` retornado para configurar no Arduino.
6. Cadastra sensores e botoes com `externalId` iguais aos identificadores usados pelo firmware.
7. O gateway passa a enviar heartbeats, eventos de presenca e pedidos de ajuda.
8. O app consome dashboard, alertas, logs e relatorios.

## Endpoints principais

### Publicos

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/health`

### App mobile autenticado

- `GET /api/v1/households`
- `POST /api/v1/households`
- `GET /api/v1/households/:householdId/settings`
- `PATCH /api/v1/households/:householdId/settings`
- `GET /api/v1/households/:householdId/gateways`
- `POST /api/v1/households/:householdId/gateways`
- `POST /api/v1/households/gateways/:gatewayId/rotate-token`
- `GET /api/v1/households/:householdId/sensors`
- `POST /api/v1/households/:householdId/sensors`
- `PATCH /api/v1/households/sensors/:sensorId`
- `DELETE /api/v1/households/sensors/:sensorId`
- `GET /api/v1/households/:householdId/help-buttons`
- `POST /api/v1/households/:householdId/help-buttons`
- `PATCH /api/v1/households/help-buttons/:buttonId`
- `DELETE /api/v1/households/help-buttons/:buttonId`
- `GET /api/v1/households/:householdId/dashboard`
- `GET /api/v1/households/:householdId/events`
- `GET /api/v1/households/:householdId/reports/activity?days=7`
- `GET /api/v1/alerts/:householdId`
- `PATCH /api/v1/alerts/:alertId/acknowledge`
- `PATCH /api/v1/alerts/:alertId/resolve`

### Gateway / Arduino

Todos os endpoints abaixo exigem o header:

```text
x-gateway-token: TOKEN_GERADO_NO_CADASTRO_DO_GATEWAY
```

- `POST /api/v1/iot/heartbeats`
- `POST /api/v1/iot/presence-events`
- `POST /api/v1/iot/help-events`

## Exemplo de payload do heartbeat

```json
{
  "gatewaySeenAt": "2026-04-08T14:15:00.000Z",
  "sensors": [
    {
      "externalId": "pir-sala",
      "lastSeenAt": "2026-04-08T14:15:00.000Z"
    }
  ],
  "helpButtons": [
    {
      "externalId": "btn-quarto",
      "lastSeenAt": "2026-04-08T14:15:00.000Z"
    }
  ]
}
```

## Exemplo de evento de presenca

```json
{
  "sensorExternalId": "pir-sala",
  "detectedAt": "2026-04-08T14:18:00.000Z",
  "sourceEventId": "evt-0001",
  "metadata": {
    "signalStrength": -67
  }
}
```

## Exemplo de pedido de ajuda

```json
{
  "buttonExternalId": "btn-quarto",
  "triggeredAt": "2026-04-08T14:19:00.000Z",
  "sourceEventId": "help-0001"
}
```

## Seed demo

Ao rodar `npm run db:seed`, voce recebe:

- Login demo: `demo@safehome.local`
- Senha demo: `SafeHome@123`
- Gateway token demo: `SAFEHOME-DEMO-GATEWAY-TOKEN`

## Qualidade e seguranca

Execute a validacao completa antes de enviar alteracoes:

```bash
npm run check
```

Esse comando executa lint, testes e build. Para ambientes de producao, aplique
migrations com:

```bash
npm run db:deploy
```

O workflow em `.github/workflows/ci.yml` valida essas etapas e aplica todas as
migrations em um PostgreSQL vazio a cada push ou pull request.

## Licenca

O codigo deste projeto esta disponivel sob a licenca MIT. Consulte `LICENSE` e
`THIRD_PARTY_NOTICES.md` para os termos aplicaveis.
