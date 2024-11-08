import { db } from './db';
import { hash } from 'bcryptjs';

export async function seedDatabase() {
  try {
    // Check if demo user exists
    const demoUser = await db.users.where('email').equals('demo@example.com').first();
    
    if (!demoUser) {
      // Create demo user
      await db.users.add({
        name: 'مستخدم تجريبي',
        email: 'demo@example.com',
        password: await hash('password123', 10),
        avatar: 'م',
        isVerified: true,
        credits: 13,
        isAdmin: false,
        createdAt: new Date()
      });
    }

    // Check if admin user exists
    const adminUser = await db.users.where('email').equals('admin@example.com').first();

    if (!adminUser) {
      // Create admin user
      await db.users.add({
        name: 'مدير النظام',
        email: 'admin@example.com',
        password: await hash('admin123', 10),
        avatar: 'م',
        isVerified: true,
        credits: 999,
        isAdmin: true,
        createdAt: new Date()
      });
    }

    // Initialize settings if not exists
    const settings = await db.settings.toArray();
    if (settings.length === 0) {
      await db.settings.add({
        basicPackagePrice: 100,
        proPackagePrice: 200,
        basicPackageCredits: 13,
        proPackageCredits: 30,
        maxProjectSize: 50,
        allowedLanguages: ['ar'],
        aiModel: 'gpt-3.5-turbo',
        maxTokens: 2000,
        temperature: 0.7,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}