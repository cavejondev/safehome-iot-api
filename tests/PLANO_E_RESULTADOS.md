# Plano e resultados de testes - SafeHome API

## Identificacao

| Campo           | Preenchimento           |
| --------------- | ----------------------- |
| Versao avaliada | 1.0.1                   |
| Responsavel     | Gabriel Rodrigo Cavejon |
| Data            | 11/06/2026              |

## Testes automaticos

Execute:

```bash
npm run check
```

| ID    | Verificacao      | Resultado esperado                                    | Resultado obtido                      | Status |
| ----- | ---------------- | ----------------------------------------------------- | ------------------------------------- | ------ |
| TA-01 | Lint             | Codigo sem erros de padrao                            | ESLint concluido sem erros            | OK     |
| TA-02 | Testes Vitest    | Todos os testes aprovados                             | 4 de 4 testes aprovados               | OK     |
| TA-03 | Build TypeScript | Projeto compilado sem erros                           | Build concluido sem erros             | OK     |
| TA-04 | Health check     | `/api/v1/health` responde status 200 e versao correta | Status 200 e versao 1.0.1 confirmados | OK     |

## Teste de carga simplificado

Ligue a API e execute:

```bash
npm run test:load
```

| Campo                     | Resultado            |
| ------------------------- | -------------------- |
| Endpoint                  | `GET /api/v1/health` |
| Quantidade de requisicoes | 100                  |
| Concorrencia              | 10                   |
| Sucessos                  | 100                  |
| Falhas                    | 0                    |
| Tempo medio               | 6,47 ms              |
| Maior tempo               | 54,81 ms             |
| Resultado                 | APROVADO             |

## Confirmacao manual rapida

| ID    | Acao                                | Resultado esperado                     | Resultado obtido                        | Status |
| ----- | ----------------------------------- | -------------------------------------- | --------------------------------------- | ------ |
| TM-01 | Abrir `/api/v1/health` no navegador | JSON com `status: ok` e versao `1.0.1` | Resposta confirmada durante a validacao | OK     |
| TM-02 | Abrir o aplicativo conectado a API  | Dados carregam sem erro de conexao     | Dados foram carregado                   | OK     |

## Resultado final

Validacoes automaticas e carga aprovadas; confirmacao
manual da integracao com o aplicativo aprovada.
