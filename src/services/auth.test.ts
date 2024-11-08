import { describe, it, expect, beforeEach } from 'vitest';
import { login, register } from './auth';
import { db } from '../lib/db';

describe('Authentication Service', () => {
  beforeEach(async () => {
    await db.reset();
  });

  describe('login', () => {
    it('should login with demo account', async () => {
      const user = await login('demo@example.com', 'password123');
      
      expect(user).toBeDefined();
      expect(user.email).toBe('demo@example.com');
      expect(user.name).toBe('مستخدم تجريبي');
      expect(user.credits).toBe(13);
    });

    it('should throw error with invalid credentials', async () => {
      await expect(login('wrong@email.com', 'wrongpass'))
        .rejects
        .toThrow('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const user = await register('Test User', 'test@example.com', 'password123');
      
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.credits).toBe(13);
    });

    it('should throw error for duplicate email', async () => {
      await register('Test User', 'test@example.com', 'password123');
      
      await expect(register('Another User', 'test@example.com', 'password456'))
        .rejects
        .toThrow('البريد الإلكتروني مستخدم بالفعل');
    });
  });
});