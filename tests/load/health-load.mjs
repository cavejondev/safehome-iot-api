const target = process.env.LOAD_TEST_URL ?? 'http://localhost:3333/api/v1/health';
const total = Number(process.env.LOAD_TEST_REQUESTS ?? 100);
const concurrency = Number(process.env.LOAD_TEST_CONCURRENCY ?? 10);

let nextRequest = 0;
const durations = [];
let successes = 0;
let failures = 0;

async function worker() {
  while (nextRequest < total) {
    nextRequest += 1;
    const startedAt = performance.now();

    try {
      const response = await fetch(target);
      durations.push(performance.now() - startedAt);
      if (response.ok) {
        successes++;
      } else {
        failures++;
      }
    } catch {
      durations.push(performance.now() - startedAt);
      failures++;
    }
  }
}

const startedAt = performance.now();
await Promise.all(Array.from({ length: concurrency }, () => worker()));
const elapsed = performance.now() - startedAt;
const average = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
const maximum = Math.max(...durations);

console.log(`URL: ${target}`);
console.log(`Requisicoes: ${total} | Concorrencia: ${concurrency}`);
console.log(`Sucessos: ${successes} | Falhas: ${failures}`);
console.log(`Tempo total: ${elapsed.toFixed(2)} ms`);
console.log(`Tempo medio: ${average.toFixed(2)} ms | Maior tempo: ${maximum.toFixed(2)} ms`);

if (failures > 0) {
  process.exitCode = 1;
}
