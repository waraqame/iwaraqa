import { Router } from 'express';
import { body } from 'express-validator';
import { hash, compare } from 'bcryptjs';
import { validateRequest } from '../middleware/validate';
import { db } from '../db';

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    validateRequest
  ],
  async (req, res) => {
    console.log('[AUTH] Login attempt:', { email: req.body.email });
    
    try {
      const { email, password } = req.body;

      // Get user
      console.log('[AUTH] Finding user in database...');
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

      if (!user) {
        console.log('[AUTH] User not found:', email);
        return res.status(401).json({ 
          error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        });
      }

      console.log('[AUTH] User found, verifying password...');
      const isValidPassword = await compare(password, user.password);
      
      if (!isValidPassword) {
        console.log('[AUTH] Invalid password for user:', email);
        return res.status(401).json({ 
          error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        });
      }

      console.log('[AUTH] Password verified, sending response...');
      
      // Return user data
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || user.name[0].toUpperCase(),
          isVerified: Boolean(user.is_verified),
          credits: user.credits
        }
      });

      console.log('[AUTH] Login successful:', { userId: user.id, email: user.email });
    } catch (error) {
      console.error('[AUTH] Login error:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
    }
  }
);

router.post(
  '/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    validateRequest
  ],
  async (req, res) => {
    console.log('[AUTH] Registration attempt:', { 
      email: req.body.email,
      name: req.body.name 
    });

    try {
      const { name, email, password } = req.body;

      // Check if user exists
      console.log('[AUTH] Checking for existing user...');
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      
      if (existingUser) {
        console.log('[AUTH] User already exists:', email);
        return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
      }

      // Hash password
      console.log('[AUTH] Hashing password...');
      const hashedPassword = await hash(password, 10);

      // Create user
      console.log('[AUTH] Creating new user...');
      const result = db.prepare(`
        INSERT INTO users (name, email, password, avatar, is_verified, credits)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        name,
        email,
        hashedPassword,
        name[0].toUpperCase(),
        1,
        13
      );

      console.log('[AUTH] User created successfully:', {
        id: result.lastInsertRowid,
        email: email
      });

      // Return user data
      res.status(201).json({
        user: {
          id: result.lastInsertRowid,
          name,
          email,
          avatar: name[0].toUpperCase(),
          isVerified: true,
          credits: 13
        }
      });
    } catch (error) {
      console.error('[AUTH] Registration error:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحساب' });
    }
  }
);

export default router;