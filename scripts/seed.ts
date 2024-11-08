import { db } from '../src/db';
import { users } from '../src/db/schema';
import { hash } from 'bcryptjs';

async function main() {
  try {
    // Create demo user
    await db.insert(users).values({
      name: 'مستخدم تجريبي',
      email: 'demo@example.com',
      password: await hash('password123', 10),
      avatar: 'م',
      isVerified: true,
      credits: 13,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoNothing();

    // Create admin user
    await db.insert(users).values({
      name: 'مدير النظام',
      email: 'admin@example.com',
      password: await hash('admin123', 10),
      avatar: 'م',
      isVerified: true,
      credits: 999,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoNothing();

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();