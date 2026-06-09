/**
 * Seed opcional para deixar um ambiente local pronto para demo e testes manuais.
 * Ele cria um usuario, uma residencia, um gateway e dispositivos basicos.
 */
import { PrismaClient, PlanTier, HouseholdRole } from '@prisma/client';

import { hashPassword, hashGatewayToken } from '../src/shared/utils/security';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const demoPassword = 'SafeHome@123';
  const demoGatewayToken = 'SAFEHOME-DEMO-GATEWAY-TOKEN';

  const user = await prisma.user.upsert({
    where: { email: 'demo@safehome.local' },
    update: {},
    create: {
      fullName: 'Usuário Demo',
      email: 'demo@safehome.local',
      passwordHash: await hashPassword(demoPassword)
    }
  });

  const household = await prisma.household.upsert({
    where: { id: 'safehome-demo-household' },
    update: {},
    create: {
      id: 'safehome-demo-household',
      name: 'Casa Demo',
      residentName: 'Paciente Demo',
      plan: PlanTier.PREMIUM,
      members: {
        create: {
          userId: user.id,
          role: HouseholdRole.OWNER
        }
      },
      settings: {
        create: {
          inactivityThresholdMinutes: 90,
          sensorCheckIntervalMinutes: 30,
          buttonCheckIntervalMinutes: 10,
          quietHoursEnabled: true,
          sleepModeStart: '22:00',
          sleepModeEnd: '06:00'
        }
      }
    }
  });

  const gateway = await prisma.gateway.upsert({
    where: { serialNumber: 'SAFEHOME-GW-001' },
    update: {},
    create: {
      householdId: household.id,
      name: 'Central Principal',
      serialNumber: 'SAFEHOME-GW-001',
      tokenHash: hashGatewayToken(demoGatewayToken)
    }
  });

  await prisma.sensor.upsert({
    where: {
      gatewayId_externalId: {
        gatewayId: gateway.id,
        externalId: 'pir-sala'
      }
    },
    update: {},
    create: {
      householdId: household.id,
      gatewayId: gateway.id,
      name: 'Sensor Sala',
      externalId: 'pir-sala',
      locationLabel: 'Sala'
    }
  });

  await prisma.helpButton.upsert({
    where: {
      gatewayId_externalId: {
        gatewayId: gateway.id,
        externalId: 'btn-quarto'
      }
    },
    update: {},
    create: {
      householdId: household.id,
      gatewayId: gateway.id,
      name: 'Botão Quarto',
      externalId: 'btn-quarto',
      locationLabel: 'Quarto'
    }
  });

  console.log('Seed concluido com sucesso.');
  console.log(`Login demo: demo@safehome.local / ${demoPassword}`);
  console.log(`Gateway token demo: ${demoGatewayToken}`);
}

main()
  .catch((error) => {
    console.error('Falha ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
