/**
 * Scheduler que dispara o ciclo de monitoramento em intervalos configuraveis.
 */
import cron, { type ScheduledTask } from 'node-cron';

import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { monitoringService } from './monitoring.service';

class MonitoringScheduler {
  private task?: ScheduledTask;

  public start(): void {
    if (this.task) {
      return;
    }

    this.task = cron.schedule(env.MONITORING_CRON, async () => {
      logger.info('Executando ciclo de monitoramento automatico');
      await monitoringService.runCycle();
    });
  }

  public stop(): void {
    this.task?.stop();
    this.task = undefined;
  }
}

export const monitoringScheduler = new MonitoringScheduler();
