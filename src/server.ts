/**
 * Bootstrap do servidor HTTP.
 * Ele valida a conexao com o banco, inicia o scheduler e registra encerramento seguro.
 */
import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './database/prisma';
import { monitoringScheduler } from './modules/monitoring/monitoring.scheduler';

async function bootstrap(): Promise<void> {
  await prisma.$connect();

  if (env.MONITORING_ENABLED) {
    monitoringScheduler.start();
  }

  app.listen(env.PORT, () => {
    logger.info(`SafeHome API rodando na porta ${env.PORT}`);
  });
}

void bootstrap().catch(async (error) => {
  logger.error({ error }, 'Falha ao iniciar o servidor');
  await prisma.$disconnect();
  process.exit(1);
});

async function shutdown(signal: string): Promise<void> {
  logger.info(`Recebido sinal ${signal}. Encerrando aplicacao...`);
  monitoringScheduler.stop();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
