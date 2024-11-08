import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate';
import { authenticateToken } from '../middleware/auth';
import { db } from '../db';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate limit for credit operations: 60 requests per minute
const creditLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests, please try again later.' }
});

router.use(authenticateToken);
router.use(creditLimiter);

// Use credit
router.post(
  '/use',
  [
    body('description').notEmpty().trim(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { description } = req.body;
      const userId = req.user.id;

      await db.transaction('rw', [db.users, db.creditTransactions], async () => {
        const user = await db.users.get(userId);
        if (!user) throw new Error('User not found');
        
        if ((user.credits || 0) <= 0) {
          throw new Error('Insufficient credits');
        }

        // Update user credits
        await db.users.update(userId, {
          credits: (user.credits || 0) - 1
        });

        // Record transaction
        await db.creditTransactions.add({
          userId,
          amount: -1,
          type: 'usage',
          description,
          createdAt: new Date()
        });
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Use credit error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Failed to use credit'
      });
    }
  }
);

// Get credit balance
router.get('/balance', async (req, res) => {
  try {
    const user = await db.users.get(req.user.id);
    if (!user) throw new Error('User not found');

    res.json({ credits: user.credits || 0 });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Failed to get credit balance' });
  }
});

// Get credit history
router.get('/history', async (req, res) => {
  try {
    const transactions = await db.creditTransactions
      .where('userId')
      .equals(req.user.id)
      .reverse()
      .sortBy('createdAt');

    res.json({ transactions });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get credit history' });
  }
});

export default router;