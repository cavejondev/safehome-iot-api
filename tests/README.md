# Testes e validacao da SafeHome API

## Testes automaticos

Execute lint, testes e build com um unico comando:

```bash
npm run check
```

## Teste de carga simplificado

Com a API ligada, execute:

```bash
npm run test:load
```

Por padrao, o script envia 100 requisicoes ao endpoint `/api/v1/health`, com
concorrencia de 10 requisicoes, e apresenta sucessos, falhas e tempos medidos.

O plano e os resultados estao em
[`PLANO_E_RESULTADOS.md`](./PLANO_E_RESULTADOS.md).
