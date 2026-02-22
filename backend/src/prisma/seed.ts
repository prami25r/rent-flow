import 'dotenv/config';
import { PrismaClient, FeeType, PaymentStatus, RiskLevel } from '@prisma/client';

const prisma = new PrismaClient();

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const email = 'landlord@example.com';
  const existing = await prisma.landlord.findUnique({ where: { email } });
  let landlordId: string;
  if (existing) {
    landlordId = existing.id;
  } else {
    const landlord = await prisma.landlord.create({
      data: {
        email,
        name: 'Demo Landlord',
        passwordHash: '$2b$10$/9VwQvG1F7kYg9Q9qF3mze7qJfVv5j2y3E6H8Qh3H8Vv7oCw9Qq2e', // "password123" placeholder
      },
    });
    landlordId = landlord.id;
  }

  await prisma.lateFeeConfig.upsert({
    where: { landlordId },
    create: { landlordId, type: FeeType.FLAT, amount: 50, gracePeriodDays: 3 },
    update: {},
  });

  const firstNames = ['Alex', 'Taylor', 'Jordan', 'Riley', 'Morgan', 'Casey', 'Quinn', 'Avery'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson'];

  const tenants = [];
  for (let i = 0; i < 100; i++) {
    const firstName = randomChoice(firstNames);
    const lastName = randomChoice(lastNames);
    const tenant = await prisma.tenant.create({
      data: {
        landlordId,
        firstName,
        lastName,
        email: `${firstName}.${lastName}.${i}@example.com`.toLowerCase(),
        unit: `Unit ${i + 1}`,
        monthlyRent: 1000 + (i % 10) * 50,
        riskLevel: RiskLevel.SAFE,
      },
    });
    tenants.push(tenant);
  }

  const today = new Date();
  for (const t of tenants) {
    for (let m = -2; m <= 0; m++) {
      const dueDate = new Date(today.getFullYear(), today.getMonth() + m, 1);
      const status = Math.random() < 0.7 ? PaymentStatus.PAID : PaymentStatus.PENDING;
      const paidDate =
        status === PaymentStatus.PAID
          ? new Date(dueDate.getFullYear(), dueDate.getMonth(), 1 + Math.floor(Math.random() * 10))
          : null;
      await prisma.payment.create({
        data: {
          landlordId,
          tenantId: t.id,
          dueDate,
          amountDue: t.monthlyRent,
          amountPaid: paidDate ? t.monthlyRent : 0,
          paidDate: paidDate || undefined,
          status,
          lateFeesTotal: status === PaymentStatus.PAID && paidDate && paidDate > new Date(dueDate.getTime() + 3 * 86400000) ? 50 : 0,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

