import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      name: 'مستخدم تجريبي',
      email: 'demo@example.com',
      password: await hash('password123', 10),
      avatar: 'م',
      isVerified: true,
      credits: 13
    }
  });

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'مدير النظام',
      email: 'admin@example.com',
      password: await hash('admin123', 10),
      avatar: 'م',
      isVerified: true,
      credits: 999,
      isAdmin: true
    }
  });

  console.log({ demoUser, adminUser });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });