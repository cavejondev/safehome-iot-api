/**
 * Regras de monitoramento automatico do SafeHome.
 * Ele abre e resolve alertas com base em heartbeat, atividade e botoes de ajuda.
 */
import {
  AlertSeverity,
  AlertStatus,
  AlertSubjectType,
  AlertType,
  type Prisma
} from '@prisma/client';

import { env } from '../../config/env';
import { prisma } from '../../database/prisma';
import { getDeviceStatus } from '../../shared/utils/device-status';
import { diffInMinutes, isCurrentTimeInsideWindow } from '../../shared/utils/time';

interface AlertCreationInput {
  householdId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  subjectType?: AlertSubjectType;
  subjectId?: string;
  metadata?: Prisma.InputJsonValue;
  deduplicate?: boolean;
}

export class MonitoringService {
  public async runCycle(): Promise<void> {
    const households = await prisma.household.findMany({
      include: {
        settings: true,
        gateways: {
          where: {
            isActive: true
          }
        },
        sensors: {
          where: {
            isActive: true
          }
        },
        helpButtons: {
          where: {
            isActive: true
          }
        }
      }
    });

    for (const household of households) {
      const sensorInterval =
        household.settings?.sensorCheckIntervalMinutes ?? env.DEFAULT_SENSOR_CHECK_MINUTES;
      const buttonInterval =
        household.settings?.buttonCheckIntervalMinutes ?? env.DEFAULT_BUTTON_CHECK_MINUTES;
      const inactivityThreshold =
        household.settings?.inactivityThresholdMinutes ?? env.DEFAULT_INACTIVITY_THRESHOLD_MINUTES;
      const quietHoursActive =
        household.settings?.quietHoursEnabled &&
        isCurrentTimeInsideWindow(household.settings.sleepModeStart, household.settings.sleepModeEnd);

      for (const sensor of household.sensors) {
        const status = getDeviceStatus(sensor.isActive, sensor.lastSeenAt, sensorInterval);

        if (status === 'offline') {
          await this.openAlertIfNeeded({
            householdId: household.id,
            type: AlertType.SENSOR_OFFLINE,
            severity: AlertSeverity.HIGH,
            title: `Sensor offline: ${sensor.name}`,
            description: `O sensor ${sensor.name} nao envia sinal dentro da janela configurada.`,
            subjectType: AlertSubjectType.SENSOR,
            subjectId: sensor.id
          });
        } else {
          await this.resolveAlerts(household.id, AlertType.SENSOR_OFFLINE, sensor.id);
        }
      }

      for (const button of household.helpButtons) {
        const status = getDeviceStatus(button.isActive, button.lastSeenAt, buttonInterval);

        if (status === 'offline') {
          await this.openAlertIfNeeded({
            householdId: household.id,
            type: AlertType.BUTTON_OFFLINE,
            severity: AlertSeverity.HIGH,
            title: `Botao offline: ${button.name}`,
            description: `O botao ${button.name} nao responde dentro da janela configurada.`,
            subjectType: AlertSubjectType.HELP_BUTTON,
            subjectId: button.id
          });
        } else {
          await this.resolveAlerts(household.id, AlertType.BUTTON_OFFLINE, button.id);
        }
      }

      const lastActivityAt = household.sensors
        .map((sensor) => sensor.lastTriggeredAt)
        .filter((date): date is Date => Boolean(date))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      if (!quietHoursActive && lastActivityAt && diffInMinutes(lastActivityAt) > inactivityThreshold) {
        await this.openAlertIfNeeded({
          householdId: household.id,
          type: AlertType.INACTIVITY,
          severity: AlertSeverity.CRITICAL,
          title: 'Tempo de inatividade acima do limite',
          description: `Nao houve atividade detectada na residencia nos ultimos ${inactivityThreshold} minutos.`,
          subjectType: AlertSubjectType.HOUSEHOLD,
          subjectId: household.id
        });
      } else {
        await this.resolveAlerts(household.id, AlertType.INACTIVITY, household.id);
      }

      const activeComponentCount = household.sensors.length + household.helpButtons.length;
      const offlineSensorCount = household.sensors.filter(
        (sensor) => getDeviceStatus(sensor.isActive, sensor.lastSeenAt, sensorInterval) === 'offline'
      ).length;
      const offlineButtonCount = household.helpButtons.filter(
        (button) => getDeviceStatus(button.isActive, button.lastSeenAt, buttonInterval) === 'offline'
      ).length;
      const allGatewaysOffline =
        household.gateways.length > 0 &&
        household.gateways.every(
          (gateway) =>
            getDeviceStatus(gateway.isActive, gateway.lastSeenAt, sensorInterval) === 'offline'
        );

      if (
        activeComponentCount > 0 &&
        offlineSensorCount + offlineButtonCount === activeComponentCount &&
        allGatewaysOffline
      ) {
        await this.openAlertIfNeeded({
          householdId: household.id,
          type: AlertType.SYSTEM_FAILURE,
          severity: AlertSeverity.CRITICAL,
          title: 'Possivel falha geral do sistema',
          description:
            'Todos os dispositivos ativos deixaram de responder. Verifique energia, internet e a central.',
          subjectType: AlertSubjectType.HOUSEHOLD,
          subjectId: household.id
        });
      } else {
        await this.resolveAlerts(household.id, AlertType.SYSTEM_FAILURE, household.id);
      }
    }
  }

  public async createHelpRequestAlert(
    householdId: string,
    helpButtonId: string,
    helpButtonName: string
  ): Promise<void> {
    await prisma.alert.create({
      data: {
        householdId,
        type: AlertType.HELP_REQUEST,
        severity: AlertSeverity.CRITICAL,
        title: `Pedido de ajuda: ${helpButtonName}`,
        description: `O botao ${helpButtonName} foi acionado e requer atencao imediata.`,
        subjectType: AlertSubjectType.HELP_BUTTON,
        subjectId: helpButtonId
      }
    });
  }

  public async resolveSensorOfflineAlert(householdId: string, sensorId: string): Promise<void> {
    await this.resolveAlerts(householdId, AlertType.SENSOR_OFFLINE, sensorId);
  }

  public async resolveButtonOfflineAlert(householdId: string, buttonId: string): Promise<void> {
    await this.resolveAlerts(householdId, AlertType.BUTTON_OFFLINE, buttonId);
  }

  public async resolveSystemFailureAlert(householdId: string): Promise<void> {
    await this.resolveAlerts(householdId, AlertType.SYSTEM_FAILURE, householdId);
  }

  public async resolveInactivityAlert(householdId: string): Promise<void> {
    await this.resolveAlerts(householdId, AlertType.INACTIVITY, householdId);
  }

  private async openAlertIfNeeded(input: AlertCreationInput): Promise<void> {
    const shouldDeduplicate = input.deduplicate ?? true;

    if (shouldDeduplicate) {
      const existingAlert = await prisma.alert.findFirst({
        where: {
          householdId: input.householdId,
          type: input.type,
          subjectId: input.subjectId,
          status: {
            in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED]
          }
        }
      });

      if (existingAlert) {
        return;
      }
    }

    await prisma.alert.create({
      data: {
        householdId: input.householdId,
        type: input.type,
        severity: input.severity,
        title: input.title,
        description: input.description,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        metadata: input.metadata
      }
    });
  }

  private async resolveAlerts(householdId: string, type: AlertType, subjectId?: string): Promise<void> {
    await prisma.alert.updateMany({
      where: {
        householdId,
        type,
        subjectId,
        status: {
          in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED]
        }
      },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date()
      }
    });
  }
}

export const monitoringService = new MonitoringService();
